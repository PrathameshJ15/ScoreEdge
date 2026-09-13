'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Search, BookOpen, Target, ArrowRight } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 sm:py-28 bg-[#f5f3ec] dark:bg-[#0a1120] text-slate-900 dark:text-white border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="max-w-3xl mb-14 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400" />
            <span>Philosophy &amp; Purpose</span>
          </div>
          
          {/* Headline */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-950 dark:text-white tracking-tight leading-[1.12]">
            Built for the way SPPU students actually prepare.
          </h2>
          
          {/* Main Body Copy */}
          <div className="mt-6 space-y-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            <p>
              SPPU preparation shouldn&apos;t mean opening dozens of PDFs, hunting through old papers and guessing what deserves your time.
            </p>
            <p>
              SPPU Exam Intelligence brings syllabus, PYQs, notes, practice and preparation tools into one focused experience.
            </p>
          </div>
        </div>

        {/* Emphasized Three Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3 }}
            className="p-6 sm:p-7 rounded-card bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-9 h-9 rounded-control bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              Less searching.
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Eliminate hours wasted searching Telegram channels, WhatsApp groups and fragmented drive folders for questionable question papers.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="p-6 sm:p-7 rounded-card bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-9 h-9 rounded-control bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              More studying.
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct access to concise, marks-targeted notes and evaluator-aligned answers formatted strictly to university marking rubrics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="p-6 sm:p-7 rounded-card bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
          >
            <div className="w-9 h-9 rounded-control bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/60 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white">
              Better preparation.
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Focus effort deterministically on concepts proven to recur repeatedly across previous examination seasons.
            </p>
          </motion.div>

        </div>

      </div>
    </section>
  );
};
