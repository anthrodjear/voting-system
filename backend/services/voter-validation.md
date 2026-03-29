# Voter Validation Service

## Overview

This document details the voter validation service for biometric verification and identity confirmation.

---

## 1. Service Architecture

```typescript
// services/voter-validation.service.ts
@Injectable()
export class VoterValidationService {
  private biometricEngine: BiometricEngine;
  private livenessDetector: LivenessDetector;
  private idVerifier: IDVerifier;

  constructor(
    private readonly config: ConfigService,
    private readonly voterRepository: VoterRepository
  ) {
    this.initializeBiometricEngine();
  }

  private initializeBiometricEngine() {
    // Initialize face recognition
    this.biometricEngine = new BiometricEngine({
      face: {
        model: 'arcface',
        threshold: 0.85,
        deviceBinding: true
      },
      fingerprint: {
        algorithm: 'mindtct',
        threshold: 0.90,
        fingers: ['leftThumb', 'rightThumb']
      }
    });

    // Initialize liveness detection
    this.livenessDetector = new LivenessDetector({
      method: 'passive',
      challengeTypes: ['blink', 'smile', 'turn']
    });

    // Initialize ID verification
    this.idVerifier = new IDVerifier({
      country: 'KE',
      documentType: 'national_id'
    });
  }
}
```

---

## 2. National ID Verification

### 2.1 ID Format Validation

```typescript
// Validate Kenyan National ID format
validateNationalIdFormat(nationalId: string): ValidationResult {
  // Format: 8 digits and 14 digits
  const formatRegex = /^[0-9]{8}{14}$/;
  
  if (!formatRegex.test(nationalId)) {
    return {
      valid: false,
      error: 'Invalid ID format. Must be 8 or 14 digits.'
    };
  }

  // Extract and validate birth year
  const birthYearPrefix = parseInt(nationalId.substring(0, 2));
  const currentYear = new Date().getFullYear() % 100;
  
  let fullBirthYear: number;
  if (birthYearPrefix <= currentYear) {
    fullBirthYear = 2000 + birthYearPrefix;
  } else {
    fullBirthYear = 1900 + birthYearPrefix;
  }

  // Calculate age
  const age = new Date().getFullYear() - fullBirthYear;
  
  if (age < 18) {
    return {
      valid: false,
      error: 'Voter must be 18 years or older.'
    };
  }

  return {
    valid: true,
    extractedData: {
      birthYear: fullBirthYear,
      age,
      gender: parseInt(nationalId.charAt(6)) % 2 === 0 ? 'female' : 'male'
    }
  };
}
```

### 2.2 ID Database Verification

```typescript
// Verify ID against government database
async verifyAgainstGovernmentDB(nationalId: string): Promise<IDVerificationResult> {
  try {
    // In production, this would call the government's ID verification API
    const response = await this.http.post(
      this.config.get('governmentApi.verifyIdUrl'),
      { idNumber: nationalId },
      {
        headers: {
          'Authorization': `Bearer ${this.config.get('governmentApi.token')}`
        }
      }
    );

    return {
      verified: true,
      details: {
        name: response.data.names,
        birthDate: response.data.dateOfBirth,
        gender: response.data.gender,
        citizenship: response.data.citizenship
      }
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        verified: false,
        error: 'ID not found in government database'
      };
    }
    throw error;
  }
}
```

---

## 3. Biometric Enrollment

### 3.1 Face Enrollment

```typescript
// Enroll face biometric
async enrollFace(
  voterId: string,
  faceImage: string,
  livenessToken: string
): Promise<FaceEnrollmentResult> {
  // 1. Verify liveness
  const livenessCheck = await this.livenessDetector.verify(livenessToken);
  
  if (!livenessCheck.valid) {
    throw new LivenessCheckFailedError(livenessCheck.reason);
  }

  // 2. Extract face template
  const extractionResult = await this.biometricEngine.face.extract(faceImage);
  
  if (extractionResult.quality < 0.85) {
    throw new BiometricQualityError(
      `Face quality too low: ${extractionResult.quality}`
    );
  }

  // 3. Check for duplicates
  const duplicateCheck = await this.checkFaceDuplicates(
    extractionResult.template
  );
  
  if (duplicateCheck.isDuplicate) {
    throw new DuplicateBiometricError(
      'Face matches existing voter'
    );
  }

  // 4. Encrypt and store template
  const encryptedTemplate = await this.cryptographyService.encryptData(
    extractionResult.template
  );

  await this.biometricRepository.storeFaceTemplate(voterId, {
    template: encryptedTemplate,
    quality: extractionResult.quality,
    capturedAt: new Date(),
    deviceId: extractionResult.deviceId
  });

  return {
    enrolled: true,
    templateId: extractionResult.templateId,
    quality: extractionResult.quality
  };
}
```

