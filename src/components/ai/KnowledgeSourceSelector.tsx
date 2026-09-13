'use client';

import React from 'react';
import { Shield, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { KnowledgeSourceMode } from '@/lib/db/types';

interface KnowledgeSourceSelectorProps {
  sourceMode: KnowledgeSourceMode;
  onSourceModeChange: (mode: KnowledgeSourceMode) => void;
  uploadedFilesCount: number;
}

export const KnowledgeSourceSelector: React.FC<KnowledgeSourceSelectorProps> = ({
  sourceMode,
  onSourceModeChange,
  uploadedFilesCount,
}) => {
  const options: Array<{
    id: KnowledgeSourceMode;
    label: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
    pillColor: string;
  }> = [
    {
      id: 'MY_MATERIAL',
      label: 'My Material',
      badge: `${uploadedFilesCount} File${uploadedFilesCount === 1 ? '' : 's'} Active`,
      icon: BookOpen,
      description: 'Grounded strictly in your uploaded notes, slides, and files.',
      pillColor: 'border-teal-500/40 bg-teal-950/30 text-teal-300',
    },
    {
      id: 'SCOREDGE',
      label: 'ScoreEdge',
      badge: 'SPPU Verified',
      icon: Shield,
      description: 'Syllabus, PYQ recurrence (2019-2024), and examiner rubrics.',
      pillColor: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-300',
    },
    {
      id: 'BOTH',
      label: 'Unified (Both)',
      badge: 'Recommended',
      icon: Layers,
      description: 'Synthesizes your personal notes with official SPPU exam patterns.',
      pillColor: 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300',
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <span>Knowledge Source</span>
          <span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
            (Controls grounding dataset)
          </span>
        </span>
        {sourceMode === 'MY_MATERIAL' && uploadedFilesCount === 0 && (
          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 animate-pulse">
            Upload notes below to query your material
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {options.map((opt) => {
          const isSelected = sourceMode === opt.id;
          const Icon = opt.icon;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSourceModeChange(opt.id)}
              className={`relative flex flex-col p-3 rounded-xl border text-left transition-all text-xs ${
                isSelected
                  ? 'bg-slate-900 border-teal-500 text-white shadow-sm ring-1 ring-teal-500/30 dark:bg-slate-900 dark:border-teal-500'
                  : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 ${
                      isSelected ? 'text-teal-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="font-bold text-[13px]">{opt.label}</span>
                </div>
                {isSelected ? (
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                ) : (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-medium">
                    {opt.badge}
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] leading-relaxed line-clamp-2 ${
                  isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {opt.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
