import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ShieldCheck, DoorOpen, DoorClosed, ArrowDown, Car, Info } from 'lucide-react';

import { RealisticSlotCar } from './RealisticSlotCar';
import { VehicleDetailsModal } from './VehicleDetailsModal';

export function LiveParkingMap({ slots, slotDetails, gate, onSlotClick }) {
  const [selectedCarSlot, setSelectedCarSlot] = useState(null);

  const slotList = [
    { id: 'P1', status: slots?.P1 || 'Available' },
    { id: 'P2', status: slots?.P2 || 'Available' },
    { id: 'P3', status: slots?.P3 || 'Available' },
  ];

  const isGateOpen = gate?.state === 'Open';

  const getSlotDetails = (status) => {
    switch (status) {
      case 'Occupied':
        return {
          cardBg: 'bg-[#FEF2F2] border-2 border-[#EF4444]',
          badgeBg: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]',
          badgeText: 'Occupied',
          dotBg: 'bg-[#EF4444]',
          subtext: 'Click car for full details'
        };
      case 'Reserved':
        return {
          cardBg: 'bg-[#FFFBEB] border-2 border-[#F59E0B]',
          badgeBg: 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]',
          badgeText: 'Reserved',
          dotBg: 'bg-[#F59E0B]',
          subtext: 'Space locked for booking'
        };
      case 'Available':
      default:
        return {
          cardBg: 'bg-[#ECFDF5] border-2 border-[#10B981] hover:border-[#059669] cursor-pointer',
          badgeBg: 'bg-[#D1FAE5] text-[#065F46] border border-[#86EFAC]',
          badgeText: 'Available',
          dotBg: 'bg-[#10B981]',
          subtext: 'Click to quick-reserve'
        };
    }
  };

  return (
    <div className="bg-white rounded-[16px] sm:rounded-[18px] border border-[#E2E8F0] p-4 sm:p-6 shadow-card">
      {/* Top Map Header & Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Live Facility Layout
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
              Zone A • 3 Dedicated Bays
            </span>
          </div>
          <p className="text-xs font-semibold text-[#64748B] mt-0.5">
            Real-time optical infrared occupancy telemetry
          </p>
        </div>

        {/* Status Legend */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3.5 text-[11px] sm:text-xs font-bold text-[#0F172A] bg-[#F8FAFC] px-2.5 sm:px-3.5 py-1.5 rounded-[12px] border border-[#E2E8F0] shadow-xs self-start sm:self-auto">
          <span className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#10B981] shadow-xs" />
            <span>Available</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#F59E0B]" />
            <span>Reserved</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#EF4444]" />
            <span>Occupied</span>
          </span>
        </div>
      </div>

      {/* Main Parking Floor Environment */}
      <div className="mt-4 sm:mt-5 rounded-[14px] sm:rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] p-3 sm:p-6 parking-pavement shadow-xs">
        {/* The 3 Dedicated Parking Bays */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-6">
          {slotList.map((slot) => {
            const config = getSlotDetails(slot.status);
            const isOccupied = slot.status === 'Occupied';
            const isReserved = slot.status === 'Reserved';
            const isAvailable = slot.status === 'Available';
            const detail = Array.isArray(slotDetails) ? slotDetails.find(s => s.id === slot.id) : null;

            return (
              <motion.div
                key={slot.id}
                whileHover={{ y: -6, scale: 1.018, boxShadow: '0 16px 32px -8px rgba(15,23,42,0.14)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                onClick={() => {
                  if (isOccupied) {
                    setSelectedCarSlot({ slot, detail });
                  } else if (isAvailable && onSlotClick) {
                    onSlotClick(slot.id);
                  }
                }}
                className={`relative rounded-[14px] sm:rounded-[16px] p-4 sm:p-5 flex flex-col justify-between min-h-[300px] sm:min-h-[340px] cursor-pointer shadow-sm ${config.cardBg}`}
              >
                {/* Bay Header */}
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
                    <span className={`text-[11px] font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs ${config.badgeBg}`}>
                      <span className={`w-2 h-2 rounded-full ${config.dotBg}`} />
                      <span>{config.badgeText}</span>
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
                        <span className="text-xs font-extrabold text-[#92400E]">Reserved Space</span>
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
                        <div className="w-14 h-14 rounded-2xl bg-white border-2 border-[#10B981] flex items-center justify-center text-[#10B981] shadow-sm mb-2">
                          <CheckCircle2 className="w-7 h-7" />
                        </div>
                        <span className="text-xs font-black text-[#065F46]">Bay Vacant</span>
                        <span className="text-[11px] text-[#059669] font-bold mt-0.5">Click to Reserve</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bay Footer */}
                <div className="pt-2.5 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B] font-semibold">
                  <span>{config.subtext}</span>
                  <span className="font-mono text-[10px] font-bold bg-white text-[#0F172A] px-2 py-0.5 rounded border border-[#E2E8F0]">
                    {slot.status}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Entrance Road & Gate Strip */}
        <motion.div
          whileHover={{ y: -2, boxShadow: '0 8px 20px -4px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="mt-4 sm:mt-5 pt-3 sm:pt-3.5 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white px-3 sm:px-4 py-3 rounded-[12px] sm:rounded-[14px] border border-[#E2E8F0] shadow-xs"
        >
          <div className="flex items-center gap-2.5 text-xs text-[#0F172A] font-bold">
            <div className="w-8 h-8 rounded-lg bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] flex items-center justify-center font-black shrink-0">
              <ArrowDown className="w-4 h-4" />
            </div>
            <div>
              <span className="block leading-tight font-extrabold">Entrance & Drive Aisle</span>
              <span className="text-[10px] sm:text-[11px] text-[#64748B] font-semibold">Direct vehicle entry corridor</span>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-2.5 sm:gap-3 bg-[#F8FAFC] px-3 sm:px-3.5 py-1.5 rounded-[12px] border border-[#E2E8F0] w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              {isGateOpen ? (
                <DoorOpen className="w-4 h-4 text-[#10B981] shrink-0" />
              ) : (
                <DoorClosed className="w-4 h-4 text-[#64748B] shrink-0" />
              )}
              <span className="text-[#64748B]">Entrance Gate:</span>
            </div>
            <span className={`font-mono text-xs font-black px-2.5 py-0.5 rounded border ${
              isGateOpen 
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' 
                : 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]'
            }`}>
              {isGateOpen ? 'OPEN (90°)' : 'CLOSED (0°)'}
            </span>
          </div>
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
