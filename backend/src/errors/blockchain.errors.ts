/**
 * Blockchain Service Custom Errors
 * 
 * Custom error classes for blockchain operations including
 * voter eligibility, transaction failures, and network errors.
 */

/**
 * Base blockchain error class
 */
export abstract class BlockchainError extends Error {
  public readonly code: string;
  public readonly timestamp: Date;

  constructor(message: string, code: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    
    // Maintains proper stack trace for where error was thrown (V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Convert error to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Error thrown when voter is not eligible to vote
 */
export class VoterNotEligibleError extends BlockchainError {
  public readonly reason: string;
  public readonly voterId: string;

  constructor(voterId: string, reason: string) {
    super(`Voter ${voterId} not eligible: ${reason}`, 'VOTER_NOT_ELIGIBLE');
    this.reason = reason;
    this.voterId = voterId;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      reason: this.reason,
      voterId: this.voterId,
    };
  }
}

/**
 * Error thrown when blockchain transaction fails
 */
export class TransactionFailedError extends BlockchainError {
  public readonly transactionHash: string;
  public readonly blockNumber?: number;
  public readonly gasUsed?: number;

  constructor(
    transactionHash: string, 
    reason?: string,
    details?: {
      blockNumber?: number;
      gasUsed?: number;
    }
  ) {
    super(
      `Transaction failed${reason ? `: ${reason}` : ''}: ${transactionHash}`, 
      'TX_FAILED'
    );
    this.transactionHash = transactionHash;
    this.blockNumber = details?.blockNumber;
    this.gasUsed = details?.gasUsed;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      transactionHash: this.transactionHash,
      blockNumber: this.blockNumber,
      gasUsed: this.gasUsed,
    };
  }
}

/**
 * Error thrown when network connection fails
 */
export class NetworkError extends BlockchainError {
  public readonly endpoint: string;
  public readonly retryable: boolean;

  constructor(
    message: string, 
    endpoint?: string,
    retryable: boolean = true
  ) {
    super(message, 'NETWORK_ERROR');
    this.endpoint = endpoint || 'unknown';
    this.retryable = retryable;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      endpoint: this.endpoint,
      retryable: this.retryable,
    };
  }
}

/**
 * Error thrown when smart contract call fails
 */
export class ContractError extends BlockchainError {
  public readonly contractName: string;
  public readonly method: string;
  public readonly parameters?: unknown[];

  constructor(
    contractName: string,
    method: string,
    message: string,
    parameters?: unknown[]
  ) {
    super(`Contract ${contractName}.${method} failed: ${message}`, 'CONTRACT_ERROR');
    this.contractName = contractName;
    this.method = method;
    this.parameters = parameters;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      contractName: this.contractName,
      method: this.method,
      parameters: this.parameters,
    };
  }
}

/**
 * Error thrown when proof verification fails
 */
export class ProofVerificationError extends BlockchainError {
  public readonly proofType: 'zkp' | 'signature' | 'merkle';

  constructor(proofType: 'zkp' | 'signature' | 'merkle', message: string) {
    super(`Proof verification failed (${proofType}): ${message}`, 'PROOF_VERIFICATION_FAILED');
    this.proofType = proofType;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      proofType: this.proofType,
    };
  }
}

/**
 * Error thrown when election is in invalid state for operation
 */
export class ElectionStateError extends BlockchainError {
  public readonly currentState: string;
  public readonly requiredState: string | string[];

  constructor(
    currentState: string, 
    requiredState: string | string[],
    operation: string
  ) {
    const required = Array.isArray(requiredState) 
      ? requiredState.join(' or ') 
      : requiredState;
    
    super(
      `Cannot perform ${operation} in "${currentState}" state. Required: ${required}`,
      'ELECTION_STATE_ERROR'
    );
    this.currentState = currentState;
    this.requiredState = requiredState;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      currentState: this.currentState,
      requiredState: this.requiredState,
    };
  }
}

/**
 * Error thrown when contract is not found or not deployed
 */
export class ContractNotFoundError extends BlockchainError {
  public readonly contractAddress: string;
  public readonly networkId: number;

  constructor(contractAddress: string, networkId: number) {
    super(
      `Contract not found at address ${contractAddress} on network ${networkId}`,
      'CONTRACT_NOT_FOUND'
    );
    this.contractAddress = contractAddress;
    this.networkId = networkId;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      contractAddress: this.contractAddress,
      networkId: this.networkId,
    };
  }
}

