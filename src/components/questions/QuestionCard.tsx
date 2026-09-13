'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, ArrowRight, BookOpen, Layers, CheckCircle2, AlertCircle } from 'lucide-react';

export interface QuestionCardProps {
  id: string;
  question_text: string;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_type: 'THEORY' | 'NUMERICAL' | 'DIAGRAM' | 'SHORT_ANSWER';
  is_pyq: boolean;
  verification_status: 'VERIFIED' | 'UNVERIFIED' | 'COMMUNITY';
  subject?: {
    id: string;
    name: string;
    short_name: string;
    code: string;
  } | null;
  unit?: {
    id: string;
    unit_number: number;
    title: string;
  } | null;
  topic?: {
    id: string;
    title: string;
    importance_level?: string;
  } | null;
  occurrences?: Array<{
    id: string;
    year: number;
    exam_session: 'IN_SEM' | 'END_SEM' | 'RE_EXAM';
    question_number: string;
    marks: number;
  }>;
  answers_count?: number;
}

export function QuestionCard({
  id,
  question_text,
  marks,
  difficulty,
  question_type,
  is_pyq,
  verification_status,
  subject,
  unit,
  topic,
  occurrences = [],
  answers_count = 0,
}: QuestionCardProps) {
  const isVerified = verification_status === 'VERIFIED';

  const difficultyColors = {
    EASY: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    MEDIUM: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    HARD: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  const typeLabels = {
    THEORY: 'Theory',
    NUMERICAL: 'Numerical',
    DIAGRAM: 'Diagram/Architecture',
    SHORT_ANSWER: 'Short Answer',
  };

  return (
    <Card className="p-5 sm:p-6 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700 shadow-depth-1 hover:shadow-depth-2 bg-white dark:bg-slate-900/90 border-slate-200/90 dark:border-slate-800">
      {/* Top Metadata Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Marks badge */}
          <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold font-tabular">
            {marks} Marks
          </span>

          {/* Question Type */}
          <span className="inline-flex items-center px-2 py-0.5 rounded border text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            {typeLabels[question_type] || question_type}
          </span>

          {/* Difficulty */}
          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${difficultyColors[difficulty]}`}>
            {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
          </span>

          {/* Verified Official SPPU Question vs Practice Badge */}
          {isVerified ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded border border-emerald-300/80 dark:border-emerald-700/80 bg-emerald-50/80 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Verified SPPU Exam
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 text-[11px]">
              Practice / Question Bank
            </span>
          )}
        </div>

        {/* Occurrences count */}
        {occurrences.length > 0 && (
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium text-xs">
            <span className="inline-block w-2 h-2 rounded-full bg-brand-500" />
            <span>Appeared in {occurrences.length} SPPU {occurrences.length === 1 ? 'Exam' : 'Exams'}</span>
          </div>
        )}
      </div>

      {/* Main Question Text */}
      <div className="py-3">
        <Link href={`/questions/${id}`} className="group block">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-relaxed">
            {question_text}
          </h3>
        </Link>
      </div>

      {/* Exam Occurrences Pill Carousel */}
      {occurrences.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mr-1">Sessions:</span>
          {occurrences.map((occ) => (
            <span
              key={occ.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200/80 dark:border-brand-800 font-tabular"
            >
              <span>{occ.year} {occ.exam_session === 'IN_SEM' ? 'In-Sem' : occ.exam_session === 'END_SEM' ? 'End-Sem' : 'Re-Exam'}</span>
              {occ.question_number && <span className="text-brand-500/80 font-mono">[{occ.question_number}]</span>}
            </span>
          ))}
        </div>
      )}

      {/* Academic Hierarchy Footer */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-600 dark:text-slate-400">
          {subject && (
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {subject.short_name} ({subject.code})
            </span>
          )}
          {unit && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>Unit {unit.unit_number}: {unit.title}</span>
            </>
          )}
          {topic && (
            <>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-500 dark:text-slate-400">{topic.title}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {answers_count > 0 && (
            <span className="text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Answer Available
            </span>
          )}
          <Link
            href={`/questions/${id}`}
            className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 flex items-center gap-1 group"
          >
            <span>Read Answer</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
