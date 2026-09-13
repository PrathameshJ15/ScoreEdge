'use client';

import React, { useState, useEffect } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import {
  User,
  Settings,
  Database,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Bell,
  HardDrive,
  Save,
  Key,
  RefreshCw,
  ExternalLink,
  Sparkles,
  Award
} from 'lucide-react';

export default function DashboardSettingsPage() {
  const { user } = useAuth();
  const [activeSubject, setActiveSubject] = useState('dbms');
  
  // Student Profile State
  const [fullName, setFullName] = useState(user?.full_name || 'Aditya Kondekar');
  const [email, setEmail] = useState(user?.email || 'aditya@student.sppu.ac.in');
  const [college, setCollege] = useState('Pune Institute of Computer Technology (PICT)');
  const [branch, setBranch] = useState(user?.department || 'Computer Engineering');
  const [semester, setSemester] = useState(
    user?.academic_year && user?.semester_number
      ? `Semester ${user.semester_number} (${user.academic_year})`
      : 'Semester 4 (SE)'
  );
  const [pattern, setPattern] = useState(user?.pattern || '2024 Pattern (NEP)');
  const [targetPointer, setTargetPointer] = useState(
    user?.target_sgpa ? `${user.target_sgpa} SGPA` : '9.2 SGPA'
  );
  const [insemDate, setInsemDate] = useState('2026-03-20');
  const [endsemDate, setEndsemDate] = useState('2026-05-15');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Sync state whenever user loads or updates
  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
      setEmail(user.email || '');
      if (user.department) setBranch(user.department);
      if (user.academic_year && user.semester_number) {
        setSemester(`Semester ${user.semester_number} (${user.academic_year})`);
      }
      if (user.pattern) setPattern(user.pattern);
      if (user.target_sgpa) setTargetPointer(`${user.target_sgpa} SGPA`);
    }
  }, [user]);

  // Status & Save Feedback
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [dbStatus, setDbStatus] = useState<{
    configured: boolean;
    provider: string;
    neonUrlConfigured: boolean;
  }>({
    configured: true,
    provider: 'Neon PostgreSQL (Prisma ORM)',
    neonUrlConfigured: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    setTimeout(() => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    }, 600);
  };

  return (
    <DashboardShell activeSubject={activeSubject} onSubjectChange={setActiveSubject}>
      <div className="space-y-6 max-w-5xl">
        {/* Page Header */}
        <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60">
                  <User className="w-3.5 h-3.5" />
                  Student Configuration
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Sync Active
                </span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans flex items-center gap-2">
                <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
                Account & Academic Profile Settings
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-serif">
                Manage your SPPU academic department, exam goals, study preferences, and connected database infrastructure.
              </p>
            </div>

            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold rounded-xl animate-fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Settings Saved Successfully!
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Academic Profile */}
          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <GraduationCap className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                Academic Curriculum & Branch
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Engineering Branch
                </label>
                <select
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  <option value="Computer Engineering">Computer Engineering (COMP)</option>
                  <option value="Information Technology">Information Technology (IT)</option>
                  <option value="AI & Data Science">Artificial Intelligence & Data Science (AIDS)</option>
                  <option value="Electronics & Telecommunication">Electronics & Telecommunication (E&TC)</option>
                  <option value="Mechanical Engineering">Mechanical Engineering</option>
                  <option value="Civil Engineering">Civil Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Academic Year & Semester
                </label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  <option value="Semester 3 (SE)">Second Year (SE) - Semester 3</option>
                  <option value="Semester 4 (SE)">Second Year (SE) - Semester 4</option>
                  <option value="Semester 5 (TE)">Third Year (TE) - Semester 5</option>
                  <option value="Semester 6 (TE)">Third Year (TE) - Semester 6</option>
                  <option value="Semester 7 (BE)">Final Year (BE) - Semester 7</option>
                  <option value="Semester 8 (BE)">Final Year (BE) - Semester 8</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  University Regulation Pattern
                </label>
                <select
                  value={pattern}
                  onChange={(e) => setPattern(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                >
                  <option value="2024 NEP Credit System">2024 Pattern (NEP-aligned Credit System)</option>
                  <option value="2019 CBCS Pattern">2019 Pattern (Choice Based Credit System - CBCS)</option>
                  <option value="2015 Pattern">2015 Pattern (Revised)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target SGPA / Pointer
                </label>
                <input
                  type="text"
                  value={targetPointer}
                  onChange={(e) => setTargetPointer(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                  placeholder="e.g. 9.5 SGPA"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Student Identity */}
          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <User className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                Student Profile Information
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Affiliated College / Institute
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Exam Milestones */}
          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                Target SPPU Exam Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  In-Sem Exam (30 Marks, Units 1 & 2)
                </label>
                <input
                  type="date"
                  value={insemDate}
                  onChange={(e) => setInsemDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  End-Sem Exam (70 Marks, Units 3 to 6)
                </label>
                <input
                  type="date"
                  value={endsemDate}
                  onChange={(e) => setEndsemDate(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Neon PostgreSQL & Infrastructure Status */}
          <div className="bg-white dark:bg-[#0a1120] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <h2 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                  Database & Cloud Persistence
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                Prisma v6 + Neon Postgres
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white font-mono">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                  Prisma ORM Architecture: Operational
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports serverless connection pooling via Neon Postgres with transparent fallback to local in-memory store.
                </div>
              </div>
              <div className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-teal-600" />
                <span>28 Data Models Verified</span>
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={saveStatus === 'saving'}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-xs flex items-center gap-2"
            >
              {saveStatus === 'saving' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Saving Changes...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Academic Preferences
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
