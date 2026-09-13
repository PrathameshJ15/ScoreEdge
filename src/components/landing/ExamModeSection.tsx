'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  AlertCircle,
  Zap,
  ListOrdered,
  Timer
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ExamModeItem {
  id: string;
  step: string;
  title: string;
  count: string;
  duration: string;
  priorityBadge: string;
  priorityColor: string;
  topics: string[];
}

export const ExamModeSection: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const items: ExamModeItem[] = [
    {
      id: 'step-1',
      step: '01',
      title: 'Must Study',
      count: '6 topics',
      duration: '2 hours',
      priorityBadge: 'TIER 1',
      priorityColor: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
      topics: ['Normalization (1NF-BCNF)', 'ACID & Serializability', 'ER Modeling & Relational Schema', 'Indexing & B+ Trees', 'RA & SQL Joins', 'Recovery & Checkpoints'],
    },
    {
      id: 'step-2',
      step: '02',
      title: 'High Priority',
      count: '5 topics',
      duration: '1.5 hours',
      priorityBadge: 'TIER 2',
      priorityColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      topics: ['Deadlock Wait-Die & Wound-Wait', '2-Phase Locking Protocol', 'Functional Dependencies & Closure', 'Transaction States & WAL', 'NoSQL vs Relational Stores'],
    },
    {
      id: 'step-3',
      step: '03',
      title: 'Repeated PYQs',
      count: '15 questions',
      duration: '1 hour',
      priorityBadge: 'RECURRING',
      priorityColor: 'bg-teal-500/15 text-teal-700 dark:text-teal-400 border-teal-500/30',
      topics: ['15 Most-Repeated SPPU exam questions with marks-aligned answer points'],
    },
    {
      id: 'step-4',
      step: '04',
      title: 'Final Quiz',
      count: '20 questions',
      duration: '30 minutes',
      priorityBadge: 'ASSESSMENT',
      priorityColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
      topics: ['Timed self-check covering critical definition keywords and diagram rubrics'],
    },
  ];

  const toggleStep = (id: string) => {
    if (completedSteps.includes(id)) {
      setCompletedSteps(completedSteps.filter((s) => s !== id));
    } else {
      setCompletedSteps([...completedSteps, id]);
    }
  };

  const progressPercentage = Math.round((completedSteps.length / items.length) * 100);

  return (
    <section id="exam-mode" className="py-20 sm:py-28 bg-[#faf9f5] dark:bg-[#070d18] text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <Clock className="w-3.5 h-3.5" />
            <span>Time-Bounded Preparation</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
            Only 5 hours left?
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
            Tell us how much time you have. We&apos;ll tell you what to study first.
          </p>
        </div>

        {/* Realistic Exam Mode Interface Card */}
        <div className="max-w-4xl mx-auto rounded-card border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0a1120] shadow-xl overflow-hidden">
          
          {/* Top Header Strip with Subject & Countdown Timer */}
          <div className="p-6 sm:p-7 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 font-semibold">
                <span>Computer Engineering</span>
                <span>•</span>
                <span>Semester 3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white font-mono tracking-tight">
                DBMS — 5 HOURS
              </h3>
            </div>

            {/* Timer & Progress Treatment */}
            <div className="flex items-center gap-4 bg-white dark:bg-slate-950 p-3 rounded-control border border-slate-200/80 dark:border-slate-800 shrink-0">
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Remaining Time</div>
                <div className="text-2xl font-mono font-extrabold text-teal-600 dark:text-teal-400 tracking-wider">
                  5:00:00
                </div>
              </div>
              <div className="h-9 w-px bg-slate-200 dark:bg-slate-800" />
              <div className="space-y-0.5 pr-1">
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Readiness</div>
                <div className="text-sm font-mono font-bold text-slate-900 dark:text-slate-200">
                  {progressPercentage}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar Line */}
          <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-1.5">
            <div 
              className="bg-teal-600 dark:bg-teal-400 h-full transition-all duration-300"
              style={{ width: `${Math.max(progressPercentage, 5)}%` }}
            />
          </div>

          {/* The Four Ordered Exam Mode Steps */}
          <div className="p-6 sm:p-8 space-y-4">
            {items.map((item) => {
              const isChecked = completedSteps.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleStep(item.id)}
                  className={`p-4 sm:p-5 rounded-control border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isChecked
                      ? 'bg-teal-50/50 dark:bg-teal-950/20 border-teal-300 dark:border-teal-800/80'
                      : 'bg-white dark:bg-slate-900/50 border-slate-200/80 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Left Step Details */}
                  <div className="flex items-start gap-3.5">
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500 pt-0.5">
                      {item.step}
                    </span>
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${item.priorityColor}`}>
                          {item.priorityBadge}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.count}</span>
                        <span>•</span>
                        <span className="text-teal-700 dark:text-teal-400 font-semibold">{item.duration}</span>
                      </div>

                      <div className="text-xs text-slate-600 dark:text-slate-400 pt-1 font-sans">
                        {item.topics.join(' • ')}
                      </div>
                    </div>
                  </div>

                  {/* Right Status Check */}
                  <div className="shrink-0 flex items-center gap-2 text-xs font-mono">
                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-control border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                        isChecked
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isChecked ? 'text-white' : 'text-slate-400'}`} />
                      <span>{isChecked ? 'Completed' : 'Mark Done'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Action Strip */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 font-mono text-center sm:text-left">
              The platform saves preparation time by prioritizing what matters.
            </p>
            
            <Link href="/exam-mode" className="w-full sm:w-auto">
              <Button
                size="md"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs px-5 py-2.5 rounded-control shadow-sm gap-2"
              >
                <span>Try Exam Mode</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>

        </div>

      </div>
    </section>
  );
};
