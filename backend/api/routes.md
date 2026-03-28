# API Routes

## Overview

This document details all API routes organized by domain.

---

## 1. Authentication Routes

### POST /api/v1/auth/login

Login with credentials.

**Request:**
```json
{
  "nationalId": "12345678",
  "password": "securePassword123!",
  "userType": "voter" // voter | ro | admin
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900,
    "requiresMfa": true
  }
}
```

### POST /api/v1/auth/mfa/verify

Verify MFA challenge.

**Request:**
```json
{
  "userId": "voter_123",
  "mfaType": "biometric", // biometric | totp
  "mfaData": {
    "faceTemplate": "base64...",
    "fingerprintTemplate": "base64..."
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "verified": true,
    "sessionId": "session_abc123"
  }
}
```

### POST /api/v1/auth/refresh

Refresh access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 900
  }
}
```

### POST /api/v1/auth/logout

Logout and invalidate session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

## 2. Voter Routes

### POST /api/v1/voters/register

Register a new voter.

**Request:**
```json
{
  "nationalId": "12345678",
  "firstName": "John",
  "lastName": "Doe",
  "dateOfBirth": "1990-01-15",
  "county": "Nairobi",
  "constituency": "Kasarani",
  "ward": "Mwiki",
  "phoneNumber": "+254712345678",
  "email": "john.doe@email.com"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "voterId": "voter_abc123",
    "status": "pending_biometrics",
    "message": "Please complete biometric enrollment"
  }
}
```

### GET /api/v1/voters/:id

Get voter information.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "voterId": "voter_abc123",
    "nationalId": "12345678",
    "firstName": "John",
    "lastName": "Doe",
    "county": "Nairobi",
    "constituency": "Kasarani",
    "status": "verified",
    "registeredAt": "2024-01-15T10:00:00Z"
  }
}
```

### PUT /api/v1/voters/:id

Update voter information.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "phoneNumber": "+254798765432",
  "email": "newemail@email.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "voterId": "voter_abc123",
    "updated": true
  }
}
```

### POST /api/v1/voters/:id/biometrics/enroll

Enroll voter biometrics.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "faceImage": "base64_encoded_image",
  "faceLivenessToken": "liveness_proof",
  "fingerprintImages": {
    "leftThumb": "base64...",
    "rightThumb": "base64..."
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "enrolled": true,
    "faceEnrolled": true,
    "fingerprintEnrolled": true
  }
}
```

### GET /api/v1/voters/:id/status

Get voter verification status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "voterId": "voter_abc123",
    "status": "verified",
    "idVerified": true,
    "faceEnrolled": true,
    "fingerprintEnrolled": true,
    "verifiedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 3. Candidate Routes

### GET /api/v1/candidates

List candidates with filters.

**Query Parameters:**
- `position` (optional): presidential | governor | senator | mp | mca
- `county` (optional): County name
- `status` (optional): approved | pending | rejected
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200):**
```json
{
  "success": true,
  "data": {
    "candidates": [
      {
        "candidateId": "candidate_123",
        "fullName": "Jane Doe",
        "position": "president",
        "party": "Party A",
        "photo": "base64...",
        "county": null,
        "status": "approved"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150
    }
  }
}
```

### POST /api/v1/candidates

Create a new candidate (RO or Admin only).

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "fullName": "Jane Doe",
  "dateOfBirth": "1980-05-20",
  "position": "governor",
  "county": "Nairobi",
  "party": "Party A",
  "photo": "base64...",
  "manifesto": "My vision for Nairobi...",
  "highlights": [
    "Infrastructure development",
    "Healthcare improvement"
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "candidateId": "candidate_456",
    "status": "pending",
    "message": "Pending approval"
  }
}
```

### GET /api/v1/candidates/:id

Get candidate details.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "candidateId": "candidate_456",
    "fullName": "Jane Doe",
    "position": "governor",
    "county": "Nairobi",
    "party": "Party A",
    "photo": "base64...",
    "manifesto": "My vision...",
    "status": "approved",
    "approvedBy": "admin_123",
    "approvedAt": "2024-01-20T10:00:00Z"
  }
}
```

### PUT /api/v1/candidates/:id/approve

Approve a candidate (Admin only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "candidateId": "candidate_456",
    "status": "approved",
    "approvedAt": "2024-01-20T10:00:00Z"
  }
}
```

---

## 4. Vote Routes

### GET /api/v1/votes/ballot

Get ballot for voter.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ballotId": "ballot_abc123",
    "electionId": "election_2024",
    "positions": [
      {
        "position": "president",
        "candidates": [
          {
            "candidateId": "candidate_1",
            "fullName": "Candidate A",
            "photo": "base64..."
          },
          {
            "candidateId": "candidate_2", 
            "fullName": "Candidate B",
            "photo": "base64..."
          }
        ]
      },
      {
        "position": "governor",
        "county": "Nairobi",
        "candidates": [...]
      }
    ]
  }
}
```

### POST /api/v1/votes/cast

Cast a vote.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "ballotId": "ballot_abc123",
  "encryptedVote": "base64_encrypted_vote",
  "zkProof": "base64_zk_proof",
  "batchId": "batch_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "confirmationId": "confirm_xyz789",
    "voteHash": "sha256_of_vote",
    "timestamp": "2024-01-20T10:30:00Z",
    "message": "Vote recorded successfully"
  }
}
```

### GET /api/v1/votes/confirmation/:id

Get vote confirmation.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "confirmationId": "confirm_xyz789",
    "voteHash": "sha256_of_vote",
    "timestamp": "2024-01-20T10:30:00Z",
    "status": "confirmed",
    "blockchainTxHash": "0xabc123..."
  }
}
```

