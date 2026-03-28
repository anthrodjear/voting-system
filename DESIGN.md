# Design Document

## Blockchain Voting System

---

## 1. Design Philosophy

### 1.1 Core Principles

| Principle | Description |
|-----------|-------------|
| **Security First** | Every design decision prioritizes security and integrity |
| **Privacy by Design** | Voter choice remains confidential through cryptography |
| **Transparency** | Anyone can verify results without compromising privacy |
| **Scalability** | Handle 20M+ voters with 5,000 votes/second throughput |
| **Resilience** | Graceful degradation under load, offline support |

### 1.2 Design Goals

1. Prevent vote manipulation
2. Ensure voter anonymity
3. Maintain system availability during peak loads
4. Provide verifiable results
5. Support 47 counties with hierarchical governance

---

## 2. Hybrid Blockchain Architecture

### 2.1 Overview

The system uses a **hybrid blockchain** approach combining:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HYBRID BLOCKCHAIN ARCHITECTURE                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │              PRIVATE LAYER (Permissioned)                   │   │
│   │   Who: IEBC Servers, 47 County RO Nodes                     │   │
│   │   Purpose: Voter Validation, Vote Casting                    │   │
│   │   Data: Voter eligibility, encrypted votes                  │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                              │                                     │
│                              ▼                                     │
│   ┌─────────────────────────────────────────────────────────────┐   │
│   │               PUBLIC LAYER (Transparent)                    │   │
│   │   Who: Media, Observers, Public                             │   │
│   │   Purpose: Results Transparency, Verifiability              │   │
│   │   Data: Encrypted votes, final tallies, proofs             │   │
│   └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Private Layer

| Component | Details |
|-----------|---------|
| **Network** | Permissioned consortium |
| **Validators** | 47 County RO Nodes + IEBC HQ |
| **Consensus** | IBFT 2.0 (Proof of Authority) |
| **Purpose** | Voter eligibility verification, vote recording |

**Node Distribution:**
- 47 County Nodes (one per county)
- 3 IEBC Observer Nodes
- 1 Archive Node (long-term storage)

### 2.3 Public Layer

| Component | Details |
|-----------|---------|
| **Network** | Public blockchain (observer nodes) |
| **Access** | Read-only for anyone |
| **Data** | Encrypted votes, final tallies, ZK proofs |
| **Purpose** | Transparency, verifiability |

### 2.4 Data Separation

```
VOTER DATA (Private Layer):
├── National ID
├── Biometric templates (encrypted)
├── Registration status
└── Vote eligibility

VOTE DATA (Public Layer):
├── Encrypted ballot (homomorphic)
├── Zero-knowledge proof
├── Timestamp
└── Final tally (after decryption)
```

---

## 3. Smart Group-Based Voting Design

### 3.1 Concept Overview

Smart Group-Based Voting handles high concurrency through dynamic batch processing:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BATCH ORCHESTRATION SYSTEM                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐               │
│   │  BATCH 001  │   │  BATCH 002  │   │  BATCH N    │               │
│   │ 950/1000    │   │ 1000/1000   │   │  750/1000   │               │
│   │ ACTIVE      │   │ FULL        │   │  ACTIVE     │               │
│   └─────────────┘   └─────────────┘   └─────────────┘               │
│         │                  │                  │                      │
│         └──────────────────┼──────────────────┘                      │
│                            ▼                                         │
│               ┌─────────────────────────┐                           │
│               │     VOTE POOL           │                           │
│               │  (Aggregation Buffer)   │                           │
│               │  Batches every 5 sec    │                           │
│               └─────────────────────────┘                           │
│                            │                                         │
│                            ▼                                         │
│               ┌─────────────────────────┐                           │
│               │     MIXNET               │                           │
│               │  (Anonymization)         │                           │
│               └─────────────────────────┘                           │
│                            │                                         │
│                            ▼                                         │
│               ┌─────────────────────────┐                           │
│               │    BLOCKCHAIN            │                           │
│               │  (Immutable Storage)     │                           │
│               └─────────────────────────┘                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 Batch Processing Flow

```
1. VOTER LOGIN
   └── ID + Password → MFA → Batch Assignment

2. BATCH ASSIGNMENT
   └── System assigns voter to batch with available capacity
   └── Batch size: 1,000 voters max
   └── Idle timeout: 120 seconds

3. VOTING SESSION
   └── Voter receives ballot notification
   └── Makes selections
   └── Client-side encryption

4. VOTE SUBMISSION
   └── Vote → Vote Pool (buffer)
   └── Batch continues until full OR timeout

5. AGGREGATION
   └── Vote Pool → Batch to blockchain
   └── Every 5 seconds OR 1,000 votes

6. BLOCKCHAIN SUBMISSION
   └── Mixnet anonymization
   └── Encrypted vote → Blockchain
   └── Confirmation to voter
```

