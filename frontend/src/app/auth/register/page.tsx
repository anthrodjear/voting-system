'use client';

import Link from 'next/link';
import { 
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  ArrowRightIcon,
  CalendarIcon,
  MapPinIcon,
  ShieldCheckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button, Input } from '@/components/ui';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '@/services/auth';
import { checkIdAvailability } from '@/services/voter';
import { geographicService, GeographicOption } from '@/services/geographic';
import { useDebounce } from '@/hooks';

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
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [county, setCounty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard] = useState('');
  
  const [counties, setCounties] = useState<GeographicOption[]>([]);
  const [constituencies, setConstituencies] = useState<GeographicOption[]>([]);
  const [wards, setWards] = useState<GeographicOption[]>([]);
  
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [checkingId, setCheckingId] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  
  const debouncedNationalId = useDebounce(nationalId, 500);
  
  useEffect(() => {
    const checkId = async () => {
      if (!debouncedNationalId || debouncedNationalId.length < 8) {
        setIdAvailable(null);
        setIdError(null);
        return;
      }
      
      setCheckingId(true);
      try {
        const available = await checkIdAvailability(debouncedNationalId);
        setIdAvailable(available);
        if (!available) {
          setIdError('This National ID is already registered. Please login instead.');
        } else {
          setIdError(null);
        }
      } catch (error) {
        setIdAvailable(null);
        setIdError(null);
      } finally {
        setCheckingId(false);
      }
    };
    
    checkId();
  }, [debouncedNationalId]);
  
  useEffect(() => {
    const fetchCounties = async () => {
      setLoadingCounties(true);
      try {
        const data = await geographicService.getCounties();
        setCounties(data);
      } catch (error) {
        console.error('Error fetching counties:', error);
      } finally {
        setLoadingCounties(false);
      }
    };
    
    fetchCounties();
  }, []);
  
  useEffect(() => {
    const fetchConstituencies = async () => {
      if (!county) {
        setConstituencies([]);
        setConstituency('');
        setWard('');
        setWards([]);
        return;
      }
      
      setLoadingConstituencies(true);
      try {
        const data = await geographicService.getConstituenciesByCounty(county);
        setConstituencies(data);
        setConstituency('');
        setWard('');
        setWards([]);
      } catch (error) {
        console.error('Error fetching constituencies:', error);
      } finally {
        setLoadingConstituencies(false);
      }
    };
    
    fetchConstituencies();
  }, [county]);
  
  useEffect(() => {
    const fetchWards = async () => {
      if (!constituency) {
        setWards([]);
        setWard('');
        return;
      }
      
      setLoadingWards(true);
      try {
        const data = await geographicService.getWardsByConstituency(constituency);
        setWards(data);
        setWard('');
      } catch (error) {
        console.error('Error fetching wards:', error);
      } finally {
        setLoadingWards(false);
      }
    };
    
    fetchWards();
  }, [constituency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    if (!firstName || !lastName || !phoneNumber || !password || !confirmPassword) {
      setError('Please fill in all required account fields');
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    if (!nationalId || !dateOfBirth) {
      setError('Please fill in National ID and Date of Birth');
      setIsLoading(false);
      return;
    }
    
    if (idAvailable === false) {
      setError('This National ID is already registered. Please use a different ID or login.');
      setIsLoading(false);
      return;
    }
    
    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy');
      setIsLoading(false);
      return;
    }
    
    try {
      const formData = {
        nationalId,
        firstName,
        lastName,
        dateOfBirth,
        county,
        constituency,
        ward,
        phoneNumber,
        email,
        password
      };
      
      await register(formData);
      setSuccess('Registration successful! Redirecting to login...');
      
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
    <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 md:p-8 shadow-2xl shadow-black/20">
      {/* Step Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/10 -z-10" />
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              step.status === 'completed' 
                ? 'bg-emerald-500 text-white' 
                : step.status === 'current'
                ? 'bg-emerald-500/20 border-2 border-emerald-500 text-emerald-400'
                : 'bg-white/10 text-white/30'
            }`}>
              {step.status === 'completed' ? (
                <CheckCircleIcon className="w-5 h-5" />
              ) : (
                index + 1
              )}
            </div>
            <span className={`text-xs mt-2 ${step.status !== 'pending' ? 'text-white/80' : 'text-white/30'}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
        <p className="text-white/50 text-sm">Step 1: Set up your login credentials</p>
      </div>

      {success && (
        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </div>
        </div>
      )}

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

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Account Information</h3>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80">First Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80">Last Name</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <UserIcon className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-white/80">Email Address</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <EnvelopeIcon className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>
            <p className="text-xs text-white/30">We'll send verification links to this email</p>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-white/80">Phone Number</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+254 700 000 000"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                required
              />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80">Confirm Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <LockClosedIcon className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* ID Verification */}
        <div className="space-y-4 pt-4">
          <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">ID Verification</h3>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-white/80">National ID</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value)}
                placeholder="12345678"
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition-all"
                required
              />
              {checkingId && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <svg className="animate-spin w-5 h-5 text-white/30" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
              )}
              {idAvailable === true && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                </div>
              )}
            </div>
            {idError && (
              <p className="text-red-400 text-xs mt-1">{idError}</p>
            )}
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-white/80">Date of Birth</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all [color-scheme:dark]"
                required
              />
            </div>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-white/80">County</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                <MapPinIcon className="w-5 h-5" />
              </div>
              <select
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                disabled={loadingCounties}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                style={{ backgroundImage: 'none' }}
              >
                <option value="" className="bg-[#0a0a0f]">Select County</option>
                {counties.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#0a0a0f]">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80">Constituency</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <select
                  value={constituency}
                  onChange={(e) => setConstituency(e.target.value)}
                  disabled={loadingConstituencies || !county}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="" className="bg-[#0a0a0f]">Select Constituency</option>
                  {constituencies.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#0a0a0f]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-white/80">Ward</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                  <MapPinIcon className="w-5 h-5" />
                </div>
                <select
                  value={ward}
                  onChange={(e) => setWard(e.target.value)}
                  disabled={loadingWards || !constituency}
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="" className="bg-[#0a0a0f]">Select Ward</option>
                  {wards.map((w) => (
                    <option key={w.id} value={w.id} className="bg-[#0a0a0f]">
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 pt-4">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
            className="w-4 h-4 mt-1 bg-white/5 border-white/20 rounded focus:ring-emerald-500/20 focus:ring-offset-0 text-emerald-500"
            required
          />
          <label htmlFor="terms" className="text-sm text-white/50">
            I agree to the{' '}
            <Link href="/terms" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors">
              Privacy Policy
            </Link>
          </label>
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
              Continue to ID Verification
              <ArrowRightIcon className="w-5 h-5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-white/50">
          Already have an account?{' '}
          <Link 
            href="/auth/login" 
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            Sign In
          </Link>
        </p>
      </div>

      {/* Security Badge */}
      <div className="mt-6 flex items-center justify-center gap-2 text-white/30 text-xs">
        <ShieldCheckIcon className="w-4 h-4 text-emerald-500/50" />
        <span>Your Data is Protected with 256-bit Encryption</span>
      </div>
    </div>
  );
}