/**
 * Blockchain Contract Configuration
 * 
 * This file contains the contract addresses and ABI references
 * for the voting system smart contracts.
 * 
 * Deployments by Network:
 * - localhost: 0x... (set after deployment)
 * - sepolia: 0x... (set after deployment)
 * - polygonMumbai: 0x... (set after deployment)
 * - polygon: 0x... (set after production deployment)
 */

// Network configurations
export interface NetworkConfig {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  explorerApiUrl: string;
}

export const networks: Record<string, NetworkConfig> = {
  localhost: {
    chainId: 31337,
    rpcUrl: process.env.LOCALHOST_RPC || 'http://127.0.0.1:8545',
    explorerUrl: 'http://localhost:8545',
    explorerApiUrl: 'http://localhost:8545/api',
  },
  sepolia: {
    chainId: 11155111,
    rpcUrl: process.env.SEPOLIA_RPC || '',
    explorerUrl: 'https://sepolia.etherscan.io',
    explorerApiUrl: 'https://api-sepolia.etherscan.io/api',
  },
  polygonMumbai: {
    chainId: 80001,
    rpcUrl: process.env.MUMBAI_RPC || '',
    explorerUrl: 'https://mumbai.polygonscan.com',
    explorerApiUrl: 'https://api-testnet.polygonscan.com/api',
  },
  polygon: {
    chainId: 137,
    rpcUrl: process.env.POLYGON_RPC || '',
    explorerUrl: 'https://polygonscan.com',
    explorerApiUrl: 'https://api.polygonscan.com/api',
  },
};

// Contract addresses by network
export interface ContractAddresses {
  electionKeyManager: string;
  voteContract: string;
}

export const contractAddresses: Record<string, ContractAddresses> = {
  // Update these after deployment
  localhost: {
    electionKeyManager: process.env.LOCALHOST_KEY_MANAGER_ADDRESS || '',
    voteContract: process.env.LOCALHOST_VOTE_CONTRACT_ADDRESS || '',
  },
  sepolia: {
    electionKeyManager: process.env.SEPOLIA_KEY_MANAGER_ADDRESS || '',
    voteContract: process.env.SEPOLIA_VOTE_CONTRACT_ADDRESS || '',
  },
  polygonMumbai: {
    electionKeyManager: process.env.MUMBAI_KEY_MANAGER_ADDRESS || '',
    voteContract: process.env.MUMBAI_VOTE_CONTRACT_ADDRESS || '',
  },
  polygon: {
    electionKeyManager: process.env.POLYGON_KEY_MANAGER_ADDRESS || '',
    voteContract: process.env.POLYGON_VOTE_CONTRACT_ADDRESS || '',
  },
};

// Contract ABIs (minimal interface for TypeScript)
export const electionKeyManagerABI = [
  // Read functions
  "function hePublicKey() view returns (bytes)",
  "function zkpVerificationKey() view returns (bytes)",
  "function keysInitialized() view returns (bool)",
  "function lastKeyRotation() view returns (uint256)",
  "function getHePublicKey() view returns (bytes)",
  "function getZkpVerificationKey() view returns (bytes)",
  "function areKeysSet() view returns (bool)",
  "function getCeremonyStatus() view returns (uint256 required, uint256 current, bool initialized, bool completed, bytes32 id)",
  "function getTimeUntilRotation() view returns (uint256)",
  "function isKeySetter(address _account) view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  // Write functions
  "function setElectionKeys(bytes calldata _hePublicKey, bytes calldata _zkpVerificationKey)",
  "function rotateKeys(bytes calldata _newHePublicKey, bytes calldata _newZkpVerificationKey)",
  "function emergencyKeyReset(bytes calldata _newHePublicKey, bytes calldata _newZkpVerificationKey)",
  "function addKeySetter(address _account)",
  "function removeKeySetter(address _account)",
  "function addKeyHolder(address _participant)",
  "function removeKeyHolder(address _participant)",
  "function initializeKeyCeremony(bytes32 _ceremonyId, uint256 _requiredParticipants)",
  "function contributeToCeremony(bytes32 _publicKey)",
  "function finalizeCeremony(bytes calldata _hePublicKey, bytes calldata _zkpVerificationKey)",
  "function pause()",
  "function unpause()",
  // Events
  "event KeysSet(bytes indexed hePublicKey, bytes indexed zkpVerificationKey, address indexed setter)",
  "event KeysRotated(bytes oldHeKeyHash, bytes newHeKeyHash, uint256 timestamp, address indexed rotator)",
  "event KeyCeremonyStarted(bytes32 indexed ceremonyId, uint256 requiredParticipants, address indexed initiator)",
  "event KeyCeremonyContribution(address indexed participant, bytes32 publicKey, uint256 participantCount, uint256 timestamp)",
  "event KeyCeremonyCompleted(bytes32 indexed ceremonyId, uint256 totalParticipants, address indexed completedBy)",
  "event EmergencyKeyReset(address indexed resetBy, uint256 timestamp)",
];

