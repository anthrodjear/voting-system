/**
 * Voter Registration Page Component
 * 5-Step Flow: ID Verification → Personal Info → Biometrics → Account → Confirmation
 */

import React, { useState } from 'react';
import { Button, Input, Card, Alert, Badge, StepIndicator } from '../../components/ui';
import { VoterLayout } from '../../components/layout';

// ============================================
// TYPES
// ============================================

interface RegistrationData {
  nationalId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  county: string;
  constituency: string;
  ward: string;
  faceCaptured: boolean;
  fingerprintCaptured: boolean;
  password: string;
  securityQuestions: { question: string; answer: string }[];
  termsAccepted: boolean;
}

// ============================================
// CONSTANTS
// ============================================

const STEPS = [
  { label: 'ID Verification' },
  { label: 'Personal Info' },
  { label: 'Biometrics' },
  { label: 'Account' },
  { label: 'Confirmation' },
];

const KENYA_COUNTIES = [
  'Mombasa', 'Kwale', 'Kilifi', 'Lamu', 'Tana River', 'Garissa', 'Wajir', 'Mandera',
  'Marsabit', 'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni',
  'Nyandarua', 'Nyeri', 'Kirinyaga', 'Murang\'a', 'Kiambu', 'Turkana', 'West Pokot',
  'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet', 'Nandi', 'Baringo',
  'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga',
  'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira',
  'Nairobi'
];

const SECURITY_QUESTIONS = [
  'What is your mother\'s maiden name?',
  'What is the name of your first pet?',
  'What city were you born in?',
  'What was the name of your first school?',
  'What is your favorite color?',
];

// ============================================
// STEP 1: ID VERIFICATION
// ============================================