/**
 * Error thrown when key rotation is required
 */
export class KeyRotationRequiredError extends BlockchainError {
  public readonly lastRotation: Date;
  public readonly nextRotation: Date;

  constructor(lastRotation: Date, nextRotation: Date) {
    super(
      `Key rotation required. Last rotation: ${lastRotation.toISOString()}`,
      'KEY_ROTATION_REQUIRED'
    );
    this.lastRotation = lastRotation;
    this.nextRotation = nextRotation;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      lastRotation: this.lastRotation.toISOString(),
      nextRotation: this.nextRotation.toISOString(),
    };
  }
}

/**
 * Error thrown when authorization fails
 */
export class AuthorizationError extends BlockchainError {
  public readonly requiredRole: string;
  public readonly currentRole?: string;

  constructor(requiredRole: string, currentRole?: string) {
    super(
      `Authorization failed. Required role: ${requiredRole}${currentRole ? `, Current: ${currentRole}` : ''}`,
      'AUTHORIZATION_FAILED'
    );
    this.requiredRole = requiredRole;
    this.currentRole = currentRole;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      requiredRole: this.requiredRole,
      currentRole: this.currentRole,
    };
  }
}

/**
 * Error thrown when service account is not configured
 */
export class ServiceAccountNotConfiguredError extends BlockchainError {
  constructor() {
    super(
      'Blockchain service account is not configured. Set BLOCKCHAIN_SERVICE_ACCOUNT and BLOCKCHAIN_PRIVATE_KEY_ENCRYPTED or configure HSM.',
      'SERVICE_ACCOUNT_NOT_CONFIGURED'
    );
  }
}

/**
 * Error thrown when transaction nonce conflicts occur
 */
export class NonceConflictError extends BlockchainError {
  public readonly currentNonce: number;
  public readonly expectedNonce: number;

  constructor(currentNonce: number, expectedNonce: number) {
    super(
      `Nonce conflict: expected ${expectedNonce}, got ${currentNonce}. Transaction may have been replaced.`,
      'NONCE_CONFLICT'
    );
    this.currentNonce = currentNonce;
    this.expectedNonce = expectedNonce;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      currentNonce: this.currentNonce,
      expectedNonce: this.expectedNonce,
    };
  }
}

/**
 * Error thrown when transaction confirmation fails
 */
export class TransactionConfirmationError extends BlockchainError {
  public readonly transactionHash: string;
  public readonly attempts: number;
  public readonly lastError?: string;

  constructor(
    transactionHash: string,
    attempts: number,
    lastError?: string
  ) {
    super(
      `Transaction ${transactionHash} failed to confirm after ${attempts} attempts${lastError ? `: ${lastError}` : ''}`,
      'TX_CONFIRMATION_FAILED'
    );
    this.transactionHash = transactionHash;
    this.attempts = attempts;
    this.lastError = lastError;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      transactionHash: this.transactionHash,
      attempts: this.attempts,
      lastError: this.lastError,
    };
  }
}

/**
 * Error thrown when all transaction retries are exhausted
 */
export class TransactionRetriesExhaustedError extends BlockchainError {
  public readonly attempts: number;
  public readonly lastError: string;
  public readonly transactionHash?: string;

  constructor(attempts: number, lastError: string, transactionHash?: string) {
    super(
      `Transaction failed after ${attempts} retry attempts: ${lastError}`,
      'TX_RETRIES_EXHAUSTED'
    );
    this.attempts = attempts;
    this.lastError = lastError;
    this.transactionHash = transactionHash;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      attempts: this.attempts,
      lastError: this.lastError,
      transactionHash: this.transactionHash,
    };
  }
}

/**
 * Error thrown when HSM operation fails
 */
export class HSMError extends BlockchainError {
  public readonly hsmEndpoint?: string;
  public readonly keyId?: string;

  constructor(message: string, hsmEndpoint?: string, keyId?: string) {
    super(`HSM error: ${message}`, 'HSM_ERROR');
    this.hsmEndpoint = hsmEndpoint;
    this.keyId = keyId;
  }

  toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      hsmEndpoint: this.hsmEndpoint,
      keyId: this.keyId,
    };
  }
}

/**
 * Error thrown when key decryption fails
 */
export class KeyDecryptionError extends BlockchainError {
  constructor(reason: string) {
    super(`Failed to decrypt service account key: ${reason}`, 'KEY_DECRYPTION_FAILED');
  }
}
