# Scalability Architecture

## Overview

This document outlines the comprehensive scalability architecture for the Blockchain Voting System, designed to support 20 million+ voters with a throughput of 5,000 votes per second. The architecture addresses database scaling, application-level horizontal scaling, queue management, blockchain optimization, and capacity planning.

---

## 1. System Capacity

### 1.1 Performance Targets

| Metric | Target | Burst Capacity |
|--------|--------|----------------|
| Total registered voters | 20,000,000+ | 50,000,000 |
| Votes per second (sustained) | 5,000 | 7,500 |
| Peak votes per second | 10,000 | 15,000 |
| API response time (p95) | < 500ms | < 300ms |
| Vote submission latency | < 2s | < 1s |
| Vote verification latency | < 3s | < 2s |
| System availability | 99.9% | 99.99% |

### 1.2 Throughput Calculation

```
Base Throughput:
- 5,000 votes/sec × 60 sec = 300,000 votes/minute
- 5,000 votes/sec × 3,600 sec = 18,000,000 votes/hour

Election Completion Time:
- 20,000,000 votes ÷ 300,000 votes/min = 66.7 minutes
- With 10,000 votes/sec peak: 20M ÷ 600,000 = 33.3 minutes

Batch Processing:
- 1,000 voters per batch × 5 batches/sec = 5,000 votes/sec
- 1,000 voters per batch × 10 batches/sec (burst) = 10,000 votes/sec
```

### 1.3 Load Profiles

| Phase | Duration | Avg TPS | Peak TPS | Notes |
|-------|----------|---------|----------|-------|
| Pre-election registration | 7 days | 100 | 500 | Voter verification peak |
| Election startup | 1 hour | 2,000 | 5,000 | Initial vote surge |
| Active voting | 8 hours | 5,000 | 10,000 | Peak voting window |
| Election close | 30 min | 8,000 | 15,000 | Final batch submission |
| Tallying | 1 hour | 1,000 | 2,000 | Result aggregation |

---

## 2. Database Scaling

### 2.1 PostgreSQL Partitioning Strategy

#### Voter Registry Partitioning

```sql
-- Range partition by voter_id (geographic distribution)
CREATE TABLE voters (
    voter_id BIGINT NOT NULL,
    election_id BIGINT NOT NULL,
    jurisdiction_id INT,
    verification_hash VARCHAR(64),
    status VARCHAR(20),
    created_at TIMESTAMP
) PARTITION BY RANGE (voter_id);

-- Partition ranges (100M voters per partition)
CREATE TABLE voters_p0 PARTITION OF voters
    FOR VALUES FROM (0) TO (100000000);
CREATE TABLE voters_p1 PARTITION OF voters
    FOR VALUES FROM (100000000) TO (200000000);
```

#### Vote Transaction Partitioning

```sql
-- Hash partition by election_id for even distribution
CREATE TABLE votes (
    vote_id BIGSERIAL,
    election_id BIGINT NOT NULL,
    voter_id BIGINT NOT NULL,
    candidate_id BIGINT NOT NULL,
    encrypted_vote BYTEA,
    blockchain_tx_hash VARCHAR(66),
    timestamp TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY HASH (election_id);

-- 16 partitions for election votes
CREATE TABLE votes_p00 PARTITION OF votes
    FOR VALUES WITH (MODULUS 16, REMAINDER 0);
-- ... (partitions p01-p15)
```

#### Indexing Strategy

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_voters_election_status ON voters(election_id, status);
CREATE INDEX idx_votes_election_timestamp ON votes(election_id, timestamp DESC);
CREATE INDEX idx_votes_blockchain ON votes(blockchain_tx_hash) WHERE blockchain_tx_hash IS NOT NULL;

-- Partial indexes for active data
CREATE INDEX idx_votes_pending ON votes(election_id, timestamp DESC)
    WHERE blockchain_tx_hash IS NULL;
