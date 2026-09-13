'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, ShieldCheck, Zap, ArrowRight, Lock } from 'lucide-react';

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Transparent Student Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study Free. Upgrade for Precision Intel.
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
            Official SPPU syllabus files and question papers are 100% free forever. Premium passes unlock topic frequency analysis, solved evaluator rubrics, and emergency exam triage.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Card 1: Free Explorer */}
          <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Free Forever
                </span>
                <span className="text-[11px] font-mono text-slate-400">Basic Tier</span>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Free Explorer</h3>
                <p className="text-xs text-slate-500 mt-1">Foundational resources for every engineering student.</p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">₹0</span>
                  <span className="text-xs text-slate-500 font-mono">/ semester</span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Full SPPU syllabus structures (2019 &amp; 2024 schemes)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Official past examination paper PDF archive</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Basic unit overviews &amp; topic search engine</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Top 3 important questions per unit</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <a href="#pyq-intelligence">
                <Button variant="outline" className="w-full text-xs">
                  Access Free Material
                </Button>
              </a>
            </div>
          </div>

          {/* Card 2: Single Subject Pass */}
          <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border-2 border-brand-500 dark:border-brand-500 shadow-xl shadow-brand-500/5 dark:shadow-brand-500/10 flex flex-col justify-between relative">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-brand-600 text-white rounded-full text-[10px] font-bold font-mono tracking-wider uppercase shadow-sm">
              Most Popular for Exams
            </div>

            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 pt-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Targeted Subject Pass
                </span>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Instant Access</span>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Subject Exam Pack</h3>
                <p className="text-xs text-slate-500 mt-1">Complete intelligence for one subject (e.g. DBMS).</p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">₹49</span>
                  <span className="text-xs text-slate-500 font-mono">/ subject / exam sem</span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Everything in Free Explorer</span>
                </div>
                <div className="flex items-start gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>5-Year PYQ recurrence frequency &amp; rankings</span>
                </div>
                <div className="flex items-start gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Rephrased question clusters across all units</span>
                </div>
                <div className="flex items-start gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>2, 5 &amp; 10-mark solved examiner rubrics</span>
                </div>
                <div className="flex items-start gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Emergency 2h &amp; 5h Exam Mode triage checklists</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Link href="/pricing?plan=subject&id=dbms">
                <Button variant="primary" className="w-full text-xs shadow-sm gap-1.5">
                  <span>Unlock DBMS Pass (₹49)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Card 3: Semester Pass */}
          <div className="p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                  Full Semester Access
                </span>
                <span className="text-[11px] font-mono text-brand-600 dark:text-brand-400 font-bold">Best Value</span>
              </div>

              <div className="mt-4">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">All-Access Semester Pass</h3>
                <p className="text-xs text-slate-500 mt-1">All SE Computer engineering subjects unlocked.</p>
                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">₹199</span>
                  <span className="text-xs text-slate-500 font-mono">/ entire semester</span>
                </div>
              </div>

              <div className="mt-6 space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-start gap-2.5 font-medium">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>All 5 SE Computer subjects included (DBMS, DSA, OOP, OS, TOC)</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Complete solved answers for In-Sem &amp; End-Sem units</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Unlimited personalized exam triage schedules</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Priority model question papers for upcoming exams</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
              <Link href="/pricing?plan=semester">
                <Button variant="secondary" className="w-full text-xs">
                  Get Semester Pass (₹199)
                </Button>
              </Link>
            </div>
          </div>

        </div>

        {/* Payment & Guarantee Strip */}
        <div className="mt-12 text-center flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Razorpay Encrypted UPI &amp; Cards</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant Digital Entitlement</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-slate-400" />
            <span>Zero Auto-Renewing Subscriptions</span>
          </div>
        </div>

      </div>
    </section>
  );
};

