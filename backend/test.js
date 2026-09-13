/**
 * ==============================================================================
 * Test Suite: IoT Smart Parking Backend
 * Verifies all 13 required test cases according to the PRD
 * ==============================================================================
 */

const BASE_URL = 'http://localhost:5000/api/parking';

async function request(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function assert(condition, message) {
  if (!condition) {
    console.error(`[FAIL] ${message}`);
    process.exit(1);
  } else {
    console.log(`[PASS] ${message}`);
  }
}

async function runTests() {
  console.log('Starting automated tests for Smart Parking Backend...\n');

  // Test 0: Reset State
  await request('/reset', 'POST');

  // Test 1: Initial state -> 3 available (100%)
  const t1 = await request('/status');
  assert(t1.status === 200, 'Test 1.1: Status endpoint returns 200');
  assert(t1.data.metrics.available === 3, 'Test 1.2: Initial available slots is 3');
  assert(t1.data.metrics.availabilityPercent === 100, 'Test 1.3: Initial availability is 100%');
  assert(t1.data.slots.P1 === 'Available' && t1.data.slots.P2 === 'Available' && t1.data.slots.P3 === 'Available', 'Test 1.4: All slots are Available');

  // Test 2: Assign -> P1 becomes Reserved
  const t2 = await request('/assign', 'POST');
  assert(t2.status === 200, 'Test 2.1: Assign endpoint returns 200');
  assert(t2.data.assignedSlot === 'P1', 'Test 2.2: First assigned slot is P1');
  assert(t2.data.metrics.available === 2, 'Test 2.3: Available count drops to 2');
  assert(t2.data.metrics.reserved === 1, 'Test 2.4: Reserved count becomes 1');
  assert(t2.data.metrics.availabilityPercent === 67, 'Test 2.5: Availability drops to 67%');

  // Test 3: Assign again -> P2 becomes Reserved
  const t3 = await request('/assign', 'POST');
  assert(t3.status === 200, 'Test 3.1: Second assign returns 200');
  assert(t3.data.assignedSlot === 'P2', 'Test 3.2: Second assigned slot is P2');
  assert(t3.data.metrics.available === 1, 'Test 3.3: Available count drops to 1');
  assert(t3.data.metrics.reserved === 2, 'Test 3.4: Reserved count becomes 2');
  assert(t3.data.metrics.availabilityPercent === 33, 'Test 3.5: Availability drops to 33%');

  // Test 4: Reserve P3 -> P3 becomes Reserved
  const t4 = await request('/reserve', 'POST', { slotId: 'P3' });
  assert(t4.status === 200, 'Test 4.1: Reserve P3 returns 200');
  assert(t4.data.slotId === 'P3', 'Test 4.2: P3 reserved');
  assert(t4.data.metrics.available === 0, 'Test 4.3: Available count drops to 0 (Lot Full)');
  assert(t4.data.metrics.reserved === 3, 'Test 4.4: Reserved count is 3');
  assert(t4.data.metrics.availabilityPercent === 0, 'Test 4.5: Availability is 0%');

  // Test 5: Try another assignment -> 409 Conflict (Full)
  const t5 = await request('/assign', 'POST');
  assert(t5.status === 409, 'Test 5.1: Assignment when full returns 409 Conflict');
  assert(t5.data.success === false, 'Test 5.2: Success flag is false');

  // Also test reserving an already reserved slot -> 409
  const t5b = await request('/reserve', 'POST', { slotId: 'P1' });
  assert(t5b.status === 409, 'Test 5.3: Reserving already reserved slot returns 409 Conflict');

  // Test 6: Sync sensor showing a vehicle in reserved slot P1 -> Reserved becomes Occupied
  const t6 = await request('/sync-sensors', 'POST', { p1: true, p2: false, p3: false });
  assert(t6.status === 200, 'Test 6.1: Sync sensors returns 200');
  const t6Status = await request('/status');
  assert(t6Status.data.slots.P1 === 'Occupied', 'Test 6.2: Reserved slot P1 transitioned to Occupied upon sensor trigger');
  assert(t6Status.data.slots.P2 === 'Reserved', 'Test 6.3: Slot P2 remains Reserved');
  assert(t6Status.data.slots.P3 === 'Reserved', 'Test 6.4: Slot P3 remains Reserved');
  assert(t6Status.data.metrics.occupied === 1, 'Test 6.5: Occupied count is 1');
  assert(t6Status.data.metrics.reserved === 2, 'Test 6.6: Reserved count is 2');

  // Test 7: Verify availability calculations with mixed states
  // Clear P2 sensor and let's clear reservation on reset or test vacancy
  // P1 Occupied, P2 Reserved, P3 Reserved -> Available = 0, Occupied = 1, Reserved = 2
  assert(t6Status.data.metrics.available === 0, 'Test 7.1: Available calculation is exact (0)');
  assert(t6Status.data.metrics.availabilityPercent === 0, 'Test 7.2: Availability % is exact (0%)');

  // Test 8 & 9: Gate Trigger tests
  // Test 9 (first when full): Trigger gate when parking is full -> 409 Conflict
  const t9 = await request('/gate/trigger', 'POST');
  assert(t9.status === 409, 'Test 9.1: Gate trigger when full returns 409 Conflict');
  assert(t9.data.gateState === 'Closed', 'Test 9.2: Gate remains Closed');

  // Free up P1 by vehicle departure
  await request('/sync-sensors', 'POST', { p1: false, p2: false, p3: false });
  // Now P1 was Occupied and vacated -> P1 is Available!
  const t8Status = await request('/status');
  assert(t8Status.data.slots.P1 === 'Available', 'Test 8.1: P1 transitioned back to Available upon departure');
  assert(t8Status.data.metrics.available === 1, 'Test 8.2: Available is now 1');

  // Test 8: Trigger gate when parking is available -> 200 OK and Open
  const t8 = await request('/gate/trigger', 'POST');
  assert(t8.status === 200, 'Test 8.3: Gate trigger returns 200 when slots available');
  assert(t8.data.gateState === 'Open', 'Test 8.4: Gate opens');

  // Test 10: Verify LED logic
  // Since Available == 1, LED must be ON
  const t10a = await request('/status');
  assert(t10a.data.led.on === true, 'Test 10.1: LED is ON when available >= 1');

  // Occupy P1 again so available becomes 0
  await request('/sync-sensors', 'POST', { p1: true, p2: false, p3: false });
  const t10b = await request('/status');
  assert(t10b.data.metrics.available === 0, 'Test 10.2: Available is 0');
  assert(t10b.data.led.on === false, 'Test 10.3: LED is OFF when available == 0 (Lot Full)');

  // Test 11: Verify ESP32 Heartbeat
  assert(t10b.data.esp32.connected === true, 'Test 11.1: ESP32 is Connected immediately following sensor sync');
  assert(t10b.data.esp32.lastHeartbeat !== null, 'Test 11.2: ESP32 has valid timestamp');

  // Test 12: Wait beyond 5 seconds without heartbeat and verify ESP32 becomes Disconnected
  console.log('Waiting 5.2 seconds for ESP32 watchdog timeout test...');
  await new Promise(resolve => setTimeout(resolve, 5200));
  const t12 = await request('/status');
  assert(t12.data.esp32.connected === false, 'Test 12.1: ESP32 reports Disconnected after 5 seconds of inactivity');

  // Test 13: Verify only latest 5 activity events remain
  const t13 = await request('/status');
  assert(Array.isArray(t13.data.recentActivity), 'Test 13.1: recentActivity is an array');
  assert(t13.data.recentActivity.length <= 5, `Test 13.2: recentActivity length (${t13.data.recentActivity.length}) is <= 5`);
  console.log(`Latest activity count: ${t13.data.recentActivity.length}`);

  console.log('\n========================================');
  console.log(' ALL 13 TEST SUITES PASSED SUCCESSFULLY!');
  console.log('========================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
