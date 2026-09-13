import React from 'react';
import { motion } from 'framer-motion';

export function FloatingStatusPill() {
  const slots = [
    { id: 'P1', status: 'Available', dotColor: 'bg-emerald-500 ring-2 ring-emerald-400/30', textColor: 'text-emerald-700' },
    { id: 'P2', status: 'Occupied', dotColor: 'bg-rose-500 ring-2 ring-rose-400/30', textColor: 'text-rose-700' },
    { id: 'P3', status: 'Reserved', dotColor: 'bg-amber-500 ring-2 ring-amber-400/30', textColor: 'text-amber-700' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 shadow-lg shadow-slate-900/5 px-4 py-3 pointer-events-none select-none min-w-[150px]"
    >
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 border-b border-slate-100 pb-1 flex items-center justify-between">
        <span>Live Bays</span>
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
      </div>
      <div className="space-y-1.5">
        {slots.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 text-xs">
            <span className="font-mono font-black text-slate-800 tracking-tight">{item.id}</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${item.dotColor}`} />
              <span className="text-[11px] font-semibold text-slate-600">{item.status}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
