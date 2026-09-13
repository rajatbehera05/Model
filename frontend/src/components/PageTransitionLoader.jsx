import React from 'react';

/**
 * Circular Form Loading Animation
 * Matches the exact design: smooth white circular ring with a 90-degree violet/purple arc,
 * rotating smoothly on a sleek dark backdrop.
 */
export function PageTransitionLoader({ targetTab }) {
  const getTabLabel = (tab) => {
    switch (tab) {
      case 'parking':
      case 'slots':
        return 'Parking';
      case 'operations':
        return 'Operations';
      case 'dashboard':
        return 'Dashboard';
      default:
        return 'Page';
    }
  };

  const label = getTabLabel(targetTab);

  return (
    <div className="w-full min-h-[480px] flex flex-col items-center justify-center py-16 px-4 select-none animate-in fade-in duration-200">
      {/* Clean modern light card matching application theme */}
      <div className="bg-white rounded-[24px] px-10 py-9 flex flex-col items-center justify-center shadow-card border border-[#E2E8F0] max-w-[260px] w-full">
        {/* Modern Circular Form Spinner */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <svg
            className="w-full h-full animate-spin"
            viewBox="0 0 100 100"
            fill="none"
            style={{ animationDuration: '0.85s', animationTimingFunction: 'linear' }}
          >
            {/* Pale Blue Circular Track */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#EFF6FF"
              strokeWidth="7"
              fill="none"
            />
            {/* Vibrant Modern Blue Arc */}
            <circle
              cx="50"
              cy="50"
              r="38"
              stroke="#2563EB"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray="59.7 179.1"
              strokeDashoffset="0"
              fill="none"
            />
          </svg>
        </div>

        {/* Minimalist Loading Caption */}
        <div className="mt-4 flex items-center gap-1.5 text-xs font-mono font-bold text-[#64748B] tracking-wider uppercase">
          <span>Loading</span>
          <span className="text-[#0F172A]">{label}</span>
          <span className="inline-flex">...</span>
        </div>
      </div>
    </div>
  );
}