### 3.3 Dynamic Batch Management

| State | Behavior |
|-------|----------|
| **Voter Joins** | Assigned to smallest active batch |
| **Voter Active** | Stays in batch, timer resets |
| **Voter Idle >120s** | Moved to pending queue, notified |
| **Batch Full** | Close batch, submit to pool |
| **Batch Timeout** | Submit partial batch to pool |

### 3.4 Offline Support

```
┌─────────────────────────────────────────────────────────────────────┐
│                    OFFLINE VOTING FLOW                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ONLINE STATE:                                                       │
│  1. Voter authenticates (ID + Password + Biometrics)                │
│  2. Assigned to batch                                               │
│  3. Can vote normally                                              │
│                                                                      │
│  OFFLINE STATE (Limited - < 60 seconds):                            │
│  1. Connection lost                                                │
│  2. Vote encrypted locally with election public key                 │
│  3. Stored in secure device storage                                 │
│  4. Connection restored                                            │
│  5. Vote submitted from local cache                                 │
│  6. Confirmed → Auto-purge local data                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.5 Throughput Calculations

| Metric | Value | Notes |
|--------|-------|-------|
| Target voters | 20M+ | Full electorate |
| Throughput | 5,000/sec | Peak rate |
| Batch size | 1,000 | Max voters/batch |
| Batch duration | ~12 sec | At peak throughput |
| Vote pool flush | 5 sec | Or 1,000 votes |
| Blockchain blocks | 30/min | 2-second block time |

**Peak Load Handling:**
- 5,000 voters/sec × 60 sec = 300,000 voters/minute
- 20M voters ÷ 300,000/min = ~67 minutes total voting time

---

## 4. Cryptography Design

### 4.1 Encryption Layers

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ENCRYPTION LAYERS                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  LAYER 1: TRANSPORT (TLS 1.3)                                       │
│  └── All client-server communication encrypted                      │
│                                                                      │
│  LAYER 2: APPLICATION (AES-256-GCM)                               │
│  └── Sensitive data at rest (biometrics, PII)                       │
│                                                                      │
│  LAYER 3: VOTING (Homomorphic Encryption)                          │
│  └── Votes encrypted, can be tallied without decryption            │
│                                                                      │
│  LAYER 4: PROOFS (Zero-Knowledge)                                   │
│  └── Prove vote validity without revealing choice                  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Key Management

| Key Type | Storage | Rotation |
|----------|---------|----------|
| Root CA | HSM (offline) | 20 years |
| Intermediate CA | HSM | 10 years |
| Server Certificates | HSM | 2 years |
| Election Key (HE) | HSM (M-of-N) | Per election |
| Voter Keys | Derived | Per session |

### 4.3 Homomorphic Encryption

- **Library**: PALISADE or Microsoft SEAL
- **Scheme**: BFV (Brakerski-Fan-Vercauteren)
- **Security Level**: 128-bit
- **Operations**: Addition (for tallying)

### 4.4 Zero-Knowledge Proofs

- **Purpose**: Prove vote is valid without revealing choice
- **Scheme**: zk-SNARKs or Bulletproofs
- **Verification**: On-chain (smart contract)

---

## 5. Security Architecture

### 5.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| Vote tampering | Blockchain immutability, cryptographic signatures |
| Voter impersonation | Multi-factor biometrics (face + fingerprint) |
| Server compromise | HSM for keys, encryption at rest |
| MITM attacks | Certificate pinning, TLS 1.3 |
| DDoS | Rate limiting, CDN, load balancing |
| Insider threat | Separation of duties, multi-party authorization |

### 5.2 Defense in Depth

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  PERIMETER:                                                         │
│  └── WAF, DDoS protection, IP filtering                            │
│                                                                      │
│  NETWORK:                                                           │
│  └── VPC, private subnets, security groups                         │
│                                                                      │
│  APPLICATION:                                                       │
│  └── Authentication, authorization, input validation               │
│                                                                      │
│  DATA:                                                              │
│  └── Encryption, tokenization, access controls                     │
│                                                                      │
│  CRYPTOGRAPHY:                                                      │
│  └── Keys in HSM, multi-party key custody                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 6. Data Flow Diagrams

### 6.1 Voter Registration

```
Voter                    Backend                  Blockchain
  │                         │                         │
  │ 1. Enter National ID   │                         │
  │───────────────────────>│                         │
  │                        │                         │
  │                    Verify ID format            │
  │                    Check uniqueness           │
  │                        │                         │
  │ 2. Capture Face       │                         │
  │───────────────────────>│                         │
  │                        │ Liveness detection     │
  │                        │ Extract face template  │
  │                        │ Encrypt & store        │
  │                        │                         │
  │ 3. Capture Fingerprint│                         │
  │───────────────────────>│                         │
  │                        │ Extract minutiae       │
  │                        │ Encrypt & store        │
  │                        │                         │
  │ 4. Set Password       │                         │
  │───────────────────────>│ Hash & store          │
  │                        │                         │
  │ 5. Registration       │                         │
  │   Confirmed           │<───────────────────────│
  │<──────────────────────│                         │
  │                        │                         │
