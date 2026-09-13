'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { DBMS_SAMPLE_PYQS } from '@/data/sppuData';
import {
  BookOpen,
  CheckCircle2,
  FileText,
  Lightbulb,
  ShieldCheck,
  Check,
  Cpu,
} from 'lucide-react';

export const NotesAndAnswersPreview = () => {
  const [activeMarksTab, setActiveMarksTab] = useState<5 | 10>(5);

  const sampleQuestion = DBMS_SAMPLE_PYQS[0];
  const activeAnswer =
    sampleQuestion.answers.find((a) => a.marks === activeMarksTab) || sampleQuestion.answers[0];

  return (
    <section id="notes" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Marking Scheme Intelligence</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Examiner-Aligned Model Solutions
          </h2>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal">
            Pune University evaluators award marks based on specific keywords, schematic diagrams, and structured definitions. ScoreEdge formats every solution into exact 2-mark, 5-mark, and 10-mark scoring templates.
          </p>
        </div>

        {/* Answer Viewer Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
            {/* Top Question Header */}
            <div className="bg-slate-900 text-white p-6 border-b border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                    {sampleQuestion.examYear} {sampleQuestion.examSession}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{sampleQuestion.questionNumber}</span>
                </div>
                <PriorityBadge priority={sampleQuestion.priority} size="sm" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold leading-snug text-white">
                {sampleQuestion.questionText}
              </h3>
              <p className="text-xs font-mono text-slate-400 mt-2">
                Total Weightage: {sampleQuestion.marks} Marks • Subject: DBMS (Unit 3 Normalization)
              </p>
            </div>

            {/* Answer Length Tabs & Status */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMarksTab(5)}
                  className={`px-3.5 py-1.5 rounded-control text-xs font-bold transition-all ${
                    activeMarksTab === 5
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  5-Mark Concise Rubric
                </button>
                <button
                  onClick={() => setActiveMarksTab(10)}
                  className={`px-3.5 py-1.5 rounded-control text-xs font-bold transition-all ${
                    activeMarksTab === 10
                      ? 'bg-brand-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  10-Mark Comprehensive Rubric
                </button>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>SPPU Evaluator Rubric Compliant</span>
              </div>
            </div>

            {/* Answer Content */}
            <div className="p-6 space-y-6">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  <span>{activeAnswer.heading}</span>
                </h4>
                <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-control border border-slate-200/60 dark:border-slate-800 leading-relaxed font-mono">
                  {activeAnswer.summary}
                </div>
              </div>

              {/* Key Bullet Points */}
              <div className="space-y-2">
                <h5 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Required Key Scoring Points for Full Marks:
                </h5>
                <ul className="space-y-2">
                  {activeAnswer.keyPoints.map((point, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Diagram Hint Box */}
              {activeAnswer.diagramDescription && (
                <div className="p-4 bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/60 dark:border-brand-800/50 rounded-control flex items-start gap-3">
                  <Lightbulb className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-brand-950 dark:text-brand-200">
                      Evaluator Diagram Requirement:
                    </h6>
                    <p className="text-xs text-brand-800 dark:text-brand-300 mt-0.5 leading-relaxed">
                      {activeAnswer.diagramDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Example Schema Box */}
              {activeAnswer.exampleText && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-control text-xs text-slate-700 dark:text-slate-300 font-mono">
                  <strong className="text-slate-900 dark:text-white">Example Schema:</strong> {activeAnswer.exampleText}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </section>
  );
};

