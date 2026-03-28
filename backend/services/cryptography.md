# Cryptography Service

## Overview

This document details the cryptography service for encryption, hashing, and cryptographic operations.

---

## 1. Service Architecture

```typescript
// services/cryptography.service.ts
@Injectable()
export class CryptographyService {
  private hsmClient: HSMClient;
  private he: HEContext; // Homomorphic encryption context
  private zkp: ZKPGenerator;

  constructor(private readonly config: ConfigService) {
    this.initializeCryptography();
  }

  private async initializeCryptography() {
    // Initialize HSM connection
    this.hsmClient = new HSMClient({
      endpoint: this.config.get('hsm.endpoint'),
      apiKey: this.config.get('hsm.apiKey')
    });

    // Initialize homomorphic encryption
    this.he = await HEContext.create({
      scheme: 'BFV',
      polyModulusDegree: 4096,
      plainModulus: 536903681,
      coeffModulus: [
        0xFFFFFFFFFFC0001,
        0xFFFFFFFFFFC0001,
        0xFFFFFFFFFFC0001
      ]
    });

    // Initialize ZKP generator
    this.zkp = new ZKPGenerator();
  }
}
```

---

## 2. Encryption Layers

### 2.1 Data Encryption (AES-256-GCM)

```typescript
// Encrypt sensitive data at rest
async encryptData(plaintext: string, keyId?: string): Promise<EncryptedData> {
  // Get encryption key from HSM
  const key = await this.hsmClient.getKey(keyId || 'default-data-key');
  
  // Generate random IV
  const iv = crypto.randomBytes(12);
  
  // Encrypt
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  return {
    ciphertext: encrypted.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    keyId: key.keyId,
    algorithm: 'AES-256-GCM'
  };
}

// Decrypt data
async decryptData(encryptedData: EncryptedData): Promise<string> {
  const key = await this.hsmClient.getKey(encryptedData.keyId);
  
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    key,
    Buffer.from(encryptedData.iv, 'base64')
  );
  
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'base64'));
  
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData.ciphertext, 'base64')),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
}
```

### 2.2 Password Hashing (Argon2)

```typescript
// Hash password with Argon2
async hashPassword(password: string): Promise<PasswordHash> {
  const salt = crypto.randomBytes(16);
  
  const hash = await argon2.hash(password, {
    type: argon2.argon2id,
    salt,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
    hashLength: 32
  });
  
  return {
    hash,
    salt: salt.toString('base64'),
    algorithm: 'argon2id',
    iterations: 3
  };
}

// Verify password
async verifyPassword(password: string, passwordHash: PasswordHash): Promise<boolean> {
  return await argon2.verify(passwordHash.hash, password, {
    salt: Buffer.from(passwordHash.salt, 'base64')
  });
}
```

### 2.3 Token Encryption

```typescript
// Encrypt sensitive tokens
async encryptToken(payload: object): Promise<string> {
  const plaintext = JSON.stringify(payload);
  const key = await this.hsmClient.getKey('token-encryption-key');
  
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final()
  ]);
  
  const authTag = cipher.getAuthTag();
  
  // Combine IV + AuthTag + Ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString('base64');
}
```

---

## 3. Homomorphic Encryption

### 3.1 Vote Encryption

```typescript
// Encrypt vote for homomorphic tallying
interface VoteEncoding {
  position: string;
  candidateIndex: number;
  padding: number[];
}

async encryptVote(
  vote: VoteEncoding,
  electionPublicKey: string
): Promise<HEEncryptedVote> {
  // Convert vote to integer vector
  // Each position: 1 for selected candidate, 0 for others
  const voteVector = this.encodeVoteAsVector(vote);
  
  // Add random padding to prevent tallying attacks
  const paddedVector = this.addRandomPadding(voteVector);
  
  // Encrypt with HE public key
  const encrypted = await this.he.encrypt(paddedVector, electionPublicKey);
  
  return {
    ciphertext: encrypted.toBase64(),
    randomness: encrypted.getRandomness(),
    encoding: vote.encoding
  };
}

// Encode vote as integer vector for HE
private encodeVoteAsVector(vote: VoteEncoding): number[] {
  const vector = new Array(vote.totalCandidates).fill(0);
  vector[vote.candidateIndex] = 1;
  return vector;
}
```

### 3.2 Vote Tallying

```typescript
// Tally encrypted votes without decryption
async tallyVotes(
  encryptedVotes: HEEncryptedVote[]
): Promise<HEEncryptedResult> {
  // Start with zero ciphertext
  let result = await this.he.encryptZero();
  
  // Add all encrypted votes
  for (const vote of encryptedVotes) {
    result = await this.he.add(result, vote.ciphertext);
  }
  
  return {
    ciphertext: result.toBase64(),
    voteCount: encryptedVotes.length
  };
}

// Decrypt final tally (requires secure ceremony)
async decryptTally(
  encryptedResult: HEEncryptedResult,
  keyShares: KeyShare[]
): Promise<TallyResult> {
  // Multi-party computation for decryption
  const decrypted = await this.he.decryptWithShares(
    encryptedResult.ciphertext,
    keyShares
  );
  
  return {
    results: decrypted.map((value, index) => ({
      candidateIndex: index,
      votes: value
    })),
    totalVotes: encryptedResult.voteCount
  };
}
```

---

## 4. Zero-Knowledge Proofs

### 4.1 Vote Proof Generation

