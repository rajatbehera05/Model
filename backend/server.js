/**
 * ==============================================================================
 * Project: Smart Parking System (3-Slot Prototype)
 * Phase: Phase 3 - Backend Development
 * Runtime: Node.js 18+ / Express.js
 * Storage: In-memory application state
 *
 * Description:
 * Source of truth for 3-slot parking facility (P1, P2, P3).
 * Provides RESTful JSON APIs for:
 *  - Full system status telemetry (metrics, slots, gate, LED, ESP32 status)
 *  - Hardware sensor synchronization & transition handling
 *  - Deterministic automatic slot assignment (P1 -> P2 -> P3)
 *  - User slot reservation with 409 conflict protection
 *  - Automated gate barrier trigger & auto-close logic
 *  - 5-second ESP32 connectivity watchdog
 *  - Rolling 5-event recent activity log
 * ==============================================================================
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend and JSON request parsing
app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// In-Memory Parking State
// -----------------------------------------------------------------------------
const TOTAL_SLOTS = 3;
const VALID_SLOT_IDS = ['P1', 'P2', 'P3'];

const DEFAULT_PLATES = {
  P1: 'DL 08 CQ 4092',
  P2: 'MH 12 AB 8819',
  P3: 'KA 05 MN 3321'
};

const nowMs = Date.now();
let slots = {
  P1: { 
    id: 'P1', 
    status: 'Occupied', 
    sensorDetected: true, 
    lastUpdated: new Date(nowMs - 28 * 60 * 1000).toISOString(), 
    plateNumber: DEFAULT_PLATES.P1, 
    parkedAt: new Date(nowMs - 28 * 60 * 1000).toISOString() 
  },
  P2: { 
    id: 'P2', 
    status: 'Occupied', 
    sensorDetected: true, 
    lastUpdated: new Date(nowMs - 14 * 60 * 1000).toISOString(), 
    plateNumber: DEFAULT_PLATES.P2, 
    parkedAt: new Date(nowMs - 14 * 60 * 1000).toISOString() 
  },
  P3: { 
    id: 'P3', 
    status: 'Available', 
    sensorDetected: false, 
    lastUpdated: new Date().toISOString(), 
    plateNumber: null, 
    parkedAt: null 
  }
};

let gateState = {
  state: 'Closed', // 'Closed' (0 deg) or 'Open' (90 deg)
  autoCloseTimer: null
};

let esp32State = {
  lastHeartbeat: null,       // Unix epoch ms for real hardware
  lastSimulatorHeartbeat: null, // Unix epoch ms for simulator
  timeoutMs: 5000            // 5 seconds watchdog
};

let recentActivity = [
  {
    id: `${nowMs}-p2`,
    timestamp: new Date(nowMs - 14 * 60 * 1000).toISOString(),
    type: 'SLOT_OCCUPIED',
    message: `Slot P2 occupied by [${DEFAULT_PLATES.P2}].`
  },
  {
    id: `${nowMs}-p1`,
    timestamp: new Date(nowMs - 28 * 60 * 1000).toISOString(),
    type: 'SLOT_OCCUPIED',
    message: `Slot P1 occupied by [${DEFAULT_PLATES.P1}].`
  }
];

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Log activity event maintaining rolling buffer of maximum 5 events.
 */
function logActivity(type, message) {
  const event = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toISOString(),
    type,
    message
  };

  recentActivity.unshift(event);
  if (recentActivity.length > 5) {
    recentActivity.pop();
  }
}

/**
 * Calculate slot counts and availability percentage strictly per PRD:
 * Available = 3 - (Occupied + Reserved)
 * Availability % = (Available / 3) * 100
 */
function calculateMetrics() {
  const slotList = Object.values(slots);
  const total = TOTAL_SLOTS;
  const occupied = slotList.filter(s => s.status === 'Occupied').length;
  const reserved = slotList.filter(s => s.status === 'Reserved').length;
  const available = total - (occupied + reserved);
  const availabilityPercent = Math.round((available / total) * 100);

  return {
    total,
    available,
    reserved,
    occupied,
    availabilityPercent
  };
}

/**
 * Check ESP32 connectivity status based on 5-second watchdog.
 * Distinguishes between real hardware and simulator to avoid false hardware reporting.
 */
