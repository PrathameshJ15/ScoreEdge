import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { BUSINESS_CONFIG } from '@/lib/config/business';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Privacy Policy — Student Data Protection',
  description:
    'Read the ScoreEdge Privacy Policy. Learn how we safeguard student data, quiz performance analytics, authentication credentials, and payment records.',
  path: '/privacy',
  keywords: ['ScoreEdge privacy policy', 'student data privacy', 'academic data protection', 'SPPU study app security'],
});

export default function PrivacyPolicyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Privacy Policy', url: '/privacy' },
  ]);

  const lastUpdated = 'September 5, 2026';

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b] text-zinc-900 dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-grow py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="border-b border-zinc-200/80 dark:border-zinc-800 pb-8 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 mb-4">
              <Shield className="w-3.5 h-3.5" />
              <span>Student Privacy Commitment</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
              Privacy Policy
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Effective Date: January 1, 2026 • Last Reviewed & Updated: {lastUpdated}
            </p>
          </div>

          {/* Legal Content Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-8">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                1. Introduction & Overview
              </h2>
              <p>
                This Privacy Policy explains how <strong>{BUSINESS_CONFIG.legalEntity}</strong> (operating as <strong>“{BUSINESS_CONFIG.name}”</strong>, “we”, “our”, or “us”) collects, uses, stores, and protects information when you use our web platform, APIs, and educational services at <Link href="/" className="text-brand-600 hover:underline">{BUSINESS_CONFIG.officialWebsite}</Link>.
              </p>
              <p>
                We recognize the sensitive nature of academic performance records, study habits, and student credentials. We design our systems strictly around student data minimization, isolation, and security.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Information We Collect
              </h2>
              <p>We only collect information necessary to provide and secure our educational intelligence platform:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                <li>
                  <strong>Account Data:</strong> Name, student email address, hashed passwords (via bcrypt salted algorithms), chosen academic year, engineering branch, and semester.
                </li>
                <li>
                  <strong>Academic Progress & Learning Analytics:</strong> Topics studied, quiz attempts, scores, time spent in Exam Mode simulations, repetition cluster reviews, and generated study recommendations.
                </li>
                <li>
                  <strong>Billing & Transaction Records:</strong> Order IDs, Razorpay transaction signatures, UPI payment reference numbers, and active entitlement scopes. <em>Note: ScoreEdge never collects or stores complete debit/credit card numbers or UPI MPINs. All card payments are processed via RBI-authorized payment aggregators.</em>
                </li>
                <li>
                  <strong>Technical Telemetry:</strong> IP address, user-agent string, access timestamps, and error logs collected solely for rate limiting, brute-force security defense, and performance diagnostics.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. How We Use Your Information
              </h2>
              <p>We process your data strictly for legitimate educational and service delivery purposes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                <li>Personalizing student dashboards with “What to study next” recommendations and weak-topic remediation.</li>
                <li>Verifying active entitlements to single-subject or semester-all passes.</li>
                <li>Sending transactional security notifications (password reset emails, payment confirmation receipts).</li>
                <li>Preventing malicious automated scraping, unauthorized credential reuse, or API abuse.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                4. Student Data Isolation & Privacy Guarantee
              </h2>
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-200">
                <div className="font-semibold flex items-center gap-2 mb-1">
                  <Lock className="w-4 h-4 text-emerald-600" />
                  Strict No-Sale Policy
                </div>
                <p className="text-xs leading-relaxed">
                  ScoreEdge does <strong>not sell, rent, monetize, or broker</strong> student contact details, study metrics, or quiz outcomes to third-party advertisers, coaching institutes, or data aggregators.
                </p>
              </div>
              <p>
                Each student’s quiz performance and study plan tasks are partitioned cryptographically by user ID. Cross-tenant access is prohibited and verified by automated server authorization middleware.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                5. Data Retention & Account Deletion
              </h2>
              <p>
                We retain student progress and entitlement records for the active duration of your degree preparation. Students may request complete deletion of their account profile, progress history, and session data at any time by emailing <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="text-brand-600 hover:underline">{BUSINESS_CONFIG.supportEmail}</a> with the subject line <code>Account Deletion Request</code>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                6. Security Measures
              </h2>
              <p>
                We employ industry-standard security safeguards including TLS 1.3 encryption in transit, strict Content Security Policy headers, bcrypt password hashing, timing-safe webhook HMAC verification, and server-level role authorization gates.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                7. Contact the Grievance Officer
              </h2>
              <p>
                In compliance with the Information Technology Act, 2000 and the Digital Personal Data Protection Act (DPDP), inquiries or complaints regarding personal data should be addressed to our designated officer:
              </p>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div><strong>Grievance & Privacy Officer:</strong> Prathamesh J.</div>
                <div><strong>Entity:</strong> {BUSINESS_CONFIG.legalEntity}</div>
                <div><strong>Email:</strong> {BUSINESS_CONFIG.businessEmail}</div>
                <div><strong>Postal Address:</strong> {BUSINESS_CONFIG.registeredAddress}</div>
              </div>
            </section>

          </div>

          {/* Quick Links Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex gap-4">
              <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
              <Link href="/refund" className="hover:text-brand-600">Refund & Cancellation</Link>
              <Link href="/contact" className="hover:text-brand-600">Contact Support</Link>
            </div>
            <span>© {new Date().getFullYear()} {BUSINESS_CONFIG.legalEntity}</span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}