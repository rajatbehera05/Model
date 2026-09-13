import React, { useState } from 'react';
import { ShieldCheck, Clock, CalendarCheck, Plus, CheckCircle2 } from 'lucide-react';

export function ReservationsView({ data, onReserveSlot, actionLoading }) {
  const [selectedSlot, setSelectedSlot] = useState('');

  const slots = data?.slots || {};
  const reservedSlots = Object.entries(slots).filter(([id, status]) => status === 'Reserved');
  const availableSlots = Object.entries(slots).filter(([id, status]) => status === 'Available');

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Booking Form */}
      <div className="bg-white rounded-[18px] p-6 border border-[#E3E7E1] shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h3 className="text-base font-bold text-[#26332A]">
            Reservation Management
          </h3>
          <p className="text-xs text-[#6F786F] mt-1 max-w-xl">
            Reserve parking spaces in advance. The system automatically promotes a reservation to Occupied the moment physical IR sensors detect vehicle arrival.
          </p>
        </div>

        {/* Quick Reserve Box */}
        <div className="flex items-center gap-2.5 shrink-0">
          <select
            value={selectedSlot}
            onChange={(e) => setSelectedSlot(e.target.value)}
            className="px-3 py-2 rounded-[12px] bg-[#F7F8F4] border border-[#E3E7E1] text-xs font-semibold text-[#26332A] focus:outline-none focus:border-[#6FA47A]"
          >
            <option value="">Select Available Bay</option>
            {availableSlots.map(([id]) => (
              <option key={id} value={id}>Bay {id} (Vacant)</option>
            ))}
          </select>

          <button
            onClick={() => {
              if (selectedSlot) {
                onReserveSlot(selectedSlot);
                setSelectedSlot('');
              }
            }}
            disabled={!selectedSlot || actionLoading}
            className="px-4 py-2 rounded-[12px] bg-[#6FA47A] hover:bg-[#5A8B64] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Space</span>
          </button>
        </div>
      </div>

      {/* Active Reservations Table */}
      <div className="bg-white rounded-[18px] border border-[#E3E7E1] shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E3E7E1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarCheck className="w-4 h-4 text-[#6FA47A]" />
            <h4 className="text-sm font-bold text-[#26332A]">
              Active Prototype Bookings
            </h4>
          </div>
          <span className="text-xs font-semibold text-[#6F786F]">
            {reservedSlots.length} active reservation{reservedSlots.length === 1 ? '' : 's'}
          </span>
        </div>

        {reservedSlots.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#6F786F]">
            No parking bays currently reserved. All free bays are available for booking.
          </div>
        ) : (
          <div className="divide-y divide-[#E3E7E1]">
            {reservedSlots.map(([id]) => (
              <div key={id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F7F8F4] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-[12px] bg-[#FEF6EC] border border-[#F7D6AB] text-[#E7A65A] flex items-center justify-center font-bold text-sm">
                    {id}
                  </div>
                  <div>
                    <span className="font-bold text-sm text-[#26332A] block">
                      Assigned Bay {id}
                    </span>
                    <span className="text-[11px] text-[#6F786F] block">
                      Driver Ticket #RES-{id}-2026
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FEF6EC] text-[#E7A65A] border border-[#F7D6AB] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E7A65A]" />
                    Awaiting Physical Arrival
                  </span>

                  <span className="text-xs font-mono text-[#6F786F]">
                    Auto-promotes upon IR trigger
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
