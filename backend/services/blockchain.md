# Blockchain Service

## Overview

This document details the blockchain integration service for vote recording and result verification.

---

## 1. Service Architecture

```typescript
// services/blockchain.service.ts
@Injectable()
export class BlockchainService {
  private web3: Web3;
  private voteContract: Contract;
  private keyManagerContract: Contract;
  private mixnetService: MixnetService;

  constructor(
    private readonly config: ConfigService,
    private readonly cryptographyService: CryptographyService
  ) {
    this.initializeBlockchain();
  }

  private async initializeBlockchain() {
    // Connect to private blockchain network
    this.web3 = new Web3(
      new HttpProvider(this.config.get('blockchain.rpcUrl'), {
        timeout: 30000,
        headers: {
          'Authorization': `Bearer ${this.config.get('blockchain.authToken')}`
        }
      })
    );

    // Load vote contract
    this.voteContract = new this.web3.eth.Contract(
      VoteContractABI,
      this.config.get('blockchain.voteContractAddress')
    );

    // Load key manager contract
    this.keyManagerContract = new this.web3.eth.Contract(
      KeyManagerContractABI,
      this.config.get('blockchain.keyManagerAddress')
    );
  }
}
```

---

## 2. Hybrid Approach Implementation

### 2.1 Private Layer (Voter Validation)

```typescript
// Private blockchain for voter eligibility
async validateVoterEligibility(voterId: string): Promise<EligibilityResult> {
  // Check voter is registered
  const voterRecord = await this.getVoterRecordFromBlockchain(voterId);
  
  // Verify not already voted
  const hasVoted = await this.voteContract.methods
    .hasVoted(this.web3.utils.keccak256(voterId))
    .call();

  // Check within voting period
  const electionState = await this.getElectionState();
  
  return {
    eligible: voterRecord.isRegistered && !hasVoted && electionState === 'voting',
    reason: !voterRecord.isRegistered ? 'not_registered' : 
            hasVoted ? 'already_voted' : 
            electionState !== 'voting' ? 'not_in_voting_period' : null
  };
}

// Record vote hash in private blockchain
async recordVoteHash(
  voterId: string, 
  encryptedVoteHash: string, 
  proof: string
): Promise<TransactionReceipt> {
  const accounts = await this.web3.eth.getAccounts();
  
  return await this.voteContract.methods
    .castVote(
      this.web3.utils.keccak256(voterId),
      encryptedVoteHash,
      proof
    )
    .send({
      from: accounts[0],
      gas: 500000,
      gasPrice: await this.web3.eth.getGasPrice()
    });
}
```

### 2.2 Public Layer (Results Transparency)

```typescript
// Public blockchain for election results
async publishResults(encryptedResults: string, proof: string): Promise<void> {
  const accounts = await this.web3.eth.getAccounts();
  
  await this.voteContract.methods
    .publishResults(encryptedResults, proof)
    .send({
      from: accounts[0],
      gas: 500000
    });
}

// Anyone can verify results
async verifyResults(
  candidateId: string, 
  encryptedCount: string, 
  proof: string
): Promise<boolean> {
  return await this.voteContract.methods
    .verifyResult(candidateId, encryptedCount, proof)
    .call();
}
```

---

## 3. Vote Submission Flow

```typescript
// services/blockchain.service.ts
async submitVote(
  voterId: string,
  encryptedVote: string,
  zkProof: string
): Promise<VoteSubmissionResult> {
  
  // 1. Validate voter eligibility on private chain
  const eligibility = await this.validateVoterEligibility(voterId);
  if (!eligibility.eligible) {
    throw new VoterNotEligibleError(eligibility.reason);
  }

  // 2. Generate vote hash
  const voteHash = this.cryptographyService.hashVote(encryptedVote);

  // 3. Submit to mixnet for anonymization
  const mixResult = await this.mixnetService.anonymize({
    vote: encryptedVote,
    voterHash: this.web3.utils.keccak256(voterId)
  });

  // 4. Record on private blockchain
  const receipt = await this.recordVoteHash(
    voterId,
    mixResult.anonymizedVote,
    zkProof
  );

  // 5. Return confirmation
  return {
    transactionHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    voteHash: voteHash,
    timestamp: new Date()
  };
}
```

