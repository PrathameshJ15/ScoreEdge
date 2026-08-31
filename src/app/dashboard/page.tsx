'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { Button } from '@/components/ui/Button';
import { MVP_SUBJECTS } from '@/data/sppuData';
import {
  LayoutDashboard,
  Clock,
  CheckSquare,
  Square,
  AlertTriangle,
  BookOpen,
  ArrowRight,
  Zap,
  TrendingUp,
  Award,
} from 'lucide-react';

export default function StudentDashboard() {
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Unit 3: Database Normalization (3NF & BCNF)', done: true, priority: 'MUST_STUDY' as const },
    { id: 't2', title: 'Unit 4: ACID Properties & Transaction Schedules', done: false, priority: 'MUST_STUDY' as const },
    { id: 't3', title: 'Solve 2025 DBMS In-Sem PYQ Paper', done: false, priority: 'HIGH' as const },
    { id: 't4', title: 'Attempt 15-Question High-Yield DBMS Quiz', done: false, priority: 'MEDIUM' as const },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  };

  const completedCount = tasks.filter((t) => t.done).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">Good morning 👋</span>
              <Badge variant="brand">SE Computer Engineering</Badge>
              <Badge variant="outline">2024 Pattern</Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Personal Preparation Dashboard
            </h1>
            <p className="text-xs text-slate-500">
              Semester 3 • Target Exam: SPPU Winter 2026 Examination
            </p>
          </div>

          {/* Exam Countdown Box */}
          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-card flex items-center gap-4 min-w-[240px]">
            <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block uppercase">
                DBMS EXAM COUNTDOWN
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white">
                3 Days 14 Hours
              </span>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Today's Focus Checklist */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-brand-600" />
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Today&apos;s Focus Plan</h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {completedCount}/{tasks.length} Completed ({progressPercent}%)
                </span>
              </div>

              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    className={`p-4 rounded-card border transition-all cursor-pointer flex items-center justify-between ${
                      task.done
                        ? 'bg-slate-100/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button className="text-slate-400">
                        {task.done ? (
                          <CheckSquare className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </button>
                      <span className={`text-sm font-semibold ${task.done ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                        {task.title}
                      </span>
                    </div>

                    <PriorityBadge priority={task.priority} size="sm" />
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500">Based on SPPU high-yield question intelligence</span>
                <Link href="/subject/dbms">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <span>Open Exam Mode</span>
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Registered Subjects Overview */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-500" />
                <span>My Registered Semester Subjects</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MVP_SUBJECTS.slice(0, 4).map((sub) => (
                  <Card key={sub.id} hoverable className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono font-bold text-slate-500">CODE: {sub.code}</span>
                      <Badge variant="brand">Sem {sub.semester}</Badge>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{sub.shortName}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-1">{sub.name}</p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-xs text-slate-400">{sub.totalPYQs} PYQs</span>
                      <Link href={`/subject/${sub.id}`}>
                        <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1">
                          Study Hub <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Performance Analytics */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span>Preparation Analytics</span>
              </h2>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-control space-y-2 border border-slate-200/60 dark:border-slate-700">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">Overall SPPU Readiness</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">78%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full" style={{ width: '78%' }}></div>
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Passed 3 out of 4 high-yield topic quizzes
                </span>
              </div>

              {/* Weakest Area Alert Box */}
              <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-control space-y-1 text-xs text-red-900 dark:text-red-300">
                <div className="flex items-center gap-1.5 font-bold">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>Weakest Area Identified: Transactions (Unit 4)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-red-200">
                  Your quiz performance shows 40% accuracy on Deadlock Prevention questions. Revise 2-Phase Locking before exam day.
                </p>
              </div>
            </Card>

            {/* Streak & Plan */}
            <Card className="p-6 bg-gradient-to-br from-brand-600 to-indigo-700 text-white space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="brand" className="bg-white/20 text-white border-none">
                  SEMESTER PASS ACTIVE
                </Badge>
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-lg font-bold">Full Exam Mode Unlocked</h3>
              <p className="text-xs text-brand-100 leading-relaxed">
                You have unlimited access to solved 2/5/10-mark answers, rephrased question clusters, and emergency crash preparation for all SE Computer subjects.
              </p>
            </Card>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
