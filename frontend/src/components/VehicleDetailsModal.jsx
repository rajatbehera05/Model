import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Car, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  MapPin, 
  Calendar, 
  Activity, 
  Receipt,
  CheckCircle2
} from 'lucide-react';
import { RealisticSlotCar } from './RealisticSlotCar';

export function VehicleDetailsModal({ isOpen, onClose, slot, detail }) {
  if (!isOpen || !slot) return null;

  const slotId = slot.id;
  const parkedAt = detail?.parkedAt || detail?.lastUpdated || new Date().toISOString();

  const defaultPlates = {
    P1: 'DL 08 CQ 4092',
    P2: 'MH 12 AB 8819',
    P3: 'KA 05 MN 3321'
  };

  const vehicleInfo = {
    P1: {
      make: 'Mercedes-Benz',
      model: 'C-Class Luxury Sedan',
      color: 'Polar White',
      plate: defaultPlates.P1,
      ownerType: 'Registered Visitor',
      pin: 'GPIO 13'
    },
    P2: {
      make: 'BMW',
      model: '3 Series Executive Sedan',
      color: 'Phytonic Blue',
      plate: defaultPlates.P2,
      ownerType: 'Daily Commuter',
      pin: 'GPIO 12'
    },
    P3: {
      make: 'Audi',
      model: 'A5 Sport Coupe',
      color: 'Tango Red',
      plate: defaultPlates.P3,
      ownerType: 'Reserved Guest',
      pin: 'GPIO 14'
    }
  };

  const info = vehicleInfo[slotId] || vehicleInfo.P1;
  const plateNumber = detail?.plateNumber || info.plate;

  // Live Parked Duration Counter
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const diffMs = Date.now() - new Date(parkedAt).getTime();
        const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;

        if (hours > 0) {
          setElapsed(`${hours}h ${mins}m ${secs}s`);
        } else if (mins > 0) {
          setElapsed(`${mins}m ${secs}s`);
        } else {
          setElapsed(`${secs}s`);
        }
      } catch {
        setElapsed('Just now');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [parkedAt]);

  const formatArrivalTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: true 
      });
    } catch {
      return '--:--:--';
    }
  };

  const formatArrivalDate = (iso) => {
    try {
      return new Date(iso).toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return 'Today';
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs select-none overflow-y-auto">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className="relative z-10 bg-white rounded-[18px] sm:rounded-[22px] border border-[#E2E8F0] shadow-modal max-w-lg w-full overflow-hidden my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header Bar: Dark Navy with Smart Blue Accent */}
          <div className="bg-[#0F172A] text-white px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#1E293B]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center text-white font-black shrink-0">
                <Car className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base leading-tight text-white flex items-center gap-2">
                  <span>Vehicle Telemetry</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2563EB] text-white font-bold">
                    BAY {slotId}
                  </span>
                </h3>
                <span className="text-[10px] sm:text-[11px] text-[#94A3B8] font-medium">
                  Verified Occupied Parking Session
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[80vh] overflow-y-auto">
            
            {/* Top Visual Card: Vehicle Model & Number Plate */}
            <div className="p-3.5 sm:p-5 rounded-[16px] sm:rounded-[18px] bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 shadow-xs">
              <div className="space-y-1.5 sm:space-y-2 text-center sm:text-left w-full sm:w-auto">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#64748B] block">
                  Detected Vehicle
                </span>
                <div className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">
                  {info.make} {info.model}
                </div>
                <div className="text-xs text-[#64748B] font-semibold">
                  Finish: <strong className="text-[#0F172A] font-bold">{info.color}</strong> • {info.ownerType}
                </div>

                {/* Authentic Embossed License Plate */}
                <div className="inline-flex items-stretch shadow-md border-2 border-[#1E293B] rounded-[6px] overflow-hidden bg-white mt-1">
                  <div className="bg-[#003399] text-white px-2 py-1 flex flex-col items-center justify-center leading-none">
                    <span className="text-[8px] font-black tracking-tighter">IND</span>
                    <span className="w-2 h-2 rounded-full border border-yellow-300 mt-0.5" />
                  </div>
                  <div className="px-3 py-1 font-mono font-black text-xs sm:text-sm tracking-widest text-[#0F172A] bg-[#FFFBEB] flex items-center">
                    {plateNumber}
                  </div>
                </div>
              </div>

              {/* Mini Top-down Perspective Car */}
              <div className="shrink-0 flex items-center justify-center p-2 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xs">
                <RealisticSlotCar slotId={slotId} plateNumber={plateNumber} parkedAt={parkedAt} />
              </div>
            </div>

            {/* Grid 1: Live Parking Timer & Arrival Times */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
              <div className="p-3.5 rounded-[14px] bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
                <span className="text-[10px] font-black uppercase text-[#1E40AF] tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#2563EB]" />
                  Parked Duration
                </span>
                <div className="font-mono text-base sm:text-lg font-black text-[#1E3A8A]">
                  {elapsed || 'Calculating...'}
                </div>
                <span className="text-[10px] font-semibold text-[#2563EB] block">
                  Active live session timer
                </span>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] space-y-1">
                <span className="text-[10px] font-black uppercase text-[#64748B] tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-[#64748B]" />
                  Entry Timestamp
                </span>
                <div className="font-mono text-sm sm:text-base font-black text-[#0F172A]">
                  {formatArrivalTime(parkedAt)}
                </div>
                <span className="text-[10px] font-semibold text-[#64748B] block">
                  {formatArrivalDate(parkedAt)}
                </span>
              </div>
            </div>

            {/* Grid 2: Hardware Sensor Telemetry */}
            <div className="p-3.5 sm:p-4 rounded-[14px] sm:rounded-[16px] bg-white border border-[#E2E8F0] space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0]">
                <span className="text-xs font-extrabold text-[#0F172A] flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
                  Optical Telemetry & Hardware State
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#FEF2F2] text-[#EF4444] border border-[#FCA5A5]">
                  0 (LOW) • REFLECTED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold text-[#64748B]">
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span>Sensor Pin:</span>
                  <span className="font-mono font-bold text-[#0F172A]">{info.pin}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span>Bay Status:</span>
                  <span className="font-bold text-[#EF4444]">Occupied</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span>Location:</span>
                  <span className="font-bold text-[#0F172A]">Zone A, Lot 1</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  <span>Gate Action:</span>
                  <span className="font-bold text-[#10B981]">Entry Logged</span>
                </div>
              </div>
            </div>

            {/* Parking Session Confirmation Badge */}
            <div className="p-3 sm:p-3.5 rounded-[14px] bg-[#ECFDF5] border border-[#10B981] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#065F46]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
                <span className="font-bold">Active Valid Session — Sensor beam continuously verified.</span>
              </div>
              <span className="font-mono text-[10px] font-black bg-[#10B981] text-white px-2 py-0.5 rounded shrink-0 self-start sm:self-auto">
                VERIFIED
              </span>
            </div>
          </div>

          {/* Footer Close Button */}
          <div className="bg-[#F8FAFC] px-4 sm:px-6 py-3 sm:py-3.5 border-t border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <span className="text-[11px] sm:text-xs text-[#64748B] font-semibold text-center sm:text-left">
              Click anywhere outside or press Close
            </span>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-extrabold text-xs tracking-wide shadow-sm transition-colors cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
