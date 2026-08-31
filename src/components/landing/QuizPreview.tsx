'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle2, XCircle, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

export const QuizPreview = () => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const sampleQuestion = {
    question: 'Under which normal form is a relation guaranteed to eliminate transitive functional dependencies (X → Y where Y is non-prime and X is not a candidate key)?',
    options: [
      'First Normal Form (1NF)',
      'Second Normal Form (2NF)',
      'Third Normal Form (3NF)',
      'Boyce-Codd Normal Form (BCNF)',
    ],
    correctAnswerIndex: 2, // 3NF
    explanation: 'Third Normal Form (3NF) strictly mandates that no non-prime attribute depends transitively on a candidate key. (If X → Y, either X is a superkey OR Y is a prime attribute).',
  };

  const handleSelect = (index: number) => {
    if (!submitted) {
      setSelectedOption(index);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedOption(null);
    setSubmitted(false);
  };

  const isCorrect = selectedOption === sampleQuestion.correctAnswerIndex;

  return (
    <section className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-4 h-4" />
            <span>Interactive Practice</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            High-Yield SPPU Topic Quizzes
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Test your knowledge before the exam. Instant answer validation with step-by-step explanations and weak-topic tracking.
          </p>
        </div>

        {/* Live Quiz Box */}
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <Badge variant="brand">DBMS Quiz #3 • Normalization</Badge>
              <span className="text-xs text-slate-500 font-mono">Question 1 of 5</span>
            </div>

            <CardContent className="pt-6 space-y-6">
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-relaxed">
                {sampleQuestion.question}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {sampleQuestion.options.map((option, idx) => {
                  let optionStateClass = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-500';

                  if (selectedOption === idx) {
                    optionStateClass = 'bg-brand-50 dark:bg-brand-950/40 border-brand-500 font-semibold text-brand-700 dark:text-brand-300';
                  }

                  if (submitted) {
                    if (idx === sampleQuestion.correctAnswerIndex) {
                      optionStateClass = 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-700 dark:text-emerald-300';
                    } else if (selectedOption === idx) {
                      optionStateClass = 'bg-red-50 dark:bg-red-950/40 border-red-500 font-bold text-red-700 dark:text-red-300';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={`p-4 rounded-control border transition-all cursor-pointer flex items-center justify-between ${optionStateClass}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-bold flex items-center justify-center">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="text-sm">{option}</span>
                      </div>

                      {submitted && idx === sampleQuestion.correctAnswerIndex && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      )}
                      {submitted && selectedOption === idx && idx !== sampleQuestion.correctAnswerIndex && (
                        <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Actions & Feedback */}
              {!submitted ? (
                <Button
                  onClick={handleSubmit}
                  disabled={selectedOption === null}
                  className="w-full mt-4"
                  variant="primary"
                >
                  Submit Answer
                </Button>
              ) : (
                <div className="space-y-4 pt-2">
                  <div
                    className={`p-4 rounded-control border ${
                      isCorrect
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 text-emerald-900 dark:text-emerald-200'
                        : 'bg-red-50 dark:bg-red-950/30 border-red-200 text-red-900 dark:text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm mb-1">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Correct! Excellent Understanding.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span>Incorrect. Let&apos;s Review the Concept.</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs leading-relaxed mt-1">{sampleQuestion.explanation}</p>
                  </div>

                  <Button onClick={handleReset} variant="outline" className="w-full gap-2 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Try Again</span>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </section>
  );
};
