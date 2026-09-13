'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { ScoreEdgeLogo } from '@/components/brand/ScoreEdgeLogo';
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');
  const errorParam = searchParams.get('error');
  const registeredParam = searchParams.get('registered');

  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorParam === 'unauthorized'
      ? 'Please sign in to access that protected page.'
      : errorParam === 'session_expired'
      ? 'Your session has expired. Please sign in again.'
      : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Invalid email or password.');
      return;
    }

    // Determine post-login destination
    if (redirectParam) {
      router.push(redirectParam);
    } else if (result.user?.role === 'ADMIN') {
      router.push('/admin');
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleLogin = () => {
    loginWithGoogle(redirectParam || '/dashboard');
  };

  return (
    <Card
      variant="elevated"
      className="w-full max-w-md p-8 space-y-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl"
    >
      <div className="text-center space-y-2">
        <ScoreEdgeLogo variant="mark" size="lg" className="justify-center mx-auto mb-2" href="/" />
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Log in to ScoreEdge
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Access your personalized SPPU study plans, PYQs, and exam intelligence.
        </p>
      </div>

      {registeredParam && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Account created successfully! Sign in below to get started.</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Google OAuth Login Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-100 text-sm font-semibold transition-colors shadow-xs"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.64v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.11z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.24C.45 8.14 0 9.99 0 12s.45 3.86 1.24 5.43l4.04-3.14z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.57l4.04 3.14c.95-2.83 3.6-4.96 6.72-4.96z"
          />
        </svg>
        <span>Continue with Google</span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Or with SPPU Email
        </span>
        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Student or Admin Email"
          type="email"
          placeholder="student@sppu.ac.in"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
          required
          disabled={isSubmitting}
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
          required
          disabled={isSubmitting}
        />

        <div className="flex justify-between items-center text-xs">
          <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            <input type="checkbox" className="rounded accent-brand-600" />
            <span>Remember me</span>
          </label>
          <Link
            href="/forgot-password"
            className="text-brand-600 dark:text-brand-400 hover:underline font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full gap-2"
          isLoading={isSubmitting}
        >
          <span>Log In to Account</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Demo helper logins */}
      <div className="p-3 bg-slate-50 dark:bg-slate-850/60 rounded-card border border-slate-200/80 dark:border-slate-800 text-[11px] space-y-1.5 text-slate-500 dark:text-slate-400">
        <div className="font-bold text-slate-700 dark:text-slate-300">Quick Test Credentials:</div>
        <div className="flex flex-wrap gap-2 pt-0.5">
          <button
            type="button"
            onClick={() => {
              setEmail('student@sppu.ac.in');
              setPassword('Student@1234');
            }}
            className="px-2 py-1 rounded bg-slate-200/80 dark:bg-slate-750 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 font-mono transition-colors"
          >
            Fill Student (student@sppu.ac.in)
          </button>
          <button
            type="button"
            onClick={() => {
              setEmail('admin@scoreedge.in');
              setPassword('Admin@1234');
            }}
            className="px-2 py-1 rounded bg-slate-200/80 dark:bg-slate-750 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-950/60 dark:hover:text-brand-300 font-mono transition-colors"
          >
            Fill Admin (admin@scoreedge.in)
          </button>
        </div>
      </div>

      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
        Don&apos;t have a ScoreEdge account?{' '}
        <Link href="/signup" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
          Create Free Account
        </Link>
      </div>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading authentication form...
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
