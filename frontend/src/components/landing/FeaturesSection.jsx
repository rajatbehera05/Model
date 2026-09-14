import React from 'react';
import { motion } from 'framer-motion';
import { 
  Radar, 
  Sparkles, 
  BookmarkCheck, 
  DoorOpen, 
  Activity, 
  Cpu 
} from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      title: 'Real-time slot detection',
      desc: 'Sub-second optical IR sensors continuously detect vehicle occupancy across all facility bays.',
      icon: Radar
    },
    {
      title: 'Automatic slot assignment',
      desc: 'Instantly identifies and allocates the lowest available parking space to arriving vehicles.',
      icon: Sparkles
    },
    {
      title: 'Reservation',
      desc: 'Enables pre-arrival space reservation with dedicated bay hold and live status reservation flags.',
      icon: BookmarkCheck
    },
    {
      title: 'Automatic gate control',
      desc: 'Actuates the entry servo barrier gate synchronized with status LED signaling upon authorization.',
      icon: DoorOpen
    },
    {
      title: 'Live availability',
      desc: 'Real-time facility capacity tracking, occupancy metrics, and dynamic availability percentages.',
      icon: Activity
    },
    {
      title: 'ESP32 + IR sensor integration',
      desc: 'Direct hardware telemetry with stable debounce filtering, heartbeat monitoring, and fail-safe recovery.',
      icon: Cpu
    }
  ];

  return (
    <section id="features" className="py-8 sm:py-10 lg:py-14 relative overflow-hidden">
      {/* Background ambient shape */}
      <div className="absolute -bottom-10 -left-20 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-blue-100/30 via-indigo-50/15 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5 block">
            Core Capabilities
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            System Features
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4 sm:mb-5">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-2.5">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm md:text-[15px] text-slate-600 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
