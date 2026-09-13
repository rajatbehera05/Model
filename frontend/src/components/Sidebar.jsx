import React from 'react';
import { 
  LayoutDashboard, 
  Grid, 
  CalendarCheck, 
  Car, 
  BarChart3, 
  SlidersHorizontal,
  RefreshCw,
  Cpu
} from 'lucide-react';

export function Sidebar({ 
  activeTab, 
  setActiveTab, 
  esp32, 
  isLivePolling,
  isPageLoading = false,
  targetTab = null
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'operations', label: 'Operations', icon: SlidersHorizontal },
  ];

  const isRealHardware = esp32?.connected === true;
  const isSimulator = esp32?.simulatorActive === true || esp32?.mode === 'Simulator';

  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none shadow-xs">
      <div>
        {/* Brand Header (Click to return to Landing Page) */}
        <button
          onClick={() => setActiveTab('landing')}
          className="w-full text-left h-16 flex items-center px-6 border-b border-[#E2E8F0] gap-3 hover:bg-slate-50/80 transition-colors cursor-pointer group"
          title="Return to Landing Page"
        >
          <div className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white font-extrabold text-lg shadow-sm group-hover:scale-105 transition-transform">
            P
          </div>
          <div>
            <span className="font-extrabold text-base text-[#0F172A] tracking-tight block leading-tight">
              Smart Parking
            </span>
            <span className="text-[11px] text-[#64748B] font-semibold block">
              Facility Management
            </span>
          </div>
        </button>

        {/* Navigation Section */}
        <div className="p-3">
          <div className="px-3 py-2 text-[10px] font-black text-[#64748B] uppercase tracking-wider">
            Main Navigation
          </div>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              const isTargeting = isPageLoading && targetTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  disabled={isPageLoading && isActive}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-[12px] text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#EFF6FF] border border-[#3B82F6] text-[#2563EB] shadow-xs'
                      : isTargeting
                      ? 'bg-[#F0F7FF] border border-[#3B82F6]/60 text-[#0F172A] animate-pulse'
                      : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive || isTargeting ? 'text-[#2563EB]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isTargeting ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
                  ) : isActive ? (
                    <div className="w-2 h-2 rounded-full bg-[#2563EB]" />
                  ) : item.badge ? (
                    <span className="text-[9px] font-mono font-bold bg-[#F1F5F9] text-[#64748B] px-1.5 py-0.5 rounded border border-[#E2E8F0]">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom Telemetry & Status Card */}
      <div className="p-4 border-t border-[#E2E8F0] space-y-3">
        {/* ESP32 Hardware Status Card */}
        <div className="p-3.5 rounded-[14px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-[#64748B] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#2563EB]" />
              Microcontroller
            </span>
            <span className={`w-2.5 h-2.5 rounded-full border ${
              isRealHardware 
                ? 'bg-[#10B981] border-[#059669] animate-pulse' 
                : isSimulator 
                ? 'bg-[#2563EB] border-[#1D4ED8] animate-pulse' 
                : 'bg-[#EF4444] border-[#B91C1C]'
            }`} />
          </div>

          <div className="font-extrabold text-[#0F172A] text-xs leading-tight">
            {isRealHardware ? 'ESP32 Connected' : isSimulator ? 'Simulation Mode' : 'ESP32 Offline'}
          </div>

          <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-[#E2E8F0] text-[10px] text-[#64748B]">
            <span className="font-semibold">Polling: 800ms</span>
            <span className="flex items-center gap-1 font-mono font-bold text-[#10B981]">
              <RefreshCw className={`w-2.5 h-2.5 ${isLivePolling ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              Active
            </span>
          </div>
        </div>

        {/* Facility Info */}
        <div className="px-2 flex items-center justify-between text-[11px] text-[#64748B] font-semibold">
          <span className="truncate">Central Prototype Lot</span>
          <span className="font-mono text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] px-2 py-0.5 rounded">
            Zone A
          </span>
        </div>
      </div>
    </aside>
  );
}
