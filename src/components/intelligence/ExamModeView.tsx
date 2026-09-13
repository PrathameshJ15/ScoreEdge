'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckSquare,
  Square,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  BookOpen,
  FileText,
  HelpCircle,
  Zap,
  CheckCircle2,
  Lock,
  Calendar,
  Layers,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { useAuth } from '@/context/AuthContext';
import {
  ExamDurationType,
  ExamModePlan,
  ExamModeTask,
  ExamModePhase,
  generateExamModePlan,
  calculateExamCountdown,
  DURATION_CONFIGS,
} from '@/lib/intelligence/examModeEngine';

export interface ExamModeViewProps {
  subjectId: string;
  className?: string;
  initialDuration?: ExamDurationType;
}

const DURATIONS: Array<{
  id: ExamDurationType;
  label: string;
  shortLabel: string;
  badge?: string;
}> = [
  { id: '2h', label: '2 Hours', shortLabel: '2h', badge: 'Emergency Crash' },
  { id: '5h', label: '5 Hours', shortLabel: '5h', badge: 'Standard Sprint' },
  { id: '1d', label: '1 Day', shortLabel: '1d' },
  { id: '3d', label: '3 Days', shortLabel: '3d' },
  { id: '7d', label: '7 Days', shortLabel: '7d' },
];

