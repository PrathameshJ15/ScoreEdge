'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useAuth } from '@/context/AuthContext';
import { 
  getStudentEnrolledSubjects, 
  EnrolledSubjectData,
  getSubjectQuestionItems,
  getSubjectNoteItems,
  getSubjectPYQPapers,
} from '@/lib/curriculum/studentCurriculum';
import { 
  getLocalBacklogs, 
  BacklogSubjectItem 
} from '@/lib/backlog/backlogStore';
import { 
  DBMS_UNITS, 
  DBMS_QUESTION_CLUSTERS, 
  DBMS_NOTES,
  DBMS_PYQS 
} from '@/data/sppuData';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Layers,
  FileText,
  HelpCircle,
  Award,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingUp,
  Target,
  BarChart3,
  Calendar,
  AlertTriangle,
  Flame,
  Plus,
  Zap,
} from 'lucide-react';

export default function DashboardSubjectsPage() {
  const searchParams = useSearchParams();
  const initialSubjectParam = searchParams.get('subject');
  const isBacklogParam = searchParams.get('backlog') === 'true';

  const { user } = useAuth();

  const [activeSubjectId, setActiveSubjectId] = useState<string | null>(initialSubjectParam || null);
  const [workspaceTab, setWorkspaceTab] = useState<'units' | 'notes' | 'questions' | 'pyqs'>('units');
  const [backlogs, setBacklogs] = useState<BacklogSubjectItem[]>([]);
  const [completedUnits, setCompletedUnits] = useState<string[]>(['u-1', 'u-2']);

  // Dynamic enrolled subjects based on logged-in student
  const enrolledSubjects = React.useMemo(() => getStudentEnrolledSubjects(user), [user]);

  // Load backlogs
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

  useEffect(() => {
    if (initialSubjectParam) {
      setActiveSubjectId(initialSubjectParam);
    }
  }, [initialSubjectParam]);

  // Find active subject details from enrolled subjects OR backlogs
  const activeEnrolled = enrolledSubjects.find((s) => s.id === activeSubjectId);
  const activeBacklog = backlogs.find((b) => b.subjectId === activeSubjectId);

  const activeSubjectInfo = activeEnrolled
    ? {
        id: activeEnrolled.id,
        code: activeEnrolled.code,
        name: activeEnrolled.name,
        shortName: activeEnrolled.shortName,
        credits: activeEnrolled.credits,
        readiness: activeEnrolled.readiness,
        isBacklog: false,
        highYield: activeEnrolled.highYieldTopic,
        inSemFocus: activeEnrolled.inSemFocus,
      }
    : activeBacklog
    ? {
        id: activeBacklog.subjectId,
        code: activeBacklog.code,
        name: activeBacklog.name,
        shortName: activeBacklog.shortName,
        credits: 4,
        readiness: activeBacklog.readiness,
        isBacklog: true,
        highYield: 'High-Recurrence In-Sem & End-Sem Exam Concepts',
        inSemFocus: `${activeBacklog.academicYear} Sem ${activeBacklog.semester} Clearance Prep`,
      }
    : null;

  // Dynamic content for the active subject
  const dynamicQuestions = activeSubjectInfo
    ? activeSubjectInfo.id === 'dbms'
      ? DBMS_PYQS
      : getSubjectQuestionItems(activeSubjectInfo.id, activeSubjectInfo.name, activeSubjectInfo.code)
    : [];

  const dynamicNotes = activeSubjectInfo
    ? activeSubjectInfo.id === 'dbms'
      ? DBMS_NOTES
      : getSubjectNoteItems(activeSubjectInfo.id, activeSubjectInfo.name)
    : [];

  const dynamicPYQs = activeSubjectInfo
    ? getSubjectPYQPapers(activeSubjectInfo.id, activeSubjectInfo.code, activeSubjectInfo.name)
    : [];

  const toggleUnit = (uId: string) => {
    if (completedUnits.includes(uId)) {
      setCompletedUnits(completedUnits.filter((id) => id !== uId));
    } else {
      setCompletedUnits([...completedUnits, uId]);
    }
  };

  return (
    <DashboardShell
      activeSubject={activeSubjectId || enrolledSubjects[0]?.id || 'dbms'}
      onSubjectChange={(id) => setActiveSubjectId(id)}
    >
      <div className="space-y-6">

        {/* View 1: If No Specific Subject Selected -> Show Full Subjects Grid */}
        {!activeSubjectInfo ? (
          <div className="space-y-8">
            
            {/* Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 border border-brand-200/80 dark:border-brand-800/60 text-brand-800 dark:text-brand-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Enrolled Curriculum Workspace</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
                  Academic Subjects ({user?.academic_year || 'SE'} • Sem {user?.semester_number || 4})
                </h1>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Department of <strong>{user?.department || 'Computer Engineering'}</strong> • Syllabus: <strong>{user?.pattern || '2024 Pattern (NEP)'}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard/backlog"
                  className="px-3.5 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-1.5 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Backlog Hub ({backlogs.length})</span>
                </Link>
              </div>
            </div>

            {/* SECTION 1: Regular Enrolled Subjects Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Enrolled Semester Subjects ({enrolledSubjects.length})
                </h2>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-semibold">
                  SPPU Verified Curriculum
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {enrolledSubjects.map((sub) => (
                  <Card
                    key={sub.id}
                    className="p-5 bg-white dark:bg-zinc-900 border-zinc-200/80 dark:border-zinc-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Top Code & Credits Pill */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-1 rounded-md font-mono text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                          {sub.code}
                        </span>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {sub.credits} Credits
                        </span>
                      </div>

                      {/* Title */}
                      <div>
                        <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {sub.name}
                        </h3>
                        <div className="text-xs font-medium text-zinc-400 mt-0.5">
                          {sub.shortName} • {user?.academic_year || 'SE'} Engineering
                        </div>
                      </div>

                      {/* In-Sem & High-Yield highlights */}
                      <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 text-[11px] space-y-1.5">
                        <div className="text-zinc-500 dark:text-zinc-400 leading-snug">
                          <strong className="text-zinc-700 dark:text-zinc-300">Exam Focus:</strong> {sub.inSemFocus}
                        </div>
                        <div className="text-amber-700 dark:text-amber-400 leading-snug font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="truncate">{sub.highYieldTopic}</span>
                        </div>
                      </div>

                      {/* Readiness Bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono font-semibold">
                          <span className="text-zinc-500">Readiness Score</span>
                          <span className="text-emerald-600 dark:text-emerald-400">{sub.readiness}%</span>
                        </div>
                        <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all"
                            style={{ width: `${sub.readiness}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Box */}
                    <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                      <Button
                        variant="primary"
                        onClick={() => setActiveSubjectId(sub.id)}
                        className="w-full gap-2 text-xs py-2 shadow-xs"
                      >
                        <span>Study Subject Vault</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>

                      <div className="grid grid-cols-3 gap-1 text-center">
                        <Link
                          href={`/dashboard/questions?subject=${sub.id}`}
                          className="py-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        >
                          QB Questions
                        </Link>
                        <Link
                          href={`/dashboard/notes?subject=${sub.id}`}
                          className="py-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        >
                          Notes
                        </Link>
                        <Link
                          href={`/dashboard/pyqs?subject=${sub.id}`}
                          className="py-1 text-[11px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-colors"
                        >
                          PYQs
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* SECTION 2: Backlog Subjects Section (if student has backlogs) */}
            {backlogs.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Active Backlog / ATKT Subjects ({backlogs.length})
                    </h2>
                  </div>
                  <Link
                    href="/dashboard/backlog"
                    className="text-xs text-amber-600 dark:text-amber-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Manage Backlogs</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {backlogs.map((b) => (
                    <Card
                      key={b.id}
                      className="p-5 bg-white dark:bg-zinc-900 border-amber-300/80 dark:border-amber-700/80 hover:border-amber-500 shadow-xs hover:shadow-md transition-all rounded-2xl flex flex-col justify-between space-y-4 relative"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded-full font-mono text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1">
                            <Flame className="w-3 h-3 text-amber-600" />
                            <span>Backlog • {b.academicYear} Sem {b.semester}</span>
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono text-[10px] text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800">
                            {b.code}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base font-extrabold text-zinc-900 dark:text-white tracking-tight">
                            {b.name} ({b.shortName})
                          </h3>
                          <div className="text-xs text-zinc-400">
                            Scope: {b.resourceScope === 'all' ? 'Full Suite' : b.resourceScope.toUpperCase()} • {b.targetClearanceSession}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-mono font-semibold">
                            <span className="text-zinc-500">Passing Readiness</span>
                            <span className="text-amber-600 dark:text-amber-400">{b.readiness}%</span>
                          </div>
                          <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-amber-500 h-full rounded-full transition-all"
                              style={{ width: `${b.readiness}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                        <Button
                          variant="primary"
                          onClick={() => setActiveSubjectId(b.subjectId)}
                          className="w-full gap-2 text-xs py-2 bg-amber-600 hover:bg-amber-700 text-white"
                        >
                          <span>Study Backlog Vault</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        ) : (
          /* View 2: Active Subject Workspace */
          <div className="space-y-6 animate-in fade-in">
            
            {/* Navigation back strip */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveSubjectId(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Enrolled Subjects</span>
              </button>

              {activeSubjectInfo.isBacklog && (
                <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 border border-amber-300 dark:border-amber-800">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>Backlog / ATKT Mode Active</span>
                </span>
              )}
            </div>

            {/* Subject Hero Card */}
            <Card className="p-6 bg-gradient-to-br from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 border-zinc-200/80 dark:border-zinc-800 rounded-2xl shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded font-mono text-xs font-bold bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
                      Code: {activeSubjectInfo.code}
                    </span>
                    <span className="text-xs text-zinc-400 font-mono">
                      {activeSubjectInfo.credits} University Credits
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                    {activeSubjectInfo.name} ({activeSubjectInfo.shortName})
                  </h1>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                    {activeSubjectInfo.highYield}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-2xl font-mono font-extrabold text-brand-600 dark:text-brand-400">
                      {activeSubjectInfo.readiness}%
                    </div>
                    <div className="text-[10px] text-zinc-400 uppercase font-mono tracking-wider">
                      Readiness Index
                    </div>
                  </div>
                </div>
              </div>

              {/* Workspace Navigation Tabs */}
              <div className="flex items-center gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-4 overflow-x-auto no-scrollbar">
                {[
                  { id: 'units', label: 'Units & Syllabus (6 Units)', icon: Layers },
                  { id: 'questions', label: `Solved Questions (${dynamicQuestions.length})`, icon: HelpCircle },
                  { id: 'notes', label: `High-Yield Notes (${dynamicNotes.length})`, icon: FileText },
                  { id: 'pyqs', label: `Past Papers (${dynamicPYQs.length})`, icon: Award },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setWorkspaceTab(tab.id as any)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                        workspaceTab === tab.id
                          ? 'bg-brand-600 text-white shadow-xs'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Tab 1: Units & Syllabus */}
            {workspaceTab === 'units' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Syllabus Units &amp; Exam Weightage
                  </h3>
                  <span className="text-xs font-mono text-zinc-400">
                    {completedUnits.length} of 6 Units Mastered
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map((uNum) => {
                    const uId = `u-${uNum}`;
                    const isDone = completedUnits.includes(uId);
                    return (
                      <Card
                        key={uNum}
                        className={`p-4 rounded-xl border transition-all space-y-3 ${
                          isDone 
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60' 
                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                              Unit {uNum} • {uNum <= 2 ? 'In-Sem & End-Sem' : 'End-Sem Priority'}
                            </span>
                            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                              {activeSubjectInfo.shortName} Unit {uNum}: Core Concept Mastery
                            </h4>
                          </div>

                          <button
                            onClick={() => toggleUnit(uId)}
                            className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                              isDone
                                ? 'bg-emerald-600 text-white'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Comprehensive coverage of analytical derivations, recurring numerical patterns, and examiner scoring keys.
                        </p>

                        <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800 text-xs">
                          <Link
                            href={`/dashboard/questions?subject=${activeSubjectInfo.id}&unit=${uNum}`}
                            className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                          >
                            Practice Unit {uNum} Questions →
                          </Link>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Solved Questions */}
            {workspaceTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    High-Yield Solved Questions for {activeSubjectInfo.name}
                  </h3>
                  <Link
                    href={`/dashboard/questions?subject=${activeSubjectInfo.id}`}
                    className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
                  >
                    Open Full Question Bank →
                  </Link>
                </div>

                <div className="space-y-3">
                  {dynamicQuestions.map((q: any) => (
                    <Card
                      key={q.id}
                      className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-mono text-[10px] font-bold">
                            Unit {q.unitNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-mono text-[10px] font-bold">
                            {q.marks} Marks
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {q.conceptCluster}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                        {q.text}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1 border-t border-zinc-100 dark:border-zinc-800">
                        <span>Asked in: {q.examYears?.join(', ') || 'Recent Examinations'}</span>
                        <Link
                          href={`/dashboard/questions?subject=${activeSubjectInfo.id}`}
                          className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                        >
                          View Solved Model Rubric
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 3: Notes */}
            {workspaceTab === 'notes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Exam-Oriented Notes for {activeSubjectInfo.name}
                  </h3>
                  <Link
                    href={`/dashboard/notes?subject=${activeSubjectInfo.id}`}
                    className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
                  >
                    Open Notes Hub →
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {dynamicNotes.map((note: any) => (
                    <Card
                      key={note.id}
                      className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                        <span>Unit {note.unitNumber || 1} • {note.readTime || '15 min read'}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                          HIGH-YIELD
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                        {note.title}
                      </h4>

                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                        {note.summary}
                      </p>

                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                        <Link
                          href={`/dashboard/notes?subject=${activeSubjectInfo.id}`}
                          className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
                        >
                          <span>Study Notes</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Past Papers */}
            {workspaceTab === 'pyqs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                    Official Question Papers Archive ({dynamicPYQs.length} Papers)
                  </h3>
                  <Link
                    href={`/dashboard/pyqs?subject=${activeSubjectInfo.id}`}
                    className="text-xs text-brand-600 dark:text-brand-400 font-bold hover:underline"
                  >
                    View PYQ Analytics →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {dynamicPYQs.map((paper: any) => (
                    <Card
                      key={paper.id}
                      className="p-4 bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{paper.session}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          {paper.marks} Marks
                        </span>
                      </div>
                      <div className="text-xs font-bold text-zinc-900 dark:text-white">
                        {paper.type} • {paper.duration}
                      </div>
                      <div className="text-[11px] font-mono text-zinc-400">
                        {paper.code} ({paper.questionsCount} Questions)
                      </div>
                      <Link
                        href={`/dashboard/pyqs?subject=${activeSubjectInfo.id}`}
                        className="block text-center mt-2 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-brand-50 hover:text-brand-600 text-xs font-semibold transition-colors"
                      >
                        Solve Exam Paper
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </DashboardShell>
  );
}