```

### 2.2 Redis Caching Architecture

#### Cache Layers

| Layer | TTL | Invalidation | Size per Instance |
|-------|-----|--------------|-------------------|
| Voter verification | 1 hour | On status change | ~2MB (500K keys) |
| Election metadata | 24 hours | On update | ~100KB |
| Vote receipts | 30 days | Never (append-only) | ~500MB |
| Rate limiting | 1 minute | Automatic | ~10MB |
| Session data | 30 minutes | On activity | ~50MB |

#### Cache Implementation

```python
# Redis cache configuration
CACHE_CONFIG = {
    "voter_verification": {
        "ttl": 3600,
        "max_memory": "2gb",
        "eviction": "volatile-lru",
        "key_pattern": "voter:verify:{election_id}:{voter_id}"
    },
    "election_metadata": {
        "ttl": 86400,
        "max_memory": "100mb",
        "eviction": "volatile-lru",
        "key_pattern": "election:meta:{election_id}"
    },
    "rate_limit": {
        "ttl": 60,
        "max_memory": "10gb",
        "eviction": "noeviction",
        "key_pattern": "ratelimit:{client_id}:{endpoint}"
    }
}
```

#### Redis Cluster Configuration

```
┌─────────────────────────────────────────────────────────────┐
│                    Redis Cluster Topology                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│   │ Master  │────│ Master  │────│ Master  │   Shard 0    │
│   │  P0     │    │  P1     │    │  P2     │   (3 nodes)   │
│   └────┬────┘    └────┬────┘    └────┬────┘              │
│        │              │              │                     │
│   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐              │
│   │ Replica │    │ Replica │    │ Replica │               │
│   └─────────┘    └─────────┘    └─────────┘              │
│                                                             │
│   ┌─────────┐    ┌─────────┐    ┌─────────┐              │
│   │ Master  │────│ Master  │────│ Master  │   Shard 1    │
│   │  P3     │    │  P4     │    │  P5     │   (3 nodes)   │
│   └────┬────┘    └────┬────┘    └────┬────┘              │
│        │              │              │                     │
│   ┌────┴────┐    ┌────┴────┐    ┌────┴────┐              │
│   │ Replica │    │ Replica │    │ Replica │               │
│   └─────────┘    └─────────┘    └─────────┘              │
│                                                             │
│   Total: 6 shards × 3 nodes = 18 Redis instances          │
│   Capacity: ~100M keys, 500GB memory                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Connection Pooling

#### PgBouncer Configuration

```yaml
# pgbouncer.ini
[databases]
voting_prod = host=postgres-primary:5432 dbname=voting

[pgbouncer]
pool_mode = transaction
min_pool_size = 20
default_pool_size = 100
max_client_conn = 1000
max_db_connections = 200
max_user_connections = 100
server_lifetime = 3600
server_idle_timeout = 600

[pgbouncer]
admin_users = admin
stats_users = stats_reader
```

#### Connection Pool Metrics

| Metric | Warning Threshold | Critical Threshold |
|--------|-------------------|-------------------|
| Active connections | > 80% pool | > 95% pool |
| Waiting clients | > 10 | > 50 |
| Connection acquire time | > 100ms | > 500ms |
| Idle connections | < 20% pool | < 10% pool |

---

## 3. Application Scaling

### 3.1 Horizontal Pod Autoscaling

#### Kubernetes HPA Configuration

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: vote-api-hpa
  namespace: voting-system
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: vote-api
  minReplicas: 10
  maxReplicas: 200
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
    - type: Pods
      pods:
        metric:
          name: http_requests_per_second
        target:
          type: AverageValue
          averageValue: "1000"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
        - type: Percent
          value: 10
          periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 0
      policies:
        - type: Percent
          value: 100
          periodSeconds: 15
        - type: Pods
          value: 10
          periodSeconds: 15
      selectPolicy: Max
