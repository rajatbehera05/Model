import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  CheckCircle2, 
  ShieldCheck, 
  Car, 
  DoorOpen, 
  DoorClosed, 
  Sparkles, 
  AlertCircle,
  Clock,
  ArrowRight,
  Info
} from 'lucide-react';
import { RealisticSlotCar } from '../components/RealisticSlotCar';
import { VehicleDetailsModal } from '../components/VehicleDetailsModal';
import { assignParkingSlot, reserveParkingSlot } from '../api/parkingApi';

export function ParkingPage({ data, apiError, onRefreshData }) {
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedCarSlot, setSelectedCarSlot] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [highlightedAssignedSlot, setHighlightedAssignedSlot] = useState(null);

  const slots = data?.slots || { P1: 'Available', P2: 'Available', P3: 'Available' };
  const metrics = data?.metrics || { total: 3, available: 3, reserved: 0, occupied: 0, availabilityPercent: 100 };
  const gate = data?.gate || { state: 'Closed' };
  const slotDetails = data?.slotDetails || [];

  const isGateOpen = gate?.state === 'Open';
  const availableCount = metrics?.available ?? 0;
  const isLotFull = availableCount === 0;

  const slotList = [
    { id: 'P1', status: slots.P1 || 'Available' },
    { id: 'P2', status: slots.P2 || 'Available' },
    { id: 'P3', status: slots.P3 || 'Available' },
  ];

  // Helper to get slot styling based on status and selection
  const getSlotVisuals = (slotId, status) => {
    const isSelected = selectedSlot === slotId;
    const isAssigned = highlightedAssignedSlot === slotId;

    if (status === 'Occupied') {
      return {
        cardBg: 'bg-[#FEF2F2] border-2 border-[#EF4444]',
        badgeBg: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]',
        badgeText: 'OCCUPIED',
        dotBg: 'bg-[#EF4444]',
        subtext: 'Vehicle parked inside bay',
        canSelect: false
      };
    }

    if (status === 'Reserved') {
      return {
        cardBg: isAssigned 
          ? 'bg-[#FFFBEB] border-3 border-[#F59E0B] ring-4 ring-[#F59E0B]/20' 
          : 'bg-[#FFFBEB] border-2 border-[#F59E0B]',
        badgeBg: 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]',
        badgeText: 'RESERVED',
        dotBg: 'bg-[#F59E0B]',
        subtext: 'Awaiting arrival',
        canSelect: false
      };
    }

    // Available
    return {
      cardBg: isSelected
        ? 'bg-[#EFF6FF] border-3 border-[#2563EB] ring-4 ring-[#2563EB]/25 shadow-md'
        : 'bg-[#ECFDF5] border-2 border-[#10B981] hover:border-[#059669] cursor-pointer shadow-xs',
      badgeBg: 'bg-[#D1FAE5] text-[#065F46] border border-[#86EFAC]',
      badgeText: 'AVAILABLE',
      dotBg: 'bg-[#10B981]',
      subtext: 'Ready for reservation',
      canSelect: true
    };
  };

  // 1. Action: Automatic Find & Assign Parking
  const handleFindParking = async () => {
    if (isLotFull || actionLoading) return;

    setActionLoading(true);
    setErrorMessage(null);
    setActionResult(null);

    try {
      const res = await assignParkingSlot();
      if (res.ok && res.data.success) {
        const assignedId = res.data.assignedSlot;
        setHighlightedAssignedSlot(assignedId);
        setSelectedSlot(null);
        setActionResult({
          type: 'ASSIGNMENT',
          slotId: assignedId,
          title: 'Parking Assigned',
          message: `Your parking space is ${assignedId}. The space has been reserved for you.`,
          gateState: res.data.gateState || gate.state
        });

        // Trigger parent state reload
        if (onRefreshData) onRefreshData();

        // Auto-clear highlight badge after 8 seconds
        setTimeout(() => setHighlightedAssignedSlot(null), 8000);
      } else {
        setErrorMessage(res.data.message || 'Parking Full. No available bays at this moment.');
      }
    } catch (err) {
      setErrorMessage('Unable to connect to parking server. Please retry.');
    } finally {
      setActionLoading(false);
    }
  };

  // 2. Action: Reserve specific selected slot
  const handleReserveSpecificSlot = async () => {
    if (!selectedSlot || actionLoading) return;

    setActionLoading(true);
    setErrorMessage(null);
    setActionResult(null);

    try {
      const res = await reserveParkingSlot(selectedSlot);
      if (res.ok && res.data.success) {
        const slotReserved = selectedSlot;
        setActionResult({
          type: 'RESERVATION',
          slotId: slotReserved,
          title: 'Reservation Confirmed',
          message: `Space ${slotReserved} has been locked for your vehicle arrival.`,
          gateState: res.data.gateState || gate.state
        });
        setSelectedSlot(null);

        // Trigger parent state reload
        if (onRefreshData) onRefreshData();
      } else {
        setErrorMessage(res.data.message || `Slot ${selectedSlot} is no longer available.`);
      }
    } catch (err) {
      setErrorMessage('Network error while reserving slot.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Backend Unreachable Alert Banner */}
      {apiError && (
        <div className="p-3.5 rounded-[14px] bg-[#FEF2F2] border-[1.5px] border-[#EF4444] text-[#991B1B] text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Unable to connect to parking server. Reconnecting automatically...</span>
        </div>
      )}

      {/* 2-COLUMN RESPONSIVE LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN (~65% width): LIVE PARKING SLOT SELECTION */}
        <motion.div 
          whileHover={{ y: -3, boxShadow: '0 16px 32px -6px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="lg:col-span-8 bg-white rounded-[18px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card space-y-5 transition-colors hover:border-[#3B82F6]/50"
        >
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                  Parking Slot Selection
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                  Interactive Allocation
                </span>
              </div>
              <p className="text-xs font-semibold text-[#64748B] mt-0.5">
                Click any Available space to select it for specific reservation
              </p>
            </div>

            {/* Quick Status Legend */}
            <div className="flex items-center gap-3 text-xs font-bold text-[#0F172A] bg-[#F8FAFC] px-3.5 py-1.5 rounded-[12px] border border-[#E2E8F0] self-start sm:self-auto shadow-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span>Available</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span>Reserved</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
                <span>Occupied</span>
              </span>
            </div>
          </div>

          {/* 3 Parking Bays Floor Grid */}
          <div className="rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] p-4 sm:p-6 parking-pavement shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
              {slotList.map((slot) => {
                const visual = getSlotVisuals(slot.id, slot.status);
                const isSelected = selectedSlot === slot.id;
                const isOccupied = slot.status === 'Occupied';
                const isReserved = slot.status === 'Reserved';
                const isAvailable = slot.status === 'Available';
                const isHighlighted = highlightedAssignedSlot === slot.id;
                const detail = slotDetails.find(s => s.id === slot.id);

                return (
                  <motion.div
                    key={slot.id}
                    whileHover={{ y: -6, scale: 1.018, boxShadow: '0 16px 32px -8px rgba(15,23,42,0.14)' }}
                    transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                    onClick={() => {
                      if (isOccupied) {
                        setSelectedCarSlot({ slot, detail });
                      } else if (visual.canSelect) {
                        setSelectedSlot(selectedSlot === slot.id ? null : slot.id);
                        setErrorMessage(null);
                      }
                    }}
                    className={`relative rounded-[16px] p-5 flex flex-col justify-between min-h-[310px] transition-all select-none ${visual.cardBg} cursor-pointer`}
                  >
                    {/* Assigned Banner Animation */}
                    <AnimatePresence>
                      {isHighlighted && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          className="absolute -top-3 inset-x-4 z-20 py-1 px-2 rounded-full bg-[#2563EB] text-white text-[10px] font-black tracking-wider uppercase text-center shadow-md flex items-center justify-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-[#FEF3C7]" />
                          <span>ASSIGNED TO YOU</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Bay Top Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-[10px] bg-white text-[#0F172A] font-black text-sm flex items-center justify-center border border-[#E2E8F0] shadow-xs">
                          {slot.id}
                        </span>
                        <span className="text-xs font-black text-[#0F172A]">
                          Bay {slot.id}
                        </span>
                      </div>

                      {/* Status Badge & Car Details Button */}
                      <div className="flex items-center gap-1.5">
                        {isOccupied && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCarSlot({ slot, detail });
                            }}
                            title="Click to view full vehicle details"
                            className="p-1 rounded-md bg-white hover:bg-slate-100 text-[#DC2626] border border-[#FCA5A5] shadow-xs cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                          >
                            <Info className="w-3 h-3" />
                            <span className="hidden sm:inline">Details</span>
                          </button>
                        )}
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs ${visual.badgeBg}`}>
                          <span className={`w-2 h-2 rounded-full ${visual.dotBg}`} />
                          <span>{visual.badgeText}</span>
                        </span>
                      </div>
                    </div>

                    {/* Bay Interior */}
                    <div className="relative my-3 flex-1 flex flex-col items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isOccupied ? (
                          <div key={`car-${slot.id}`} className="relative z-10 flex flex-col items-center">
                            <RealisticSlotCar 
                              slotId={slot.id} 
                              plateNumber={detail?.plateNumber}
                              parkedAt={detail?.parkedAt || detail?.lastUpdated}
                            />
                          </div>
                        ) : isReserved ? (
                          <motion.div
                            key={`res-${slot.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col items-center text-center p-4"
                          >
                            <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#F59E0B] flex items-center justify-center text-[#F59E0B] shadow-sm mb-2">
                              <ShieldCheck className="w-7 h-7" />
                            </div>
                            <span className="text-xs font-extrabold text-[#92400E]">RESERVED</span>
                            <span className="text-[11px] text-[#64748B] font-semibold mt-0.5">Awaiting arrival</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={`avail-${slot.id}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center text-center p-4"
                          >
                            <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shadow-sm mb-2 transition-all ${
                              isSelected
                                ? 'bg-[#2563EB] text-white border-[#1D4ED8] scale-105'
                                : 'bg-white text-[#10B981] border-[#10B981]'
                            }`}>
                              <CheckCircle2 className="w-7 h-7" />
                            </div>
                            <span className={`text-xs font-black ${isSelected ? 'text-[#2563EB]' : 'text-[#065F46]'}`}>
                              {isSelected ? '✓ Space Selected' : 'P' + slot.id.slice(1) + ' AVAILABLE'}
                            </span>
                            <span className={`text-[11px] font-bold mt-0.5 ${isSelected ? 'text-[#2563EB]' : 'text-[#059669]'}`}>
                              {isSelected ? 'Click Reserve on Right' : 'Ready for reservation'}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Bay Footer */}
                    <div className="pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B] font-semibold">
                      <span>{visual.subtext}</span>
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isSelected 
                          ? 'bg-[#2563EB] text-white border-[#1D4ED8]' 
                          : 'bg-white text-[#0F172A] border border-[#E2E8F0]'
                      }`}>
                        {isSelected ? 'SELECTED' : slot.status}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN (~35% width): PARKING ACTION PANEL */}
        <motion.div 
          whileHover={{ y: -3, boxShadow: '0 16px 32px -6px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="lg:col-span-4 bg-white rounded-[18px] border border-[#E2E8F0] p-5 sm:p-6 shadow-card space-y-5 transition-colors hover:border-[#3B82F6]/50"
        >
          {/* Action Header */}
          <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Parking Actions
              </h3>
              <p className="text-xs font-semibold text-[#64748B] mt-0.5">
                Allocate or reserve a space
              </p>
            </div>
            <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full border ${
              isLotFull
                ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]'
                : 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
            }`}>
              {isLotFull ? 'PARKING FULL' : `${availableCount} FREE`}
            </span>
          </div>

          {/* ACTION 1: FIND PARKING (AUTOMATIC ALLOCATION) */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="rounded-[16px] bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Automatic Assignment
              </span>
              <span className="text-[10px] font-bold text-[#64748B]">
                Lowest-indexed bay
              </span>
            </div>
            <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
              Instantly reserves the closest available slot automatically via backend assignment algorithm.
            </p>

            <motion.button
              whileHover={{ y: isLotFull ? 0 : -2, scale: isLotFull ? 1 : 1.015, boxShadow: '0 8px 20px -4px rgba(37,99,235,0.35)' }}
              whileTap={{ scale: isLotFull ? 1 : 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleFindParking}
              disabled={isLotFull || actionLoading}
              className={`w-full py-3.5 px-4 rounded-[12px] font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border shadow-sm transition-all ${
                isLotFull
                  ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-[#1D4ED8] text-white cursor-pointer shadow-md'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{actionLoading ? 'Assigning Bay...' : isLotFull ? 'Parking Full' : 'Find Parking'}</span>
              {!isLotFull && <ArrowRight className="w-3.5 h-3.5 ml-0.5" />}
            </motion.button>
          </motion.div>

          {/* ACTION 2: SPECIFIC SLOT RESERVATION */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="rounded-[16px] bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Specific Reservation
              </span>
              <span className="text-[10px] font-bold text-[#64748B]">
                Pick your bay
              </span>
            </div>

            {/* Quick Space Select Buttons [P1] [P2] [P3] */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] block">
                Select Parking Space:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {slotList.map((slot) => {
                  const isAvailable = slot.status === 'Available';
                  const isSelected = selectedSlot === slot.id;

                  return (
                    <motion.button
                      key={`picker-${slot.id}`}
                      whileHover={isAvailable ? { scale: 1.04, y: -2, boxShadow: '0 6px 14px -3px rgba(15,23,42,0.1)' } : {}}
                      whileTap={isAvailable ? { scale: 0.96 } : {}}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      disabled={!isAvailable || actionLoading}
                      onClick={() => {
                        setSelectedSlot(isSelected ? null : slot.id);
                        setErrorMessage(null);
                      }}
                      className={`py-2 rounded-[10px] text-xs font-black transition-all border ${
                        isSelected
                          ? 'bg-[#2563EB] text-white border-[#1D4ED8] shadow-xs'
                          : isAvailable
                          ? 'bg-white text-[#0F172A] border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#EFF6FF] cursor-pointer'
                          : 'bg-[#F1F5F9] text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.id} {isAvailable ? '' : `(${slot.status[0]})`}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Confirm Specific Slot Reservation Button */}
            <motion.button
              whileHover={{ y: (!selectedSlot || actionLoading) ? 0 : -2, scale: (!selectedSlot || actionLoading) ? 1 : 1.015 }}
              whileTap={{ scale: (!selectedSlot || actionLoading) ? 1 : 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleReserveSpecificSlot}
              disabled={!selectedSlot || actionLoading}
              className={`w-full py-2.5 px-4 rounded-[12px] font-bold text-xs sm:text-sm border-2 transition-all flex items-center justify-center gap-2 shadow-xs ${
                !selectedSlot
                  ? 'border-[#E2E8F0] text-[#94A3B8] bg-[#F8FAFC] cursor-not-allowed'
                  : 'border-[#2563EB] text-[#2563EB] bg-white hover:bg-[#EFF6FF] cursor-pointer'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              <span>
                {actionLoading 
                  ? 'Reserving...' 
                  : selectedSlot 
                  ? `Reserve Selected Slot (${selectedSlot})` 
                  : 'Select an Available Slot Above'}
              </span>
            </motion.button>
          </motion.div>

          {/* ACTION FEEDBACK RESULTS */}
          <AnimatePresence>
            {actionResult && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="p-4 rounded-[14px] bg-[#ECFDF5] border-2 border-[#10B981] text-[#065F46] space-y-1 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs sm:text-sm flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                    {actionResult.title}
                  </span>
                  <span className="font-mono text-[10px] font-black bg-[#10B981] text-white px-2 py-0.5 rounded">
                    {actionResult.slotId}
                  </span>
                </div>
                <p className="text-xs font-semibold leading-relaxed pt-1">
                  {actionResult.message}
                </p>
              </motion.div>
            )}

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                className="p-3.5 rounded-[14px] bg-[#FEF2F2] border-2 border-[#EF4444] text-[#991B1B] text-xs font-bold flex items-center gap-2 shadow-xs"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CURRENT PARKING SUMMARY & ENTRY GATE */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="rounded-[16px] bg-[#F8FAFC] p-4 border border-[#E2E8F0] space-y-3 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider">
                Current Parking Summary
              </span>
              <span className="text-xs font-bold text-[#10B981]">
                {metrics?.availabilityPercent ?? 0}% Available
              </span>
            </div>

            {/* Compact Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-2 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs cursor-default"
              >
                <span className="text-[10px] font-bold text-[#64748B] block">Available</span>
                <span className="text-base font-black text-[#10B981] mt-0.5 block">{metrics?.available ?? 0}</span>
              </motion.div>
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-2 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs cursor-default"
              >
                <span className="text-[10px] font-bold text-[#64748B] block">Reserved</span>
                <span className="text-base font-black text-[#F59E0B] mt-0.5 block">{metrics?.reserved ?? 0}</span>
              </motion.div>
              <motion.div 
                whileHover={{ y: -2, scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className="p-2 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs cursor-default"
              >
                <span className="text-[10px] font-bold text-[#64748B] block">Occupied</span>
                <span className="text-base font-black text-[#EF4444] mt-0.5 block">{metrics?.occupied ?? 0}</span>
              </motion.div>
            </div>

            {/* Entry Gate Status Row */}
            <div className="pt-2 border-t border-[#E2E8F0] flex items-center justify-between text-xs font-bold text-[#0F172A]">
              <div className="flex items-center gap-1.5">
                {isGateOpen ? (
                  <DoorOpen className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <DoorClosed className="w-4 h-4 text-[#64748B]" />
                )}
                <span>Entry Gate:</span>
              </div>
              <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded border ${
                isGateOpen ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' : 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]'
              }`}>
                {isGateOpen ? 'GATE: OPEN' : 'GATE: CLOSED'}
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Vehicle Details Card Modal */}
      <VehicleDetailsModal
        isOpen={Boolean(selectedCarSlot)}
        onClose={() => setSelectedCarSlot(null)}
        slot={selectedCarSlot?.slot}
        detail={selectedCarSlot?.detail}
      />
    </div>
  );
}