export const ExamModeView: React.FC<ExamModeViewProps> = ({
  subjectId,
  className = '',
  initialDuration = '2h',
}) => {
  const { user } = useAuth();
  const [activeDuration, setActiveDuration] = useState<ExamDurationType>(initialDuration);
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({});

  // Countdown timer updated every minute
  const [countdownTick, setCountdownTick] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdownTick((prev) => prev + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Generate the 5-phase actionable exam plan
  const plan: ExamModePlan = useMemo(() => {
    return generateExamModePlan({
      subjectId,
      durationType: activeDuration,
      completedTaskIds,
      user,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, activeDuration, completedTaskIds, user, countdownTick]);

  const toggleTask = (taskId: string) => {
    if (completedTaskIds.includes(taskId)) {
      setCompletedTaskIds(completedTaskIds.filter((id) => id !== taskId));
    } else {
      setCompletedTaskIds([...completedTaskIds, taskId]);
    }
  };

  const togglePhaseCollapse = (phaseKey: string) => {
    setCollapsedPhases((prev) => ({
      ...prev,
      [phaseKey]: !prev[phaseKey],
    }));
  };

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Exam Mode Header & Live Countdown Card */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-depth-3 relative overflow-hidden">
        {/* Subtle background ambient pattern */}
        <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 fill-amber-400" />
              <span>SPPU Exam Mode</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Actionable Exam Roadmap • {plan.subjectName}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Ordered strictly by verified SPPU historical question frequency. Study high-probability concepts first, review formulas, practice solved PYQs, and test readiness.
            </p>
          </div>

          {/* Exam Countdown & Remaining Study Time Card */}
          <div className="grid grid-cols-2 gap-3 bg-slate-950/80 border border-slate-800 p-3.5 sm:p-4 rounded-xl shrink-0 min-w-[280px]">
            <div className="space-y-1">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                Exam Countdown
              </span>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm sm:text-base tabular-nums">
                <Clock className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{plan.countdown.formattedString.replace('Exam in ', '')}</span>
              </div>
              <span className="text-[10px] text-slate-500 block">Scheduled University Date</span>
            </div>

            <div className="space-y-1 border-l border-slate-800 pl-3">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400 block">
                Time Remaining
              </span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-sm sm:text-base tabular-nums">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{formatMinutes(plan.remainingMinutes)}</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {plan.completedTasksCount} of {plan.totalTasksCount} tasks done ({plan.completionPercentage}%)
              </span>
            </div>
          </div>
        </div>

        {/* Duration Selection Pill Bar (Mobile Scrollable) */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2 text-xs">
            <span className="text-slate-300 font-semibold">Select Available Study Time:</span>
            <span className="text-slate-400 text-[11px] hidden sm:inline">
              {DURATION_CONFIGS[activeDuration].description}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {DURATIONS.map((duration) => {
              const isSelected = activeDuration === duration.id;
              const isPremium = DURATION_CONFIGS[duration.id].requiresPremium;

              return (
                <button
                  key={duration.id}
                  onClick={() => setActiveDuration(duration.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                      : 'bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700/80 border border-slate-700/60'
                  }`}
                >
                  <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-slate-950' : 'text-slate-400'}`} />
                  <span>{duration.label}</span>
                  {isPremium && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isSelected ? 'bg-slate-950/20 text-slate-950' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      Crash
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Premium Gate Banner if Required for 2h / 5h Crash Plans */}
      {plan.requiresUpgrade && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-slate-900 dark:text-slate-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm sm:text-base text-amber-950 dark:text-amber-200">
                Unlock {plan.durationLabel} Emergency Crash Plan
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Emergency 2h and 5h triage schedules, full solved model answers, and high-yield question clusters are part of the ScoreEdge Single Subject Pass (₹49) or Semester Pass (₹199).
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link href={`/pricing?subject=${plan.subjectId}`}>
              <Button size="sm" variant="primary" className="text-xs font-semibold">
                Unlock Subject Pass (₹49)
              </Button>
            </Link>
            <Link href="https://wa.me/919876543210?text=I%20want%20to%20unlock%20ScoreEdge%20Crash%20Plan%20for%20DBMS" target="_blank">
              <Button size="sm" variant="secondary" className="text-xs font-semibold">
                Purchase via WhatsApp
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Progress & Completion Meter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 shadow-depth-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            {plan.completionPercentage}%
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              Study Schedule Completion
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {plan.completedTasksCount} of {plan.totalTasksCount} tasks completed • {formatMinutes(plan.remainingMinutes)} study time remaining
            </p>
          </div>
        </div>

        <div className="w-full sm:w-48 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${plan.completionPercentage}%` }}
          />
        </div>
      </div>

      {/* 5-Phase Actionable Study Sequence */}
      <div className="space-y-4">
        {plan.phases.map((phase, phaseIdx) => {
          const isCollapsed = collapsedPhases[phase.phase];
          const phaseCompletedCount = phase.tasks.filter((t) => t.isCompleted).length;
          const isPhaseDone = phase.tasks.length > 0 && phaseCompletedCount === phase.tasks.length;

          return (
            <div
              key={phase.phase}
              className={`rounded-2xl border transition-all ${
                isPhaseDone
                  ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800/80 opacity-90'
                  : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 shadow-depth-1'
              }`}
            >
              {/* Phase Header Accordion Toggle */}
              <button
                type="button"
                onClick={() => togglePhaseCollapse(phase.phase)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-left border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 rounded-t-2xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">
                    {phaseIdx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                        {phase.title}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {phase.badgeLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {phase.subtitle}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block tabular-nums">
                      {formatMinutes(phase.totalMinutes)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      {phaseCompletedCount}/{phase.tasks.length} tasks
                    </span>
                  </div>
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Tasks List */}
              {!isCollapsed && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800/60 p-2 sm:p-3">
                  {phase.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-3 sm:p-4 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        task.isCompleted
                          ? 'bg-slate-50/80 dark:bg-slate-800/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox & Task Information */}
                      <div className="flex items-start gap-3">
                        <button
                          type="button"
                          onClick={() => toggleTask(task.id)}
                          aria-label={`Mark task ${task.topicTitle} as completed`}
                          className="mt-0.5 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-400 shrink-0"
                        >
                          {task.isCompleted ? (
                            <CheckSquare className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Square className="w-5 h-5" />
                          )}
                        </button>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`text-sm font-semibold transition-all ${
                                task.isCompleted
                                  ? 'line-through text-slate-400 dark:text-slate-500'
                                  : 'text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              {task.topicTitle}
                            </span>
                            {task.typicalMarks && (
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                                {task.typicalMarks}
                              </span>
                            )}
                            {task.unitNumber && (
                              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                                Unit {task.unitNumber}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-slate-700 dark:text-slate-300">
                            {task.actionTitle}
                          </p>

                          <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                            <span className="text-amber-600 dark:text-amber-400 font-medium">
                              • Reason: {task.reasonForPriority}
                            </span>
                            {task.repetitionInfo && (
                              <span className="text-slate-400 dark:text-slate-500">
                                • {task.repetitionInfo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Time Allocation & Quick Action */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pl-8 sm:pl-0 shrink-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{task.estimatedMinutes}m</span>
                        </div>

                        {task.actionUrl && (
                          <Link href={task.actionUrl}>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-xs h-7 px-2.5 font-medium gap-1"
                            >
                              <span>Study</span>
                              <ArrowRight className="w-3 h-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Academic Safety Grounding Notice (Mandatory Rule) */}
      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-2">
        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Academic Safety Directive:</span>{' '}
          {plan.disclaimer}
        </div>
      </div>
    </div>
  );
};
