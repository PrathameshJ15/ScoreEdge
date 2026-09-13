'use client';

import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Bot,
  Activity,
  GraduationCap,
  CheckCircle2,
} from 'lucide-react';

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Original & Verified Content',
    description: 'Every note, question solution, and rubric is crafted and verified specifically for SPPU 2024 & 2019 patterns by experienced faculty and university rank holders.',
  },
  {
    icon: TrendingUp,
    title: 'Smart Exam Intelligence',
    description: 'Deterministic past-paper clustering algorithms reveal exact question recurrence patterns, letting you spend 80% of your effort on topics that actually appear.',
  },
  {
    icon: Bot,
    title: 'AI Tutor & Voice Learning',
    description: 'Curriculum-trained conversational AI explains difficult concepts on demand, while the voice tutor gives you hands-free listening and revision on the go.',
  },
  {
    icon: Activity,
    title: 'Track Real Readiness',
    description: 'Dynamic progress analytics calculate your true exam readiness percentage, identify syllabus weak spots, and assemble optimized pre-exam triage checklists.',
  },
  {
    icon: GraduationCap,
    title: 'Built Exclusively for SPPU',
    description: 'Unlike generic edtech apps, ScoreEdge is tailored 100% to Savitribai Phule Pune University marking distribution, evaluator mindset, and question patterns.',
  },
];

export const WhyScoreEdge = () => {
  return (
    <section className="py-16 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />
            <span>Why Choose ScoreEdge</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
            Engineered for Higher SGPA. <br />
            Built Without Compromise.
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300">
            Say goodbye to disorganized photocopy notes and blind syllabus cramming. Here is why thousands of SPPU engineering students rely on ScoreEdge.
          </p>
        </div>

        {/* 5 Pillars Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className={`p-6 rounded-2xl bg-[#faf9f5] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3 ${
                  index === 4 ? 'md:col-span-2 lg:col-span-1' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold shadow-sm">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0f172a] dark:text-white pt-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
