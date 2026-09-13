'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ScoreEdgeLogo } from '@/components/brand/ScoreEdgeLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { Button } from '@/components/ui/Button';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  HelpCircle,
  Award,
  Clock,
  Sparkles,
  CheckSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User as UserIcon,
  Crown,
  Search,
  CheckCircle2,
  Zap,
  AlertTriangle,
} from 'lucide-react';

import { getStudentEnrolledSubjects, EnrolledSubjectData } from '@/lib/curriculum/studentCurriculum';
import { getLocalBacklogs, BacklogSubjectItem } from '@/lib/backlog/backlogStore';

interface DashboardShellProps {
  children: React.ReactNode;
  activeSubject?: string;
  onSubjectChange?: (subjectId: string) => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  activeSubject,
  onSubjectChange,
}) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const [backlogs, setBacklogs] = useState<BacklogSubjectItem[]>([]);

  useEffect(() => {
    // Load local backlogs or user backlogs
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

  const enrolledSubjects = React.useMemo(() => getStudentEnrolledSubjects(user), [user]);
  const defaultSubjectId = enrolledSubjects[0]?.id || 'dbms';
  const effectiveActiveSubject = activeSubject || defaultSubjectId;

  const avgReadiness = React.useMemo(() => {
    if (!enrolledSubjects.length) return 78;
    const sum = enrolledSubjects.reduce((acc, s) => acc + (s.readiness || 75), 0);
    return Math.round(sum / enrolledSubjects.length);
  }, [enrolledSubjects]);

  const navItems = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: undefined,
    },
    {
      href: '/dashboard/subjects',
      label: 'My Subjects',
      icon: BookOpen,
      badge: `${enrolledSubjects.length} Active`,
    },
    {
      href: '/dashboard/backlog',
      label: 'Backlog Tracker',
      icon: AlertTriangle,
      badge: backlogs.length > 0 ? `${backlogs.length} ATKT` : 'Clear Arrears',
    },
    {
      href: '/dashboard/notes',
      label: 'Exam Notes',
      icon: FileText,
      badge: 'High Yield',
    },
    {
      href: '/dashboard/questions',
      label: 'Question Bank (QB)',
      icon: HelpCircle,
      badge: '2.4k+',
    },
    {
      href: '/dashboard/pyqs',
      label: 'Past Papers (PYQs)',
      icon: Award,
      badge: '5 Years',
    },
    {
      href: '/dashboard/exam-mode',
      label: 'Exam Mode Triage',
      icon: Clock,
      badge: 'Crunch Time',
    },
    {
      href: '/dashboard/quizzes',
      label: 'Practice Quizzes',
      icon: CheckSquare,
      badge: undefined,
    },
    {
      href: '/dashboard/ai',
      label: 'AI Study Tutor',
      icon: Sparkles,
      badge: 'Groq LPU',
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      badge: undefined,
    },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f5] dark:bg-[#070d18] flex text-[#0f172a] dark:text-slate-100 font-sans">
      
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Persistent Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-[#0a1120] border-r border-slate-200/80 dark:border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          
          {/* Logo Bar */}
          <div className="h-16 px-5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between shrink-0">
            <ScoreEdgeLogo variant="horizontal" size="sm" href="/" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-control text-slate-400 hover:text-slate-600 lg:hidden"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Profile Pill - Dynamic per student */}
          <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/40 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-teal-600/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 font-bold text-xs flex items-center justify-center shrink-0">
                {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.full_name || 'SPPU Engineering Student'}
                </div>
                <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>{user?.academic_year || 'SE'} {user?.branch_code || 'COMP'}</span>
                  <span>•</span>
                  <span className="text-teal-600 dark:text-teal-400 font-semibold truncate">
                    Sem {user?.semester_number || 4}
                  </span>
                </div>
              </div>
            </div>

            {/* Preparation Score Mini-gauge */}
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                <span className="text-slate-500">Exam Readiness</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">{avgReadiness}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${avgReadiness}%` }}
                />
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto no-scrollbar text-xs">
            {navItems.map((item) => {
              const isActive =
                item.href === '/dashboard'
                  ? pathname === '/dashboard'
                  : pathname.startsWith(item.href);

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-control font-medium transition-all ${
                    isActive
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200/70 dark:border-teal-800/80 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                      isActive 
                        ? 'bg-teal-200/70 dark:bg-teal-900 text-teal-900 dark:text-teal-200 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Pro Upgrade / Help Strip */}
          <div className="p-3 border-t border-slate-200/80 dark:border-slate-800/80 shrink-0">
            <div className="p-3 rounded-card bg-gradient-to-br from-teal-950/40 to-slate-900 border border-teal-800/40 space-y-1.5 text-xs text-white">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1 text-[11px] text-teal-300">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ScoreEdge Pro
                </span>
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-teal-500/20 text-teal-300 font-semibold">
                  ACTIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-tight">
                All {enrolledSubjects.length} {user?.academic_year || 'SE'} {user?.branch_code || 'COMP'} subjects unlocked with verified answers.
              </p>
            </div>
          </div>

        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 px-4 sm:px-6 lg:px-8 bg-white/90 dark:bg-[#0a1120]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 flex items-center justify-between gap-4">
          
          {/* Left: Mobile Toggle & Quick Subject Switcher */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-control border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 lg:hidden hover:bg-slate-50 dark:hover:bg-slate-800"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Quick Active Subject Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">Active Subject:</span>
              <div className="relative inline-block">
                <select
                  value={effectiveActiveSubject}
                  onChange={(e) => onSubjectChange?.(e.target.value)}
                  className="appearance-none bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-xs font-bold pl-3 pr-8 py-1.5 rounded-control border border-slate-200/80 dark:border-slate-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-teal-500"
                >
                  <optgroup label={`Enrolled ${user?.academic_year || 'Current'} Subjects`}>
                    {enrolledSubjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.shortName} ({sub.code})
                      </option>
                    ))}
                  </optgroup>
                  {backlogs.length > 0 && (
                    <optgroup label="Backlog / ATKT Subjects">
                      {backlogs.map((b) => (
                        <option key={b.subjectId} value={b.subjectId}>
                          ⚠️ {b.shortName} ({b.code}) - Backlog
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <Link
              href="/search"
              className="p-2 rounded-control text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Global Search (Ctrl+K)"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </Link>

            <ThemeToggle />

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-control hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'S'}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-card shadow-xl py-1.5 z-50 text-xs">
                  <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {user?.full_name || 'Student Account'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate font-mono">
                      {user?.email || 'student@scoreedge.local'}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    <span>Account Settings</span>
                  </Link>
                  <Link
                    href="/pricing"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-500" />
                    <span>Subscription Details</span>
                  </Link>
                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>

      </div>

    </div>
  );
};
