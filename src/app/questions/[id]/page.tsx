'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ArrowLeft,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  BookOpen,
  Calendar,
} from 'lucide-react';

interface QuestionDetail {
  id: string;
  subject_id: string;
  unit_id: string;
  topic_id?: string | null;
  question_text: string;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_type: 'THEORY' | 'NUMERICAL' | 'DIAGRAM' | 'SHORT_ANSWER';
  is_pyq: boolean;
  verification_status: 'VERIFIED' | 'UNVERIFIED' | 'COMMUNITY';
  content_status: string;
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
  pattern?: {
    id: string;
    name: string;
    code: string;
  } | null;
  branch?: {
    id: string;
    name: string;
    code: string;
  } | null;
  semester?: {
    id: string;
    name: string;
    semester_number: number;
  } | null;
}

interface Occurrence {
  id: string;
  question_id: string;
  year: number;
  exam_session: 'IN_SEM' | 'END_SEM' | 'RE_EXAM';
  question_number: string;
  marks: number;
  pattern_id: string;
  verification_status: string;
}

interface AnswerItem {
  id: string;
  question_id: string;
  marks_target: number;
  heading: string;
  summary: string;
  key_points: string[];
  diagram_description?: string | null;
  example_text?: string | null;
  evaluator_tips?: string | null;
  is_premium?: boolean;
  content_status: string;
  created_at: string;
}

