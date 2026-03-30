/**
 * KeyManagerContract ABI
 * 
 * Smart contract for managing election cryptographic keys.
 * Handles homomorphic encryption public keys and ZKP verification keys.
 * 
 * Contract Address: Configured via BLOCKCHAIN_KEY_MANAGER_ADDRESS
 */

export const KeyManagerContractABI = [
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
        "indexed": false,
        "internalType": "bytes",
        "name": "hePublicKey",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "zkpKey",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "KeysSet",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "KeyRotated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "holder",
        "type": "address"
      }
    ],
    "name": "KeyHolderAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "holder",
        "type": "address"
      }
    ],
    "name": "KeyHolderRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "oldKeyHash",
        "type": "bytes"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "newKeyHash",
        "type": "bytes"
      }
    ],
    "name": "KeyCommitmentUpdated",
    "type": "event"
  },
  
  // Read functions
  {
    "inputs": [],
    "name": "hePublicKey",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "zkpVerificationKey",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "keyHolders",
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
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "hasContributed",
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
    "inputs": [],
    "name": "lastKeyRotation",
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
    "name": "keyRotationInterval",
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
  {
    "inputs": [],
    "name": "keysSet",
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
    "inputs": [],
    "name": "keyCommitment",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "keyHolderCount",
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
  
  // Write functions
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_hePublicKey",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "_zkpVerificationKey",
        "type": "bytes"
      }
    ],
    "name": "setElectionKeys",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_hePublicKey",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "_zkpVerificationKey",
        "type": "bytes"
      },
      {
        "internalType": "bytes32",
        "name": "_keyCommitment",
        "type": "bytes32"
      }
    ],
    "name": "setElectionKeysWithCommitment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "rotateKeys",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_holder",
        "type": "address"
      }
    ],
    "name": "addKeyHolder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_holder",
        "type": "address"
      }
    ],
    "name": "removeKeyHolder",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes",
        "name": "_contribution",
        "type": "bytes"
      }
    ],
    "name": "submitKeyContribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "_newCommitment",
        "type": "bytes32"
      }
    ],
    "name": "updateKeyCommitment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_interval",
        "type": "uint256"
      }
    ],
    "name": "setKeyRotationInterval",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  
  // Read functions (additional)
  {
    "inputs": [],
    "name": "getHePublicKey",
    "outputs": [
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getKeyInfo",
    "outputs": [
      {
        "internalType": "bool",
        "name": "keysSet",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "lastRotation",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rotationInterval",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "holderCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

/**
 * Type-safe interface for KeyManagerContract methods
 */
export type KeyManagerContractMethods = {
  // Read methods
  hePublicKey: () => Promise<string>;
  zkpVerificationKey: () => Promise<string>;
  keyHolders: (index: number) => Promise<string>;
  hasContributed: (holder: string) => Promise<boolean>;
  lastKeyRotation: () => Promise<string>;
  keyRotationInterval: () => Promise<string>;
  admin: () => Promise<string>;
  keysSet: () => Promise<boolean>;
  keyCommitment: () => Promise<string>;
  keyHolderCount: () => Promise<string>;
  getHePublicKey: () => Promise<string>;
  getKeyInfo: () => Promise<[boolean, string, string, string]>;
  
  // Write methods
  setElectionKeys: (hePublicKey: string, zkpVerificationKey: string) => any;
  setElectionKeysWithCommitment: (hePublicKey: string, zkpVerificationKey: string, keyCommitment: string) => any;
  rotateKeys: () => any;
  addKeyHolder: (holder: string) => any;
  removeKeyHolder: (holder: string) => any;
  submitKeyContribution: (contribution: string) => any;
  updateKeyCommitment: (newCommitment: string) => any;
  setKeyRotationInterval: (interval: number) => any;
};

/**
 * Default key rotation interval (30 days in seconds)
 */
export const DEFAULT_KEY_ROTATION_INTERVAL = 30 * 24 * 60 * 60;
