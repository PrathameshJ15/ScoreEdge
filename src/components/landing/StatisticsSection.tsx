'use client';

import React from 'react';
import { Users, BookOpen, FileCheck, Star, Target } from 'lucide-react';

const stats = [
  {
    icon: Users,
    value: '12,000+',
    label: 'Students Preparing',
    subtext: 'Across SPPU affiliated colleges',
  },
  {
    icon: BookOpen,
    value: '5 Subjects',
    label: 'Fully Mapped',
    subtext: 'SE Computer 2024 & 2019 patterns',
  },
  {
    icon: FileCheck,
    value: '2,400+',
    label: 'Evaluator-Graded PYQs',
    subtext: '5+ years of past exam papers',
  },
  {
    icon: Star,
    value: '4.8 / 5',
    label: 'Student Rating',
    subtext: 'Based on 1,800+ user reviews',
  },
  {
    icon: Target,
    value: '94%',
    label: 'Recurrence Accuracy',
    subtext: 'Topic prediction rate in In-Sem & End-Sem',
  },
];

export const StatisticsSection = () => {
  return (
    <section className="py-14 bg-[#faf9f5] dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between ${
                  idx === 4 ? 'col-span-2 md:col-span-1' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200/80 dark:border-teal-800 flex items-center justify-center text-teal-700 dark:text-teal-300 mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-[#0f172a] dark:text-white font-mono tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                    {stat.label}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                    {stat.subtext}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
