'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  EyeIcon, 
  EyeSlashIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card } from '@/components/ui';
import { useAuthStore } from '@/stores/auth.store';
import { login } from '@/services/auth';

const loginSchema = z.object({
  identifier: z.string().min(1, 'Identifier is required'),
  password: z.string().min(1, 'Password is required'),
  userType: z.enum(['voter', 'admin', 'ro']).default('voter'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login: storeLogin } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: '',
      password: '',
      userType: 'voter',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await login({
        identifier: data.identifier,
        password: data.password,
        userType: data.userType
      });

      // Store user data in auth store
      storeLogin(response.user, response.token, response.expiresIn);

      // Redirect based on role
      switch (response.user.role) {
        case 'voter':
          router.push('/voter/dashboard');
          break;
        case 'admin':
          router.push('/admin/dashboard');
          break;
        case 'returning_officer':
          router.push('/ro/dashboard');
          break;
        case 'super_admin':
          router.push('/admin/dashboard');
          break;
        default:
          router.push('/voter/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card padding="lg" className="shadow-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Welcome Back</h2>
        <p className="text-neutral-500">Sign in to access your voting dashboard</p>
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
          error={errors.identifier?.message}
          autoComplete="email"
          {...register('identifier')}
        />

         <div className="relative">
           <Input
             label="Password"
             type={showPassword ? 'text' : 'password'}
             placeholder="Enter your password"
             leftIcon={<LockClosedIcon className="w-5 h-5" />}
             error={errors.password?.message}
             {...register('password')}
              autoComplete="current-password"
           />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 text-primary-500 border-neutral-300 rounded focus:ring-primary-500"
              {...register('rememberMe')}
            />
            <span className="text-sm text-neutral-600">Remember me</span>
          </label>
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={isLoading}
          className="mt-6"
        >
          Sign In
          <ArrowRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-neutral-200 text-center">
        <p className="text-neutral-600">
          Don't have an account?{' '}
          <Link 
            href="/auth/register" 
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Register to Vote
          </Link>
        </p>
      </div>

      {/* Demo Accounts */}
      <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
        <p className="text-xs font-medium text-neutral-500 mb-2">Demo Accounts (click to auto-fill):</p>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setValue('identifier', 'voter@iebc.go.ke');
              setValue('password', 'Voter123456!');
              setValue('userType', 'voter');
            }}
            className="w-full text-left text-xs p-2 rounded bg-white hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 transition-colors"
          >
            <span className="font-medium text-neutral-700">Voter:</span>{' '}
            <span className="text-neutral-500">voter@iebc.go.ke / Voter123456!</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('identifier', 'admin@iebc.go.ke');
              setValue('password', 'Admin123456!');
              setValue('userType', 'admin');
            }}
            className="w-full text-left text-xs p-2 rounded bg-white hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 transition-colors"
          >
            <span className="font-medium text-neutral-700">Admin:</span>{' '}
            <span className="text-neutral-500">admin@iebc.go.ke / Admin123456!</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setValue('identifier', 'ro@iebc.go.ke');
              setValue('password', 'Ro123456789!');
              setValue('userType', 'ro');
            }}
            className="w-full text-left text-xs p-2 rounded bg-white hover:bg-primary-50 border border-neutral-200 hover:border-primary-300 transition-colors"
          >
            <span className="font-medium text-neutral-700">RO:</span>{' '}
            <span className="text-neutral-500">ro@iebc.go.ke / Ro123456789!</span>
          </button>
        </div>
      </div>
    </Card>
  );
}
