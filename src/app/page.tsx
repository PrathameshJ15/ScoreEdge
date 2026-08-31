import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { PYQIntelligencePreview } from '@/components/landing/PYQIntelligencePreview';
import { ExamModeSimulator } from '@/components/landing/ExamModeSimulator';
import { NotesAndAnswersPreview } from '@/components/landing/NotesAndAnswersPreview';
import { AcademicHierarchyBrowser } from '@/components/landing/AcademicHierarchyBrowser';
import { QuizPreview } from '@/components/landing/QuizPreview';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { Footer } from '@/components/landing/Footer';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <PYQIntelligencePreview />
        <ExamModeSimulator />
        <NotesAndAnswersPreview />
        <AcademicHierarchyBrowser />
        <QuizPreview />
        <PricingSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