```

#### Pod Resource Requests

| Component | CPU Request | CPU Limit | Memory Request | Memory Limit |
|-----------|-------------|------------|-----------------|---------------|
| Vote API | 500m | 2000m | 512Mi | 2Gi |
| Verification Service | 1000m | 4000m | 1Gi | 4Gi |
| Blockchain Writer | 2000m | 8000m | 2Gi | 8Gi |
| Result Aggregator | 1000m | 4000m | 1Gi | 4Gi |

### 3.2 Load Balancing

#### Ingress Configuration

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: voting-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rate-limit: "1000"
    nginx.ingress.kubernetes.io/rate-limit-window: "1s"
    nginx.ingress.kubernetes.io/proxy-body-size: "10m"
    nginx.ingress.kubernetes.io/proxy-read-timeout: "30"
    nginx.ingress.kubernetes.io/proxy-send-timeout: "30"
spec:
  rules:
    - host: vote.example.com
      http:
        paths:
          - path: /api/votes
            pathType: Prefix
            backend:
              service:
                name: vote-api
                port:
                  number: 80
          - path: /api/verify
            pathType: Prefix
            backend:
              service:
                name: verification-api
                port:
                  number: 80
  tls:
    - hosts:
        - vote.example.com
      secretName: voting-tls
```

#### Load Balancer Topology

```
                            ┌──────────────────────────────────────┐
                            │         Cloud Load Balancer          │
                            │    (Global external IP, anycast)      │
                            └──────────────┬───────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
            ┌───────▼───────┐      ┌───────▼───────┐      ┌───────▼───────┐
            │  Ingress-1   │      │  Ingress-2   │      │  Ingress-3   │
            │  (us-east)   │      │  (us-west)   │      │  (eu-west)   │
            └───────┬───────┘      └───────┬───────┘      └───────┬───────┘
                    │                      │                      │
                    └──────────────────────┼──────────────────────┘
                                           │
                            ┌──────────────▼───────────────────────┐
                            │         Kubernetes Cluster           │
                            │  ┌────────────────────────────────┐  │
                            │  │      Service (LoadBalancer)    │  │
                            │  └────────────────────────────────┘  │
                            │              │                       │
                            │    ┌─────────┼─────────┐             │
                            │    │         │         │             │
                            │  ┌─▼─┐   ┌─▼─┐   ┌─▼─┐              │
                            │  │Pod│   │Pod│   │Pod│   ...       │
                            │  │ 1 │   │ 2 │   │ 3 │              │
                            │  └───┘   └───┘   └───┘              │
                            └──────────────────────────────────────┘
```

---

## 4. Queue Management

### 4.1 RabbitMQ Clustering

#### Cluster Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    RabbitMQ Cluster (7 nodes)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────┐       ┌─────────┐       ┌─────────┐                  │
│   │ disc@rabbit-1   │ disc@rabbit-2   │ disc@rabbit-3   │  Disk Nodes │
│   │ (master)  │◄────┤ (master)  │◄────┌ (master)  │  (quorum)    │
│   └─────────┘       └─────────┘       └─────────┘                  │
│        │                  │                  │                      │
│        └──────────────────┼──────────────────┘                      │
│                           │                                          │
│   ┌─────────┐       ┌─────────┐       ┌─────────┐                  │
│   │ ram@rabbit-4   │ ram@rabbit-5   │ ram@rabbit-6   │  RAM Nodes   │
│   │ (master)  │────►│ (master)  │────►│ (master)  │  (consumer)   │
│   └─────────┘       └─────────┘       └─────────┘                  │
│                                                                      │
│   ┌─────────┐                                                     │
│   │ ram@rabbit-7   │  RAM Node (stats/management)               │
│   └─────────┘                                                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘

Queue Definitions:
- vote_submissions: 5,000 msg/sec capacity
- vote_verification: 10,000 msg/sec capacity  
- blockchain_batch: 1,000 msg/sec capacity
- result_aggregation: 500 msg/sec capacity
```

#### Queue Configuration

```yaml
# Kubernetes RabbitMQ Operator
apiVersion: rabbitmq.com/v1beta1
kind: RabbitmqCluster
metadata:
  name: voting-rabbitmq
spec:
  replicas: 7
  image: rabbitmq:3.12-management
  resources:
    requests:
      cpu: 2000m
      memory: 4Gi
    limits:
      cpu: 4000m
      memory: 8Gi
  persistence:
    storageClassName: ssd
    storage: 100Gi
  envConfig: |
    RABBITMQ_DEFAULT_USER=admin
    RABBITMQ_DEFAULT_PASS=${RABBITMQ_PASSWORD}
    RABBITMQ_DEFAULT_VHOST=/
  defaultQueueLeaderLocator: min-leaders

