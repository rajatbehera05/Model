import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Car, ShieldCheck, DoorOpen, LogOut, Cpu } from 'lucide-react';

export function RecentActivityPreview({ activities }) {
  const activityList = Array.isArray(activities) ? activities : [];

  const getEventIcon = (type) => {
    switch (type) {
      case 'SLOT_OCCUPIED':
      case 'RESERVATION_VERIFIED':
        return <Car className="w-3.5 h-3.5 text-[#EF4444]" />;
      case 'SLOT_VACATED':
        return <LogOut className="w-3.5 h-3.5 text-[#10B981]" />;
      case 'SLOT_ASSIGNED':
      case 'SLOT_RESERVED':
        return <ShieldCheck className="w-3.5 h-3.5 text-[#F59E0B]" />;
      case 'GATE_TRIGGERED':
      case 'GATE_CLOSED':
        return <DoorOpen className="w-3.5 h-3.5 text-[#2563EB]" />;
      case 'ESP32_CONNECTED':
        return <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-[#64748B]" />;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white rounded-[16px] sm:rounded-[18px] border border-[#E2E8F0] p-4 sm:p-6 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2563EB] shrink-0" />
          <h3 className="text-xs sm:text-sm font-extrabold text-[#0F172A] tracking-tight">
            Recent Facility Activity & Vehicle Logs
          </h3>
        </div>
        <span className="text-[10px] sm:text-[11px] font-bold text-[#64748B]">
          Live audit trail
        </span>
      </div>

      {activityList.length === 0 ? (
        <div className="py-6 text-center text-xs text-[#64748B]">
          No vehicle activity recorded yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3">
          {activityList.slice(0, 3).map((event, idx) => (
            <motion.div
              key={event.id || idx}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, scale: 1.01, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="p-3 sm:p-3.5 rounded-[12px] sm:rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#3B82F6]/50 flex flex-col justify-between text-xs space-y-2 shadow-xs cursor-default transition-all"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-[8px] bg-white border border-[#E2E8F0] shadow-xs shrink-0 mt-0.5">
                  {getEventIcon(event.type)}
                </div>
                <span className="font-bold text-[#0F172A] leading-snug line-clamp-2">
                  {event.message}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B] gap-2">
                <span className="font-mono text-[#0F172A] font-bold truncate">{event.type}</span>
                <span className="flex items-center gap-1 font-mono font-semibold shrink-0">
                  <Clock className="w-3 h-3 shrink-0" />
                  {formatTime(event.timestamp)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
