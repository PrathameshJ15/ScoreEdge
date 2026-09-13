'use client';

import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Code,
  Award,
  ChevronRight,
} from 'lucide-react';

interface QuizQuestion {
  id: number;
  question: string;
  options: { key: string; text: string }[];
  correctAnswer?: string;
  explanation?: string;
}

interface InteractiveQuizCardProps {
  rawContent: string;
  className?: string;
}

export const InteractiveQuizCard: React.FC<InteractiveQuizCardProps> = ({
  rawContent,
  className = '',
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showRaw, setShowRaw] = useState<boolean>(false);

  // Parse raw text into structured MCQ questions
  const parsedQuestions = useMemo<QuizQuestion[]>(() => {
    const questions: QuizQuestion[] = [];
    if (!rawContent) return questions;

    // Split by question markers like "1.", "Question 1:", "Q1:", "1)", etc.
    const qBlocks = rawContent.split(/(?=(?:^|\n)(?:Q(?:uestion)?\s*\d+[:.]|\d+[\.)]\s+))/gi);

    for (let i = 0; i < qBlocks.length; i++) {
      const block = qBlocks[i].trim();
      if (!block) continue;

      // Extract question text
      const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);
      if (lines.length < 2) continue;

      let questionText = lines[0].replace(/^(?:Q(?:uestion)?\s*\d+[:.]|\d+[\.)]\s*)/i, '').trim();
      const options: { key: string; text: string }[] = [];
      let correctAnswer = '';
      let explanation = '';

      for (let j = 1; j < lines.length; j++) {
        const line = lines[j];
        // Match option like A) Option or a. Option or [A] Option
        const optMatch = line.match(/^([A-Da-d])[\.\)]\s*(.+)$/);
        if (optMatch) {
          options.push({
            key: optMatch[1].toUpperCase(),
            text: optMatch[2].trim(),
          });
          continue;
        }

        // Match answer key like "Answer: A" or "**Answer:** B" or "Correct: C"
        const ansMatch = line.match(/(?:Correct\s*)?Answer\s*[:*-]+\s*([A-Da-d])/i);
        if (ansMatch) {
          correctAnswer = ansMatch[1].toUpperCase();
          continue;
        }

        // Match explanation
        const expMatch = line.match(/(?:Explanation|Reason)\s*[:*-]+\s*(.+)/i);
        if (expMatch) {
          explanation = expMatch[1].trim();
        } else if (correctAnswer && !explanation) {
          explanation = line;
        }
      }

      // If at least 2 options detected, treat as MCQ
      if (options.length >= 2) {
        questions.push({
          id: questions.length + 1,
          question: questionText || lines[0],
          options,
          correctAnswer: correctAnswer || undefined,
          explanation: explanation || undefined,
        });
      }
    }

    return questions;
  }, [rawContent]);

  // If no MCQs could be parsed, render null so raw view handles it
  if (parsedQuestions.length === 0) {
    return null;
  }

  const answeredCount = Object.keys(selectedAnswers).length;
  const correctCount = parsedQuestions.filter(
    (q) => q.correctAnswer && selectedAnswers[q.id] === q.correctAnswer
  ).length;

  const handleSelect = (qId: number, key: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: key,
    }));
  };

  const handleReset = () => {
    setSelectedAnswers({});
  };

  return (
    <div className={`space-y-4 rounded-2xl border border-teal-500/30 bg-slate-900/60 p-4 sm:p-5 text-slate-200 ${className}`}>
      {/* Header with Score & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-950/60 border border-teal-500/40 flex items-center justify-center text-teal-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Practice Drill</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-900/40 text-teal-300 border border-teal-800">
                {parsedQuestions.length} Questions
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Select an answer to reveal instant examiner feedback and scoring logic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {answeredCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-teal-300 font-semibold text-xs">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {correctCount} / {answeredCount} Correct
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            title="Reset Quiz"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRaw(!showRaw)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Code className="w-3 h-3" />
            <span>{showRaw ? 'Quiz Cards' : 'Markdown'}</span>
          </button>
        </div>
      </div>

      {showRaw ? (
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs whitespace-pre-wrap font-mono text-slate-300 leading-relaxed max-h-96 overflow-y-auto">
          {rawContent}
        </div>
      ) : (
        <div className="space-y-4">
          {parsedQuestions.map((q) => {
            const selected = selectedAnswers[q.id];
            const isAnswered = Boolean(selected);
            const isCorrect = isAnswered && q.correctAnswer && selected === q.correctAnswer;

            return (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3"
              >
                {/* Question title */}
                <div className="flex items-start gap-2.5">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-slate-800 text-teal-300 border border-slate-700 flex items-center justify-center font-bold text-xs">
                    {q.id}
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                    {q.question}
                  </p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 pl-8">
                  {q.options.map((opt) => {
                    const isOptionSelected = selected === opt.key;
                    const isOptionCorrect = q.correctAnswer === opt.key;

                    let btnStyle =
                      'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60';

                    if (isAnswered) {
                      if (isOptionCorrect) {
                        btnStyle = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40';
                      } else if (isOptionSelected && !isOptionCorrect) {
                        btnStyle = 'bg-rose-950/40 border-rose-500 text-rose-200 ring-1 ring-rose-500/40';
                      } else {
                        btnStyle = 'bg-slate-900/40 border-slate-800 text-slate-500 opacity-60';
                      }
                    }

                    return (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => handleSelect(q.id, opt.key)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                      >
                        <span
                          className={`shrink-0 w-5 h-5 rounded-md font-bold text-[11px] flex items-center justify-center ${
                            isOptionCorrect && isAnswered
                              ? 'bg-emerald-500 text-white'
                              : isOptionSelected && isAnswered && !isOptionCorrect
                              ? 'bg-rose-500 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {opt.key}
                        </span>
                        <span className="leading-snug">{opt.text}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Drawer when answered */}
                {isAnswered && (
                  <div className="mt-2 pl-8 space-y-1.5 animate-in fade-in-50 duration-200">
                    <div
                      className={`flex items-center gap-1.5 text-xs font-semibold ${
                        isCorrect ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Correct! Excellent SPPU concept mastery.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          <span>
                            Incorrect. Correct answer is option {q.correctAnswer}.
                          </span>
                        </>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 leading-relaxed">
                        <span className="font-semibold text-teal-300">Examiner Note: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
