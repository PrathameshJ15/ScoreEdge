'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText,
  HelpCircle,
  BookOpen,
  Sparkles,
  Mic,
  Clock,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'Original Notes',
    badge: 'Evaluator Approved',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    description: 'Comprehensive, syllabus-aligned notes for every unit. Written by subject matter experts with crisp diagrams and key scoring points.',
    href: '/notes',
    actionText: 'Browse Notes',
  },
  {
    icon: HelpCircle,
    title: 'Question Bank (QB)',
    badge: '2,400+ Questions',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    description: 'Topic-wise sorted questions with difficulty tags, marks weightage (2M/5M/8M/10M), and model evaluator answers.',
    href: '/questions',
    actionText: 'Explore Questions',
  },
  {
    icon: BookOpen,
    title: 'Question Papers (QP)',
    badge: '2019 – 2024 Pattern',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    description: '5+ years of solved SPPU question papers with pattern-wise breakdowns, marking schemes, and recurring question highlights.',
    href: '/pyqs',
    actionText: 'View Past Papers',
  },
  {
    icon: Sparkles,
    title: 'Ask ScoreEdge AI',
    badge: 'Curriculum Trained',
    badgeColor: 'bg-teal-50 text-teal-700 dark:bg-teal-950/70 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    description: 'Context-aware AI tutor trained on SPPU curriculum. Instant, structured answers to any concept, formula, or exam query.',
    href: '/ai',
    actionText: 'Ask Question',
  },
  {
    icon: Mic,
    title: 'AI Voice Tutor',
    badge: 'Interactive Audio',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    description: 'Listen, learn, and revise with conversational voice lessons. Like having a personal professor explaining complex topics on demand.',
    href: '/ai?mode=TEACH_ME',
    actionText: 'Start Voice Session',
  },
  {
    icon: Clock,
    title: 'Exam Mode',
    badge: 'Timed Simulation',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    description: 'Timed practice simulations replicating real SPPU exam environments, section choices, marks distribution, and scoring pressure.',
    href: '/exam-mode',
    actionText: 'Simulate Exam',
  },
];

export const FeatureCards = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-white dark:bg-slate-900/60 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Complete Exam Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Everything You Need to Ace Every SPPU Paper
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            From verified original study notes to simulated exam triage and AI voice tutors, each tool is engineered for Pune University scoring.
          </p>
        </div>

        {/* 6 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#faf9f5] dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg hover:shadow-teal-900/5 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-[#0f172a] dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-slate-200/60 dark:border-slate-800">
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 group-hover:gap-2 transition-all hover:underline"
                  >
                    <span>{item.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
