import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export function DigitalSignalBackground() {
  const shouldReduceMotion = useReducedMotion();

  // 6 carefully designed digital signal paths that gently wrap around the Hero and transition into System Features
  const paths = [
    {
      id: 'path-top-left',
      d: 'M -40 150 C 220 80, 480 85, 620 180 C 690 230, 710 320, 730 380',
      duration: 14,
      delay: 0,
      nodes: [
        { cx: 480, cy: 88, delay: 0.2 },
        { cx: 620, cy: 180, delay: 1.4 },
      ]
    },
    {
      id: 'path-left-sweep',
      d: 'M -30 400 C 90 350, 160 480, 240 600 C 330 730, 520 740, 680 660',
      duration: 16,
      delay: 2,
      nodes: [
        { cx: 75, cy: 355, delay: 0.6 },
        { cx: 240, cy: 600, delay: 1.8 },
        { cx: 550, cy: 710, delay: 2.6 },
      ]
    },
    {
      id: 'path-center-down',
      d: 'M 620 320 C 640 460, 580 620, 720 750 C 820 840, 980 830, 1140 780',
      duration: 18,
      delay: 4,
      nodes: [
        { cx: 610, cy: 490, delay: 0.8 },
        { cx: 720, cy: 750, delay: 2.2 },
      ]
    },
    {
      id: 'path-right-top',
      d: 'M 880 180 C 1040 120, 1220 140, 1490 220',
      duration: 13,
      delay: 1,
      nodes: [
        { cx: 1060, cy: 135, delay: 0.4 },
        { cx: 1330, cy: 185, delay: 1.6 },
      ]
    },
    {
      id: 'path-right-lateral',
      d: 'M 980 360 C 1120 320, 1280 440, 1490 370',
      duration: 15,
      delay: 3,
      nodes: [
        { cx: 1220, cy: 390, delay: 1.2 },
      ]
    },
    {
      id: 'path-bottom-wave',
      d: 'M -40 760 C 260 780, 520 820, 720 770 C 960 710, 1200 810, 1490 730',
      duration: 20,
      delay: 5,
      nodes: [
        { cx: 260, cy: 775, delay: 0.5 },
        { cx: 950, cy: 715, delay: 2.0 },
        { cx: 1360, cy: 755, delay: 3.2 },
      ]
    }
  ];

  return (
    <div
      aria-hidden="true"
      className="absolute top-0 left-0 w-full h-[1200px] pointer-events-none overflow-hidden select-none -z-5"
    >
      <svg
        viewBox="0 0 1440 1000"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
        preserveAspectRatio="xMidYMin slice"
      >
        <defs>
          {/* Subtle soft blue glow filter for traveling pulses */}
          <filter id="pulse-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Node halo gradient */}
          <radialGradient id="node-halo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.35" />
            <stop offset="60%" stopColor="#60A5FA" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#93C5FD" stopOpacity="0" />
          </radialGradient>
        </defs>

        {paths.map((p) => (
          <g key={p.id}>
            {/* 1. Base Thin Signal Route */}
            <path
              d={p.d}
              stroke="#60A5FA"
              strokeWidth="1.2"
              strokeOpacity="0.28"
              strokeLinecap="round"
            />

            {/* 2. Traveling Smooth Light Pulse (Framer Motion) */}
            <motion.path
              d={p.d}
              stroke="#2563EB"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeOpacity="0.8"
              strokeDasharray="24 320"
              filter="url(#pulse-glow)"
              animate={
                shouldReduceMotion
                  ? {}
                  : { strokeDashoffset: [0, -688] }
              }
              transition={{
                duration: p.duration,
                repeat: Infinity,
                ease: 'linear',
                delay: p.delay,
              }}
            />

            {/* 3. Telemetry Nodes along the Path */}
            {p.nodes.map((node, i) => (
              <g key={`${p.id}-node-${i}`}>
                {/* Soft breathing halo ring */}
                <motion.circle
                  cx={node.cx}
                  cy={node.cy}
                  r="14"
                  fill="url(#node-halo)"
                  animate={
                    shouldReduceMotion
                      ? { opacity: 0.15 }
                      : {
                          scale: [1, 1.35, 1],
                          opacity: [0.15, 0.45, 0.15],
                        }
                  }
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: node.delay,
                  }}
                />

                {/* Outer crisp circle ring */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="5"
                  fill="#FFFFFF"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeOpacity="0.55"
                />

                {/* Inner solid signal point */}
                <circle
                  cx={node.cx}
                  cy={node.cy}
                  r="2.5"
                  fill="#2563EB"
                />
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
