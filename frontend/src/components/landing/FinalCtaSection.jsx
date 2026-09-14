import React from 'react';
import { motion } from 'framer-motion';

export function FinalCtaSection({ onOpenDashboard }) {
  return (
    <section className="py-10 lg:py-14 relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl sm:rounded-3xl bg-gradient-to-b from-blue-50/70 via-indigo-50/40 to-white border border-blue-200/60 p-6 sm:p-12 text-center shadow-xl shadow-blue-500/5 overflow-hidden"
        >
          {/* Subtle decorative glow circle */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              See your parking system in action.
            </h2>
            <p className="text-sm sm:text-base text-slate-600 font-normal">
              Experience real-time hardware telemetry, automatic bay allocation, and intelligent barrier control.
            </p>
            <div className="pt-2 w-full sm:w-auto flex justify-center">
              <button
                onClick={onOpenDashboard}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm tracking-tight shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <span>Open Dashboard</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
