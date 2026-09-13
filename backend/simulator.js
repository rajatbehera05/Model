/**
 * ==============================================================================
 * Project: Smart Parking System (3-Slot Prototype)
 * Phase: Phase 4 - Software Sensor Simulation & Integration Preparation
 *
 * Description:
 * Development and testing simulator for the 3 active-low IR sensors (P1, P2, P3).
 * Represents real hardware physics before physical ESP32 fabrication:
 *   - LOW  (0) = Obstacle / Vehicle Detected
 *   - HIGH (1) = No Obstacle / Free Slot
 *
 * Communicates through the exact same backend API that the ESP32 will use:
 *   POST /api/parking/sync-sensors
 *
 * Usage:
 *   node simulator.js test          -> Run the 6 core PRD test scenarios
 *   node simulator.js status        -> View current backend parking status
 *   node simulator.js set <slot> <state>
 *                                   -> e.g. node simulator.js set P2 LOW (or occupied)
 *                                           node simulator.js set P2 HIGH (or free)
 *   node simulator.js reserve <slot>-> Reserve a specific slot (e.g. P1)
 *   node simulator.js assign        -> Trigger automatic slot assignment
 *   node simulator.js gate          -> Trigger entrance gate barrier
 *   node simulator.js reset         -> Reset system to all available
 * ==============================================================================
 */

const BASE_URL = 'http://localhost:5000/api/parking';

// Current local simulator sensor state (Active-LOW: 0 = Obstacle, 1 = Free)
let simulatedSensors = {
  P1: 1, // HIGH = Free
  P2: 1, // HIGH = Free
  P3: 1  // HIGH = Free
};

async function apiRequest(endpoint, method = 'GET', body = null) {
  try {
    const options = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);

    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  } catch (err) {
    console.error(`[ERROR] Unable to connect to backend at ${BASE_URL}. Ensure 'npm start' is running.`);
    process.exit(1);
  }
}

/**
 * Send simulated IR sensor states to the backend via POST /api/parking/sync-sensors.
 * Uses active-low mapping (0 = detected, 1 = free).
 */
async function syncSimulatedSensors(p1Val, p2Val, p3Val) {
  if (typeof p1Val !== 'undefined') simulatedSensors.P1 = p1Val;
  if (typeof p2Val !== 'undefined') simulatedSensors.P2 = p2Val;
  if (typeof p3Val !== 'undefined') simulatedSensors.P3 = p3Val;

  return await apiRequest('/sync-sensors', 'POST', {
    source: 'simulator',
    p1: simulatedSensors.P1,
    p2: simulatedSensors.P2,
    p3: simulatedSensors.P3
  });
}

function printHeader(title) {
  console.log('\n================================================================');
  console.log(`  ${title}`);
  console.log('================================================================');
}

function printStatus(statusData) {
  const m = statusData.metrics || {};
  const s = statusData.slots || {};
  const g = statusData.gate || {};
  const l = statusData.led || {};
  const esp = statusData.esp32 || {};

  console.log(`[SLOTS]       P1: ${s.P1.padEnd(10)} | P2: ${s.P2.padEnd(10)} | P3: ${s.P3}`);
  console.log(`[CAPACITY]    Available: ${m.available}/3 (${m.availabilityPercent}%) | Occupied: ${m.occupied} | Reserved: ${m.reserved}`);
  console.log(`[COMMANDS]    Gate: ${g.state} (0°/90°) | LED: ${l.on ? 'ON (Spaces Open)' : 'OFF (Lot Full)'}`);
  console.log(`[ESP32 LINK]  Mode: ${esp.mode} | Simulator Active: ${esp.simulatorActive}`);
}

/**
 * Execute the 6 required PRD test scenarios deterministically.
 */
