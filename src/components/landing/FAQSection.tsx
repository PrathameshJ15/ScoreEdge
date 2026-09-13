'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Which SPPU engineering patterns and schemes are currently supported?',
      answer:
        'ScoreEdge covers SE Computer Engineering for both the 2024 NEP Pattern and the 2019 Pattern. Subjects include DBMS (210241), DSA (210242), OOP (210243), OS (210244), and TOC (210245). In-Sem (Units 1-2) and End-Sem (Units 3-6) examination structures are fully segregated.',
    },
    {
      question: 'Does ScoreEdge provide "guaranteed" question paper leaks or predictions?',
      answer:
        'No. ScoreEdge is a deterministic academic intelligence engine, not a leak portal. We algorithmically parse 5+ years of verified past Pune University question papers, cluster recurring core concepts, and rank topics by statistical historical recurrence and evaluator weighting. This allows students to focus their study time with mathematical efficiency.',
    },
    {
      question: 'Are syllabus breakdowns and original question papers free to access?',
      answer:
        'Yes. All official SPPU curriculum structures, unit descriptions, and verified past question paper PDFs are 100% free forever for all engineering students without requiring a credit card or payment.',
    },
    {
      question: 'How does Emergency Exam Mode prioritize study topics?',
      answer:
        'When you select your available study window (2 hours, 5 hours, or 1 day), our triage algorithm ranks topics by historical marks return per study minute. High-frequency concepts that carry 8-10 marks and appear in 80%+ of past papers are scheduled first, ensuring you secure passing marks before attempting optional units.',
    },
    {
      question: 'How do the solved model answers align with SPPU evaluation rubrics?',
      answer:
        'Pune University paper checkers evaluate answers against structured marking schemes looking for specific core definitions, contrast tables, schematic diagrams, and time-saving bullet points. Every ScoreEdge answer is pre-formatted into standard 2-mark, 5-mark, and 10-mark templates so you write exactly what fetches full marks.',
    },
    {
      question: 'How does access activation work after payment?',
      answer:
        'Payments are securely processed via Razorpay supporting all Indian UPI apps (Google Pay, PhonePe, Paytm), Net Banking, and cards. Access is credited digitally and instantly to your ScoreEdge account upon successful transaction.',
    },
  ];

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200/80 dark:border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono font-semibold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
            <span>Frequently Asked Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Clear Answers for Engineering Students
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 font-normal">
            Everything you need to know about our methodology, curriculum coverage, and evaluation rubrics.
          </p>
        </div>

        {/* Accordion Container */}
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs transition-all"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-semibold text-slate-900 dark:text-white text-base hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                >
                  <span className="text-sm sm:text-base font-bold">{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-600 dark:text-brand-400' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800/80 leading-relaxed font-normal">
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

