import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { FeatureCards } from '@/components/landing/FeatureCards';
import { StudyMaterialSection } from '@/components/landing/StudyMaterialSection';
import { StatisticsSection } from '@/components/landing/StatisticsSection';
import { PopularSubjects } from '@/components/landing/PopularSubjects';
import { VoiceTutorSection } from '@/components/landing/VoiceTutorSection';
import { WhyScoreEdge } from '@/components/landing/WhyScoreEdge';
import { PYQIntelligencePreview } from '@/components/landing/PYQIntelligencePreview';
import { ExamModeSimulator } from '@/components/landing/ExamModeSimulator';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';
import { Footer } from '@/components/landing/Footer';
import { TrackPageView } from '@/components/analytics/TrackPageView';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f5] dark:bg-slate-950">
      <TrackPageView eventType="visitor" properties={{ page: 'landing' }} />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <FeatureCards />
        <StudyMaterialSection />
        <StatisticsSection />
        <PopularSubjects />
        <VoiceTutorSection />
        <WhyScoreEdge />
        <PYQIntelligencePreview />
        <ExamModeSimulator />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}


