/**
 * Centralized API client for Smart Parking System
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export async function fetchParkingStatus() {
  const res = await fetch(`${API_BASE_URL}/api/parking/status`);
  if (!res.ok) {
    throw new Error(`Failed to fetch status: ${res.statusText}`);
  }
  return await res.json();
}

export async function assignParkingSlot() {
  const res = await fetch(`${API_BASE_URL}/api/parking/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function reserveParkingSlot(slotId) {
  const res = await fetch(`${API_BASE_URL}/api/parking/reserve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotId })
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function triggerGateBarrier() {
  const res = await fetch(`${API_BASE_URL}/api/parking/gate/trigger`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function resetParkingState() {
  const res = await fetch(`${API_BASE_URL}/api/parking/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

export async function toggleSlotCar(slotId) {
  const res = await fetch(`${API_BASE_URL}/api/parking/slot/toggle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotId })
  });
  const data = await res.json();
  return { ok: res.ok, status: res.status, data };
}