### GET /api/v1/votes/status/:voterId

Check if voter has cast a vote.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "hasVoted": true,
    "votedAt": "2024-01-20T10:30:00Z",
    "confirmationId": "confirm_xyz789"
  }
}
```

---

## 5. Batch Routes (Smart Group-Based Voting)

### POST /api/v1/batches/join

Join a voting batch.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_123",
    "assignedPosition": 456,
    "estimatedWait": 30,
    "batchSize": 1000,
    "currentVoters": 750
  }
}
```

### POST /api/v1/batches/:id/vote

Submit vote to batch.

**Request:**
```json
{
  "encryptedVote": "base64...",
  "zkProof": "base64..."
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "queued": true,
    "queuePosition": 12,
    "estimatedConfirmation": 15
  }
}
```

### GET /api/v1/batches/:id/status

Get batch status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_123",
    "status": "active", // waiting | active | submitting | completed
    "totalVoters": 1000,
    "currentVoters": 850,
    "votesCollected": 800,
    "timeRemaining": 45
  }
}
```

### POST /api/v1/batches/heartbeat

Send heartbeat to keep batch position.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "heartbeatReceived": true,
    "positionSecured": true
  }
}
```

### POST /api/v1/batches/:id/leave

Leave current batch.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Removed from batch",
    "canRejoin": true
  }
}
```

---

## 6. Admin Routes

### Returning Officer Applications

#### POST /api/v1/admin/ro/applications

Submit RO application.

**Request:**
```json
{
  "fullName": "John Smith",
  "nationalId": "87654321",
  "email": "john.smith@email.com",
  "phoneNumber": "+254712345678",
  "preferredCounty1": "Nairobi",
  "preferredCounty2": "Mombasa",
  "educationLevel": "Bachelor's Degree",
  "previousExperience": "5 years in public service",
  "documents": [
    {
      "type": "id_copy",
      "data": "base64..."
    },
    {
      "type": "certificate",
      "data": "base64..."
    }
  ]
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_123",
    "status": "submitted",
    "message": "Application submitted.等待审批."
  }
}
```

#### GET /api/v1/admin/ro/applications

List RO applications (Admin only).

**Query Parameters:**
- `status` (optional): submitted | under_review | approved | rejected
- `county` (optional): Filter by preferred county
- `page`, `limit`: Pagination

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "applicationId": "app_123",
        "fullName": "John Smith",
        "preferredCounty1": "Nairobi",
        "status": "submitted",
        "submittedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 20, "total": 50 }
  }
}
```

#### PUT /api/v1/admin/ro/applications/:id

Review RO application.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "action": "approve", // approve | reject
  "assignedCounty": "Nairobi",
  "notes": "Approved based on qualifications"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_123",
    "status": "approved",
    "assignedCounty": "Nairobi",
    "reviewedAt": "2024-01-20T10:00:00Z"
  }
}
```

### County Management

#### POST /api/v1/admin/counties

Add a new county (Super Admin only).

**Request:**
```json
{
  "countyCode": "047",
  "countyName": "Nairobi",
  "region": "Central",
  "population": 4500000,
  "constituencies": 17,
  "wards": 85
}
```

#### GET /api/v1/admin/counties

List all counties.

### Presidential Candidates

#### POST /api/v1/admin/presidential

Add presidential candidate (Super Admin only).

**Request:**
```json
{
  "fullName": "Candidate Name",
  "dateOfBirth": "1960-01-01",
  "party": "Party Name",
  "photo": "base64...",
  "manifesto": "Campaign promises...",
  "deputyName": "Deputy Name"
}
```

---

## 7. Reporting Routes

### GET /api/v1/reports/results

Get election results.

**Query Parameters:**
- `level` (optional): national | county | constituency
- `position` (optional): Filter by position

**Response (200):**
```json
{
  "success": true,
  "data": {
    "electionId": "election_2024",
    "position": "president",
    "totalVotes": 15000000,
    "results": [
      {
        "candidateId": "candidate_1",
        "candidateName": "Candidate A",
        "party": "Party A",
        "votes": 7500000,
        "percentage": 50.0
      }
    ],
    "timestamp": "2024-01-25T18:00:00Z"
  }
}
```

### GET /api/v1/reports/turnout

Get voter turnout statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRegistered": 20000000,
    "totalVoted": 15000000,
    "turnoutPercentage": 75.0,
    "byCounty": [
      {
        "county": "Nairobi",
        "registered": 3000000,
        "voted": 2400000,
        "turnout": 80.0
      }
    ]
  }
}
```

### GET /api/v1/reports/audit

Get audit report (Admin only).

**Response (200):**
```json
{
  "success": true,
  "data": {
    "reportId": "audit_2024",
    "generatedAt": "2024-01-25T18:00:00Z",
    "totalVotes": 15000000,
    "blockchainConfirmations": 15000000,
    "integrityCheck": "passed",
    "hashChain": "valid"
  }
}
```

---

## 8. Health & System Routes

### GET /api/health

System health check.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 86400,
    "timestamp": "2024-01-20T10:00:00Z"
  }
}
```

### GET /api/v1/blockchain/status

Blockchain network status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "network": "private",
    "connectedNodes": 50,
    "blockHeight": 12345,
    "lastBlockTime": "2024-01-20T10:00:00Z",
    "pendingTransactions": 100
  }
}
```
