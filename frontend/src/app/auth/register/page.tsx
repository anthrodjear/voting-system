'use client';

import Link from 'next/link';
import { 
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  ArrowRightIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card, StepIndicator, Alert } from '@/components/ui';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth';

const steps = [
  { label: 'Account', status: 'completed' as const },
  { label: 'Verify ID', status: 'current' as const },
  { label: 'Biometrics', status: 'pending' as const },
  { label: 'Complete', status: 'pending' as const },
];

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // In a real implementation, we would collect form data from a multi-step form
      // For now, we'll simulate with placeholder data
      const formData = {
        nationalId: '12345678',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: '1990-01-01',
        county: 'Nairobi',
        constituency: 'Kasarani',
        ward: 'Mwiki',
        phoneNumber: '+254700000000',
        email: 'john.doe@example.com'
      };
      
      await register(formData);
      setSuccess('Registration successful! Please check your email to verify your account.');
      
      // Redirect to login after a brief delay
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="shadow-xl">
      <div className="mb-8">
        <StepIndicator 
          steps={steps} 
          currentStep={1}
        />
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Create Your Account</h2>
        <p className="text-neutral-500">Step 1: Set up your login credentials</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-success-light border-l-4 border-success rounded-r-lg">
          <div className="flex items-center gap-2 text-success-dark">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-error-light border-l-4 border-error rounded-r-lg">
          <div className="flex items-center gap-2 text-error-dark">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          leftIcon={<UserIcon className="w-5 h-5" />}
          autoComplete="name"
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<EnvelopeIcon className="w-5 h-5" />}
          helperText="We'll send verification links to this email"
          autoComplete="email"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+254 700 000 000"
          leftIcon={<PhoneIcon className="w-5 h-5" />}
          helperText="For SMS notifications and account recovery"
          autoComplete="tel"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          leftIcon={<LockClosedIcon className="w-5 h-5" />}
          helperText="Min 12 characters with uppercase, lowercase, numbers, and symbols"
          required
          autoComplete="new-password"
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          leftIcon={<LockClosedIcon className="w-5 h-5" />}
          required
          autoComplete="new-password"
        />

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            className="w-4 h-4 mt-1 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
            required
          />
          <label htmlFor="terms" className="text-sm text-neutral-600">
            I agree to the{' '}
            <Link href="/terms" className="text-primary-600 hover:underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary-600 hover:underline">
              Privacy Policy
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isLoading}
          className="mt-6"
        >
          {isLoading ? 'Registering...' : 'Continue to ID Verification'}
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
        <p className="text-neutral-600">
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </Card>
  );
}
