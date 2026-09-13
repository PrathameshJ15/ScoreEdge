'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

interface Step {
  number: string;
  action: string;
  formula: string;
  description: string;
}

const STEPS: Step[] = [
  {
    number: '01',
    action: 'Choose',
    formula: 'Branch → Semester → Subject',
    description: 'Select your engineering discipline and curriculum pattern to access your exact syllabus mapping.',
  },
  {
    number: '02',
    action: 'Discover',
    formula: 'Syllabus + PYQs + Important Topics',
    description: 'Instant overview of recurring exam concepts, weightage distributions, and topic priorities.',
  },
  {
    number: '03',
    action: 'Prepare',
    formula: 'Notes + Answers + Practice',
    description: 'Study examiner-grade model answers, marks rubrics, and targeted question bank drills.',
  },
  {
    number: '04',
    action: 'Optimize',
    formula: 'Intelligence + Progress + Exam Mode',
    description: 'Track your preparation readiness and generate crash-time schedules tailored to your available hours.',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 sm:py-28 bg-[#faf9f5] dark:bg-[#070d18] text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
            <span>Methodology</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
            From syllabus to exam-ready.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
            A structured sequence built to take you from initial syllabus confusion to confident exam execution.
          </p>
        </div>

        {/* Clean 4-Step Process Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.1 }}
              className="relative p-6 rounded-card bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between"
            >
              <div>
                {/* Step Header with Number and Action */}
                <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                    Step {step.number}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                    {step.action}
                  </span>
                </div>

                {/* Formula Highlight */}
                <div className="p-2.5 rounded-control bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800 text-xs font-mono font-semibold text-slate-800 dark:text-slate-200 mb-3.5">
                  {step.formula}
                </div>

                {/* Step Description */}
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                  {step.description}
                </p>
              </div>

              {/* Progress indicator at bottom */}
              <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Phase {step.number}</span>
                {idx < STEPS.length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 hidden lg:block" />
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
