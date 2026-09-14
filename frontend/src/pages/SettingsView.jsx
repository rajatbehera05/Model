import React from 'react';
import { SlidersHorizontal, Cpu, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';

export function SettingsView({ onResetSystem, actionLoading }) {
  const pinouts = [
    { pin: 'GPIO 13', device: 'IR Obstacle Sensor 1', role: 'Parking Slot P1 (Active-LOW)' },
    { pin: 'GPIO 12', device: 'IR Obstacle Sensor 2', role: 'Parking Slot P2 (Active-LOW)' },
    { pin: 'GPIO 14', device: 'IR Obstacle Sensor 3', role: 'Parking Slot P3 (Active-LOW)' },
    { pin: 'GPIO 18', device: 'SG90 Micro Servo', role: 'Entrance Barrier (0° Closed / 90° Open)' },
    { pin: 'GPIO 2', device: 'Central LED (220Ω)', role: 'Master Capacity Beacon (ON if Available >= 1)' },
  ];

  return (
    <div className="space-y-6">
      {/* Hardware Pin Mapping Card */}
      <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Cpu className="w-5 h-5 text-[#6FA47A]" />
          <div>
            <h3 className="text-base font-bold text-[#26332A]">
              ESP32 Microcontroller GPIO Pin Mapping
            </h3>
            <p className="text-xs text-[#6F786F]">
              Hardware configuration strictly matched to project PRD
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#E3E7E1]">
          {pinouts.map((item) => (
            <div key={item.pin} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-mono font-bold text-xs bg-[#F7F8F4] border border-[#E3E7E1] px-2.5 py-1 rounded-[8px] text-[#26332A] shrink-0">
                  {item.pin}
                </span>
                <span className="font-semibold text-[#26332A]">{item.device}</span>
              </div>
              <span className="text-[#6F786F] font-medium text-[11px] sm:text-xs pl-1 sm:pl-0">{item.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Firmware Calibration & Reset */}
      <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card space-y-4">
        <div>
          <h3 className="text-base font-bold text-[#26332A]">
            Software Calibration & System Reset
          </h3>
          <p className="text-xs text-[#6F786F] mt-0.5">
            Reset in-memory state or adjust parameters for academic demonstrations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-[14px] bg-[#F7F8F4] border border-[#E3E7E1]">
            <span className="font-bold text-[#26332A] block mb-1">Debounce Filter Window</span>
            <span className="text-[#6F786F] block">300ms stable threshold to eliminate optical jitter.</span>
            <span className="font-mono text-[#5FA56B] font-bold text-[11px] mt-2 block">STATUS: CALIBRATED</span>
          </div>

          <div className="p-4 rounded-[14px] bg-[#F7F8F4] border border-[#E3E7E1]">
            <span className="font-bold text-[#26332A] block mb-1">Watchdog Inactivity Timeout</span>
            <span className="text-[#6F786F] block">5.0 seconds before reporting microcontroller offline.</span>
            <span className="font-mono text-[#5FA56B] font-bold text-[11px] mt-2 block">STATUS: ACTIVE</span>
          </div>
        </div>

        {/* Reset System State Button */}
        <div className="pt-2">
          <button
            onClick={onResetSystem}
            disabled={actionLoading}
            className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 rounded-[12px] bg-[#D96B5F] hover:bg-[#c6584d] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all text-center"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Parking System State (All 3 Bays to Available)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
