'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { PYQCard } from '@/components/questions/PYQCard';
import {
  FileText,
  ShieldCheck,
  ArrowRight,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { PYQIntelligenceView } from '@/components/intelligence/PYQIntelligenceView';

interface PYQItem {
  id: string;
  question_text: string;
  marks: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  question_type: string;
  verification_status: string;
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
  } | null;
  occurrences: Array<{
    id: string;
    year: number;
    exam_session: 'IN_SEM' | 'END_SEM' | 'RE_EXAM';
    question_number: string;
    marks: number;
    pattern_id: string;
  }>;
}

interface ExamPaperItem {
  id: string;
  title: string;
  subject_id: string;
  subject_name: string;
  subject_short_name: string;
  subject_code: string;
  year: number;
  exam_session: 'IN_SEM' | 'END_SEM' | 'RE_EXAM';
  pattern_id: string;
  pattern_name: string;
  total_marks: number;
  question_count: number;
  questions: Array<{
    id: string;
    occurrence_id: string;
    question_number: string;
    question_text: string;
    marks: number;
    unit_id: string;
    unit_number?: number;
    unit_title?: string;
    topic_id?: string | null;
    difficulty: string;
    question_type: string;
    verification_status: string;
  }>;
}

export default function PYQLibraryPage() {
  const [activeTab, setActiveTab] = useState<'archive' | 'papers' | 'intelligence'>('archive');

  // Archive filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('ALL');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [selectedMarks, setSelectedMarks] = useState<string>('ALL');
  const [selectedPattern, setSelectedPattern] = useState<string>('ALL');

  // Data
  const [questions, setQuestions] = useState<PYQItem[]>([]);
  const [papers, setPapers] = useState<ExamPaperItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded paper ID for paper browsing
  const [expandedPaperId, setExpandedPaperId] = useState<string | null>(null);

  // Fetch PYQs
  const fetchPYQs = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('is_pyq', 'true');
      if (selectedSubject !== 'ALL') params.set('subject_id', selectedSubject);
      if (selectedYear !== 'ALL') params.set('year', selectedYear);
      if (selectedSession !== 'ALL') params.set('exam_session', selectedSession);
      if (selectedMarks !== 'ALL') params.set('marks', selectedMarks);
      if (selectedPattern !== 'ALL') params.set('pattern_id', selectedPattern);
      if (searchTerm.trim()) params.set('q', searchTerm.trim());
      params.set('limit', '100');

      const res = await fetch(`/api/questions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch PYQs');
      const json = await res.json();
      setQuestions(json.data || []);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching PYQs');
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedYear, selectedSession, selectedMarks, selectedPattern, searchTerm]);

  // Fetch Papers
  const fetchPapers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (selectedSubject !== 'ALL') params.set('subject_id', selectedSubject);
      if (selectedYear !== 'ALL') params.set('year', selectedYear);
      if (selectedSession !== 'ALL') params.set('exam_session', selectedSession);
      if (selectedPattern !== 'ALL') params.set('pattern_id', selectedPattern);

      const res = await fetch(`/api/papers?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setPapers(json.data || []);
        if (json.data && json.data.length > 0 && !expandedPaperId) {
          setExpandedPaperId(json.data[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to fetch papers', e);
    }
  }, [selectedSubject, selectedYear, selectedSession, selectedPattern, expandedPaperId]);

  useEffect(() => {
    fetchPYQs();
    fetchPapers();
  }, [fetchPYQs, fetchPapers]);

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedSubject('ALL');
    setSelectedYear('ALL');
    setSelectedSession('ALL');
    setSelectedMarks('ALL');
    setSelectedPattern('ALL');
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedSubject !== 'ALL' ||
    selectedYear !== 'ALL' ||
    selectedSession !== 'ALL' ||
    selectedMarks !== 'ALL' ||
    selectedPattern !== 'ALL';

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase tracking-wider border border-brand-200 dark:border-brand-800">
            <FileText className="w-3.5 h-3.5" />
            <span>Official Examination Repository</span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                SPPU Previous Year Question Papers (PYQ)
              </h1>
              <p className="text-zinc-600 dark:text-zinc-300 text-sm sm:text-base max-w-3xl leading-relaxed mt-1">
                Authentic, faculty-verified In-Sem and End-Sem question papers indexed by pattern, branch, unit weightage, and recurring exam frequency.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link href="/questions">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <HelpCircle className="w-4 h-4 text-brand-600" />
                  <span>All Questions Bank</span>
                </Button>
              </Link>
              <Link href="/syllabus">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <BookOpen className="w-4 h-4 text-zinc-600" />
                  <span>Syllabus Breakdown</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            onClick={() => setActiveTab('archive')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'archive'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Question Archive ({questions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('papers')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'papers'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Browse Complete Exam Papers ({papers.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('intelligence')}
            className={`pb-3 px-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'intelligence'
                ? 'border-brand-600 text-brand-600 dark:text-brand-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            <Flame className="w-4 h-4 text-red-500" />
            <span>PYQ Intelligence Engine</span>
          </button>
        </div>

        {/* Filter Controls Card (for archive and papers) */}
        {activeTab !== 'intelligence' && (
        <Card className="p-5 sm:p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-1 bg-white dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              <SlidersHorizontal className="w-4 h-4 text-brand-600" />
              <span>Exam Paper Filters</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-2">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search PYQ text, e.g. Normalization, BCNF, Deadlock, B-Tree..."
              />
            </div>

            {/* Subject */}
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Subjects</option>
                <option value="sub-dbms">DBMS (210241)</option>
                <option value="sub-dsa">DSA (210242)</option>
                <option value="sub-oop">OOP (210243)</option>
                <option value="sub-os">OS (210244)</option>
                <option value="sub-toc">TOC (210245)</option>
              </select>
            </div>

            {/* Year */}
            <div>
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

            {/* Session */}
            <div>
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Sessions</option>
                <option value="IN_SEM">In-Sem (30M)</option>
                <option value="END_SEM">End-Sem (70M)</option>
                <option value="RE_EXAM">Re-Exam</option>
              </select>
            </div>

            {/* Pattern */}
            <div>
              <select
                value={selectedPattern}
                onChange={(e) => setSelectedPattern(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-control py-2 px-3 text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="ALL">All Patterns</option>
                <option value="pat-2024">2024 Pattern</option>
                <option value="pat-2019">2019 Pattern</option>
              </select>
            </div>
          </div>
        </Card>
        )}

        {/* TAB 1: QUESTION ARCHIVE VIEW */}
        {activeTab === 'archive' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span>
                Showing <strong className="font-tabular text-slate-800 dark:text-slate-200">{questions.length}</strong> Verified SPPU Questions
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-4 h-4" /> 100% SPPU Paper Verified
              </span>
            </div>

            {loading ? (
              <div className="space-y-4 py-8">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 animate-pulse space-y-4">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                  </Card>
                ))}
              </div>
            ) : error ? (
              <EmptyState
                title="Failed to Load PYQs"
                description={error}
                actionLabel="Try Again"
                onAction={fetchPYQs}
              />
            ) : questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q) => (
                  <PYQCard
                    key={q.id}
                    id={q.id}
                    question_text={q.question_text}
                    marks={q.marks}
                    difficulty={q.difficulty}
                    question_type={q.question_type}
                    verification_status={q.verification_status}
                    subject_short_name={q.subject?.short_name}
                    subject_code={q.subject?.code}
                    unit_number={q.unit?.unit_number}
                    unit_title={q.unit?.title}
                    topic_title={q.topic?.title}
                    occurrences={q.occurrences}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                title="No Previous Year Questions Found"
                description={`No questions match your selected criteria. Try resetting the year or subject filter.`}
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            )}
          </div>
        )}

        {/* TAB 2: PAPER BROWSING VIEW */}
        {activeTab === 'papers' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Available Examination Papers: <strong className="font-tabular text-slate-800 dark:text-slate-200">{papers.length} Papers</strong>
              </span>
              <span className="text-slate-400">
                Click any paper to inspect individual sections, questions, and model answers
              </span>
            </div>

            {papers.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Papers List Sidebar */}
                <div className="lg:col-span-5 space-y-3">
                  {papers.map((paper) => {
                    const isSelected = expandedPaperId === paper.id;
                    return (
                      <Card
                        key={paper.id}
                        onClick={() => setExpandedPaperId(paper.id)}
                        className={`p-4 cursor-pointer transition-all border ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/30 shadow-depth-2'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2 py-0.5 rounded bg-brand-100 dark:bg-brand-900/60 text-brand-800 dark:text-brand-300 font-tabular">
                                {paper.year} {paper.exam_session === 'IN_SEM' ? 'In-Sem' : 'End-Sem'}
                              </span>
                              <span className="text-xs font-semibold text-slate-500 font-tabular">
                                {paper.subject_short_name} ({paper.subject_code})
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                              {paper.title}
                            </h3>
                            <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                              <span>{paper.question_count} Verified Questions</span>
                              <span>•</span>
                              <span>{paper.pattern_name}</span>
                            </div>
                          </div>

                          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${isSelected ? 'translate-x-1 text-brand-600' : ''}`} />
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Selected Paper Details Pane */}
                <div className="lg:col-span-7">
                  {(() => {
                    const selectedPaper = papers.find((p) => p.id === expandedPaperId) || papers[0];
                    if (!selectedPaper) return null;

                    return (
                      <Card className="p-6 border-slate-200/90 dark:border-slate-800 shadow-depth-2 bg-white dark:bg-slate-900 space-y-6">
                        {/* Paper Header */}
                        <div className="border-b border-slate-100 dark:border-slate-800 pb-4 space-y-2">
                          <div className="flex items-center justify-between gap-2 text-xs">
                            <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                              <ShieldCheck className="w-3.5 h-3.5" />
                              Official SPPU Question Paper
                            </span>
                            <span className="font-mono text-slate-400">Pattern: {selectedPaper.pattern_name}</span>
                          </div>

                          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                            {selectedPaper.title}
                          </h2>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                            <span>Subject: {selectedPaper.subject_name}</span>
                            <span>•</span>
                            <span>Session: {selectedPaper.exam_session === 'IN_SEM' ? 'In-Semester Examination' : 'End-Semester Examination'}</span>
                            <span>•</span>
                            <span className="font-tabular font-bold text-slate-900 dark:text-white">
                              {selectedPaper.total_marks} Marks Documented
                            </span>
                          </div>
                        </div>

                        {/* Questions in this paper */}
                        <div className="space-y-4">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                            Questions in this Examination Paper ({selectedPaper.questions.length})
                          </span>

                          <div className="space-y-3">
                            {selectedPaper.questions.map((q) => (
                              <div
                                key={q.id}
                                className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 space-y-2.5"
                              >
                                <div className="flex items-center justify-between gap-2 text-xs">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white">
                                      {q.question_number}
                                    </span>
                                    <span className="font-tabular font-semibold text-slate-700 dark:text-slate-300">
                                      [{q.marks} Marks]
                                    </span>
                                    {q.unit_title && (
                                      <span className="text-slate-500">
                                        Unit {q.unit_number}: {q.unit_title}
                                      </span>
                                    )}
                                  </div>

                                  <Link
                                    href={`/questions/${q.id}`}
                                    className="font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                                  >
                                    <span>Read Solution</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </Link>
                                </div>

                                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
                                  {q.question_text}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <EmptyState
                title="No Examination Papers Found"
                description="No examination papers match your current filters. Reset filters to see papers from other years or subjects."
                actionLabel="Reset Filters"
                onAction={resetFilters}
              />
            )}
          </div>
        )}

        {/* TAB 3: PYQ INTELLIGENCE ENGINE */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            <PYQIntelligenceView
              subjectId={selectedSubject !== 'ALL' ? selectedSubject : 'sub-dbms'}
              showSubjectSelector={true}
              onSubjectChange={(newSubId) => setSelectedSubject(newSubId)}
              availableSubjects={[
                { id: 'sub-dbms', name: 'Database Management Systems', short_name: 'DBMS', code: '210241' },
                { id: 'sub-dsa', name: 'Data Structures & Algorithms', short_name: 'DSA', code: '210242' },
                { id: 'sub-oop', name: 'Object Oriented Programming', short_name: 'OOP', code: '210243' },
                { id: 'sub-os', name: 'Operating Systems', short_name: 'OS', code: '210244' },
                { id: 'sub-toc', name: 'Theory of Computation', short_name: 'TOC', code: '210245' },
              ]}
            />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}