---

## 4. Smart Contract Integration

### 4.1 Vote Contract

```solidity
// contracts/VoteContract.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VoteContract {
    
    struct VoterRecord {
        bool hasVoted;
        bytes32 voteHash;
        uint256 timestamp;
    }
    
    struct Candidate {
        bytes32 encryptedCount;
        bool isActive;
    }
    
    // State
    mapping(bytes32 => VoterRecord) public voters;
    mapping(bytes32 => Candidate) public candidates;
    bytes32[] public candidateIds;
    
    ElectionState public state;
    uint256 public electionStartTime;
    uint256 public electionEndTime;
    uint256 public totalVotes;
    
    address public admin;
    
    enum ElectionState { 
        NotStarted, 
        Registration, 
        Voting, 
        Tallying, 
        Completed 
    }
    
    // Events
    event VoteCast(
        bytes32 indexed voterHash, 
        bytes32 voteHash, 
        uint256 timestamp
    );
    
    event StateChanged(
        ElectionState oldState, 
        ElectionState newState
    );
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }
    
    constructor() {
        admin = msg.sender;
    }
    
    function castVote(
        bytes32 _voterHash,
        bytes32 _voteHash,
        bytes calldata _proof
    ) external {
        require(state == ElectionState.Voting, "Voting not active");
        require(!voters[_voterHash].hasVoted, "Already voted");
        
        // Verify ZK proof
        require(verifyProof(_voteHash, _proof), "Invalid proof");
        
        voters[_voterHash].hasVoted = true;
        voters[_voterHash].voteHash = _voteHash;
        voters[_voterHash].timestamp = block.timestamp;
        
        totalVotes++;
        
        emit VoteCast(_voterHash, _voteHash, block.timestamp);
    }
    
    function hasVoted(bytes32 _voterHash) external view returns (bool) {
        return voters[_voterHash].hasVoted;
    }
    
    function getVoteProof(
        bytes32 _voterHash
    ) external view returns (bytes32, uint256) {
        return (
            voters[_voterHash].voteHash,
            voters[_voterHash].timestamp
        );
    }
    
    function setElectionState(ElectionState _state) external onlyAdmin {
        emit StateChanged(state, _state);
        state = _state;
        
        if (_state == ElectionState.Voting) {
            electionStartTime = block.timestamp;
        } else if (_state == ElectionState.Completed) {
            electionEndTime = block.timestamp;
        }
    }
    
    function verifyProof(
        bytes32 _voteHash,
        bytes calldata _proof
    ) internal pure returns (bool) {
        // ZK proof verification would happen here
        // Simplified for documentation
        return true;
    }
}
```

### 4.2 Key Manager Contract

```solidity
// contracts/ElectionKeyManager.sol
contract ElectionKeyManager {
    
    // Homomorphic encryption public key
    bytes public hePublicKey;
    
    // ZKP verification key
    bytes public zkpVerificationKey;
    
    // Key ceremony participants
    address[] public keyHolders;
    mapping(address => bool) public hasContributed;
    
    // Key status
    uint256 public lastKeyRotation;
    uint256 public keyRotationInterval = 30 days;
    
    // Events
    event KeysSet(bytes hePublicKey, bytes zkpKey);
    event KeyRotated(uint256 timestamp);
    event KeyHolderAdded(address holder);
    
    function setElectionKeys(
        bytes calldata _hePublicKey,
        bytes calldata _zkpVerificationKey
    ) external {
        require(hePublicKey.length == 0, "Keys already set");
        
        hePublicKey = _hePublicKey;
        zkpVerificationKey = _zkpVerificationKey;
        
        emit KeysSet(_hePublicKey, _zkpVerificationKey);
    }
    
    function rotateKeys() external {
        require(
            block.timestamp > lastKeyRotation + keyRotationInterval,
            "Too soon to rotate"
        );
        
        lastKeyRotation = block.timestamp;
        emit KeyRotated(block.timestamp);
    }
    
    function getHePublicKey() external view returns (bytes memory) {
        return hePublicKey;
    }
}
```

