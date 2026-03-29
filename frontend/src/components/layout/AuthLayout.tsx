'use client';

import { ReactNode } from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ 
  children, 
  title = 'Welcome Back',
  subtitle = 'Sign in to continue to IEBC Voting System'
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-neutral-100 to-neutral-200 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-primary-50/50 to-transparent rotate-12" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-success-50/30 to-transparent -rotate-12" />
        
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgb(0,0,0) 1px, transparent 1px),
              linear-gradient(to bottom, rgb(0,0,0) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center">
            <div className="w-16 h-16 bg-iebc-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/20">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-neutral-900">
            {title}
          </h1>
          <p className="mt-2 text-neutral-500">
            {subtitle}
          </p>
        </div>
        
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl shadow-neutral-200/50 border border-neutral-100 p-8">
          {children}
        </div>
        
        {/* Footer Links */}
        <div className="mt-6 text-center">
          <p className="text-sm text-neutral-500">
            Need help?{' '}
            <Link 
              href="/help" 
              className="font-medium text-primary-600 hover:text-primary-700"
            >
              Contact Support
            </Link>
          </p>
        </div>
        
        {/* Security Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-xs text-neutral-400">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>Secured with blockchain technology</span>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