export const voteContractABI = [
  // Read functions
  "function voters(bytes32 _voterHash) view returns (bool hasVoted, bytes32 voteHash, uint256 timestamp, bytes32 blindingFactor)",
  "function candidates(bytes32 _candidateId) view returns (bytes32 encryptedCount, bool isActive)",
  "function candidateIds(uint256 index) view returns (bytes32)",
  "function state() view returns (uint8)",
  "function electionStartTime() view returns (uint256)",
  "function electionEndTime() view returns (uint256)",
  "function totalVotes() view returns (uint256)",
  "function keyManager() view returns (address)",
  "function hasVoted(bytes32 _voterHash) view returns (bool)",
  "function getVoteProof(bytes32 _voterHash) view returns (bytes32 voteHash, uint256 timestamp, bytes32 blindingFactor)",
  "function getElectionDuration() view returns (uint256)",
  "function getCandidateCount() view returns (uint256)",
  "function getCandidateId(uint256 index) view returns (bytes32)",
  "function isCandidate(bytes32 _candidateId) view returns (bool)",
  "function hasRole(bytes32 role, address account) view returns (bool)",
  "function paused() view returns (bool)",
  // Write functions
  "function castVote(bytes32 _voterHash, bytes32 _voteHash, bytes calldata _proof, bytes32 _blindingFactor)",
  "function setKeyManager(address _newKeyManager)",
  "function addCandidate(bytes32 _candidateId)",
  "function setElectionState(uint8 _newState)",
  "function pause()",
  "function unpause()",
  // Events
  "event VoteCast(bytes32 indexed voterHash, bytes32 voteHash, uint256 timestamp, bytes32 blindingFactor)",
  "event StateChanged(uint8 oldState, uint8 newState)",
  "event CandidateAdded(bytes32 indexed candidateId, address indexed addedBy)",
  "event KeyManagerUpdated(address indexed oldAddress, address indexed newAddress)",
  "event ProofVerificationFailed(bytes32 indexed voterHash, bytes32 voteHash, string reason)",
];

// Election states enum
export enum ElectionState {
  NotStarted = 0,
  Registration = 1,
  Voting = 2,
  Tallying = 3,
  Completed = 4,
}

// Helper function to get config for current network
export function getNetworkConfig(networkName: string): NetworkConfig {
  const config = networks[networkName];
  if (!config) {
    throw new Error(`Network configuration not found for: ${networkName}`);
  }
  return config;
}

// Helper function to get contract addresses for current network
export function getContractAddresses(networkName: string): ContractAddresses {
  const addresses = contractAddresses[networkName];
  if (!addresses) {
    throw new Error(`Contract addresses not found for: ${networkName}`);
  }
  if (!addresses.electionKeyManager || !addresses.voteContract) {
    throw new Error(`Contracts not deployed on network: ${networkName}`);
  }
  return addresses;
}

// Gas estimation helpers
export const GAS_LIMITS = {
  castVote: 500000,
  setElectionKeys: 300000,
  rotateKeys: 300000,
  addCandidate: 100000,
  setElectionState: 100000,
  pause: 50000,
  unpause: 50000,
};
