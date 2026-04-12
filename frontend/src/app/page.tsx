'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  GlobeAltIcon, 
  UserGroupIcon,
  LockClosedIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ScaleIcon,
  ServerStackIcon,
  KeyIcon,
  FingerPrintIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    document.querySelectorAll('.fade-up, .fade-up-delay').forEach(el => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-teal-500/6 rounded-full blur-[100px] animate-pulse-slow-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-600/5 rounded-full blur-[150px]" />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black_40%,transparent_100%)]" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text">IEBC</span>
                <span className="text-xs text-emerald-400/80 block -mt-1 tracking-wider">BLOCKCHAIN VOTING</span>
              </div>
            </div>

            {/* Nav Links - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/60 hover:text-emerald-400 transition-colors text-sm font-medium">Features</a>
              <a href="#security" className="text-white/60 hover:text-emerald-400 transition-colors text-sm font-medium">Security</a>
              <a href="#stats" className="text-white/60 hover:text-emerald-400 transition-colors text-sm font-medium">Impact</a>
              <Link href="/observer" className="text-white/60 hover:text-emerald-400 transition-colors text-sm font-medium flex items-center gap-1">
                <ChartBarIcon className="w-4 h-4" />
                Live Results
              </Link>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="px-5 py-2.5 text-white/70 hover:text-white font-medium transition-all hover:bg-white/5 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-emerald-500/25 transition-all hover:-translate-y-0.5"
              >
                Register to Vote
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative pt-40 pb-24 px-4 sm:px-6 lg:px-8 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div className="relative z-10">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium mb-8 fade-up">
                <SparklesIcon className="w-4 h-4" />
                Next-Gen Democratic Innovation
              </div>
              
              {/* Main Headline */}
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight fade-up-delay-1">
                <span className="text-white">The Future of</span>
                <br />
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Kenyan Democracy
                </span>
              </h1>
              
              <p className="text-xl text-white/60 mb-10 max-w-xl leading-relaxed fade-up-delay-2">
                Experience the most secure blockchain voting system ever built. 
                Every vote encrypted, every result transparent, your voice matters.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-start gap-4 fade-up-delay-3">
                <Link 
                  href="/auth/register"
                  className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-2xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1 flex items-center gap-3"
                >
                  Register to Vote
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  href="/auth/login"
                  className="px-8 py-4 bg-white/5 text-white font-semibold rounded-2xl border border-white/10 hover:bg-white/10 transition-all flex items-center gap-3"
                >
                  <LockClosedIcon className="w-5 h-5" />
                  Sign In Securely
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-12 flex flex-wrap items-center gap-6 text-sm text-white/40 fade-up-delay-4">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span>IEC Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span>End-to-End Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500" />
                  <span>Zero-Knowledge Proof</span>
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              {/* Floating Cards Container */}
              <div className="relative w-full aspect-square">
                {/* Main Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-96 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-6 float-animation">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <FingerPrintIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">Biometric Auth</div>
                      <div className="text-white/40 text-xs">Face + Fingerprint</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-3/4 animate-pulse" />
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-1/2" />
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-2/3" />
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                    <div className="text-emerald-400 text-sm font-medium">Vote Cast Successfully</div>
                    <div className="text-white/60 text-xs mt-1">Transaction: 0x7a3f...9c21</div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute top-10 right-10 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4 float-animation-delayed">
                  <KeyIcon className="w-8 h-8 text-emerald-400 mb-2" />
                  <div className="text-white/80 text-sm font-medium">Homomorphic</div>
                  <div className="text-white/40 text-xs">Encryption</div>
                </div>

                <div className="absolute bottom-20 left-5 w-36 h-36 bg-gradient-to-br from-teal-500/20 to-cyan-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4 float-animation-slow">
                  <ServerStackIcon className="w-8 h-8 text-teal-400 mb-2" />
                  <div className="text-white/80 text-sm font-medium">Hyperledger</div>
                  <div className="text-white/40 text-xs">Blockchain</div>
                </div>

                <div className="absolute top-1/4 left-0 w-28 h-28 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-xl rounded-2xl border border-white/10 p-4 float-animation-delayed-2">
                  <EyeIcon className="w-6 h-6 text-cyan-400 mb-1" />
                  <div className="text-white/80 text-xs font-medium">Verifiable</div>
                  <div className="text-white/40 text-xs">Transparent</div>
                </div>

                {/* Corner Decorations */}
                <div className="absolute -top-4 -right-4 w-20 h-20 border-t-2 border-r-2 border-emerald-500/30 rounded-tr-2xl" />
                <div className="absolute -bottom-4 -left-4 w-20 h-20 border-b-2 border-l-2 border-emerald-500/30 rounded-bl-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
          <span className="text-xs tracking-widest">SCROLL</span>
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-emerald-500 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: UserGroupIcon, value: '20M+', label: 'Registered Voters', color: 'emerald' },
              { icon: ChartBarIcon, value: '5,000', label: 'Votes/Second', color: 'teal' },
              { icon: ShieldCheckIcon, value: '0', label: 'Security Breaches', color: 'cyan' },
              { icon: GlobeAltIcon, value: '47', label: 'Counties Covered', color: 'emerald' },
            ].map((stat, i) => (
              <div key={i} className="group p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all hover:-translate-y-1">
                <stat.icon className={`w-8 h-8 text-${stat.color}-400 mb-4 group-hover:scale-110 transition-transform`} />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 fade-up">
              <span className="text-white">Why </span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">IEBC Blockchain</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              Modern technology meets democratic integrity. Our system ensures every vote counts and is counted correctly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: ShieldCheckIcon,
                title: 'Secure & Verifiable',
                description: 'Blockchain technology ensures that once a vote is cast, it cannot be altered or deleted. Every transaction is cryptographically secured.',
                gradient: 'from-emerald-500/20 to-teal-500/10',
                borderColor: 'emerald'
              },
              {
                icon: GlobeAltIcon,
                title: 'Accessible Anywhere',
                description: 'Vote from anywhere in Kenya using your smartphone, tablet, or computer. Our platform is inclusive and accessible to all.',
                gradient: 'from-teal-500/20 to-cyan-500/10',
                borderColor: 'teal'
              },
              {
                icon: EyeIcon,
                title: 'Transparent Process',
                description: 'Real-time results with complete transparency. The public can verify the vote count while individual choices remain private.',
                gradient: 'from-cyan-500/20 to-blue-500/10',
                borderColor: 'cyan'
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className={`group p-8 bg-gradient-to-br ${feature.gradient} backdrop-blur-xl rounded-3xl border border-white/5 hover:border-${feature.borderColor}-500/30 transition-all hover:-translate-y-2 hover:shadow-xl hover:shadow-${feature.borderColor}-500/10`}
              >
                <div className={`w-14 h-14 bg-${feature.borderColor}-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`w-7 h-7 text-${feature.borderColor}-400`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-white/50 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold mb-6">
                <span className="text-white">Bank-Grade </span>
                <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Security</span>
              </h2>
              <p className="text-lg text-white/50 mb-10">
                Our system uses the same security standards as leading financial institutions. 
                Your vote is protected by multiple layers of encryption.
              </p>

              <div className="space-y-6">
                {[
                  { icon: LockClosedIcon, title: 'End-to-End Encryption', desc: 'Your vote is encrypted before it leaves your device and can only be decrypted by the election system.' },
                  { icon: DocumentTextIcon, title: 'Immutable Records', desc: 'Once recorded on the blockchain, your vote cannot be changed or deleted.' },
                  { icon: ClockIcon, title: 'Real-Time Monitoring', desc: '24/7 system monitoring detects and prevents any suspicious activity.' },
                  { icon: FingerPrintIcon, title: 'Multi-Factor Biometrics', desc: 'Face recognition and fingerprint verification for maximum security.' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 group">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 group-hover:bg-emerald-500/20 transition-colors">
                      <item.icon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-white/40 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              {/* Security Visual */}
              <div className="bg-gradient-to-br from-emerald-900/50 to-teal-900/50 backdrop-blur-xl rounded-3xl p-8 border border-emerald-500/20">
                <div className="space-y-4">
                  {/* Animated Progress Bars */}
                  <div className="bg-white/5 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/60 text-sm">Encryption Level</span>
                      <span className="text-emerald-400 font-bold">256-bit AES</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-full animate-pulse" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-2xl font-bold text-white mb-1">100%</div>
                      <div className="text-white/40 text-xs">System Uptime</div>
                    </div>
                    <div className="bg-white/5 rounded-xl p-4">
                      <div className="text-2xl font-bold text-emerald-400 mb-1">0</div>
                      <div className="text-white/40 text-xs">Breaches</div>
                    </div>
                  </div>

                  {/* Shield Animation */}
                  <div className="flex items-center justify-center py-6">
                    <div className="relative">
                      <div className="w-20 h-24 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
                        <ShieldCheckIcon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              <span className="text-white">How It </span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-lg text-white/50 max-w-2xl mx-auto">
              A simple, secure process to cast your vote
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Register', desc: 'Create your account with ID verification', icon: UserGroupIcon },
              { step: '02', title: 'Authenticate', desc: 'Verify with biometrics (face + fingerprint)', icon: FingerPrintIcon },
              { step: '03', title: 'Vote', desc: 'Cast your vote securely with encryption', icon: CheckCircleIcon },
              { step: '04', title: 'Verify', desc: 'Track your vote on the blockchain', icon: EyeIcon },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="p-6 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all h-full">
                  <div className="text-5xl font-bold text-emerald-500/20 mb-4">{item.step}</div>
                  <item.icon className="w-8 h-8 text-emerald-400 mb-3" />
                  <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-white/40 text-sm">{item.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2">
                    <ArrowRightIcon className="w-6 h-6 text-emerald-500/30" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 relative">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Glow Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
          
          <div className="relative bg-gradient-to-br from-[#0f1a14] to-[#0a1210] rounded-3xl p-12 border border-emerald-500/20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Exercise Your Democratic Right?
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
              Register today and be part of Kenya's technological revolution in democratic elections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link 
                href="/auth/register"
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-emerald-500/20 transition-all hover:-translate-y-1"
              >
                Register to Vote
              </Link>
              <Link 
                href="/auth/login"
                className="px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 hover:bg-white/10 transition-all"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
                  <ShieldCheckIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                  <span className="text-xl font-bold text-white">IEBC</span>
                  <span className="text-xs text-emerald-400/80 block">Blockchain Voting</span>
                </div>
              </div>
              <p className="text-white/40 max-w-md text-sm leading-relaxed">
                The Independent Electoral and Boundaries Commission (IEBC) is committed to 
                delivering free, fair, and credible elections through innovative technology.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">Elections</a></li>
                <li><a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">Voter Education</a></li>
                <li><Link href="/observer" className="text-white/40 hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <ChartBarIcon className="w-3 h-3" />
                  Live Election Results
                </Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-white/40 hover:text-emerald-400 transition-colors">Contact Us</a></li>
                <li><Link href="/privacy" className="text-white/40 hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-white/40 hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/30 text-sm">
              © {new Date().getFullYear()} IEBC. All rights reserved.
            </p>
            <div className="flex items-center gap-4 text-sm text-white/30">
              <span>Designed for Kenya's Democratic Future</span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        @keyframes float-animation {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-animation-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        
        @keyframes float-animation-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
        }
        
        @keyframes float-animation-delayed-2 {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .float-animation {
          animation: float-animation 6s ease-in-out infinite;
        }
        
        .float-animation-delayed {
          animation: float-animation-delayed 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        
        .float-animation-slow {
          animation: float-animation-slow 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .float-animation-delayed-2 {
          animation: float-animation-delayed-2 5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-pulse-slow-delayed {
          animation: pulse-slow 4s ease-in-out infinite;
          animation-delay: 2s;
        }
        
        .fade-up {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        .fade-up-delay {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out;
        }
        
        .fade-up-delay-1 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out 0.1s;
        }
        
        .fade-up-delay-2 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out 0.2s;
        }
        
        .fade-up-delay-3 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out 0.3s;
        }
        
        .fade-up-delay-4 {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.6s ease-out 0.4s;
        }
        
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}