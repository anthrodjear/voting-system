# Voter Registration

## Overview

Complete voter registration with biometric capture. This page guides voters through the entire registration process including identity verification, biometric enrollment (face + fingerprints), and account setup.

---

## 1. Registration Steps

1. **National ID Verification** - Verify Kenya National ID card
2. **Personal Information** - Capture name, gender, date of birth, county, constituency, ward
3. **Biometric Enrollment** - Face capture with liveness detection + fingerprint scanning
4. **Password Setup** - Create secure account password
5. **Confirmation** - Review and submit registration

---

## 2. Registration Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VOTER REGISTRATION FLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   STEP 1: ID VERIFICATION                                           │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Enter   │───>│  Validate │───>│  Fetch    │                   │
│   │  National│    │  Format   │    │  NIIF     │                   │
│   │  ID      │    │  Check    │    │  Data     │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                            │                        │
│   STEP 2: PERSONAL INFO                     │                        │
│   ┌──────────┐    ┌───────────┐    ┌───────▼──────┐               │
│   │  Auto-   │───>│  Select   │───>│  Verify     │               │
│   │  Fill    │    │  Location │    │  Details    │               │
│   │  from    │    │  (County/ │    │  Complete   │               │
│   │  NIIF    │    │  Constit/ │    │             │               │
│   │          │    │  Ward)    │    │             │               │
│   └──────────┘    └───────────┘    └─────────────┘               │
│                                            │                        │
│   STEP 3: BIOMETRICS                       │                        │
│   ┌──────────┐    ┌───────────┐    ┌───────▼──────┐               │
│   │  Face   │───>│ Liveness  │───>│ Fingerprint │               │
│   │  Capture│    │ Detection │    │    Scan     │               │
│   │  (3D    │    │ (Blink,   │    │  (10 fingers│               │
│   │  Map)   │    │  Smile)   │    │   with      │               │
│   │          │    │           │    │  quality    │               │
│   │          │    │           │    │  check)     │               │
│   └──────────┘    └───────────┘    └─────────────┘               │
│                                            │                        │
│   STEP 4: ACCOUNT                           │                        │
│   ┌──────────┐    ┌───────────┐    ┌───────▼──────┐               │
│   │  Create  │───>│  Set      │───>│  Save       │               │
│   │  Password│    │  Security │    │  Credentials│               │
│   │          │    │  Questions│    │             │               │
│   └──────────┘    └───────────┘    └─────────────┘               │
│                                            │                        │
│   STEP 5: CONFIRMATION                      │                        │
│   ┌──────────┐    ┌───────────┐    ┌───────▼──────┐               │
│   │  Review  │───>│  Submit   │───>│  Registration│               │
│   │  All     │    │  Data     │    │  Complete!   │               │
│   │  Details │    │           │    │             │               │
│   └──────────┘    └───────────┘    └─────────────┘               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Page Components

### 3.1 ID Verification Section
- **NationalIDInput**: Text input for 8-digit and newer 14 digits National ID
- **IDFormatValidator**: Real-time format validation (regex: `^[0-9]{8}$`)
- **NIIFIntegration**: Fetch voter data from NIIF database
- **ExistingVoterCheck**: Check if already registered

### 3.2 Personal Information Section
- **AutoFillDisplay**: Show fetched NIIF data (name, DOB, gender)
- **LocationSelector**: 
  - County dropdown (47 counties)
  - Constituency dropdown (290 constituencies)
  - Ward dropdown (1,450 wards)
- **ManualEntryToggle**: Allow manual correction of NIIF data

### 3.3 Biometric Enrollment Section
- **FaceCapture**: 
  - WebRTC camera access
  - 3D face map generation using face-api.js
  - Liveness detection (blink, smile, turn head)
  - Quality score threshold: 0.85
- **FingerprintScanner**:
  - WebAuthn integration or DigitalPersona SDK
  - Scan all 10 fingers
  - Minimum 3 fingers required
  - Quality check: 500 DPI minimum

### 3.4 Account Setup Section
- **PasswordRequirements**:
  - Minimum 12 characters
  - At least 1 uppercase, 1 lowercase, 1 number, 1 special char
  - No common passwords (HaveIBeenPwned check)
- **SecurityQuestions**: Select 3 questions, provide answers

### 3.5 Confirmation Section
- **RegistrationSummary**: Display all entered data
- **TermsAcceptance**: Required checkbox for terms
- **SubmitButton**: Disabled until all validations pass

---

## 4. API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/voters/check-id/:nationalId` | GET | Check if ID already registered |
| `/api/v1/voters/niif-lookup` | POST | Fetch voter data from NIIF |
| `/api/v1/voters/register` | POST | Submit voter registration |
| `/api/v1/voters/upload-face` | POST | Upload face biometric |
| `/api/v1/voters/upload-fingerprints` | POST | Upload fingerprint data |

---

## 5. State Management

```typescript
// Voter Registration State
interface VoterRegistrationState {
  step: number; // 1-5
  nationalId: string;
  niifData: NIIFResponse | null;
  personalInfo: {
    firstName: string;
    lastName: string;
    gender: 'M' | 'F';
    dateOfBirth: Date;
    county: string;
    constituency: string;
    ward: string;
  };
  biometrics: {
    faceCapture: FaceTemplate | null;
    fingerprints: FingerprintTemplate[];
    livenessVerified: boolean;
  };
  account: {
    password: string;
    securityQuestions: SecurityAnswer[];
  };
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
}
```

---

## 6. Error Handling

| Error | User Message | Recovery Action |
|-------|--------------|-----------------|
| Invalid ID format | "National ID must be 8 digits" | Highlight input field |
| ID already registered | "This ID is already registered" | Show login link |
| NIIF lookup failed | "Could not verify ID with government database" | Allow manual entry |
| Face capture failed | "Face not clearly visible. Please ensure good lighting" | Retry capture |
| Liveness check failed | "Please complete the liveness check" | Restart liveness |
| Fingerprint low quality | "Fingerprint unclear. Please press firmly" | Rescan finger |
| Password too weak | "Password does not meet requirements" | Show requirements |

---

## 7. Security Considerations

- **NIIF Data**: Fetch via secure API with encryption
- **Biometrics**: Templates encrypted at rest (AES-256)
- **Session**: 30-minute timeout with auto-logout
- **Rate Limiting**: 3 registration attempts per IP per hour
- **Audit Log**: Every registration attempt logged with IP, timestamp
