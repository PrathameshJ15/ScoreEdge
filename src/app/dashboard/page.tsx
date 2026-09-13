'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import {
  calculateStudentPersonalization,
  StudentProgressSummary,
} from '@/lib/progress/personalizationEngine';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  Clock,
  Sparkles,
  CheckSquare,
  Square,
  ArrowRight,
  ChevronRight,
  Target,
  Flame,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BrainCircuit,
  Layers,
  Calendar,
  Zap,
  ShieldCheck,
  Compass,
} from 'lucide-react';

import { getStudentEnrolledSubjects, EnrolledSubjectData } from '@/lib/curriculum/studentCurriculum';

function DashboardOverview() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Dynamic student curriculum based on authenticated student profile
  const enrolledSubjects = useMemo(() => getStudentEnrolledSubjects(user), [user]);
  const [activeSubject, setActiveSubject] = useState<string>('');
  const [summary, setSummary] = useState<StudentProgressSummary | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(['act-1', 'task-1']);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Authentication guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/dashboard&error=unauthorized');
    }
  }, [authLoading, isAuthenticated, router]);

  // Keep active subject synchronized with the student's enrolled subjects
  useEffect(() => {
    if (enrolledSubjects.length > 0) {
      if (!activeSubject || !enrolledSubjects.some((s) => s.id === activeSubject)) {
        setActiveSubject(enrolledSubjects[0].id);
      }
    }
  }, [enrolledSubjects, activeSubject]);

  const currentSubject = useMemo(() => {
    return enrolledSubjects.find((s) => s.id === activeSubject) || enrolledSubjects[0];
  }, [enrolledSubjects, activeSubject]);

  const currentSubjectId = currentSubject?.code ? `sub-${currentSubject.id}` : 'sub-dbms';

  // Load progress data for active subject
  useEffect(() => {
    let isMounted = true;
    async function loadProgress() {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('scoreedge_auth_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/progress?subject_id=${currentSubjectId}`, {
          headers,
        });

        if (res.ok) {
          const json = await res.json();
          if (isMounted && json?.data) {
            setSummary(json.data);
          }
        } else {
          if (isMounted) {
            setSummary(
              calculateStudentPersonalization(user?.id || 'usr-student-1', currentSubjectId)
            );
          }
        }
      } catch {
        if (isMounted) {
          setSummary(
            calculateStudentPersonalization(user?.id || 'usr-student-1', currentSubjectId)
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadProgress();
    return () => {
      isMounted = false;
    };
  }, [currentSubjectId, user]);

  const activeSummary = useMemo(() => {
    if (summary) return summary;
    return calculateStudentPersonalization(user?.id || 'usr-student-1', currentSubjectId);
  }, [summary, user, currentSubjectId]);

  const toggleTask = (taskId: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  return (
    <DashboardShell activeSubject={activeSubject} onSubjectChange={setActiveSubject}>
      <div className="space-y-8">
        {/* Top Hero Greeting & Countdown */}
        <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 relative overflow-hidden shadow-xs">
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/5 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  {user?.academic_year || 'SE'} {user?.branch_code || 'COMP'} • Sem {user?.semester_number || 4}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                  <Calendar className="w-3.5 h-3.5" />
                  22 Days to SPPU In-Sem Exam
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
                Welcome back, {user?.full_name ? user.full_name.split(' ')[0] : 'Student'}!
              </h1>

              <p className="text-sm text-slate-600 dark:text-slate-400 font-serif max-w-2xl leading-relaxed">
                You are currently preparing <span className="font-semibold text-teal-600 dark:text-teal-400">{currentSubject?.name || 'Curriculum'}</span> ({currentSubject?.code}).
                Studying high-yield concepts in <span className="font-semibold text-slate-900 dark:text-white">{user?.department || 'your department'}</span> will boost your preparation towards your target of <span className="font-mono font-semibold text-slate-900 dark:text-white">{user?.target_sgpa ? user.target_sgpa.toFixed(1) : '9.2'} SGPA</span>.
              </p>
            </div>

            {/* Quick Action Pills */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link href="/dashboard/exam-mode">
                <Button className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Exam Mode Triage
                </Button>
              </Link>

              <Link href="/dashboard/ai">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Ask AI Tutor
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Core Readiness Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                Exam Readiness
              </span>
              <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <Target className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {currentSubject?.readiness || 82}%
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> +6% this week
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-teal-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentSubject?.readiness || 82}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Status</span>
              <span className="text-teal-600 dark:text-teal-400 font-semibold">
                {(currentSubject?.readiness || 82) > 75 ? 'Exam Ready' : 'In Progress'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                High-Yield Topics
              </span>
              <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {activeSummary.syllabus_coverage.completed_topics || 18}
              </span>
              <span className="text-xs text-slate-500 font-mono">
                / {activeSummary.syllabus_coverage.total_topics || 24} Mastered
              </span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${activeSummary.syllabus_coverage.percentage || 75}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Syllabus Coverage</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">
                {activeSummary.syllabus_coverage.percentage || 75}%
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                Solved PYQs
              </span>
              <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
                <Award className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                48
              </span>
              <span className="text-xs text-slate-500 font-mono">/ 64 Evaluated</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-600 h-full rounded-full w-[75%]" />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Marking Rubrics</span>
              <span className="text-purple-600 dark:text-purple-400 font-semibold">75% Complete</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-wider">
                Exam Blueprint
              </span>
              <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Zap className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">
                {user?.target_sgpa ? user.target_sgpa.toFixed(1) : '9.2'}
              </span>
              <span className="text-xs text-slate-500 font-mono">Target SGPA</span>
            </div>
            <div className="mt-3 w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full"
                style={{ width: `${Math.min(100, Math.round(((user?.target_sgpa || 9.2) / 10) * 100))}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex justify-between font-mono">
              <span>Goal Confidence</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">High Confidence</span>
            </div>
          </div>
        </div>

        {/* Section: Dedicated Navigation Hub (Every Section Explained Clearly) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                Dedicated Study Sub-Workspaces
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                Direct access to each dedicated module tailored specifically to your student account
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Subjects Card */}
            <Link
              href="/dashboard/subjects"
              className="group bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-500/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Step-by-Step Selection
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-sans group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  My Subjects & Syllabus
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mt-1 line-clamp-2 leading-relaxed">
                  Step-by-step branch, semester, pattern filter & deep interactive workspace for all 6 units.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                <span>Launch Subject Workspace</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 2. Notes Card */}
            <Link
              href="/dashboard/notes"
              className="group bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    6-Mark Rubrics
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-sans group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  High-Yield Exam Notes
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mt-1 line-clamp-2 leading-relaxed">
                  Academic notes condensed for maximum recall with SPPU examiner breakdown guidelines.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
                <span>Explore Notes</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 3. Question Bank Card */}
            <Link
              href="/dashboard/questions"
              className="group bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    2M • 5M • 8M • 10M
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-sans group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Question Bank (QB)
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mt-1 line-clamp-2 leading-relaxed">
                  Comprehensive categorized repository of university questions with official evaluator solutions.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span>Browse Questions</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 4. PYQ Past Papers Card */}
            <Link
              href="/dashboard/pyqs"
              className="group bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 hover:border-purple-500/50 dark:hover:border-purple-500/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    5-Cycle Recurrence
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-sans group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Past Papers & Clusters
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mt-1 line-clamp-2 leading-relaxed">
                  Master question recurrence clusters tracked across May 2024 to Dec 2022 exam cycles.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400">
                <span>View PYQ Archive</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 5. Exam Mode Triage Card */}
            <Link
              href="/dashboard/exam-mode"
              className="group bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 hover:border-amber-500/50 dark:hover:border-amber-500/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
                    Crunch Time
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-sans group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  Exam Mode Triage
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mt-1 line-clamp-2 leading-relaxed">
                  Emergency 2h, 5h, or 12h crash revision planner filtering the highest ROI topics.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>Enter Crash Mode</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* 6. AI Grounded Tutor Card */}
            <Link
              href="/dashboard/ai"
              className="group bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 hover:border-teal-500/50 dark:hover:border-teal-500/50 rounded-2xl p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300">
                    Syllabus Grounded
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base font-sans group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  AI Study Tutor
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-serif mt-1 line-clamp-2 leading-relaxed">
                  Ask doubts, generate exact marks-scheme answers, and quiz yourself on specific topics.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
                <span>Chat with AI Tutor</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* Section: Active Enrolled Subjects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white font-sans">
                Active Enrolled Subjects ({user?.department || 'Engineering'} - {user?.academic_year || 'SE'} Sem {user?.semester_number || 4})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                Select any subject to jump directly into its full workspace tailored to your branch & semester
              </p>
            </div>
            <Link
              href="/dashboard/subjects"
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>View All {enrolledSubjects.length} Subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledSubjects.map((sub) => (
              <div
                key={sub.id}
                className={`bg-white dark:bg-[#0a1120] border rounded-2xl p-5 shadow-xs transition-all flex flex-col justify-between ${
                  activeSubject === sub.id
                    ? 'border-teal-500 ring-2 ring-teal-500/20'
                    : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      Code: {sub.code} • {sub.credits} Credits
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {sub.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                    {sub.name}
                  </h3>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-500">Readiness</span>
                      <span className="text-teal-600 dark:text-teal-400 font-bold">
                        {sub.readiness}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full"
                        style={{ width: `${sub.readiness}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/60 text-xs">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                      High-Yield Target
                    </div>
                    <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 truncate">
                      {sub.highYieldTopic}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setActiveSubject(sub.id)}
                    className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400"
                  >
                    {activeSubject === sub.id ? '✓ Active Subject' : 'Select'}
                  </button>

                  <Link
                    href={`/dashboard/subjects?subject=${sub.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/60"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section: Today's High-Yield Study Action Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  Recommended Daily Actions for {currentSubject?.name || 'Selected Subject'}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {completedTaskIds.filter((id) => (currentSubject?.recommendedActions || []).some((a) => a.id === id)).length} of {(currentSubject?.recommendedActions || []).length} completed
              </span>
            </div>

            <div className="space-y-3">
              {(currentSubject?.recommendedActions || []).map((task) => {
                const isDone = completedTaskIds.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
                      isDone
                        ? 'bg-slate-50/50 dark:bg-slate-900/30 border-slate-200/60 dark:border-slate-800/40 opacity-70'
                        : 'bg-white dark:bg-[#0c1424] border-slate-200 dark:border-slate-800 hover:border-teal-500/40'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button
                        onClick={() => toggleTask(task.id)}
                        className="mt-0.5 text-slate-400 hover:text-teal-600 transition-colors"
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-100 dark:fill-emerald-950" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div>
                        <div
                          className={`text-xs sm:text-sm font-bold font-sans ${
                            isDone
                              ? 'line-through text-slate-400 dark:text-slate-500'
                              : 'text-slate-900 dark:text-white'
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 font-serif mt-0.5">
                          {task.subtext}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500">{task.time}</span>
                      <Link
                        href={task.link}
                        className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950/60 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SPPU Examiner Blueprint Card */}
          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/60 mb-4">
                <ShieldCheck className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  Examiner Insights
                </h2>
              </div>

              <div className="space-y-3.5">
                <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
                  <div className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    SPPU Evaluation Secret #1
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                    Evaluators grant full 2 marks for clear labeled diagrams even if descriptive theory has minor omissions.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200/60 dark:border-teal-800/40">
                  <div className="text-[11px] font-mono font-bold text-teal-800 dark:text-teal-300 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {user?.pattern || '2024 NEP'} Examination Rule
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                    Unit 1 & 2 In-Sem question patterns consistently test core analytical definitions and design problems. Preparing both guarantees 14+ marks.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">
              <Link
                href="/dashboard/settings"
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between"
              >
                <span>Academic Pattern: {user?.pattern || '2024 Pattern (NEP)'}</span>
                <span className="text-teal-600 dark:text-teal-400">Settings →</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf9f5] dark:bg-[#070d18] flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-xs font-mono text-slate-500">Loading Student Dashboard...</div>
          </div>
        </div>
      }
    >
      <DashboardOverview />
    </Suspense>
  );
}
