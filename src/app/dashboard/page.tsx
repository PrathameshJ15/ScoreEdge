'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { MVP_SUBJECTS } from '@/data/sppuData';
import {
  calculateStudentPersonalization,
  StudentProgressSummary,
} from '@/lib/progress/personalizationEngine';
import { Button } from '@/components/ui/Button';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { ScoreEdgeLogo } from '@/components/brand/ScoreEdgeLogo';
import {
  Compass,
  Search,
  Bell,
  BookOpen,
  FileText,
  HelpCircle,
  Clock,
  Sparkles,
  Mic,
  Calendar,
  CheckSquare,
  Square,
  ArrowRight,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Flame,
  Target,
  ShieldAlert,
  Layers,
  Award,
  Play,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Menu,
  X,
  Bookmark,
  BarChart3,
  Crown,
  ChevronDown
} from 'lucide-react';

function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get('error');
  const { user, logout } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-dbms');
  const [searchQuery, setSearchQuery] = useState('');
  const [summary, setSummary] = useState<StudentProgressSummary | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(['task-1']);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load progress data
  useEffect(() => {
    let isMounted = true;
    async function loadProgress() {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('scoreedge_auth_token');
        const headers: Record<string, string> = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/progress?subject_id=${selectedSubjectId}`, {
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
              calculateStudentPersonalization(
                user?.id || 'usr-student-1',
                selectedSubjectId
              )
            );
          }
        }
      } catch {
        if (isMounted) {
          setSummary(
            calculateStudentPersonalization(
              user?.id || 'usr-student-1',
              selectedSubjectId
            )
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
  }, [selectedSubjectId, user]);

  const activeSummary = useMemo(() => {
    if (summary) return summary;
    return calculateStudentPersonalization(
      user?.id || 'usr-student-1',
      selectedSubjectId
    );
  }, [summary, user, selectedSubjectId]);

  const toggleTask = async (taskId: string) => {
    const nextCompleted = completedTaskIds.includes(taskId)
      ? completedTaskIds.filter((id) => id !== taskId)
      : [...completedTaskIds, taskId];

    setCompletedTaskIds(nextCompleted);

    try {
      const token = localStorage.getItem('scoreedge_auth_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      await fetch('/api/progress', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          subject_id: selectedSubjectId,
          item_type: 'TOPIC',
          item_id: taskId,
          is_completed: nextCompleted.includes(taskId),
        }),
      });
    } catch {
      // Optimistic UI
    }
  };

  const primaryAction = activeSummary.primary_next_action;
  const secondaryActions = activeSummary.secondary_recommendations;

  // Upcoming study tasks
  const upcomingTasks = [
    {
      id: 'task-1',
      title: 'Unit 3: 3NF vs BCNF Decomposition & Functional Dependencies',
      subject: 'DBMS',
      duration: '25 mins',
      priority: 'MUST_STUDY' as const,
    },
    {
      id: 'task-2',
      title: 'Unit 4: ACID Properties & Conflict Serializability Verification',
      subject: 'DBMS',
      duration: '30 mins',
      priority: 'MUST_STUDY' as const,
    },
    {
      id: 'task-3',
      title: 'Unit 4: Two-Phase Locking (Strict vs Rigorous 2PL) Rubric',
      subject: 'DBMS',
      duration: '20 mins',
      priority: 'HIGH' as const,
    },
    {
      id: 'task-4',
      title: 'Unit 2: Binary Search Trees & AVL Rotations Practice',
      subject: 'DSA',
      duration: '35 mins',
      priority: 'HIGH' as const,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-slate-950 flex flex-col md:flex-row text-[#0f172a] dark:text-slate-100">
      
      {/* ========================================================================= */}
      {/* SIDEBAR (Responsive drawer for mobile, persistent on desktop) */}
      {/* ========================================================================= */}
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close */}
          <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
            <ScoreEdgeLogo variant="horizontal" size="sm" href="/" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600 md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar text-xs font-semibold">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 font-bold border border-teal-200/80 dark:border-teal-800 shadow-xs"
            >
              <Layers className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              href="/subjects"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-slate-500" />
              <span>Subjects</span>
            </Link>

            <Link
              href="/notes"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileText className="w-4 h-4 text-slate-500" />
              <span>Notes</span>
            </Link>

            <Link
              href="/questions"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>Question Bank (QB)</span>
            </Link>

            <Link
              href="/pyqs"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Award className="w-4 h-4 text-slate-500" />
              <span>Question Papers (QP)</span>
            </Link>

            <Link
              href="/exam-mode"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Exam Mode</span>
            </Link>

            <div className="pt-2 pb-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                AI Assistants
              </span>
            </div>

            <Link
              href="/ai"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span>Ask ScoreEdge AI</span>
            </Link>

            <Link
              href="/ai?mode=TEACH_ME"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Mic className="w-4 h-4 text-amber-500" />
              <span>Voice Tutor</span>
            </Link>

            <div className="pt-2 pb-1">
              <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                Account &amp; Tools
              </span>
            </div>

            <Link
              href="/bookmarks"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Bookmark className="w-4 h-4 text-slate-500" />
              <span>Bookmarks</span>
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              <span>Settings</span>
            </Link>
          </nav>

          {/* Bottom Sidebar: Go Premium Card */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800">
            <div className="p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-900 dark:text-teal-200">
                  <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  ScoreEdge Pro
                </span>
                <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                  Save 60%
                </span>
              </div>
              <p className="text-[11px] text-teal-800/90 dark:text-teal-300 leading-snug">
                Unlock 2,400+ evaluator model answers &amp; unlimited voice sessions.
              </p>
              <Link href="/pricing" className="block pt-1">
                <Button size="sm" className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs h-7">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>

        </div>
      </aside>

      {/* ========================================================================= */}
      {/* MAIN CONTENT AREA & TOPBAR */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOPBAR */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 max-w-xl">
            {/* Mobile Sidebar Toggle Button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 md:hidden hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search Bar */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subjects, topics, PYQs, notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/questions?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-[#0f172a] dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Right Header Items: Academic Info, Notifications, Profile */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Student Academic Info Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-teal-600" />
              <span>SE Computer · 2024 Pattern</span>
            </div>

            {/* Notifications Bell */}
            <button className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-teal-600" />
            </button>

            {/* User Profile Avatar & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-700 text-white flex items-center justify-center font-bold text-xs">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
                </div>
                <span className="hidden sm:inline max-w-[120px] truncate text-[#0f172a] dark:text-white">
                  {user?.full_name || 'Student'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-[#0f172a] dark:text-white truncate">
                      {user?.full_name || 'Student'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user?.email || 'student@scoreedge.in'}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Account Settings</span>
                  </Link>
                  <div className="border-t border-slate-100 dark:border-slate-800 my-1" />
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* DASHBOARD BODY */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          {/* Admin Warning Banner (if applicable) */}
          {errorParam === 'unauthorized_admin_access' && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Administrative CMS Access Restricted:</span> Your account is assigned the STUDENT role.
              </div>
            </div>
          )}

          {/* Welcome Area */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">
                Welcome back, {user?.full_name || 'Student'}!
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                Here is your exam readiness snapshot for Semester 3. Keep momentum strong.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                SE Computer Engineering
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                2024 Pattern
              </span>
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                Semester 3
              </span>
            </div>
          </div>

          {/* Horizontal Stat Cards (5 Cards) */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Stat 1: Overall Progress */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Overall Progress</span>
                <Target className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#0f172a] dark:text-white">
                {activeSummary.syllabus_coverage.percentage}%
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full"
                  style={{ width: `${activeSummary.syllabus_coverage.percentage}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Exam Readiness</span>
            </div>

            {/* Stat 2: Days Left */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Next Exam</span>
                <Clock className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#0f172a] dark:text-white">
                12 Days
              </div>
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-400 block truncate">
                DBMS In-Sem
              </span>
              <span className="text-[10px] text-slate-400 block">Nov 2026 Session</span>
            </div>

            {/* Stat 3: Subjects in Progress */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Active Subjects</span>
                <BookOpen className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#0f172a] dark:text-white">
                5 Subjects
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                SE Computer
              </span>
              <span className="text-[10px] text-slate-400 block">All Units Synced</span>
            </div>

            {/* Stat 4: Questions Practiced */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Practiced</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-[#0f172a] dark:text-white">
                {activeSummary.practice_summary.pyqs_solved}
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block">
                PYQs Graded
              </span>
              <span className="text-[10px] text-slate-400 block">Avg Accuracy: {activeSummary.practice_summary.average_quiz_score}%</span>
            </div>

            {/* Stat 5: Study Streak */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-1.5 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Study Streak</span>
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              </div>
              <div className="text-2xl font-extrabold font-mono text-orange-600 dark:text-orange-400">
                5 Days
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Active Consistency
              </span>
              <span className="text-[10px] text-slate-400 block">+2 Days to Goal</span>
            </div>
          </div>

          {/* Subject Context Selector Filter */}
          <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
              <BookOpen className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>Select Active Subject:</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {MVP_SUBJECTS.map((sub) => {
                const isSelected = sub.id === selectedSubjectId || sub.code.toLowerCase() === selectedSubjectId;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setSelectedSubjectId(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {sub.shortName} ({sub.code})
                  </button>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MAIN DASHBOARD TWO-COLUMN GRID */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT / PRIMARY COLUMN (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Card 1: Continue Learning */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-teal-600 animate-pulse" />
                    <h3 className="font-bold text-base text-[#0f172a] dark:text-white">
                      Continue Learning
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-500">
                    DBMS Unit 3 · 45 mins left
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#faf9f5] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-teal-800 dark:text-teal-300 font-bold block">
                        Active Topic Cluster
                      </span>
                      <h4 className="text-sm font-bold text-[#0f172a] dark:text-white mt-0.5">
                        3NF vs BCNF Decomposition &amp; Functional Dependencies
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        High recurrence topic. Appeared in 4 of the last 5 SPPU In-Sem and End-Sem examination sessions.
                      </p>
                    </div>
                    <PriorityBadge priority="MUST_STUDY" size="sm" />
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs text-slate-500 font-mono">
                      <span>Lesson Progress</span>
                      <span>65% Completed</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-teal-600 h-full rounded-full w-[65%]" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <Link href="/notes">
                      <Button size="sm" variant="outline" className="text-xs h-8">
                        View Note Summary
                      </Button>
                    </Link>
                    <Link href="/questions">
                      <Button size="sm" className="bg-teal-700 hover:bg-teal-800 text-white text-xs h-8 gap-1.5">
                        <Play className="w-3 h-3 fill-current" />
                        <span>Resume Lesson</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Card 2: Subject Progress Breakdown */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <h3 className="font-bold text-base text-[#0f172a] dark:text-white">
                      Subject Coverage Breakdown
                    </h3>
                  </div>
                  <Link href="/syllabus" className="text-xs font-semibold text-teal-700 dark:text-teal-400 hover:underline">
                    View Syllabus Checklist &rarr;
                  </Link>
                </div>

                <div className="space-y-3.5">
                  {MVP_SUBJECTS.map((sub, idx) => {
                    const mockPercentages = [68, 55, 42, 30, 20];
                    const pct = mockPercentages[idx % mockPercentages.length];
                    return (
                      <div key={sub.id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0f172a] dark:text-white">
                              {sub.shortName}
                            </span>
                            <span className="text-slate-500 text-[11px]">({sub.name})</span>
                          </div>
                          <span className="font-mono font-bold text-teal-700 dark:text-teal-400">
                            {pct}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-teal-600 h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Card 3: Upcoming Tasks Checklist */}
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                    <h3 className="font-bold text-base text-[#0f172a] dark:text-white">
                      Priority Revision Sequence
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    {completedTaskIds.length} of {upcomingTasks.length} Done
                  </span>
                </div>

                <div className="space-y-2.5">
                  {upcomingTasks.map((task) => {
                    const isDone = completedTaskIds.includes(task.id);
                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isDone
                            ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700'
                            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-700 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button className="text-slate-400 hover:text-teal-600">
                            {isDone ? (
                              <CheckSquare className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          <div>
                            <span
                              className={`text-xs font-semibold block ${
                                isDone ? 'line-through text-slate-400' : 'text-[#0f172a] dark:text-white'
                              }`}
                            >
                              {task.title}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              {task.subject} • {task.duration}
                            </span>
                          </div>
                        </div>
                        <PriorityBadge priority={task.priority} size="sm" />
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT / SECONDARY COLUMN (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* AI Voice Tutor Card */}
              <div className="p-5 rounded-2xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                      AI
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-teal-950 dark:text-teal-200">
                        AI Voice Tutor
                      </h4>
                      <span className="text-[10px] text-teal-800/80 dark:text-teal-300">
                        Conversational Audio Lesson
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-200 dark:bg-teal-900 text-teal-900 dark:text-teal-200">
                    Live
                  </span>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-teal-200/80 dark:border-teal-800/80 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#0f172a] dark:text-white">
                    <Mic className="w-3.5 h-3.5 text-teal-600" />
                    <span>&quot;Explain BCNF decomposition in 5 minutes&quot;</span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    Listen to examiner-preferred keywords and avoid deduction on candidate key explanations.
                  </p>
                </div>

                <Link href="/ai?mode=TEACH_ME" className="block pt-1">
                  <Button size="sm" className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs h-8 gap-2">
                    <Play className="w-3 h-3 fill-current" />
                    <span>Start Voice Session</span>
                  </Button>
                </Link>
              </div>

              {/* Ask ScoreEdge AI Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h4 className="text-xs font-bold text-[#0f172a] dark:text-white">
                    Ask ScoreEdge AI
                  </h4>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed">
                  Have a doubt on an SPPU question or need a 5-mark model answer outline?
                </p>

                <div className="space-y-1.5">
                  <Link
                    href={`/ai?prompt=${encodeURIComponent('Explain 3NF vs BCNF difference for SPPU exam')}`}
                    className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-800 transition-colors"
                  >
                    &rarr; Difference between 3NF and BCNF
                  </Link>
                  <Link
                    href={`/ai?prompt=${encodeURIComponent('What are ACID properties with diagram for SPPU?')}`}
                    className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-800 transition-colors"
                  >
                    &rarr; ACID Properties with transaction diagram
                  </Link>
                  <Link
                    href={`/ai?prompt=${encodeURIComponent('Difference between process and thread Operating Systems')}`}
                    className="block p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-800 transition-colors"
                  >
                    &rarr; Process vs Thread in Operating Systems
                  </Link>
                </div>

                <Link href="/ai" className="block pt-1">
                  <Button variant="outline" size="sm" className="w-full text-xs h-8">
                    Open Full AI Assistant
                  </Button>
                </Link>
              </div>

              {/* Study Calendar Card */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <h4 className="text-xs font-bold text-[#0f172a] dark:text-white">
                      Exam Calendar
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">November 2026</span>
                </div>

                {/* Mini Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono text-slate-400 py-1">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono">
                  {Array.from({ length: 30 }).map((_, i) => {
                    const day = i + 1;
                    const isExamDay = day === 18 || day === 22 || day === 25;
                    const isToday = day === 6;
                    return (
                      <div
                        key={day}
                        className={`h-7 rounded-md flex items-center justify-center text-[11px] ${
                          isExamDay
                            ? 'bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 font-bold border border-amber-300'
                            : isToday
                            ? 'bg-teal-700 text-white font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    In-Sem Paper Dates
                  </span>
                  <span className="font-semibold text-teal-700 dark:text-teal-400">
                    3 Papers Scheduled
                  </span>
                </div>
              </div>

              {/* Recommended For You Panel */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#0f172a] dark:text-white">
                    Recommended For You
                  </h4>
                  <span className="text-[10px] font-mono text-teal-700 dark:text-teal-400 font-semibold">
                    Algorithm Pick
                  </span>
                </div>

                <div className="p-3 bg-[#faf9f5] dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-teal-800 dark:text-teal-300">
                    {primaryAction.badge_text || 'Highest Return on Time'}
                  </span>
                  <h5 className="text-xs font-bold text-[#0f172a] dark:text-white">
                    {primaryAction.title}
                  </h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">
                    {primaryAction.rationale}
                  </p>
                  <Link href={primaryAction.action_url} className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-400 hover:underline pt-1">
                    <span>{primaryAction.action_label}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}

export default function StudentDashboard() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#faf9f5] text-slate-500 text-sm">
          Loading your ScoreEdge Dashboard...
        </div>
      }
    >
      <DashboardInner />
    </Suspense>
  );
}