# Queue definitions
---
apiVersion: rabbitmq.com/v1beta1
kind: Queue
metadata:
  name: vote-submissions
spec:
  name: vote_submissions
  type: quorum
  durable: true
  haPolicy: exactly
  haParams: 3
  messageTtl: 300000
  maxLength: 1000000
```

### 4.2 Message Batching

#### Batch Processing Strategy

```python
# Vote batch aggregation
class VoteBatchProcessor:
    def __init__(self):
        self.batch_size = 1000
        self.batch_timeout = 100  # milliseconds
        self.max_queue_depth = 10000
    
    async def aggregate_votes(self, votes: List[Vote]) -> VoteBatch:
        """
        Aggregate individual votes into batches for blockchain submission.
        
        Batch Composition:
        - 1,000 voters per batch
        - Combined Merkle root of all votes
        - Aggregate signature for verification
        - Timestamp range for temporal ordering
        """
        batch = VoteBatch(
            batch_id=self.generate_batch_id(),
            votes=votes,
            merkle_root=self.compute_merkle_root(votes),
            voter_count=len(votes),
            timestamp_start=votes[0].timestamp,
            timestamp_end=votes[-1].timestamp,
            total_weight=sum(v.weight for v in votes)
        )
        
        return batch
    
    async def submit_batch(self, batch: VoteBatch) -> BatchReceipt:
        """
        Submit aggregated batch to blockchain.
        
        Returns:
            BatchReceipt with on-chain transaction hash
        """
        tx_hash = await self.blockchain_client.submit_batch(
            merkle_root=batch.merkle_root,
            voter_count=batch.voter_count,
            timestamp_range=(batch.timestamp_start, batch.timestamp_end)
        )
        
        return BatchReceipt(
            batch_id=batch.batch_id,
            tx_hash=tx_hash,
            block_number=await self.blockchain_client.get_block_number(),
            confirmation_time=await self.blockchain_client.get_confirmation_time()
        )
```

#### Batch Flow

```
Vote Submission Flow:
                          
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│  Voter  │───►│  Vote   │───►│ Batch   │───►│Blockchain│
│ Client  │    │  API    │    │Aggregator│   │ Network │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                                 │
                                 ▼
                        ┌───────────────┐
                        │  Batch Queue  │
                        │ (RabbitMQ)    │
                        └───────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
              ▼                  ▼                  ▼
        ┌──────────┐       ┌──────────┐       ┌──────────┐
        │ Batch #1 │       │ Batch #2 │       │ Batch #3 │
        │ 1,000    │       │ 1,000    │       │ 1,000    │
        │ voters   │       │ voters   │       │ voters   │
        └──────────┘       └──────────┘       └──────────┘
