'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { PriorityBadge } from '@/components/ui/PriorityBadge';
import { DBMS_EXAM_PRESETS } from '@/data/sppuData';
import { Clock, Zap, CheckSquare, Square, AlertTriangle, ArrowRight, ShieldAlert } from 'lucide-react';
import { ExamPlanItem } from '@/lib/types';

export const ExamModeSimulator = () => {
  const [activeDuration, setActiveDuration] = useState<'2h' | '5h' | '1d'>('2h');
  const [completedItemIds, setCompletedItemIds] = useState<string[]>([]);

  const currentPreset = DBMS_EXAM_PRESETS.find((p) => p.durationKey === activeDuration) || DBMS_EXAM_PRESETS[0];

  const toggleItem = (id: string) => {
    if (completedItemIds.includes(id)) {
      setCompletedItemIds(completedItemIds.filter((item) => item !== id));
    } else {
      setCompletedItemIds([...completedItemIds, id]);
    }
  };

  const completedCount = currentPreset.items.filter((item) => completedItemIds.includes(item.id)).length;
  const progressPercent = Math.round((completedCount / currentPreset.items.length) * 100);

  return (
    <section id="exam-mode" className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Glow Effect */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Zap className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>Killer Feature #2</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Emergency Exam Mode
          </h2>
          <p className="text-slate-300 text-base sm:text-lg">
            Exam in 2 hours or tomorrow morning? Input your available study time and get an instant, priority-ranked preparation plan.
          </p>
        </div>

        {/* Time Selector Controls */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 bg-slate-800/80 rounded-card border border-slate-700 gap-2">
            {DBMS_EXAM_PRESETS.map((preset) => (
              <button
                key={preset.durationKey}
                onClick={() => setActiveDuration(preset.durationKey as '2h' | '5h' | '1d')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-control text-sm font-semibold transition-all ${
                  activeDuration === preset.durationKey
                    ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>{preset.durationLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Plan Viewer */}
        <div className="max-w-4xl mx-auto">
          <Card className="bg-slate-950 border-slate-800 p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{currentPreset.title}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white">DBMS Subject Prep Schedule</h3>
                <p className="text-xs md:text-sm text-slate-400 mt-1">{currentPreset.description}</p>
              </div>

              {/* Live Progress Box */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-control min-w-[200px]">
                <div className="flex justify-between text-xs font-semibold mb-1.5">
                  <span className="text-slate-400">Exam Readiness</span>
                  <span className="text-amber-400 font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <span className="text-[11px] text-slate-500 mt-1.5 block text-right">
                  {completedCount} of {currentPreset.items.length} tasks completed
                </span>
              </div>
            </div>

            {/* Plan Tasks List */}
            <div className="py-6 space-y-3">
              {currentPreset.items.map((item, idx) => {
                const isCompleted = completedItemIds.includes(item.id);

                return (
                  <div
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`p-4 rounded-card border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                      isCompleted
                        ? 'bg-slate-900/40 border-slate-800/80 opacity-60'
                        : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <button className="text-slate-400 hover:text-amber-400 transition-colors">
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-500" />
                        )}
                      </button>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            STEP {idx + 1}
                          </span>
                          <span className={`text-sm font-semibold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                            {item.topicName}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Unit {item.unitNumber} • ~{item.estimatedMinutes} Mins • Type: {item.type.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    <PriorityBadge priority={item.priority} size="sm" />
                  </div>
                );
              })}
            </div>

            {/* Bottom Alert Banner */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>ScoreEdge optimizes for high-yield SPPU paper topics so you get max marks per study hour.</span>
              </div>
              <a href="#pricing">
                <span className="text-amber-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer">
                  Unlock Full Subject Exam Mode <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </a>
            </div>
          </Card>
        </div>

      </div>
    </section>
  );
};
