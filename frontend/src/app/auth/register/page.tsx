'use client';

import Link from 'next/link';
import { 
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  PhoneIcon,
  ArrowRightIcon,
  CalendarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import { Button, Input, Card, StepIndicator } from '@/components/ui';
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
  
  // Form state for account step
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Form state for ID verification step
  const [nationalId, setNationalId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [county, setCounty] = useState('');
  const [constituency, setConstituency] = useState('');
  const [ward, setWard] = useState('');
  
  // Geographic data state
  const [counties, setCounties] = useState<GeographicOption[]>([]);
  const [constituencies, setConstituencies] = useState<GeographicOption[]>([]);
  const [wards, setWards] = useState<GeographicOption[]>([]);
  
  // Loading states for geographic data
  const [loadingCounties, setLoadingCounties] = useState(false);
  const [loadingConstituencies, setLoadingConstituencies] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  
  // Terms acceptance state
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // ID availability check
  const [idAvailable, setIdAvailable] = useState<boolean | null>(null);
  const [checkingId, setCheckingId] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  
  // Debounced national ID for checking
  const debouncedNationalId = useDebounce(nationalId, 500);
  
  // Check ID availability when it changes
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
        // Graceful degradation: if check fails, allow form submission
        // The actual registration endpoint will validate properly
        console.warn('ID availability check unavailable, will validate on submit:', error);
        setIdAvailable(null);
        setIdError(null);
        setIdError(null);
      } finally {
        setCheckingId(false);
      }
    };
    
    checkId();
  }, [debouncedNationalId]);
  
  // Fetch counties on component mount
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
  
  // Fetch constituencies when county changes
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
  
  // Fetch wards when constituency changes
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
    
    // Basic validation (email is optional per backend)
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
    
    // Validate ID verification fields (geographic fields are optional per backend)
    if (!nationalId || !dateOfBirth) {
      setError('Please fill in National ID and Date of Birth');
      setIsLoading(false);
      return;
    }
    
    // Check if ID is available before submitting
    if (idAvailable === false) {
      setError('This National ID is already registered. Please use a different ID or login.');
      setIsLoading(false);
      return;
    }
    
    // Validate terms acceptance
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
      setSuccess('Registration successful! Please login with your credentials.');
      
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
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414 1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Account Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">Account Information</h3>
          
          <Input
            label="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            placeholder="John"
            leftIcon={<UserIcon className="w-5 h-5" />}
            autoComplete="given-name"
            required
          />
          
          <Input
            label="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            type="text"
            placeholder="Doe"
            leftIcon={<UserIcon className="w-5 h-5" />}
            autoComplete="family-name"
            required
          />
          
          <Input
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            leftIcon={<EnvelopeIcon className="w-5 h-5" />}
            helperText="We'll send verification links to this email"
            autoComplete="email"
          />
          
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            type="tel"
            placeholder="+254 700 000 000"
            leftIcon={<PhoneIcon className="w-5 h-5" />}
            helperText="For SMS notifications and account recovery"
            autoComplete="tel"
            required
          />
          
          <Input
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Create a strong password"
            leftIcon={<LockClosedIcon className="w-5 h-5" />}
            helperText="Min 8 characters with uppercase, lowercase, numbers, and symbols"
            required
            autoComplete="new-password"
          />
          
          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            placeholder="Confirm your password"
            leftIcon={<LockClosedIcon className="w-5 h-5" />}
            required
            autoComplete="new-password"
          />
        </div>
        
        {/* ID Verification */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-neutral-900">ID Verification</h3>
          
          <Input
            label="National ID"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
            type="text"
            placeholder="12345678"
            leftIcon={<UserIcon className="w-5 h-5" />}
            helperText={idAvailable === true ? '✓ This ID is available' : checkingId ? 'Checking...' : 'Your national identification number'}
            error={idError || undefined}
            required
          />
          
          <Input
            label="Date of Birth"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            type="date"
            leftIcon={<CalendarIcon className="w-5 h-5" />}
            helperText="Your date of birth"
            required
          />
          
          <Input
            label="County"
            name="county"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            as="select"
            leftIcon={<MapPinIcon className="w-5 h-5" />}
            disabled={loadingCounties}
            className={loadingCounties ? 'opacity-75' : ''}
          >
            <option value="">Select County</option>
            {counties.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Input>
          
          <Input
            label="Constituency"
            name="constituency"
            value={constituency}
            onChange={(e) => setConstituency(e.target.value)}
            as="select"
            leftIcon={<MapPinIcon className="w-5 h-5" />}
            disabled={loadingConstituencies || !county}
            className={loadingConstituencies ? 'opacity-75' : ''}
          >
            <option value="">Select Constituency</option>
            {constituencies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Input>
          
          <Input
            label="Ward"
            name="ward"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            as="select"
            leftIcon={<MapPinIcon className="w-5 h-5" />}
            disabled={loadingWards || !constituency}
            className={loadingWards ? 'opacity-75' : ''}
          >
            <option value="">Select Ward</option>
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </Input>
        </div>

        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            checked={termsAccepted}
            onChange={(e) => setTermsAccepted(e.target.checked)}
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
