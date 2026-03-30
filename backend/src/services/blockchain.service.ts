/**
 * Blockchain Service
 * 
 * NestJS service for blockchain interactions with Hyperledger Besu.
 * Handles voter eligibility, vote recording, and result verification
 * using a hybrid blockchain approach (private layer for voting, public layer for transparency).
 * 
 * @module BlockchainService
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Web3 from 'web3';
import { Buffer } from 'buffer';

// Import custom errors
import {
  TransactionFailedError,
  ServiceAccountNotConfiguredError,
  TransactionConfirmationError,
  TransactionRetriesExhaustedError,
  NonceConflictError,
  HSMError,
  KeyDecryptionError,
} from '../errors/blockchain.errors';

// Type definitions for web3 v4
type Web3Contract = any;
type PromiEvent<T> = any;

/**
 * Configuration interface for blockchain module
 */
export interface BlockchainModuleConfig {
  rpcUrl: string;
  wsUrl?: string;
  authToken?: string;
  voteContractAddress: string;
  keyManagerAddress: string;
  networkId: number;
  gasLimit: number;
  gasPrice?: string;
  confirmationBlocks: number;
  timeout: number;
  // Service account configuration
  serviceAccount?: string;
  privateKeyEncrypted?: string;
  hsmEndpoint?: string;
  hsmKeyId?: string;
  keyPassword?: string;
  // Transaction settings
  txRetries: number;
  txConfirmations: number;
}

/**
 * Transaction options with enhanced security
 */
export interface SecureTransactionOptions {
  from: string;
  gas: number;
  gasPrice?: bigint;
  nonce?: number;
  chainId?: number;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
}

/**
 * Result of transaction execution with confirmation
 */
export interface TransactionExecutionResult {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: number;
  status: boolean;
  logs: any[];
  confirmations: number;
  nonce: number;
}

/**
 * Election state type
 */
export type ElectionState = 'not_started' | 'registration' | 'voting' | 'tallying' | 'completed';

/**
 * Result of voter eligibility check
 */
export interface EligibilityResult {
  eligible: boolean;
  reason: string | null;
  details?: {
    isRegistered: boolean;
    hasVoted: boolean;
    electionState: string;
  };
}

/**
 * Vote submission result
 */
export interface VoteSubmissionResult {
  transactionHash: string;
  blockNumber: number;
  voteHash: string;
  timestamp: Date;
  confirmationNumber?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

/**
 * Transaction receipt from blockchain
 */
export interface TransactionReceipt {
  transactionHash: string;
  blockNumber: number;
  blockHash: string;
  gasUsed: number;
  status: boolean;
  logs: any[];
}

/**
 * Network health status
 */
export interface NetworkHealth {
  connected: boolean;
  peerCount: number;
  blockNumber: number;
  isSyncing: boolean;
  averageBlockTime: number;
  lastChecked: Date;
  networkId: number;
  nodeStatus: 'healthy' | 'degraded' | 'offline';
}

/**
 * Vote record
 */
export interface VoteRecord {
  hasVoted: boolean;
  voteHash: string;
  timestamp: number;
}

/**
 * Key manager data
 */
export interface KeyManagerData {
  hePublicKey: string;
  zkpVerificationKey: string;
  lastKeyRotation: number;
  keyRotationInterval: number;
}

/**
 * Election data
 */
export interface ElectionData {
  state: number;
  startTime: number;
  endTime: number;
  totalVotes: number;
}

/**
 * Mixnet result
 */
export interface MixnetResult {
  anonymizedVote: string;
  mixId: string;
  timestamp: Date;
}

/**
 * Election state enum values
 */
enum ElectionStateEnum {
  NotStarted = 0,
  Registration = 1,
  Voting = 2,
  Tallying = 3,
  Completed = 4
}

function electionStateToString(state: number): string {
  const states: Record<number, string> = {
    0: 'not_started',
    1: 'registration',
    2: 'voting',
    3: 'tallying',
    4: 'completed'
  };
  return states[state] || 'unknown';
}

@Injectable()
export class BlockchainService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(BlockchainService.name);
  
  private web3!: Web3;
  private voteContract: Web3Contract;
  private keyManagerContract: Web3Contract;
  private isInitialized = false;
  private isServiceAccountConfigured = false;
  
  // Configuration
  private readonly config: BlockchainModuleConfig;
  
  // Default gas settings
  private readonly defaultGasLimit = 500000;
  
  // Service account key (kept in memory, never logged)
  private serviceAccountKey: string | null = null;
  
  // Nonce management
  private nonceCache: Map<string, number> = new Map();
  private lastNonceFetch: number = 0;
  private readonly nonceCacheTTL = 5000; // 5 seconds
  
  // Transaction retry settings
  private readonly baseRetryDelay = 1000; // 1 second
  private readonly maxRetryDelay = 30000; // 30 seconds