async function runAllScenarios() {
  printHeader('STARTING SOFTWARE SENSOR SIMULATION TEST SUITE');
  console.log('Testing 3-Slot Prototype with simulated Active-LOW IR Sensors (LOW=Detected, HIGH=Free)\n');

  // Step 0: Reset State
  await apiRequest('/reset', 'POST');

  // ---------------------------------------------------------------------------
  // Test 1 — All Available
  // ---------------------------------------------------------------------------
  printHeader('Test 1 — Initial State: All Available');
  console.log('Hardware Simulation: IR1=HIGH (Free), IR2=HIGH (Free), IR3=HIGH (Free)');
  await syncSimulatedSensors(1, 1, 1);
  const s1 = await apiRequest('/status');
  printStatus(s1.data);

  if (s1.data.metrics.available === 3 &&
      s1.data.metrics.availabilityPercent === 100 &&
      s1.data.led.on === true &&
      s1.data.gate.state === 'Closed') {
    console.log('\n[PASS] Test 1: All 3 slots Available, 100% capacity, LED ON, Gate Closed.');
  } else {
    console.error('\n[FAIL] Test 1 unexpected result');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Test 2 — P2 Occupied
  // ---------------------------------------------------------------------------
  printHeader('Test 2 — P2 Occupied');
  console.log('Hardware Simulation: Vehicle drives into P2 -> IR2 triggers LOW (0)');
  await syncSimulatedSensors(1, 0, 1); // P2 active-low: 0 = detected
  const s2 = await apiRequest('/status');
  printStatus(s2.data);

  if (s2.data.slots.P2 === 'Occupied' &&
      s2.data.slots.P1 === 'Available' &&
      s2.data.slots.P3 === 'Available' &&
      s2.data.metrics.available === 2 &&
      s2.data.metrics.occupied === 1 &&
      s2.data.metrics.availabilityPercent === 67 &&
      s2.data.led.on === true) {
    console.log('\n[PASS] Test 2: P2 Occupied, Available 2/3 (67%), LED remains ON.');
  } else {
    console.error('\n[FAIL] Test 2 unexpected result');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Test 3 — Reservation
  // ---------------------------------------------------------------------------
  printHeader('Test 3 — User Reservation: Reserve P1');
  console.log('Software Action: User reserves slot P1 via POST /api/parking/reserve');
  const res3 = await apiRequest('/reserve', 'POST', { slotId: 'P1' });
  console.log(`Response: ${res3.data.message}`);
  const s3 = await apiRequest('/status');
  printStatus(s3.data);

  if (s3.data.slots.P1 === 'Reserved' &&
      s3.data.slots.P2 === 'Occupied' &&
      s3.data.slots.P3 === 'Available' &&
      s3.data.metrics.available === 1 &&
      s3.data.metrics.reserved === 1 &&
      s3.data.metrics.occupied === 1 &&
      s3.data.metrics.availabilityPercent === 33) {
    console.log('\n[PASS] Test 3: P1 Reserved, P2 Occupied, P3 Available. Available 1/3 (33%).');
  } else {
    console.error('\n[FAIL] Test 3 unexpected result');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Test 4 — Reserved -> Occupied (Physical Verification)
  // ---------------------------------------------------------------------------
  printHeader('Test 4 — Reserved -> Occupied (Physical Sensor Verification)');
  console.log('Hardware Simulation: Vehicle arrives in reserved slot P1 -> IR1 triggers LOW (0)');
  await syncSimulatedSensors(0, 0, 1); // P1=0 (detected), P2=0 (detected), P3=1 (free)
  const s4 = await apiRequest('/status');
  printStatus(s4.data);

  if (s4.data.slots.P1 === 'Occupied' &&
      s4.data.slots.P2 === 'Occupied' &&
      s4.data.slots.P3 === 'Available' &&
      s4.data.metrics.reserved === 0 &&
      s4.data.metrics.occupied === 2 &&
      s4.data.metrics.available === 1 &&
      s4.data.metrics.availabilityPercent === 33) {
    console.log('\n[PASS] Test 4: Physical sensor verification confirmed! P1 transitioned from Reserved to Occupied.');
  } else {
    console.error('\n[FAIL] Test 4 unexpected result');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Test 5 — Full Parking (0% Availability, LED OFF, Gate Closed)
  // ---------------------------------------------------------------------------
  printHeader('Test 5 — Full Parking: All Slots Occupied');
  console.log('Hardware Simulation: Third vehicle enters P3 -> IR3 triggers LOW (0)');
  await syncSimulatedSensors(0, 0, 0); // All 3 active-low detected
  const s5 = await apiRequest('/status');
  printStatus(s5.data);

  // Test gate entry rejection when full
  console.log('\nTesting entrance barrier rejection when parking is full:');
  const gateAttempt = await apiRequest('/gate/trigger', 'POST');
  console.log(`Gate trigger result: HTTP ${gateAttempt.status} -> ${gateAttempt.data.message}`);

  if (s5.data.slots.P1 === 'Occupied' &&
      s5.data.slots.P2 === 'Occupied' &&
      s5.data.slots.P3 === 'Occupied' &&
      s5.data.metrics.available === 0 &&
      s5.data.metrics.occupied === 3 &&
      s5.data.metrics.availabilityPercent === 0 &&
      s5.data.led.on === false &&
      gateAttempt.status === 409 &&
      gateAttempt.data.gateState === 'Closed') {
    console.log('\n[PASS] Test 5: Full capacity (0%), LED command OFF, Gate remains Closed (Entry Denied).');
  } else {
    console.error('\n[FAIL] Test 5 unexpected result');
    process.exit(1);
  }

  // ---------------------------------------------------------------------------
  // Test 6 — Vehicle Leaves (Occupied -> Available)
  // ---------------------------------------------------------------------------
  printHeader('Test 6 — Vehicle Leaves: Slot Vacated');
  console.log('Hardware Simulation: Vehicle departs from slot P2 -> IR2 returns to HIGH (1)');
  await syncSimulatedSensors(0, 1, 0); // P1=0 (occupied), P2=1 (free), P3=0 (occupied)
  const s6 = await apiRequest('/status');
  printStatus(s6.data);

  // Test gate trigger when space is available
  console.log('\nTesting entrance barrier trigger when slot has opened:');
  const gateSuccess = await apiRequest('/gate/trigger', 'POST');
  console.log(`Gate trigger result: HTTP ${gateSuccess.status} -> ${gateSuccess.data.message} (Gate: ${gateSuccess.data.gateState})`);

  if (s6.data.slots.P2 === 'Available' &&
      s6.data.metrics.available === 1 &&
      s6.data.metrics.occupied === 2 &&
      s6.data.metrics.availabilityPercent === 33 &&
      s6.data.led.on === true &&
      gateSuccess.status === 200 &&
      gateSuccess.data.gateState === 'Open') {
    console.log('\n[PASS] Test 6: P2 vacated -> Available. Available 1/3 (33%), LED command ON, Gate permits entry.');
  } else {
    console.error('\n[FAIL] Test 6 unexpected result');
    process.exit(1);
  }

  printHeader('ALL 6 SENSOR SIMULATION SCENARIOS PASSED PERFECTLY!');
  console.log('Software sensor simulation is complete and verified.');
  console.log('The backend is 100% ready for both simulated inputs and the future real ESP32.\n');
}

/**
 * Interactive Command Line Interface for manual testing
 */
async function main() {
  const args = process.argv.slice(2);
  const command = (args[0] || 'test').toLowerCase();

  switch (command) {
    case 'test':
      await runAllScenarios();
      break;

    case 'status': {
      const res = await apiRequest('/status');
      printHeader('CURRENT PARKING STATUS');
      printStatus(res.data);
      break;
    }

    case 'reset': {
      const res = await apiRequest('/reset', 'POST');
      console.log(`[RESET] ${res.data.message}`);
      break;
    }

    case 'assign': {
      const res = await apiRequest('/assign', 'POST');
      console.log(`[ASSIGN] Status ${res.status}: ${res.data.message || 'No message'}`);
      if (res.data.assignedSlot) console.log(`Assigned Slot: ${res.data.assignedSlot}`);
      break;
    }

    case 'reserve': {
      const slotId = (args[1] || 'P1').toUpperCase();
      const res = await apiRequest('/reserve', 'POST', { slotId });
      console.log(`[RESERVE] Status ${res.status}: ${res.data.message}`);
      break;
    }

    case 'gate': {
      const res = await apiRequest('/gate/trigger', 'POST');
      console.log(`[GATE] Status ${res.status}: ${res.data.message} (Gate: ${res.data.gateState})`);
      break;
    }

    case 'set': {
      const slot = (args[1] || '').toUpperCase();
      const stateInput = (args[2] || '').toUpperCase();

      if (!['P1', 'P2', 'P3'].includes(slot)) {
        console.error('Invalid slot. Choose P1, P2, or P3.');
        return;
      }

      // Translate user input to active-low sensor value
      // 0, LOW, OCCUPIED, CAR -> 0 (Active-LOW detected)
      // 1, HIGH, FREE, EMPTY, AVAILABLE -> 1 (Active-LOW clear)
      let sensorVal;
      if (['0', 'LOW', 'OCCUPIED', 'CAR'].includes(stateInput)) {
        sensorVal = 0;
      } else if (['1', 'HIGH', 'FREE', 'EMPTY', 'AVAILABLE'].includes(stateInput)) {
        sensorVal = 1;
      } else {
        console.error('Invalid state. Choose LOW (0/occupied) or HIGH (1/free).');
        return;
      }

      // Fetch current status to preserve other slots
      const current = await apiRequest('/status');
      const s = current.data.slots || {};
      const p1 = slot === 'P1' ? sensorVal : (s.P1 === 'Occupied' ? 0 : 1);
      const p2 = slot === 'P2' ? sensorVal : (s.P2 === 'Occupied' ? 0 : 1);
      const p3 = slot === 'P3' ? sensorVal : (s.P3 === 'Occupied' ? 0 : 1);

      console.log(`[SIMULATE] Setting ${slot} sensor to ${sensorVal === 0 ? 'LOW (Vehicle Present)' : 'HIGH (Free)'}...`);
      const syncRes = await syncSimulatedSensors(p1, p2, p3);
      console.log(`[BACKEND RESPONSE] ${syncRes.data.message}`);

      const updated = await apiRequest('/status');
      printHeader('UPDATED STATUS');
      printStatus(updated.data);
      break;
    }

    default:
      console.log('Usage:');
      console.log('  node simulator.js test             -> Run all 6 automated test scenarios');
      console.log('  node simulator.js status           -> View current parking status');
      console.log('  node simulator.js set P2 LOW       -> Simulate car arriving in P2 (active-low 0)');
      console.log('  node simulator.js set P2 HIGH      -> Simulate car departing P2 (active-low 1)');
      console.log('  node simulator.js reserve P1       -> Reserve slot P1');
      console.log('  node simulator.js assign           -> Automatically assign lowest free slot');
      console.log('  node simulator.js gate             -> Trigger entrance barrier gate');
      console.log('  node simulator.js reset            -> Reset system to default 3 available');
      break;
  }
}

main().catch(err => {
  console.error('Simulator error:', err);
  process.exit(1);
});