function getEsp32Status() {
  const now = Date.now();
  const isRealConnected = esp32State.lastHeartbeat !== null && (now - esp32State.lastHeartbeat <= esp32State.timeoutMs);
  const isSimulatorActive = esp32State.lastSimulatorHeartbeat !== null && (now - esp32State.lastSimulatorHeartbeat <= esp32State.timeoutMs);

  return {
    connected: isRealConnected, // STRICT: Only true if real hardware synced
    simulatorActive: isSimulatorActive,
    mode: isRealConnected ? 'Hardware' : (isSimulatorActive ? 'Simulator' : 'Disconnected'),
    lastHeartbeat: esp32State.lastHeartbeat ? new Date(esp32State.lastHeartbeat).toISOString() : null,
    secondsSinceHeartbeat: esp32State.lastHeartbeat ? Math.floor((now - esp32State.lastHeartbeat) / 1000) : null
  };
}

/**
 * Master LED logic per PRD:
 * Available >= 1 -> LED ON (true)
 * Available == 0 -> LED OFF (false)
 */
function getLedState() {
  const metrics = calculateMetrics();
  return {
    on: metrics.available >= 1
  };
}

/**
 * Helper to parse sensor input into boolean detected state.
 * Supports:
 *  - Active-LOW hardware / simulator representations:
 *    0, "0", "LOW", "low" -> true (Vehicle Detected / Obstacle Present)
 *    1, "1", "HIGH", "high" -> false (No Vehicle / Free)
 *  - Standard booleans:
 *    true -> true (Vehicle Detected)
 *    false -> false (Free)
 */
function parseSensorValue(val, fallback) {
  if (typeof val === 'undefined' || val === null) return fallback;
  if (typeof val === 'boolean') return val;
  if (val === 0 || val === '0' || String(val).toUpperCase() === 'LOW') return true;
  if (val === 1 || val === '1' || String(val).toUpperCase() === 'HIGH') return false;
  return fallback;
}

// -----------------------------------------------------------------------------
// REST API Endpoints
// -----------------------------------------------------------------------------

/**
 * GET /api/parking/status
 * Returns complete real-time snapshot of the parking facility.
 */
app.get('/api/parking/status', (req, res) => {
  const metrics = calculateMetrics();
  const esp32 = getEsp32Status();
  const led = getLedState();

  res.json({
    slots: {
      P1: slots.P1.status,
      P2: slots.P2.status,
      P3: slots.P3.status
    },
    slotDetails: [
      { 
        id: 'P1', 
        status: slots.P1.status, 
        sensorDetected: slots.P1.sensorDetected, 
        lastUpdated: slots.P1.lastUpdated,
        plateNumber: slots.P1.plateNumber || (slots.P1.status === 'Occupied' ? DEFAULT_PLATES.P1 : null),
        parkedAt: slots.P1.parkedAt || (slots.P1.status === 'Occupied' ? slots.P1.lastUpdated : null)
      },
      { 
        id: 'P2', 
        status: slots.P2.status, 
        sensorDetected: slots.P2.sensorDetected, 
        lastUpdated: slots.P2.lastUpdated,
        plateNumber: slots.P2.plateNumber || (slots.P2.status === 'Occupied' ? DEFAULT_PLATES.P2 : null),
        parkedAt: slots.P2.parkedAt || (slots.P2.status === 'Occupied' ? slots.P2.lastUpdated : null)
      },
      { 
        id: 'P3', 
        status: slots.P3.status, 
        sensorDetected: slots.P3.sensorDetected, 
        lastUpdated: slots.P3.lastUpdated,
        plateNumber: slots.P3.plateNumber || (slots.P3.status === 'Occupied' ? DEFAULT_PLATES.P3 : null),
        parkedAt: slots.P3.parkedAt || (slots.P3.status === 'Occupied' ? slots.P3.lastUpdated : null)
      }
    ],
    metrics,
    gate: {
      state: gateState.state
    },
    led,
    esp32,
    recentActivity
  });
});

/**
 * POST /api/parking/sync-sensors
 * Hardware & Simulator synchronization endpoint.
 * Translates physical or simulated IR sensor readings to state changes.
 * Body: { p1: boolean|number|string, p2: ..., p3: ..., source?: 'simulator'|'hardware' }
 */