const StepOneIDVerification: React.FC<{
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
}> = ({ data, onUpdate, onNext }) => {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const validateId = (id: string) => {
    return /^\d{8}$/.test(id);
  };

  const handleVerify = async () => {
    setError('');
    
    if (!validateId(data.nationalId)) {
      setError('National ID must be exactly 8 digits');
      return;
    }

    setVerifying(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock: ID verified successfully
    setVerified(true);
    setVerifying(false);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verify Your Identity</h2>
        <p className="text-neutral-500">Enter your National ID number to begin registration</p>
      </div>

      <Card variant="default" padding="lg">
        <div className="space-y-6">
          <Input
            label="National ID Number"
            placeholder="12345678"
            value={data.nationalId}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
              onUpdate({ nationalId: value });
              setVerified(false);
            }}
            error={error}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            }
            rightIcon={
              verified ? (
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : null
            }
          />

          <Alert variant="info">
            <p className="text-sm">
              Your information will be verified with the National Integrated Identity Management System (NIIMS).
              Ensure your ID is valid and up-to-date.
            </p>
          </Alert>

          <Button
            onClick={handleVerify}
            loading={verifying}
            disabled={!data.nationalId || verified}
            fullWidth
            size="lg"
          >
            {verified ? 'ID Verified' : 'Verify with NIIMS'}
          </Button>
        </div>
      </Card>

      {verified && (
        <div className="mt-6 flex justify-end">
          <Button onClick={onNext} size="lg">
            Continue
            <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
};

// ============================================
// STEP 2: PERSONAL INFORMATION
// ============================================

const StepTwoPersonalInfo: React.FC<{
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onUpdate, onNext, onBack }) => {
  const [editMode, setEditMode] = useState(false);

  // Mock data from NIIMS
  const mockNIIMSData = {
    firstName: 'JOHN',
    lastName: 'OMONDI',
    dateOfBirth: '1985-06-15',
    gender: 'Male',
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Personal Information</h2>
        <p className="text-neutral-500">Verify and complete your details from NIIMS records</p>
      </div>

      <Card variant="default" padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-neutral-900">NIIMS Data</h3>
          <Button variant="ghost" size="sm" onClick={() => setEditMode(!editMode)}>
            {editMode ? 'Lock Data' : 'Edit'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Input
            label="First Name"
            value={editMode ? data.firstName : mockNIIMSData.firstName}
            onChange={(e) => onUpdate({ firstName: e.target.value })}
            disabled={!editMode}
          />
          <Input
            label="Last Name"
            value={editMode ? data.lastName : mockNIIMSData.lastName}
            onChange={(e) => onUpdate({ lastName: e.target.value })}
            disabled={!editMode}
          />
          <Input
            label="Date of Birth"
            type="date"
            value={editMode ? data.dateOfBirth : mockNIIMSData.dateOfBirth}
            onChange={(e) => onUpdate({ dateOfBirth: e.target.value })}
            disabled={!editMode}
          />
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">Gender</label>
            <select
              className="w-full h-11 px-4 border border-neutral-300 rounded-md bg-white disabled:bg-neutral-100"
              value={editMode ? data.gender : mockNIIMSData.gender}
              onChange={(e) => onUpdate({ gender: e.target.value })}
              disabled={!editMode}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">County</label>
              <select
                className="w-full h-11 px-4 border border-neutral-300 rounded-md bg-white"
                value={data.county}
                onChange={(e) => onUpdate({ county: e.target.value, constituency: '', ward: '' })}
              >
                <option value="">Select County</option>
                {KENYA_COUNTIES.map(county => (
                  <option key={county} value={county}>{county}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Constituency</label>
              <select
                className="w-full h-11 px-4 border border-neutral-300 rounded-md bg-white"
                value={data.constituency}
                onChange={(e) => onUpdate({ constituency: e.target.value, ward: '' })}
                disabled={!data.county}
              >
                <option value="">Select Constituency</option>
                <option value="constituency1">Constituency 1</option>
                <option value="constituency2">Constituency 2</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Ward</label>
              <select
                className="w-full h-11 px-4 border border-neutral-300 rounded-md bg-white"
                value={data.ward}
                onChange={(e) => onUpdate({ ward: e.target.value })}
                disabled={!data.constituency}
              >
                <option value="">Select Ward</option>
                <option value="ward1">Ward 1</option>
                <option value="ward2">Ward 2</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!data.county || !data.constituency || !data.ward}
        >
          Continue
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// ============================================
// STEP 3: BIOMETRICS
// ============================================

const StepThreeBiometrics: React.FC<{
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onUpdate, onNext, onBack }) => {
  const [activeCapture, setActiveCapture] = useState<'face' | 'fingerprint' | null>(null);
  const [capturingFingerprint, setCapturingFingerprint] = useState<number | null>(null);

  const handleFaceCapture = () => {
    setActiveCapture('face');
    // Simulate capture
    setTimeout(() => {
      onUpdate({ faceCaptured: true });
      setActiveCapture(null);
    }, 3000);
  };

  const handleFingerprintCapture = (finger: number) => {
    setCapturingFingerprint(finger);
    // Simulate capture
    setTimeout(() => {
      onUpdate({ fingerprintCaptured: true });
      setCapturingFingerprint(null);
    }, 2000);
  };

  const fingers = [
    { name: 'Right Thumb', index: 0 },
    { name: 'Right Index', index: 1 },
    { name: 'Right Middle', index: 2 },
    { name: 'Right Ring', index: 3 },
    { name: 'Right Pinky', index: 4 },
    { name: 'Left Pinky', index: 5 },
    { name: 'Left Ring', index: 6 },
    { name: 'Left Middle', index: 7 },
    { name: 'Left Index', index: 8 },
    { name: 'Left Thumb', index: 9 },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Biometric Enrollment</h2>
        <p className="text-neutral-500">Complete facial and fingerprint capture for identity verification</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Face Capture */}
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Face Capture</h3>
          
          {activeCapture === 'face' ? (
            <div className="aspect-video bg-neutral-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-voter-500 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-white">Position your face in the frame</p>
                <p className="text-neutral-400 text-sm mt-2">Capture in progress...</p>
              </div>
            </div>
          ) : data.faceCaptured ? (
            <div className="aspect-video bg-success-light rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-16 h-16 text-success mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-success font-semibold">Face Captured</p>
              </div>
            </div>
          ) : (
            <div className="aspect-video bg-neutral-100 rounded-lg flex items-center justify-center border-2 border-dashed border-neutral-300">
              <div className="text-center">
                <svg className="w-16 h-16 text-neutral-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-neutral-500 mb-4">Click to capture your face</p>
                <Button onClick={handleFaceCapture} variant="secondary">
                  Start Camera
                </Button>
              </div>
            </div>
          )}

          <Alert variant="info" className="mt-4">
            <p className="text-sm">Look directly at the camera and follow the liveness prompts (blink, smile, turn head).</p>
          </Alert>
        </Card>

        {/* Fingerprint Capture */}
        <Card variant="default" padding="lg">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Fingerprint Capture</h3>
          
          <div className="grid grid-cols-2 gap-3">
            {fingers.map((finger) => (
              <button
                key={finger.index}
                onClick={() => handleFingerprintCapture(finger.index)}
                disabled={capturingFingerprint !== null}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${capturingFingerprint === finger.index
                    ? 'border-voter-500 bg-voter-50 animate-pulse'
                    : data.fingerprintCaptured
                      ? 'border-success bg-success-light'
                      : 'border-neutral-200 hover:border-voter-300'
                  }
                `}
              >
                <div className="text-center">
                  <svg className={`w-8 h-8 mx-auto mb-1 ${
                    data.fingerprintCaptured ? 'text-success' : 'text-neutral-400'
                  }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  <span className="text-xs font-medium text-neutral-600">{finger.name}</span>
                </div>
              </button>
            ))}
          </div>

          <Alert variant="info" className="mt-4">
            <p className="text-sm">Place each finger firmly on the scanner. Ensure fingers are clean and dry.</p>
          </Alert>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!data.faceCaptured || !data.fingerprintCaptured}
        >
          Continue
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// ============================================
// STEP 4: ACCOUNT SETUP
// ============================================

const StepFourAccount: React.FC<{
  data: RegistrationData;
  onUpdate: (data: Partial<RegistrationData>) => void;
  onNext: () => void;
  onBack: () => void;
}> = ({ data, onUpdate, onNext, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [questions, setQuestions] = useState<{ question: string; answer: string }[]>([
    { question: '', answer: '' },
    { question: '', answer: '' },
    { question: '', answer: '' },
  ]);

  const passwordStrength = () => {
    const p = data.password;
    let strength = 0;
    if (p.length >= 8) strength++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) strength++;
    if (/\d/.test(p)) strength++;
    if (/[^a-zA-Z0-9]/.test(p)) strength++;
    return strength;
  };

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-error', 'bg-warning', 'bg-yellow-400', 'bg-success'];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Account Setup</h2>
        <p className="text-neutral-500">Create a secure password and security questions</p>
      </div>

      <Card variant="default" padding="lg">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Password</h3>
        
        <div className="space-y-4">
          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={data.password}
              onChange={(e) => onUpdate({ password: e.target.value })}
              helperText="At least 8 characters with uppercase, lowercase, numbers, and symbols"
              rightIcon={
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              }
            />
            
            {/* Password Strength Meter */}
            <div className="mt-2">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full ${
                      i < passwordStrength() ? strengthColors[passwordStrength() - 1] : 'bg-neutral-200'
                    }`}
                  />
                ))}
              </div>
              {data.password && (
                <p className="text-xs mt-1 text-neutral-500">
                  Password strength: {strengthLabels[Math.max(0, passwordStrength() - 1)]}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-6 pt-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Security Questions</h3>
          <p className="text-sm text-neutral-500 mb-4">Select 3 security questions and provide answers</p>
          
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <select
                    className="w-full h-11 px-4 border border-neutral-300 rounded-md bg-white"
                    value={q.question}
                    onChange={(e) => {
                      const newQuestions = [...questions];
                      newQuestions[index].question = e.target.value;
                      setQuestions(newQuestions);
                    }}
                  >
                    <option value="">Select Question</option>
                    {SECURITY_QUESTIONS.map((sq) => (
                      <option key={sq} value={sq}>{sq}</option>
                    ))}
                  </select>
                </div>
                <Input
                  placeholder="Your answer"
                  value={q.answer}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[index].answer = e.target.value;
                    setQuestions(newQuestions);
                    onUpdate({ securityQuestions: newQuestions });
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-neutral-200 mt-6 pt-6">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={data.termsAccepted}
              onChange={(e) => onUpdate({ termsAccepted: e.target.checked })}
              className="mt-1 w-5 h-5 rounded border-neutral-300 text-voter-500 focus:ring-voter-500"
            />
            <span className="text-sm text-neutral-600">
              I agree to the <a href="#" className="text-voter-500 underline">Terms of Service</a> and{' '}
              <a href="#" className="text-voter-500 underline">Privacy Policy</a>. I understand that my vote
              will be securely recorded on the blockchain.
            </span>
          </label>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button 
          onClick={onNext}
          disabled={!data.password || !data.termsAccepted || questions.some(q => !q.question || !q.answer)}
        >
          Review & Submit
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// ============================================
// STEP 5: CONFIRMATION
// ============================================

const StepFiveConfirmation: React.FC<{
  data: RegistrationData;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}> = ({ data, onSubmit, onBack, submitting }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Review & Confirm</h2>
        <p className="text-neutral-500">Please review your information before submitting</p>
      </div>

      <Card variant="default" padding="lg">
        {/* Personal Info Summary */}
        <div className="border-b border-neutral-200 pb-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-neutral-900">Personal Information</h3>
            <Button variant="ghost" size="sm" onClick={onBack}>
              Edit
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500">National ID</p>
              <p className="font-medium">{data.nationalId}</p>
            </div>
            <div>
              <p className="text-neutral-500">Name</p>
              <p className="font-medium">{data.firstName} {data.lastName}</p>
            </div>
            <div>
              <p className="text-neutral-500">Date of Birth</p>
              <p className="font-medium">{data.dateOfBirth}</p>
            </div>
            <div>
              <p className="text-neutral-500">Gender</p>
              <p className="font-medium">{data.gender}</p>
            </div>
            <div className="col-span-2">
              <p className="text-neutral-500">Location</p>
              <p className="font-medium">{data.ward}, {data.constituency}, {data.county}</p>
            </div>
          </div>
        </div>

        {/* Biometrics Summary */}
        <div className="border-b border-neutral-200 pb-6 mb-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Biometrics</h3>
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              {data.faceCaptured ? (
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">Face Captured</span>
            </div>
            <div className="flex items-center gap-2">
              {data.fingerprintCaptured ? (
                <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-sm font-medium">Fingerprints Captured</span>
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">Security</h3>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">3 Security Questions Set</span>
          </div>
        </div>
      </Card>

      <Alert variant="warning">
        <p className="text-sm">
          <strong>Important:</strong> Once submitted, you cannot change your registered details. Please ensure all
          information is correct before proceeding.
        </p>
      </Alert>

      <div className="flex justify-between">
        <Button variant="secondary" onClick={onBack}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Button>
        <Button onClick={onSubmit} loading={submitting} size="lg">
          Submit Registration
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Button>
      </div>
    </div>
  );
};

// ============================================
// SUCCESS STATE
// ============================================

const SuccessState: React.FC = () => {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
        <svg className="w-12 h-12 text-success" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      </div>
      
      <h2 className="text-3xl font-bold text-neutral-900 mb-2">Registration Complete!</h2>
      <p className="text-neutral-500 mb-8">Your voter registration has been successfully submitted</p>
      
      <Card variant="default" padding="lg" className="max-w-md mx-auto mb-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span className="text-neutral-500">Registration ID</span>
            <span className="font-mono font-semibold">VR-2026-001547</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-neutral-100">
            <span className="text-neutral-500">Status</span>
            <Badge variant="success" pulse>Verified</Badge>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-neutral-500">Date</span>
            <span className="font-medium">March 28, 2026</span>
          </div>
        </div>
      </Card>

      <p className="text-sm text-neutral-500 mb-6">
        You will receive an SMS confirmation with your Voter ID. Use this to cast your vote in upcoming elections.
      </p>

      <Button size="lg">
        Go to Dashboard
        <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Button>
    </div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

export const VoterRegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data, setData] = useState<RegistrationData>({
    nationalId: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    county: '',
    constituency: '',
    ward: '',
    faceCaptured: false,
    fingerprintCaptured: false,
    password: '',
    securityQuestions: [],
    termsAccepted: false,
  });

  const handleUpdate = (updates: Partial<RegistrationData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 3000));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <VoterLayout>
        <SuccessState />
      </VoterLayout>
    );
  }

  return (
    <VoterLayout>
      {/* Progress Steps */}
      <div className="mb-8">
        <StepIndicator
          steps={STEPS.map((step, index) => ({
            label: step.label,
            status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'pending',
          }))}
          currentStep={currentStep}
        />
      </div>

      {/* Step Content */}
      {currentStep === 0 && (
        <StepOneIDVerification
          data={data}
          onUpdate={handleUpdate}
          onNext={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 1 && (
        <StepTwoPersonalInfo
          data={data}
          onUpdate={handleUpdate}
          onNext={() => setCurrentStep(2)}
          onBack={() => setCurrentStep(0)}
        />
      )}
      {currentStep === 2 && (
        <StepThreeBiometrics
          data={data}
          onUpdate={handleUpdate}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <StepFourAccount
          data={data}
          onUpdate={handleUpdate}
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && (
        <StepFiveConfirmation
          data={data}
          onSubmit={handleSubmit}
          onBack={() => setCurrentStep(3)}
          submitting={submitting}
        />
      )}
    </VoterLayout>
  );
};

export default VoterRegistrationPage;
