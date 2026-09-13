'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Hero: React.FC = () => {
  return (
    <section className="relative w-full min-h-[580px] sm:min-h-[640px] lg:min-h-[700px] xl:min-h-[740px] flex items-center bg-[#070d18] text-white overflow-hidden border-b border-slate-800">
      
      {/* Background Image: using /images/hero-study.png exactly as instructed */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-study.png"
          alt="SPPU Engineering Student with Exam Intelligence Dashboard"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[78%_center] sm:object-[75%_center] md:object-[80%_center] lg:object-right"
        />

        {/* Directional Gradient Overlay: subtle dark navy on left for readability, preserving student on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#070d18] via-[#070d18]/90 md:via-[#070d18]/70 lg:via-[#070d18]/40 to-transparent pointer-events-none" />
        
        {/* Subtle Top & Bottom Vignette for seamless section transitions */}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#070d18] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#070d18]/60 to-transparent pointer-events-none" />
      </div>

      {/* Hero Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
        <div className="max-w-2xl lg:max-w-xl xl:max-w-2xl text-left">
          
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/70 border border-teal-800/60 text-teal-300 text-xs font-mono font-semibold tracking-wider uppercase mb-6 backdrop-blur-xs shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span>SPPU EXAM INTELLIGENCE</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl xl:text-[64px] font-extrabold text-white tracking-tight leading-[1.08] mb-6 drop-shadow-sm"
          >
            Stop studying everything.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 via-emerald-300 to-teal-400">
              Study what matters.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg lg:text-xl text-slate-200/95 font-normal leading-relaxed max-w-xl mb-8 drop-shadow-xs"
          >
            SPPU Exam Intelligence turns PYQs, syllabus and study material into a clear, prioritized preparation path.
          </motion.p>

          {/* Primary & Secondary CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-8"
          >
            <Link href="/signup" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm px-6 py-3 rounded-control shadow-lg shadow-teal-950/50 gap-2 border border-teal-500/30 transition-all hover:translate-y-[-1px]"
              >
                <span>Start Preparing</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <Link href="/pyqs" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-slate-900/60 hover:bg-slate-800/80 text-slate-200 border-slate-700/80 hover:border-slate-500 font-semibold text-sm px-6 py-3 rounded-control backdrop-blur-xs transition-all hover:text-white"
              >
                <span>Explore PYQs</span>
              </Button>
            </Link>
          </motion.div>

          {/* Small Product Capability Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-2 text-xs font-mono text-slate-400 tracking-wide flex-wrap pt-1"
          >
            <span className="text-teal-400 font-medium">PYQs</span>
            <span className="text-slate-600">•</span>
            <span>Exam Intelligence</span>
            <span className="text-slate-600">•</span>
            <span>Notes</span>
            <span className="text-slate-600">•</span>
            <span>Practice</span>
            <span className="text-slate-600">•</span>
            <span className="text-teal-400 font-medium">Exam Mode</span>
          </motion.div>

        </div>
      </div>

    </section>
  );
};
