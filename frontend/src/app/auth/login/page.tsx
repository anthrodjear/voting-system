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
  ArrowRightIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';
import { Button, Input } from '@/components/ui';
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

      storeLogin(response.user, response.token, response.expiresIn);

      switch (response.user.role) {
        case 'voter':
          router.push('/voter/dashboard');
          break;
        case 'admin':
        case 'super_admin':
          router.push('/admin/dashboard');
          break;
        case 'returning_officer':
          router.push('/ro/dashboard');
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
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/20">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
        <p className="text-white/50 text-sm">Sign in to access your voting dashboard</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <div className="flex items-center gap-3 text-red-400">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Email Address</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <EnvelopeIcon className="w-5 h-5" />
            </div>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              {...register('identifier')}
            />
          </div>
          {errors.identifier && (
            <p className="text-red-400 text-xs mt-1">{errors.identifier.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-white/80">Password</label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
              <LockClosedIcon className="w-5 h-5" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              className="w-full pl-12 pr-14 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 bg-white/5 border-white/20 rounded focus:ring-emerald-500/20 focus:ring-offset-0 text-emerald-500"
              {...register('rememberMe')}
            />
            <span className="text-sm text-white/50">Remember me</span>
          </label>
          <Link 
            href="/auth/forgot-password" 
            className="text-sm text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>
              Sign In
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-white/50">
          Don't have an account?{' '}
          <Link 
            href="/auth/register" 
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            Register to Vote
          </Link>
        </p>
      </div>

      {/* Demo Accounts */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
          <p className="text-xs font-medium text-white/40 mb-3">Demo Accounts (click to auto-fill):</p>
          <div className="space-y-2">
            {[
              { label: 'Voter', email: 'voter@iebc.go.ke', pass: 'Voter123456!', type: 'voter' },
              { label: 'Admin', email: 'admin@iebc.go.ke', pass: 'Admin123456!', type: 'admin' },
              { label: 'RO', email: 'ro@iebc.go.ke', pass: 'Ro123456789!', type: 'ro' },
            ].map((account) => (
              <button
                key={account.label}
                type="button"
                onClick={() => {
                  setValue('identifier', account.email);
                  setValue('password', account.pass);
                  setValue('userType', account.type as 'voter' | 'admin' | 'ro');
                }}
                className="w-full text-left text-xs p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-emerald-500/30 transition-all flex items-center justify-between group"
              >
                <span className="font-medium text-white/70">{account.label}</span>
                <span className="text-white/30 group-hover:text-white/50 transition-colors">{account.email}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
        <ShieldCheckIcon className="w-4 h-4 text-emerald-500/50" />
        <span>256-bit AES Encrypted Connection</span>
      </div>
    </div>
  );
}