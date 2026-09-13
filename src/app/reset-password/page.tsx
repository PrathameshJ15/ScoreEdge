'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { Lock, KeyRound, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const initialToken = searchParams.get('token') || '';
  const { confirmPasswordReset } = useAuth();

  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token.trim()) {
      setErrorMessage('Please provide a valid password reset token.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('The passwords entered do not match.');
      return;
    }

    setIsSubmitting(true);
    const res = await confirmPasswordReset(token.trim(), password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorMessage(res.error || 'Failed to reset password. The token may be expired or invalid.');
      return;
    }

    setIsSuccess(true);
  };

  return (
    <Card
      variant="elevated"
      className="w-full max-w-md p-8 space-y-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl"
    >
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-sm">
          <Lock className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Set New Password
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Create a secure new password for your ScoreEdge account.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-card bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isSuccess ? (
        <div className="space-y-5 animate-in fade-in">
          <div className="p-4 rounded-card bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Password Updated Successfully</span>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              Your password has been changed. You can now log in to your account with your new credentials.
            </p>
          </div>

          <Link href="/login" className="block w-full">
            <Button variant="primary" className="w-full gap-2">
              <span>Continue to Login</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Reset Token"
            type="text"
            placeholder="Paste your reset token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
            required
            disabled={isSubmitting}
          />

          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
            disabled={isSubmitting}
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
            required
            disabled={isSubmitting}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full gap-2 mt-2"
            isLoading={isSubmitting}
          >
            <span>Update Password</span>
            <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="text-center pt-2">
            <Link
              href="/login"
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            >
              Remembered your password? Log in
            </Link>
          </div>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500 text-sm">
              Loading reset interface...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
