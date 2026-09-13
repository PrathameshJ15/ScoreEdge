'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import {
  Mic,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Headphones,
  Award
} from 'lucide-react';

export const VoiceTutorSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-16 md:py-24 bg-[#faf9f5] dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Voice Tutor Interactive Simulation */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl shadow-slate-900/5 dark:shadow-black/50 overflow-hidden">
              
              {/* Tutor Header */}
              <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-teal-50/50 to-white dark:from-teal-950/20 dark:to-slate-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {/* Teacher Avatar */}
                    <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                      SE
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#0f172a] dark:text-white">Professor ScoreEdge</h3>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        Voice AI
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">DBMS &amp; Systems Specialist</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400 font-mono bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Interactive Audio</span>
                </div>
              </div>

              {/* Tutor Body */}
              <div className="p-6 space-y-5">
                
                {/* Active Lesson Pill */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#faf9f5] dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                      Active Audio Lesson
                    </span>
                    <span className="text-xs font-bold text-[#0f172a] dark:text-white">
                      Unit 3: 3NF vs BCNF Normalization Explained
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200">
                    5M Question
                  </span>
                </div>

                {/* Voice Waveform Simulator */}
                <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1.5 text-teal-400 font-medium">
                      <Mic className="w-3.5 h-3.5 animate-pulse" />
                      &quot;Explain BCNF decomposition with an example&quot;
                    </span>
                    <span className="font-mono text-[11px]">02:14 / 05:30</span>
                  </div>

                  {/* Dynamic Sound Wave Bars */}
                  <div className="flex items-center justify-between gap-1 h-12 px-2">
                    {[40, 65, 85, 30, 95, 70, 45, 80, 60, 90, 50, 75, 100, 65, 40, 85, 95, 60, 45, 70, 85, 40, 60].map((h, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-teal-500 rounded-full transition-all duration-300"
                        style={{
                          height: isPlaying ? `${Math.max(15, (h * (i % 3 + 1)) % 100)}%` : `${h * 0.45}%`,
                          opacity: i > 15 ? 0.4 : 1,
                        }}
                      />
                    ))}
                  </div>

                  {/* Audio Controls */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{isPlaying ? 'Pause Lesson' : 'Play Voice Lesson'}</span>
                    </button>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <button
                        onClick={() => setIsPlaying(false)}
                        className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Replay"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-[11px]">1.0x Speed</span>
                    </div>
                  </div>
                </div>

                {/* Evaluator Tip Box */}
                <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 flex items-start gap-2.5 text-xs text-teal-950 dark:text-teal-200">
                  <Award className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Examiner Tip from Audio:</span>
                    <span>&quot;Always remember to state that in BCNF, every determinant must be a candidate key. Mentioning dependency preservation will secure your full 5 marks.&quot;</span>
                  </div>
                </div>

              </div>

            </div>
          </div>

          {/* Right Column: Copy & Value Proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-semibold">
              <Headphones className="w-3.5 h-3.5 text-teal-600" />
              <span>AI VOICE LEARNING</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0f172a] dark:text-white tracking-tight leading-tight">
              Learn with Voice. <br />
              <span className="text-teal-700 dark:text-teal-400">Like a Real Teacher.</span>
            </h2>

            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              Tired of staring at endless PDFs? ScoreEdge AI Voice Tutor breaks down complex engineering concepts into natural, conversational lessons designed around Pune University&apos;s specific marking schemes.
            </p>

            {/* 3 Checkmark Items */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">Conversational SPPU Explanations</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Tailored directly to 2, 5, and 10-mark question formats with key evaluator keywords.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">Hands-Free Revision Anytime</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Listen during commutes, college walks, or late-night pre-exam crunch sessions.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0f172a] dark:text-white">Interactive Q&amp;A Clarifications</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">Ask clarifying doubts with voice input and receive instant, patient step-by-step guidance.</p>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              <Link href="/ai?mode=TEACH_ME">
                <Button size="lg" className="bg-teal-700 hover:bg-teal-800 text-white font-semibold gap-2 shadow-md shadow-teal-900/10 px-6 py-3">
                  <Mic className="w-4 h-4" />
                  <span>Try Voice Tutor Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
