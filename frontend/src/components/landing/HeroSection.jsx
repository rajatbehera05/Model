import React, { useRef } from 'react';
import { motion } from 'framer-motion';

export function HeroSection({ onOpenDashboard }) {
  const videoRef = useRef(null);

  return (
    <section className="relative overflow-hidden pt-3 pb-6 lg:pt-5 lg:pb-8">
      {/* Subtle atmospheric ambient glow */}
      <div className="absolute top-1/2 right-[10%] -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-gradient-to-br from-blue-100/40 via-indigo-50/20 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-6 left-[5%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-sky-100/30 via-blue-50/15 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
          {/* LEFT: Headline, description, pill CTA */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col justify-center space-y-5 text-left z-10 relative"
          >
            {/* Subtle soft backdrop shade behind the hero text block */}
            <div className="absolute -inset-x-4 sm:-inset-x-8 -inset-y-6 sm:-inset-y-8 rounded-3xl bg-gradient-to-br from-blue-100/45 via-slate-100/35 to-transparent blur-2xl -z-10 pointer-events-none" />

            {/* IoT Badge */}
            <div className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs font-semibold w-fit shadow-sm shadow-blue-900/5 backdrop-blur-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>IoT-Powered Smart Parking</span>
            </div>

            {/* Headline with clear word text-shadow for depth */}
            <h1 className="text-3xl sm:text-5xl lg:text-[56px] xl:text-[62px] font-black tracking-tight leading-[1.1] sm:leading-[1.06] break-words">
              <span
                className="text-slate-900"
                style={{ textShadow: '0 3px 10px rgba(15, 23, 42, 0.22), 0 1px 2px rgba(15, 23, 42, 0.15)' }}
              >
                Smarter Parking.
              </span>
              <br />
              <span
                className="text-blue-600"
                style={{ textShadow: '0 4px 16px rgba(37, 99, 235, 0.4), 0 1px 3px rgba(29, 78, 216, 0.25)' }}
              >
                Real-Time Control.
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal max-w-lg"
              style={{ textShadow: '0 1px 2px rgba(15, 23, 42, 0.08)' }}
            >
              Detect parking occupancy, assign available slots and control entry automatically with an ESP32-powered smart parking system.
            </p>

            {/* Primary Pill Button with enhanced depth shadow */}
            <div className="pt-1 w-full sm:w-auto">
              <button
                onClick={onOpenDashboard}
                className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm sm:text-base tracking-tight shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all cursor-pointer group"
              >
                <span>Open Dashboard</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* RIGHT: Dominant video frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 relative w-full"
          >
            <div className="relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-2xl shadow-slate-900/10">
              <video
                ref={videoRef}
                src="/video/video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
