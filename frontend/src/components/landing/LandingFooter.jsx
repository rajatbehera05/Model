import React from 'react';

export function LandingFooter({ onOpenDashboard }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="about" className="bg-white border-t border-slate-200/80 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-center md:text-left">
        {/* Left: Brand & Info */}
        <div className="flex items-center gap-2.5 sm:gap-3 justify-center md:justify-start">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-xs shrink-0">
            P
          </div>
          <div className="text-left">
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block leading-tight">
              Smart Parking
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 block">
              ESP32 & IR sensor smart facility automation
            </span>
          </div>
        </div>

        {/* Center: Simple Navigation */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs font-semibold text-slate-500">
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('features')}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={onOpenDashboard}
            className="hover:text-blue-600 transition-colors cursor-pointer"
          >
            Live Dashboard
          </button>
        </div>

        {/* Right: Project Note */}
        <div className="text-xs text-slate-400 text-center md:text-right">
          IoT Engineering Project
        </div>
      </div>
    </footer>
  );
}
