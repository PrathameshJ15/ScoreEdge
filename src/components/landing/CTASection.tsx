'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowRight, ShieldCheck, CheckCircle2, BookOpen } from 'lucide-react';

export const CTASection = () => {
  return (
    <section className="py-20 md:py-28 bg-[#faf9f5] dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-3xl bg-[#0f172a] text-white p-8 sm:p-12 md:p-16 border border-slate-800 shadow-2xl overflow-hidden text-center max-w-5xl mx-auto">
          
          {/* Subtle Radial Mesh Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-teal-500/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <span>SPPU Exam Season Readiness</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Your Goals. Our Support. <br />
              <span className="text-teal-400">
                A Smarter Way to Prepare.
              </span>
            </h2>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Don&apos;t risk your SGPA on scattered textbooks and unverified notes. Master the high-yield topic clusters SPPU examiners repeat every season.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-lg shadow-teal-900/20 px-8 py-3">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/subjects" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto border-slate-700 text-white hover:bg-slate-800 font-semibold px-6 py-3">
                  <BookOpen className="w-4 h-4 text-teal-400" />
                  <span>Explore Subjects</span>
                </Button>
              </Link>
            </div>

            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Instant Digital Access</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>100% Free Syllabus &amp; PYQs</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                <span>Zero Subscription Lock-In</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
