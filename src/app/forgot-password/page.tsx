'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { KeyRound, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; resetToken?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const res = await requestPasswordReset(email);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to request password reset');
      return;
    }

    setSuccessInfo({
      message: res.message || 'Password reset token generated successfully.',
      resetToken: res.resetToken,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card
          variant="elevated"
          className="w-full max-w-md p-8 space-y-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-sm">
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Reset Your Password
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Enter the email address registered with your ScoreEdge account to receive recovery instructions.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-card bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successInfo ? (
            <div className="space-y-5 animate-in fade-in">
              <div className="p-4 rounded-card bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>Reset Instructions Sent</span>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">
                  {successInfo.message}
                </p>
              </div>

              {successInfo.resetToken && (
                <div className="p-3.5 rounded-card bg-brand-50 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 space-y-2">
                  <div className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase tracking-wider">
                    Demo / Local Environment Token
                  </div>
                  <div className="font-mono text-xs break-all bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 select-all">
                    {successInfo.resetToken}
                  </div>
                  <Link
                    href={`/reset-password?token=${encodeURIComponent(successInfo.resetToken)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline pt-1"
                  >
                    <span>Proceed to Set New Password</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              <div className="pt-2">
                <Link href="/login" className="block w-full">
                  <Button variant="outline" className="w-full gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Login</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Registered Email Address"
                type="email"
                placeholder="student@sppu.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
                disabled={isSubmitting}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full gap-2"
                isLoading={isSubmitting}
              >
                <span>Generate Password Reset</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
            Need a new account?{' '}
            <Link href="/signup" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              Create Free Account
            </Link>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
