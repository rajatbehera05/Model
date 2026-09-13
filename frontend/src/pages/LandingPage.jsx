import React from 'react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { FinalCtaSection } from '../components/landing/FinalCtaSection';
import { LandingFooter } from '../components/landing/LandingFooter';
import { DigitalSignalBackground } from '../components/landing/DigitalSignalBackground';

export function LandingPage({ onOpenDashboard }) {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      {/* Subtle Atmospheric Background Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-1/4 w-[750px] h-[750px] rounded-full bg-gradient-to-br from-blue-100/35 via-indigo-50/20 to-transparent blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-indigo-100/25 via-blue-50/15 to-transparent blur-3xl" />
        <div className="absolute bottom-10 right-10 w-[600px] h-[600px] rounded-full bg-gradient-to-t from-sky-100/25 via-purple-50/15 to-transparent blur-3xl" />
      </div>

      {/* Live Digital Signal Flow Background Layer */}
      <DigitalSignalBackground />

      {/* 1. Minimal Header */}
      <LandingNavbar onOpenDashboard={onOpenDashboard} />

      {/* 2. Hero Section (Headline + Clean Video) */}
      <HeroSection onOpenDashboard={onOpenDashboard} />

      {/* 3. Core Features ("System Features" directly under Hero as in screenshot) */}
      <FeaturesSection />

      {/* 4. How It Works */}
      <HowItWorksSection />

      {/* 5. Final CTA */}
      <FinalCtaSection onOpenDashboard={onOpenDashboard} />

      {/* 6. Minimal Footer */}
      <LandingFooter onOpenDashboard={onOpenDashboard} />
    </div>
  );
}
