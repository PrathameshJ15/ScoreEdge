'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { ScoreEdgeAIAssistant } from '@/components/ai/ScoreEdgeAIAssistant';
import { StudyMaterialHeroBanner } from '@/components/ai/StudyMaterialHeroBanner';
import { dbStore } from '@/lib/db/client';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  FileUp,
  GraduationCap,
  Layers,
} from 'lucide-react';

export default function AIAssistantPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-dbms');

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0b1120]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link
            href="/explore"
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Subjects</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/60 text-teal-700 dark:text-teal-300 font-semibold text-[11px]">
              <FileUp className="w-3.5 h-3.5" />
              <span>Multi-Format Workspace Active</span>
            </div>

            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>100% Grounded in SPPU Syllabus & PYQs</span>
            </div>
          </div>
        </div>

        {/* AI Assistant Hero Banner (Circled in uploaded photo) */}
        <StudyMaterialHeroBanner />

        {/* AI Assistant Interactive Engine */}
        <ScoreEdgeAIAssistant
          key={selectedSubjectId}
          initialSubjectId={selectedSubjectId}
        />
      </main>

      <Footer />
    </div>
  );
}