  // Vote Contract ABI
  private static readonly VOTE_CONTRACT_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "bytes32", "name": "voterHash", "type": "bytes32" }, { "indexed": false, "internalType": "bytes32", "name": "voteHash", "type": "bytes32" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "VoteCast", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "uint8", "name": "oldState", "type": "uint8" }, { "indexed": false, "internalType": "uint8", "name": "newState", "type": "uint8" }], "name": "StateChanged", "type": "event" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes32", "name": "encryptedResults", "type": "bytes32" }, { "indexed": false, "internalType": "bytes", "name": "proof", "type": "bytes" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "ResultsPublished", "type": "event" },
    { "inputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "name": "voters", "outputs": [{ "internalType": "bool", "name": "hasVoted", "type": "bool" }, { "internalType": "bytes32", "name": "voteHash", "type": "bytes32" }, { "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "state", "outputs": [{ "internalType": "enum VoteContract.ElectionState", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "electionStartTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "electionEndTime", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "totalVotes", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "admin", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "_voterHash", "type": "bytes32" }, { "internalType": "bytes32", "name": "_voteHash", "type": "bytes32" }, { "internalType": "bytes", "name": "_proof", "type": "bytes" }], "name": "castVote", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "_voterHash", "type": "bytes32" }], "name": "hasVoted", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "_voterHash", "type": "bytes32" }], "name": "getVoteProof", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }, { "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "uint8", "name": "_state", "type": "uint8" }], "name": "setElectionState", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "_encryptedResults", "type": "bytes32" }, { "internalType": "bytes", "name": "_proof", "type": "bytes" }], "name": "publishResults", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [{ "internalType": "bytes32", "name": "_candidateId", "type": "bytes32" }, { "internalType": "bytes32", "name": "_encryptedCount", "type": "bytes32" }, { "internalType": "bytes", "name": "_proof", "type": "bytes" }], "name": "verifyResult", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getElectionData", "outputs": [{ "internalType": "uint8", "name": "state", "type": "uint8" }, { "internalType": "uint256", "name": "startTime", "type": "uint256" }, { "internalType": "uint256", "name": "endTime", "type": "uint256" }, { "internalType": "uint256", "name": "totalVotes", "type": "uint256" }], "stateMutability": "view", "type": "function" }
  ];

  // Key Manager Contract ABI
  private static readonly KEY_MANAGER_ABI = [
    { "inputs": [], "stateMutability": "nonpayable", "type": "constructor" },
    { "anonymous": false, "inputs": [{ "indexed": false, "internalType": "bytes", "name": "hePublicKey", "type": "bytes" }, { "indexed": false, "internalType": "bytes", "name": "zkpKey", "type": "bytes" }, { "indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256" }], "name": "KeysSet", "type": "event" },
    { "inputs": [], "name": "hePublicKey", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "zkpVerificationKey", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "lastKeyRotation", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "keyRotationInterval", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "keysSet", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" },
    { "inputs": [{ "internalType": "bytes", "name": "_hePublicKey", "type": "bytes" }, { "internalType": "bytes", "name": "_zkpVerificationKey", "type": "bytes" }], "name": "setElectionKeys", "outputs": [], "stateMutability": "nonpayable", "type": "function" },
    { "inputs": [], "name": "getHePublicKey", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" },
    { "inputs": [], "name": "getKeyInfo", "outputs": [{ "internalType": "bool", "name": "keysSet", "type": "bool" }, { "internalType": "uint256", "name": "lastRotation", "type": "uint256" }, { "internalType": "uint256", "name": "rotationInterval", "type": "uint256" }, { "internalType": "uint256", "name": "holderCount", "type": "uint256" }], "stateMutability": "view", "type": "function" }
  ];

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.config = this.loadBlockchainConfig();
  }

  /**
   * Load blockchain configuration from environment
   */
  private loadBlockchainConfig(): BlockchainModuleConfig {
    return {
      rpcUrl: this.configService.get<string>('blockchain.rpcUrl', 'http://localhost:8545'),
      wsUrl: this.configService.get<string>('blockchain.wsUrl'),
      authToken: this.configService.get<string>('blockchain.authToken'),
      voteContractAddress: this.configService.get<string>('blockchain.voteContractAddress', ''),
      keyManagerAddress: this.configService.get<string>('blockchain.keyManagerAddress', ''),
      networkId: this.configService.get<number>('blockchain.networkId', 1337),
      gasLimit: this.configService.get<number>('blockchain.gasLimit', 500000),
      gasPrice: this.configService.get<string>('blockchain.gasPrice'),
      confirmationBlocks: this.configService.get<number>('blockchain.txConfirmations', 1),
      timeout: this.configService.get<number>('blockchain.timeout', 30000),
      // Service account configuration
      serviceAccount: this.configService.get<string>('blockchain.serviceAccount'),
      privateKeyEncrypted: this.configService.get<string>('blockchain.privateKeyEncrypted'),
      hsmEndpoint: this.configService.get<string>('blockchain.hsmEndpoint'),
      hsmKeyId: this.configService.get<string>('blockchain.hsmKeyId'),
      keyPassword: this.configService.get<string>('blockchain.keyPassword'),
      // Transaction settings
      txRetries: this.configService.get<number>('blockchain.txRetries', 3),
      txConfirmations: this.configService.get<number>('blockchain.txConfirmations', 1),
    };
  }

  /**
   * Initialize blockchain connection on module start
   */
  async onModuleInit(): Promise<void> {
    try {
      await this.initializeBlockchain();
      this.logger.log('Blockchain service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize blockchain service', error);
      // Don't throw - allow service to work in degraded mode
    }
  }

  /**
   * Cleanup on module destroy
   */
  async onModuleDestroy(): Promise<void> {
    this.logger.log('Blockchain service shutting down');
  }

  /**
   * Initialize Web3 connection and load contracts
   */
  private async initializeBlockchain(): Promise<void> {
    try {
      // Create Web3 instance
      this.web3 = new Web3(this.config.rpcUrl);

      // Verify connection
      const networkId = await this.web3.eth.net.getId();
      if (networkId !== BigInt(this.config.networkId)) {
        this.logger.warn(
          `Network ID mismatch. Expected: ${this.config.networkId}, Got: ${networkId}`
        );
      }

      // Load Vote Contract
      if (this.config.voteContractAddress) {
        this.voteContract = new this.web3.eth.Contract(
          BlockchainService.VOTE_CONTRACT_ABI as any,
          this.config.voteContractAddress
        );
        this.logger.log(`Vote contract loaded at: ${this.config.voteContractAddress}`);
      }

      // Load Key Manager Contract
      if (this.config.keyManagerAddress) {
        this.keyManagerContract = new this.web3.eth.Contract(
          BlockchainService.KEY_MANAGER_ABI as any,
          this.config.keyManagerAddress
        );
        this.logger.log(`Key Manager contract loaded at: ${this.config.keyManagerAddress}`);
      }

      // Initialize service account
      await this.initializeServiceAccount();

      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Failed to initialize blockchain connection', error);
      throw new Error(`Blockchain initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Initialize service account for transaction signing
   * Supports HSM integration and encrypted private key
   */
  private async initializeServiceAccount(): Promise<void> {
    const { serviceAccount, privateKeyEncrypted, hsmEndpoint, hsmKeyId, keyPassword } = this.config;

    // Check if service account is configured
    if (!serviceAccount) {
      this.logger.warn(
        'BLOCKCHAIN_SERVICE_ACCOUNT not configured. Using wallet account (NOT RECOMMENDED FOR PRODUCTION).'
      );
      this.isServiceAccountConfigured = false;
      return;
    }

    this.logger.log(`Service account configured: ${serviceAccount}`);

    // Try HSM first if configured
    if (hsmEndpoint && hsmKeyId) {
      try {
        await this.initializeHSMKey(hsmEndpoint, hsmKeyId);
        this.isServiceAccountConfigured = true;
        this.logger.log('Using HSM for transaction signing');
        return;
      } catch (error) {
        this.logger.error('HSM initialization failed, falling back to encrypted key', error);
      }
    }

    // Try encrypted private key
    if (privateKeyEncrypted && keyPassword) {
      try {
        this.serviceAccountKey = this.decryptPrivateKey(privateKeyEncrypted, keyPassword);
        this.isServiceAccountConfigured = true;
        this.logger.log('Service account initialized with encrypted private key');
        return;
      } catch (error) {
        this.logger.error('Failed to decrypt private key', error);
        throw new KeyDecryptionError((error as Error).message);
      }
    }

    // No valid key configuration
    this.logger.warn(
      'Service account address configured but no valid key found. HSM or encrypted private key required.'
    );
    this.isServiceAccountConfigured = false;
  }

  /**
   * Initialize key from HSM (Hardware Security Module)
   * In production, this would integrate with actual HSM (e.g., AWS CloudHSM, Azure Key Vault, HashiCorp Vault)
   */
  private async initializeHSMKey(endpoint: string, keyId: string): Promise<void> {
    this.logger.log(`Initializing HSM connection: ${endpoint}`);

    // Simulated HSM integration
    // In production, this would make actual HSM API calls:
    // - AWS CloudHSM: aws-cloudhsm@v2 SDK
    // - Azure Key Vault: @azure/keyvault-keys
    // - HashiCorp Vault: node-vault
    // - Luna Network HSM: safenet-authentication
    
    try {
      // Validate HSM endpoint connectivity (simulated)
      // In production: await this.testHSMConnection(endpoint);
      
      // For HSM, we don't store the key locally - it's fetched per transaction
      this.serviceAccountKey = `hsm:${keyId}`;
      this.logger.log(`HSM key initialized: ${keyId}`);
    } catch (error) {
      throw new HSMError(`Failed to initialize HSM key: ${(error as Error).message}`, endpoint, keyId);
    }
  }

  /**
   * Decrypt private key using AES-256-CBC
   * Format: iv:encryptedKey:authTag (base64 encoded)
   */
  private decryptPrivateKey(encryptedData: string, password: string): string {
    try {
      // Parse the encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted key format. Expected: iv:encryptedKey:authTag');
      }

      const [ivB64, encryptedKeyB64, authTagB64] = parts;

      // Decode from base64
      const iv = Buffer.from(ivB64, 'base64');
      const encryptedKey = Buffer.from(encryptedKeyB64, 'base64');
      const authTag = Buffer.from(authTagB64, 'base64');

      // Derive key from password using PBKDF2
      const crypto = require('crypto');
      const key = crypto.pbkdf2Sync(password, iv, 100000, 32, 'sha256');

      // Create decipher
      const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
      decipher.setAuthTag(authTag);

      // Decrypt
      let decrypted = decipher.update(encryptedKey, 'binary', 'hex');
      decrypted += decipher.final('hex');

      // Validate decrypted key
      if (!decrypted.startsWith('0x') || decrypted.length !== 66) {
        throw new Error('Decrypted key is not a valid Ethereum private key');
      }

      return decrypted;
    } catch (error) {
      this.logger.error('Key decryption failed');
      throw new KeyDecryptionError((error as Error).message);
    }
  }

  /**
   * Get the service account address
   */
  private getServiceAccount(): string {
    if (this.config.serviceAccount) {
      return this.config.serviceAccount;
    }
    throw new ServiceAccountNotConfiguredError();
  }

  /**
   * Get the default account for transactions
   * Uses service account if configured, otherwise falls back to wallet
   */
  private async getDefaultAccount(): Promise<string> {
    if (this.isServiceAccountConfigured && this.config.serviceAccount) {
      return this.config.serviceAccount;
    }
    
    // Fallback to wallet account (for development only)
    const accounts = await this.web3.eth.getAccounts();
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts available');
    }
    
    this.logger.warn('Using wallet account - NOT RECOMMENDED FOR PRODUCTION');
    return accounts[0];
  }

  /**
   * Get the next nonce for the service account
   * Uses caching to avoid excessive RPC calls
   */
  private async getNextNonce(account: string): Promise<number> {
    const now = Date.now();
    
    // Check if cache is still valid
    if (now - this.lastNonceFetch < this.nonceCacheTTL) {
      const cachedNonce = this.nonceCache.get(account.toLowerCase());
      if (cachedNonce !== undefined) {
        return cachedNonce + 1;
      }
    }

    // Fetch fresh nonce
    const nonce = await this.web3.eth.getTransactionCount(account, 'pending');
    this.nonceCache.set(account.toLowerCase(), Number(nonce));
    this.lastNonceFetch = now;
    
    return Number(nonce);
  }

  /**
   * Clear nonce cache (useful after failed transactions)
   */
  private clearNonceCache(account?: string): void {
    if (account) {
      this.nonceCache.delete(account.toLowerCase());
    } else {
      this.nonceCache.clear();
    }
  }

  /**
   * Execute a transaction with retry logic and confirmation verification
   * This is the secure way to send transactions
   */
  private async executeTransactionWithRetry(
    method: any,
    options: SecureTransactionOptions
  ): Promise<TransactionExecutionResult> {
    const { from, gas, gasPrice, chainId } = options;
    const retries = this.config.txRetries || 3;
    const confirmations = this.config.txConfirmations || 1;
    let lastError: Error | null = null;
    let transactionHash: string | undefined;

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // Get fresh nonce (clears cache on retry after conflict)
        const nonce = await this.getNextNonce(from);
        
        // Build transaction options
        const txOptions: any = {
          from,
          gas,
          nonce,
        };

        // Add gas price or fee data
        if (gasPrice) {
          txOptions.gasPrice = gasPrice;
        } else if (chainId) {
          // Use EIP-1559 fee market
          const feeData = await this.web3.eth.getFeeHistory(2, 'latest', [25, 75]);
          const baseFeePerGas = BigInt(feeData.baseFeePerGas[0]);
          const maxPriorityFeePerGas = BigInt(feeData.reward[0][0]);
          txOptions.maxFeePerGas = baseFeePerGas * BigInt(2) + maxPriorityFeePerGas;
          txOptions.maxPriorityFeePerGas = maxPriorityFeePerGas;
        }

        this.logger.debug(
          `Executing transaction attempt ${attempt}/${retries} - nonce: ${nonce}, from: ${from}`
        );

        // Send transaction and wait for confirmation
        const receipt = await this.sendTransactionWithConfirmation(method, txOptions, confirmations);

        // Update nonce cache on success
        this.nonceCache.set(from.toLowerCase(), nonce);

        this.logger.log(
          `Transaction confirmed: ${receipt.transactionHash}, block: ${receipt.blockNumber}, status: ${receipt.status}`
        );

        return {
          transactionHash: receipt.transactionHash,
          blockNumber: Number(receipt.blockNumber),
          blockHash: receipt.blockHash,
          gasUsed: Number(receipt.gasUsed),
          status: receipt.status,
          logs: receipt.logs || [],
          confirmations,
          nonce,
        };

      } catch (error: any) {
        lastError = error;
        const errorMessage = error.message || String(error);
        
        this.logger.warn(
          `Transaction attempt ${attempt}/${retries} failed: ${errorMessage}`
        );

        // Handle specific error types
        if (errorMessage.includes('nonce too low') || errorMessage.includes('nonce conflict')) {
          // Clear nonce cache and retry with fresh nonce
          this.clearNonceCache(from);
          this.logger.debug('Nonce conflict detected, clearing cache and retrying');
          continue;
        }

        if (errorMessage.includes('insufficient funds')) {
          // Don't retry on insufficient funds
          this.logger.error('Insufficient funds for transaction');
          throw new TransactionFailedError(
            transactionHash || 'unknown',
            'Insufficient funds for transaction'
          );
        }

        if (attempt < retries) {
          // Calculate exponential backoff delay
          const delay = this.calculateRetryDelay(attempt);
          this.logger.debug(`Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries exhausted
    throw new TransactionRetriesExhaustedError(
      retries,
      lastError?.message || 'Unknown error',
      transactionHash
    );
  }

  /**
   * Send transaction and wait for confirmations
   */
  private async sendTransactionWithConfirmation(
    method: any,
    txOptions: any,
    confirmations: number
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let receipt: any = null;
      let confirmed = false;

      // Send transaction
      const promiEvent: PromiEvent<any> = method.send(txOptions);

      promiEvent
        .on('transactionHash', (hash: string) => {
          this.logger.debug(`Transaction sent: ${hash}`);
        })
        .on('receipt', (r: any) => {
          receipt = r;
          
          // If no confirmation needed, resolve immediately
          if (confirmations === 0) {
            confirmed = true;
            resolve(receipt);
          }
        })
        .on('confirmation', async (confirmationNumber: number, r: any) => {
          if (!confirmed) {
            confirmed = true;
            receipt = r;
            
            this.logger.debug(
              `Transaction confirmed: ${confirmationNumber}/${confirmations} confirmations`
            );
            
            if (confirmationNumber >= confirmations) {
              resolve(receipt);
            }
          }
        })
        .on('error', (error: Error) => {
          if (!confirmed) {
            // Check if we got a receipt despite the error
            if (receipt) {
              resolve(receipt);
            } else {
              reject(error);
            }
          }
        });

      // Timeout handling
      setTimeout(() => {
        if (!confirmed && receipt) {
          this.logger.warn('Transaction confirmation timeout, returning receipt');
          resolve(receipt);
        } else if (!confirmed) {
          reject(new Error('Transaction confirmation timeout'));
        }
      }, this.config.timeout);
    });
  }

  /**
   * Calculate exponential backoff delay with jitter
   */
  private calculateRetryDelay(attempt: number): number {
    const exponentialDelay = this.baseRetryDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.3 * exponentialDelay;
    return Math.min(exponentialDelay + jitter, this.maxRetryDelay);
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Verify transaction was successful
   */
  private verifyTransactionSuccess(receipt: any): void {
    if (!receipt.status) {
      throw new TransactionFailedError(
        receipt.transactionHash,
        'Transaction reverted on-chain',
        {
          blockNumber: Number(receipt.blockNumber),
          gasUsed: Number(receipt.gasUsed),
        }
      );
    }
  }

  /**
   * Sign transaction using HSM
   */
  private async signWithHSM(message: string, keyId: string): Promise<string> {
    if (!this.config.hsmEndpoint) {
      throw new HSMError('HSM not configured', this.config.hsmEndpoint, keyId);
    }

    // In production, this would call actual HSM:
    // const client = new HSMClient({ endpoint: this.config.hsmEndpoint });
    // return await client.sign(keyId, Buffer.from(message, 'hex'));

    this.logger.debug(`[HSM] Signing message with key: ${keyId}`);
    
    // Simulated HSM signature (replace with actual HSM integration)
    // This would be: client.sign(keyId, message)
    throw new HSMError('HSM signing not implemented - configure actual HSM endpoint', 
      this.config.hsmEndpoint, keyId);
  }

  /**
    * Validate if a voter is eligible to vote
    * 
    * @param voterId - Unique voter identifier
    * @returns Eligibility result with reason if not eligible
    */
   async validateVoterEligibility(voterId: string): Promise<EligibilityResult> {
    this.logger.log(`Validating voter eligibility for: ${voterId}`);
    
    try {
      if (!this.isInitialized || !this.voteContract) {
        throw new Error('Blockchain not initialized');
      }

      // Get voter hash
      const voterHash = this.web3.utils.keccak256(voterId);

      // Check if voter has already voted
      const hasVoted = await this.voteContract.methods.hasVoted(voterHash).call();

      // Get election state
      const electionData = await this.getElectionData();
      const electionStateStr = electionStateToString(electionData.state);

      // Determine eligibility
      let eligible = false;
      let reason: string | null = null;

      if (electionStateStr !== 'voting') {
        reason = electionStateStr === 'not_started' || electionStateStr === 'registration' 
          ? 'not_in_voting_period' 
          : 'election_not_active';
      } else if (hasVoted) {
        reason = 'already_voted';
      } else {
        eligible = true;
      }

      const result: EligibilityResult = {
        eligible,
        reason,
        details: {
          isRegistered: true,
          hasVoted: Boolean(hasVoted),
          electionState: electionStateStr,
        },
      };

      this.logger.log(`Voter eligibility check complete: eligible=${eligible}, reason=${reason}`);
      return result;

    } catch (error) {
      this.logger.error(`Error validating voter eligibility: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Record a vote hash on the blockchain
   * 
   * @param voterId - Unique voter identifier
   * @param encryptedVoteHash - Hash of the encrypted vote
   * @param proof - ZK proof for vote validity
   * @returns Transaction receipt with confirmation
   */
  async recordVoteHash(
    voterId: string,
    encryptedVoteHash: string,
    proof: string
  ): Promise<TransactionReceipt> {
    this.logger.log(`Recording vote hash for voter: ${voterId}`);
    
    try {
      if (!this.isInitialized || !this.voteContract) {
        throw new Error('Blockchain not initialized');
      }

      const voterHash = this.web3.utils.keccak256(voterId);
      const voteHash = this.web3.utils.keccak256(encryptedVoteHash);
      
      const from = await this.getDefaultAccount();
      const gasPrice = this.config.gasPrice 
        ? this.web3.utils.toWei(this.config.gasPrice, 'wei')
        : undefined;
      
      const chainId = await this.web3.eth.getChainId();

      // Execute transaction with retry and confirmation
      const result = await this.executeTransactionWithRetry(
        this.voteContract.methods.castVote(voterHash, voteHash, proof),
        {
          from,
          gas: this.config.gasLimit || this.defaultGasLimit,
          gasPrice: gasPrice ? BigInt(gasPrice.toString()) : undefined,
          chainId: Number(chainId),
        }
      );

      // Verify transaction success
      this.verifyTransactionSuccess(result);

      this.logger.log(`Vote recorded successfully. Tx: ${result.transactionHash}`);

      return {
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        blockHash: result.blockHash,
        gasUsed: result.gasUsed,
        status: result.status,
        logs: result.logs,
      };

    } catch (error: any) {
      this.logger.error(`Failed to record vote hash: ${error.message}`);
      
      // Re-throw with more context
      if (error instanceof TransactionRetriesExhaustedError ||
          error instanceof TransactionConfirmationError ||
          error instanceof TransactionFailedError) {
        throw error;
      }
      throw new TransactionFailedError(
        'unknown',
        error.message || 'Failed to record vote hash'
      );
    }
  }

  /**
   * Submit a complete vote with mixnet anonymization
   * 
   * @param voterId - Unique voter identifier
   * @param encryptedVote - Encrypted vote data
   * @param zkProof - Zero-knowledge proof
   * @returns Vote submission result
   */
  async submitVote(
    voterId: string,
    encryptedVote: string,
    zkProof: string
  ): Promise<VoteSubmissionResult> {
    this.logger.log(`Submitting vote for voter: ${voterId}`);
    
    try {
      // 1. Validate voter eligibility
      const eligibility = await this.validateVoterEligibility(voterId);
      if (!eligibility.eligible) {
        throw new Error(`Voter not eligible: ${eligibility.reason}`);
      }

      // 2. Generate vote hash
      const voteHash = this.web3.utils.keccak256(encryptedVote);

      // 3. Simulate mixnet anonymization (in production, this would call MixnetService)
      const mixResult = await this.anonymizeVote(encryptedVote, voterId);

      // 4. Record on blockchain (with retry and confirmation)
      const receipt = await this.recordVoteHash(
        voterId,
        mixResult.anonymizedVote,
        zkProof
      );

      // 5. Transaction success is already verified in recordVoteHash
      // Additional verification for safety
      if (!receipt.status) {
        throw new TransactionFailedError(
          receipt.transactionHash,
          'Transaction failed on-chain'
        );
      }

      // 6. Generate confirmation number
      const confirmationNumber = this.generateConfirmationNumber();

      const result: VoteSubmissionResult = {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        voteHash,
        timestamp: new Date(),
        confirmationNumber,
        status: 'confirmed',
      };

      this.logger.log(
        `Vote submitted successfully. Confirmation: ${confirmationNumber}, Tx: ${receipt.transactionHash}`
      );

      return result;

    } catch (error) {
      this.logger.error(`Failed to submit vote: ${(error as Error).message}`);
      
      // Re-throw blockchain errors with proper context
      if (error instanceof TransactionRetriesExhaustedError ||
          error instanceof TransactionConfirmationError ||
          error instanceof TransactionFailedError ||
          error instanceof ServiceAccountNotConfiguredError) {
        throw error;
      }
      
      throw error;
    }
  }

  /**
   * Publish election results to the blockchain
   * 
   * @param encryptedResults - Encrypted election results
   * @param proof - ZK proof for results
   */
  async publishResults(encryptedResults: string, proof: string): Promise<void> {
    this.logger.log('Publishing election results');
    
    try {
      if (!this.isInitialized || !this.voteContract) {
        throw new Error('Blockchain not initialized');
      }

      // Verify election state allows publishing
      const electionData = await this.getElectionData();
      const state = electionStateToString(electionData.state);
      
      if (state !== 'tallying' && state !== 'completed') {
        throw new Error(`Cannot publish results in "${state}" state. Required: tallying or completed`);
      }

      const from = await this.getDefaultAccount();
      const resultsHash = this.web3.utils.keccak256(encryptedResults);
      const chainId = await this.web3.eth.getChainId();

      // Execute transaction with retry and confirmation
      const result = await this.executeTransactionWithRetry(
        this.voteContract.methods.publishResults(resultsHash, proof),
        {
          from,
          gas: this.config.gasLimit || this.defaultGasLimit,
          chainId: Number(chainId),
        }
      );

      // Verify transaction success
      this.verifyTransactionSuccess(result);

      this.logger.log('Election results published successfully');

    } catch (error: any) {
      this.logger.error(`Failed to publish results: ${error.message}`);
      
      if (error instanceof TransactionRetriesExhaustedError ||
          error instanceof TransactionConfirmationError ||
          error instanceof TransactionFailedError) {
        throw error;
      }
      throw error;
    }
  }

  /**
   * Verify election results
   * 
   * @param candidateId - Candidate identifier
   * @param encryptedCount - Encrypted vote count
   * @param proof - ZK proof
   * @returns Whether results are valid
   */
  async verifyResults(
    candidateId: string,
    encryptedCount: string,
    proof: string
  ): Promise<boolean> {
    this.logger.log(`Verifying results for candidate: ${candidateId}`);
    
    try {
      if (!this.isInitialized || !this.voteContract) {
        throw new Error('Blockchain not initialized');
      }

      const countHash = this.web3.utils.keccak256(encryptedCount);
      const isValid = await this.voteContract.methods
        .verifyResult(candidateId, countHash, proof)
        .call();

      this.logger.log(`Result verification for ${candidateId}: ${Boolean(isValid)}`);
      return Boolean(isValid);

    } catch (error) {
      this.logger.error(`Failed to verify results: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Check network health and connectivity
   * 
   * @returns Network health status
   */
  async checkNetworkHealth(): Promise<NetworkHealth> {
    this.logger.debug('Checking blockchain network health');
    
    try {
      if (!this.web3) {
        return this.createUnhealthyNetwork('Web3 not initialized');
      }

      const [peerCount, blockNumber, networkId] = await Promise.all([
        this.web3.eth.net.getPeerCount(),
        this.web3.eth.getBlockNumber(),
        this.web3.eth.net.getId(),
      ]);

      const connected = peerCount > 0 || networkId === BigInt(this.config.networkId);
      const averageBlockTime = await this.getAverageBlockTime();

      const health: NetworkHealth = {
        connected,
        peerCount: Number(peerCount) || 0,
        blockNumber: Number(blockNumber),
        isSyncing: false,
        averageBlockTime,
        lastChecked: new Date(),
        networkId: Number(networkId),
        nodeStatus: connected ? 'healthy' : 'degraded',
      };

      return health;

    } catch (error) {
      this.logger.error(`Network health check failed: ${(error as Error).message}`);
      return this.createUnhealthyNetwork((error as Error).message);
    }
  }

  /**
   * Get election data from blockchain
   */
  async getElectionData(): Promise<ElectionData> {
    if (!this.voteContract) {
      throw new Error('Vote contract not initialized');
    }

    const data = await this.voteContract.methods.getElectionData().call();
    return {
      state: Number(data[0]),
      startTime: Number(data[1]),
      endTime: Number(data[2]),
      totalVotes: Number(data[3]),
    };
  }

  /**
   * Get key manager data
   */
  async getKeyManagerData(): Promise<KeyManagerData> {
    if (!this.keyManagerContract) {
      throw new Error('Key Manager contract not initialized');
    }

    const [hePublicKey, zkpKey, lastRotation, interval, keysSet] = await Promise.all([
      this.keyManagerContract.methods.getHePublicKey().call(),
      this.keyManagerContract.methods.zkpVerificationKey().call(),
      this.keyManagerContract.methods.lastKeyRotation().call(),
      this.keyManagerContract.methods.keyRotationInterval().call(),
      this.keyManagerContract.methods.keysSet().call(),
    ]);

    if (!keysSet) {
      throw new Error('Election keys not set');
    }

    return {
      hePublicKey: String(hePublicKey),
      zkpVerificationKey: String(zkpKey),
      lastKeyRotation: Number(lastRotation),
      keyRotationInterval: Number(interval),
    };
  }

  /**
   * Get vote proof for a voter
   */
  async getVoteProof(voterId: string): Promise<VoteRecord> {
    if (!this.voteContract) {
      throw new Error('Vote contract not initialized');
    }

    const voterHash = this.web3.utils.keccak256(voterId);
    const [voteHash, timestamp] = await this.voteContract.methods
      .getVoteProof(voterHash)
      .call();

    return {
      hasVoted: !!voteHash,
      voteHash: String(voteHash),
      timestamp: Number(timestamp),
    };
  }

  /**
   * Set election state (admin only)
   */
  async setElectionState(state: ElectionState): Promise<void> {
    if (!this.voteContract) {
      throw new Error('Vote contract not initialized');
    }

    const stateMap: Record<ElectionState, number> = {
      'not_started': ElectionStateEnum.NotStarted,
      'registration': ElectionStateEnum.Registration,
      'voting': ElectionStateEnum.Voting,
      'tallying': ElectionStateEnum.Tallying,
      'completed': ElectionStateEnum.Completed,
    };

    const from = await this.getDefaultAccount();
    const chainId = await this.web3.eth.getChainId();

    // Execute transaction with retry and confirmation
    const result = await this.executeTransactionWithRetry(
      this.voteContract.methods.setElectionState(stateMap[state]),
      {
        from,
        gas: 100000,
        chainId: Number(chainId),
      }
    );

    // Verify transaction success
    this.verifyTransactionSuccess(result);

    this.logger.log(`Election state changed to: ${state}`);
  }

  // ==================== Private Helper Methods ====================

  /**
   * Simulate vote anonymization via mixnet
   * In production, this would integrate with MixnetService
   */
  private async anonymizeVote(encryptedVote: string, voterId: string): Promise<MixnetResult> {
    // Simulated mixnet result
    // In production: call mixnetService.anonymize()
    const mixId = `mix_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    // Generate anonymized vote (in production this would be actual mixnet output)
    const anonymizedVote = this.web3.utils.keccak256(encryptedVote + mixId);

    return {
      anonymizedVote,
      mixId,
      timestamp: new Date(),
    };
  }

  /**
   * Calculate average block time
   */
  private async getAverageBlockTime(): Promise<number> {
    try {
      const currentBlock = await this.web3.eth.getBlockNumber();
      if (currentBlock < BigInt(100)) {
        return 2; // Default for IBFT
      }

      const pastBlock = Number(currentBlock) - 100;
      const [currentBlockData, pastBlockData] = await Promise.all([
        this.web3.eth.getBlock(currentBlock),
        this.web3.eth.getBlock(BigInt(pastBlock)),
      ]);

      const timeDiff = Number(currentBlockData.timestamp) - Number(pastBlockData.timestamp);
      return timeDiff / 100;
    } catch {
      return 2; // Default IBFT block time
    }
  }

  /**
   * Create unhealthy network response
   */
  private createUnhealthyNetwork(_reason: string): NetworkHealth {
    return {
      connected: false,
      peerCount: 0,
      blockNumber: 0,
      isSyncing: false,
      averageBlockTime: 0,
      lastChecked: new Date(),
      networkId: 0,
      nodeStatus: 'offline',
    };
  }

  /**
   * Generate confirmation number for voter
   */
  private generateConfirmationNumber(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `VN${result}`;
  }

  /**
   * Check if service is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Check if service account is configured (secure mode)
   */
  isServiceAccountSecure(): boolean {
    return this.isServiceAccountConfigured;
  }

  /**
   * Get service account address (without exposing key)
   */
  getServiceAccountAddress(): string | null {
    return this.config.serviceAccount || null;
  }

  /**
   * Get transaction configuration
   */
  getTransactionConfig(): { retries: number; confirmations: number } {
    return {
      retries: this.config.txRetries || 3,
      confirmations: this.config.txConfirmations || 1,
    };
  }

  /**
   * Get Web3 instance (for advanced operations)
   */
  getWeb3(): Web3 {
    return this.web3;
  }

  /**
   * Get vote contract instance
   */
  getVoteContract(): Web3Contract {
    return this.voteContract;
  }

  /**
   * Get key manager contract instance
   */
  getKeyManagerContract(): Web3Contract {
    return this.keyManagerContract;
  }
}
