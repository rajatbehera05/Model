import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Cpu, 
  Activity, 
  DoorOpen, 
  DoorClosed, 
  Lightbulb, 
  Car, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Layers, 
  RefreshCw,
  Power,
  Play,
  Server
} from 'lucide-react';
import { triggerGateBarrier, toggleSlotCar } from '../api/parkingApi';

export function OperationsPage({ data, apiError, onRefreshData }) {
  const [gateLoading, setGateLoading] = useState(false);
  const [gateFeedback, setGateFeedback] = useState(null);
  const [togglingSlot, setTogglingSlot] = useState(null);

  const metrics = data?.metrics || { total: 3, available: 3, reserved: 0, occupied: 0, availabilityPercent: 100 };
  const gate = data?.gate || { state: 'Closed' };
  const led = data?.led || { on: true };
  const esp32 = data?.esp32 || { connected: false, simulatorActive: false, mode: 'Disconnected', lastHeartbeat: null };
  const slotDetails = data?.slotDetails || [
    { id: 'P1', status: 'Available', sensorDetected: false, lastUpdated: null },
    { id: 'P2', status: 'Available', sensorDetected: false, lastUpdated: null },
    { id: 'P3', status: 'Available', sensorDetected: false, lastUpdated: null },
  ];
  const activities = Array.isArray(data?.recentActivity) ? data.recentActivity.slice(0, 5) : [];

  const isGateOpen = gate?.state === 'Open';
  const isLedOn = led?.on ?? (metrics.available >= 1);
  const isRealHardware = esp32?.connected === true;
  const isSimulatorActive = esp32?.simulatorActive === true || esp32?.mode === 'Simulator';
  const isLotFull = metrics.available === 0;

  // Pin assignments strictly per PRD
  const pinMapping = {
    P1: { pin: 'GPIO 13', label: 'Slot 1 IR Sensor' },
    P2: { pin: 'GPIO 12', label: 'Slot 2 IR Sensor' },
    P3: { pin: 'GPIO 14', label: 'Slot 3 IR Sensor' },
  };

  // Format ISO timestamp
  const formatTime = (isoString) => {
    if (!isoString) return '--:--:--';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Gate trigger handler using existing backend endpoint
  const handleTriggerGate = async () => {
    if (gateLoading || isLotFull || isGateOpen) return;

    setGateLoading(true);
    setGateFeedback(null);

    try {
      const res = await triggerGateBarrier();
      if (res.ok && res.data.success) {
        setGateFeedback({
          success: true,
          message: 'Entrance barrier triggered: servo rotating to 90° (auto-closing in 3s).'
        });
        if (onRefreshData) onRefreshData();
      } else {
        setGateFeedback({
          success: false,
          message: res.data.message || 'Gate command rejected: parking lot is at full capacity.'
        });
      }
    } catch (err) {
      setGateFeedback({
        success: false,
        message: 'Network error communicating with backend server.'
      });
    } finally {
      setGateLoading(false);
      setTimeout(() => setGateFeedback(null), 6000);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 1. TOP SYSTEM HEALTH & CONNECTIVITY BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Backend Server */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-[14px] sm:rounded-[16px] p-3.5 sm:p-4 border border-[#E2E8F0] shadow-card flex items-center justify-between cursor-default"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-[10px] sm:rounded-[12px] border shrink-0 ${
              apiError 
                ? 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]' 
                : 'bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]'
            }`}>
              <Server className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Backend API</span>
              <span className="font-extrabold text-xs sm:text-sm text-[#0F172A]">
                {apiError ? 'Unavailable' : 'Online (Port 5000)'}
              </span>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${apiError ? 'bg-[#EF4444]' : 'bg-[#10B981] animate-pulse'}`} />
        </motion.div>

        {/* ESP32 Microcontroller Status */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-[14px] sm:rounded-[16px] p-3.5 sm:p-4 border border-[#E2E8F0] shadow-card flex items-center justify-between cursor-default"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-[10px] sm:rounded-[12px] border shrink-0 ${
              isRealHardware
                ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                : isSimulatorActive
                ? 'bg-[#FFFBEB] text-[#D97706] border-[#FCD34D]'
                : 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]'
            }`}>
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">ESP32 Hardware</span>
              <span className="font-extrabold text-xs sm:text-sm text-[#0F172A]">
                {isRealHardware ? 'ESP32 Connected' : isSimulatorActive ? 'Simulation Mode' : 'Hardware Offline'}
              </span>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
            isRealHardware ? 'bg-[#10B981] animate-pulse' : isSimulatorActive ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
          }`} />
        </motion.div>

        {/* Sensor Sync Frequency */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-[14px] sm:rounded-[16px] p-3.5 sm:p-4 border border-[#E2E8F0] shadow-card flex items-center justify-between cursor-default"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-[10px] sm:rounded-[12px] bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] shrink-0">
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Sensor Polling</span>
              <span className="font-extrabold text-xs sm:text-sm text-[#0F172A]">800ms Real-Time</span>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold bg-[#EFF6FF] text-[#2563EB] px-2 py-0.5 rounded border border-[#BFDBFE] shrink-0">
            ACTIVE
          </span>
        </motion.div>

        {/* Master LED Command State */}
        <motion.div
          whileHover={{ y: -3, scale: 1.015, boxShadow: '0 10px 22px -4px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="bg-white rounded-[14px] sm:rounded-[16px] p-3.5 sm:p-4 border border-[#E2E8F0] shadow-card flex items-center justify-between cursor-default"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className={`p-2 sm:p-2.5 rounded-[10px] sm:rounded-[12px] border shrink-0 ${
              isLedOn 
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' 
                : 'bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]'
            }`}>
              <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">Master LED (GPIO 4)</span>
              <span className={`font-extrabold text-xs sm:text-sm ${isLedOn ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                {isLedOn ? 'ON (Spaces Free)' : 'OFF (Lot Full)'}
              </span>
            </div>
          </div>
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${isLedOn ? 'bg-[#10B981]' : 'bg-[#EF4444]'}`} />
        </motion.div>
      </div>

      {/* 2. MAIN SENSOR TELEMETRY & SENSOR → SLOT RELATIONSHIP */}
      <motion.div 
        whileHover={{ y: -3, boxShadow: '0 16px 32px -6px rgba(15,23,42,0.08)' }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        className="bg-white rounded-[16px] sm:rounded-[18px] border border-[#E2E8F0] p-4 sm:p-6 shadow-card space-y-4 sm:space-y-5 transition-colors hover:border-[#3B82F6]/50"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2.5 sm:gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Optical Infrared Sensor Telemetry
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                Active-LOW Logic
              </span>
            </div>
            <p className="text-xs font-semibold text-[#64748B] mt-0.5">
              Direct physical obstacle detection mapped to logical parking bay allocation
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold text-[#0F172A] bg-[#F8FAFC] px-2.5 sm:px-3.5 py-1.5 rounded-[12px] border border-[#E2E8F0] shadow-xs self-start sm:self-auto">
            <span className="flex items-center gap-1.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#10B981]" />
              <span>CLEAR (HIGH / 1)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-[#EF4444]" />
              <span>OBSTACLE (LOW / 0)</span>
            </span>
          </div>
        </div>

        {/* 3 Dedicated IR Sensor Rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-6">
          {slotDetails.map((slot) => {
            const isDetected = slot.sensorDetected === true;
            const mapping = pinMapping[slot.id] || { pin: 'GPIO --', label: 'IR Sensor' };
            const status = slot.status || 'Available';

            return (
              <motion.div
                key={slot.id}
                whileHover={{ y: -6, scale: 1.018, boxShadow: '0 16px 32px -8px rgba(15,23,42,0.14)' }}
                transition={{ type: 'spring', stiffness: 380, damping: 24 }}
                className={`rounded-[16px] p-5 border-2 flex flex-col justify-between min-h-[260px] shadow-sm transition-all select-none ${
                  isDetected 
                    ? 'bg-[#FEF2F2] border-[#EF4444]' 
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                {/* Header: Slot and GPIO Pin */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-[10px] bg-white text-[#0F172A] font-black text-sm flex items-center justify-center border border-[#E2E8F0] shadow-xs">
                      {slot.id}
                    </span>
                    <div>
                      <span className="text-xs font-black text-[#0F172A] block leading-tight">
                        {mapping.label}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-[#64748B]">
                        {mapping.pin} • ESP32
                      </span>
                    </div>
                  </div>

                  {/* Normalized Logic Signal Pill */}
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded border ${
                    isDetected 
                      ? 'bg-[#EF4444] text-white border-[#DC2626]' 
                      : 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]'
                  }`}>
                    {isDetected ? '0 (LOW)' : '1 (HIGH)'}
                  </span>
                </div>

                {/* Sensor State & Physical Signal Display */}
                <motion.div 
                  whileHover={{ scale: 1.02, y: -2, boxShadow: '0 8px 18px -4px rgba(15,23,42,0.08)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="my-4 p-4 rounded-[12px] bg-white border border-[#E2E8F0] text-center space-y-2 shadow-2xs cursor-default"
                >
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    IR Sensor Signal
                  </span>

                  <div className="flex items-center justify-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${
                      isDetected ? 'bg-[#EF4444] animate-ping' : 'bg-[#10B981]'
                    }`} />
                    <span className={`text-base font-black tracking-tight ${
                      isDetected ? 'text-[#EF4444]' : 'text-[#10B981]'
                    }`}>
                      {isDetected ? 'OBSTACLE DETECTED' : 'CLEAR'}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-[#64748B] block">
                    {isDetected 
                      ? 'Bumper obstacle reflecting IR beam' 
                      : 'No optical reflection (beam open)'}
                  </span>
                </motion.div>

                {/* SENSOR → SLOT RELATIONSHIP */}
                <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] font-bold text-[#64748B] uppercase block">
                      Parking State
                    </span>
                    <span className={`font-black text-xs ${
                      status === 'Occupied' 
                        ? 'text-[#EF4444]' 
                        : status === 'Reserved' 
                        ? 'text-[#F59E0B]' 
                        : 'text-[#10B981]'
                    }`}>
                      {status.toUpperCase()}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono text-[#64748B] block">Updated</span>
                    <span className="text-[10px] font-mono font-bold text-[#0F172A]">
                      {formatTime(slot.lastUpdated)}
                    </span>
                  </div>
                </div>

                {/* VEHICLE LICENSE PLATE & PARKED TIME */}
                {status === 'Occupied' && (
                  <div className="mt-2.5 pt-2 border-t border-[#FCA5A5] flex items-center justify-between">
                    <span className="font-mono font-black text-[11px] px-2 py-0.5 rounded bg-white border border-[#1E293B] text-[#0F172A] shadow-2xs">
                      {slot.plateNumber || (slot.id === 'P1' ? 'DL 08 CQ 4092' : slot.id === 'P2' ? 'MH 12 AB 8819' : 'KA 05 MN 3321')}
                    </span>
                    <span className="font-mono text-[10px] font-semibold text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#EF4444]" />
                      Parked: {formatTime(slot.parkedAt || slot.lastUpdated)}
                    </span>
                  </div>
                )}

                {/* Interactive IR Sensor & Vehicle Simulation Action */}
                <div className="mt-3 pt-2.5 border-t border-[#E2E8F0]">
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      setTogglingSlot(slot.id);
                      try {
                        await toggleSlotCar(slot.id);
                        if (onRefreshData) await onRefreshData();
                      } finally {
                        setTogglingSlot(null);
                      }
                    }}
                    disabled={togglingSlot === slot.id}
                    className={`w-full py-1.5 px-3 rounded-[10px] text-[11px] font-extrabold flex items-center justify-center gap-1.5 transition-all border shadow-2xs cursor-pointer ${
                      isDetected
                        ? 'bg-white hover:bg-[#FEF2F2] text-[#EF4444] border-[#FCA5A5]'
                        : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white border-[#1D4ED8]'
                    }`}
                  >
                    <Car className="w-3.5 h-3.5" />
                    <span>
                      {togglingSlot === slot.id
                        ? 'Updating...'
                        : isDetected
                        ? 'Depart Vehicle (Vacate Bay)'
                        : 'Park Vehicle at Bay'}
                    </span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* 3. ENTRY GATE & ACTUATOR CONTROL PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column: Gate & Actuator Controls (7 cols) */}
        <motion.div 
          whileHover={{ y: -3, boxShadow: '0 16px 32px -6px rgba(15,23,42,0.08)' }}
          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
          className="lg:col-span-7 bg-white rounded-[16px] sm:rounded-[18px] border border-[#E2E8F0] p-4 sm:p-6 shadow-card space-y-4 sm:space-y-5 transition-colors hover:border-[#3B82F6]/50"
        >
          <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
            <div>
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Entry Gate & Actuator Control
              </h3>
              <p className="text-xs text-[#64748B] font-semibold mt-0.5">
                SG90 Servo barrier arm control via PWM
              </p>
            </div>
            <span className={`text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full border ${
              isGateOpen
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]'
                : 'bg-[#F1F5F9] text-[#0F172A] border-[#E2E8F0]'
            }`}>
              {isGateOpen ? 'ARM: 90° (OPEN)' : 'ARM: 0° (CLOSED)'}
            </span>
          </div>

          {/* Gate Status Card */}
          <motion.div 
            whileHover={{ y: -2, scale: 1.01, boxShadow: '0 10px 24px -4px rgba(15,23,42,0.08)' }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="rounded-[14px] sm:rounded-[16px] bg-[#F8FAFC] p-4 sm:p-5 border border-[#E2E8F0] space-y-3.5 sm:space-y-4 shadow-xs cursor-default"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 sm:p-3 rounded-[10px] sm:rounded-[12px] border shrink-0 ${
                  isGateOpen 
                    ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' 
                    : 'bg-white text-[#64748B] border-[#E2E8F0]'
                }`}>
                  {isGateOpen ? <DoorOpen className="w-5 h-5 sm:w-6 sm:h-6" /> : <DoorClosed className="w-5 h-5 sm:w-6 sm:h-6" />}
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Barrier Servo (GPIO 2 PWM)
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#0F172A]">
                    {isGateOpen ? 'OPEN — 90° Passable' : 'CLOSED — 0° Blocked'}
                  </span>
                </div>
              </div>

              {/* Angle Meter */}
              <div className="text-left sm:text-right pl-1 sm:pl-0">
                <span className="text-[10px] font-bold text-[#64748B] block">Target Angle</span>
                <span className="text-lg sm:text-xl font-mono font-black text-[#0F172A]">
                  {isGateOpen ? '90°' : '0°'}
                </span>
              </div>
            </div>

            <p className="text-xs text-[#64748B] font-semibold leading-relaxed">
              When a vehicle approaches and spaces are available, the servo rotates 90° for passage and automatically returns to 0° after 3 seconds.
            </p>

            {/* Trigger Gate Button */}
            <motion.button
              whileHover={{ y: (isLotFull || isGateOpen || gateLoading) ? 0 : -2, scale: (isLotFull || isGateOpen || gateLoading) ? 1 : 1.015 }}
              whileTap={{ scale: (isLotFull || isGateOpen || gateLoading) ? 1 : 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              onClick={handleTriggerGate}
              disabled={isLotFull || isGateOpen || gateLoading}
              className={`w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-[12px] font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 border shadow-sm transition-all ${
                isLotFull
                  ? 'bg-[#F1F5F9] border-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                  : isGateOpen
                  ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] cursor-not-allowed'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] border-[#1D4ED8] text-white cursor-pointer shadow-md'
              }`}
            >
              <Play className="w-4 h-4 shrink-0" />
              <span>
                {gateLoading 
                  ? 'Sending Command...' 
                  : isLotFull 
                  ? 'Gate Locked (Lot Full)' 
                  : isGateOpen 
                  ? 'Gate Open (Auto-Closing)' 
                  : 'Trigger Gate (Test Cycle)'}
              </span>
            </motion.button>

            {/* Gate Feedback Banner */}
            <AnimatePresence>
              {gateFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className={`p-3 rounded-[12px] border text-xs font-bold text-center ${
                    gateFeedback.success
                      ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46]'
                      : 'bg-[#FEF2F2] border-[#EF4444] text-[#991B1B]'
                  }`}
                >
                  {gateFeedback.message}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        {/* Right Column: Capacity Breakdown & Recent Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          {/* Capacity Summary */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 14px 28px -5px rgba(15,23,42,0.08)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="bg-white rounded-[16px] sm:rounded-[18px] border border-[#E2E8F0] p-4 sm:p-6 shadow-card space-y-3.5 sm:space-y-4 transition-colors hover:border-[#3B82F6]/50"
          >
            <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Technical Capacity
              </h3>
              <span className="text-xs font-bold text-[#10B981]">
                {metrics.availabilityPercent}% Available
              </span>
            </div>

            <div className="space-y-2 text-xs font-semibold text-[#64748B]">
              <motion.div 
                whileHover={{ x: 4, scale: 1.01, backgroundColor: '#EFF6FF' }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-default"
              >
                <span>Total Monitored Slots</span>
                <span className="font-mono font-black text-[#0F172A]">{metrics.total}</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 4, scale: 1.01, backgroundColor: '#ECFDF5' }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-default"
              >
                <span>Available Slots</span>
                <span className="font-mono font-black text-[#10B981]">{metrics.available}</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 4, scale: 1.01, backgroundColor: '#FFFBEB' }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-default"
              >
                <span>Reserved Slots</span>
                <span className="font-mono font-black text-[#F59E0B]">{metrics.reserved}</span>
              </motion.div>
              <motion.div 
                whileHover={{ x: 4, scale: 1.01, backgroundColor: '#FEF2F2' }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] cursor-default"
              >
                <span>Occupied Slots</span>
                <span className="font-mono font-black text-[#EF4444]">{metrics.occupied}</span>
              </motion.div>
            </div>

            {/* Segmented Capacity Meter */}
            <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden border border-[#CBD5E1]/40 flex">
              <div style={{ width: `${(metrics.available / metrics.total) * 100}%` }} className="bg-[#10B981] transition-all" />
              <div style={{ width: `${(metrics.reserved / metrics.total) * 100}%` }} className="bg-[#F59E0B] transition-all" />
              <div style={{ width: `${(metrics.occupied / metrics.total) * 100}%` }} className="bg-[#EF4444] transition-all" />
            </div>
          </motion.div>

          {/* Up to 5 Recent Facility Events */}
          <motion.div 
            whileHover={{ y: -3, scale: 1.01, boxShadow: '0 14px 28px -5px rgba(15,23,42,0.08)' }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="bg-white rounded-[16px] sm:rounded-[18px] border border-[#E2E8F0] p-4 sm:p-6 shadow-card space-y-3 transition-colors hover:border-[#3B82F6]/50"
          >
            <div className="pb-3 border-b border-[#E2E8F0] flex items-center justify-between">
              <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
                Live Event Stream
              </h3>
              <span className="text-[10px] font-bold text-[#64748B]">Latest 5 events</span>
            </div>

            {activities.length === 0 ? (
              <div className="py-4 text-center text-xs text-[#64748B] italic">
                No activity logged yet.
              </div>
            ) : (
              <div className="space-y-2">
                {activities.map((event, idx) => (
                  <motion.div
                    key={event.id || idx}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileHover={{ x: 3, scale: 1.01, boxShadow: '0 4px 12px -2px rgba(15,23,42,0.08)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className="p-2.5 rounded-[10px] bg-[#F8FAFC] border border-[#E2E8F0] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 shadow-2xs cursor-default"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                      <span className="font-semibold text-[#0F172A] truncate">
                        {event.message}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#64748B] whitespace-nowrap self-end sm:self-auto shrink-0">
                      {formatTime(event.timestamp)}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
