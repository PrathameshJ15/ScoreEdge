'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Target, Mail, Lock, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md p-8 space-y-6 shadow-xl border-slate-200 dark:border-slate-800">
          
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
              <Target className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Log in to ScoreEdge
            </h1>
            <p className="text-xs text-slate-500">
              Access your personalized SPPU study plans, PYQs, and exam intelligence.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Student Email Address"
              type="email"
              placeholder="student@sppu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded accent-brand-600" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-brand-600 hover:underline font-semibold">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" className="w-full gap-2">
              <span>Log In to Account</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Don&apos;t have a ScoreEdge account?{' '}
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
