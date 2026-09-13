'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  TrendingUp,
  FileText,
  Search,
  Sparkles,
  Layers,
  Database,
  ShieldCheck,
  Play,
  Volume2,
  Calendar,
  BookOpen,
  Award,
  ChevronRight,
  Mic
} from 'lucide-react';

export const Hero = () => {
  const [activeTab, setActiveTab] = useState<'learn' | 'practice' | 'test'>('learn');

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 bg-[#faf9f5] dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
      {/* Subtle Dot Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 dark:opacity-20 [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: Headline, Copy, CTAs, Benefit Pills */}
          <div className="lg:col-span-6 space-y-6 text-left">
            
            {/* Eyebrow Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
              <span className="font-mono uppercase tracking-wider text-[11px]">SPPU EXAM PREPARATION</span>
              <span className="text-teal-400">•</span>
              <span className="text-[11px] font-medium">2024 & 2019 Pattern</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0f172a] dark:text-white tracking-tight leading-[1.12]">
              Study Smarter.{' '}
              <span className="text-teal-700 dark:text-teal-400 underline decoration-teal-300 dark:decoration-teal-600 decoration-wavy decoration-2 underline-offset-8">
                Score Higher.
              </span>
            </h1>

            {/* Supporting Text */}
            <p className="text-base sm:text-lg text-[#334155] dark:text-slate-300 font-normal leading-relaxed max-w-xl">
              Master SPPU engineering exams with original notes, a 2,400+ Question Bank, verified Question Papers, recurring PYQ intelligence, AI-powered learning, and an interactive voice tutor.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="gap-2 w-full sm:w-auto bg-teal-700 hover:bg-teal-800 text-white shadow-md shadow-teal-900/10 font-semibold px-6 py-3">
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/subjects" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-[#0f172a] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold px-6 py-3">
                  <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                  <span>Explore Subjects</span>
                </Button>
              </Link>
            </div>

            {/* 4 Feature / Benefit Pills */}
            <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold text-[#0f172a] dark:text-slate-200">Verified Content</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold text-[#0f172a] dark:text-slate-200">Exam Focused</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold text-[#0f172a] dark:text-slate-200">AI Powered</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />
                <span className="text-xs font-semibold text-[#0f172a] dark:text-slate-200">Made for SPPU</span>
              </div>
            </div>

          </div>

          {/* Right Column: Layered Dashboard Preview Cards */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              
              {/* Main Card Container */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-black/50 overflow-hidden">
                
                {/* Header Strip with Study Track & Countdown */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-900/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      SE
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-[#0f172a] dark:text-white">Computer Engineering</h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                          2024 Pattern
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Semester III • Pune University</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>12 Days Left</span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">DBMS In-Sem Exam</span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-4">
                  
                  {/* Progress & Status Card */}
                  <div className="p-4 rounded-xl bg-[#faf9f5] dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Exam Readiness</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          On Track
                        </span>
                      </div>
                      <div className="text-2xl font-extrabold text-[#0f172a] dark:text-white">
                        78% <span className="text-xs font-normal text-slate-500">Preparation Score</span>
                      </div>
                      <div className="w-48 sm:w-56 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-teal-600 h-full rounded-full w-[78%]" />
                      </div>
                    </div>

                    <div className="text-right pl-4 border-l border-slate-200 dark:border-slate-700">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Active Subject</div>
                      <div className="font-bold text-sm text-[#0f172a] dark:text-white">DBMS (210241)</div>
                      <div className="text-[11px] text-teal-700 dark:text-teal-400 font-medium">Unit 3 of 6</div>
                    </div>
                  </div>

                  {/* Mode Tabs: Learn | Practice | Test */}
                  <div className="flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('learn')}
                      className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                        activeTab === 'learn'
                          ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Learn (Notes)
                    </button>
                    <button
                      onClick={() => setActiveTab('practice')}
                      className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                        activeTab === 'practice'
                          ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Practice (QB & QP)
                    </button>
                    <button
                      onClick={() => setActiveTab('test')}
                      className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                        activeTab === 'test'
                          ? 'bg-white dark:bg-slate-700 text-teal-800 dark:text-teal-300 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      Test (Exam Mode)
                    </button>
                  </div>

                  {/* Active Study Task */}
                  <div className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-teal-600" />
                        <span className="text-xs font-bold text-[#0f172a] dark:text-white">
                          Continue: 3NF vs BCNF Decomposition
                        </span>
                      </div>
                      <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400">
                        45 mins left
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Normal Forms &amp; Functional Dependencies with SPPU 5-Year Question Recurrence Analysis.
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-teal-700 dark:text-teal-400 font-semibold">
                        <Award className="w-3.5 h-3.5 text-teal-600" />
                        Evaluator-Graded Answers
                      </span>
                      <Link href="/questions">
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                          Resume <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>

                  {/* Voice Tutor Interactive Snippet */}
                  <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-teal-950 dark:text-teal-200 flex items-center gap-1.5">
                          <span>AI Voice Tutor</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                            Audio Active
                          </span>
                        </div>
                        <p className="text-[11px] text-teal-800/90 dark:text-teal-300 italic">
                          &quot;Focus on 3NF vs BCNF today—repeated 4 times in past 5 papers.&quot;
                        </p>
                      </div>
                    </div>

                    <Link href="/ai?mode=TEACH_ME">
                      <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs h-8 px-3">
                        <Play className="w-3 h-3 fill-current mr-1" /> Listen
                      </Button>
                    </Link>
                  </div>

                </div>

                {/* Footer Bar */}
                <div className="bg-slate-50 dark:bg-slate-950 px-5 py-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
                    SPPU Verified Curriculum 2024–2025
                  </span>
                  <Link href="/dashboard" className="font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                    Open Student Portal &rarr;
                  </Link>
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
