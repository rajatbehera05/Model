import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Car, ShieldCheck, Cpu, Clock, Compass } from 'lucide-react';

export function ParkingSlotsView({ data, onReserveSlot, onFindParking, actionLoading }) {
  const [filter, setFilter] = useState('ALL');

  const rawSlots = [
    { 
      id: 'P1', 
      status: data?.slots?.P1 || 'Available', 
      pin: 'GPIO 13', 
      type: 'Standard Bay',
      dim: '9 cm × 14 cm (Prototype)',
      details: data?.slotDetails?.find(s => s.id === 'P1')
    },
    { 
      id: 'P2', 
      status: data?.slots?.P2 || 'Available', 
      pin: 'GPIO 12', 
      type: 'Standard Bay',
      dim: '9 cm × 14 cm (Prototype)',
      details: data?.slotDetails?.find(s => s.id === 'P2')
    },
    { 
      id: 'P3', 
      status: data?.slots?.P3 || 'Available', 
      pin: 'GPIO 14', 
      type: 'Standard Bay',
      dim: '9 cm × 14 cm (Prototype)',
      details: data?.slotDetails?.find(s => s.id === 'P3')
    },
  ];

  const filteredSlots = rawSlots.filter(s => {
    if (filter === 'ALL') return true;
    return s.status.toUpperCase() === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Occupied':
        return {
          bg: 'bg-[#FCEFEB] text-[#D96B5F] border-[#F2BFB8]',
          dot: 'bg-[#D96B5F]',
          icon: Car,
          label: 'Occupied'
        };
      case 'Reserved':
        return {
          bg: 'bg-[#FEF6EC] text-[#E7A65A] border-[#F7D6AB]',
          dot: 'bg-[#E7A65A]',
          icon: ShieldCheck,
          label: 'Reserved'
        };
      case 'Available':
      default:
        return {
          bg: 'bg-[#EAF4EC] text-[#5FA56B] border-[#BDE0C3]',
          dot: 'bg-[#5FA56B]',
          icon: CheckCircle2,
          label: 'Available'
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white rounded-[16px] p-4 border border-[#E3E7E1] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'RESERVED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-[10px] text-xs font-bold transition-all ${
                filter === f
                  ? 'bg-[#6FA47A] text-white shadow-xs'
                  : 'bg-[#F7F8F4] text-[#6F786F] hover:text-[#26332A] border border-[#E3E7E1]'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#6F786F]">
          Showing <span className="font-bold text-[#26332A]">{filteredSlots.length}</span> of 3 monitored bays
        </div>
      </div>

      {/* Slots Detailed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {filteredSlots.map((slot) => {
          const badge = getStatusBadge(slot.status);
          const Icon = badge.icon;
          const isAvailable = slot.status === 'Available';

          return (
            <div
              key={slot.id}
              className="bg-white rounded-[16px] border border-[#E3E7E1] p-5 shadow-card flex flex-col justify-between space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-[12px] bg-[#F7F8F4] text-[#26332A] font-extrabold text-base flex items-center justify-center border border-[#E3E7E1]">
                    {slot.id}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#26332A] text-sm">
                      Parking Bay {slot.id}
                    </h4>
                    <span className="text-[11px] text-[#6F786F]">
                      {slot.type}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${badge.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                  <span>{badge.label}</span>
                </span>
              </div>

              {/* Bay Hardware Specs */}
              <div className="bg-[#F7F8F4] p-3.5 rounded-[12px] border border-[#E3E7E1] space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#6F786F]">
                  <span className="flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-[#6FA47A]" />
                    Hardware Pin:
                  </span>
                  <span className="font-mono font-bold text-[#26332A]">{slot.pin}</span>
                </div>

                <div className="flex items-center justify-between text-[#6F786F]">
                  <span>Physical Sensor:</span>
                  <span className="font-mono text-[#26332A] font-semibold">
                    {slot.details?.sensorDetected ? 'Obstacle Detected (LOW)' : 'Clear (HIGH)'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[#6F786F]">
                  <span>Dimensions:</span>
                  <span className="font-mono text-[#26332A]">{slot.dim}</span>
                </div>
              </div>

              {/* Action */}
              <div className="pt-2">
                {isAvailable ? (
                  <button
                    onClick={() => onReserveSlot && onReserveSlot(slot.id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-[10px] bg-[#6FA47A] hover:bg-[#5A8B64] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Reserve Bay {slot.id}</span>
                  </button>
                ) : (
                  <div className="w-full py-2 text-center text-xs font-semibold text-[#6F786F] bg-[#F7F8F4] rounded-[10px] border border-[#E3E7E1]">
                    {slot.status === 'Occupied' ? 'Currently In Use' : 'Awaiting Reserved Driver'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