---

## 5. Node Configuration

### 5.1 Validator Node Setup

```typescript
// config/validator.config.ts
interface ValidatorConfig {
  nodeId: string;
  county: string;
  role: 'validator' | 'observer' | 'archive';
  
  network: {
    p2pPort: number;
    rpcPort: number;
    wsPort: number;
  };
  
  security: {
    tlsEnabled: boolean;
    firewallRules: string[];
    allowedPeers: string[];
  };
  
  consensus: {
    mechanism: 'IBFT2';
    blockTime: number;
    blockSize: number;
  };
}

const validatorNodes: ValidatorConfig[] = [
  {
    nodeId: 'validator-nairobi-1',
    county: 'Nairobi',
    role: 'validator',
    network: {
      p2pPort: 30303,
      rpcPort: 8545,
      wsPort: 8546
    },
    security: {
      tlsEnabled: true,
      firewallRules: ['allow-iebc-internal'],
      allowedPeers: [
        'validator-nairobi-2',
        'validator-mombasa-1',
        // ... all validators
      ]
    },
    consensus: {
      mechanism: 'IBFT2',
      blockTime: 2,
      blockSize: 2 * 1024 * 1024 // 2MB
    }
  }
  // ... 47 counties
];
```

---

## 6. Network Topology

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN NETWORK                                │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                  PRIVATE LAYER                               │  │
│   │                                                               │  │
│   │   IEBC HQ (Nairobi)                                          │  │
│   │   ├── Validator 1 (Primary) - 0x111...                      │  │
│   │   ├── Validator 2 (Backup) - 0x222...                       │  │
│   │   └── Validator 3 (Archive) - 0x333...                       │  │
│   │                                                               │  │
│   │   47 County Validators                                        │  │
│   │   ├── Nairobi - 0xa01...                                     │  │
│   │   ├── Mombasa - 0xa02...                                     │  │
│   │   ├── Kisumu - 0xa03...                                      │  │
│   │   └── ...                                                    │  │
│   │                                                               │  │
│   │   Consensus: IBFT 2.0                                        │  │
│   │   Block Time: 2 seconds                                      │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                   PUBLIC LAYER                               │  │
│   │                                                               │  │
│   │   Observer Nodes (Read-Only)                                 │  │
│   │   ├── Media Observer - 0xb01...                              │  │
│   │   ├── IEBC Website - 0xb02...                                │  │
│   │   └── International Observers - 0xb03...                    │  │
│   │                                                               │  │
│   │   Data Published:                                            │  │
│   │   ├── Encrypted votes (after mixnet)                         │  │
│   │   ├── Final tallies                                          │  │
│   │   └── Cryptographic proofs                                   │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Error Handling

```typescript
// Custom blockchain errors
export class BlockchainError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

export class VoterNotEligibleError extends BlockchainError {
  constructor(reason: string) {
    super(`Voter not eligible: ${reason}`, 'VOTER_NOT_ELIGIBLE');
  }
}

export class TransactionFailedError extends BlockchainError {
  constructor(txHash: string) {
    super(`Transaction failed: ${txHash}`, 'TX_FAILED');
  }
}

export class NetworkError extends BlockchainError {
  constructor(message: string) {
    super(message, 'NETWORK_ERROR');
  }
}
```

---

## 8. Monitoring

```typescript
// Blockchain health check
async checkNetworkHealth(): Promise<NetworkHealth> {
  const [peerCount, blockNumber, syncing] = await Promise.all([
    this.web3.eth.net.getPeerCount(),
    this.web3.eth.getBlockNumber(),
    this.web3.eth.isSyncing()
  ]);

  return {
    connected: peerCount > 0,
    peerCount,
    blockNumber,
    isSyncing: typeof syncing === 'object' ? syncing.syncing : false,
    lastBlockTime: await this.getAverageBlockTime()
  };
}
```
