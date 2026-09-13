import React from 'react';
import { Car, DoorOpen, DoorClosed, Lightbulb, Play, Clock, ArrowRight } from 'lucide-react';

export function VehiclesView({ data, onTriggerGate, actionLoading }) {
  const isGateOpen = data?.gate?.state === 'Open';
  const isLedOn = data?.led?.on ?? false;
  const availableCount = data?.metrics?.available ?? 0;
  const recentActivities = data?.recentActivity || [];

  return (
    <div className="space-y-6">
      {/* Physical Hardware Controls Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Entrance Barrier Control Card */}
        <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#F7F8F4] border border-[#E3E7E1] flex items-center justify-center text-[#26332A]">
                {isGateOpen ? <DoorOpen className="w-5 h-5 text-[#5FA56B]" /> : <DoorClosed className="w-5 h-5 text-[#6F786F]" />}
              </div>
              <div>
                <h4 className="font-bold text-[#26332A] text-sm">
                  Entrance Barrier Gate (SG90 Servo)
                </h4>
                <span className="text-[11px] text-[#6F786F]">
                  PWM Signal on GPIO 18
                </span>
              </div>
            </div>

            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
              isGateOpen 
                ? 'bg-[#DDEBDD] text-[#26332A] border border-[#C2DBC2]' 
                : 'bg-[#E3E7E1] text-[#26332A]'
            }`}>
              {isGateOpen ? 'ARM OPEN (90°)' : 'ARM CLOSED (0°)'}
            </span>
          </div>

          <p className="text-xs text-[#6F786F]">
            The barrier gate arm automatically raises to 90° when vehicles arrive with parking capacity, holding open for 3 seconds before auto-closing. When the facility is full, entry is locked.
          </p>

          <div className="pt-2">
            <button
              onClick={onTriggerGate}
              disabled={actionLoading || isGateOpen || availableCount === 0}
              className="w-full py-2.5 rounded-[12px] bg-[#6FA47A] hover:bg-[#5A8B64] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isGateOpen ? 'Gate Currently Open (Auto-Closing)' : 'Test Entrance Barrier Cycle (3s)'}</span>
            </button>
          </div>
        </div>

        {/* Master LED Indicator Card */}
        <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[12px] bg-[#F7F8F4] border border-[#E3E7E1] flex items-center justify-center text-[#26332A]">
                <Lightbulb className={`w-5 h-5 ${isLedOn ? 'text-[#5FA56B]' : 'text-[#D96B5F]'}`} />
              </div>
              <div>
                <h4 className="font-bold text-[#26332A] text-sm">
                  Entrance Facility Status LED
                </h4>
                <span className="text-[11px] text-[#6F786F]">
                  Active HIGH on GPIO 2 (220Ω)
                </span>
              </div>
            </div>

            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
              isLedOn 
                ? 'bg-[#DDEBDD] text-[#5FA56B] border border-[#C2DBC2]' 
                : 'bg-[#FCEFEB] text-[#D96B5F] border border-[#F2BFB8]'
            }`}>
              {isLedOn ? 'LED ON (SPACES OPEN)' : 'LED OFF (LOT FULL)'}
            </span>
          </div>

          <p className="text-xs text-[#6F786F]">
            The single master LED acts as the street-level facility light beside the entrance gate. It stays lit whenever $\ge 1$ bay is available and extinguishes completely when all 3 bays are occupied.
          </p>

          <div className="p-3 bg-[#F7F8F4] rounded-[12px] border border-[#E3E7E1] flex items-center justify-between text-xs text-[#6F786F]">
            <span>Current Logic State:</span>
            <span className="font-bold text-[#26332A]">
              {availableCount > 0 ? `${availableCount} Spaces Free -> Illuminated` : '0 Spaces Free -> Extinguished'}
            </span>
          </div>
        </div>
      </div>

      {/* Vehicle Movement Audit Log */}
      <div className="bg-white rounded-[18px] border border-[#E3E7E1] shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E3E7E1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#6FA47A]" />
            <h4 className="text-sm font-bold text-[#26332A]">
              Vehicle Movement & Gate Log
            </h4>
          </div>
          <span className="text-xs font-semibold text-[#6F786F]">
            Automatic optical infrared records
          </span>
        </div>

        <div className="divide-y divide-[#E3E7E1]">
          {recentActivities.map((event, idx) => (
            <div key={event.id || idx} className="px-6 py-3.5 flex items-center justify-between hover:bg-[#F7F8F4] text-xs">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-[#6FA47A]" />
                <span className="font-semibold text-[#26332A]">{event.message}</span>
              </div>
              <span className="text-[11px] font-mono text-[#6F786F]">{event.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
