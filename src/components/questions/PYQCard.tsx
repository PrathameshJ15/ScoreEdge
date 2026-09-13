'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, ArrowRight, FileText, CheckCircle2, Bookmark } from 'lucide-react';

export interface PYQCardProps {
  id: string;
  question_text: string;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_type: string;
  verification_status: string;
  subject_short_name?: string;
  subject_code?: string;
  unit_number?: number;
  unit_title?: string;
  topic_title?: string;
  exam_year?: number;
  exam_session?: 'IN_SEM' | 'END_SEM' | 'RE_EXAM';
  question_number?: string;
  paper_code?: string | null;
  occurrences?: Array<{
    id: string;
    year: number;
    exam_session: string;
    question_number: string;
    marks: number;
  }>;
}

export function PYQCard({
  id,
  question_text,
  marks,
  difficulty,
  question_type,
  verification_status,
  subject_short_name = 'DBMS',
  subject_code = '210241',
  unit_number,
  unit_title,
  topic_title,
  exam_year,
  exam_session,
  question_number,
  occurrences = [],
}: PYQCardProps) {
  const isVerified = verification_status === 'VERIFIED';
  const primaryOccurrence = occurrences[0];
  const displayYear = exam_year || primaryOccurrence?.year || 2024;
  const displaySession = exam_session || primaryOccurrence?.exam_session || 'END_SEM';
  const displayQNum = question_number || primaryOccurrence?.question_number || 'Q1';

  return (
    <Card className="p-5 sm:p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 hover:shadow-depth-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all bg-white dark:bg-slate-900/95">
      {/* Paper Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Exam Session Badge */}
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold text-xs bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 font-tabular">
            <FileText className="w-3.5 h-3.5" />
            <span>SPPU {displayYear} {displaySession === 'IN_SEM' ? 'In-Sem' : 'End-Sem'}</span>
          </span>

          {/* Question Number in paper */}
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {displayQNum}
          </span>

          {/* Marks */}
          <span className="text-xs font-semibold font-tabular text-slate-700 dark:text-slate-300">
            [{marks} Marks]
          </span>
        </div>

        {/* Verification indicator */}
        {isVerified && (
          <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-semibold bg-emerald-50/70 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/60 dark:border-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified SPPU Paper Question</span>
          </span>
        )}
      </div>

      {/* Question Text */}
      <div className="py-3.5">
        <Link href={`/questions/${id}`} className="group block">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 leading-relaxed transition-colors">
            {question_text}
          </h3>
        </Link>
      </div>

      {/* Multiple Appearances Banner if repeated */}
      {occurrences.length > 1 && (
        <div className="mb-3 px-3 py-1.5 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <span className="font-bold">Recurring Pattern:</span>
          <span>Also appeared in {occurrences.slice(1).map(o => `${o.year} ${o.exam_session === 'IN_SEM' ? 'In-Sem' : 'End-Sem'}`).join(', ')}</span>
        </div>
      )}

      {/* Footer / Meta */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2">
          <span className="font-semibold text-slate-700 dark:text-slate-300">{subject_short_name} ({subject_code})</span>
          {unit_number && (
            <>
              <span>•</span>
              <span>Unit {unit_number}: {unit_title || `Unit ${unit_number}`}</span>
            </>
          )}
          {topic_title && (
            <>
              <span>•</span>
              <span className="text-slate-500">{topic_title}</span>
            </>
          )}
        </div>

        <Link
          href={`/questions/${id}`}
          className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 group"
        >
          <span>View Model Answer & Marking Scheme</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}
