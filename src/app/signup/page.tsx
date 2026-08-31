'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Target, Mail, Lock, User, GraduationCap, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [branch, setBranch] = useState('comp');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
              Create Your ScoreEdge Account
            </h1>
            <p className="text-xs text-slate-500">
              Join thousands of SPPU engineering students preparing smarter.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Pratham Jadhav"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="student@sppu.ac.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Select Engineering Branch
              </label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-control py-2.5 px-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
              >
                <option value="comp">SE Computer Engineering (2024 Pattern)</option>
                <option value="it">SE Information Technology</option>
                <option value="aids">SE AI & Data Science</option>
                <option value="entc">SE Electronics & Telecom</option>
              </select>
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="Create strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />

            <Button type="submit" variant="primary" className="w-full gap-2 mt-2">
              <span>Start Free SPPU Prep</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
              Log In
            </Link>
          </div>

        </Card>
      </main>

      <Footer />
    </div>
  );
}
