'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Check, Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Student-Friendly Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Study Free. Upgrade for Deeper Intelligence.
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            We never paywall basic PDFs or syllabus files. Premium unlocks time-saving PYQ frequency intelligence, solved 2/5/10-mark answers, and Emergency Exam Mode.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          
          {/* Card 1: Free Tier */}
          <Card className="flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div>
              <CardHeader className="pb-4">
                <Badge variant="outline" className="w-fit">FREE FOREVER</Badge>
                <CardTitle className="text-2xl mt-2">Free Explorer</CardTitle>
                <CardDescription>Essential study resources for every SPPU student.</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹0</span>
                  <span className="text-xs text-slate-500">/ forever</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Full SPPU Syllabus Structure</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Official Question Paper PDFs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Basic Unit Summaries & Notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Topic Search Engine</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Top 3 Important Questions</span>
                </div>
              </CardContent>
            </div>

            <CardFooter className="pt-6">
              <Button variant="outline" className="w-full">
                Get Started Free
              </Button>
            </CardFooter>
          </Card>

          {/* Card 2: Single Subject Pack */}
          <Card className="flex flex-col justify-between border-brand-500 dark:border-brand-500 shadow-xl relative bg-gradient-to-b from-white to-brand-50/30 dark:from-slate-900 dark:to-brand-950/30 ring-2 ring-brand-500/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-600 text-white rounded-full text-[11px] font-bold tracking-wider uppercase shadow-md">
              Most Popular for Exams
            </div>

            <div>
              <CardHeader className="pb-4 pt-2">
                <Badge variant="brand" className="w-fit">SINGLE SUBJECT PASS</Badge>
                <CardTitle className="text-2xl mt-2">Subject Exam Pack</CardTitle>
                <CardDescription>Complete intelligence for one target subject (e.g. DBMS).</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹49</span>
                  <span className="text-xs text-slate-500">/ subject / sem</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Everything in Free Plan</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>PYQ Frequency Analysis & Rankings</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Rephrased Question Clusters</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>2, 5 & 10-Mark Solved Answers</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Emergency 5-Hour Exam Mode</span>
                </div>
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>High-Yield Topic Quizzes</span>
                </div>
              </CardContent>
            </div>

            <CardFooter className="pt-6">
              <Button variant="primary" className="w-full shadow-lg shadow-brand-500/25">
                Unlock DBMS Pack (₹49)
              </Button>
            </CardFooter>
          </Card>

          {/* Card 3: Semester Pack */}
          <Card className="flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div>
              <CardHeader className="pb-4">
                <Badge variant="outline" className="w-fit">BEST VALUE</Badge>
                <CardTitle className="text-2xl mt-2">Semester Pass</CardTitle>
                <CardDescription>Unlocks all SE Computer engineering subjects for the semester.</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">₹199</span>
                  <span className="text-xs text-slate-500">/ semester</span>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>All 5 SE Computer Subjects Included</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Complete Solved PYQs for All Units</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Unlimited Exam Mode Plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Priority Model Question Papers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Weak Area Practice Analytics</span>
                </div>
              </CardContent>
            </div>

            <CardFooter className="pt-6">
              <Button variant="secondary" className="w-full">
                Get Semester Pass (₹199)
              </Button>
            </CardFooter>
          </Card>

        </div>

        {/* Security / Payment guarantee note */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Razorpay Secure UPI & Card Payments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Instant Access Entitlement</span>
          </div>
        </div>

      </div>
    </section>
  );
};
