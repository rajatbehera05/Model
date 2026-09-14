import React from 'react';
import { motion } from 'framer-motion';
import { Compass, BookmarkCheck, DoorOpen, DoorClosed, Lightbulb, Play } from 'lucide-react';

export function ParkingOverviewPanel({
  metrics,
  gate,
  led,
  onFindParking,
  onReserveSlot,
  onTriggerGate,
  actionLoading,
  assignmentResult
}) {
  const percent = metrics?.availabilityPercent ?? 0;
  const available = metrics?.available ?? 0;
  const total = metrics?.total ?? 3;

  const isGateOpen = gate?.state === 'Open';
  const isLedOn = led?.on ?? false;

  return (
    <div className="bg-white rounded-[16px] sm:rounded-[18px] border border-[#E2E8F0] p-4 sm:p-6 shadow-card flex flex-col justify-between space-y-4 sm:space-y-5">
      {/* Title */}
      <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Capacity & Controls
          </h3>
          <p className="text-xs text-[#64748B] font-semibold mt-0.5">
            Automated allocation engine
          </p>
        </div>
        <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full border ${
          percent === 0
            ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]'
            : percent <= 33
            ? 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]'
            : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
        }`}>
          {percent === 0 ? 'FULL' : percent <= 33 ? 'LIMITED' : 'OPTIMAL'}
        </span>
      </div>

      {/* Hero Availability Rate Display */}
      <motion.div
        whileHover={{ y: -3, scale: 1.01, boxShadow: '0 10px 24px -4px rgba(15,23,42,0.08)' }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="rounded-[14px] sm:rounded-[16px] bg-[#F8FAFC] p-4 sm:p-5 border border-[#E2E8F0] text-center shadow-xs cursor-default"
      >
        <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider block">
          Current Availability
        </span>

        <motion.div
          key={percent}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="my-1.5 sm:my-2"
        >
          <span className="text-4xl sm:text-5xl font-black text-[#0F172A] tracking-tight">
            {percent}%
          </span>
        </motion.div>

        <p className="text-xs text-[#64748B] font-semibold">
          <strong className="text-[#10B981] font-black">{available}</strong> of {total} parking bays free
        </p>

        {/* Clean Progress Bar */}
        <div className="mt-3.5 sm:mt-4 w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden border border-[#CBD5E1]/40">
          <motion.div
            className={`h-full rounded-full transition-all ${
              percent === 0 ? 'bg-[#EF4444]' : percent <= 33 ? 'bg-[#F59E0B]' : 'bg-[#2563EB]'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </motion.div>

      {/* Entrance Controls: Gate & LED Status */}
      <div className="space-y-2 text-xs">
        {/* Entrance Gate */}
        <motion.div
          whileHover={{ y: -2, boxShadow: '0 6px 16px -3px rgba(15,23,42,0.06)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs cursor-default gap-2"
        >
          <div className="flex items-center gap-2 text-[#0F172A]">
            {isGateOpen ? (
              <DoorOpen className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : (
              <DoorClosed className="w-4 h-4 text-[#64748B] shrink-0" />
            )}
            <span className="font-bold">Entrance Barrier:</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border ${
              isGateOpen ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' : 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]'
            }`}>
              {isGateOpen ? 'OPEN (90°)' : 'CLOSED (0°)'}
            </span>
            {onTriggerGate && (
              <button
                onClick={onTriggerGate}
                disabled={available === 0 || isGateOpen}
                title="Test cycle barrier (3s)"
                className="p-1.5 rounded bg-white hover:bg-[#EFF6FF] border border-[#E2E8F0] text-[#0F172A] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <Play className="w-3 h-3 text-[#2563EB]" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Master LED */}
        <motion.div
          whileHover={{ y: -2, boxShadow: '0 6px 16px -3px rgba(15,23,42,0.06)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="flex flex-wrap sm:flex-nowrap items-center justify-between p-3 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] shadow-xs cursor-default gap-2"
        >
          <div className="flex items-center gap-2 text-[#0F172A]">
            <Lightbulb className={`w-4 h-4 shrink-0 ${isLedOn ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
            <span className="font-bold">Master Status LED:</span>
          </div>
          <span className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border shrink-0 ${
            isLedOn ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' : 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]'
          }`}>
            {isLedOn ? 'ON (SPACES FREE)' : 'OFF (LOT FULL)'}
          </span>
        </motion.div>
      </div>

      {/* Primary & Secondary Action Buttons */}
      <div className="space-y-2.5 pt-1">
        {/* Primary Button: Modern Smart Blue */}
        <motion.button
          whileHover={{ y: -2, scale: 1.015, boxShadow: '0 8px 20px -4px rgba(37,99,235,0.35)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={onFindParking}
          disabled={actionLoading || available === 0}
          className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-[12px] font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border shadow-sm transition-all ${
            available === 0
              ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-[#1D4ED8] text-white cursor-pointer shadow-md'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span>{actionLoading ? 'Allocating Bay...' : 'Find & Assign Parking'}</span>
        </motion.button>

        {/* Secondary Button: White with Modern Blue border/text */}
        <motion.button
          whileHover={{ y: -2, scale: 1.015, boxShadow: '0 6px 16px -3px rgba(15,23,42,0.08)' }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={onReserveSlot}
          disabled={actionLoading || available === 0}
          className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-[12px] font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-center gap-2 shadow-xs ${
            available === 0
              ? 'border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed bg-[#F8FAFC]'
              : 'border-[#2563EB] text-[#2563EB] hover:bg-[#EFF6FF] bg-white cursor-pointer'
          }`}
        >
          <BookmarkCheck className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>Reserve Specific Bay</span>
        </motion.button>
      </div>

      {/* Assignment Feedback Banner */}
      {assignmentResult && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-[12px] border text-xs font-bold text-center ${
            assignmentResult.success
              ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
              : 'bg-[#FEF2F2] border-[#FCA5A5] text-[#EF4444]'
          }`}
        >
          {assignmentResult.message}
        </motion.div>
      )}
    </div>
  );
}
