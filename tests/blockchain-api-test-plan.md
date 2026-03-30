# Blockchain Voting System - API Test Plan

## Document Information

| Property | Value |
|----------|-------|
| **Version** | 1.0 |
| **Date** | March 30, 2026 |
| **Author** | API Tester |
| **Status** | Draft |
| **Coverage Target** | 95%+ |
| **Framework** | Jest / NestJS Testing |

---

## Table of Contents

1. [Test Suite Overview](#1-test-suite-overview)
2. [Unit Testing Coverage](#2-unit-testing-coverage)
3. [Integration Testing Scenarios](#3-integration-testing-scenarios)
4. [Error Handling Tests](#4-error-handling-tests)
5. [Mock Strategies](#5-mock-strategies)
6. [Test Data Requirements](#6-test-data-requirements)
7. [Coverage Targets](#7-coverage-targets)
8. [Test Execution Plan](#8-test-execution-plan)
9. [Expected Outcomes](#9-expected-outcomes)

---

## 1. Test Suite Overview

### 1.1 Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        BLOCKCHAIN SERVICE TEST SUITE                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   UNIT TESTS    │  │  INTEGRATION    │  │    E2E TESTS   │              │
│  │                 │  │     TESTS       │  │                 │              │
│  │  - validate     │  │  - voter        │  │  - full voting  │              │
│  │    Voter        │  │    eligibility  │  │    flow         │              │
│  │  - recordVote   │  │  - vote submit  │  │  - results      │              │
│  │  - publish      │  │  - results      │  │    publish      │              │
│  │  - verify       │  │    verify       │  │                 │              │
│  │  - submitVote   │  │                 │  │                 │              │
│  │  - healthCheck  │  │                 │  │                 │              │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘              │
│           │                    │                    │                         │
│           └────────────────────┼────────────────────┘                         │
│                                ▼                                              │
│                    ┌─────────────────────┐                                   │
│                    │   TEST COVERAGE      │                                   │
│                    │   REPORTING &       │                                   │
│                    │   METRICS           │                                   │
│                    └─────────────────────┘                                   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Service Dependencies

| Dependency | Type | Purpose |
|------------|------|---------|
| Web3.js | External Library | Blockchain interaction |
| VoteContract | Smart Contract | Vote recording |
| KeyManagerContract | Smart Contract | Key management |
| MixnetService | Internal Service | Vote anonymization |
| CryptographyService | Internal Service | Encryption & proofs |
| ConfigService | NestJS Config | Configuration |

### 1.3 Test File Structure

```
backend/src/
└── modules/
    └── blockchain/
        ├── blockchain.service.ts          # Implementation
        ├── blockchain.service.spec.ts      # Unit tests
        ├── blockchain.integration.spec.ts # Integration tests
        ├── mocks/
        │   ├── web3.mock.ts
        │   ├── contract.mock.ts
        │   └── transaction-receipt.mock.ts
        └── test-data/
            ├── voters.json
            ├── votes.json
            └── proofs.json
```

---

## 2. Unit Testing Coverage

### 2.1 Test Class: BlockchainService

```typescript
// Test file: blockchain.service.spec.ts
describe('BlockchainService', () => {
  let service: BlockchainService;
  let mockWeb3: any;
  let mockVoteContract: any;
  let mockKeyManagerContract: any;
  // ... setup
});
```

### 2.2 Method: `validateVoterEligibility`

**Purpose**: Verify a voter is eligible to cast a vote

**Test Cases**:

| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|
| 1 | Eligible voter during voting period | `voterId: "voter-001"` | `{ eligible: true, reason: null }` | Critical |
| 2 | Voter not registered | `voterId: "unknown-id"` | `{ eligible: false, reason: "not_registered" }` | Critical |
| 3 | Voter already voted | `voterId: "voted-voter"` | `{ eligible: false, reason: "already_voted" }` | Critical |
| 4 | Election not in voting state | `voterId: "voter-001"` | `{ eligible: false, reason: "not_in_voting_period" }` | High |
| 5 | Multiple eligibility checks | Sequential calls | Consistent results | Medium |

**Implementation**:

```typescript
describe('validateVoterEligibility', () => {
  const validVoterId = 'voter-valid-001';
  const unregisteredVoterId = 'voter-unregistered';
  const alreadyVotedVoterId = 'voter-already-voted';

  beforeEach(() => {
    // Setup mocks
    mockWeb3.utils.keccak256.mockImplementation((id: string) => 
      `0x${Buffer.from(id).toString('hex').padEnd(64, '0')}`
    );
  });

  it('should return eligible true for registered voter who has not voted during voting period', async () => {
    // Arrange
    mockVoteContract.methods.hasVoted.mockResolvedValue(false);
    mockVoteContract.methods.getElectionState.mockResolvedValue(2); // Voting state
    
    // Act
    const result = await service.validateVoterEligibility(validVoterId);
    
    // Assert
    expect(result.eligible).toBe(true);
    expect(result.reason).toBeNull();
    expect(mockVoteContract.methods.hasVoted).toHaveBeenCalled();
  });

  it('should return not_registered for unregistered voter', async () => {
    // Arrange
    mockVoteContract.methods.getVoterRecord.mockResolvedValue({
      isRegistered: false
    });
    
    // Act
    const result = await service.validateVoterEligibility(unregisteredVoterId);
    
    // Assert
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('not_registered');
  });

  it('should return already_voted for voter who has cast a vote', async () => {
    // Arrange
    mockVoteContract.methods.hasVoted.mockResolvedValue(true);
    
    // Act
    const result = await service.validateVoterEligibility(alreadyVotedVoterId);
    
    // Assert
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('already_voted');
  });

  it('should return not_in_voting_period when election is not in voting state', async () => {
    // Arrange - Election in Registration state
    mockVoteContract.methods.getElectionState.mockResolvedValue(1); // Registration
    
    // Act
    const result = await service.validateVoterEligibility(validVoterId);
    
    // Assert
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe('not_in_voting_period');
  });

  it('should handle network errors gracefully', async () => {
    // Arrange
    mockVoteContract.methods.hasVoted.mockRejectedValue(
      new Error('Network connection failed')
    );
    
    // Act & Assert
    await expect(
      service.validateVoterEligibility(validVoterId)
    ).rejects.toThrow(NetworkError);
  });

  it('should return consistent results for multiple checks', async () => {
    // Arrange
    mockVoteContract.methods.hasVoted.mockResolvedValue(false);
    mockVoteContract.methods.getElectionState.mockResolvedValue(2);
    
    // Act - Call multiple times
    const result1 = await service.validateVoterEligibility(validVoterId);
    const result2 = await service.validateVoterEligibility(validVoterId);
    const result3 = await service.validateVoterEligibility(validVoterId);
    
    // Assert
    expect(result1.eligible).toBe(result2.eligible);
    expect(result2.eligible).toBe(result3.eligible);
  });
});
```

### 2.3 Method: `recordVoteHash`

**Purpose**: Record an encrypted vote hash on the blockchain

**Test Cases**:

| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|
| 1 | Successful vote recording | Valid voter, hash, proof | Transaction receipt with txHash | Critical |
| 2 | Transaction fails | Invalid proof | TransactionFailedError | High |
| 3 | Network error during send | Network timeout | NetworkError | High |
| 4 | Insufficient gas | Low gas limit | TransactionFailedError | Medium |
| 5 | Wrong voter state mid-transaction | Voter votes between validation and recording | TransactionFailedError | Medium |

**Implementation**:

```typescript
describe('recordVoteHash', () => {
  const validVoterId = 'voter-001';
  const validEncryptedHash = '0xabc123...';
  const validProof = '0xproof...';
  
  const mockReceipt = {
    transactionHash: '0xtransaction123',
    blockNumber: 12345,
    status: true,
    gasUsed: 21000,
  };

  beforeEach(() => {
    mockWeb3.eth.getAccounts.mockResolvedValue(['0xdeployerAddress']);
    mockWeb3.eth.getGasPrice.mockResolvedValue('1000000000');
  });

  it('should record vote hash successfully and return transaction receipt', async () => {
    // Arrange
    mockVoteContract.methods.castVote.mockReturnValue({
      send: jest.fn().mockResolvedValue(mockReceipt)
    });
    
    // Act
    const result = await service.recordVoteHash(
      validVoterId,
      validEncryptedHash,
      validProof
    );
    
    // Assert
    expect(result.transactionHash).toBe(mockReceipt.transactionHash);
    expect(result.blockNumber).toBe(mockReceipt.blockNumber);
    expect(mockVoteContract.methods.castVote).toHaveBeenCalledWith(
      expect.any(String), // keccak256 of voterId
      validEncryptedHash,
      validProof
    );
  });

  it('should throw TransactionFailedError when transaction reverts', async () => {
    // Arrange
    mockVoteContract.methods.castVote.mockReturnValue({
      send: jest.fn().mockRejectedValue({
        message: 'Transaction reverted: Already voted',
        code: 'TRANSACTION_REVERTED'
      })
    });
    
    // Act & Assert
    await expect(
      service.recordVoteHash(validVoterId, validEncryptedHash, validProof)
    ).rejects.toThrow(TransactionFailedError);
  });

  it('should throw NetworkError on network failure', async () => {
    // Arrange
    mockVoteContract.methods.castVote.mockReturnValue({
      send: jest.fn().mockRejectedValue(new Error('Connection timeout'))
    });
    
    // Act & Assert
    await expect(
      service.recordVoteHash(validVoterId, validEncryptedHash, validProof)
    ).rejects.toThrow(NetworkError);
  });

  it('should use correct gas limit for vote recording', async () => {
    // Arrange
    const sendMock = jest.fn().mockResolvedValue(mockReceipt);
    mockVoteContract.methods.castVote.mockReturnValue({ send: sendMock });
    
    // Act
    await service.recordVoteHash(validVoterId, validEncryptedHash, validProof);
    
    // Assert - Verify gas limit
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        gas: 500000,
        gasPrice: expect.any(String)
      })
    );
  });

  it('should hash voterId correctly before recording', async () => {
    // Arrange
    const sendMock = jest.fn().mockResolvedValue(mockReceipt);
    mockVoteContract.methods.castVote.mockReturnValue({ send: sendMock });
    
    // Act
    await service.recordVoteHash(validVoterId, validEncryptedHash, validProof);
    
    // Assert
    expect(mockWeb3.utils.keccak256).toHaveBeenCalledWith(validVoterId);
  });
});
```

### 2.4 Method: `publishResults`

**Purpose**: Publish encrypted election results to the public blockchain

**Test Cases**:

| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|
| 1 | Successful results publication | Valid encrypted results + proof | Transaction completes | Critical |
| 2 | Non-admin attempting to publish | Non-admin account | TransactionFailedError | High |
| 3 | Invalid proof format | Malformed proof | TransactionFailedError | High |
| 4 | Network failure | Connection lost mid-transaction | NetworkError | Medium |

**Implementation**:

```typescript
describe('publishResults', () => {
  const validEncryptedResults = '0xencryptedResults...';
  const validProof = '0xproof...';
  const adminAccount = '0xadminAddress';
  
  beforeEach(() => {
    mockWeb3.eth.getAccounts.mockResolvedValue([adminAccount, '0xotherAccount']);
  });

  it('should publish results successfully when called by admin', async () => {
    // Arrange
    mockVoteContract.methods.publishResults.mockReturnValue({
      send: jest.fn().mockResolvedValue({
        transactionHash: '0xpublishTx123',
        status: true
      })
    });
    
    // Act
    await service.publishResults(validEncryptedResults, validProof);
    
    // Assert
    expect(mockVoteContract.methods.publishResults).toHaveBeenCalledWith(
      validEncryptedResults,
      validProof
    );
  });

  it('should throw error when called by non-admin', async () => {
    // Arrange
    mockWeb3.eth.getAccounts.mockResolvedValue(['0xnonAdminAccount']);
    mockVoteContract.methods.publishResults.mockReturnValue({
      send: jest.fn().mockRejectedValue(new Error('Only admin'))
    });
    
    // Act & Assert
    await expect(
      service.publishResults(validEncryptedResults, validProof)
    ).rejects.toThrow(BlockchainError);
  });
});
```

### 2.5 Method: `verifyResults`

**Purpose**: Verify the vote count for a candidate using ZK proofs

**Test Cases**:

| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|
| 1 | Valid proof verification | Valid candidate, count, proof | `true` | Critical |
| 2 | Invalid proof | Tampered proof | `false` | Critical |
| 3 | Non-existent candidate | Unknown candidate ID | `false` | High |
| 4 | Network error | Connection failure | NetworkError | High |

**Implementation**:

```typescript
describe('verifyResults', () => {
  const validCandidateId = 'candidate-001';
  const validEncryptedCount = '0xencrypted123...';
  const validProof = '0xvalidProof...';

  it('should return true for valid proof and candidate', async () => {
    // Arrange
    mockVoteContract.methods.verifyResult.mockResolvedValue(true);
    
    // Act
    const result = await service.verifyResults(
      validCandidateId,
      validEncryptedCount,
      validProof
    );
    
    // Assert
    expect(result).toBe(true);
    expect(mockVoteContract.methods.verifyResult).toHaveBeenCalledWith(
      validCandidateId,
      validEncryptedCount,
      validProof
    );
  });

  it('should return false for invalid proof', async () => {
    // Arrange
    const invalidProof = '0xtamperedProof';
    mockVoteContract.methods.verifyResult.mockResolvedValue(false);
    
    // Act
    const result = await service.verifyResults(
      validCandidateId,
      validEncryptedCount,
      invalidProof
    );
    
    // Assert
    expect(result).toBe(false);
  });

  it('should return false for non-existent candidate', async () => {
    // Arrange
    const nonExistentCandidate = 'candidate-nonexistent';
    mockVoteContract.methods.verifyResult.mockResolvedValue(false);
    
    // Act
    const result = await service.verifyResults(
      nonExistentCandidate,
      validEncryptedCount,
      validProof
    );
    
    // Assert
    expect(result).toBe(false);
  });
});
```

### 2.6 Method: `submitVote`

**Purpose**: Complete vote submission flow combining eligibility check, mixnet anonymization, and blockchain recording

**Test Cases**:

| # | Test Case | Input | Expected Output | Priority |
|---|-----------|-------|-----------------|----------|
| 1 | Complete successful submission | Valid voter, encrypted vote, ZK proof | VoteSubmissionResult with tx details | Critical |
| 2 | Voter not eligible | Unregistered voter | VoterNotEligibleError | Critical |
| 3 | Voter already voted | Duplicate vote attempt | VoterNotEligibleError | Critical |
| 4 | Mixnet failure | Mixnet service error | Error propagation | High |
| 5 | Blockchain transaction failure | TX reverts | TransactionFailedError | High |
| 6 | Election not active | Election closed | VoterNotEligibleError | High |

**Implementation**:

```typescript
describe('submitVote', () => {
  const validVoterId = 'voter-001';
  const validEncryptedVote = '0xencryptedVote...';
  const validZkProof = '0xzkProof...';
  
  const mockEligibilityResult = {
    eligible: true,
    reason: null
  };
  
  const mockMixResult = {
    anonymizedVote: '0xanonymized123...',
    mixId: 'mix-001'
  };
  
  const mockReceipt = {
    transactionHash: '0xtx123',
    blockNumber: 12345,
    status: true
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully submit vote with all valid inputs', async () => {
    // Arrange
    mockVoteContract.methods.getElectionState.mockResolvedValue(2); // Voting
    mockVoteContract.methods.hasVoted.mockResolvedValue(false);
    mockVoteContract.methods.getVoterRecord.mockResolvedValue({ isRegistered: true });
    
    jest.spyOn(service as any, 'validateVoterEligibility')
      .mockResolvedValue(mockEligibilityResult);
    jest.spyOn(cryptographyService, 'hashVote')
      .mockReturnValue('0xvotehash');
    jest.spyOn(mixnetService, 'anonymize')
      .mockResolvedValue(mockMixResult);
    jest.spyOn(service as any, 'recordVoteHash')
      .mockResolvedValue(mockReceipt);
    
    // Act
    const result = await service.submitVote(
      validVoterId,
      validEncryptedVote,
      validZkProof
    );
    
    // Assert
    expect(result.transactionHash).toBe(mockReceipt.transactionHash);
    expect(result.blockNumber).toBe(mockReceipt.blockNumber);
    expect(result.voteHash).toBeDefined();
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  it('should throw VoterNotEligibleError for ineligible voter', async () => {
    // Arrange
    jest.spyOn(service as any, 'validateVoterEligibility')
      .mockResolvedValue({
        eligible: false,
        reason: 'not_registered'
      });
    
    // Act & Assert
    await expect(
      service.submitVote(validVoterId, validEncryptedVote, validZkProof)
    ).rejects.toThrow(VoterNotEligibleError);
  });

  it('should throw error if election is not in voting state', async () => {
    // Arrange
    jest.spyOn(service as any, 'validateVoterEligibility')
      .mockResolvedValue({
        eligible: false,
        reason: 'not_in_voting_period'
      });
    
    // Act & Assert
    await expect(
      service.submitVote(validVoterId, validEncryptedVote, validZkProof)
    ).rejects.toThrow(VoterNotEligibleError);
  });

  it('should throw error when mixnet anonymization fails', async () => {
    // Arrange
    jest.spyOn(service as any, 'validateVoterEligibility')
      .mockResolvedValue(mockEligibilityResult);
    jest.spyOn(mixnetService, 'anonymize')
      .mockRejectedValue(new Error('Mixnet unavailable'));
    
    // Act & Assert
    await expect(
      service.submitVote(validVoterId, validEncryptedVote, validZkProof)
    ).rejects.toThrow();
  });

  it('should throw error when blockchain recording fails', async () => {
    // Arrange
    jest.spyOn(service as any, 'validateVoterEligibility')
      .mockResolvedValue(mockEligibilityResult);
    jest.spyOn(cryptographyService, 'hashVote')
      .mockReturnValue('0xvotehash');
    jest.spyOn(mixnetService, 'anonymize')
      .mockResolvedValue(mockMixResult);
    jest.spyOn(service as any, 'recordVoteHash')
      .mockRejectedValue(new TransactionFailedError('0xtx123'));
    
    // Act & Assert
    await expect(
      service.submitVote(validVoterId, validEncryptedVote, validZkProof)
    ).rejects.toThrow(TransactionFailedError);
  });

  it('should include all required fields in successful response', async () => {
    // Arrange
    jest.spyOn(service as any, 'validateVoterEligibility')
      .mockResolvedValue(mockEligibilityResult);
    jest.spyOn(cryptographyService, 'hashVote')
      .mockReturnValue('0xvotehash');
    jest.spyOn(mixnetService, 'anonymize')
      .mockResolvedValue(mockMixResult);
    jest.spyOn(service as any, 'recordVoteHash')
      .mockResolvedValue(mockReceipt);
    
    // Act
    const result = await service.submitVote(
      validVoterId,
      validEncryptedVote,
      validZkProof
    );
    
    // Assert
    expect(result).toEqual(expect.objectContaining({
      transactionHash: expect.any(String),
      blockNumber: expect.any(Number),
      voteHash: expect.any(String),
      timestamp: expect.any(Date)
    }));
  });
});
```

### 2.7 Method: `checkNetworkHealth`

**Purpose**: Verify blockchain network connectivity and status

**Test Cases**:

| # | Test Case | Expected Output | Priority |
|---|-----------|-----------------|----------|
| 1 | Network healthy | Connected: true, peerCount > 0 | Critical |
| 2 | Network disconnected | Connected: false | High |
| 3 | Node syncing | isSyncing: true | Medium |
| 4 | Multiple health checks | Consistent results | Low |

**Implementation**:

```typescript
describe('checkNetworkHealth', () => {
  it('should return healthy status when network is connected', async () => {
    // Arrange
    mockWeb3.eth.net.getPeerCount.mockResolvedValue(25);
    mockWeb3.eth.getBlockNumber.mockResolvedValue(12345);
    mockWeb3.eth.isSyncing.mockResolvedValue(false);
    jest.spyOn(service as any, 'getAverageBlockTime').mockResolvedValue(2000);
    
    // Act
    const result = await service.checkNetworkHealth();
    
    // Assert
    expect(result.connected).toBe(true);
    expect(result.peerCount).toBe(25);
    expect(result.blockNumber).toBe(12345);
    expect(result.isSyncing).toBe(false);
  });

  it('should return disconnected status when no peers', async () => {
    // Arrange
    mockWeb3.eth.net.getPeerCount.mockResolvedValue(0);
    
    // Act
    const result = await service.checkNetworkHealth();
    
    // Assert
    expect(result.connected).toBe(false);
    expect(result.peerCount).toBe(0);
  });

  it('should indicate syncing status when node is catching up', async () => {
    // Arrange
    mockWeb3.eth.net.getPeerCount.mockResolvedValue(25);
    mockWeb3.eth.getBlockNumber.mockResolvedValue(10000);
    mockWeb3.eth.isSyncing.mockResolvedValue({
      startingBlock: 5000,
      currentBlock: 8000,
      highestBlock: 15000
    });
    jest.spyOn(service as any, 'getAverageBlockTime').mockResolvedValue(2000);
    
    // Act
    const result = await service.checkNetworkHealth();
    
    // Assert
    expect(result.isSyncing).toBe(true);
  });

  it('should throw NetworkError when network check fails completely', async () => {
    // Arrange
    mockWeb3.eth.net.getPeerCount.mockRejectedValue(new Error('Connection refused'));
    
    // Act & Assert
    await expect(service.checkNetworkHealth()).rejects.toThrow(NetworkError);
  });
});
```

---

## 3. Integration Testing Scenarios

### 3.1 Voter Eligibility Validation Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                  VOTER ELIGIBILITY VALIDATION FLOW                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Test Scenario: Complete eligibility check from start to finish             │
│                                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │
│  │  Input  │───▶│ keccak │───▶│ hasVoted│───▶│ Election│───▶│ Result  │  │
│  │voterId │    │ Hash   │    │  Check  │    │ State   │    │ Builder │  │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘    └─────────┘  │
│                                                                              │
│  Test Data:                                                                  │
│  - 5 registered voters (different eligibility states)                      │
│  - Election in Voting state                                                 │
│  - Mock blockchain responses                                                │
│                                                                              │
│  Assertions:                                                                 │
│  - Correct hash generated for each voter                                   │
│  - hasVoted called with correct hash                                        │
│  - Election state checked                                                   │
│  - Correct eligibility result returned                                      │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Integration Test Implementation**:

```typescript
describe('Blockchain Service Integration: Voter Eligibility', () => {
  const testVoters = [
    { id: 'voter-eligible-001', registered: true, hasVoted: false },
    { id: 'voter-unregistered-001', registered: false, hasVoted: false },
    { id: 'voter-already-voted-001', registered: true, hasVoted: true },
    { id: 'voter-pending-001', registered: true, hasVoted: false, status: 'pending' },
    { id: 'voter-verified-001', registered: true, hasVoted: false, status: 'verified' },
  ];

  beforeEach(() => {
    mockVoteContract.methods.getElectionState.mockResolvedValue(2); // Voting
  });

  it('should correctly evaluate eligibility for multiple voters', async () => {
    const results = [];

    for (const voter of testVoters) {
      // Setup mock based on voter state
      mockVoteContract.methods.getVoterRecord.mockResolvedValue({
        isRegistered: voter.registered
      });
      mockVoteContract.methods.hasVoted.mockResolvedValue(voter.hasVoted);
      
      const result = await service.validateVoterEligibility(voter.id);
      results.push({ voterId: voter.id, result });
    }

    // Assertions
    expect(results[0].result.eligible).toBe(true); // Eligible voter
    expect(results[1].result.eligible).toBe(false);
    expect(results[1].result.reason).toBe('not_registered');
    expect(results[2].result.eligible).toBe(false);
    expect(results[2].result.reason).toBe('already_voted');
  });

  it('should handle concurrent eligibility checks efficiently', async () => {
    // Act - Run multiple checks concurrently
    const promises = testVoters.map(async (voter) => {
      mockVoteContract.methods.getVoterRecord.mockResolvedValue({
        isRegistered: voter.registered
      });
      mockVoteContract.methods.hasVoted.mockResolvedValue(voter.hasVoted);
      
      return service.validateVoterEligibility(voter.id);
    });

    const results = await Promise.all(promises);

    // Assert - All completed successfully
    expect(results).toHaveLength(testVoters.length);
  });
});
```

### 3.2 Vote Submission and Recording Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     VOTE SUBMISSION FLOW                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Test Scenario: Submit vote through complete flow                            │
│                                                                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────┐ │
│  │Validate │  │Hash     │  │Mixnet   │  │Record   │  │Confirm  │  │Return│ │
│  │Eligibility│▶│Vote   │  │Anonymize│  │on Chain │  │Receipt  │  │Result│ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────┘ │
│                                                                              │
│  Steps:                                                                     │
│  1. validateVoterEligibility()                                             │
│  2. cryptographyService.hashVote()                                          │
│  3. mixnetService.anonymize()                                               │
│  4. recordVoteHash()                                                         │
│  5. Return VoteSubmissionResult                                             │
│                                                                              │
│  Error Cases:                                                                │
│  - Step 1 fails: VoterNotEligibleError                                      │
│  - Step 3 fails: MixnetError                                                │
│  - Step 4 fails: TransactionFailedError                                     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Results Publication and Verification Flow

```typescript
describe('Integration: Results Publication and Verification', () => {
  const electionResults = {
    'candidate-001': 1500,
    'candidate-002': 1200,
    'candidate-003': 800,
  };

  it('should publish and verify results end-to-end', async () => {
    // Step 1: Publish results
    const encryptedResults = '0xencryptedResults...';
    const proof = '0xproof...';
    
    mockVoteContract.methods.publishResults.mockReturnValue({
      send: jest.fn().mockResolvedValue({ status: true })
    });
    
    await service.publishResults(encryptedResults, proof);
    
    // Step 2: Verify each candidate's results
    for (const [candidateId, expectedCount] of Object.entries(electionResults)) {
      mockVoteContract.methods.verifyResult.mockResolvedValue(true);
      
      const isValid = await service.verifyResults(
        candidateId,
        `0xencrypted${expectedCount}`,
        proof
      );
      
      expect(isValid).toBe(true);
    }
  });

  it('should detect tampered results during verification', async () => {
    // Publish legitimate results
    const legitimateProof = '0xlegitProof';
    mockVoteContract.methods.publishResults.mockReturnValue({
      send: jest.fn().mockResolvedValue({ status: true })
    });
    
    await service.publishResults('0xlegitResults', legitimateProof);
    
    // Attempt to verify with tampered count
    mockVoteContract.methods.verifyResult.mockResolvedValue(false);
    
    const isValid = await service.verifyResults(
      'candidate-001',
      '0xtamperedCount',
      legitimateProof
    );
    
    expect(isValid).toBe(false);
  });
});
```

---

## 4. Error Handling Tests

### 4.1 Error Class Hierarchy

```
┌─────────────────┐
│    Error       │
│   (built-in)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   BlockchainError       │
│   - code: string       │
│   - message: string    │
└────────┬────────────────┘
         │
    ┌────┴────┬──────────────────┐
    ▼         ▼                   ▼
┌─────────┐ ┌────────────────┐ ┌────────────┐
│VoterNot │ │Transaction     │ │Network     │
│Eligible │ │FailedError     │ │Error       │
│Error    │ │- txHash        │ │- endpoint  │
└─────────┘ └────────────────┘ └────────────┘
```

### 4.2 Error Test Cases

| Error Type | Scenario | Expected Behavior |
|------------|----------|------------------|
| VoterNotEligibleError | Voter not registered | Code: VOTER_NOT_ELIGIBLE, Reason: not_registered |
| VoterNotEligibleError | Already voted | Code: VOTER_NOT_ELIGIBLE, Reason: already_voted |
| VoterNotEligibleError | Not in voting period | Code: VOTER_NOT_ELIGIBLE, Reason: not_in_voting_period |
| TransactionFailedError | TX reverted | Code: TX_FAILED, includes txHash |
| TransactionFailedError | Insufficient gas | Code: TX_FAILED, includes gas error |
| NetworkError | Connection timeout | Code: NETWORK_ERROR, includes endpoint |
| NetworkError | Invalid response | Code: NETWORK_ERROR, includes response info |

**Test Implementation**:

```typescript
describe('Error Handling', () => {
  describe('VoterNotEligibleError', () => {
    it('should create error with correct code and reason', () => {
      const error = new VoterNotEligibleError('already_voted');
      
      expect(error.code).toBe('VOTER_NOT_ELIGIBLE');
      expect(error.message).toBe('Voter not eligible: already_voted');
    });

    it('should serialize correctly for API responses', () => {
      const error = new VoterNotEligibleError('not_registered');
      const serialized = JSON.parse(JSON.stringify(error));
      
      expect(serialized.code).toBe('VOTER_NOT_ELIGIBLE');
      expect(serialized.message).toContain('not_registered');
    });
  });

  describe('TransactionFailedError', () => {
    it('should include transaction hash in error', () => {
      const txHash = '0xabc123';
      const error = new TransactionFailedError(txHash);
      
      expect(error.code).toBe('TX_FAILED');
      expect(error.message).toContain(txHash);
    });
  });

  describe('NetworkError', () => {
    it('should include network details in error', () => {
      const error = new NetworkError('Connection refused to blockchain node');
      
      expect(error.code).toBe('NETWORK_ERROR');
      expect(error.message).toContain('Connection refused');
    });
  });

  describe('Error propagation through submitVote', () => {
    it('should propagate VoterNotEligibleError without wrapping', async () => {
      jest.spyOn(service as any, 'validateVoterEligibility')
        .mockRejectedValue(new VoterNotEligibleError('already_voted'));
      
      await expect(
        service.submitVote('voter-001', '0xencrypted', '0xproof')
      ).rejects.toThrow(VoterNotEligibleError);
    });

    it('should wrap unknown errors in BlockchainError', async () => {
      jest.spyOn(service as any, 'validateVoterEligibility')
        .mockRejectedValue(new Error('Unknown blockchain error'));
      
      await expect(
        service.submitVote('voter-001', '0xencrypted', '0xproof')
      ).rejects.toThrow(BlockchainError);
    });
  });
});
```

### 4.3 Network Failure Scenarios

```typescript
describe('Network Failure Handling', () => {
  beforeEach(() => {
    mockWeb3.eth.getAccounts.mockResolvedValue(['0xaccount']);
  });

  it('should retry on temporary network failure', async () => {
    // First call fails, second succeeds
    mockVoteContract.methods.castVote
      .mockReturnValueOnce({
        send: jest.fn().mockRejectedValue(new Error('Temporary failure'))
      })
      .mockReturnValueOnce({
        send: jest.fn().mockResolvedValue({
          transactionHash: '0xretrySuccess',
          status: true
        })
      });
    
    // With retry logic implemented
    const result = await service.recordVoteHash('voter-001', '0xhash', '0xproof');
    expect(result.transactionHash).toBe('0xretrySuccess');
  });

  it('should fail after max retries exhausted', async () => {
    mockVoteContract.methods.castVote.mockReturnValue({
      send: jest.fn().mockRejectedValue(new Error('Persistent failure'))
    });
    
    await expect(
      service.recordVoteHash('voter-001', '0xhash', '0xproof')
    ).rejects.toThrow(NetworkError);
  });

  it('should handle timeout gracefully', async () => {
    mockVoteContract.methods.castVote.mockReturnValue({
      send: jest.fn().mockRejectedValue(
        new Error('Transaction timeout after 30000ms')
      )
    });
    
    await expect(
      service.recordVoteHash('voter-001', '0xhash', '0xproof')
    ).rejects.toThrow(NetworkError);
  });
});
```

---

## 5. Mock Strategies

### 5.1 Web3 Mock

```typescript
// mocks/web3.mock.ts
export const createWeb3Mock = () => ({
  utils: {
    keccak256: jest.fn((value: string) => 
      `0x${Buffer.from(value).toString('hex').padEnd(64, '0')}`
    ),
    sha256: jest.fn(),
    randomHex: jest.fn(),
  },
  eth: {
    getAccounts: jest.fn().mockResolvedValue(['0xAccount1', '0xAccount2']),
    getGasPrice: jest.fn().mockResolvedValue('1000000000'),
    getBlockNumber: jest.fn().mockResolvedValue(12345),
    net: {
      getPeerCount: jest.fn().mockResolvedValue(25),
      isListening: jest.fn().mockResolvedValue(true),
    },
    isSyncing: jest.fn().mockResolvedValue(false),
  },
  providers: {
    HttpProvider: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
      on: jest.fn(),
    })),
  },
});
```

### 5.2 Contract Mock

```typescript
// mocks/contract.mock.ts
export const createVoteContractMock = () => ({
  methods: {
    castVote: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({
        transactionHash: '0x123',
        blockNumber: 12345,
        status: true,
      }),
      call: jest.fn(),
    }),
    hasVoted: jest.fn().mockReturnValue({
      call: jest.fn().mockResolvedValue(false),
    }),
    getElectionState: jest.fn().mockReturnValue({
      call: jest.fn().mockResolvedValue(2), // Voting
    }),
    getVoterRecord: jest.fn().mockReturnValue({
      call: jest.fn().mockResolvedValue({
        isRegistered: true,
      }),
    }),
    publishResults: jest.fn().mockReturnValue({
      send: jest.fn().mockResolvedValue({ status: true }),
    }),
    verifyResult: jest.fn().mockReturnValue({
      call: jest.fn().mockResolvedValue(true),
    }),
    getVoteProof: jest.fn().mockReturnValue({
      call: jest.fn().mockResolvedValue(['0xvoteHash', Date.now()]),
    }),
  },
  events: {
    VoteCast: jest.fn(),
    StateChanged: jest.fn(),
  },
});
```

### 5.3 Test Module Setup

```typescript
// blockchain.service.spec.ts - Module Setup
import { Test, TestingModule } from '@nestjs/testing';
import { BlockchainService } from './blockchain.service';
import { ConfigService } from '@nestjs/config';
import { CryptographyService } from '../cryptography/cryptography.service';
import { MixnetService } from '../mixnet/mixnet.service';

describe('BlockchainService', () => {
  let service: BlockchainService;
  let mockWeb3: any;
  let mockVoteContract: any;
  let mockKeyManagerContract: any;
  let mockCryptographyService: any;
  let mockMixnetService: any;

  beforeEach(async () => {
    // Create fresh mocks
    mockWeb3 = createWeb3Mock();
    mockVoteContract = createVoteContractMock();
    mockKeyManagerContract = createKeyManagerContractMock();
    
    mockCryptographyService = {
      hashVote: jest.fn().mockReturnValue('0xvotehash'),
      verifyVoteProof: jest.fn().mockResolvedValue(true),
    };
    
    mockMixnetService = {
      anonymize: jest.fn().mockResolvedValue({
        anonymizedVote: '0xanonymized',
        mixId: 'mix-001',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlockchainService,
        {
          provide: 'Web3',
          useValue: mockWeb3,
        },
        {
          provide: 'VoteContract',
          useValue: mockVoteContract,
        },
        {
          provide: 'KeyManagerContract',
          useValue: mockKeyManagerContract,
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config = {
                'blockchain.rpcUrl': 'http://localhost:8545',
                'blockchain.voteContractAddress': '0xVoteContract',
                'blockchain.keyManagerAddress': '0xKeyManager',
                'blockchain.authToken': 'test-token',
              };
              return config[key];
            }),
          },
        },
        {
          provide: CryptographyService,
          useValue: mockCryptographyService,
        },
        {
          provide: MixnetService,
          useValue: mockMixnetService,
        },
      ],
    }).compile();

    service = module.get<BlockchainService>(BlockchainService);
  });
});
```

---

## 6. Test Data Requirements

### 6.1 Sample Voter Data

```json
// test-data/voters.json
{
  "voters": [
    {
      "id": "voter-valid-001",
      "nationalId": "12345678",
      "name": "John Doe",
      "status": "verified",
      "registered": true,
      "hasVoted": false,
      "eligibility": "eligible"
    },
    {
      "id": "voter-unregistered-001",
      "nationalId": "87654321",
      "name": "Jane Smith",
      "status": "pending",
      "registered": false,
      "hasVoted": false,
      "eligibility": "not_registered"
    },
    {
      "id": "voter-already-voted-001",
      "nationalId": "11223344",
      "name": "Bob Wilson",
      "status": "verified",
      "registered": true,
      "hasVoted": true,
      "eligibility": "already_voted",
      "voteTimestamp": "2026-03-15T10:30:00Z"
    },
    {
      "id": "voter-suspended-001",
      "nationalId": "55667788",
      "name": "Alice Brown",
      "status": "suspended",
      "registered": true,
      "hasVoted": false,
      "eligibility": "suspended"
    }
  ]
}
```

### 6.2 Sample Encrypted Votes

```json
// test-data/votes.json
{
  "encryptedVotes": [
    {
      "id": "vote-001",
      "electionId": "election-pres-2026",
      "candidateId": "candidate-001",
      "encryptedPayload": "0x8f3b2a1c5d4e6f7890abcdef1234567890abcdef1234567890abcdef12",
      "encryptionKeyId": "key-he-001",
      "iv": "0x1234567890ab",
      "authTag": "0xabcdef1234567890"
    },
    {
      "id": "vote-002",
      "electionId": "election-pres-2026",
      "candidateId": "candidate-002",
      "encryptedPayload": "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef12",
      "encryptionKeyId": "key-he-001",
      "iv": "0xabcdef123456",
      "authTag": "0x9876543210fedcba"
    }
  ]
}
```

### 6.3 Sample ZK Proofs

```json
// test-data/proofs.json
{
  "validProofs": [
    {
      "id": "proof-001",
      "type": "vote_validity",
      "proof": "0xaa11bb22cc33dd44ee55ff66aa77bb88cc99dd00ee11ff22aa33bb44cc55dd66ee",
      "publicSignals": [
        "0xpublic1",
        "0xpublic2"
      ],
      "circuit": "vote_validity",
      "isValid": true
    },
    {
      "id": "proof-002",
      "type": "result_verification",
      "proof": "0x11223344556677889900aabbccddeeff11223344556677889900aabbccddeeff",
      "publicSignals": [
        "0xresultPublic1"
      ],
      "circuit": "result_verify",
      "isValid": true
    }
  ],
  "invalidProofs": [
    {
      "id": "proof-tampered-001",
      "type": "vote_validity",
      "proof": "0xTAMPEREDproofthatisinvalid1234567890",
      "publicSignals": ["0xtampered"],
      "circuit": "vote_validity",
      "isValid": false
    }
  ]
}
```

### 6.4 Election States

```json
// test-data/elections.json
{
  "electionStates": {
    "NotStarted": 0,
    "Registration": 1,
    "Voting": 2,
    "Tallying": 3,
    "Completed": 4
  },
  "testElections": [
    {
      "id": "election-active-001",
      "name": "Presidential Election 2026",
      "state": 2,
      "startTime": "2026-03-01T00:00:00Z",
      "endTime": "2026-03-31T23:59:59Z"
    },
    {
      "id": "election-registration-001",
      "name": "Local Elections 2026",
      "state": 1,
      "startTime": "2026-04-01T00:00:00Z",
      "endTime": "2026-04-30T23:59:59Z"
    },
    {
      "id": "election-completed-001",
      "name": "Primary Elections 2026",
      "state": 4,
      "startTime": "2026-01-01T00:00:00Z",
      "endTime": "2026-01-31T23:59:59Z"
    }
  ]
}
```

### 6.5 Transaction Receipts

```json
// test-data/transactions.json
{
  "successfulReceipts": [
    {
      "txHash": "0xabc123def456789",
      "blockNumber": 12345,
      "blockHash": "0xblockhash123456789",
      "status": true,
      "gasUsed": 21000,
      "transactionIndex": 0,
      "from": "0xdeployerAddress",
      "to": "0xvoteContractAddress",
      "logs": []
    }
  ],
  "failedReceipts": [
    {
      "txHash": "0xfailed123",
      "blockNumber": 12346,
      "status": false,
      "gasUsed": 21000,
      "revertReason": "Already voted"
    }
  ]
}
```

---

## 7. Coverage Targets

### 7.1 Coverage Matrix

| Category | Target | Current | Status |
|----------|--------|---------|--------|
| **Method Coverage** | 100% | 0% | Not Started |
| **Line Coverage** | 95%+ | 0% | Not Started |
| **Branch Coverage** | 90%+ | 0% | Not Started |
| **Decision Coverage** | 90%+ | 0% | Not Started |
| **Function Coverage** | 100% | 0% | Not Started |

### 7.2 Method Coverage Checklist

| Method | Unit Tests | Integration Tests | Error Tests | Total |
|--------|------------|-------------------|-------------|-------|
| `validateVoterEligibility` | 7 | 3 | 2 | 12 |
| `recordVoteHash` | 6 | 2 | 3 | 11 |
| `publishResults` | 4 | 2 | 2 | 8 |
| `verifyResults` | 4 | 2 | 1 | 7 |
| `submitVote` | 8 | 3 | 4 | 15 |
| `checkNetworkHealth` | 5 | 1 | 1 | 7 |
| **Total** | **34** | **13** | **13** | **60** |

### 7.3 Test Distribution

```
Test Distribution:
├── Unit Tests (56%)          ████████████████████
├── Integration Tests (22%)   ████████
├── Error Handling (22%)     ████████
```

---

## 8. Test Execution Plan

### 8.1 Running Tests

```bash
# Run all blockchain tests
npm test -- --testPathPattern="blockchain"

# Run with coverage
npm test -- --testPathPattern="blockchain" --coverage

# Run specific test file
npm test -- blockchain.service.spec.ts

# Run in watch mode during development
npm test -- --testPathPattern="blockchain" --watch

# Run with verbose output
npm test -- --testPathPattern="blockchain" --verbose
```

### 8.2 CI/CD Integration

```yaml
# .github/workflows/test.yml (excerpt)
blockchain-tests:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
    
    - name: Run blockchain tests
      run: npm test -- --testPathPattern="blockchain" --coverage
    
    - name: Upload coverage
      uses: codecov/codecov-action@v3
      with:
        files: ./coverage/lcov.info
        flags: blockchain
    
    - name: Check coverage thresholds
      run: |
        npx jest-coverage-thresholds \
          --config jest.config.js \
          --threshold 95
```

### 8.3 Performance Benchmarks

| Metric | Target | Threshold | Priority |
|--------|--------|------------|----------|
| Test suite execution | < 30s | < 60s | High |
| Single test execution | < 500ms | < 1000ms | Medium |
| Mock setup time | < 50ms | < 100ms | Medium |
| Memory usage | < 512MB | < 1GB | Low |

---

## 9. Expected Outcomes

### 9.1 Test Results Summary

After implementing all tests, the expected outcomes are:

| Metric | Expected Result |
|--------|------------------|
| **Total Tests** | 60+ |
| **Passing** | 60 (100%) |
| **Failing** | 0 |
| **Skipped** | 0 |
| **Coverage - Line** | 95%+ |
| **Coverage - Branch** | 90%+ |
| **Coverage - Function** | 100% |

### 9.2 Success Criteria

| Criterion | Measurement | Target |
|-----------|-------------|--------|
| All public methods tested | Test count | 6/6 methods |
| All error scenarios covered | Error test count | 13+ scenarios |
| Integration flows verified | Flow tests | 5+ flows |
| Mock覆盖率 | Mock usage | 100% |
| Test stability | Flaky test rate | < 1% |
| Execution time | CI pipeline | < 2 min |

### 9.3 Risk Mitigation

| Risk | Mitigation | Impact |
|------|------------|--------|
| Web3 API changes | Version pinning + interface mocks | Low |
| Smart contract updates | Contract mock updates | Medium |
| Network timing issues | Async handling + retries | Medium |
| Flaky tests | Proper mocking + isolation | High |

---

## Appendix A: Error Code Reference

| Code | Error Type | Description |
|------|------------|-------------|
| VOTER_NOT_ELIGIBLE | VoterNotEligibleError | Voter cannot vote |
| TX_FAILED | TransactionFailedError | Blockchain TX reverted |
| NETWORK_ERROR | NetworkError | Blockchain connection failed |
| INVALID_PROOF | BlockchainError | ZK proof verification failed |
| CONTRACT_ERROR | BlockchainError | Smart contract error |

---

## Appendix B: Test Data Factory

```typescript
// tests/factories/blockchain.factory.ts
export class BlockchainTestFactory {
  static createVoter(overrides: Partial<Voter> = {}): Voter {
    return {
      id: `voter-${Date.now()}`,
      nationalId: '12345678',
      status: 'verified',
      hasVoted: false,
      ...overrides,
    };
  }

  static createEncryptedVote(overrides: Partial<EncryptedVote> = {}): EncryptedVote {
    return {
      id: `vote-${Date.now()}`,
      electionId: 'election-001',
      candidateId: 'candidate-001',
      encryptedPayload: '0x' + 'a'.repeat(64),
      encryptionKeyId: 'key-001',
      iv: '0x' + 'b'.repeat(12),
      authTag: '0x' + 'c'.repeat(16),
      ...overrides,
    };
  }

  static createZkProof(overrides: Partial<ZKPProof> = {}): ZKPProof {
    return {
      id: `proof-${Date.now()}`,
      type: 'vote_validity',
      proof: '0x' + 'p'.repeat(64),
      publicSignals: ['0x' + 's'.repeat(32)],
      circuit: 'vote_validity',
      ...overrides,
    };
  }

  static createTransactionReceipt(overrides: Partial<TransactionReceipt> = {}): TransactionReceipt {
    return {
      transactionHash: '0x' + 't'.repeat(64),
      blockNumber: 12345,
      status: true,
      gasUsed: 21000,
      ...overrides,
    };
  }
}
```

---

**Document Version**: 1.0  
**Last Updated**: March 30, 2026  
**Next Review**: After initial test implementation
