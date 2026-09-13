'use client';

import React from 'react';
import {
  FileText,
  BookmarkCheck,
  Award,
  ListOrdered,
  HelpCircle,
  Zap,
  Lightbulb,
  FileCheck,
} from 'lucide-react';
import { QuickActionType } from '@/lib/ai/prompts';

interface QuickActionsBarProps {
  onSelectAction: (action: QuickActionType, label: string) => void;
  isLoading?: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onSelectAction,
  isLoading = false,
}) => {
  const QUICK_ACTIONS: Array<{
    id: QuickActionType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    marks?: 2 | 5 | 10;
  }> = [
    {
      id: 'SUMMARIZE',
      label: 'Summarize',
      icon: FileText,
      description: 'Key points & formulas',
    },
    {
      id: '2_MARK',
      label: '2M Answer',
      icon: BookmarkCheck,
      description: 'Crisp definition & 2 points',
      marks: 2,
    },
    {
      id: '5_MARK',
      label: '5M Answer',
      icon: Award,
      description: 'Structured points & diagram',
      marks: 5,
    },
    {
      id: '10_MARK',
      label: '10M Answer',
      icon: ListOrdered,
      description: 'Comprehensive analysis & rubric',
      marks: 10,
    },
    {
      id: 'IMPORTANT_QUESTIONS',
      label: 'Important Questions',
      icon: FileCheck,
      description: 'Probable exam questions',
    },
    {
      id: 'QUIZ_ME_FROM_THIS',
      label: 'Quiz Me From This',
      icon: HelpCircle,
      description: 'Interactive diagnostic drill',
    },
    {
      id: 'REVISE_THIS',
      label: 'Revise This',
      icon: Zap,
      description: 'Cheat sheet & trap warnings',
    },
    {
      id: 'EXPLAIN_SIMPLY',
      label: 'Explain Simply',
      icon: Lightbulb,
      description: 'ELI5 breakdown with analogies',
    },
  ];

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Quick Academic Actions:</span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          One-click SPPU grounding
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
        {QUICK_ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              type="button"
              disabled={isLoading}
              onClick={() => onSelectAction(action.id, action.label)}
              className="flex items-center gap-2 p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-teal-50/50 dark:hover:bg-slate-800 hover:border-teal-500/50 dark:hover:border-teal-500/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            >
              <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-teal-700 dark:group-hover:text-teal-300">
                  {action.label}
                </div>
                <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                  {action.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
