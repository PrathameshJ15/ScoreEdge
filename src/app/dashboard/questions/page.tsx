'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { 
  getStudentEnrolledSubjects, 
  getSubjectQuestionItems 
} from '@/lib/curriculum/studentCurriculum';
import { 
  getLocalBacklogs, 
  BacklogSubjectItem 
} from '@/lib/backlog/backlogStore';
import { DBMS_PYQS, DashboardQuestionItem } from '@/data/sppuData';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Square,
  Award,
  Filter,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Flame,
} from 'lucide-react';

function QuestionsPageContent() {
  const searchParams = useSearchParams();
  const initialSubjectParam = searchParams.get('subject');

  const { user } = useAuth();
  const enrolledSubjects = React.useMemo(() => getStudentEnrolledSubjects(user), [user]);
  const [backlogs, setBacklogs] = useState<BacklogSubjectItem[]>([]);

  useEffect(() => {
    const local = getLocalBacklogs();
    if (local.length > 0) {
      setBacklogs(local);
    } else if (user?.backlog_subjects_json) {
      try {
        setBacklogs(JSON.parse(user.backlog_subjects_json));
      } catch {
        // ignore
      }
    }
  }, [user]);

  const defaultSub = enrolledSubjects[0]?.id || 'dbms';
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectParam || defaultSub);
  const [selectedMarks, setSelectedMarks] = useState<number | 'all'>('all');
  const [selectedUnit, setSelectedUnit] = useState<number | 'all'>('all');
  const [practicedQuestionIds, setPracticedQuestionIds] = useState<string[]>(['dbms-pyq-1']);
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialSubjectParam) {
      setSelectedSubjectId(initialSubjectParam);
    }
  }, [initialSubjectParam]);

  // Combine regular and backlog subjects
  const allAvailableSubjects = [
    ...enrolledSubjects.map((s) => ({
      id: s.id,
      name: s.name,
      shortName: s.shortName,
      code: s.code,
      isBacklog: false,
      year: user?.academic_year || 'SE',
    })),
    ...backlogs.map((b) => ({
      id: b.subjectId,
      name: b.name,
      shortName: b.shortName,
      code: b.code,
      isBacklog: true,
      year: b.academicYear,
    })),
  ];

  const activeSubjectObj = allAvailableSubjects.find((s) => s.id === selectedSubjectId) || allAvailableSubjects[0];

  // Resolve questions for active subject
  const currentQuestions: any[] = React.useMemo(() => {
    if (selectedSubjectId === 'dbms') {
      return DBMS_PYQS;
    }
    return getSubjectQuestionItems(selectedSubjectId, activeSubjectObj?.name, activeSubjectObj?.code);
  }, [selectedSubjectId, activeSubjectObj]);

  const filteredQuestions = currentQuestions.filter((q: any) => {
    const matchesMarks = selectedMarks === 'all' || q.marks === selectedMarks;
    const matchesUnit = selectedUnit === 'all' || q.unitNumber === selectedUnit;
    const matchesSearch =
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.conceptCluster.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMarks && matchesUnit && matchesSearch;
  });

  const togglePracticed = (id: string) => {
    if (practicedQuestionIds.includes(id)) {
      setPracticedQuestionIds(practicedQuestionIds.filter((item) => item !== id));
    } else {
      setPracticedQuestionIds([...practicedQuestionIds, id]);
    }
  };

  return (
    <DashboardShell
      activeSubject={selectedSubjectId}
      onSubjectChange={(id) => setSelectedSubjectId(id)}
    >
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-800 dark:text-brand-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>SPPU Question Bank (QB) Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Question Bank &amp; Solved Marking Rubrics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Unit-wise solved exam questions for <strong>{user?.academic_year || 'SE'} {user?.department || 'Computer Engineering'}</strong> with examiner scoring schemes.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg">
            <span>{practicedQuestionIds.length} of {currentQuestions.length} Practiced</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBJECT BOX CARDS (User Request: "create box like structures for like say subject dbms then dsa... button to study") */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              Select Subject to Practice Questions ({allAvailableSubjects.length} Available)
            </span>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
              Active: {activeSubjectObj?.shortName}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {allAvailableSubjects.map((sub) => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 ring-1 ring-brand-500 shadow-xs'
                      : 'border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] text-zinc-400">
                        {sub.code}
                      </span>
                      {sub.isBacklog ? (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[9px] font-bold">
                          ATKT
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold">
                          {sub.year}
                        </span>
                      )}
                    </div>

                    <div className="font-extrabold text-xs text-zinc-900 dark:text-white line-clamp-1">
                      {sub.shortName}
                    </div>
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                      {sub.name}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSubjectId(sub.id);
                    }}
                    className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold text-center transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-brand-50 hover:text-brand-600'
                    }`}
                  >
                    {isSelected ? 'Studying Questions ✓' : 'Study Questions'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Filter Strip */}
        <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
          
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder={`Search keywords in ${activeSubjectObj?.shortName} (e.g. proof, algorithm, derivation)...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs pl-9 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          {/* Unit & Marks Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-zinc-400 text-[11px] mr-1 hidden sm:inline">Marks:</span>
            {(['all', 2, 5, 6, 8, 10] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMarks(m as any)}
                className={`px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedMarks === m
                    ? 'bg-brand-600 text-white font-bold'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                }`}
              >
                {m === 'all' ? 'All Marks' : `${m}M`}
              </button>
            ))}

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-700 mx-1" />

            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs py-1.5 px-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 focus:outline-none"
            >
              <option value="all">All Units</option>
              <option value={1}>Unit 1</option>
              <option value={2}>Unit 2</option>
              <option value={3}>Unit 3</option>
              <option value={4}>Unit 4</option>
              <option value={5}>Unit 5</option>
            </select>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Showing {filteredQuestions.length} Questions for <strong>{activeSubjectObj?.name}</strong></span>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 text-xs">
              No questions found matching your filter criteria. Try clearing search filters.
            </div>
          ) : (
            filteredQuestions.map((q: any) => {
              const isPracticed = practicedQuestionIds.includes(q.id);
              const isExpanded = expandedAnswerId === q.id;

              return (
                <Card
                  key={q.id}
                  className="p-5 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 rounded-xl shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-bold border border-brand-200/60 dark:border-brand-800/60">
                        Unit {q.unitNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-200/60 dark:border-amber-800/60">
                        {q.marks} Marks
                      </span>
                      <span className="text-[11px] font-mono text-zinc-400">
                        {q.conceptCluster}
                      </span>
                    </div>

                    <button
                      onClick={() => togglePracticed(q.id)}
                      className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
                        isPracticed
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200'
                      }`}
                      title={isPracticed ? 'Marked as Practiced' : 'Mark as Practiced'}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[10px] hidden sm:inline">
                        {isPracticed ? 'Practiced' : 'Mark Done'}
                      </span>
                    </button>
                  </div>

                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-relaxed">
                    {q.text}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400 font-mono">
                    <span>Asked: {q.examYears?.join(', ') || 'Previous SPPU Examinations'}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedAnswerId(isExpanded ? null : q.id)}
                      className="text-brand-600 dark:text-brand-400 font-bold hover:underline text-left"
                    >
                      {isExpanded ? 'Hide Model Solution' : 'View Stepwise Model Answer & Rubric →'}
                    </button>
                  </div>

                  {/* Expanded Model Answer & Rubric */}
                  {isExpanded && (
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-3 text-xs animate-in fade-in">
                      <div className="flex items-center gap-2 font-bold text-zinc-800 dark:text-zinc-200">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Examiner Stepwise Scoring Rubric ({q.marks} Marks Total):</span>
                      </div>

                      <ul className="space-y-1 text-zinc-600 dark:text-zinc-300 list-disc list-inside">
                        <li><strong>Definitions &amp; Boundary Conditions:</strong> Full statement with standard engineering notations (+2 Marks).</li>
                        <li><strong>System Schematic / Tracing:</strong> Clear architectural flow diagram with directional indicators (+2 Marks).</li>
                        <li><strong>Mathematical / Code Derivation:</strong> Step-by-step reduction showing intermediate states (+{Math.max(q.marks - 4, 2)} Marks).</li>
                      </ul>

                      <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[11px] leading-snug">
                        <strong>Top Scorer Tip:</strong> SPPU university evaluators penalize unlabeled diagrams. Always specify input/output labels and state asymptotic time complexity in the concluding remarks!
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>

      </div>
    </DashboardShell>
  );
}

export default function DashboardQuestionsPage() {
  return (
    <React.Suspense fallback={<div className="p-6 text-sm text-slate-500">Loading Questions...</div>}>
      <QuestionsPageContent />
    </React.Suspense>
  );
}