```typescript
// Generate ZKP that vote is valid without revealing choice
interface VoteProofInput {
  encryptedVote: string;
  voterPublicKey: string;
  electionPublicKey: string;
  voteEncoding: VoteEncoding;
}

async generateVoteProof(input: VoteProofInput): Promise<ZKPProof> {
  // Create proof that:
  // 1. Vote encodes valid selections (1 per position)
  // 2. Vote is within allowed range
  // 3. Vote was encrypted with election key
  
  const proof = await this.zkp.generate({
    statement: {
      ciphertext: input.encryptedVote,
      publicKey: input.electionPublicKey
    },
    witness: {
      vote: input.voteEncoding,
      randomness: input.voteEncoding.randomness
    },
    circuit: 'vote_validity'
  });
  
  return {
    proof: proof.toBase64(),
    publicSignals: proof.getPublicSignals()
  };
}
```

### 4.2 Proof Verification

```typescript
// Verify ZKP on blockchain or server
async verifyVoteProof(
  proof: ZKPProof,
  publicSignals: string[]
): Promise<boolean> {
  return await this.zkp.verify({
    proof: proof.proof,
    publicSignals,
    circuit: 'vote_validity'
  });
}
```

---

## 5. Key Management

### 5.1 Key Hierarchy

```
┌─────────────────────────────────────────────────────────────────────┐
│                    KEY HIERARCHY                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ROOT KEY (HSM - Offline)                                           │
│  └── ISSUER CA KEY (HSM)                                            │
│      ├── Data Encryption Key (DEK)                                  │
│      │   └── Encrypted by KEK                                       │
│      │                                                               │
│      ├── Token Encryption Key (TEK)                                │
│      │   └── Encrypted by KEK                                       │
│      │                                                               │
│      ├── Voter Key Derivation Master (VKD-M)                        │
│      │   └── Per-voter derived keys                                │
│      │                                                               │
│      └── Election Keys (Per Election)                               │
│          ├── HE Public Key (published)                             │
│          └── HE Private Key (M-of-N shares)                        │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Key Ceremony

```typescript
// Generate election keys through secure ceremony
interface KeyCeremonyParticipant {
  id: string;
  name: string;
  institution: string;
  publicKey: string;
}

async performKeyCeremony(
  participants: KeyCeremonyParticipant[],
  threshold: number
): Promise<ElectionKeySet> {
  // Each participant generates a key share
  const shares: KeyShare[] = [];
  
  for (const participant of participants) {
    const share = await this.hsmClient.generateKeyShare(participant.id);
    shares.push(share);
  }
  
  // Combine shares into public key
  const publicKey = await this.he.combinePublicKeys(
    shares.map(s => s.publicKey)
  );
  
  // Distribute private key shares (M-of-N)
  const distributedShares = this.distributeShares(shares, threshold);
  
  return {
    publicKey: publicKey.toBase64(),
    privateKeyShares: distributedShares,
    threshold,
    participants: participants.map(p => p.id)
  };
}
```

---

## 6. Hashing

### 6.1 Vote Hashing

```typescript
// Create deterministic hash of vote for verification
hashVote(encryptedVote: string): string {
  // Use SHA-256 for vote hash
  return crypto
    .createHash('sha256')
    .update(encryptedVote)
    .digest('hex');
}

// Create voter-specific vote hash
hashVoteForVoter(voterId: string, encryptedVote: string): string {
  return crypto
    .createHash('sha256')
    .update(voterId + encryptedVote)
    .digest('hex');
}
```

### 6.2 Data Integrity

```typescript
// Create integrity hash for data
createIntegrityHash(data: Record<string, any>): string {
  const sorted = JSON.stringify(data, Object.keys(data).sort());
  return crypto
    .createHash('sha256')
    .update(sorted)
    .digest('hex');
}

// Verify integrity
verifyIntegrityHash(data: Record<string, any>, expectedHash: string): boolean {
  const actualHash = this.createIntegrityHash(data);
  return crypto.timingSafeEqual(
    Buffer.from(actualHash),
    Buffer.from(expectedHash)
  );
}
```

---

## 7. Digital Signatures

### 7.1 Signing

```typescript
// Sign data with server key
async signData(data: string): Promise<DigitalSignature> {
  const key = await this.hsmClient.getKey('signing-key');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  sign.end();
  
  const signature = sign.sign(key);
  
  return {
    signature: signature.toString('base64'),
    algorithm: 'RSA-SHA256',
    keyId: key.keyId,
    timestamp: new Date()
  };
}
```

### 7.2 Verification

```typescript
// Verify signature
async verifySignature(
  data: string,
  signature: DigitalSignature,
  publicKey: string
): Promise<boolean> {
  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(data);
  verify.end();
  
  return verify.verify(publicKey, Buffer.from(signature.signature, 'base64'));
}
```

---

## 8. Cryptographic Constants

```typescript
// Cryptographic parameters
export const CRYPTO_PARAMS = {
  // Encryption
  AES: {
    algorithm: 'AES-256-GCM',
    ivLength: 12,
    keyLength: 32,
    tagLength: 16
  },
  
  // Hashing
  HASH: {
    algorithm: 'SHA-256',
    outputLength: 32
  },
  
  // Password hashing
  PASSWORD: {
    algorithm: 'argon2id',
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
    saltLength: 16
  },
  
  // Homomorphic encryption
  HE: {
    scheme: 'BFV',
    polyModulusDegree: 4096,
    plainModulus: 536903681,
    securityLevel: 128
  },
  
  // RSA
  RSA: {
    keyLength: 4096,
    algorithm: 'RSA-SHA256'
  }
};
```
