'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { DBMS_SAMPLE_PYQS } from '@/data/sppuData';
import { BookOpen, CheckCircle2, FileText, Lightbulb, Award, Star } from 'lucide-react';

export const NotesAndAnswersPreview = () => {
  const [activeMarksTab, setActiveMarksTab] = useState<5 | 10>(5);

  const sampleQuestion = DBMS_SAMPLE_PYQS[0];
  const activeAnswer = sampleQuestion.answers.find((a) => a.marks === activeMarksTab) || sampleQuestion.answers[0];

  return (
    <section id="notes" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Exam-Ready Content</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            2, 5 & 10-Mark Solved Exam Answers
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            No more copying textbook paragraphs. Every answer is structured specifically for SPPU paper evaluators with key points, diagram hints, and exam writing tips.
          </p>
        </div>

        {/* Answer Viewer Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            {/* Top Question Header */}
            <div className="bg-slate-900 text-white p-6 rounded-t-card -m-6 mb-6">
              <div className="flex items-center justify-between gap-4 mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="brand">{sampleQuestion.examYear} {sampleQuestion.examSession}</Badge>
                  <span className="text-xs font-mono text-slate-400">{sampleQuestion.questionNumber}</span>
                </div>
                <PriorityBadge priority={sampleQuestion.priority} size="sm" />
              </div>
              <h3 className="text-lg md:text-xl font-bold leading-snug text-white">
                {sampleQuestion.questionText}
              </h3>
              <p className="text-xs text-slate-400 mt-2">
                Total Weightage: {sampleQuestion.marks} Marks • Subject: DBMS (Unit 3 Normalization)
              </p>
            </div>

            {/* Answer Length Tabs */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMarksTab(5)}
                  className={`px-4 py-2 rounded-control text-xs font-bold transition-all ${
                    activeMarksTab === 5
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  5-Mark Concise Answer
                </button>
                <button
                  onClick={() => setActiveMarksTab(10)}
                  className={`px-4 py-2 rounded-control text-xs font-bold transition-all ${
                    activeMarksTab === 10
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  10-Mark Full Detailed Answer
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-semibold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>SPPU Evaluator Verified Format</span>
              </div>
            </div>

            {/* Answer Content */}
            <div className="space-y-6">
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>{activeAnswer.heading}</span>
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-control border border-slate-200/60 dark:border-slate-800 leading-relaxed font-mono">
                  {activeAnswer.summary}
                </p>
              </div>

              {/* Key Bullet Points */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Must-Include Bullet Points for SPPU Marks:
                </h5>
                <ul className="space-y-2">
                  {activeAnswer.keyPoints.map((point, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Diagram Hint Box */}
              {activeAnswer.diagramDescription && (
                <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 rounded-control flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h6 className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Diagram / Schema Hint:</h6>
                    <p className="text-xs text-indigo-800 dark:text-indigo-200 mt-0.5">
                      {activeAnswer.diagramDescription}
                    </p>
                  </div>
                </div>
              )}

              {/* Example Schema Box */}
              {activeAnswer.exampleText && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 rounded-control text-xs text-amber-900 dark:text-amber-300 font-mono">
                  <strong>Example Schema:</strong> {activeAnswer.exampleText}
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </section>
  );
};