```

### 6.2 Voting Process

```
Voter              Batch Mgr      Vote Pool      Mixnet      Blockchain
  │                    │              │              │              │
  │ 1. Login + MFA    │              │              │              │
  │──────────────────>│              │              │              │
  │                   │              │              │              │
  │ 2. Assigned Batch │              │              │              │
  │<──────────────────│              │              │              │
  │                   │              │              │              │
  │ 3. Vote          │              │              │              │
  │─────────────────>│              │              │              │
  │              Encrypt (client)   │              │              │
  │                   │              │              │              │
  │                   │ 4. Submit to Vote Pool    │              │
  │                   │─────────────>│              │              │
  │                   │              │              │              │
  │                   │              │ 5. Aggregate │              │
  │                   │              │──────────────>│              │
  │                   │              │              │              │
  │                   │              │    6. Mix    │              │
  │                   │              │──────────────>│              │
  │                   │              │              │              │
  │                   │              │              │ 7. Submit   │
  │                   │              │              │─────────────>│
  │                   │              │              │              │
  │ 8. Confirmation  │              │              │              │
  │<─────────────────│              │              │              │
  │                   │              │              │              │
```

---

## 7. Consensus Mechanism

### 7.1 IBFT 2.0 (Proof of Authority)

| Parameter | Value |
|-----------|-------|
| Consensus | IBFT 2.0 |
| Block Time | 2 seconds |
| Block Size | 2 MB |
| Validators | 47 County + IEBC |
| Finality | Immediate |

### 7.2 Validator Distribution

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VALIDATOR NETWORK                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   IEBC HQ (Nairobi) - 3 validators                                 │
│   ├── Validator 1 (Primary)                                         │
│   ├── Validator 2 (Backup)                                          │
│   └── Validator 3 (Archive)                                         │
│                                                                      │
│   47 Counties - 1 validator each                                    │
│   ├── Nairobi County                                                │
│   ├── Mombasa County                                                │
│   ├── Kisumu County                                                 │
│   └── ... (45 more)                                                 │
│                                                                      │
│   Total: 50 validators                                              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 8. Scalability Considerations

### 8.1 Horizontal Scaling

| Component | Scaling Strategy |
|-----------|------------------|
| API Servers | Kubernetes auto-scaling |
| Database | Read replicas + sharding |
| Redis Cache | Cluster mode |
| Blockchain | Multiple validator nodes |
| Batch Manager | Stateless, load balanced |

### 8.2 Performance Targets

| Metric | Target |
|--------|--------|
| Vote submission | < 2 seconds |
| Voter verification | < 3 seconds |
| Registration | < 10 seconds |
| API response (p95) | < 500ms |
| Uptime | 99.9% |

---

## 9. Compliance & Audit

### 9.1 Regulatory Compliance

- Kenya Data Protection Act
- IEBC Technical Standards
- Election Act Provisions

### 9.2 Audit Requirements

- All operations logged
- Immutable audit trail
- Multi-party authorization for sensitive operations
- Regular security audits

---

## 10. Disaster Recovery

| Metric | Value |
|--------|-------|
| RTO (Recovery Time) | 4 hours |
| RPO (Recovery Point) | 1 hour |
| Backup Frequency | Hourly |
| Disaster Site | Secondary region |

---

## 11. Dependencies

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20 LTS |
| Framework | NestJS |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Blockchain | Hyperledger Besu |
| Smart Contracts | Solidity 0.8.x |
| Encryption | PALISADE / SEAL |
| Frontend | React / Next.js |
| Container | Docker / Kubernetes |

---

## 12. Summary

This design balances:

1. **Security**: Multi-layer encryption, biometrics, blockchain immutability
2. **Privacy**: Homomorphic encryption, ZK proofs, mixnets
3. **Scalability**: Smart batching, horizontal scaling, async processing
4. **Transparency**: Public blockchain layer, verifiable results
5. **Resilience**: Offline support, disaster recovery, high availability

The hybrid blockchain approach with smart group-based voting provides the foundation for a secure, scalable, and verifiable electoral system.
