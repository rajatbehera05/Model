import React from 'react';
import { motion } from 'framer-motion';
import { Layers, CheckCircle2, Clock, Car } from 'lucide-react';

export function MetricsSection({ metrics }) {
  const total = metrics?.total ?? 3;
  const available = metrics?.available ?? 0;
  const reserved = metrics?.reserved ?? 0;
  const occupied = metrics?.occupied ?? 0;
  const availabilityPercent = metrics?.availabilityPercent ?? 0;

  const cards = [
    {
      label: 'Total Spaces',
      value: total,
      subtext: 'Monitored prototype bays',
      icon: Layers,
      iconBg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
      valueColor: 'text-[#0F172A]'
    },
    {
      label: 'Available Spaces',
      value: available,
      subtext: `${availabilityPercent}% current capacity`,
      icon: CheckCircle2,
      iconBg: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
      valueColor: 'text-[#10B981]'
    },
    {
      label: 'Reserved Spaces',
      value: reserved,
      subtext: reserved > 0 ? 'Awaiting arrival' : 'No active bookings',
      icon: Clock,
      iconBg: 'bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]',
      valueColor: 'text-[#F59E0B]'
    },
    {
      label: 'Occupied Spaces',
      value: occupied,
      subtext: occupied > 0 ? 'Vehicles parked' : 'All bays vacant',
      icon: Car,
      iconBg: 'bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]',
      valueColor: 'text-[#EF4444]'
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.015, boxShadow: '0 12px 28px -6px rgba(15,23,42,0.09)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="bg-white rounded-[14px] sm:rounded-[16px] p-3.5 sm:p-5 border border-[#E2E8F0] shadow-card hover:border-[#3B82F6]/50 hover:shadow-cardHover transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2 sm:mb-3 gap-1">
              <span className="text-[11px] sm:text-xs font-bold text-[#64748B] truncate">
                {card.label}
              </span>
              <div className={`p-1.5 sm:p-2 rounded-[8px] sm:rounded-[10px] shrink-0 ${card.iconBg}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-1">
              <motion.span
                key={card.value}
                initial={{ scale: 0.9, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-2xl sm:text-3xl font-black ${card.valueColor} tracking-tight leading-none`}
              >
                {card.value}
              </motion.span>
              <span className="text-[10px] sm:text-[11px] text-[#64748B] font-semibold leading-tight line-clamp-2 sm:line-clamp-1">
                {card.subtext}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