### 3.2 Fingerprint Enrollment

```typescript
// Enroll fingerprint biometric
async enrollFingerprint(
  voterId: string,
  fingerprints: FingerprintImages
): Promise<FingerprintEnrollmentResult> {
  const results: FingerprintEnrollmentResult = {
    enrolled: true,
    fingers: {}
  };

  for (const [finger, image] of Object.entries(fingerprints)) {
    // Extract minutiae template
    const extractionResult = await this.biometricEngine.fingerprint.extract(
      image,
      finger
    );

    if (extractionResult.quality < 0.90) {
      results.enrolled = false;
      results.fingers[finger] = {
        enrolled: false,
        error: `Quality too low: ${extractionResult.quality}`
      };
      continue;
    }

    // Encrypt and store
    const encryptedTemplate = await this.cryptographyService.encryptData(
      extractionResult.template
    );

    await this.biometricRepository.storeFingerprintTemplate(
      voterId,
      finger,
      {
        template: encryptedTemplate,
        quality: extractionResult.quality,
        minutiaeCount: extractionResult.minutiaeCount,
        capturedAt: new Date()
      }
    );

    results.fingers[finger] = {
      enrolled: true,
      quality: extractionResult.quality,
      minutiaeCount: extractionResult.minutiaeCount
    };
  }

  return results;
}
```

---

## 4. Biometric Verification

### 4.1 Face Verification

```typescript
// Verify face during login
async verifyFace(
  voterId: string,
  faceImage: string
): Promise<FaceVerificationResult> {
  // Get stored template
  const storedTemplate = await this.biometricRepository.getFaceTemplate(voterId);
  
  if (!storedTemplate) {
    throw new BiometricNotEnrolledError('Face not enrolled');
  }

  // Extract from provided image
  const extractedTemplate = await this.biometricEngine.face.extract(faceImage);

  // Decrypt stored template
  const decryptedStored = await this.cryptographyService.decryptData(
    storedTemplate.template
  );

  // Compare templates
  const matchScore = await this.biometricEngine.face.compare(
    extractedTemplate.template,
    decryptedStored
  );

  return {
    verified: matchScore >= 0.85,
    score: matchScore,
    threshold: 0.85,
    isLive: extractedTemplate.isLive,
    deviceId: extractedTemplate.deviceId
  };
}
```

### 4.2 Fingerprint Verification

```typescript
// Verify fingerprint during login
async verifyFingerprint(
  voterId: string,
  finger: string,
  fingerprintImage: string
): Promise<FingerprintVerificationResult> {
  // Get stored template
  const storedTemplate = await this.biometricRepository.getFingerprintTemplate(
    voterId,
    finger
  );

  if (!storedTemplate) {
    throw new BiometricNotEnrolledError(
      `${finger} fingerprint not enrolled`
    );
  }

  // Extract from provided image
  const extractedTemplate = await this.biometricEngine.fingerprint.extract(
    fingerprintImage,
    finger
  );

  // Decrypt and compare
  const decryptedStored = await this.cryptographyService.decryptData(
    storedTemplate.template
  );

  const matchScore = await this.biometricEngine.fingerprint.compare(
    extractedTemplate.template,
    decryptedStored
  );

  return {
    verified: matchScore >= 0.90,
    score: matchScore,
    threshold: 0.90,
    finger,
    quality: extractedTemplate.quality
  };
}
```

### 4.3 Combined Verification

```typescript
// Combined biometric verification for voting
async verifyForVoting(
  voterId: string,
  faceImage: string,
  fingerprints: FingerprintImages
): Promise<VotingVerificationResult> {
  // Verify face
  const faceResult = await this.verifyFace(voterId, faceImage);
  
  // Verify both fingerprints
  const fingerprintResults: Record<string, boolean> = {};
  
  for (const finger of ['leftThumb', 'rightThumb']) {
    const fpResult = await this.verifyFingerprint(
      voterId,
      finger,
      fingerprints[finger]
    );
    fingerprintResults[finger] = fpResult.verified;
  }

  // Combined result
  const allFingerprintsVerified = Object.values(fingerprintResults).every(
    v => v === true
  );

  const result: VotingVerificationResult = {
    verified: faceResult.verified && allFingerprintsVerified,
    faceVerified: faceResult.verified,
    fingerprintsVerified: fingerprintResults,
    timestamp: new Date(),
    sessionId: crypto.randomUUID()
  };

  // Log verification attempt
  await this.auditService.logBiometricVerification(voterId, result);

  return result;
}
```