app.post('/api/parking/sync-sensors', (req, res) => {
  const body = req.body || {};
  const source = (body.source || '').toLowerCase();
  const isSimulator = (source === 'simulator');

  // 1. Process physical or simulated entrance gate detection (IR1 / GPIO 13)
  const rawEntrance = typeof body.entrance !== 'undefined' ? body.entrance : (typeof body.ir1 !== 'undefined' ? body.ir1 : body.irEntrance);

  // 2. Support raw active-low or boolean inputs for each slot
  const rawP1 = typeof body.p1 !== 'undefined' ? body.p1 : body.P1;
  const rawP2 = typeof body.p2 !== 'undefined' ? body.p2 : body.P2;
  const rawP3 = typeof body.p3 !== 'undefined' ? body.p3 : body.P3;

  // Build list of slots explicitly provided in payload to avoid overwriting virtual slots (like P3)
  const slotsToProcess = [];
  if (typeof rawP1 !== 'undefined') {
    slotsToProcess.push({ id: 'P1', isDetected: parseSensorValue(rawP1, slots.P1.sensorDetected) });
  }
  if (typeof rawP2 !== 'undefined') {
    slotsToProcess.push({ id: 'P2', isDetected: parseSensorValue(rawP2, slots.P2.sensorDetected) });
  }
  if (typeof rawP3 !== 'undefined') {
    slotsToProcess.push({ id: 'P3', isDetected: parseSensorValue(rawP3, slots.P3.sensorDetected) });
  }

  // Update appropriate watchdog heartbeat
  const now = Date.now();
  if (isSimulator) {
    esp32State.lastSimulatorHeartbeat = now;
  } else {
    const wasPreviouslyConnected = getEsp32Status().connected;
    esp32State.lastHeartbeat = now;
    if (!wasPreviouslyConnected) {
      logActivity('ESP32_CONNECTED', 'ESP32 microcontroller online and synchronized.');
    }
  }

  // Process transitions for provided slots
  for (const { id: slotId, isDetected } of slotsToProcess) {
    const currentSlot = slots[slotId];
    currentSlot.sensorDetected = isDetected;

    if (isDetected) {
      // Sensor detects car
      if (currentSlot.status === 'Available') {
        currentSlot.status = 'Occupied';
        currentSlot.lastUpdated = new Date().toISOString();
        if (!currentSlot.parkedAt) currentSlot.parkedAt = currentSlot.lastUpdated;
        if (!currentSlot.plateNumber) currentSlot.plateNumber = DEFAULT_PLATES[slotId];
        logActivity('SLOT_OCCUPIED', `Slot ${slotId} occupied by [${currentSlot.plateNumber}].`);
      } else if (currentSlot.status === 'Reserved') {
        currentSlot.status = 'Occupied';
        currentSlot.lastUpdated = new Date().toISOString();
        if (!currentSlot.parkedAt) currentSlot.parkedAt = currentSlot.lastUpdated;
        if (!currentSlot.plateNumber) currentSlot.plateNumber = DEFAULT_PLATES[slotId];
        logActivity('RESERVATION_VERIFIED', `Reserved Slot ${slotId} arrived: [${currentSlot.plateNumber}] parked.`);
      }
    } else {
      // Sensor clear (no car)
      if (currentSlot.status === 'Occupied') {
        currentSlot.status = 'Available';
        currentSlot.lastUpdated = new Date().toISOString();
        currentSlot.parkedAt = null;
        currentSlot.plateNumber = null;
        logActivity('SLOT_VACATED', `Slot ${slotId} vacated: vehicle departed (now Available).`);
      }
      // Note: If slot is Reserved and sensor is clear, it remains Reserved awaiting the car.
    }
  }

  // 3. Process entrance gate sensor logic
  if (typeof rawEntrance !== 'undefined') {
    const isEntranceDetected = parseSensorValue(rawEntrance, false);
    const preGateMetrics = calculateMetrics();

    if (isEntranceDetected) {
      // Vehicle at entrance
      if (preGateMetrics.available > 0) {
        if (gateState.state !== 'Open') {
          gateState.state = 'Open';
          // Clear any manual autoCloseTimer so sensor holds it open
          if (gateState.autoCloseTimer) {
            clearTimeout(gateState.autoCloseTimer);
            gateState.autoCloseTimer = null;
          }
          logActivity('GATE_OPENED', 'Entrance barrier opened (90°) - vehicle detected at gate.');
        }
      } else {
        // Lot full - keep gate closed
        if (gateState.state !== 'Closed') {
          gateState.state = 'Closed';
        }
        logActivity('GATE_BLOCKED', 'Vehicle detected at entrance gate, but parking lot is FULL.');
      }
    } else {
      // Entrance sensor is clear: close gate smoothly if not held by manual UI timer
      if (gateState.state === 'Open' && !gateState.autoCloseTimer) {
        gateState.state = 'Closed';
        logActivity('GATE_CLOSED', 'Vehicle cleared entrance sensor - barrier closed (0°).');
      }
    }
  }

  const metrics = calculateMetrics();
  const led = getLedState();

  res.json({
    success: true,
    message: isSimulator ? 'Simulated sensors synchronized.' : 'Sensors synchronized successfully.',
    source: isSimulator ? 'simulator' : 'hardware',
    command: {
      gateState: gateState.state,
      ledState: led.on ? 'ON' : 'OFF'
    },
    metrics
  });
});