```

---

## 5. Blockchain Scaling

### 5.1 Batch Aggregation

#### Off-Chain Aggregation Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                  Hybrid On-Chain / Off-Chain Architecture           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  OFF-CHAIN (High Throughput)          ON-CHAIN (Immutable Record)  │
│  ═══════════════════════════          ═══════════════════════════    │
│                                                                      │
│  ┌─────────────┐                      ┌─────────────────────┐     │
│  │ Vote        │   Merkle Root        │ Election Contract   │     │
│  │ Aggregation │ ──────────────────►  │                     │     │
│  │ Service     │   (1 per batch)      │ - Merkle Root       │     │
│  └─────────────┘                      │ - Vote Count        │     │
│       │                               │ - Election State    │     │
│       │ Batch Data                     └─────────────────────┘     │
│       │ (local DB)                             │                    │
│       ▼                                        │                   │
│  ┌─────────────┐                                │                   │
│  │ Local Store │                                │                   │
│  │ (PostgreSQL)│                                │                   │
│  │ - Vote data │                                │                   │
│  │ - Receipts │                                │                   │
│  └─────────────┘                                │                   │
│                                                  │                   │
│  ┌─────────────┐      Batched TX     ┌───────────▼───────────┐     │
│  │ Blockchain  │ ──────────────────►│  Merkle Tree Root     │     │
│  │ Writer      │   (1 tx / 1000 votes)│  (on-chain)        │     │
│  └─────────────┘                      └─────────────────────┘     │
│                                                                      │
│  Scaling: 1,000:1 ratio (1 blockchain transaction per 1,000 votes)│
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Smart Contract Batch Processing

```solidity
// VoteAggregation.sol
contract VoteAggregation {
    // Batch structure for off-chain verification
    struct VoteBatch {
        bytes32 merkleRoot;
        uint256 voterCount;
        uint256 timestampStart;
        uint256 timestampEnd;
        bytes aggregateSignature;
        bool confirmed;
    }
    
    // Store batch submissions
    mapping(bytes32 => VoteBatch) public batches;
    
    // Election vote counts
    mapping(uint256 => uint256) public voteCounts;
    
    // Submit aggregated batch (called once per 1,000 votes)
    function submitBatch(
        bytes32 _merkleRoot,
        uint256 _voterCount,
        uint256 _timestampStart,
        uint256 _timestampEnd,
        bytes calldata _aggregateSignature
    ) external onlyAuthorized {
        bytes32 batchId = keccak256(abi.encodePacked(
            _merkleRoot,
            _timestampStart,
            _timestampEnd
        ));
        
        batches[batchId] = VoteBatch({
            merkleRoot: _merkleRoot,
            voterCount: _voterCount,
            timestampStart: _timestampStart,
            timestampEnd: _timestampEnd,
            aggregateSignature: _aggregateSignature,
            confirmed: true
        });
        
        emit BatchSubmitted(batchId, _merkleRoot, _voterCount);
    }
}
```

### 5.2 Off-Chain Processing

#### Verification Workflow

```python
class OffChainVerificationService:
    """
    Off-chain vote verification for high throughput.
    On-chain verification only for final tallying.
    """
    
    async def verify_vote_off_chain(self, vote: Vote) -> VerificationResult:
        """
        Verify vote off-chain for immediate feedback.
        
        Checks:
        - Voter eligibility
        - Ballot validity
        - Signature verification
        - No double-voting
        """
        # Check voter eligibility
        voter_status = await self.check_voter_status(
            vote.election_id, 
            vote.voter_id
        )
        
        if not voter_status.eligible:
            return VerificationResult(
                valid=False,
                reason=f"Voter not eligible: {voter_status.status}"
            )
        
        # Verify cryptographic signature
        signature_valid = self.verify_signature(
            vote.encrypted_vote,
            vote.signature,
            vote.voter_public_key
        )
        
        if not signature_valid:
            return VerificationResult(
                valid=False,
                reason="Invalid signature"
            )
        
        # Check for double-voting
        has_voted = await self.check_double_voting(
            vote.election_id,
            vote.voter_id
        )
        
        if has_voted:
            return VerificationResult(
                valid=False,
                reason="Voter has already cast a vote"
            )
        
        return VerificationResult(
            valid=True,
            receipt_id=self.generate_receipt(vote)
        )
    
    async def submit_to_blockchain(self, batch: VoteBatch) -> str:
        """
        Submit batch to blockchain for immutable record.
        Called asynchronously after off-chain verification.
        """
        tx_hash = await self.blockchain_client.submit_batch(
            merkle_root=batch.merkle_root,
            voter_count=batch.voter_count
        )
        
        return tx_hash
