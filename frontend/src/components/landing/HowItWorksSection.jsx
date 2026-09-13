import React from 'react';
import { motion } from 'framer-motion';
import { Radio, BrainCircuit, ShieldCheck } from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      num: '01',
      title: 'Detect',
      desc: 'IR sensors detect whether each parking slot is occupied.',
      icon: Radio,
      accent: 'text-blue-600 bg-blue-50 border-blue-200'
    },
    {
      num: '02',
      title: 'Assign',
      desc: 'The system automatically identifies an available slot.',
      icon: BrainCircuit,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200'
    },
    {
      num: '03',
      title: 'Control',
      desc: 'ESP32 controls the entrance barrier and status LED.',
      icon: ShieldCheck,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200'
    }
  ];

  return (
    <section id="how-it-works" className="py-10 lg:py-14 relative bg-white/60 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-8 lg:mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5 block">
            Workflow Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-7">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="bg-white rounded-3xl p-8 sm:p-9 border border-slate-200/80 shadow-card hover:shadow-card-hover transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-4xl font-black text-slate-300">
                      {step.num}
                    </span>
                    <div className={`w-13 h-13 rounded-2xl border flex items-center justify-center ${step.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {step.desc}
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