/**
 * POST /api/parking/assign
 * Automatically assign lowest-indexed available slot (P1 -> P2 -> P3).
 * Transitions: Available -> Reserved
 */
app.post('/api/parking/assign', (req, res) => {
  // Deterministic order
  const candidateId = VALID_SLOT_IDS.find(id => slots[id].status === 'Available');

  if (!candidateId) {
    return res.status(409).json({
      success: false,
      assignedSlot: null,
      message: 'Parking Full - No available slots to assign.'
    });
  }

  slots[candidateId].status = 'Reserved';
  slots[candidateId].lastUpdated = new Date().toISOString();
  logActivity('SLOT_ASSIGNED', `Slot ${candidateId} automatically assigned to driver.`);

  const metrics = calculateMetrics();

  res.status(200).json({
    success: true,
    assignedSlot: candidateId,
    message: `Slot ${candidateId} assigned successfully.`,
    metrics
  });
});

/**
 * POST /api/parking/reserve
 * Reserve a specific slot by ID.
 * Body: { slotId: "P1" | "P2" | "P3" }
 */
app.post('/api/parking/reserve', (req, res) => {
  const { slotId } = req.body || {};

  if (!slotId || !VALID_SLOT_IDS.includes(slotId.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid slot ID. Must be P1, P2, or P3.'
    });
  }

  const targetSlotId = slotId.toUpperCase();
  const targetSlot = slots[targetSlotId];

  if (targetSlot.status !== 'Available') {
    return res.status(409).json({
      success: false,
      slotId: targetSlotId,
      currentStatus: targetSlot.status,
      message: `Slot ${targetSlotId} cannot be reserved. Current status is ${targetSlot.status}.`
    });
  }

  targetSlot.status = 'Reserved';
  targetSlot.lastUpdated = new Date().toISOString();
  logActivity('SLOT_RESERVED', `Slot ${targetSlotId} reserved by user.`);

  const metrics = calculateMetrics();

  res.status(200).json({
    success: true,
    slotId: targetSlotId,
    message: `Slot ${targetSlotId} reserved successfully.`,
    metrics
  });
});

/**
 * POST /api/parking/gate/trigger
 * Trigger entrance gate barrier to open for 3 seconds if lot has capacity.
 */
app.post('/api/parking/gate/trigger', (req, res) => {
  const metrics = calculateMetrics();

  // If parking is full (available == 0), gate cannot open
  if (metrics.available === 0) {
    return res.status(409).json({
      success: false,
      gateState: 'Closed',
      message: 'Gate cannot open - Parking is Full.'
    });
  }

  // Open the gate
  gateState.state = 'Open';
  logActivity('GATE_TRIGGERED', 'Entrance barrier opened (90 deg) for vehicle entry.');

  // Clear any active auto-close timer and schedule 3-second auto-close
  if (gateState.autoCloseTimer) {
    clearTimeout(gateState.autoCloseTimer);
  }

  gateState.autoCloseTimer = setTimeout(() => {
    gateState.state = 'Closed';
    logActivity('GATE_CLOSED', 'Entrance barrier closed (0 deg) after 3s.');
    gateState.autoCloseTimer = null;
  }, 3000);

  res.status(200).json({
    success: true,
    gateState: 'Open',
    autoCloseDelaySeconds: 3,
    message: 'Entrance gate opened for vehicle passage.'
  });
});

