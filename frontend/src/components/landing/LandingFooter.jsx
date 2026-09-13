import React from 'react';

export function LandingFooter({ onOpenDashboard }) {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer id="about" className="bg-white border-t border-slate-200/80 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Brand & Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-xs">
            P
          </div>
          <div>
            <span className="font-extrabold text-slate-900 text-sm tracking-tight block">
              Smart Parking
            </span>
            <span className="text-xs text-slate-500 block">
              ESP32 & IR sensor smart facility automation
            </span>
          </div>
        </div>

        {/* Center: Simple Navigation */}
        <div className="flex items-center gap-6 text-xs font-semibold text-slate-500">
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
        <div className="text-xs text-slate-400">
          IoT Engineering Project
        </div>
      </div>
    </footer>
  );
}
