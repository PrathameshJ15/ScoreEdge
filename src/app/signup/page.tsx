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
import { 
  GraduationCap, 
  Mail, 
  Lock, 
  User, 
  ArrowRight, 
  AlertCircle, 
  Building, 
  BookOpen, 
  CheckCircle2, 
  Target,
  Sparkles,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

const SPPU_COLLEGES = [
  'College of Engineering Pune (COEP)',
  'Pune Institute of Computer Technology (PICT)',
  'Vishwakarma Institute of Technology (VIT Pune)',
  'Vishwakarma Institute of Information Technology (VIIT)',
  'Pimpri Chinchwad College of Engineering (PCCOE)',
  'MIT Academy of Engineering (MIT AOE Alandi)',
  'Cummins College of Engineering for Women (CCEW)',
  'AISSMS College of Engineering',
  'Sinhgad College of Engineering (SCOE Vadgaon)',
  'D.Y. Patil College of Engineering (Akurdi)',
  'D.Y. Patil Institute of Technology (Pimpri)',
  'Modern Education Society College of Engineering (MESCOE)',
  'Marathwada Mitra Mandal College of Engineering (MMCOE)',
  'JSPM Rajarshi Shahu College of Engineering (RSCOE Tathawade)',
  'Other SPPU Affiliated Institute',
];

const BRANCH_OPTIONS = [
  { code: 'COMP', name: 'Computer Engineering', dept: 'Computer Engineering' },
  { code: 'IT', name: 'Information Technology', dept: 'Information Technology' },
  { code: 'AI-DS', name: 'Artificial Intelligence & Data Science', dept: 'Artificial Intelligence & Data Science' },
  { code: 'E&TC', name: 'Electronics & Telecommunication', dept: 'Electronics & Telecommunication' },
  { code: 'MECH', name: 'Mechanical Engineering', dept: 'Mechanical Engineering' },
  { code: 'CIVIL', name: 'Civil Engineering', dept: 'Civil Engineering' },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect');

  const { signup, loginWithGoogle } = useAuth();
  
  // Step state
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Account Credentials
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 2: Academic Profile
  const [university, setUniversity] = useState('Savitribai Phule Pune University (SPPU)');
  const [collegeName, setCollegeName] = useState(SPPU_COLLEGES[1]); // PICT default
  const [customCollege, setCustomCollege] = useState('');
  const [academicYear, setAcademicYear] = useState<'FE' | 'SE' | 'TE' | 'BE'>('SE');
  const [branchCode, setBranchCode] = useState('COMP');
  const [semesterNumber, setSemesterNumber] = useState<number>(4);
  const [pattern, setPattern] = useState('2024 Pattern (NEP)');
  const [targetSgpa, setTargetSgpa] = useState<number>(9.0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-adjust semester when year changes
  const handleYearChange = (year: 'FE' | 'SE' | 'TE' | 'BE') => {
    setAcademicYear(year);
    if (year === 'FE') {
      setSemesterNumber(2);
      setPattern('2024 Pattern (NEP)');
    } else if (year === 'SE') {
      setSemesterNumber(4);
    } else if (year === 'TE') {
      setSemesterNumber(6);
      setPattern('2019 Pattern');
    } else if (year === 'BE') {
      setSemesterNumber(8);
      setPattern('2019 Pattern');
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    const selectedBranch = BRANCH_OPTIONS.find((b) => b.code === branchCode) || BRANCH_OPTIONS[0];
    const resolvedCollege = collegeName === 'Other SPPU Affiliated Institute' && customCollege.trim()
      ? customCollege.trim()
      : collegeName;

    const onboardingData = {
      university,
      college_name: resolvedCollege,
      department: selectedBranch.dept,
      branch_code: branchCode,
      academic_year: academicYear,
      year_number: academicYear === 'FE' ? 1 : academicYear === 'SE' ? 2 : academicYear === 'TE' ? 3 : 4,
      semester_number: semesterNumber,
      pattern,
      target_sgpa: targetSgpa,
      backlog_subjects: [],
    };

    const result = await signup(email, password, fullName, onboardingData, 'STUDENT');
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.error || 'Failed to create account.');
      return;
    }

    // Redirect to dashboard
    router.push(redirectParam || '/dashboard');
  };

  const handleGoogleSignup = () => {
    loginWithGoogle(redirectParam || '/dashboard');
  };

  const selectedBranch = BRANCH_OPTIONS.find((b) => b.code === branchCode) || BRANCH_OPTIONS[0];

  return (
    <Card
      variant="elevated"
      className="w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl"
    >
      {/* Header & Logo */}
      <div className="text-center space-y-2">
        <ScoreEdgeLogo variant="mark" size="lg" className="justify-center mx-auto mb-2" href="/" />
        <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Create Your ScoreEdge Account
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Personalized SPPU exam intelligence, solved question banks, and curriculum readiness.
        </p>

        {/* Step Indicator Pills */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            currentStep === 1 
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800' 
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
            <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">1</span>
            <span>Account Details</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            currentStep === 2 
              ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800' 
              : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
          }`}>
            <span className="w-4 h-4 rounded-full bg-brand-600 text-white text-[10px] flex items-center justify-center">2</span>
            <span>Academic Onboarding</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* STEP 1: Account Credentials */}
      {currentStep === 1 && (
        <form onSubmit={handleNextStep} className="space-y-4">
          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 text-zinc-800 dark:text-zinc-100 text-sm font-semibold transition-colors shadow-xs"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.64v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.11z" />
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z" />
              <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.24C.45 8.14 0 9.99 0 12s.45 3.86 1.24 5.43l4.04-3.14z" />
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.57l4.04 3.14c.95-2.83 3.6-4.96 6.72-4.96z" />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
            <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Or with Student Email
            </span>
            <div className="flex-grow border-t border-zinc-200 dark:border-zinc-800" />
          </div>

          <Input
            label="Full Name"
            placeholder="e.g. Prathamesh Jadhav"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4 text-zinc-400" />}
            required
          />

          <Input
            label="College or Personal Email Address"
            type="email"
            placeholder="student@sppu.ac.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4 text-zinc-400" />}
            required
          />

          <Input
            label="Create Password"
            type="password"
            placeholder="Minimum 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
            required
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4 text-zinc-400" />}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full gap-2 mt-2"
          >
            <span>Continue to Academic Setup</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      )}

      {/* STEP 2: Academic Onboarding Details */}
      {currentStep === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 bg-brand-50/60 dark:bg-brand-950/40 rounded-xl border border-brand-200/80 dark:border-brand-900/60 text-xs text-brand-900 dark:text-brand-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
              <span>Personalizing for <strong>{fullName || 'Student'}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="text-[11px] font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Back</span>
            </button>
          </div>

          {/* University */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              University
            </label>
            <div className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-lg py-2.5 px-3 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
              <span>{university}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-mono font-bold">
                Supported
              </span>
            </div>
          </div>

          {/* College Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Engineering College
            </label>
            <select
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              {SPPU_COLLEGES.map((col) => (
                <option key={col} value={col}>{col}</option>
              ))}
            </select>

            {collegeName === 'Other SPPU Affiliated Institute' && (
              <Input
                label="Enter College Name"
                placeholder="e.g. Modern College of Engineering, Pune"
                value={customCollege}
                onChange={(e) => setCustomCollege(e.target.value)}
                required
              />
            )}
          </div>

          {/* Academic Year & Semester Selector */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Academic Year
              </label>
              <select
                value={academicYear}
                onChange={(e) => handleYearChange(e.target.value as any)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="FE">First Year (FE)</option>
                <option value="SE">Second Year (SE)</option>
                <option value="TE">Third Year (TE)</option>
                <option value="BE">Final Year (BE)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Current Semester
              </label>
              <select
                value={semesterNumber}
                onChange={(e) => setSemesterNumber(Number(e.target.value))}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-xs font-semibold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                {academicYear === 'FE' && (
                  <>
                    <option value={1}>Semester 1</option>
                    <option value={2}>Semester 2</option>
                  </>
                )}
                {academicYear === 'SE' && (
                  <>
                    <option value={3}>Semester 3</option>
                    <option value={4}>Semester 4</option>
                  </>
                )}
                {academicYear === 'TE' && (
                  <>
                    <option value={5}>Semester 5</option>
                    <option value={6}>Semester 6</option>
                  </>
                )}
                {academicYear === 'BE' && (
                  <>
                    <option value={7}>Semester 7</option>
                    <option value={8}>Semester 8</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Department / Branch */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Department / Engineering Branch
            </label>
            <select
              value={branchCode}
              onChange={(e) => setBranchCode(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-xs font-medium text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            >
              {BRANCH_OPTIONS.map((b) => (
                <option key={b.code} value={b.code}>
                  {b.name} ({b.code})
                </option>
              ))}
            </select>
          </div>

          {/* Syllabus Pattern & Target SGPA */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                Syllabus Pattern
              </label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg py-2 px-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              >
                <option value="2024 Pattern (NEP)">2024 Pattern (NEP)</option>
                <option value="2019 Pattern">2019 Pattern</option>
                <option value="2015 Pattern">2015 Pattern</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  Target SGPA
                </label>
                <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                  {targetSgpa.toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="6.0"
                max="10.0"
                step="0.1"
                value={targetSgpa}
                onChange={(e) => setTargetSgpa(parseFloat(e.target.value))}
                className="w-full accent-brand-600 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Dynamic Preview Box */}
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl border border-zinc-200 dark:border-zinc-700/80 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-zinc-800 dark:text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Workspace Dynamic Preview:</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400">
              You will be configured with <strong>{academicYear} (Semester {semesterNumber})</strong> curriculum for <strong>{selectedBranch.name}</strong> under <strong>{pattern}</strong>. Target SGPA: <strong>{targetSgpa.toFixed(2)}</strong>.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full gap-2 mt-3"
            isLoading={isSubmitting}
          >
            <span>Complete Setup &amp; Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </form>
      )}

      <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800">
        Already have a ScoreEdge account?{' '}
        <Link href="/login" className="text-brand-600 dark:text-brand-400 font-bold hover:underline">
          Log In
        </Link>
      </div>
    </Card>
  );
}

export default function SignupPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b]">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4">
        <Suspense
          fallback={
            <div className="p-8 text-center text-zinc-500 text-sm">
              Loading registration onboarding form...
            </div>
          }
        >
          <SignupForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