/**
 * POST /api/parking/reset
 * Helper endpoint to reset in-memory state back to initial default.
 */
app.post('/api/parking/reset', (req, res) => {
  if (gateState.autoCloseTimer) {
    clearTimeout(gateState.autoCloseTimer);
    gateState.autoCloseTimer = null;
  }

  slots = {
    P1: { id: 'P1', status: 'Available', sensorDetected: false, lastUpdated: new Date().toISOString(), plateNumber: null, parkedAt: null },
    P2: { id: 'P2', status: 'Available', sensorDetected: false, lastUpdated: new Date().toISOString(), plateNumber: null, parkedAt: null },
    P3: { id: 'P3', status: 'Available', sensorDetected: false, lastUpdated: new Date().toISOString(), plateNumber: null, parkedAt: null }
  };

  gateState.state = 'Closed';
  esp32State.lastHeartbeat = null;
  recentActivity = [];

  logActivity('SYSTEM_RESET', 'Parking system state reset to initial default.');

  res.json({
    success: true,
    message: 'Parking system state reset.',
    status: calculateMetrics()
  });
});

/**
 * POST /api/parking/slot/toggle
 * Simulate parking or vacating a specific bay directly.
 * Body: { slotId: "P1" | "P2" | "P3" }
 */
app.post('/api/parking/slot/toggle', (req, res) => {
  const { slotId } = req.body || {};
  if (!slotId || !VALID_SLOT_IDS.includes(slotId.toUpperCase())) {
    return res.status(400).json({
      success: false,
      message: 'Invalid slot ID. Must be P1, P2, or P3.'
    });
  }

  const id = slotId.toUpperCase();
  const currentSlot = slots[id];
  const willOccupy = currentSlot.status !== 'Occupied';

  currentSlot.sensorDetected = willOccupy;
  currentSlot.lastUpdated = new Date().toISOString();

  if (willOccupy) {
    currentSlot.status = 'Occupied';
    currentSlot.parkedAt = currentSlot.lastUpdated;
    currentSlot.plateNumber = DEFAULT_PLATES[id];
    logActivity('SLOT_OCCUPIED', `Slot ${id} occupied by [${currentSlot.plateNumber}].`);
  } else {
    currentSlot.status = 'Available';
    currentSlot.parkedAt = null;
    currentSlot.plateNumber = null;
    logActivity('SLOT_VACATED', `Slot ${id} vacated: vehicle departed (now Available).`);
  }

  const metrics = calculateMetrics();
  const led = getLedState();

  res.json({
    success: true,
    slotId: id,
    status: currentSlot.status,
    message: willOccupy ? `Vehicle [${currentSlot.plateNumber}] parked in Slot ${id}.` : `Slot ${id} vacated.`,
    metrics,
    led
  });
});

// Initial system boot log
logActivity('SYSTEM_BOOT', 'Parking backend server started. Bays P1 and P2 occupied with 2 vehicles, Bay P3 available.');

// -----------------------------------------------------------------------------
// Server Initialization
// -----------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log('===========================================================');
  console.log(`  IoT Smart Parking Backend running on http://localhost:${PORT}`);
  console.log('===========================================================');
  console.log('Available Endpoints:');
  console.log(`  GET  http://localhost:${PORT}/api/parking/status`);
  console.log(`  POST http://localhost:${PORT}/api/parking/sync-sensors`);
  console.log(`  POST http://localhost:${PORT}/api/parking/assign`);
  console.log(`  POST http://localhost:${PORT}/api/parking/reserve`);
  console.log(`  POST http://localhost:${PORT}/api/parking/gate/trigger`);
  console.log(`  POST http://localhost:${PORT}/api/parking/reset`);
  console.log('-----------------------------------------------------------');
});

module.exports = app;
