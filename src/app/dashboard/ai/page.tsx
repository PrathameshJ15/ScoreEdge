'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { ScoreEdgeAIAssistant } from '@/components/ai/ScoreEdgeAIAssistant';
import { Sparkles, ShieldCheck, Zap, BrainCircuit } from 'lucide-react';

export default function DashboardAIPage() {
  const [activeSubject, setActiveSubject] = useState('dbms');

  const subjectMap: Record<string, string> = {
    dbms: 'sub-dbms',
    dsa: 'sub-dsa',
    oop: 'sub-oop',
    os: 'sub-os',
    toc: 'sub-toc',
  };

  return (
    <DashboardShell activeSubject={activeSubject} onSubjectChange={setActiveSubject}>
      <div className="space-y-6">
        {/* Header banner */}
        <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Grounded SPPU Engine
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Strict Syllabus Boundaries
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                ScoreEdge AI Exam Tutor
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl font-serif">
                Ask doubts, generate exact 2/5/10-mark model answers with step markings, or practice interactive quizzes grounded strictly in your SPPU syllabus.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Powered by Groq LPU™ (Ultra-low latency)</span>
              </div>
            </div>
          </div>
        </div>

        {/* The Assistant Component */}
        <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 sm:p-6">
          <ScoreEdgeAIAssistant
            key={activeSubject}
            initialSubjectId={subjectMap[activeSubject] || 'sub-dbms'}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
