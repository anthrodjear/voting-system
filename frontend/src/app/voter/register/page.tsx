'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  UserIcon,
  DocumentTextIcon,
  FingerPrintIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card, StepIndicator, Alert } from '@/components/ui';
import { cn } from '@/lib/utils';

const steps = [
  { label: 'National ID', icon: DocumentTextIcon },
  { label: 'Personal Info', icon: UserIcon },
  { label: 'Biometrics', icon: FingerPrintIcon },
  { label: 'Confirmation', icon: CheckCircleIcon },
];

// Step 1: ID Validation Schema
const step1Schema = z.object({
  nationalId: z.string().min(8, 'National ID must be at least 8 digits'),
});

// Step 2: Personal Info Schema
const step2Schema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  gender: z.enum(['M', 'F'], { required_error: 'Gender is required' }),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  county: z.string().min(1, 'County is required'),
  constituency: z.string().min(1, 'Constituency is required'),
  ward: z.string().min(1, 'Ward is required'),
});

// Step 3: Account Schema
const step3Schema = z.object({
  password: z.string().min(12, 'Password must be at least 12 characters'),
  confirmPassword: z.string(),
  securityQuestion1: z.string().min(1, 'Security question is required'),
  securityAnswer1: z.string().min(1, 'Security answer is required'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

export default function VoterRegistrationPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [biometricsCaptured, setBiometricsCaptured] = useState(false);

  // Forms for each step
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
  });

  const form2 = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
  });

  const form3 = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
  });

  const handleStep1Submit = async (data: Step1Data) => {
    setIsLoading(true);
    try {
      // Simulate ID verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep1Data(data);
      setIdVerified(true);
      setCurrentStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async (data: Step2Data) => {
    setStep2Data(data);
    setCurrentStep(2);
  };

  const handleStep3Submit = async (data: Step3Data) => {
    setIsLoading(true);
    try {
      // Simulate final registration
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCurrentStep(3);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBiometricCapture = async () => {
    setIsLoading(true);
    try {
      // Simulate biometric capture
      await new Promise(resolve => setTimeout(resolve, 2000));
      setBiometricsCaptured(true);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <form onSubmit={form1.handleSubmit(handleStep1Submit)} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Verify Your Identity</h2>
              <p className="text-neutral-500">Enter your Kenya National ID number to begin registration</p>
            </div>

            {idVerified && (
              <Alert variant="success" title="ID Verified">
                Your National ID has been verified successfully.
              </Alert>
            )}

            <Input
              label="National ID Number"
              placeholder="Enter your 8 or 14 digit National ID"
              {...form1.register('nationalId')}
              error={form1.formState.errors.nationalId?.message}
              disabled={idVerified}
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={isLoading}
              disabled={idVerified}
            >
              {idVerified ? 'ID Verified' : 'Verify ID'}
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </form>
        );

      case 1:
        return (
          <form onSubmit={form2.handleSubmit(handleStep2Submit)} className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Personal Information</h2>
              <p className="text-neutral-500">Provide your personal details as they appear on your ID</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                placeholder="John"
                {...form2.register('firstName')}
                error={form2.formState.errors.firstName?.message}
              />
              <Input
                label="Last Name"
                placeholder="Doe"
                {...form2.register('lastName')}
                error={form2.formState.errors.lastName?.message}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Gender <span className="text-error">*</span>
                </label>
                <select
                  className="w-full h-11 px-4 border border-neutral-300 rounded-md focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                  {...form2.register('gender')}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                {form2.formState.errors.gender && (
                  <p className="mt-1.5 text-sm text-error">{form2.formState.errors.gender.message}</p>
                )}
              </div>
              <Input
                label="Date of Birth"
                type="date"
                {...form2.register('dateOfBirth')}
                error={form2.formState.errors.dateOfBirth?.message}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                {...form2.register('email')}
                error={form2.formState.errors.email?.message}
              />
              <Input
                label="Phone Number"
                type="tel"
                placeholder="+254 700 000 000"
                {...form2.register('phone')}
                error={form2.formState.errors.phone?.message}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Input
                label="County"
                placeholder="Nairobi"
                {...form2.register('county')}
                error={form2.formState.errors.county?.message}
              />
              <Input
                label="Constituency"
                placeholder="Kasarani"
                {...form2.register('constituency')}
                error={form2.formState.errors.constituency?.message}
              />
              <Input
                label="Ward"
                placeholder="Mwiki"
                {...form2.register('ward')}
                error={form2.formState.errors.ward?.message}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(0)}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                fullWidth
                size="lg"
              >
                Continue to Biometrics
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </form>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Biometric Verification</h2>
              <p className="text-neutral-500">Complete biometric verification for secure authentication</p>
            </div>

            <div className="flex flex-col items-center justify-center py-8">
              <div className={cn(
                "w-40 h-40 rounded-full flex items-center justify-center mb-6",
                biometricsCaptured ? "bg-success-light" : "bg-neutral-100"
              )}>
                <FingerPrintIcon className={cn(
                  "w-20 h-20",
                  biometricsCaptured ? "text-success" : "text-neutral-400"
                )} />
              </div>

              {biometricsCaptured ? (
                <Alert variant="success" title="Biometrics Captured">
                  Your fingerprints and facial recognition have been enrolled successfully.
                </Alert>
              ) : (
                <div className="text-center">
                  <p className="text-neutral-600 mb-6">
                    Place your finger on the scanner or look at the camera for facial recognition
                  </p>
                  <Button
                    onClick={handleBiometricCapture}
                    loading={isLoading}
                    size="lg"
                  >
                    {isLoading ? 'Capturing...' : 'Start Biometric Capture'}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setCurrentStep(1)}
                disabled={isLoading}
              >
                <ArrowLeftIcon className="w-5 h-5 mr-2" />
                Back
              </Button>
              <Button
                fullWidth
                size="lg"
                onClick={() => setCurrentStep(3)}
                disabled={!biometricsCaptured}
              >
                Continue to Confirmation
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-success-light rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircleIcon className="w-12 h-12 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 mb-2">Registration Complete!</h2>
              <p className="text-neutral-500">Your voter registration has been submitted successfully</p>
            </div>

            <Card className="bg-neutral-50">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">National ID</span>
                  <span className="font-medium">{step1Data?.nationalId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Name</span>
                  <span className="font-medium">
                    {step2Data?.firstName} {step2Data?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">County</span>
                  <span className="font-medium">{step2Data?.county}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Constituency</span>
                  <span className="font-medium">{step2Data?.constituency}</span>
                </div>
              </div>
            </Card>

            <Alert variant="info">
              Your registration is now pending verification. You'll receive an SMS notification once your registration is approved.
            </Alert>

            <Button
              fullWidth
              size="lg"
              onClick={() => router.push('/voter/dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      {currentStep < 3 && (
        <div className="mb-8">
          <StepIndicator 
            steps={steps.map((step, index) => ({
              label: step.label,
              status: index < currentStep ? 'completed' : index === currentStep ? 'current' : 'pending',
            }))}
            currentStep={currentStep}
          />
        </div>
      )}

      <Card padding="lg" className="shadow-xl">
        {renderStepContent()}
      </Card>
    </div>
  );
}
