import React from 'react';
import { Compass, DoorOpen, DoorClosed, Lightbulb } from 'lucide-react';

export function Header({ 
  title, 
  subtitle, 
  gate, 
  led, 
  onFindParking, 
  actionLoading, 
  availableCount 
}) {
  const isGateOpen = gate?.state === 'Open';
  const isLedOn = led?.on ?? false;

  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between sticky top-0 z-30 select-none shadow-xs">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-base font-extrabold text-[#0F172A] leading-tight tracking-tight">
          {title}
        </h1>
        <p className="text-[11px] font-semibold text-[#64748B]">
          {subtitle}
        </p>
      </div>

      {/* Center/Right Status Indicators & Quick Actions */}
      <div className="flex items-center gap-3">
        {/* Entrance Gate Barrier Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs shadow-xs">
          {isGateOpen ? (
            <DoorOpen className="w-3.5 h-3.5 text-[#10B981]" />
          ) : (
            <DoorClosed className="w-3.5 h-3.5 text-[#64748B]" />
          )}
          <span className="text-[#64748B] font-semibold">Gate:</span>
          <span className={`font-bold font-mono text-[11px] ${isGateOpen ? 'text-[#10B981]' : 'text-[#0F172A]'}`}>
            {isGateOpen ? 'OPEN (90°)' : 'CLOSED (0°)'}
          </span>
        </div>

        {/* Master LED Pill */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-[12px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs shadow-xs">
          <Lightbulb className={`w-3.5 h-3.5 ${isLedOn ? 'text-[#10B981]' : 'text-[#EF4444]'}`} />
          <span className="text-[#64748B] font-semibold">LED:</span>
          <span className={`font-bold font-mono text-[11px] ${isLedOn ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
            {isLedOn ? 'ON' : 'OFF'}
          </span>
        </div>

        {/* Primary Action Button: Modern Smart Blue */}
        <button
          onClick={onFindParking}
          disabled={actionLoading || availableCount === 0}
          className={`px-4 py-2 rounded-[12px] text-xs font-extrabold flex items-center gap-2 border transition-all shadow-xs ${
            availableCount === 0
              ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-[#1D4ED8] text-white cursor-pointer active:scale-[0.98] shadow-sm hover:shadow-md'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>{actionLoading ? 'Allocating...' : 'Find Parking'}</span>
        </button>
      </div>
    </header>
  );
}
