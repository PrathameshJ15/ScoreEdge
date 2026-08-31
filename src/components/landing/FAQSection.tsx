'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { HelpCircle, ChevronDown, ShieldCheck } from 'lucide-react';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Which SPPU engineering patterns and branches are supported?',
      answer: 'ScoreEdge is launched for SE Computer Engineering (2024 & 2019 Patterns). Subjects include DBMS, DSA, OOP, OS, and TOC. IT and AI-DS branches are currently being indexed for the next release.',
    },
    {
      question: 'How does ScoreEdge calculate "Must Study" topic priorities?',
      answer: 'We analyze the last 5 years of SPPU examination papers (In-Sem & End-Sem), cluster differently worded questions that ask the same underlying concept, and calculate frequency, recency, and marks weightage. We do not claim to offer guaranteed predictions—our priority scores reflect historical examination trends.',
    },
    {
      question: 'Are syllabus PDFs and basic question papers free?',
      answer: 'Yes! Basic syllabus structures, official past question papers, basic notes, and top important questions are 100% free forever for all students.',
    },
    {
      question: 'What is Exam Mode and how does it work?',
      answer: 'Exam Mode is designed for last-minute preparation. If you have only 2 hours or 5 hours before your paper, Exam Mode generates a strictly prioritized checklist of top-yield topics that maximize your marks per hour studied.',
    },
    {
      question: 'How do solved answers help in SPPU exams?',
      answer: 'SPPU paper evaluators look for specific key terms, definitions, and clean diagrams. Our solved answers are written strictly in 2-mark, 5-mark, and 10-mark formats so you write exactly what gets full marks.',
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-card border border-slate-200 dark:border-slate-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white text-base hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/60 leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
