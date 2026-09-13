'use client';

import React, { useState } from 'react';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Button } from '@/components/ui/Button';
import { MVP_SUBJECTS } from '@/data/sppuData';
import {
  CheckSquare,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface QuestionItem {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const SAMPLE_QUIZZES: Record<string, QuestionItem[]> = {
  dbms: [
    {
      id: 'q-1',
      question: 'A relation R is in BCNF if for every non-trivial functional dependency X → Y:',
      options: [
        'Y is a prime attribute',
        'X is a superkey for relation R',
        'X is a candidate key and Y is not',
        'Y is functionally determined by all candidate keys',
      ],
      correct: 1,
      explanation: 'By formal definition, BCNF requires that for any non-trivial FD X → Y, X must be a superkey.',
    },
    {
      id: 'q-2',
      question: 'Which conflict serializability testing method uses a directed graph?',
      options: [
        'Wait-For-Graph (WFG)',
        'Precedence (Serialization) Graph',
        'Resource Allocation Graph (RAG)',
        'Dependency Tree',
      ],
      correct: 1,
      explanation: 'A Precedence Graph is used to test for conflict serializability. If the graph contains no cycles, the schedule is conflict serializable.',
    },
    {
      id: 'q-3',
      question: 'In the Wait-Die deadlock prevention protocol, what happens if an older transaction requests a lock held by a younger transaction?',
      options: [
        'The older transaction dies',
        'The older transaction waits',
        'The younger transaction is aborted',
        'Both transactions rollback',
      ],
      correct: 1,
      explanation: 'In Wait-Die, if Ti (older) requests a resource held by Tj (younger), Ti is allowed to wait. Hence: older waits, younger dies.',
    },
  ],
};

export default function DashboardQuizzesPage() {
  const [selectedSubjectId, setSelectedSubjectId] = useState('dbms');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = SAMPLE_QUIZZES[selectedSubjectId] || SAMPLE_QUIZZES.dbms;
  const currentQ = questions[currentQuestionIndex];

  const handleSelectOption = (index: number) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(index);
    }
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    setIsAnswerSubmitted(true);
    if (selectedOption === currentQ.correct) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      setQuizFinished(true);
    }
  };

  const handleResetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizFinished(false);
  };

  return (
    <DashboardShell
      activeSubject={selectedSubjectId}
      onSubjectChange={(id) => {
        setSelectedSubjectId(id);
        handleResetQuiz();
      }}
    >
      <div className="space-y-6 max-w-3xl">
        
        {/* Header Bar */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/80 dark:border-teal-800/60 text-teal-800 dark:text-teal-300 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Diagnostic Drills</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 dark:text-white tracking-tight">
            Practice Quizzes &amp; Drills
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Rapid self-assessment tests calibrated to SPPU examination definitions and core theory.
          </p>
        </div>

        {/* Subject Switcher Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {MVP_SUBJECTS.map((sub) => (
            <button
              key={sub.id}
              onClick={() => {
                setSelectedSubjectId(sub.id);
                handleResetQuiz();
              }}
              className={`px-3.5 py-1.5 rounded-control text-xs font-mono font-semibold transition-all shrink-0 ${
                selectedSubjectId === sub.id
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              {sub.shortName}
            </button>
          ))}
        </div>

        {/* Quiz Container */}
        {!quizFinished ? (
          <div className="p-6 sm:p-8 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
            
            {/* Question Progress Header */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span>
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-bold">
                Current Score: {score}
              </span>
            </div>

            {/* Question Statement */}
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* Options List */}
            <div className="space-y-2.5">
              {currentQ.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrect = idx === currentQ.correct;

                let optionStyle = 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:border-slate-300';
                if (isSelected && !isAnswerSubmitted) {
                  optionStyle = 'bg-teal-50 dark:bg-teal-950/70 border-teal-600 dark:border-teal-500 text-teal-900 dark:text-teal-200 font-semibold';
                } else if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-semibold';
                  } else if (isSelected && !isCorrect) {
                    optionStyle = 'bg-rose-50 dark:bg-rose-950/70 border-rose-500 text-rose-900 dark:text-rose-200 font-semibold';
                  }
                }

                return (
                  <div
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`p-3.5 rounded-control border text-xs cursor-pointer flex items-center justify-between gap-3 transition-all ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center font-mono font-bold text-[10px] shrink-0">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{option}</span>
                    </div>

                    {isAnswerSubmitted && isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    {isAnswerSubmitted && isSelected && !isCorrect && (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Explanation box after submission */}
            {isAnswerSubmitted && (
              <div className="p-3.5 rounded-control bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <span className="font-mono text-[11px] font-bold text-teal-600 uppercase tracking-wider block">
                  Examiner Explanation:
                </span>
                <p className="text-slate-600 dark:text-slate-300">
                  {currentQ.explanation}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex justify-end gap-2">
              {!isAnswerSubmitted ? (
                <Button
                  size="sm"
                  onClick={handleConfirmAnswer}
                  disabled={selectedOption === null}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5"
                >
                  Confirm Answer
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={handleNextQuestion}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 gap-1.5"
                >
                  <span>{currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Complete Quiz'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>

          </div>
        ) : (
          /* Finished Screen */
          <div className="p-8 rounded-card bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-teal-50 dark:bg-teal-950 text-teal-600 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Quiz Completed!
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                You scored {score} out of {questions.length} ({Math.round((score / questions.length) * 100)}%)
              </p>
            </div>

            <div className="pt-2">
              <Button
                size="sm"
                onClick={handleResetQuiz}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-5 gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Drill</span>
              </Button>
            </div>
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
