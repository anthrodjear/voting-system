/**
 * VoteContract ABI
 * 
 * Smart contract for recording votes on the blockchain.
 * This contract handles voter eligibility, vote recording, and result tallying.
 * 
 * Contract Address: Configured via BLOCKCHAIN_VOTE_CONTRACT_ADDRESS
 */

export const VoteContractABI = [
  // Constructor
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  
  // Events
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "voterHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "voteHash",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "VoteCast",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "oldState",
        "type": "uint8"
      },
      {
        "indexed": false,
        "internalType": "uint8",
        "name": "newState",
        "type": "uint8"
      }
    ],
    "name": "StateChanged",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "encryptedResults",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "proof",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "ResultsPublished",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "isRegistered",
        "type": "bool"
      }
    ],
    "name": "VoterRegistered",
    "type": "event"
  },
  
  // Read functions
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "hasVoted",
        "type": "bool"
      },
      {
        "internalType": "bytes32",
        "name": "voteHash",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "encryptedCount",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "isActive",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "candidateIds",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "state",
    "outputs": [
      {
        "internalType": "enum VoteContract.ElectionState",
        "name": "",
        "type": "uint8"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "electionStartTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "electionEndTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalVotes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "admin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  
  // Write functions
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_voterHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_voteHash",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_proof",
        "type": "bytes"
      }
    ],
    "name": "castVote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_voterHash",
        "type": "bytes32"
      }
    ],
    "name": "hasVoted",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_voterHash",
        "type": "bytes32"
      }
    ],
    "name": "getVoteProof",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint8",
        "name": "_state",
        "type": "uint8"
      }
    ],
    "name": "setElectionState",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_encryptedResults",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_proof",
        "type": "bytes"
      }
    ],
    "name": "publishResults",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_candidateId",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "_encryptedCount",
        "type": "bytes32"
      },
      {
        "internalType": "bytes",
        "name": "_proof",
        "type": "bytes"
      }
    ],
    "name": "verifyResult",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_voter",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "_isRegistered",
        "type": "bool"
      }
    ],
    "name": "registerVoter",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_candidateId",
        "type": "bytes32"
      },
      {
        "internalType": "bool",
        "name": "_isActive",
        "type": "bool"
      }
    ],
    "name": "setCandidateActive",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getElectionData",
    "outputs": [
      {
        "internalType": "uint8",
        "name": "state",
        "type": "uint8"
      },
      {
        "internalType": "uint256",
        "name": "startTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "endTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalVotes",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

/**
 * Type-safe interface for VoteContract methods
 */
export type VoteContractMethods = {
  // Read methods
  voters: (voterHash: string) => Promise<{ hasVoted: boolean; voteHash: string; timestamp: number }>;
  candidates: (candidateId: string) => Promise<{ encryptedCount: string; isActive: boolean }>;
  candidateIds: () => Promise<string[]>;
  state: () => Promise<number>;
  electionStartTime: () => Promise<string>;
  electionEndTime: () => Promise<string>;
  totalVotes: () => Promise<string>;
  admin: () => Promise<string>;
  hasVoted: (voterHash: string) => Promise<boolean>;
  getVoteProof: (voterHash: string) => Promise<[string, string]>;
  verifyResult: (candidateId: string, encryptedCount: string, proof: string) => Promise<boolean>;
  getElectionData: () => Promise<[number, string, string, string]>;
  
  // Write methods
  castVote: (voterHash: string, voteHash: string, proof: string) => any;
  setElectionState: (state: number) => any;
  publishResults: (encryptedResults: string, proof: string) => any;
  registerVoter: (voter: string, isRegistered: boolean) => any;
  setCandidateActive: (candidateId: string, isActive: boolean) => any;
};

/**
 * Election state enum values
 */
export enum ElectionStateEnum {
  NotStarted = 0,
  Registration = 1,
  Voting = 2,
  Tallying = 3,
  Completed = 4
}

/**
 * Helper to convert numeric state to string
 */
export function electionStateToString(state: number): string {
  const states: Record<number, string> = {
    0: 'not_started',
    1: 'registration',
    2: 'voting',
    3: 'tallying',
    4: 'completed'
  };
  return states[state] || 'unknown';
}
