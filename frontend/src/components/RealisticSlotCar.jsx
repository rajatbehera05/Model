import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

/**
 * Realistic Top-Down Vehicle Component with Authentic License Plate & Live Parked Time
 * Reusable across Dashboard and Parking Page
 */
export function RealisticSlotCar({ slotId, plateNumber, parkedAt }) {
  const defaultPlates = {
    P1: 'DL 08 CQ 4092',
    P2: 'MH 12 AB 8819',
    P3: 'KA 05 MN 3321'
  };

  const displayPlate = plateNumber || defaultPlates[slotId] || 'DL 08 CQ 4092';

  // Live parked duration counter
  const [elapsedText, setElapsedText] = useState('Just now');

  useEffect(() => {
    const updateElapsed = () => {
      if (!parkedAt) {
        setElapsedText('Just now');
        return;
      }
      try {
        const diffMs = Date.now() - new Date(parkedAt).getTime();
        const totalSecs = Math.max(0, Math.floor(diffMs / 1000));
        const mins = Math.floor(totalSecs / 60);
        const secs = totalSecs % 60;

        if (mins < 1) {
          setElapsedText(`${secs}s ago`);
        } else if (mins < 60) {
          setElapsedText(`${mins}m ${secs}s`);
        } else {
          const hours = Math.floor(mins / 60);
          setElapsedText(`${hours}h ${mins % 60}m`);
        }
      } catch {
        setElapsedText('Just now');
      }
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [parkedAt]);

  const carStyles = {
    P1: {
      bodyGrad: ['#FFFFFF', '#E2E8F0', '#94A3B8'],
      stroke: '#64748B',
      glass: '#0F172A',
      glassTrim: '#38BDF8',
      taillight: '#EF4444',
      name: 'Sedan (White)'
    },
    P2: {
      bodyGrad: ['#2563EB', '#1D4ED8', '#1E3A8A'],
      stroke: '#1E40AF',
      glass: '#020617',
      glassTrim: '#60A5FA',
      taillight: '#F43F5E',
      name: 'Sedan (Blue)'
    },
    P3: {
      bodyGrad: ['#E11D48', '#BE123C', '#881337'],
      stroke: '#9F1239',
      glass: '#09090B',
      glassTrim: '#FB7185',
      taillight: '#EF4444',
      name: 'Coupe (Red)'
    }
  };

  const style = carStyles[slotId] || carStyles.P1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -25, scale: 0.92 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col items-center justify-center select-none"
    >
      {/* 1. Top-down SVG Vehicle Graphic */}
      <div className="w-28 sm:w-32 h-44 sm:h-48 relative flex items-center justify-center">
        <svg
          viewBox="0 0 160 260"
          className="w-full h-full drop-shadow-[0_12px_20px_rgba(0,0,0,0.28)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`carGrad-${slotId}`} x1="20" y1="15" x2="140" y2="245" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={style.bodyGrad[0]} />
              <stop offset="50%" stopColor={style.bodyGrad[1]} />
              <stop offset="100%" stopColor={style.bodyGrad[2]} />
            </linearGradient>

            <filter id={`shadow-${slotId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
            </filter>
          </defs>

          {/* Ground Contact Shadow */}
          <ellipse cx="80" cy="135" rx="66" ry="110" fill="#0F172A" fillOpacity="0.25" filter={`url(#shadow-${slotId})`} />

          {/* Tires with Alloy Rims */}
          <rect x="8" y="40" width="18" height="42" rx="7" fill="#1E293B" />
          <rect x="12" y="48" width="8" height="26" rx="3" fill="#64748B" />

          <rect x="134" y="40" width="18" height="42" rx="7" fill="#1E293B" />
          <rect x="140" y="48" width="8" height="26" rx="3" fill="#64748B" />

          <rect x="8" y="175" width="18" height="42" rx="7" fill="#1E293B" />
          <rect x="12" y="183" width="8" height="26" rx="3" fill="#64748B" />

          <rect x="134" y="175" width="18" height="42" rx="7" fill="#1E293B" />
          <rect x="140" y="183" width="8" height="26" rx="3" fill="#64748B" />

          {/* Aerodynamic Vehicle Body Shell */}
          <path
            d="M24 60 C24 24, 46 12, 80 12 C114 12, 136 24, 136 60 L138 200 C138 238, 114 250, 80 250 C46 250, 22 238, 22 200 Z"
            fill={`url(#carGrad-${slotId})`}
            stroke={style.stroke}
            strokeWidth="2"
          />

          {/* Hood Contours */}
          <path d="M38 52 C58 46, 102 46, 122 52" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M48 24 L54 62" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          <path d="M112 24 L106 62" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />

          {/* LED Headlights */}
          <polygon points="28,22 46,18 44,28 28,32" fill={style.glassTrim} fillOpacity="0.9" />
          <polygon points="132,22 114,18 116,28 132,32" fill={style.glassTrim} fillOpacity="0.9" />

          {/* Tinted Front Windshield */}
          <path
            d="M32 72 C46 65, 114 65, 128 72 L120 108 C104 104, 56 104, 40 108 Z"
            fill={style.glass}
            stroke="#334155"
            strokeWidth="1.5"
          />
          <line x1="34" y1="74" x2="44" y2="106" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />

          {/* Roof & Sunroof */}
          <path d="M40 108 C56 104, 104 104, 120 108 L118 174 C102 176, 58 176, 42 174 Z" fill="#0F172A" />
          <rect x="48" y="114" width="64" height="52" rx="4" fill="#020617" stroke="#334155" strokeWidth="1" />

          {/* Tinted Rear Windshield */}
          <path
            d="M42 174 C58 176, 102 176, 118 174 L126 206 C110 210, 50 210, 34 206 Z"
            fill={style.glass}
            stroke="#334155"
            strokeWidth="1.5"
          />

          {/* Side Mirrors */}
          <polygon points="18,76 10,72 10,82 18,84" fill={style.stroke} />
          <polygon points="142,76 150,72 150,82 142,84" fill={style.stroke} />

          {/* Rear LED Taillight Bar */}
          <path d="M30 240 C58 246, 102 246, 130 240" stroke={style.taillight} strokeWidth="4" strokeLinecap="round" />
          <path d="M30 240 C58 246, 102 246, 130 240" stroke="#FECDD3" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* 2. AUTHENTIC HIGH-RESOLUTION LICENSE NUMBER PLATE */}
      <div className="mt-2.5 flex items-stretch shadow-md border-[1.5px] border-[#1E293B] rounded-[5px] overflow-hidden bg-white">
        {/* Left IND Blue Flag Strip */}
        <div className="bg-[#003399] text-white px-1.5 py-0.5 flex flex-col items-center justify-center leading-none">
          <span className="text-[7px] font-black tracking-tighter">IND</span>
          <span className="w-1.5 h-1.5 rounded-full border-[1px] border-yellow-300 mt-0.5" />
        </div>
        {/* Embossed Registration Plate Text */}
        <div className="px-2.5 py-0.5 font-mono font-black text-xs sm:text-[13px] tracking-wider text-[#0F172A] bg-[#FFFBEB] flex items-center">
          {displayPlate}
        </div>
      </div>

      {/* 3. LIVE PARKED DURATION BADGE */}
      <div className="mt-1.5 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0F172A] text-white text-[10px] font-mono font-bold shadow-xs border border-[#334155]/40">
        <Clock className="w-3 h-3 text-[#94A3B8] shrink-0" />
        <span>Parked: <strong className="text-[#38BDF8] font-extrabold">{elapsedText}</strong></span>
      </div>
    </motion.div>
  );
}