---

## 5. Liveness Detection

### 5.1 Passive Liveness

```typescript
// Passive liveness detection using AI
async checkPassiveLiveness(faceImage: string): Promise<LivenessResult> {
  // Analyze image for signs of spoofing
  const analysis = await this.livenessDetector.analyzeImage(faceImage);

  return {
    valid: analysis.isLive,
    confidence: analysis.livenessScore,
    checks: {
      // Multi-frame analysis
      hasMultipleFrames: analysis.frames.length >= 3,
      
      // Texture analysis (3D mask detection)
      textureNormal: analysis.textureScore > 0.7,
      
      // Reflection analysis
      reflectionNormal: analysis.reflectionScore > 0.8,
      
      // Depth analysis (requires special camera)
      depthConsistent: analysis.depthScore > 0.6
    },
    reason: analysis.isLive ? null : analysis.rejectionReason
  };
}
```

### 5.2 Active Challenge-Response

```typescript
// Generate liveness challenge
async generateLivenessChallenge(): Promise<LivenessChallenge> {
  const challenge = await this.livenessDetector.createChallenge({
    type: 'random',
    actions: ['blink', 'turn_left', 'turn_right', 'smile']
  });

  return {
    challengeId: challenge.id,
    instructions: challenge.instructions,
    timeout: 10000, // 10 seconds
    allowPassiveFallback: true
  };
}

// Verify liveness response
async verifyLivenessResponse(
  challengeId: string,
  videoFrames: string[]
): Promise<LivenessResult> {
  const result = await this.livenessDetector.verifyChallenge(
    challengeId,
    videoFrames
  );

  return {
    valid: result.success,
    confidence: result.confidence,
    reason: result.success ? null : result.error
  };
}
```

---

## 6. Validation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    VALIDATION FLOW                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   1. ID VERIFICATION                                                │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Enter   │───>│  Validate │───>│  Verify   │                   │
│   │  National│    │  Format   │    │  Against  │                   │
│   │  ID      │    │           │    │  Gov DB   │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                                      │              │
│                                                      ▼              │
│   2. BIOMETRIC ENROLLMENT                                     │      │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐         │        │
│   │  Capture │───>│ Liveness  │───>│ Extract   │         │        │
│   │  Face    │    │  Check   │    │ Template  │         │        │
│   └──────────┘    └───────────┘    └───────────┘         │        │
│                                                      │              │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐         │        │
│   │  Capture │───>│ Quality   │───>│ Extract   │─────────┘         │
│   │ Finger-  │    │  Check    │    │ Template  │                   │
│   │  print   │    │           │    │           │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                                      │              │
│                                                      ▼              │
│   3. VOTING VERIFICATION                                     │      │
│   ┌──────────┐    ┌───────────┐    ┌───────────┐                   │
│   │  Verify  │───>│  Verify   │───>│  Combined │                   │
│   │  Face    │    │ Finger-   │    │  Result   │                   │
│   │          │    │  print    │    │           │                   │
│   └──────────┘    └───────────┘    └───────────┘                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Error Handling

```typescript
// Validation errors
export class ValidationError extends Error {
  constructor(message: string, public code: string) {
    super(message);
  }
}

export class LivenessCheckFailedError extends ValidationError {
  constructor(reason: string) {
    super(`Liveness check failed: ${reason}`, 'LIVENESS_FAILED');
  }
}

export class BiometricQualityError extends ValidationError {
  constructor(reason: string) {
    super(`Biometric quality error: ${reason}`, 'QUALITY_TOO_LOW');
  }
}

export class DuplicateBiometricError extends ValidationError {
  constructor(reason: string) {
    super(`Duplicate biometric: ${reason}`, 'DUPLICATE_FOUND');
  }
}

export class BiometricNotEnrolledError extends ValidationError {
  constructor(detail: string) {
    super(`Biometric not enrolled: ${detail}`, 'NOT_ENROLLED');
  }
}
```
