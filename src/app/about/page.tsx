import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { BUSINESS_CONFIG } from '@/lib/config/business';
import {
  GraduationCap,
  Target,
  BookOpen,
  Award,
  Sparkles,
  ArrowRight,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'About Us — Academic Mission & Methodology',
  description:
    'Learn about ScoreEdge, our academic mission, rigorous PYQ frequency verification methodology, and how we help SPPU engineering students study with high-yield focus.',
  path: '/about',
  keywords: ['About ScoreEdge', 'SPPU exam analysis', 'Engineering faculty Pune', 'PYQ clustering methodology'],
});

export default function AboutPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'About Us', url: '/about' },
  ]);

  const pillars = [
    {
      icon: Target,
      title: 'High-Yield PYQ Intelligence',
      description:
        'We do not treat exam prep as reading an entire textbook from page 1 to 600. Through 5+ years of verified SPPU university papers (2019 Pattern), we cluster repetitive concepts and identify the exact 20% that accounts for 80% of exam marks.',
    },
    {
      icon: ShieldCheck,
      title: 'Faculty-Verified Solutions',
      description:
        'Every solved answer includes precise SPPU rubric breakdowns: required definition, stepwise working, marked architecture diagrams, and clean bulleted points formulated specifically for maximum marks under Pune University evaluation.',
    },
    {
      icon: Sparkles,
      title: 'Emergency Crash Preparation',
      description:
        'For students preparing with limited time before Insem or Endsem exams, our 5-Hour Crash Prep tracks isolate high-probability topics and guaranteed numerical patterns with step-by-step revision checklists.',
    },
  ];

  const milestones = [
    { number: '10,000+', label: 'SPPU Students Assisted' },
    { number: '5+ Years', label: 'Solved PYQs Clustered' },
    { number: '99.4%', label: 'Syllabus Alignment Accuracy' },
    { number: '2/5/10', label: 'Mark Rubric Structured Answers' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b] text-zinc-900 dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-grow">
        {/* Header Hero */}
        <section className="relative overflow-hidden py-16 md:py-24 border-b border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900/40">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800 mb-6">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Dedicated Exclusively to SPPU Engineering</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
              Don’t study everything. <br />
              <span className="text-brand-600 dark:text-brand-400">Study what actually matters.</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
              ScoreEdge was founded by Pune University engineering alumni and academic researchers who experienced firsthand the anxiety of vague syllabus weightages, scattered past question papers, and poorly formulated local publications.
            </p>
          </div>
        </section>

        {/* Core Pillars */}
        <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
              The ScoreEdge Methodology
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-2">
              How our data-driven academic intelligence replaces rote memorization with systematic exam mastery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 bg-brand-600 dark:bg-brand-900 text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {milestones.map((m, idx) => (
                <div key={idx} className="p-4">
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-1">
                    {m.number}
                  </div>
                  <div className="text-xs sm:text-sm font-medium text-brand-100">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Institutional Disclosure & Trust */}
        <section className="py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Academic Integrity & Trademark Disclosure
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              <strong>{BUSINESS_CONFIG.legalEntity}</strong> operates {BUSINESS_CONFIG.name} as an independent academic preparation platform. We are not officially affiliated with, endorsed by, or sponsored by Savitribai Phule Pune University (SPPU). All syllabi, subject codes, and public university past examination questions referenced on this platform remain the intellectual property of their respective creators and university authorities.
            </p>
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {BUSINESS_CONFIG.regionalOffice}
              </span>
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {BUSINESS_CONFIG.businessEmail}
              </span>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 text-center">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to streamline your SPPU engineering scores?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-8">
              Explore our subject repositories, inspect repetitive question clusters, or unlock semester passes.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-md transition-colors"
              >
                <span>Browse Subjects</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-300 dark:border-slate-700 transition-colors"
              >
                <span>Contact Academic Team</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}