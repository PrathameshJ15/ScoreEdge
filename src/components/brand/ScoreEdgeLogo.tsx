'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface ScoreEdgeLogoProps {
  variant?: 'mark' | 'full' | 'horizontal';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  withLink?: boolean;
  href?: string;
}

export const ScoreEdgeLogo: React.FC<ScoreEdgeLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  withLink = true,
  href = '/',
}) => {
  // Dimensions map
  const markDimensions = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textDimensions = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const fullDimensions = {
    xs: 'w-24 h-auto',
    sm: 'w-32 h-auto',
    md: 'w-40 h-auto',
    lg: 'w-56 h-auto',
    xl: 'w-72 h-auto',
  };

  const content = (
    <div className={`flex items-center gap-2.5 group select-none ${className}`}>
      {variant === 'full' ? (
        <div className={`relative overflow-hidden rounded-xl ${fullDimensions[size]}`}>
          <img
            src="/logo.png"
            alt="ScoreEdge - Smart Study. Higher Scores. SPPU Exam Intelligence"
            className="w-full h-auto object-contain drop-shadow-sm group-hover:scale-[1.02] transition-transform duration-200"
          />
        </div>
      ) : (
        <>
          {/* Logo Mark / Icon with 3D S & Mortarboard */}
          <div
            className={`relative overflow-hidden rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:shadow-md transition-all duration-200 ${markDimensions[size]}`}
          >
            <img
              src="/logo.png"
              alt="ScoreEdge"
              className="w-full h-full object-cover p-0.5"
            />
          </div>

          {/* Wordmark */}
          {variant === 'horizontal' && (
            <div className="flex flex-col">
              <span
                className={`font-extrabold tracking-tight text-[#0f172a] dark:text-white leading-tight ${textDimensions[size]}`}
              >
                Score
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500 dark:from-sky-400 dark:to-cyan-300">
                  Edge
                </span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold tracking-tight uppercase">
                SPPU Exam Intelligence
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );

  if (withLink) {
    return (
      <Link href={href} className="inline-flex shrink-0">
        {content}
      </Link>
    );
  }

  return content;
};

