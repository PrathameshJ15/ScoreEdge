import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { constructMetadata, getBreadcrumbSchema } from '@/lib/seo/metadata';
import { BUSINESS_CONFIG } from '@/lib/config/business';
import {
  Mail,
  Phone,
  MessageSquare,
  Clock,
  MapPin,
  Building,
  ShieldCheck,
  HelpCircle,
  CreditCard,
  BookOpen,
} from 'lucide-react';

export const metadata: Metadata = constructMetadata({
  title: 'Contact Academic Support & Regional Office',
  description:
    'Get in touch with ScoreEdge academic support, student grievance resolution, UPI payment verification, and regional administrative office in Pune.',
  path: '/contact',
  keywords: ['ScoreEdge contact', 'SPPU student helpline', 'Pune engineering notes support', 'ScoreEdge WhatsApp'],
});

export default function ContactPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: 'Home', url: '/' },
    { name: 'Contact', url: '/contact' },
  ]);

  return (
    <div className="flex flex-col min-h-screen bg-[#fafaf9] dark:bg-[#0a0a0b] text-zinc-900 dark:text-zinc-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />

      <main className="flex-grow py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-brand-50 dark:bg-brand-950/70 text-brand-700 dark:text-brand-300 border border-brand-200/70 dark:border-brand-800 mb-4">
              <Clock className="w-3.5 h-3.5" />
              <span>Prompt Student Support • Pune Campus Hub</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
              We’re Here to Support Your SPPU Preparation
            </h1>
            <p className="text-base text-zinc-600 dark:text-zinc-300">
              Have queries about premium pass activation, syllabus scope, PYQ verified solutions, or account access? Reach out directly to our academic team.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Direct Contact Cards */}
            <div className="lg:col-span-2 space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp Priority */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    WhatsApp Student Desk
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Fastest resolution for instant UPI pass activation and exam queries.
                  </p>
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4">
                    {BUSINESS_CONFIG.whatsappDisplayNumber}
                  </div>
                  <a
                    href={`https://wa.me/${BUSINESS_CONFIG.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Hello ScoreEdge Support, I have an inquiry regarding SPPU study materials.')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                  >
                    Open WhatsApp Chat
                  </a>
                </div>

                {/* Email Support */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4">
                    <Mail className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Official Email Support
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Account help, billing inquiries, and faculty feedback submissions.
                  </p>
                  <div className="text-sm font-semibold text-brand-600 dark:text-brand-400 mb-4">
                    {BUSINESS_CONFIG.supportEmail}
                  </div>
                  <a
                    href={`mailto:${BUSINESS_CONFIG.supportEmail}`}
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Send Email
                  </a>
                </div>

                {/* Telephone Helpline */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                    <Phone className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Direct Phone Helpline
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                    Academic office hours: 10:00 AM – 6:00 PM IST (Mon – Sat).
                  </p>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white mb-4">
                    {BUSINESS_CONFIG.phoneDisplayNumber}
                  </div>
                  <a
                    href={`tel:${BUSINESS_CONFIG.phoneNumber}`}
                    className="inline-flex items-center justify-center w-full py-2.5 px-4 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
                  >
                    Call Helpline
                  </a>
                </div>

                {/* Regional Academic Hub */}
                <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                    Pune Campus Office
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {BUSINESS_CONFIG.regionalOffice}
                  </p>
                  <div className="text-[11px] text-slate-400">
                    Located in the heart of Pune university collegiate district.
                  </div>
                </div>
              </div>

              {/* Inquiry Guidance Box */}
              <div className="p-6 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Common Inquiries & Direct Shortcuts
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <Link
                    href="/pricing"
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-400 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                      <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                      Instant UPI Activation
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Explore passes & direct QR verification instructions.
                    </p>
                  </Link>

                  <Link
                    href="/refund"
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-400 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
                      Refund Requests
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      View our fair cancellation policy and claim timeline.
                    </p>
                  </Link>

                  <Link
                    href="/explore"
                    className="p-3 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-brand-400 transition-colors"
                  >
                    <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5 mb-1">
                      <BookOpen className="w-3.5 h-3.5 text-brand-600" />
                      Subject Scope
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">
                      Check syllabus units covered under 2019 Pattern.
                    </p>
                  </Link>
                </div>
              </div>
            </div>

            {/* Business & Legal Entity Sidebar */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Registered Business Information
                  </h3>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Legal Entity Name</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {BUSINESS_CONFIG.legalEntity}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block">Registered Office</span>
                    <span className="text-slate-700 dark:text-slate-300">
                      {BUSINESS_CONFIG.registeredAddress}
                    </span>
                  </div>

                  {BUSINESS_CONFIG.gstNumber && (
                    <div>
                      <span className="text-slate-500 block">GSTIN</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {BUSINESS_CONFIG.gstNumber}
                      </span>
                    </div>
                  )}

                  {BUSINESS_CONFIG.llpin && (
                    <div>
                      <span className="text-slate-500 block">LLPIN</span>
                      <span className="font-mono text-slate-700 dark:text-slate-300">
                        {BUSINESS_CONFIG.llpin}
                      </span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <span className="text-slate-500 block">Support Window</span>
                    <span className="text-slate-700 dark:text-slate-300 leading-snug">
                      {BUSINESS_CONFIG.supportHours}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security & Student Safety Callout */}
              <div className="p-6 rounded-2xl bg-brand-50/50 dark:bg-brand-950/30 border border-brand-200/80 dark:border-brand-900/60 text-xs space-y-2">
                <div className="flex items-center gap-2 text-brand-700 dark:text-brand-300 font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Student Safety Guarantee</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  ScoreEdge representatives will <strong>never</strong> ask for your login password, UPI MPIN, or bank OTP. Official payments are processed strictly through authorized payment channels or direct verified business UPI.
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}