import React from 'react';
import { motion } from 'framer-motion';
import { Thermometer, Droplets, Sparkles, Cpu } from 'lucide-react';

/**
 * Evaluates ambient temperature and relative humidity to produce a friendly advisory message.
 * Follows IoT parking facility environmental guidelines.
 *
 * @param {number} temperature - Ambient temperature in Celsius
 * @param {number} humidity - Relative humidity percentage
 * @returns {string} Human-friendly advisory message
 */
export function getEnvironmentMessage(temperature, humidity) {
  if (temperature < 18) {
    return "It’s a little chilly today. Stay comfortable!";
  }
  if (temperature > 35) {
    return "It’s quite hot today. Stay hydrated and take care!";
  }
  if (humidity >= 70) {
    // If temperature is moderate (18°C to 30°C) but humidity is high
    if (temperature >= 18 && temperature <= 30) {
      return "It’s a humid day today. Stay comfortable!";
    }
    return "Humidity is high today. It may feel warmer than usual.";
  }
  if (temperature > 30 && humidity < 70) {
    return "It’s a warm day. Stay hydrated and have a great day!";
  }
  if (temperature >= 18 && temperature <= 30 && humidity < 70) {
    return "It’s a pleasant day. Have a great day!";
  }
  return "Optimal parking environment conditions.";
}

/**
 * Default mock sensor values.
 * Structured cleanly to allow direct drop-in replacement with live ESP32/DHT11 sensor stream.
 */
export const MOCK_ENVIRONMENT_DATA = {
  temperature: 28.4,
  humidity: 61,
  status: 'LIVE',
  sensorType: 'DHT11 Sensor'
};

/**
 * LiveEnvironmentSection Component
 *
 * Clean, compact, and polished IoT environmental monitoring card section
 * positioned naturally within the Smart Parking landing page.
 */
export function LiveEnvironmentSection({
  temperature = MOCK_ENVIRONMENT_DATA.temperature,
  humidity = MOCK_ENVIRONMENT_DATA.humidity,
  status = MOCK_ENVIRONMENT_DATA.status
}) {
  const dynamicMessage = getEnvironmentMessage(temperature, humidity);

  return (
    <section id="live-environment" className="py-8 sm:py-10 lg:py-14 relative overflow-hidden">
      {/* Subtle atmospheric ambient glow matching landing page aesthetic */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full bg-gradient-to-r from-blue-100/30 via-indigo-50/20 to-sky-100/25 blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5 block">
            LIVE ENVIRONMENT
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Parking conditions, at a glance.
          </h2>
          <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 leading-relaxed max-w-lg mx-auto">
            Real-time environmental monitoring for a more comfortable parking experience.
          </p>
        </div>

        {/* Polished Wide Environment-Monitoring Card */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all"
        >
          {/* Card Top Bar: Sensor Telemetry Metadata & LIVE Indicator */}
          <div className="flex items-center justify-between gap-3 pb-5 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
              <Cpu className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>IoT Environmental Telemetry</span>
            </div>

            {/* LIVE Status Badge */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="tracking-wide">{status}</span>
            </div>
          </div>

          {/* Sensor Values: 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* 1. Temperature Block */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Temperature
                </span>
                <div className="flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {temperature}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-500 ml-0.5">
                    °C
                  </span>
                </div>
              </div>

              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                <Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>

            {/* 2. Humidity Block */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.18 }}
              className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Humidity
                </span>
                <div className="flex items-baseline">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                    {humidity}
                  </span>
                  <span className="text-xl sm:text-2xl font-bold text-slate-500 ml-0.5">
                    %
                  </span>
                </div>
              </div>

              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center text-cyan-600 shrink-0">
                <Droplets className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </motion.div>
          </div>

          {/* Dynamic Environment Message */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="mt-4 sm:mt-5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-blue-50/50 border border-blue-100/70 flex items-center gap-2.5 text-slate-700 text-xs sm:text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <p className="leading-snug">{dynamicMessage}</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