```

---

## 6. Smart Group-Based Voting

### 6.1 Dynamic Batch Orchestration

#### Batch Scheduler Architecture

```python
class DynamicBatchOrchestrator:
    """
    Dynamically orchestrates vote batches based on:
    - Real-time throughput
    - Voter geographic distribution
    - Network latency
    - Blockchain confirmation times
    """
    
    def __init__(self):
        self.target_batch_size = 1000
        self.min_batch_size = 500
        self.max_batch_size = 2000
        self.batch_timeout_ms = 500
        self.dynamic_sizing_enabled = True
    
    async def get_optimal_batch_size(self) -> int:
        """
        Calculate optimal batch size based on current system load.
        """
        current_throughput = await self.metrics.get_votes_per_second()
        queue_depth = await self.queue.get_depth()
        network_latency = await self.blockchain.get_avg_latency()
        
        # Dynamic sizing algorithm
        if network_latency < 2000:  # Fast network
            optimal_size = 2000
        elif network_latency < 5000:  # Normal network
            optimal_size = 1000
        else:  # Slow network
            optimal_size = 500
        
        # Adjust based on queue depth
        if queue_depth > 50000:
            optimal_size = min(optimal_size + 500, self.max_batch_size)
        elif queue_depth < 10000:
            optimal_size = max(optimal_size - 200, self.min_batch_size)
        
        return optimal_size
    
    async def orchestrate_batch(self, votes: List[Vote]) -> VoteBatch:
        """
        Create optimized batch from pending votes.
        """
        batch_size = await self.get_optimal_batch_size()
        
        # Group by geographic region for network optimization
        votes_by_region = self.group_by_region(votes)
        
        # Create batches respecting regional distribution
        batches = []
        for region, region_votes in votes_by_region.items():
            while len(region_votes) >= self.min_batch_size:
                batch_votes = region_votes[:batch_size]
                batch = await self.create_batch(batch_votes, region)
                batches.append(batch)
                region_votes = region_votes[batch_size:]
        
        # Merge remaining votes
        remaining = [v for votes in votes_by_region.values() for v in votes]
        if remaining and len(batches) > 0:
            # Add to smallest batch if within size limits
            smallest_batch = min(batches, key=lambda b: len(b.votes))
            smallest_batch.votes.extend(remaining)
        
        return batches
    
    def group_by_region(self, votes: List[Vote]) -> Dict[str, List[Vote]]:
        """
        Group votes by geographic region for network optimization.
        """
        regions = defaultdict(list)
        for vote in votes:
            region = vote.jurisdiction_id // 1000  # Simplified region mapping
            regions[f"region_{region}"].append(vote)
        return regions
```

### 6.2 Voter Distribution

#### Batch Distribution by Region

| Region | Est. Voters | Target Batches/sec | Batch Size | Priority |
|--------|-------------|-------------------|------------|----------|
| North America | 8,000,000 | 2.0 | 1,000 | High |
| Europe | 6,000,000 | 1.5 | 1,000 | High |
| Asia Pacific | 4,000,000 | 1.0 | 1,000 | Medium |
| Latin America | 1,500,000 | 0.4 | 750 | Medium |
| Africa | 500,000 | 0.1 | 500 | Low |

#### Global Batch Coordination

```
┌─────────────────────────────────────────────────────────────────────┐
│                   Global Batch Coordination                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                    ┌─────────────────────┐                         │
│                    │  Batch Coordinator  │                         │
│                    │  (Leader Election)  │                         │
│                    └──────────┬────────────┘                         │
│                               │                                      │
│         ┌─────────────────────┼─────────────────────┐              │
│         │                     │                     │              │
│  ┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐        │
│  │   NA Batch  │      │   EU Batch  │      │   APAC Batch│        │
│  │   Service  │      │   Service   │      │   Service   │        │
│  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘        │
│         │                    │                    │                │
│         ▼                    ▼                    ▼                │
│    ┌─────────┐          ┌─────────┐          ┌─────────┐          │
│    │ Vote   │          │ Vote    │          │ Vote    │          │
│    │ Queue  │          │ Queue   │          │ Queue   │          │
│    │ (10k)  │          │ (7.5k)  │          │ (5k)    │          │
│    └────┬────┘          └────┬────┘          └────┬────┘          │
│         │                    │                    │                │
│         └────────────────────┼────────────────────┘              │
│                                │                                    │
│                                ▼                                    │
│                    ┌─────────────────────┐                         │
│                    │ Blockchain Gateway  │                         │
│                    │ (Rate Limiter)      │                         │
│                    └──────────┬──────────┘                         │
│                               │                                    │
│                               ▼                                    │
│                    ┌─────────────────────┐                         │
│                    │  Blockchain Network │                         │
│                    │  (Ethereum/Polygon) │                         │
│                    └─────────────────────┘                         │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Performance Optimization

### 7.1 Caching Strategies

