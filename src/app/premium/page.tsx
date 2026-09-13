import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { TrackPageView } from '@/components/analytics/TrackPageView';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { BUSINESS_CONFIG } from '@/lib/config/business';
import {
  Zap,
  CheckCircle2,
  ShieldCheck,
  Star,
  Award,
  Sparkles,
  BookOpen,
  ArrowRight,
  Unlock,
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Premium Membership & Academic Passes — ScoreEdge SPPU',
  description:
    'Unlock full verified answers, 5-hour emergency crash prep tracks, complete 5-year PYQ repetition clusters, and unlimited exam mode practice.',
  path: '/premium',
  keywords: ['ScoreEdge premium', 'SPPU semester pass', 'DBMS solved paper pass', 'engineering crash course Pune'],
});

export default function PremiumPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Premium Passes', url: '/premium' },
  ]);

  const features = [
    {
      title: 'Full Faculty Model Answers Unlocked',
      description:
        'Free preview limits answers to sample overviews. Premium membership unlocks complete step-by-step solutions, marked engineering diagrams, and 2/5/10-mark breakdown structures.',
      icon: Unlock,
    },
    {
      title: '5-Hour Emergency Crash Tracks',
      description:
        'Night-before examination triage. High-probability topic roadmaps designed to help you prepare the most recurring questions in minimal time.',
      icon: Zap,
    },
    {
      title: 'PYQ Repetition Clusters & Recurrence Odds',
      description:
        'Historical frequency analytics spanning 5+ years of SPPU examination papers, showing exact question recurrence odds and variations.',
      icon: Star,
    },
    {
      title: 'Realistic Exam Mode Simulations',
      description:
        'Timed practice with authentic SPPU paper patterns (Insem 30 marks / Endsem 70 marks) with instant progress metrics and topic mastery feedback.',
      icon: Award,
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b] text-zinc-900 dark:text-zinc-100">
      <TrackPageView eventType="premium page viewed" properties={{ page: '/premium' }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-16 md:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800 mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Engineered for Maximum Semester Scores</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6">
              The Edge You Need to Clear & Score in SPPU
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto mb-8 leading-relaxed">
              No generic tutorials. ScoreEdge Premium delivers targeted, syllabus-aligned answers and repetition intelligence calibrated directly to Pune University evaluation standards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a
                href="#pricing-plans"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-colors"
              >
                <span>View Semester Passes</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-semibold text-sm border border-zinc-300 dark:border-zinc-700 transition-colors"
              >
                <span>Explore Free Samples First</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Why 10,000+ Students Choose Premium
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              Everything you need to eliminate exam surprise and study with absolute focus.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex gap-4"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Pricing Embed */}
        <div id="pricing-plans" className="border-t border-slate-200 dark:border-slate-800 pt-8">
          <PricingSection />
        </div>

        {/* FAQ */}
        <FAQSection />

        {/* Institutional Disclosure */}
        <section className="py-12 border-t border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/40 text-xs text-slate-500">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-2">
            <p>
              Direct UPI activation is powered through our authorized merchant account ({BUSINESS_CONFIG.upiDisplayName}).
            </p>
            <p>
              Need assistance? Email our student helpdesk at <a href={`mailto:${BUSINESS_CONFIG.supportEmail}`} className="text-brand-600 underline">{BUSINESS_CONFIG.supportEmail}</a> or reach out on WhatsApp at {BUSINESS_CONFIG.whatsappDisplayNumber}.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}