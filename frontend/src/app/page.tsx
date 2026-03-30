import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-iebc-primary rounded-xl flex items-center justify-center">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold text-neutral-900">IEBC</span>
                <span className="text-xs text-neutral-500 block -mt-1">Blockchain Voting</span>
              </div>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-neutral-600 hover:text-neutral-900 transition-colors">Features</a>
              <a href="#security" className="text-neutral-600 hover:text-neutral-900 transition-colors">Security</a>
              <a href="#about" className="text-neutral-600 hover:text-neutral-900 transition-colors">About</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-5 py-2.5 bg-iebc-primary text-white font-semibold rounded-lg hover:bg-primary-700 transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                Register to Vote
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-neutral-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-light text-success-dark rounded-full text-sm font-medium mb-6">
              <LockClosedIcon className="w-4 h-4" />
              Blockchain-Powered Security
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 leading-tight">
              Secure & Transparent
              <span className="block text-gradient">Elections for Kenya</span>
            </h1>
            
            <p className="text-xl text-neutral-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Experience the future of democracy with our blockchain-based voting system. 
              Every vote is encrypted, verifiable, and tamper-proof.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/register"
                className="w-full sm:w-auto px-8 py-4 bg-iebc-primary text-white font-semibold rounded-xl hover:bg-primary-700 transition-all hover:-translate-y-1 hover:shadow-xl flex items-center justify-center gap-2"
              >
                Register Now
                <ArrowRightIcon className="w-5 h-5" />
              </Link>
              <Link 
                href="/login"
                className="w-full sm:w-auto px-8 py-4 bg-white text-neutral-700 font-semibold rounded-xl border-2 border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-all flex items-center justify-center gap-2"
              >
                Sign In to Vote
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-neutral-500">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-success" />
                <span className="text-sm">IEC Compliant</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-success" />
                <span className="text-sm">End-to-End Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-success" />
                <span className="text-sm">24/7 Monitoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Why Choose IEBC Blockchain Voting?
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Modern technology meets democratic integrity. Our system ensures every vote counts and is counted correctly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheckIcon className="w-8 h-8 text-primary-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Secure & Verifiable</h3>
              <p className="text-neutral-600 leading-relaxed">
                Blockchain technology ensures that once a vote is cast, it cannot be altered or deleted. 
                Every transaction is cryptographically secured and publicly verifiable.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-success-light rounded-xl flex items-center justify-center mb-6">
                <GlobeAltIcon className="w-8 h-8 text-success" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Accessible Anywhere</h3>
              <p className="text-neutral-600 leading-relaxed">
                Vote from anywhere in Kenya using your smartphone, tablet, or computer. 
                Our platform is designed to be inclusive and accessible to all voters.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-neutral-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-voter-50 rounded-xl flex items-center justify-center mb-6">
                <UserGroupIcon className="w-8 h-8 text-voter-500" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-3">Transparent Process</h3>
              <p className="text-neutral-600 leading-relaxed">
                Real-time results with complete transparency. The public can verify 
                the vote count while individual choices remain private.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-6">
                Bank-Grade Security for Your Vote
              </h2>
              <p className="text-lg text-neutral-600 mb-8">
                Our system uses the same security standards employed by leading financial institutions. 
                Your vote is protected by multiple layers of encryption.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <LockClosedIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">End-to-End Encryption</h4>
                    <p className="text-neutral-600 text-sm">Your vote is encrypted before it leaves your device and can only be decrypted by the election system.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <DocumentTextIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Immutable Records</h4>
                    <p className="text-neutral-600 text-sm">Once recorded on the blockchain, your vote cannot be changed or deleted.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-success-light rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <ClockIcon className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">Real-Time Monitoring</h4>
                    <p className="text-neutral-600 text-sm">24/7 system monitoring detects and prevents any suspicious activity.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 text-white">
                <div className="bg-white/10 backdrop-blur rounded-2xl p-6 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm opacity-80">Voters Registered</span>
                    <span className="text-2xl font-bold">2.5M+</span>
                  </div>
                  <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full w-3/4" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">0</div>
                    <div className="text-sm opacity-80">Security Breaches</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                    <div className="text-3xl font-bold mb-1">100%</div>
                    <div className="text-sm opacity-80">Uptime</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-iebc-gradient">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Exercise Your Democratic Right?
          </h2>
          <p className="text-xl text-white/90 mb-10">
            Register today and be part of Kenya's technological revolution in democratic elections.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/register"
              className="w-full sm:w-auto px-8 py-4 bg-white text-iebc-primary font-semibold rounded-xl hover:bg-neutral-100 transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              Register to Vote
            </Link>
            <Link 
              href="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">IEBC</span>
              </div>
              <p className="text-sm max-w-md">
                The Independent Electoral and Boundaries Commission (IEBC) is committed to 
                delivering free, fair, and credible elections through innovative technology.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Elections</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Voter Education</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Resources</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} IEBC. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span>Designed for Kenya's Democratic Future</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
