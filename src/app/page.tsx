import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import { CoreCapabilities } from '@/components/landing/CoreCapabilities';
import { PYQIntelligenceSection } from '@/components/landing/PYQIntelligenceSection';
import { ExamModeSection } from '@/components/landing/ExamModeSection';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { AboutSection } from '@/components/landing/AboutSection';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { TrackPageView } from '@/components/analytics/TrackPageView';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#faf9f5] dark:bg-[#070d18]">
      <TrackPageView eventType="visitor" properties={{ page: 'landing' }} />
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <CoreCapabilities />
        <PYQIntelligenceSection />
        <ExamModeSection />
        <HowItWorks />
        <AboutSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}



