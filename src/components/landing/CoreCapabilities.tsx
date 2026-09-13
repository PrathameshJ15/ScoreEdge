'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  BookOpen, 
  CheckSquare, 
  Clock, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  Award,
  Layers,
  Bot
} from 'lucide-react';

export const CoreCapabilities: React.FC = () => {
  return (
    <section className="py-20 sm:py-24 bg-[#faf9f5] dark:bg-[#070d18] text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
            <span>Integrated Platform</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
            Everything you need.<br />
            <span className="text-teal-700 dark:text-teal-400">One clear path.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
            From finding important topics to preparing for the final exam, everything stays connected.
          </p>
        </div>

        {/* Asymmetric Capabilities Grid */}
        <div className="space-y-6">
          
          {/* Top Row: 7 / 5 Editorial Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. PYQ Intelligence (7 cols - Featured) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="lg:col-span-7 group rounded-card p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-control bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    01 • Analysis
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                  PYQ Intelligence
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Find repeated questions, frequency, marks trends and high-priority topics.
                </p>
              </div>

              {/* Realistic Embedded Preview Pill */}
              <div className="p-4 rounded-control bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="font-bold text-slate-900 dark:text-slate-100">Normalization (1NF, 2NF, 3NF, BCNF)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                    MUST STUDY
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-200/60 dark:border-slate-800">
                  <span>Frequency: 4 / 5 papers (80%)</span>
                  <span>Typical: 5–10 Marks</span>
                  <span className="text-teal-600 dark:text-teal-400 font-semibold">High Recurrence</span>
                </div>
              </div>

              <div className="pt-5 mt-2">
                <Link
                  href="/pyqs"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:gap-2 transition-all"
                >
                  <span>Explore PYQ intelligence</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* 2. Exam-Oriented Notes (5 cols) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-5 group rounded-card p-6 sm:p-8 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-control bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    02 • Content
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                  Exam-Oriented Notes
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  Learn topics through concise explanations, diagrams and marks-focused answers.
                </p>
              </div>

              {/* Realistic Embedded Preview */}
              <div className="p-4 rounded-control bg-slate-50 dark:bg-slate-950/70 border border-slate-200/70 dark:border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <span>Examiner Rubric</span>
                  <span className="text-teal-600 dark:text-teal-400 font-semibold">6-Mark Structure</span>
                </div>
                <div className="space-y-1.5 text-slate-700 dark:text-slate-300 font-sans text-xs">
                  <div className="flex items-center gap-2 text-[11.5px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Exact definition &amp; formal criteria (1 Mark)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11.5px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Clean comparison schema table (3 Marks)</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11.5px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                    <span>Standard SPPU numerical example (2 Marks)</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 mt-2">
                <Link
                  href="/notes"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:gap-2 transition-all"
                >
                  <span>Browse exam notes</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

          </div>

          {/* Bottom Row: 3 Equal Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* 3. Smart Practice */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="group rounded-card p-6 sm:p-7 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-control bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    03 • Drills
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                  Smart Practice
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Practice PYQs, quizzes and questions targeted at your weak areas.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href="/questions"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:gap-2 transition-all"
                >
                  <span>Practice Question Bank</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* 4. Exam Mode */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="group rounded-card p-6 sm:p-7 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-control bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    04 • Triage
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                  Exam Mode
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Tell us how much time you have. Get a prioritized plan built around it.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href="/exam-mode"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:gap-2 transition-all"
                >
                  <span>Launch Exam Mode</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* 5. AI Study Assistant */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="group rounded-card p-6 sm:p-7 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="w-10 h-10 rounded-control bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/50 flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                    05 • Grounded AI
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white tracking-tight mb-2">
                  AI Study Assistant
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
                  Get grounded help from your SPPU study material.
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href="/ai"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-400 group-hover:gap-2 transition-all"
                >
                  <span>Ask SPPU AI Assistant</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

          </div>

        </div>

      </div>
    </section>
  );
};
