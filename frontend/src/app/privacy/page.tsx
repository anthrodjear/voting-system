'use client';

import Link from 'next/link';
import { Card } from '@/components/ui';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Card className="p-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Privacy Policy</h1>
          <p className="text-neutral-500 mb-8">Last Updated: April 2, 2026</p>

          <div className="space-y-6 text-neutral-700">
            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Introduction</h2>
              <p>Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Voting System Platform.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Information We Collect</h2>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Personal Information:</strong> National ID, name, date of birth, contact info, address details</li>
                <li><strong>Account Information:</strong> Username, password (hashed), security questions</li>
                <li><strong>Biometric Data:</strong> Facial recognition and fingerprint templates (encrypted)</li>
                <li><strong>Usage Data:</strong> IP address, browser type, access times</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Data Security</h2>
              <p>We implement industry-standard security measures including encryption at rest and in transit, multi-factor authentication, regular security audits, and strict access controls.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Your Rights</h2>
              <p>You may access, update, or delete your personal information. Contact our Data Protection Officer at privacy@votingsystem.ke</p>
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
