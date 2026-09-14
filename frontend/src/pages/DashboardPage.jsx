import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '../components/Header';
import { LiveParkingMap } from '../components/LiveParkingMap';
import { ParkingOverviewPanel } from '../components/ParkingOverviewPanel';
import { RecentActivityPreview } from '../components/RecentActivityPreview';
import { fetchParkingStatus, assignParkingSlot, reserveParkingSlot } from '../api/parkingApi';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export function DashboardPage() {
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);

  // Periodic polling every 800ms strictly per PRD
  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const result = await fetchParkingStatus();
        if (isMounted) {
          setData(result);
          setApiError(null);
        }
      } catch (err) {
        if (isMounted) {
          setApiError(err.message || 'Unable to connect to backend server.');
        }
      }
    };

    // Initial fetch
    loadStatus();

    // 800ms polling interval
    const intervalId = setInterval(loadStatus, 800);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Quick Action: Find Parking (Auto-Assign lowest free slot)
  const handleFindParking = async () => {
    setActionLoading(true);
    setAssignmentResult(null);

    try {
      const res = await assignParkingSlot();
      if (res.ok && res.data.success) {
        setAssignmentResult({
          success: true,
          message: `Bay ${res.data.assignedSlot} assigned! Status set to Reserved.`
        });
        showToast(`Bay ${res.data.assignedSlot} assigned. Drive to entrance.`, 'success');
        const updated = await fetchParkingStatus();
        setData(updated);
      } else {
        setAssignmentResult({
          success: false,
          message: res.data.message || 'Parking is currently full.'
        });
        showToast('Parking Full - No bays available', 'error');
      }
    } catch (err) {
      showToast('Network error while assigning parking.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Quick Action: Reserve slot modal
  const handleReserveClick = () => {
    setShowReserveModal(true);
  };

  const handleConfirmReservation = async (slotId) => {
    setActionLoading(true);
    try {
      const res = await reserveParkingSlot(slotId);
      if (res.ok && res.data.success) {
        showToast(`Bay ${slotId} reserved successfully!`, 'success');
        setShowReserveModal(false);
        const updated = await fetchParkingStatus();
        setData(updated);
      } else {
        showToast(res.data.message || `Bay ${slotId} is no longer available.`, 'error');
      }
    } catch (err) {
      showToast('Error reserving slot.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-[#0F172A]">
      {/* Top Header */}
      <Header esp32={data?.esp32} isLivePolling={!apiError} />

      {/* Backend connection banner if unreachable */}
      {apiError && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600" />
          <span>Backend unreachable at http://localhost:5000. Retrying...</span>
        </div>
      )}

      {/* Main Experience: Parking Hero (65%) + Overview Panel (35%) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* THE HERO: Live Parking Environment (approx. 65% width) */}
          <div className="lg:col-span-8 flex flex-col">
            <LiveParkingMap
              slots={data?.slots}
              gate={data?.gate}
            />
          </div>

          {/* RIGHT-SIDE PANEL: Parking Overview (approx. 35% width) */}
          <div className="lg:col-span-4 flex flex-col">
            <ParkingOverviewPanel
              metrics={data?.metrics}
              gate={data?.gate}
              esp32={data?.esp32}
              onFindParking={handleFindParking}
              onReserveSlot={handleReserveClick}
              actionLoading={actionLoading}
              assignmentResult={assignmentResult}
            />
          </div>
        </div>

        {/* RECENT ACTIVITY: Compact bottom bar */}
        <RecentActivityPreview activities={data?.recentActivity} />
      </main>

      {/* Reservation Picker Modal */}
      <AnimatePresence>
        {showReserveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl border border-[#E2E8F0] text-[#0F172A] mx-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#0F172A]">Reserve a Parking Bay</h3>
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="p-1 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#64748B] mt-3">
                Select an available bay to reserve.
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2.5 sm:gap-3">
                {['P1', 'P2', 'P3'].map((slotId) => {
                  const status = data?.slots?.[slotId] || 'Available';
                  const isAvailable = status === 'Available';

                  return (
                    <button
                      key={slotId}
                      disabled={!isAvailable || actionLoading}
                      onClick={() => handleConfirmReservation(slotId)}
                      className={`p-3 sm:p-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                        isAvailable
                          ? 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-300 text-emerald-800 cursor-pointer shadow-xs'
                          : 'border-[#E2E8F0] bg-slate-50 text-slate-400 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className="font-bold text-lg sm:text-xl">{slotId}</span>
                      <span className="text-[10px] font-mono uppercase font-bold mt-1 tracking-wider truncate max-w-full">
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-lg transition-colors text-center"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-4 sm:bottom-6 right-4 sm:right-6 left-4 sm:left-auto z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 text-xs font-semibold max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-emerald-500/10'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-800 border-rose-200 shadow-rose-500/10'
                : 'bg-white text-[#0F172A] border-[#E2E8F0] shadow-slate-500/10'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
            <span className="break-words">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
