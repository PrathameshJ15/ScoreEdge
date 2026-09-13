'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { QuestionCard } from '@/components/questions/QuestionCard';
import {
  HelpCircle,
  Filter,
  ShieldCheck,
  RotateCcw,
  BookOpen,
  FileText,
  CheckCircle2,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';

interface QuestionItem {
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
  occurrences: Array<{
    id: string;
    year: number;
    exam_session: 'IN_SEM' | 'END_SEM' | 'RE_EXAM';
    question_number: string;
    marks: number;
    pattern_id: string;
  }>;
  answers_count?: number;
}

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('ALL');
  const [selectedUnit, setSelectedUnit] = useState<string>('ALL');
  const [selectedMarks, setSelectedMarks] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [selectedPattern, setSelectedPattern] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);
  const [onlyPYQ, setOnlyPYQ] = useState<boolean>(false);

  // Fetch from /api/questions
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedSubject !== 'ALL') params.set('subject_id', selectedSubject);
      if (selectedUnit !== 'ALL') params.set('unit_id', selectedUnit);
      if (selectedMarks !== 'ALL') params.set('marks', selectedMarks);
      if (selectedYear !== 'ALL') params.set('year', selectedYear);
      if (selectedSession !== 'ALL') params.set('exam_session', selectedSession);
      if (selectedPattern !== 'ALL') params.set('pattern_id', selectedPattern);
      if (selectedDifficulty !== 'ALL') params.set('difficulty', selectedDifficulty);
      if (selectedType !== 'ALL') params.set('question_type', selectedType);
      if (onlyVerified) params.set('verification_status', 'VERIFIED');
      if (onlyPYQ) params.set('is_pyq', 'true');
      if (searchTerm.trim()) params.set('q', searchTerm.trim());
      params.set('limit', '100');

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch questions');
      const json = await res.json();
      setQuestions(json.data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching questions');
    } finally {
      setLoading(false);
    }
  }, [
    selectedSubject,
    selectedUnit,
    selectedMarks,
    selectedYear,
    selectedSession,
    selectedPattern,
    selectedDifficulty,
    selectedType,
    onlyVerified,
    onlyPYQ,
    searchTerm,
  ]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('ALL');
    setSelectedUnit('ALL');
    setSelectedMarks('ALL');
    setSelectedYear('ALL');
    setSelectedSession('ALL');
    setSelectedPattern('ALL');
    setSelectedDifficulty('ALL');
    setSelectedType('ALL');
    setOnlyVerified(false);
    setOnlyPYQ(false);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedSubject !== 'ALL' ||
    selectedUnit !== 'ALL' ||
    selectedMarks !== 'ALL' ||
    selectedYear !== 'ALL' ||
    selectedSession !== 'ALL' ||
    selectedPattern !== 'ALL' ||
    selectedDifficulty !== 'ALL' ||
    selectedType !== 'ALL' ||
    onlyVerified ||
    onlyPYQ;

  // Stats calculation
  const verifiedCount = useMemo(
    () => questions.filter((q) => q.verification_status === 'VERIFIED').length,
    [questions]
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header Breadcrumbs & Title */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-700 dark:text-brand-300">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800">
              <HelpCircle className="w-3.5 h-3.5" />
              Question Bank & Archive
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500 dark:text-slate-400">SPPU Engineering Curriculum</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Academic Question Bank
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-2xl mt-1 leading-relaxed">
                Explore curated, verified SPPU exam questions and comprehensive practice problems indexed by unit, marks, session, and syllabus topic.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/pyqs">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <FileText className="w-4 h-4 text-brand-600" />
                  <span>Browse Exam Papers</span>
                </Button>
              </Link>
              <Link href="/syllabus">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <BookOpen className="w-4 h-4 text-slate-600" />
                  <span>Syllabus Breakdown</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <Card className="p-5 sm:p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Multi-Dimensional Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            )}
          </div>

          {/* Search bar */}
          <div>
            <SearchInput
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search question text, concepts, e.g. 'Normalization', 'ACID', 'Binary Search Tree', 'Deadlock'..."
            />
          </div>

          {/* Dropdown Filters Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Subject */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => {
                  setSelectedSubject(e.target.value);
                  setSelectedUnit('ALL');
                }}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Subjects (COMP)</option>
                <option value="sub-dbms">DBMS (210241)</option>
                <option value="sub-dsa">DSA (210242)</option>
                <option value="sub-oop">OOP (210243)</option>
                <option value="sub-os">OS (210244)</option>
                <option value="sub-toc">TOC (210245)</option>
              </select>
            </div>

            {/* Pattern */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Curriculum Pattern
              </label>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Patterns</option>
                <option value="pat-2024">2024 Pattern (NEP)</option>
                <option value="pat-2019">2019 Pattern</option>
              </select>
            </div>

            {/* Marks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Marks Weightage
              </label>
              <select
                value={selectedMarks}
                onChange={(e) => setSelectedMarks(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Marks (2 to 10)</option>
                <option value="2">2 Marks (Short Answer)</option>
                <option value="5">5 Marks (Concept/Theory)</option>
                <option value="6">6 Marks (Standard SPPU)</option>
                <option value="7">7 Marks (In-Sem/End-Sem)</option>
                <option value="8">8 Marks (Long Question)</option>
                <option value="10">10 Marks (Comprehensive)</option>
              </select>
            </div>

            {/* Examination Year */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exam Year
              </label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Years</option>
                <option value="2025">2025 Exam</option>
                <option value="2024">2024 Exam</option>
                <option value="2023">2023 Exam</option>
                <option value="2022">2022 Exam</option>
              </select>
            </div>

            {/* Exam Session */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Exam Session
              </label>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Sessions</option>
                <option value="IN_SEM">In-Semester (30 Marks)</option>
                <option value="END_SEM">End-Semester (70 Marks)</option>
                <option value="RE_EXAM">Supplementary / Re-Exam</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Question Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Types</option>
                <option value="THEORY">Theory & Concepts</option>
                <option value="NUMERICAL">Numerical & Problems</option>
                <option value="DIAGRAM">Diagram & Architecture</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </select>
            </div>

            {/* Toggle Badges */}
            <div className="flex flex-col justify-end gap-2 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified SPPU Papers Only
                </span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyPYQ}
                  onChange={(e) => setOnlyPYQ(e.target.checked)}
                  className="rounded text-brand-600 focus:ring-brand-500 h-4 w-4"
                />
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-brand-600" />
                  Previous Year Questions Only
                </span>
              </label>
            </div>
          </div>
        </Card>

        {/* Results Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong className="font-tabular font-bold text-slate-900 dark:text-white">{questions.length}</strong> questions
            </span>
            {verifiedCount > 0 && (
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded font-semibold font-tabular inline-flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                {verifiedCount} Verified by SPPU Past Papers
              </span>
            )}
          </div>

          <div className="text-xs text-slate-500">
            Click any question to view its verified step-by-step model answer and marking scheme
          </div>
        </div>

        {/* Question Cards List */}
        {loading ? (
          <div className="space-y-4 py-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="p-6 animate-pulse space-y-4">
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            title="Error Loading Question Bank"
            description={error}
            actionLabel="Try Again"
            onAction={fetchQuestions}
          />
        ) : questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                id={q.id}
                question_text={q.question_text}
                marks={q.marks}
                difficulty={q.difficulty}
                question_type={q.question_type}
                is_pyq={q.is_pyq}
                verification_status={q.verification_status}
                subject={q.subject}
                unit={q.unit}
                topic={q.topic}
                occurrences={q.occurrences}
                answers_count={q.answers_count}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No Questions Match Your Filter"
            description="Try loosening your filters or resetting the search term to view questions from other units or exam sessions."
            actionLabel="Reset All Filters"
            onAction={resetFilters}
          />
        )}
      </main>

      <Footer />
    </div>
  );
}
