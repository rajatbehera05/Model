import React from 'react';
import { BarChart3, TrendingUp, CheckCircle2, Clock } from 'lucide-react';

export function ReportsView({ data }) {
  const metrics = data?.metrics || {};
  const percent = metrics.availabilityPercent ?? 0;
  const available = metrics.available ?? 0;
  const occupied = metrics.occupied ?? 0;
  const reserved = metrics.reserved ?? 0;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card">
          <span className="text-xs font-semibold text-[#6F786F]">Capacity Utilization</span>
          <div className="text-3xl font-extrabold text-[#26332A] mt-2 tracking-tight">
            {100 - percent}%
          </div>
          <p className="text-[11px] text-[#6F786F] mt-1">
            Calculated as ((Occupied + Reserved) / 3) * 100
          </p>
          <div className="mt-4 w-full h-2 bg-[#F7F8F4] border border-[#E3E7E1] rounded-full overflow-hidden">
            <div className="h-full bg-[#6FA47A] rounded-full" style={{ width: `${100 - percent}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card">
          <span className="text-xs font-semibold text-[#6F786F]">Sensor Telemetry Uptime</span>
          <div className="text-3xl font-extrabold text-[#5FA56B] mt-2 tracking-tight">
            99.9%
          </div>
          <p className="text-[11px] text-[#6F786F] mt-1">
            300ms optical software debounce filter
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#5FA56B] font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Zero false positives logged</span>
          </div>
        </div>

        <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card">
          <span className="text-xs font-semibold text-[#6F786F]">Barrier Cycle Time</span>
          <div className="text-3xl font-extrabold text-[#26332A] mt-2 tracking-tight">
            3.0s
          </div>
          <p className="text-[11px] text-[#6F786F] mt-1">
            SG90 Servo auto-close safety timer
          </p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-[#6F786F]">
            <Clock className="w-4 h-4 text-[#6FA47A]" />
            <span>Automated entrance regulation</span>
          </div>
        </div>
      </div>

      {/* Prototype Bay Status Breakdown */}
      <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card">
        <h4 className="text-sm font-bold text-[#26332A] mb-4">
          Bay Performance & Telemetry Breakdown
        </h4>

        <div className="space-y-4">
          {['P1', 'P2', 'P3'].map((id) => {
            const status = data?.slots?.[id] || 'Available';
            const isAvail = status === 'Available';
            const isOcc = status === 'Occupied';

            return (
              <div key={id} className="p-4 rounded-[14px] bg-[#F7F8F4] border border-[#E3E7E1] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[10px] bg-white border border-[#E3E7E1] flex items-center justify-center font-bold text-sm text-[#26332A]">
                    {id}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#26332A] block">
                      Dedicated Bay {id}
                    </span>
                    <span className="text-[11px] text-[#6F786F]">
                      Optical Sensor: {isOcc ? 'Active (LOW)' : 'Clear (HIGH)'}
                    </span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isOcc 
                    ? 'bg-[#FCEFEB] text-[#D96B5F] border border-[#F2BFB8]'
                    : isAvail 
                    ? 'bg-[#EAF4EC] text-[#5FA56B] border border-[#BDE0C3]'
                    : 'bg-[#FEF6EC] text-[#E7A65A] border border-[#F7D6AB]'
                }`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
