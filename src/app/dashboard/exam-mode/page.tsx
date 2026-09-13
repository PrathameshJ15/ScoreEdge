'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { MVP_SUBJECTS } from '@/data/sppuData';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Square,
  AlertCircle,
  Zap,
  Award,
  ChevronRight,
} from 'lucide-react';

interface TriageTask {
  id: string;
  phase: string;
  title: string;
  duration: string;
  topics: string[];
  priority: 'TIER 1' | 'TIER 2' | 'RECURRING' | 'ASSESSMENT';
  priorityClass: string;
}

const DURATION_SECONDS_MAP = {
  '2h': 2 * 3600,
  '5h': 5 * 3600,
  '1d': 12 * 3600,
};

export default function DashboardExamModePage() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject') || 'dbms';

  const [selectedSubjectId, setSelectedSubjectId] = useState(subjectParam);
  const [selectedDuration, setSelectedDuration] = useState<'2h' | '5h' | '1d'>('5h');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(['task-1']);
  
  const [secondsRemaining, setSecondsRemaining] = useState<number>(DURATION_SECONDS_MAP[selectedDuration]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    setSecondsRemaining(DURATION_SECONDS_MAP[selectedDuration]);
    setIsTimerRunning(false);
  }, [selectedDuration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => Math.max(prev - 1, 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, secondsRemaining]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const tasks: TriageTask[] = [
    {
      id: 'task-1',
      phase: '01',
      title: 'Must Study (Core Concepts)',
      duration: selectedDuration === '2h' ? '1 Hour' : '2 Hours',
      priority: 'TIER 1',
      priorityClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      topics: [
        'Normalization (1NF, 2NF, 3NF, BCNF) with standard decomposition schemas',
        'ACID Properties & Conflict Serializability testing using Precedence Graphs',
        'ER Diagram notation, mapping to Relational Schema, and primary key selection',
      ],
    },
    {
      id: 'task-2',
      phase: '02',
      title: 'High Priority (High Recurrence)',
      duration: selectedDuration === '2h' ? '40 Mins' : '1.5 Hours',
      priority: 'TIER 2',
      priorityClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      topics: [
        'Deadlock Prevention: Wait-Die vs Wound-Wait comparative analysis',
        'Two-Phase Locking (Strict vs Rigorous 2PL) execution guarantees',
        'Log-Based Recovery, Checkpoints, and Shadow Paging mechanics',
      ],
    },
    {
      id: 'task-3',
      phase: '03',
      title: 'Repeated PYQ Drills',
      duration: selectedDuration === '2h' ? '15 Mins' : '1 Hour',
      priority: 'RECURRING',
      priorityClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30',
      topics: [
        'Practice top 10 most-repeated exam questions from 2022 to 2024 with 5-mark rubrics',
      ],
    },
    {
      id: 'task-4',
      phase: '04',
      title: 'Self-Check Quiz',
      duration: selectedDuration === '2h' ? '5 Mins' : '30 Mins',
      priority: 'ASSESSMENT',
      priorityClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      topics: [
        '15-minute quick diagnostic check to verify formula recall and keyword accuracy',
      ],
    },
  ];

  const toggleTask = (id: string) => {
    if (completedTaskIds.includes(id)) {
      setCompletedTaskIds(completedTaskIds.filter((t) => t !== id));
    } else {
      setCompletedTaskIds([...completedTaskIds, id]);
    }
  };

  const progressPercent = Math.round((completedTaskIds.length / tasks.length) * 100);

  return (
    <DashboardShell
      activeSubject={selectedSubjectId}
      onSubjectChange={(id) => setSelectedSubjectId(id)}
    >
      <div className="space-y-6">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Crunch-Time Emergency Triage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Exam Mode Triage Planner
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Select your available study window. Get a mathematically prioritized sequence focused on high-yield marks.
            </p>
          </div>
        </div>

        {/* Subject & Window Switchers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Subject Pills */}
          <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              1. Target Subject
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
              {MVP_SUBJECTS.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`px-3 py-1.5 rounded-control text-xs font-mono font-semibold transition-all shrink-0 ${
                    selectedSubjectId === sub.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {sub.shortName}
                </button>
              ))}
            </div>
          </div>

          {/* Time Budget Selector */}
          <div className="p-4 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              2. Available Revision Window
            </span>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { id: '2h', label: '2 Hours', tag: 'Emergency Pass' },
                { id: '5h', label: '5 Hours', tag: 'High-Yield Score' },
                { id: '1d', label: '12 Hours', tag: 'Full Coverage' },
              ].map((win) => (
                <button
                  key={win.id}
                  onClick={() => setSelectedDuration(win.id as any)}
                  className={`p-2.5 rounded-control border text-left transition-all ${
                    selectedDuration === win.id
                      ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200 font-bold'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <div className="text-xs font-bold">{win.label}</div>
                  <div className="text-[10px] font-mono text-slate-400">{win.tag}</div>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Live Timer & Triage Workspace Card */}
        <div className="rounded-card border border-slate-800 bg-[#070d18] text-white p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Header Bar with Countdown Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div>
              <div className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                ACTIVE TRIAGE SESSION
              </div>
              <h2 className="text-2xl font-black font-mono tracking-tight mt-0.5">
                {selectedSubjectId.toUpperCase()} — {selectedDuration.toUpperCase()} INTENSIVE
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Sequence optimized according to historical SPPU question frequency.
              </p>
            </div>

            {/* Timer Module */}
            <div className="flex items-center gap-3 bg-slate-900 p-3.5 rounded-card border border-slate-800 shrink-0">
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                  Countdown
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-teal-400 tracking-wider">
                  {formatTimer(secondsRemaining)}
                </div>
              </div>

              {/* Timer Controls */}
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  className={`p-2 rounded-control border transition-colors ${
                    isTimerRunning
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-teal-600 text-white border-teal-500'
                  }`}
                  title={isTimerRunning ? 'Pause Timer' : 'Start Timer'}
                >
                  {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(false);
                    setSecondsRemaining(DURATION_SECONDS_MAP[selectedDuration]);
                  }}
                  className="p-2 rounded-control bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                  title="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Plan Execution Progress</span>
              <span className="text-teal-400 font-bold">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="bg-teal-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.max(progressPercent, 4)}%` }}
              />
            </div>
          </div>

          {/* The 4 Ordered Triage Tasks */}
          <div className="space-y-3.5">
            {tasks.map((task) => {
              const isDone = completedTaskIds.includes(task.id);

              return (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-4 sm:p-5 rounded-control border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isDone
                      ? 'bg-teal-950/20 border-teal-800/80'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start gap-3.5 flex-1">
                    <span className="font-mono text-xs font-bold text-slate-500 pt-0.5">
                      {task.phase}
                    </span>

                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-bold text-white">{task.title}</h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${task.priorityClass}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs font-mono text-slate-400">
                          ({task.duration})
                        </span>
                      </div>

                      <div className="space-y-1 text-xs text-slate-300 font-sans pt-1">
                        {task.topics.map((t, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-control text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
                        isDone
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-white' : 'text-slate-400'}`} />
                      <span>{isDone ? 'Finished' : 'Mark Done'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </DashboardShell>
  );
}
