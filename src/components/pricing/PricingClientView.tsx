'use client';

import React, { useEffect } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { trackClientProductEvent } from '@/lib/analytics/client';

export function PricingClientView() {
  useEffect(() => {
    trackClientProductEvent('premium page viewed', { view: 'pricing_page' });
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="flex-grow py-8">
        <PricingSection />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}