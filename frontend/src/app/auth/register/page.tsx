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
import { Button, Input, Card, StepIndicator } from '@/components/ui';

const steps = [
  { label: 'Account', status: 'completed' as const },
  { label: 'Verify ID', status: 'current' as const },
  { label: 'Biometrics', status: 'pending' as const },
  { label: 'Complete', status: 'pending' as const },
];

export default function RegisterPage() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Multi-step form logic would go here
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

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Full Name"
          type="text"
          placeholder="John Doe"
          leftIcon={<UserIcon className="w-5 h-5" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<EnvelopeIcon className="w-5 h-5" />}
          helperText="We'll send verification links to this email"
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          placeholder="+254 700 000 000"
          leftIcon={<PhoneIcon className="w-5 h-5" />}
          helperText="For SMS notifications and account recovery"
          required
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          leftIcon={<LockClosedIcon className="w-5 h-5" />}
          helperText="Min 12 characters with uppercase, lowercase, numbers, and symbols"
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          placeholder="Confirm your password"
          leftIcon={<LockClosedIcon className="w-5 h-5" />}
          required
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
          className="mt-6"
        >
          Continue to ID Verification
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
        <p className="text-neutral-600">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </Card>
  );
}
