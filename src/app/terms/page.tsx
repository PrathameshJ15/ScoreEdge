import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { BUSINESS_CONFIG } from '@/lib/config/business';
import { FileText, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Terms of Service — User Agreement & Acceptable Use',
  description:
    'Review the ScoreEdge Terms of Service. Understand subscription rights, acceptable usage of study materials, intellectual property notices, and account rules.',
  path: '/terms',
  keywords: ['ScoreEdge terms of service', 'academic terms', 'user agreement Pune', 'study materials copyright'],
});

export default function TermsPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Terms of Service', url: '/terms' },
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
              <FileText className="w-3.5 h-3.5" />
              <span>Legal Terms & User Agreement</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-2">
              Terms of Service
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Effective Date: January 1, 2026 • Last Reviewed & Updated: {lastUpdated}
            </p>
          </div>

          {/* Legal Body */}
          <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed space-y-8">
            
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                1. Acceptance of Terms
              </h2>
              <p>
                By creating an account, accessing, or purchasing any educational pass on <strong>{BUSINESS_CONFIG.name}</strong> (<Link href="/" className="text-brand-600 hover:underline">{BUSINESS_CONFIG.officialWebsite}</Link>), you agree to be bound by these Terms of Service between you and <strong>{BUSINESS_CONFIG.legalEntity}</strong>.
              </p>
              <p>
                If you do not agree to these terms, you must refrain from using the platform or creating an account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                2. Academic Disclaimer & Non-Affiliation
              </h2>
              <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-200">
                <div className="font-semibold flex items-center gap-2 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  Independent Educational Publisher Notice
                </div>
                <p className="text-xs leading-relaxed">
                  ScoreEdge is an independent academic study resource. We are <strong>not affiliated with, authorized, sponsored, or certified</strong> by Savitribai Phule Pune University (SPPU). All university names, abbreviations, examination patterns, course syllabi, and public past papers are utilized under fair educational use principles to assist engineering students in academic self-study.
                </p>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                3. Single-User License & Permitted Usage
              </h2>
              <p>
                Upon purchasing a Single Subject Pass or Semester-All Pass, you are granted a non-exclusive, non-transferable, revocable single-user license to access the licensed study notes, verified answers, and practice quizzes for personal academic preparation.
              </p>
              <p><strong>Prohibited Actions:</strong></p>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 dark:text-slate-300">
                <li>Sharing your student credentials or account access with classmates, peer groups, or commercial institutions.</li>
                <li>Systematically downloading, scraping, mass copying, or redistributing solved model answers onto public cloud drives, Telegram channels, or file-sharing websites.</li>
                <li>Attempting to circumvent entitlement locks, API rate limits, or backend authorization middleware.</li>
                <li>Using automated bots or crawlers to extract question banks or content.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                4. Academic Outcomes Disclaimer
              </h2>
              <p>
                While ScoreEdge employs rigorous statistical clustering and historical PYQ frequency intelligence to highlight high-yield concepts, <strong>we do not guarantee specific grades, marks, examination question repetition, or university passing outcomes</strong>. University examination boards retain full discretion over examination questions, question wording, and marking schemes.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                5. Payments, Subscriptions & Pricing
              </h2>
              <p>
                All prices are stated in Indian Rupees (INR) inclusive of applicable taxes. Passes are activated immediately upon online payment verification or UPI receipt validation. Pass validity corresponds to the academic term (semester examination cycle) specified during checkout.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                6. Termination of Access
              </h2>
              <p>
                We reserve the right to suspend or terminate accounts found in breach of our acceptable use policy, including automated scraping, credential sharing, or abusive behavior toward our academic support staff.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                7. Governing Law & Jurisdiction
              </h2>
              <p>
                These Terms are governed by and construed in accordance with the laws of India. Any legal dispute or proceeding arising out of or related to our platform shall be subject to the exclusive jurisdiction of the competent courts in <strong>Pune, Maharashtra, India</strong>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                8. Contact for Legal Inquiries
              </h2>
              <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <div><strong>Corporate Entity:</strong> {BUSINESS_CONFIG.legalEntity}</div>
                <div><strong>Email:</strong> {BUSINESS_CONFIG.businessEmail}</div>
                <div><strong>Administrative Hub:</strong> {BUSINESS_CONFIG.registeredAddress}</div>
              </div>
            </section>

          </div>

          {/* Quick Links Footer */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex gap-4">
              <Link href="/privacy" className="hover:text-brand-600">Privacy Policy</Link>
              <Link href="/refund" className="hover:text-brand-600">Refund Policy</Link>
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