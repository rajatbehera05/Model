import React from 'react';
import { motion } from 'framer-motion';
import { DoorClosed, DoorOpen, Compass, BookmarkCheck, AlertTriangle, Lightbulb } from 'lucide-react';

export function AvailabilityAndGate({ metrics, gate, led, onFindParking, onReserveSlot, actionLoading, assignmentResult }) {
  const percent = metrics?.availabilityPercent ?? 0;
  const available = metrics?.available ?? 0;
  const isGateOpen = gate?.state === 'Open';
  const isLedOn = led?.on ?? false;

  // Visual status text
  let capacityText = 'Optimal Capacity';
  let badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let barColor = 'bg-emerald-500';

  if (percent === 0) {
    capacityText = 'Parking Full';
    badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
    barColor = 'bg-rose-500';
  } else if (percent <= 33) {
    capacityText = 'Limited Space';
    badgeColor = 'bg-amber-50 text-amber-700 border-amber-200';
    barColor = 'bg-amber-500';
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
      {/* 1. Availability Highlight Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Live Capacity
            </span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
              {capacityText}
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-2">
            <motion.span
              key={percent}
              initial={{ opacity: 0.5, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-black text-slate-900 tracking-tight"
            >
              {percent}%
            </motion.span>
            <span className="text-xs font-medium text-slate-500">
              availability rate ({available}/3 free)
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 w-full h-3 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${percent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Calculated dynamically: <span className="font-mono text-slate-600">Available / 3 × 100</span>
        </p>
      </div>

      {/* 2. Entrance Barrier & Master LED Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Entrance Controls
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              SG90 Servo • LED
            </span>
          </div>

          {/* Gate status row */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
            <div className={`p-2.5 rounded-lg ${isGateOpen ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'}`}>
              {isGateOpen ? <DoorOpen className="w-5 h-5" /> : <DoorClosed className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">Entrance Barrier</div>
              <div className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                {isGateOpen ? (
                  <span className="text-emerald-600">Gate Open (90°)</span>
                ) : (
                  <span>Gate Closed (0°)</span>
                )}
              </div>
            </div>
          </div>

          {/* Master LED row */}
          <div className="mt-2.5 flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-xs">
            <div className="flex items-center gap-2">
              <Lightbulb className={`w-4 h-4 ${isLedOn ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span className="font-medium text-slate-600">Entrance Traffic LED:</span>
            </div>
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${isLedOn ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
              {isLedOn ? 'ON (Open)' : 'OFF (Full)'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 mt-3">
          Software barrier command state based on lot capacity.
        </p>
      </div>

      {/* 3. Quick Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-3">
            Quick Actions
          </span>

          <div className="space-y-2.5">
            {/* Primary Action: Find Parking */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onFindParking}
              disabled={actionLoading || available === 0}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all ${
                available === 0
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{actionLoading ? 'Assigning...' : 'Find Parking'}</span>
            </motion.button>

            {/* Secondary Action: Reserve Slot */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={onReserveSlot}
              disabled={actionLoading || available === 0}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <BookmarkCheck className="w-4 h-4 text-blue-600" />
              <span>Reserve Slot</span>
            </motion.button>
          </div>
        </div>

        {/* Assignment Result Card if available */}
        {assignmentResult && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-3 p-2.5 rounded-lg border text-xs font-medium ${
              assignmentResult.success
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-rose-50 text-rose-800 border-rose-200'
            }`}
          >
            {assignmentResult.message}
          </motion.div>
        )}

        {!assignmentResult && (
          <p className="text-[11px] text-slate-400 mt-3">
            Deterministic auto-routing picks the lowest free bay (P1 → P3).
          </p>
        )}
      </div>
    </div>
  );
}