#### Multi-Layer Cache Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Multi-Layer Caching Strategy                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Request ──► CDN (Edge) ──► API Gateway ──► Application ──► DB      │
│                     │             │              │              │   │
│                     ▼             ▼              ▼              ▼   │
│               ┌─────────┐   ┌─────────┐    ┌─────────┐     ┌─────┐│
│               │Static   │   │Rate     │    │Redis    │     │Query││
│               │Assets   │   │Limit    │    │Cache    │     │Cache││
│               │(1 day)  │   │(1 min)  │    │(1 hour) │     │     ││
│               └─────────┘   └─────────┘    └─────────┘     └─────┘│
│                                                                      │
│  Cache Hit Rates:                                                   │
│  - CDN: 95% (static assets)                                         │
│  - API Gateway: 80% (rate limit tokens)                             │
│  - Redis: 90% (voter verification)                                  │
│  - Query Cache: 85% (frequent queries)                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

#### Cache Invalidation Strategy

```python
class CacheInvalidationService:
    """
    Handles cache invalidation across all layers.
    """
    
    async def invalidate_voter_cache(self, election_id: int, voter_id: int):
        """
        Invalidate voter verification cache.
        
        Uses pub/sub for distributed invalidation.
        """
        # Local Redis
        await self.redis.delete(f"voter:verify:{election_id}:{voter_id}")
        
        # Notify other instances via pub/sub
        await self.redis.publish(
            "cache:invalidate",
            json.dumps({
                "pattern": f"voter:verify:{election_id}:{voter_id}",
                "reason": "status_change"
            })
        )
    
    async def handle_invalidation_message(self, message: dict):
        """
        Handle incoming invalidation messages from other instances.
        """
        pattern = message["pattern"]
        await self.redis.delete(pattern)
        self.logger.info(f"Cache invalidated: {pattern}")
```

### 7.2 Query Optimization

#### Query Patterns and Optimizations

| Query Type | Optimization Strategy | Expected Latency |
|------------|----------------------|------------------|
| Voter verification | Redis cache + indexed lookup | < 10ms |
| Vote submission | Write-ahead cache + async DB write | < 50ms |
| Vote count by candidate | Materialized view + Redis | < 100ms |
| Voter history | Paginated query + cursor-based | < 200ms |
| Election results | Pre-computed aggregates | < 500ms |

#### Database Query Optimizations

```sql
-- Materialized view for election results
CREATE MATERIALIZED VIEW election_results AS
SELECT 
    election_id,
    candidate_id,
    COUNT(*) as vote_count,
    COUNT(DISTINCT voter_id) as unique_voters
FROM votes
WHERE blockchain_tx_hash IS NOT NULL
GROUP BY election_id, candidate_id;

-- Refresh concurrently for zero downtime
CREATE UNIQUE INDEX idx_election_results_pk 
    ON election_results(election_id, candidate_id);

-- Scheduled refresh
-- SELECT refresh_all_materialized_views(); 
-- Run every 5 minutes during active voting

-- Partition pruning query
EXPLAIN (ANALYZE) SELECT * FROM votes 
    WHERE election_id = 12345 
    AND timestamp BETWEEN '2024-01-01' AND '2024-01-02';

-- Use index scan on partition, not sequential scan
-- Index: idx_votes_election_timestamp
```

#### Connection Pool Optimization

```python
# SQLAlchemy engine configuration for high throughput
engine = create_async_engine(
    "postgresql+asyncpg://user:pass@host/voting",
    pool_size=100,
    max_overflow=50,
    pool_timeout=30,
    pool_recycle=3600,
    pool_pre_ping=True,  # Verify connections
    echo=False,
    
    # Performance optimizations
    connect_args={
        "server_settings": {
            "application_name": "vote_api",
            "timezone": "UTC"
        },
        "statement_cache_size": 500
    }
)

# Use prepared statements for frequently executed queries
async with engine.connect() as conn:
    await conn.execution_options(
        prepared_statement_cache_size=500
    )
```

---

## 8. Capacity Planning

### 8.1 Resource Estimates

#### Infrastructure Requirements

