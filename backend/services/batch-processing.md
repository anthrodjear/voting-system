# Batch Processing Service

## Overview

This document details the Smart Group-Based Voting batch processing service for handling high concurrency.

---

## 1. Service Architecture

```typescript
// services/batch-processing.service.ts
@Injectable()
export class BatchProcessingService {
  private batchOrchestrator: BatchOrchestrator;
  private votePool: VotePool;
  private idleDetector: IdleDetector;
  private notificationService: NotificationService;

  // Configuration
  private readonly BATCH_SIZE = 1000;
  private readonly IDLE_TIMEOUT_MS = 120000; // 120 seconds
  private readonly VOTE_POOL_FLUSH_INTERVAL = 5000; // 5 seconds

  constructor(
    private readonly config: ConfigService,
    private readonly redis: RedisService
  ) {
    this.initializeBatchSystem();
  }

  private initializeBatchSystem() {
    this.batchOrchestrator = new BatchOrchestrator({
      maxBatchSize: this.BATCH_SIZE,
      maxBatches: 100,
      assignmentStrategy: 'smallest_first'
    });

    this.votePool = new VotePool({
      flushInterval: this.VOTE_POOL_FLUSH_INTERVAL,
      maxPoolSize: 10000
    });

    this.idleDetector = new IdleDetector({
      timeoutMs: this.IDLE_TIMEOUT_MS,
      checkInterval: 10000
    });

    // Start background jobs
    this.startBatchJobs();
  }
}
```

---

## 2. Batch Orchestrator

### 2.1 Batch Creation & Assignment

```typescript
// Create new batch
async createBatch(): Promise<Batch> {
  const batch: Batch = {
    id: `batch_${crypto.randomUUID()}`,
    status: 'waiting',
    voters: new Map<string, BatchVoter>(),
    votes: [],
    createdAt: new Date(),
    maxSize: this.BATCH_SIZE,
    currentSize: 0
  };

  await this.redis.hset(`batch:${batch.id}`, this.serializeBatch(batch));
  return batch;
}

// Assign voter to batch
async assignVoter(voterId: string): Promise<BatchAssignment> {
  // Check if voter already in batch
  const existingBatch = await this.getVoterBatch(voterId);
  if (existingBatch) {
    return this.getAssignment(existingBatch, voterId);
  }

  // Find smallest active batch
  let targetBatch = await this.findSmallestActiveBatch();

  // Create new batch if none available
  if (!targetBatch || targetBatch.currentSize >= targetBatch.maxSize) {
    targetBatch = await this.createBatch();
  }

  // Add voter to batch
  const batchVoter: BatchVoter = {
    voterId,
    joinedAt: new Date(),
    lastHeartbeat: new Date(),
    status: 'active',
    position: targetBatch.currentSize
  };

  targetBatch.voters.set(voterId, batchVoter);
  targetBatch.currentSize++;

  // Update batch status
  if (targetBatch.currentSize >= targetBatch.maxSize) {
    targetBatch.status = 'active';
  }

  await this.saveBatch(targetBatch);

  // Start batch if reached minimum
  if (targetBatch.currentSize >= 100 && targetBatch.status === 'waiting') {
    await this.activateBatch(targetBatch.id);
  }

  return this.getAssignment(targetBatch, voterId);
}

// Find smallest active batch
private async findSmallestActiveBatch(): Promise<Batch | null> {
  const activeBatches = await this.redis.zrangebyscore(
    'batches:active',
    0,
    Date.now(),
    'WITHSCORES',
    'LIMIT',
    0,
    1
  );

  if (!activeBatches.length) return null;

  return await this.getBatch(activeBatches[0]);
}
```

### 2.2 Batch States