export default function QuestionDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [question, setQuestion] = useState<QuestionDetail | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/questions/${id}`);
        if (!res.ok) {
          throw new Error('Question not found or unpublished');
        }
        const json = await res.json();
        setQuestion(json.data.question);
        setOccurrences(json.data.occurrences || []);
        setAnswers(json.data.answers || []);
        setError(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load question details');
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [id]);

  const handleCopyQuestion = () => {
    if (!question) return;
    navigator.clipboard.writeText(question.question_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16]">
        <Navbar />
        <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-6">
          <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4 animate-pulse" />
          <Card className="p-8 space-y-6 animate-pulse">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded" />
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16]">
        <Navbar />
        <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
          <EmptyState
            title="Question Not Found"
            description={error || 'The requested question does not exist or has been archived.'}
            actionLabel="Back to Question Bank"
            onAction={() => (window.location.href = '/questions')}
          />
        </main>
        <Footer />
      </div>
    );
  }

  const isVerified = question.verification_status === 'VERIFIED';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-6">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Link href="/questions" className="hover:text-brand-600 dark:hover:text-brand-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Question Bank</span>
            </Link>
            <span>/</span>
            {question.subject && (
              <>
                <Link href={`/subject/${question.subject.id}`} className="hover:text-brand-600 dark:hover:text-brand-400">
                  {question.subject.short_name}
                </Link>
                <span>/</span>
              </>
            )}
            {question.unit && <span>Unit {question.unit.unit_number}</span>}
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <Button variant="outline" size="sm" onClick={handleCopyQuestion} className="gap-1.5 text-xs">
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Question'}</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-1.5 text-xs">
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </Button>
          </div>
        </div>

        {/* Question Header Card */}
        <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-slate-800 shadow-depth-2 bg-white dark:bg-slate-900 space-y-5">
          {/* Top badges */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center px-3 py-1 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold font-tabular text-xs">
                {question.marks} Marks
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                {question.question_type}
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
                Difficulty: {question.difficulty}
              </span>
              {question.pattern && (
                <span className="inline-flex items-center px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  {question.pattern.name}
                </span>
              )}
            </div>

            {isVerified ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                Verified SPPU University Question
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded border text-xs text-slate-500">
                Practice Bank
              </span>
            )}
          </div>

          {/* Question Text */}
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1 block">Question Statement</span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-relaxed tracking-tight">
              {question.question_text}
            </h1>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-500 block">Subject</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {question.subject?.name} ({question.subject?.short_name})
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Academic Unit</span>
              <span className="font-bold text-slate-900 dark:text-white">
                Unit {question.unit?.unit_number}: {question.unit?.title}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Syllabus Topic</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {question.topic?.title || 'Core Concept'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Subject Code</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                SPPU-{question.subject?.code}
              </span>
            </div>
          </div>
        </Card>

        {/* Paper Occurrences Section */}
        {occurrences.length > 0 && (
          <Card className="p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 bg-white dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Historical SPPU Examination Occurrences
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Appeared in {occurrences.length} {occurrences.length === 1 ? 'Exam' : 'Exams'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
                    <th className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">Exam Year</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">Examination Session</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">Paper Q. No.</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">Marks</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">Pattern</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-600 dark:text-slate-300">Verification</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {occurrences.map((occ) => (
                    <tr key={occ.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold font-tabular text-slate-900 dark:text-white">
                        {occ.year}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                          {occ.exam_session === 'IN_SEM' ? 'In-Semester (Oct/Nov)' : 'End-Semester (May/Jun)'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {occ.question_number}
                      </td>
                      <td className="py-2.5 px-3 font-bold font-tabular text-slate-800 dark:text-slate-200">
                        {occ.marks} Marks
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                        {occ.pattern_id === 'pat-2024' ? '2024 Pattern (NEP)' : '2019 Pattern'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Official SPPU Paper
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Model Answer & Academic Reader Section */}
        <Card className="p-6 sm:p-8 border-slate-200/90 dark:border-slate-800 shadow-depth-2 bg-white dark:bg-slate-900 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Standard SPPU Evaluator Marking Scheme</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Solved Model Exam Answer
              </h2>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Prepared for SPPU University {question.marks}-Mark Evaluation
            </div>
          </div>

          {answers.length > 0 ? (
            <div className="space-y-6">
              {answers.map((ans) => (
                <div key={ans.id} className="space-y-4">
                  {ans.heading && (
                    <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                      {ans.heading}
                    </h3>
                  )}

                  {/* Marking Scheme Points */}
                  {ans.key_points && ans.key_points.length > 0 && (
                    <div className="p-4 rounded-lg bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900 space-y-2">
                      <span className="text-xs font-bold text-brand-900 dark:text-brand-200 uppercase tracking-wider block">
                        Marks Distribution Rubric
                      </span>
                      <ul className="space-y-1 text-xs sm:text-sm text-brand-800 dark:text-brand-300">
                        {ans.key_points.map((pt, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-brand-500 font-bold">•</span>
                            <span>{pt}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Academic Content rendered with Source Serif 4 */}
                  {ans.summary && (
                    <div className="academic-reader p-5 sm:p-6 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      <div className="whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200">
                        {ans.summary}
                      </div>
                    </div>
                  )}

                  {/* Example / Schema text */}
                  {ans.example_text && (
                    <div className="space-y-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        Demonstration Example / Relational Schema
                      </span>
                      <pre className="p-4 rounded-lg bg-slate-900 text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-slate-800">
                        {ans.example_text}
                      </pre>
                    </div>
                  )}

                  {/* Diagram description */}
                  {ans.diagram_description && (
                    <div className="p-3.5 rounded-lg bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300">
                      <strong>Exam Diagram Note:</strong> {ans.diagram_description}
                    </div>
                  )}

                  {/* Evaluator tips */}
                  {ans.evaluator_tips && (
                    <div className="p-3.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/70 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300">
                      <strong>Faculty Presentation Advice:</strong> {ans.evaluator_tips}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto" />
              <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Model Answer In Review
              </div>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                The verified faculty solution for this {question.marks}-mark question is currently undergoing peer review by our academic panel according to SPPU grading rubrics.
              </p>
            </div>
          )}
        </Card>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2">
          <Link href="/questions">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Question Bank</span>
            </Button>
          </Link>
          {question.subject && (
            <Link href={`/subject/${question.subject.id}`}>
              <Button variant="primary" size="sm" className="gap-1.5">
                <span>View Full {question.subject.short_name} Subject Hub</span>
              </Button>
            </Link>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}