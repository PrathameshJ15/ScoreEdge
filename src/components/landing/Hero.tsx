'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Sparkles, ArrowRight, ShieldCheck, Zap, BookCheck, Flame, CheckCircle2 } from 'lucide-react';

export const Hero = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 border-b border-slate-200/60 dark:border-slate-800">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column - Hero Copy */}
          <div className="lg:col-span-7 flex flex-col text-left space-y-6">
            
            {/* Top Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-semibold w-fit">
              <Sparkles className="w-3.5 h-3.5" />
              <span>SPPU 2024 & 2019 PATTERN INTELLIGENCE</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Don&apos;t study everything.{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-purple-600 bg-clip-text text-transparent">
                Study what matters.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl font-normal leading-relaxed">
              ScoreEdge turns scattered SPPU question papers into exact topic frequency maps, 2/5/10-mark solved exam answers, and personalized crash prep plans.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <a href="#pyq-intelligence">
                <Button size="lg" variant="primary" className="gap-2 shadow-lg shadow-brand-500/25 w-full sm:w-auto">
                  <span>Start Preparing Free</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </a>
              <a href="#exam-mode">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Try 5-Hour Exam Mode</span>
                </Button>
              </a>
            </div>

            {/* Trust bullet features */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-600 dark:text-slate-400 border-t border-slate-200/80 dark:border-slate-800/80 mt-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>SE Computer Focus</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>5+ Years PYQ Analyzed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Free Syllabus & PYQs</span>
              </div>
            </div>
          </div>

          {/* Right Column - Interactive Card Preview */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">
              
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs">
                    DBMS
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Database Management Systems</h2>
                    <p className="text-xs text-slate-500">Unit 3: Normalization</p>
                  </div>
                </div>
                <PriorityBadge priority="MUST_STUDY" size="sm" />
              </div>

              {/* Intelligence Snippet */}
              <div className="py-4 space-y-3">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-control p-3 border border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Topic: 3NF vs BCNF Decomposition</span>
                    <span className="font-bold text-red-500 flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      Appeared 4/5 Papers
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-500 h-full rounded-full" style={{ width: '80%' }}></div>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                    <span>Typical Marks: 5–10 Marks</span>
                    <span>Last Asked: 2025 In-Sem</span>
                  </div>
                </div>

                {/* 5-Mark Answer Snippet */}
                <div className="bg-brand-50/50 dark:bg-brand-950/20 border border-brand-200/50 dark:border-brand-800/30 rounded-control p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-brand-700 dark:text-brand-300 flex items-center gap-1">
                      <BookCheck className="w-3.5 h-3.5 text-brand-600" />
                      Exam-Ready 5-Mark Answer
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-200/50 dark:bg-brand-900 text-brand-800 dark:text-brand-200 font-semibold">Verified</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                    &quot;A relation R is in BCNF if for every non-trivial FD X → Y, X is strictly a superkey. Unlike 3NF, BCNF does not allow prime attributes on the right side if X is not a key.&quot;
                  </p>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">6 Question Variations Clustered</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1 hover:underline cursor-pointer">
                  View Full Solved PYQ <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>

            {/* Decorative Glow */}
            <div className="absolute -bottom-6 -right-6 w-64 h-64 bg-brand-500/15 rounded-full blur-3xl -z-10 pointer-events-none" />
          </div>

        </div>
      </div>
    </section>
  );
};