```typescript
// Batch status enum
enum BatchStatus {
  WAITING = 'waiting',    // Gathering voters
  ACTIVE = 'active',       // Ready to receive votes
  SUBMITTING = 'submitting', // Submitting to vote pool
  COMPLETED = 'completed', // All votes collected
  FAILED = 'failed'       // Failed, needs retry
}

// Batch state transitions
const batchStateTransitions: Record<BatchStatus, BatchStatus[]> = {
  [BatchStatus.WAITING]: [BatchStatus.ACTIVE, BatchStatus.COMPLETED],
  [BatchStatus.ACTIVE]: [BatchStatus.SUBMITTING, BatchStatus.COMPLETED],
  [BatchStatus.SUBMITTING]: [BatchStatus.COMPLETED, BatchStatus.FAILED],
  [BatchStatus.COMPLETED]: [],
  [BatchStatus.FAILED]: [BatchStatus.WAITING]
};

// Transition batch state
async transitionBatchState(
  batchId: string, 
  newStatus: BatchStatus
): Promise<void> {
  const batch = await this.getBatch(batchId);
  const currentStatus = batch.status;

  if (!batchStateTransitions[currentStatus].includes(newStatus)) {
    throw new InvalidStateTransitionError(
      `Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }

  batch.status = newStatus;
  await this.saveBatch(batch);
}
```

---

## 3. Vote Pool

### 3.1 Aggregating Votes

```typescript
// Add vote to pool
async addToVotePool(batchId: string, vote: EncryptedVote): Promise<void> {
  await this.votePool.add({
    batchId,
    vote,
    receivedAt: new Date()
  });

  // Check if batch is complete
  const batch = await this.getBatch(batchId);
  const votesCollected = await this.votePool.getBatchVotes(batchId);
  
  if (votesCollected >= batch.currentSize) {
    await this.transitionBatchState(batchId, BatchStatus.SUBMITTING);
  }
}

// Flush vote pool to blockchain
async flushVotePool(): Promise<void> {
  const votes = await this.votePool.getAll();
  
  if (votes.length === 0) return;

  // Aggregate votes
  const aggregatedVotes = this.aggregateVotes(votes);

  // Submit to blockchain
  try {
    await this.blockchainService.submitVotes(aggregatedVotes);
    
    // Clear pool on success
    await this.votePool.clear();
    
    // Mark batches as completed
    const batchIds = [...new Set(votes.map(v => v.batchId))];
    for (const batchId of batchIds) {
      await this.transitionBatchState(batchId, BatchStatus.COMPLETED);
    }
  } catch (error) {
    // Handle failure - votes stay in pool for retry
    await this.votePool.markFailed(votes);
    throw error;
  }
}

// Aggregate votes for efficient blockchain submission
private aggregateVotes(votes: PooledVote[]): AggregatedVotes {
  const byBatch: Record<string, PooledVote[]> = {};
  
  for (const vote of votes) {
    if (!byBatch[vote.batchId]) {
      byBatch[vote.batchId] = [];
    }
    byBatch[vote.batchId].push(vote);
  }

  return {
    votes: Object.values(byBatch).flat(),
    totalCount: votes.length,
    batchCount: Object.keys(byBatch).length,
    aggregatedAt: new Date()
  };
}
```

---

## 4. Idle Detection

### 4.1 Monitoring Voter Activity

```typescript
// Start idle detection for voter
async startIdleDetection(voterId: string): Promise<void> {
  this.idleDetector.watch(voterId, {
    onTimeout: async () => {
      await this.handleIdleTimeout(voterId);
    },
    onHeartbeat: async () => {
      await this.refreshVoterPosition(voterId);
    }
  });
}

// Handle voter becoming idle
private async handleIdleTimeout(voterId: string): Promise<void> {
  const batch = await this.getVoterBatch(voterId);
  if (!batch) return;

  // Remove from current batch
  const voter = batch.voters.get(voterId);
  voter.status = 'idle';
  batch.voters.delete(voterId);
  batch.currentSize--;

  // Update batch
  await this.saveBatch(batch);

  // Notify voter
  await this.notificationService.send({
    type: 'batch_timeout',
    voterId,
    message: 'You have been moved to the waiting queue due to inactivity.',
    canRejoin: true
  });

  // Update voter in Redis
  await this.redis.zadd(
    'batches:pending',
    Date.now() + 30000, // Can rejoin after 30 seconds
    voterId
  );
}

