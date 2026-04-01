'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card } from '@/components/ui';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API call - in production this would call the backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <Card padding="lg" className="shadow-xl">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-success-light rounded-full mb-6">
            <CheckCircleIcon className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Check Your Email</h2>
          <p className="text-neutral-500 mb-6">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-neutral-700">{getValues('email')}</span>
          </p>
          <p className="text-sm text-neutral-400 mb-8">
            Didn&apos;t receive the email? Check your spam folder or try again.
          </p>
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Sign In
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className="shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Forgot Password?</h2>
        <p className="text-neutral-500">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          leftIcon={<EnvelopeIcon className="w-5 h-5" />}
          error={errors.email?.message}
          autoComplete="email"
          {...register('email')}
        />

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isLoading}
          className="mt-6"
        >
          Send Reset Link
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>
    </Card>
  );
}
