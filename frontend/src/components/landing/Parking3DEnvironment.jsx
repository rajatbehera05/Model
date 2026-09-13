import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

// -------------------------------------------------------------
// 1. REALISTIC VEHICLE MODEL (METALLIC FINISH, WHEELS, GLASS, LIGHTS)
// -------------------------------------------------------------
function RealisticCar({
  color = '#FFFFFF',
  isMetallic = false,
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}) {
  const wheelGeom = useMemo(() => new THREE.CylinderGeometry(0.32, 0.32, 0.24, 24), []);
  const rimGeom = useMemo(() => new THREE.CylinderGeometry(0.19, 0.19, 0.25, 16), []);

  return (
    <group position={position} rotation={rotation}>
      {/* Contact Ground Shadow directly under chassis */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.1, 4.0]} />
        <meshBasicMaterial color="#020617" opacity={0.4} transparent />
      </mesh>

      {/* Main Lower Aerodynamic Chassis */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.82, 0.48, 3.8]} />
        <meshStandardMaterial
          color={color}
          metalness={isMetallic ? 0.7 : 0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Upper Passenger Greenhouse / Cabin */}
      <mesh position={[0, 0.88, -0.15]} castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.52, 2.3]} />
        <meshStandardMaterial
          color={color}
          metalness={isMetallic ? 0.7 : 0.2}
          roughness={0.2}
        />
      </mesh>

      {/* Front Windshield (Raked Angle) */}
      <mesh position={[0, 0.9, 0.95]} rotation={[-0.38, 0, 0]}>
        <boxGeometry args={[1.44, 0.5, 0.08]} />
        <meshStandardMaterial color="#0F172A" roughness={0.08} metalness={0.9} />
      </mesh>
      {/* Rear Window */}
      <mesh position={[0, 0.9, -1.25]} rotation={[0.38, 0, 0]}>
        <boxGeometry args={[1.44, 0.5, 0.08]} />
        <meshStandardMaterial color="#0F172A" roughness={0.08} metalness={0.9} />
      </mesh>
      {/* Side Windows */}
      <mesh position={[0.74, 0.88, -0.15]}>
        <boxGeometry args={[0.08, 0.42, 2.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.08} metalness={0.9} />
      </mesh>
      <mesh position={[-0.74, 0.88, -0.15]}>
        <boxGeometry args={[0.08, 0.42, 2.0]} />
        <meshStandardMaterial color="#0F172A" roughness={0.08} metalness={0.9} />
      </mesh>

      {/* Panoramic Sunroof */}
      <mesh position={[0, 1.15, -0.15]}>
        <boxGeometry args={[1.1, 0.02, 1.5]} />
        <meshStandardMaterial color="#020617" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* Dual Projector LED Headlights (Crisp White Glow) */}
      <mesh position={[0.65, 0.46, 1.9]}>
        <boxGeometry args={[0.36, 0.14, 0.08]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[-0.65, 0.46, 1.9]}>
        <boxGeometry args={[0.36, 0.14, 0.08]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#FFFFFF" emissiveIntensity={1.0} />
      </mesh>

      {/* Full-Width Rear LED Taillight Bar (Vibrant Crimson Red) */}
      <mesh position={[0, 0.5, -1.9]}>
        <boxGeometry args={[1.65, 0.12, 0.08]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={1.0} />
      </mesh>

      {/* 4 Rubber Tires with Multi-Spoke Alloy Rims */}
      {/* Front Left */}
      <group position={[0.92, 0.32, 1.15]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={wheelGeom}>
          <meshStandardMaterial color="#1E293B" roughness={0.85} />
        </mesh>
        <mesh geometry={rimGeom}>
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
      {/* Front Right */}
      <group position={[-0.92, 0.32, 1.15]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={wheelGeom}>
          <meshStandardMaterial color="#1E293B" roughness={0.85} />
        </mesh>
        <mesh geometry={rimGeom}>
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
      {/* Rear Left */}
      <group position={[0.92, 0.32, -1.15]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={wheelGeom}>
          <meshStandardMaterial color="#1E293B" roughness={0.85} />
        </mesh>
        <mesh geometry={rimGeom}>
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
      {/* Rear Right */}
      <group position={[-0.92, 0.32, -1.15]} rotation={[0, 0, Math.PI / 2]}>
        <mesh geometry={wheelGeom}>
          <meshStandardMaterial color="#1E293B" roughness={0.85} />
        </mesh>
        <mesh geometry={rimGeom}>
          <meshStandardMaterial color="#CBD5E1" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 2. IOT OPTICAL IR SENSOR BOLLARD (HARDWARE OCCUPANCY SENSOR)
// -------------------------------------------------------------
function IRSensorBollard({ status = 'Available', position = [0, 0, 0] }) {
  const isAvailable = status === 'Available';
  const isReserved = status === 'Reserved';
  const statusColor = isAvailable ? '#10B981' : isReserved ? '#F59E0B' : '#EF4444';

  return (
    <group position={position}>
      {/* Metallic Sensor Post Base */}
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.44, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.25} />
      </mesh>

      {/* Optical Sensor Housing Head */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <boxGeometry args={[0.18, 0.14, 0.16]} />
        <meshStandardMaterial color="#0F172A" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* IR Transmitter & Receiver Optical Lens */}
      <mesh position={[0, 0.48, 0.085]}>
        <cylinderGeometry args={[0.035, 0.035, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Active Sensor Status LED (Green = clear, Red = detected, Amber = reserved) */}
      <mesh position={[0, 0.57, 0]}>
        <sphereGeometry args={[0.045, 16, 16]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={1.4}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 3. AUTOMATIC BARRIER GATE SYSTEM (PEDESTAL + STRIPED ARM)
// -------------------------------------------------------------
function AutomaticBarrierGate({ position = [0, 0, 0] }) {
  const armRef = useRef();

  // Subtle breathing motion on the barrier arm
  useFrame((state) => {
    if (armRef.current) {
      const t = state.clock.getElapsedTime();
      armRef.current.rotation.z = Math.sin(t * 1.3) * 0.04 + 0.02;
    }
  });

  return (
    <group position={position}>
      {/* Sleek Dark Slate Gate Pedestal */}
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.48, 1.4, 0.48]} />
        <meshStandardMaterial color="#0F172A" metalness={0.5} roughness={0.25} />
      </mesh>

      {/* Gate Top Bevel Cap with Status Indicator Light */}
      <mesh position={[0, 1.42, 0]}>
        <boxGeometry args={[0.5, 0.06, 0.5]} />
        <meshStandardMaterial color="#2563EB" metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Gate Faceplate LED (Green Status Dot) */}
      <mesh position={[0, 1.15, 0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={1.3} />
      </mesh>

      {/* Rotating Servo Pivot Housing */}
      <group position={[-0.24, 1.05, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.13, 0.13, 0.18, 20]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Barrier Arm spanning across the entrance lane (negative X direction) */}
        <group ref={armRef}>
          {[0, 0.45, 0.9, 1.35, 1.8, 2.25].map((offset, i) => (
            <mesh key={i} position={[-(offset + 0.22), 0, 0]}>
              <boxGeometry args={[0.44, 0.1, 0.06]} />
              <meshStandardMaterial
                color={i % 2 === 0 ? '#E11D48' : '#FFFFFF'}
                emissive={i % 2 === 0 ? '#E11D48' : '#000000'}
                emissiveIntensity={i % 2 === 0 ? 0.35 : 0}
                roughness={0.3}
              />
            </mesh>
          ))}
        </group>
      </group>
    </group>
  );
}

// -------------------------------------------------------------
// 4. ENTRANCE TOTEM SIGN "P Smart Parking"
// -------------------------------------------------------------
function EntranceSignTotem({ position = [0, 0, 0] }) {
  return (
    <group position={position}>
      {/* Concrete Foundation Base */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.85, 0.3, 0.55]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.6} />
      </mesh>

      {/* Main Totem Pylon */}
      <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.72, 2.8, 0.3]} />
        <meshStandardMaterial color="#1E293B" metalness={0.5} roughness={0.25} />
      </mesh>

      {/* Blue "P" Emblem Shield */}
      <mesh position={[0, 2.55, 0.16]}>
        <boxGeometry args={[0.45, 0.45, 0.04]} />
        <meshStandardMaterial color="#2563EB" metalness={0.4} roughness={0.25} />
      </mesh>

      {/* 3D "P" Letter */}
      <Text
        position={[0, 2.53, 0.19]}
        fontSize={0.3}
        color="#FFFFFF"
        fontWeight="black"
        anchorX="center"
        anchorY="middle"
      >
        P
      </Text>

      {/* "Smart" Text */}
      <Text
        position={[0, 1.95, 0.16]}
        fontSize={0.12}
        color="#F8FAFC"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        Smart
      </Text>

      {/* "Parking" Text */}
      <Text
        position={[0, 1.75, 0.16]}
        fontSize={0.12}
        color="#94A3B8"
        fontWeight="bold"
        anchorX="center"
        anchorY="middle"
      >
        Parking
      </Text>
    </group>
  );
}

// -------------------------------------------------------------
// 5. MINIATURE ARCHITECTURAL TREES & PLANTERS
// -------------------------------------------------------------
function MiniatureTree({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      {/* Planter Pot */}
      <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.3, 0.36, 16]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>

      {/* Trunk */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.7, 10]} />
        <meshStandardMaterial color="#4A3525" roughness={0.9} />
      </mesh>

      {/* Lush Green Foliage Clusters */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <sphereGeometry args={[0.48, 16, 16]} />
        <meshStandardMaterial color="#2D6A4F" roughness={0.75} />
      </mesh>
      <mesh position={[0.18, 1.5, -0.1]} castShadow>
        <sphereGeometry args={[0.38, 14, 14]} />
        <meshStandardMaterial color="#40916C" roughness={0.75} />
      </mesh>
      <mesh position={[-0.14, 1.38, 0.14]} castShadow>
        <sphereGeometry args={[0.34, 14, 14]} />
        <meshStandardMaterial color="#52B788" roughness={0.75} />
      </mesh>
    </group>
  );
}

// -------------------------------------------------------------
// 6. PARKING BAY WITH GROUND MARKING, EMBEDDED GLOW & SENSOR
// -------------------------------------------------------------
function ParkingBaySlot({ slotId, status, position }) {
  const isAvailable = status === 'Available';
  const isReserved = status === 'Reserved';
  const isOccupied = status === 'Occupied';

  const glowColor = isAvailable ? '#10B981' : isReserved ? '#F59E0B' : '#EF4444';
  const emissiveColor = isAvailable ? '#059669' : isReserved ? '#D97706' : '#DC2626';

  return (
    <group position={position}>
      {/* Bay Surface Area Decal */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.3, 4.3]} />
        <meshStandardMaterial
          color={isAvailable ? '#ECFDF5' : isReserved ? '#FFFBEB' : '#1E293B'}
          emissive={glowColor}
          emissiveIntensity={isAvailable ? 0.28 : isReserved ? 0.22 : 0.06}
          roughness={0.4}
        />
      </mesh>

      {/* Illuminated Boundary Strip Lines (Left, Right, Back Curb) */}
      <mesh position={[-1.14, 0.014, 0]}>
        <boxGeometry args={[0.08, 0.02, 4.2]} />
        <meshStandardMaterial color={glowColor} emissive={emissiveColor} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[1.14, 0.014, 0]}>
        <boxGeometry args={[0.08, 0.02, 4.2]} />
        <meshStandardMaterial color={glowColor} emissive={emissiveColor} emissiveIntensity={0.9} />
      </mesh>
      <mesh position={[0, 0.014, -2.1]}>
        <boxGeometry args={[2.28, 0.02, 0.08]} />
        <meshStandardMaterial color={glowColor} emissive={emissiveColor} emissiveIntensity={0.9} />
      </mesh>

      {/* Prominent Ground Slot Identifier (P1, P2, P3) */}
      <Text
        position={[0, 0.02, 1.25]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.52}
        color={isOccupied ? '#94A3B8' : glowColor}
        fontWeight="black"
        anchorX="center"
        anchorY="middle"
      >
        {slotId}
      </Text>

      {/* Subtle Integrated Ground Indicator for Open/Reserved */}
      {isAvailable && (
        <Text
          position={[0, 0.02, -0.1]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.28}
          color="#10B981"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          [ AVAILABLE ]
        </Text>
      )}

      {isReserved && (
        <Text
          position={[0, 0.02, -0.1]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.28}
          color="#F59E0B"
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
        >
          [ RESERVED ]
        </Text>
      )}

      {/* Dedicated IoT Optical IR Sensor Bollard at curb head */}
      <IRSensorBollard status={status} position={[0, 0, -2.25]} />
    </group>
  );
}

// -------------------------------------------------------------
// 7. COMPOSITE SMART PARKING FACILITY (CONTINUOUS ENTRANCE → ROAD → BAYS)
// -------------------------------------------------------------
export function Parking3DEnvironment() {
  const rootRef = useRef();

  // Very slow, subtle camera float for a breathing technology demo feel
  useFrame((state) => {
    if (rootRef.current) {
      const t = state.clock.getElapsedTime();
      rootRef.current.position.y = Math.sin(t * 0.6) * 0.03;
    }
  });

  return (
    <group ref={rootRef} position={[0, -0.2, 0]}>
      {/* ------------------------------------------------------------- */}
      {/* A. TWO-LANE ENTRANCE DRIVEWAY (ASPHALT SURFACE WITH MARKINGS) */}
      {/* ------------------------------------------------------------- */}
      <mesh position={[-2.3, 0, 0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[3.2, 9.4]} />
        <meshStandardMaterial color="#1A202C" roughness={0.85} metalness={0.15} />
      </mesh>

      {/* Double Yellow Road Divider Lines */}
      <mesh position={[-2.95, 0.005, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.07, 9.0]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.3} />
      </mesh>
      <mesh position={[-3.1, 0.005, 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.07, 9.0]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.3} />
      </mesh>

      {/* Painted White Directional Entry Arrow pointing toward barrier */}
      <group position={[-2.1, 0.006, 2.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[0.16, 1.2]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.65, 0]} rotation={[0, 0, Math.PI / 4]}>
          <planeGeometry args={[0.42, 0.42]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.4} />
        </mesh>
      </group>

      {/* ------------------------------------------------------------- */}
      {/* B. RAISED ARCHITECTURAL CONCRETE PARKING PLATFORM             */}
      {/* ------------------------------------------------------------- */}
      {/* Main Concrete Slab */}
      <mesh position={[2.9, 0.16, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.32, 9.0]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.6} metalness={0.1} />
      </mesh>

      {/* Smooth Chamfered Platform Curb Edge facing driveway */}
      <mesh position={[-0.78, 0.2, 0.2]} castShadow>
        <boxGeometry args={[0.22, 0.38, 9.0]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.5} />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* C. PERIMETER BOUNDARY WALL WITH TRANSPARENT GLASS BALUSTRADE  */}
      {/* ------------------------------------------------------------- */}
      {/* Back Boundary Wall */}
      <mesh position={[2.9, 0.55, -4.2]} castShadow receiveShadow>
        <boxGeometry args={[7.4, 0.48, 0.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>
      {/* Glass Balustrade Back */}
      <mesh position={[2.9, 0.96, -4.2]}>
        <boxGeometry args={[7.2, 0.48, 0.04]} />
        <meshPhysicalMaterial
          color="#E0E7FF"
          transmission={0.9}
          roughness={0.08}
          metalness={0.1}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* Right Boundary Wall */}
      <mesh position={[6.5, 0.55, 0.2]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.48, 9.0]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.5} />
      </mesh>
      {/* Glass Balustrade Right */}
      <mesh position={[6.5, 0.96, 0.2]}>
        <boxGeometry args={[0.04, 0.48, 8.8]} />
        <meshPhysicalMaterial
          color="#E0E7FF"
          transmission={0.9}
          roughness={0.08}
          metalness={0.1}
          transparent
          opacity={0.45}
        />
      </mesh>

      {/* ------------------------------------------------------------- */}
      {/* D. THE THREE PROMINENT PARKING BAYS: P1, P2, P3               */}
      {/* ------------------------------------------------------------- */}
      {/* Slot P1: AVAILABLE (Empty Bay, Glowing Green) */}
      <ParkingBaySlot
        slotId="P1"
        status="Available"
        position={[0.6, 0.32, -1.3]}
      />

      {/* Slot P2: OCCUPIED (Realistic White SUV parked inside) */}
      <ParkingBaySlot
        slotId="P2"
        status="Occupied"
        position={[3.0, 0.32, -1.3]}
      />
      {/* The White SUV Vehicle parked in Bay P2 */}
      <RealisticCar
        color="#FFFFFF"
        isMetallic={false}
        position={[3.0, 0.34, -1.3]}
        rotation={[0, 0, 0]}
      />

      {/* Slot P3: RESERVED (Reserved Bay, Glowing Amber / Violet) */}
      <ParkingBaySlot
        slotId="P3"
        status="Reserved"
        position={[5.4, 0.32, -1.3]}
      />

      {/* ------------------------------------------------------------- */}
      {/* E. APPROACHING VEHICLE AT ENTRANCE ROAD (CHARCOAL SEDAN)      */}
      {/* ------------------------------------------------------------- */}
      <RealisticCar
        color="#334155"
        isMetallic={true}
        position={[-2.1, 0.02, 3.4]}
        rotation={[0, 0, 0]}
      />

      {/* ------------------------------------------------------------- */}
      {/* F. AUTOMATIC BARRIER GATE (PIVOT + STRIPED ARM OVER DRIVEWAY) */}
      {/* ------------------------------------------------------------- */}
      <AutomaticBarrierGate position={[-0.78, 0.32, 0.8]} />

      {/* ------------------------------------------------------------- */}
      {/* G. ENTRANCE TOTEM SIGN "P Smart Parking"                      */}
      {/* ------------------------------------------------------------- */}
      <EntranceSignTotem position={[-0.78, 0.32, -1.6]} />

      {/* ------------------------------------------------------------- */}
      {/* H. MINIATURE LANDSCAPING TREES                                */}
      {/* ------------------------------------------------------------- */}
      <MiniatureTree position={[5.8, 0.32, -3.5]} scale={1.25} />
      <MiniatureTree position={[5.9, 0.32, 3.8]} scale={1.15} />
      <MiniatureTree position={[-0.5, 0.32, -3.5]} scale={0.95} />
    </group>
  );
}
