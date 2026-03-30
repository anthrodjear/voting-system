/**
 * Blockchain Service Type Definitions
 * 
 * Defines all types used by the blockchain service for vote recording
 * and result verification on the Hyperledger Besu network.
 */

/**
 * Result of voter eligibility check
 */
export interface EligibilityResult {
  /** Whether the voter is eligible to vote */
  eligible: boolean;
  /** Reason if not eligible (null if eligible) */
  reason: EligibilityReason | null;
  /** Additional details about eligibility */
  details?: {
    isRegistered: boolean;
    hasVoted: boolean;
    electionState: ElectionState;
    registrationTime?: Date;
  };
}

/**
 * Reasons why a voter might not be eligible
 */
export type EligibilityReason = 
  | 'not_registered'
  | 'already_voted'
  | 'not_in_voting_period'
  | 'election_not_active'
  | 'voter_suspended';

/**
 * Election state enumeration matching smart contract
 */
export type ElectionState = 
  | 'not_started'
  | 'registration'
  | 'voting'
  | 'tallying'
  | 'completed';

/**
 * Result of vote submission
 */
export interface VoteSubmissionResult {
  /** Transaction hash of the vote recording */
  transactionHash: string;
  /** Block number where vote was recorded */
  blockNumber: number;
  /** Hash of the encrypted vote */
  voteHash: string;
  /** Timestamp of submission */
  timestamp: Date;
  /** Confirmation number for voter */
  confirmationNumber?: string;
  /** Status of the submission */
  status: 'confirmed' | 'pending' | 'failed';
}

/**
 * Transaction receipt from blockchain
 */
export interface TransactionReceipt {
  /** Transaction hash */
  transactionHash: string;
  /** Block number */
  blockNumber: number;
  /** Block hash */
  blockHash: string;
  /** Gas used */
  gasUsed: number;
  /** Status (1 = success, 0 = failure) */
  status: boolean;
  /** Logs from transaction */
  logs: TransactionLog[];
}

/**
 * Transaction log entry
 */
export interface TransactionLog {
  /** Log address */
  address: string;
  /** Log topics */
  topics: string[];
  /** Log data */
  data: string;
}

/**
 * Network health status
 */
export interface NetworkHealth {
  /** Whether connected to network */
  connected: boolean;
  /** Number of connected peers */
  peerCount: number;
  /** Current block number */
  blockNumber: number;
  /** Whether node is syncing */
  isSyncing: boolean;
  /** Average block time in seconds */
  averageBlockTime: number;
  /** Last checked timestamp */
  lastChecked: Date;
  /** Network ID */
  networkId: number;
  /** Node health status */
  nodeStatus: 'healthy' | 'degraded' | 'offline';
}

/**
 * Vote record from blockchain
 */
export interface VoteRecord {
  /** Whether voter has voted */
  hasVoted: boolean;
  /** Hash of the encrypted vote */
  voteHash: string;
  /** Timestamp of vote */
  timestamp: number;
}

/**
 * Candidate result from blockchain
 */
export interface CandidateResult {
  /** Candidate ID */
  candidateId: string;
  /** Encrypted vote count */
  encryptedCount: string;
  /** Whether candidate is active */
  isActive: boolean;
}

/**
 * Election data from blockchain
 */
export interface ElectionData {
  /** Current election state */
  state: ElectionState;
  /** Election start timestamp */
  startTime: number;
  /** Election end timestamp */
  endTime: number;
  /** Total votes cast */
  totalVotes: number;
  /** Number of registered voters */
  registeredVoters: number;
}

/**
 * Mixnet anonymization result
 */
export interface MixnetResult {
  /** Anonymized vote data */
  anonymizedVote: string;
  /** Mix ID for tracking */
  mixId: string;
  /** Timestamp of mix operation */
  timestamp: Date;
}

/**
 * Key manager data
 */
export interface KeyManagerData {
  /** Homomorphic encryption public key */
  hePublicKey: string;
  /** ZKP verification key */
  zkpVerificationKey: string;
  /** Last key rotation timestamp */
  lastKeyRotation: number;
  /** Key rotation interval in seconds */
  keyRotationInterval: number;
}

/**
 * Validator node configuration
 */
export interface ValidatorConfig {
  /** Unique node identifier */
  nodeId: string;
  /** County name */
  county: string;
  /** Node role */
  role: 'validator' | 'observer' | 'archive';
  /** Network configuration */
  network: {
    /** P2P port */
    p2pPort: number;
    /** RPC port */
    rpcPort: number;
    /** WebSocket port */
    wsPort: number;
  };
  /** Security configuration */
  security: {
    /** Whether TLS is enabled */
    tlsEnabled: boolean;
    /** Firewall rules */
    firewallRules: string[];
    /** Allowed peer nodes */
    allowedPeers: string[];
  };
  /** Consensus configuration */
  consensus: {
    /** Consensus mechanism */
    mechanism: 'IBFT2';
    /** Block time in seconds */
    blockTime: number;
    /** Block size in bytes */
    blockSize: number;
  };
}

/**
 * Blockchain configuration
 */
export interface BlockchainConfig {
  /** RPC endpoint URL */
  rpcUrl: string;
  /** WebSocket endpoint URL */
  wsUrl?: string;
  /** Authentication token */
  authToken?: string;
  /** Vote contract address */
  voteContractAddress: string;
  /** Key manager contract address */
  keyManagerAddress: string;
  /** Network ID */
  networkId: number;
  /** Gas limit for transactions */
  gasLimit: number;
  /** Default gas price in Wei */
  gasPrice?: string;
  /** Confirmation blocks */
  confirmationBlocks: number;
  /** Timeout in milliseconds */
  timeout: number;
}

/**
 * Event emitted when vote is cast
 */
export interface VoteCastEvent {
  /** Indexed voter hash */
  voterHash: string;
  /** Vote hash */
  voteHash: string;
  /** Timestamp */
  timestamp: number;
}

/**
 * Event emitted when election state changes
 */
export interface StateChangedEvent {
  /** Previous state */
  oldState: ElectionState;
  /** New state */
  newState: ElectionState;
}
