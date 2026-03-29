// ===========================================
// BIOMETRICS SERVICE
// Location: src/services/biometrics.ts
// Based on: services/biometrics.md specification
// ===========================================

import { api } from './api-client';

// ===========================================
// TYPES
// ===========================================

export interface BiometricTemplate {
  id: string;
  type: 'face' | 'fingerprint';
  encryptedData: string;
  createdAt: Date;
}

export interface FaceCaptureOptions {
  width?: number;
  height?: number;
  facingMode?: 'user' | 'environment';
  imageQuality?: 'low' | 'medium' | 'high';
}

export interface FaceCaptureResult {
  imageData: string;
  livenessScore: number;
  template: string;
}

export interface FingerprintCaptureResult {
  imageData: string;
  template: string;
  quality: number;
}

export interface LivenessDetectionResult {
  passed: boolean;
  confidence: number;
  message: string;
}

export interface BiometricEnrollmentResponse {
  success: boolean;
  templateId: string;
  message?: string;
}

export interface BiometricVerificationResponse {
  success: boolean;
  matchScore: number;
  message?: string;
}

// ===========================================
// CONSTANTS
// ===========================================

const DEFAULT_FACE_OPTIONS: FaceCaptureOptions = {
  width: 640,
  height: 480,
  facingMode: 'user',
  imageQuality: 'high',
};

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

/**
 * Convert canvas to base64 data URL
 */
function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number = 0.9): string {
  return canvas.toDataURL('image/jpeg', quality);
}

/**
 * Encrypt biometric template (placeholder for actual implementation)
 * In production, this should use a proper encryption library
 */
export async function encryptTemplate(template: string): Promise<string> {
  // Placeholder encryption - in production use Web Crypto API or similar
  const encoder = new TextEncoder();
  const data = encoder.encode(template);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return btoa(String.fromCharCode(...hashArray));
}

/**
 * Generate a random challenge for liveness detection
 */
function generateLivenessChallenge(): { text: string; duration: number } {
  const challenges = [
    { text: 'blink', duration: 2000 },
    { text: 'turn_left', duration: 2500 },
    { text: 'turn_right', duration: 2500 },
    { text: 'smile', duration: 2000 },
    { text: 'nod', duration: 2000 },
  ];
  return challenges[Math.floor(Math.random() * challenges.length)];
}

// ===========================================
// FACE CAPTURE
// ===========================================

let mediaStream: MediaStream | null = null;

/**
 * Initialize camera for face capture
 */
export async function initializeCamera(options: FaceCaptureOptions = {}): Promise<MediaStream> {
  const config: MediaStreamConstraints = {
    video: {
      width: { ideal: options.width || DEFAULT_FACE_OPTIONS.width },
      height: { ideal: options.height || DEFAULT_FACE_OPTIONS.height },
      facingMode: options.facingMode || DEFAULT_FACE_OPTIONS.facingMode,
    },
    audio: false,
  };

  try {
    mediaStream = await navigator.mediaDevices.getUserMedia(config);
    return mediaStream;
  } catch (error) {
    throw new Error('Failed to access camera. Please ensure camera permissions are granted.');
  }
}

/**
 * Capture face image from video stream
 */
