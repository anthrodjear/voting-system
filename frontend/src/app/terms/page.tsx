'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Terms of Service</h1>
          <p className="text-neutral-500 mb-8">Last Updated: April 2, 2026</p>

          <div className="space-y-6 text-neutral-700">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Acceptance of Terms</h2>
              <p>By accessing and using this Voting System Platform, you accept and agree to be bound by these Terms of Service.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Eligibility</h2>
              <p>You must be a registered voter with a valid National ID to use this platform. You must be at least 18 years of age.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Account Security</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. Do not share your login information with anyone.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Prohibited Activities</h2>
              <ul className="list-disc list-inside space-y-1">
                <li>Attempting to vote more than once in any election</li>
                <li>Using another person&apos;s identity</li>
                <li>Attempting to compromise system security</li>
                <li>Interfering with the electoral process</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Contact</h2>
              <p>For questions about these terms, contact legal@votingsystem.ke</p>
            </section>
          </div>

          <div className="mt-8 text-center">
            <Link href="/" className="text-primary-600 hover:text-primary-700 font-medium">
              Return to Homepage
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
