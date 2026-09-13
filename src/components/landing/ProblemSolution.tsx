'use client';

import React from 'react';
import {
  XCircle,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  BookOpen,
  Target,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';

export const ProblemSolution = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <span>Why ScoreEdge Exists</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            The SPPU Engineering Dilemma
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
            Every semester, engineering students waste dozens of study hours memorizing low-yield topics while missing the exact patterns evaluators test.
          </p>
        </div>

        {/* 2-Column Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Card 1: The Traditional Way */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 shadow-xs flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40">
                  Standard Approach
                </span>
                <span className="text-xs text-slate-400 font-mono">High Effort · Low ROI</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Blind Textbook Cramming
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Reading 600 pages of local publication guides 48 hours before In-Sem or End-Sem.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-control bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Zero Recurrence Visibility:</strong> Reading every paragraph equally without knowing which topics SPPU evaluators repeat every 2 exam cycles.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-control bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Unstructured Answer Dumping:</strong> Writing dense, rambling essays that lose marks because Pune University evaluators grade against strict keyword rubrics.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-control bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                  <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Pre-Exam Panic:</strong> Frantically shuffling through unorganized WhatsApp PDFs and Telegram groups trying to guess what questions to study.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-mono">
              Outcome: Unpredictable SGPA &amp; High Backlog Risk
            </div>
          </div>

          {/* Card 2: The ScoreEdge System */}
          <div className="p-6 md:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-brand-500/40 dark:border-brand-500/40 shadow-lg shadow-brand-500/5 dark:shadow-brand-500/10 ring-1 ring-brand-500/20 flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                  ScoreEdge Intelligence
                </span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
                  Precision High-Yield
                </span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Deterministic Concept Clustering
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Mastering the 20% high-frequency topics that account for 80% of official paper marks.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 p-3 rounded-control bg-brand-50/40 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Algorithmic Question Grouping:</strong> 5 years of differently worded questions mapped into high-yield master clusters with clear frequency bars.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-control bg-brand-50/40 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Examiner-Aligned Marking Schemes:</strong> Solved answers broken down into 2-mark, 5-mark, and 10-mark templates with verified diagrams and bullet rubrics.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-control bg-brand-50/40 dark:bg-brand-950/30 border border-brand-100 dark:border-brand-800/40">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 dark:text-slate-300">
                    <strong>Instant Emergency Triage Mode:</strong> Select your available time (2h, 5h, or 1d) and follow a strictly prioritized checklist designed for maximum marks per hour.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-brand-600 dark:text-brand-400 font-mono font-semibold">
              Outcome: Consistent 8.5+ SGPA &amp; Zero Wasted Revision Hours
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
