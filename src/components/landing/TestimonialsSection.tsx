'use client';

import React from 'react';
import { ShieldCheck, Quote, CheckCircle2, Award } from 'lucide-react';

export const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Rohan Deshmukh',
      college: 'PICT, Pune',
      branch: 'Computer Engineering (SE)',
      stat: 'Scored 28/30 in DBMS In-Sem',
      quote:
        'The question clustering is terrifyingly accurate. 4 out of the 5 questions asked in our DBMS paper were already marked "MUST STUDY" in ScoreEdge. The 5-mark answer formatting helped me write concise answers without running out of exam time.',
    },
    {
      name: 'Ananya Joshi',
      college: 'COEP Technological University',
      branch: 'Computer Engineering (SE)',
      stat: 'SGPA improved from 7.4 to 8.9',
      quote:
        'Instead of reading dense reference books from front to back, ScoreEdge allowed me to reverse-engineer exactly what SPPU checkers look for. The diagram hints and marking schemes are gold for anyone with limited prep time.',
    },
    {
      name: 'Pratik Kulkarni',
      college: 'PCCOE, Akurdi',
      branch: 'Computer Engineering (SE)',
      stat: 'Cleared 2 Backlogs in End-Sem',
      quote:
        'Emergency 5-Hour Exam Mode literally saved my semester. I only had one night to prepare for TOC. The prioritized checklist ensured I covered the high-yield finite automata and grammar questions first.',
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Student Endorsements</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Trusted by SPPU Engineering Students
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
            See how engineering undergraduates across top Pune colleges prepare with precision and score higher with fewer revision hours.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="p-6 md:p-7 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                    {t.stat}
                  </span>
                  <Quote className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  &quot;{t.quote}&quot;
                </p>
              </div>

              <div className="pt-5 mt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.college} • {t.branch}</div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
