'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  FileText,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Eye,
  X,
  FileSpreadsheet,
  FileCode,
  ArrowRight,
  Maximize2
} from 'lucide-react';

interface StudyMaterialHeroBannerProps {
  className?: string;
  showPhotoToggle?: boolean;
}

export const StudyMaterialHeroBanner: React.FC<StudyMaterialHeroBannerProps> = ({
  className = '',
  showPhotoToggle = true,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [viewMode, setViewMode] = useState<'ui' | 'photo'>('ui');

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl md:rounded-3xl border border-teal-500/30 bg-[#070e1c] text-white shadow-2xl shadow-teal-950/40 ${className}`}
      >
        {/* Background glow effects matching the design */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/40 to-slate-950/80 pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Badge: Academic AI + SPPU Engineering Focus */}
              <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-teal-950/80 border border-teal-500/40 text-xs font-semibold backdrop-blur-md">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                  Academic AI
                </span>
                <span className="text-slate-300 font-medium text-[11.5px]">
                  SPPU Engineering Focus
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.12]">
                <span>Your Study Material</span> <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-cyan-200 to-emerald-300 drop-shadow-[0_0_24px_rgba(45,212,191,0.25)]">
                  + Our Intelligence
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                Upload your notes, ask questions, get explanations, practice questions, and prepare smarter with ScoreEdge Academic AI.
              </p>

              {/* 4 Feature Badges / Pills */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 text-slate-200 text-xs font-medium backdrop-blur-sm hover:border-teal-500/40 transition-colors">
                  <GraduationCap className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="leading-tight text-[11.5px]">Grounded in SPPU Content</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 text-slate-200 text-xs font-medium backdrop-blur-sm hover:border-teal-500/40 transition-colors">
                  <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="leading-tight text-[11.5px]">Uses Your Study Material</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 text-slate-200 text-xs font-medium backdrop-blur-sm hover:border-teal-500/40 transition-colors">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="leading-tight text-[11.5px]">Exam Focused Answers</span>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/90 text-slate-200 text-xs font-medium backdrop-blur-sm hover:border-teal-500/40 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="leading-tight text-[11.5px]">Safe, Private & Secure</span>
                </div>
              </div>

              {/* Quick Actions & Photo Switcher */}
              {showPhotoToggle && (
                <div className="pt-3 flex items-center gap-3 text-xs flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 border border-teal-500/40 text-teal-300 font-semibold transition-all hover:scale-[1.02]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Reference Photo</span>
                  </button>

                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setViewMode('ui')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        viewMode === 'ui'
                          ? 'bg-teal-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      3D Interactive Graphic
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('photo')}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        viewMode === 'photo'
                          ? 'bg-teal-600 text-white font-semibold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Original Photo
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Graphic Column */}
            <div className="lg:col-span-5 relative flex justify-center items-center">
              {viewMode === 'photo' ? (
                /* Actual Photo View */
                <div className="relative group w-full rounded-2xl overflow-hidden border border-teal-500/40 shadow-2xl bg-slate-950">
                  <img
                    src="/images/study-material-hero.png"
                    alt="Your Study Material + Our Intelligence - ScoreEdge Academic AI"
                    className="w-full h-auto object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => setShowModal(true)}
                    className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-semibold text-xs backdrop-blur-2xs"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Click to Enlarge</span>
                  </button>
                </div>
              ) : (
                /* 3D Graphic Recreating the Photo Graphic */
                <div className="relative w-full max-w-md p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-[#0c1a2e]/90 to-[#071322]/90 border border-teal-500/20 backdrop-blur-md shadow-xl">
                  
                  {/* Floating Analytics Pill */}
                  <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-teal-500/30 shadow-lg mb-6">
                    <div className="text-left text-xs">
                      <span className="text-slate-300 text-[11px] block">Your Material +</span>
                      <span className="font-bold text-white text-[12px]">ScoreEdge Intelligence</span>
                      <div className="text-teal-400 font-semibold text-[11px] mt-0.5 flex items-center gap-1">
                        <span>Better Preparation</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-300 shrink-0">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Layered Document Cards Stack */}
                  <div className="relative h-44 sm:h-48 w-full flex items-center justify-center">
                    
                    {/* PDF Card (Red) */}
                    <div className="absolute transform -translate-x-12 -translate-y-2 -rotate-12 w-28 sm:w-32 bg-white rounded-xl p-3 shadow-2xl border border-slate-200 transition-all hover:scale-105 hover:-translate-y-4 hover:z-20 cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-xs mb-2">
                        PDF
                      </div>
                      <div className="h-1.5 w-16 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-12 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-14 bg-slate-100 rounded-full" />
                    </div>

                    {/* Word Card (Blue) */}
                    <div className="absolute transform -translate-x-2 -translate-y-4 -rotate-3 w-28 sm:w-32 bg-white rounded-xl p-3 shadow-2xl border border-slate-200 z-10 transition-all hover:scale-105 hover:-translate-y-6 hover:z-20 cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-xs mb-2">
                        W
                      </div>
                      <div className="h-1.5 w-16 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-10 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-14 bg-slate-100 rounded-full" />
                    </div>

                    {/* PowerPoint Card (Orange) */}
                    <div className="absolute transform translate-x-10 translate-y-2 rotate-6 w-28 sm:w-32 bg-white rounded-xl p-3 shadow-2xl border border-slate-200 z-10 transition-all hover:scale-105 hover:-translate-y-2 hover:z-20 cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-xs mb-2">
                        P
                      </div>
                      <div className="h-1.5 w-14 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-12 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-8 bg-slate-100 rounded-full" />
                    </div>

                    {/* Image Media Card (Emerald) */}
                    <div className="absolute transform translate-x-20 -translate-y-1 rotate-12 w-28 sm:w-32 bg-white rounded-xl p-3 shadow-2xl border border-slate-200 transition-all hover:scale-105 hover:-translate-y-4 hover:z-20 cursor-pointer">
                      <div className="w-7 h-7 rounded-md bg-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-xs mb-2">
                        IMG
                      </div>
                      <div className="h-1.5 w-14 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-10 bg-slate-200 rounded-full mb-1.5" />
                      <div className="h-1.5 w-12 bg-slate-100 rounded-full" />
                    </div>
                  </div>

                  {/* Handwritten Style Annotation */}
                  <div className="mt-4 text-center">
                    <span className="inline-block text-cyan-300 font-serif italic text-sm tracking-wide transform -rotate-2 drop-shadow-[0_0_8px_rgba(45,212,191,0.5)]">
                      &ldquo;Upload. Ask. Learn. Score Higher.&rdquo;
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Lightbox Modal for Photo Review */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative max-w-5xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-950">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm font-bold text-white">
                  ScoreEdge Academic AI - Reference Design
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body with Full Image */}
            <div className="p-4 max-h-[80vh] overflow-auto flex justify-center bg-slate-950/60">
              <img
                src="/images/study-material-hero.png"
                alt="Full design mockup with Your Study Material + Our Intelligence banner"
                className="max-w-full h-auto rounded-lg shadow-xl"
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
              <span>Circled Section: Your Study Material + Our Intelligence</span>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