export function captureFaceImage(
  videoElement: HTMLVideoElement,
  imageQuality: 'low' | 'medium' | 'high' = 'high'
): string {
  const qualityMap = { low: 0.5, medium: 0.75, high: 0.95 };
  const quality = qualityMap[imageQuality];

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  // Mirror the image for user-facing camera
  ctx.translate(canvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(videoElement, 0, 0);

  return canvasToDataUrl(canvas, quality);
}

/**
 * Stop camera stream
 */
export function stopCamera(): void {
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
}

/**
 * Capture face with liveness detection
 */
export async function captureFaceWithLiveness(
  videoElement: HTMLVideoElement,
  onChallenge?: (challenge: string) => void
): Promise<FaceCaptureResult> {
  // Start liveness detection
  const challenge = generateLivenessChallenge();
  
  if (onChallenge) {
    onChallenge(challenge.text);
  }

  // Wait for challenge duration
  await new Promise(resolve => setTimeout(resolve, challenge.duration));

  // Capture the image
  const imageData = captureFaceImage(videoElement, 'high');
  
  // Generate a placeholder template
  // In production, this would use a proper face recognition library
  const template = await encryptTemplate(imageData);

  // Simulate liveness score (in production, this would be calculated from actual analysis)
  const livenessScore = 0.85 + Math.random() * 0.15;

  return {
    imageData,
    livenessScore,
    template,
  };
}

// ===========================================
// LIVENESS DETECTION
// ===========================================

/**
 * Perform liveness detection on face image
 * This is a client-side placeholder - in production, use a dedicated liveness detection SDK
 */
export async function performLivenessDetection(
  videoElement: HTMLVideoElement,
  challengeType: string
): Promise<LivenessDetectionResult> {
  // Capture multiple frames for analysis
  const frames: string[] = [];
  const frameCount = 5;

  for (let i = 0; i < frameCount; i++) {
    frames.push(captureFaceImage(videoElement, 'medium'));
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  // In production, these frames would be analyzed by a liveness detection model
  // For now, we simulate a liveness check
  const passed = Math.random() > 0.1; // 90% pass rate simulation
  const confidence = passed ? 0.85 + Math.random() * 0.15 : Math.random() * 0.5;

  return {
    passed,
    confidence,
    message: passed 
      ? 'Liveness check passed' 
      : 'Liveness check failed. Please try again.',
  };
}

/**
 * Start continuous liveness monitoring
 */
export function startLivenessMonitoring(
  videoElement: HTMLVideoElement,
  onResult: (result: LivenessDetectionResult) => void
): () => void {
  const intervalId = setInterval(async () => {
    const result = await performLivenessDetection(videoElement, 'continuous');
    onResult(result);
  }, 5000);

  // Return cleanup function
  return () => clearInterval(intervalId);
}

// ===========================================
// FINGERPRINT CAPTURE
// ===========================================

/**
 * Capture fingerprint (placeholder for hardware integration)
 * Note: Actual fingerprint scanning requires dedicated hardware SDK integration
 */
export async function captureFingerprint(): Promise<FingerprintCaptureResult> {
  // This is a placeholder - actual implementation would require
  // integration with a fingerprint scanner SDK (e.g., DigitalPersona, Futronic)
  
  // Check if WebAuthn/FIDO is available for fingerprint
  if (!window.PublicKeyCredential) {
    throw new Error('Fingerprint authentication not supported on this device');
  }

  // Placeholder implementation
  // In production, this would interface with actual fingerprint hardware
  const placeholderImage = 'data:image/png;base64,placeholder';
  const placeholderTemplate = await encryptTemplate(`fingerprint_${Date.now()}`);

  return {
    imageData: placeholderImage,
    template: placeholderTemplate,
    quality: 0.95,
  };
}

/**
 * Initialize fingerprint scanner (placeholder)
 */
export async function initializeFingerprintScanner(): Promise<boolean> {
  // Placeholder for hardware initialization
  // In production, this would initialize the fingerprint scanner
  return true;
}

// ===========================================
// BIOMETRIC TEMPLATE MANAGEMENT
// ===========================================

/**
 * Enroll biometric data to the server
 */
export async function enrollBiometric(
  type: 'face' | 'fingerprint',
  template: string
): Promise<BiometricEnrollmentResponse> {
  const encryptedTemplate = await encryptTemplate(template);

  const response = await api.post<BiometricEnrollmentResponse>('/biometrics/enroll', {
    type,
    template: encryptedTemplate,
  });

  return response;
}

/**
 * Verify biometric data against enrolled template
 */
export async function verifyBiometric(
  type: 'face' | 'fingerprint',
  template: string
): Promise<BiometricVerificationResponse> {
  const encryptedTemplate = await encryptTemplate(template);

  const response = await api.post<BiometricVerificationResponse>('/biometrics/verify', {
    type,
    template: encryptedTemplate,
  });

  return response;
}

/**
 * Get enrolled biometric templates for current user
 */
export async function getEnrolledBiometrics(): Promise<BiometricTemplate[]> {
  const response = await api.get<BiometricTemplate[]>('/biometrics/templates');
  return response;
}

/**
 * Remove enrolled biometric template
 */
export async function removeBiometric(templateId: string): Promise<void> {
  await api.delete(`/biometrics/templates/${templateId}`);
}

// ===========================================
// COMBINED BIOMETRIC OPERATIONS
// ===========================================

/**
 * Perform full biometric enrollment (face + fingerprint)
 */
export async function enrollFullBiometrics(
  faceTemplate: string,
  fingerprintTemplate: string
): Promise<{ face: BiometricEnrollmentResponse; fingerprint: BiometricEnrollmentResponse }> {
  const [faceResult, fingerprintResult] = await Promise.all([
    enrollBiometric('face', faceTemplate),
    enrollBiometric('fingerprint', fingerprintTemplate),
  ]);

  return {
    face: faceResult,
    fingerprint: fingerprintResult,
  };
}

/**
 * Verify using biometrics (supports both face and fingerprint)
 */
export async function verifyWithBiometrics(
  type: 'face' | 'fingerprint',
  template: string
): Promise<BiometricVerificationResponse> {
  return verifyBiometric(type, template);
}

// ===========================================
// EXPORTS
// ===========================================

export default {
  initializeCamera,
  captureFaceImage,
  captureFaceWithLiveness,
  stopCamera,
  performLivenessDetection,
  startLivenessMonitoring,
  captureFingerprint,
  initializeFingerprintScanner,
  encryptTemplate,
  enrollBiometric,
  verifyBiometric,
  getEnrolledBiometrics,
  removeBiometric,
  enrollFullBiometrics,
  verifyWithBiometrics,
};
