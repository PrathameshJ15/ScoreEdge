'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ExamModeView } from '@/components/intelligence/ExamModeView';
import { dbStore } from '@/lib/db/client';
import { ExamDurationType } from '@/lib/intelligence/examModeEngine';
import {
  Zap,
  BookOpen,
  ArrowLeft,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function ExamModePage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-dbms');
  const [initialDuration, setInitialDuration] = useState<ExamDurationType>('2h');

  const subjects = dbStore.subjects.slice(0, 8);
  const currentSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  return (
    <div className="flex flex-col min-h-screen bg-[#f7f5ff] dark:bg-[#0d0720]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subjects</span>
          </Link>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified SPPU Intelligence</span>
          </div>
        </div>

        {/* Subject Context Selector Bar */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
              Select Subject:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {subjects.map((sub) => {
              const isSelected = sub.id === selectedSubjectId;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  type="button"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                  }`}
                >
                  {sub.short_name} ({sub.code})
                </button>
              );
            })}
          </div>
        </div>

        {/* Full Exam Mode Component */}
        <ExamModeView
          key={selectedSubjectId}
          subjectId={selectedSubjectId}
          initialDuration={initialDuration}
        />
      </main>

      <Footer />
    </div>
  );
}