// Handle heartbeat from voter
async processHeartbeat(voterId: string): Promise<HeartbeatResult> {
  const batch = await this.getVoterBatch(voterId);
  if (!batch) {
    return { success: false, reason: 'not_in_batch' };
  }

  const voter = batch.voters.get(voterId);
  if (!voter) {
    return { success: false, reason: 'voter_not_found' };
  }

  // Update heartbeat
  voter.lastHeartbeat = new Date();
  voter.status = 'active';
  await this.saveBatch(batch);

  // Reset idle timer
  this.idleDetector.resetTimer(voterId);

  return { success: true, positionSecured: true };
}
```

---

## 5. Batch Processing Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BATCH PROCESSING FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. VOTER JOINS                                                    │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Voter   │───>│  Find     │───>│  Assign   │                   │
│   │  Request │    │  Smallest │    │  to Batch │                   │
│   └──────────┘    │  Batch    │    └───────────┘                   │
│                   └───────────┘         │                           │
│                                          ▼                           │
│   2. BATCH MANAGEMENT                                     │         │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐         │         │
│   │ Waiting │<───│  Activate │───>│ Active   │─────────┘         │
│   │ (<100)  │    │  (≥100)   │    │ (100-1000)                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                              │                       │
│                                              ▼                       │
│   3. VOTING                                         │               │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Voter   │───>│ Encrypt   │───>│  Vote    │                   │
│   │  Submits │    │  Vote    │    │  Pool    │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                              │                       │
│                                              ▼                       │
│   4. AGGREGATION                                    │               │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Pool    │<───│  Flush    │───>│ Submit to │                   │
│   │  (5s)   │    │  (1000)  │    │ Blockchain│                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Redis Data Structures

### 6.1 Batch Storage

```typescript
// Batch key structure
const BATCH_KEYS = {
  // Hash: batch:{id} -> serialized batch data
  data: (batchId: string) => `batch:${batchId}`,
  
  // Set: batches:active -> batch IDs with scores (expiry time)
  active: 'batches:active',
  
  // Sorted set: batches:pending -> voter IDs with scores (rejoin time)
  pending: 'batches:pending',
  
  // Hash: voter:batch:{voterId} -> batch assignment
  voterAssignment: (voterId: string) => `voter:batch:${voterId}`,
  
  // Vote pool: queue:votes -> list of encrypted votes
  votePool: 'queue:votes'
};

// Store batch in Redis
async saveBatch(batch: Batch): Promise<void> {
  const pipeline = this.redis.pipeline();
  
  pipeline.hset(
    BATCH_KEYS.data(batch.id),
    this.serializeBatch(batch)
  );
  
  // Update active set
  if (batch.status === 'active' || batch.status === 'waiting') {
    pipeline.zadd(
      BATCH_KEYS.active,
      Date.now() + 300000, // 5 min expiry
      batch.id
    );
  }
  
  await pipeline.exec();
}
```

---

## 7. Background Jobs

### 7.1 Job Scheduler

```typescript
// Start background jobs
private startBatchJobs(): void {
  // Flush vote pool every 5 seconds
  setInterval(
    () => this.flushVotePool(),
    this.VOTE_POOL_FLUSH_INTERVAL
  );

  // Clean up old batches every minute
  setInterval(
    () => this.cleanupCompletedBatches(),
    60000
  );

  // Check idle voters every 10 seconds
  setInterval(
    () => this.checkIdleVoters(),
    10000
  );

  // Activate waiting batches every 30 seconds
  setInterval(
    () => this.activateWaitingBatches(),
    30000
  );
}

// Cleanup completed batches
private async cleanupCompletedBatches(): Promise<void> {
  const completedBatches = await this.redis.zrangebyscore(
    'batches:completed',
    0,
    Date.now() - 3600000 // 1 hour ago
  );

  for (const batchId of completedBatches) {
    await this.archiveBatch(batchId);
    await this.redis.zrem('batches:completed', batchId);
  }
}
```

---

## 8. Performance Metrics

```typescript
// Get batch system metrics
async getMetrics(): Promise<BatchMetrics> {
  const [activeBatches, pendingVoters, poolSize] = await Promise.all([
    this.redis.zcard('batches:active'),
    this.redis.zcard('batches:pending'),
    this.redis.llen('queue:votes')
  ]);

  return {
    activeBatches,
    pendingVoters,
    votePoolSize: poolSize,
    avgBatchSize: await this.calculateAvgBatchSize(),
    throughputPerSecond: await this.calculateThroughput(),
    idleVotersLastHour: await this.getIdleCount()
  };
}
```

---

## 9. API Endpoints

```typescript
@Controller('batches')
export class BatchController {
  
  @Post('join')
  async joinBatch(@User() user: AuthUser): Promise<BatchAssignmentResponse> {
    const assignment = await this.batchService.assignVoter(user.voterId);
    
    // Start idle detection
    await this.batchService.startIdleDetection(user.voterId);
    
    return assignment;
  }

  @Post(':id/vote')
  async submitVote(
    @Param('id') batchId: string,
    @Body() dto: SubmitVoteDto
  ): Promise<SubmitResponse> {
    return await this.batchService.submitVote(batchId, dto.vote);
  }

  @Get(':id/status')
  async getStatus(@Param('id') batchId: string): Promise<BatchStatusResponse> {
    return await this.batchService.getBatchStatus(batchId);
  }

  @Post('heartbeat')
  async heartbeat(@User() user: AuthUser): Promise<HeartbeatResponse> {
    return await this.batchService.processHeartbeat(user.voterId);
  }
}
```