| Component | Baseline (10M voters) | Scaled (20M voters) | Peak (50M voters) |
|-----------|---------------------|--------------------|-------------------|
| **API Pods** | | | |
| Replicas | 20 | 50 | 150 |
| CPU | 40 cores | 100 cores | 300 cores |
| Memory | 80 GB | 200 GB | 600 GB |
| **Database** | | | |
| PostgreSQL | 3 nodes (16c/64GB) | 5 nodes (32c/128GB) | 7 nodes (64c/256GB) |
| Storage | 2 TB SSD | 5 TB SSD | 15 TB SSD |
| **Cache** | | | |
| Redis Cluster | 6 shards | 12 shards | 24 shards |
| Memory | 96 GB | 192 GB | 384 GB |
| **Queue** | | | |
| RabbitMQ | 3 nodes | 5 nodes | 7 nodes |
| Message capacity | 100K | 500K | 1M |
| **Blockchain** | | | |
| Gateway pods | 5 | 10 | 25 |
| Transaction throughput | 5 TPS | 10 TPS | 25 TPS |

### 8.2 Growth Projections

#### 5-Year Capacity Plan

```
Year 1 (Launch):
├── Voters: 20,000,000
├── Peak TPS: 5,000
├── Infrastructure cost: $150K/month
└── Required scaling: Baseline architecture

Year 2 (Expansion):
├── Voters: 35,000,000 (+75%)
├── Peak TPS: 8,000
├── Infrastructure cost: $250K/month
└── Required scaling: 2x database, 2x cache

Year 3 (Global):
├── Voters: 75,000,000 (+114%)
├── Peak TPS: 15,000
├── Infrastructure cost: $500K/month
└── Required scaling: Multi-region deployment

Year 4 (Enterprise):
├── Voters: 150,000,000 (+100%)
├── Peak TPS: 30,000
├── Infrastructure cost: $1M/month
└── Required scaling: Continental shards

Year 5 (Maturity):
├── Voters: 250,000,000 (+67%)
├── Peak TPS: 50,000
├── Infrastructure cost: $1.5M/month
└── Required scaling: Global edge architecture
```

### 8.3 Scaling Triggers

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| API response p95 | > 300ms | > 500ms | Scale up pods |
| Database CPU | > 70% | > 90% | Scale DB or optimize queries |
| Redis memory | > 80% | > 95% | Increase shards |
| Queue depth | > 50K | > 100K | Scale consumers |
| Blockchain latency | > 5s | > 10s | Add blockchain gateways |
| Error rate | > 1% | > 5% | Alert on-call |

### 8.4 Cost Optimization

#### Cost Reduction Strategies

| Strategy | Implementation | Savings |
|----------|----------------|---------|
| Reserved instances | 1-year reserved for baseline | 40-60% |
| Spot instances | Batch processing pods | 60-80% |
| Multi-cloud | Spot in secondary region | 30-50% |
| Caching optimization | Increase Redis hit rate to 95% | 20-30% DB cost |
| Batch processing | Off-peak batch jobs | 40% compute cost |
| Right-sizing | Monthly resource review | 15-25% |

#### Monthly Cost Projection (20M Voters)

| Component | Monthly Cost |
|-----------|-------------|
| Kubernetes (compute) | $80,000 |
| PostgreSQL (RDS) | $25,000 |
| Redis (ElastiCache) | $15,000 |
| RabbitMQ | $8,000 |
| Blockchain gas fees | $20,000 |
| CDN & egress | $12,000 |
| Monitoring & logging | $5,000 |
| **Total** | **$165,000/month** |

---

## Summary

This scalability architecture provides a comprehensive framework for supporting 20 million+ voters at 5,000 votes per second, with the ability to scale to 50 million voters during peak events. Key architectural decisions include:

1. **Database**: PostgreSQL partitioning by voter ID and election ID, with Redis caching for voter verification
2. **Application**: Horizontal pod autoscaling with HPA, configured for 10-200 replicas
3. **Queue**: RabbitMQ quorum queues with message batching (1,000 votes per batch)
4. **Blockchain**: Hybrid on-chain/off-chain architecture with batch aggregation
5. **Batch Orchestration**: Dynamic batch sizing based on real-time system load
6. **Performance**: Multi-layer caching with 90%+ hit rates
7. **Capacity**: Clear scaling triggers and 5-year growth projections

The architecture is designed for horizontal scalability at every layer, ensuring that capacity can be added incrementally as voter base and throughput requirements grow.
