import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { BUSINESS_CONFIG } from '@/lib/config/business';
import { RefreshCw, CheckCircle2, Clock, HelpCircle, ShieldCheck, Mail } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Refund & Cancellation Policy — Fair Academic Purchases',
  description:
    'Learn about ScoreEdge refund rules, UPI payment failure resolution, duplicate charge handling, and eligibility timelines for digital educational passes.',
  path: '/refund',
  keywords: ['ScoreEdge refund policy', 'UPI payment refund Pune', 'student pass cancellation', 'duplicate payment resolution'],
});

export default function RefundPolicyPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Refund Policy', url: '/refund' },
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800 mb-4">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Transparent Student Guarantee</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
              Refund & Cancellation Policy
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Effective Date: January 1, 2026 • Last Reviewed & Updated: {lastUpdated}
            </p>
          </div>

          {/* Legal Content */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-8">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                1. Nature of Digital Goods
              </h2>
              <p>
                ScoreEdge provides instant digital access to proprietary academic resources, including verified model answers, 2/5/10-mark breakdowns, 5-hour emergency crash prep tracks, and interactive exam mode simulations.
              </p>
              <p>
                Because access is granted immediately upon transaction verification, digital passes are generally considered consumed. However, we maintain a <strong>student-first fairness policy</strong> to protect our users against technical failures and duplicate charges.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Guaranteed Refund Circumstances
              </h2>
              <p>We provide full refunds without dispute under the following circumstances:</p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Duplicate Deductions
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    If your bank account or UPI application is charged multiple times for the same order due to network timeouts, duplicate charges are automatically reversed or refunded upon verification within 24–48 hours.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Technical Activation Failure
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    If your payment is debited but our automated system fails to grant entitlement access within 12 hours and our support team is unable to manually provision your pass upon notification.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Wrong Subject Pass Purchased (Within 24 Hours)
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    If you mistakenly purchased Pass A (e.g. DBMS) instead of Pass B (e.g. DSA) and have not engaged in mass reading of the mistakenly purchased module, notify us within 24 hours and we will migrate your entitlement free of charge or issue a refund.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Non-Refundable Scenarios
              </h2>
              <p>Refunds cannot be approved in the following cases:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                <li>Refund requests submitted after 48 hours of purchase where digital materials have already been accessed.</li>
                <li>Dissatisfaction arising from an examination question paper not mirroring specific practice questions (as university question papers are independently set by university panels).</li>
                <li>Accounts suspended or terminated due to unauthorized scraping, mass downloading, or credential redistribution.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                4. How to Request a Refund
              </h2>
              <p>
                To request a refund or payment correction, contact us via any of the following channels:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-700 dark:text-slate-300">
                <li><strong>Email:</strong> Send your Order ID and UPI Reference (UTR) to <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="text-brand-600 hover:underline">{BUSINESS_CONFIG.supportEmail}</a> with the subject line <code>Refund Request — [Order ID]</code>.</li>
                <li><strong>WhatsApp:</strong> Message our payment desk at <strong>{BUSINESS_CONFIG.whatsappDisplayNumber}</strong> with a screenshot of the transaction receipt.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                5. Refund Processing Timeline
              </h2>
              <p>
                Once approved, refunds are initiated back to the original payment source (UPI account, debit card, or net banking) via our payment gateway within <strong>3 to 7 business days</strong>, depending on your issuing bank’s standard clearing turnaround.
              </p>
            </section>

          </div>

          {/* Quick Links Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-brand-600">Terms of Service</Link>
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