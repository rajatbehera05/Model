import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './pages/DashboardView';
import { ParkingPage } from './pages/ParkingPage';
import { OperationsPage } from './pages/OperationsPage';
import { LandingPage } from './pages/LandingPage';
import { PageTransitionLoader } from './components/PageTransitionLoader';
import { 
  fetchParkingStatus, 
  assignParkingSlot, 
  reserveParkingSlot, 
  triggerGateBarrier, 
  resetParkingState 
} from './api/parkingApi';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [targetTab, setTargetTab] = useState('landing');
  const [data, setData] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [assignmentResult, setAssignmentResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Poll backend every 800ms strictly according to PRD
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

    // Initial load
    loadStatus();

    // 800ms periodic sync
    const intervalId = setInterval(loadStatus, 800);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Quick Action: Find Parking (Auto-Assign)
  const handleFindParking = async () => {
    setActionLoading(true);
    setAssignmentResult(null);

    try {
      const res = await assignParkingSlot();
      if (res.ok && res.data.success) {
        setAssignmentResult({
          success: true,
          message: `Allocated Bay ${res.data.assignedSlot}. Status set to Reserved.`
        });
        showToast(`Bay ${res.data.assignedSlot} assigned. Proceed to entrance.`, 'success');
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

  // 2. Quick Action: Reserve specific slot
  const handleReserveClick = (preselectedSlot = null) => {
    if (typeof preselectedSlot === 'string') {
      handleConfirmReservation(preselectedSlot);
    } else {
      setShowReserveModal(true);
    }
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
        showToast(res.data.message || `Slot ${slotId} is no longer available.`, 'error');
      }
    } catch (err) {
      showToast('Error reserving slot.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 3. Trigger Barrier Gate Cycle
  const handleTriggerGate = async () => {
    setActionLoading(true);
    try {
      const res = await triggerGateBarrier();
      if (res.ok && res.data.success) {
        showToast('Entrance barrier opened (auto-closing in 3s).', 'success');
        const updated = await fetchParkingStatus();
        setData(updated);
      } else {
        showToast(res.data.message || 'Gate cannot open - Parking is full.', 'error');
      }
    } catch (err) {
      showToast('Error operating entrance gate.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 4. Reset System State
  const handleResetSystem = async () => {
    setActionLoading(true);
    try {
      const res = await resetParkingState();
      if (res.ok && res.data.success) {
        showToast('Parking system state reset to 3 available bays.', 'success');
        setAssignmentResult(null);
        const updated = await fetchParkingStatus();
        setData(updated);
      }
    } catch (err) {
      showToast('Error resetting system.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // 5. Page Navigation with Smooth Loading Transition
  const handleTabChange = (newTab) => {
    if (newTab === activeTab || isPageLoading) return;
    setIsPageLoading(true);
    setTargetTab(newTab);

    // Concurrently fetch fresh parking data during transition
    fetchParkingStatus().then(updated => {
      if (updated) setData(updated);
    }).catch(() => {});

    // Smooth transition window
    setTimeout(() => {
      setActiveTab(newTab);
      setIsPageLoading(false);
      setIsMobileSidebarOpen(false);
    }, 400);
  };

  // Dynamic Header Titles
  const getHeaderMeta = () => {
    const currentTab = isPageLoading ? targetTab : activeTab;
    switch (currentTab) {
      case 'parking':
      case 'slots':
        return { 
          title: 'Parking', 
          subtitle: isPageLoading ? 'Synchronizing bay layout and vehicle status...' : 'Find and reserve the best available parking space' 
        };
      case 'operations':
        return { 
          title: 'Operations', 
          subtitle: isPageLoading ? 'Connecting to microcontroller pins and hardware...' : 'System telemetry, sensors and entry control' 
        };
      case 'dashboard':
      default:
        return { 
          title: 'Dashboard', 
          subtitle: isPageLoading ? 'Refreshing facility overview metrics...' : 'Live parking telemetry & automatic slot allocation' 
        };
    }
  };

  const headerMeta = getHeaderMeta();
  const availableCount = data?.metrics?.available ?? 0;

  // Render Landing Page if activeTab is 'landing'
  if (activeTab === 'landing') {
    return (
      <AnimatePresence mode="wait">
        {isPageLoading ? (
          <motion.div
            key="landing-loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-[#F8FAFC] flex items-center justify-center"
          >
            <PageTransitionLoader targetTab={targetTab} />
          </motion.div>
        ) : (
          <motion.div
            key="landing-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <LandingPage onOpenDashboard={() => handleTabChange('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#0F172A] antialiased relative selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* Subtle Ambient Background Gradients (Behind Content) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[160px] -right-[160px] w-[640px] h-[640px] rounded-full bg-gradient-to-br from-blue-100/40 via-indigo-50/25 to-transparent blur-3xl" />
        <div className="absolute top-[35%] -left-[180px] w-[580px] h-[580px] rounded-full bg-gradient-to-tr from-indigo-100/30 via-blue-50/20 to-transparent blur-3xl" />
        <div className="absolute -bottom-[180px] right-[20%] w-[580px] h-[580px] rounded-full bg-gradient-to-t from-sky-100/30 via-purple-50/15 to-transparent blur-3xl" />
      </div>

      {/* Left Sidebar (Desktop Static + Mobile Drawer) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        esp32={data?.esp32}
        isLivePolling={!apiError}
        isPageLoading={isPageLoading}
        targetTab={targetTab}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top Header */}
        <Header
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          gate={data?.gate}
          led={data?.led}
          onFindParking={handleFindParking}
          actionLoading={actionLoading}
          availableCount={availableCount}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(prev => !prev)}
        />

        {/* Backend Connection Warning */}
        {apiError && (
          <div className="bg-[#FEF2F2] border-b border-[#FCA5A5] text-[#DC2626] text-xs py-2 px-4 sm:px-6 text-center font-bold flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="truncate">Backend unreachable at http://localhost:5000. Retrying in background...</span>
          </div>
        )}

        {/* Main View Container with Loading Transition */}
        <main className="flex-1 p-3.5 sm:p-6 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            {isPageLoading ? (
              <motion.div
                key={`loading-${targetTab}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.18 }}
              >
                <PageTransitionLoader targetTab={targetTab} />
              </motion.div>
            ) : (
              <motion.div
                key={`page-${activeTab}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {activeTab === 'dashboard' && (
                  <DashboardView
                    data={data}
                    onFindParking={handleFindParking}
                    onReserveSlot={handleReserveClick}
                    onSlotClick={handleConfirmReservation}
                    onTriggerGate={handleTriggerGate}
                    actionLoading={actionLoading}
                    assignmentResult={assignmentResult}
                  />
                )}

                {(activeTab === 'parking' || activeTab === 'slots') && (
                  <ParkingPage
                    data={data}
                    apiError={apiError}
                    onRefreshData={async () => {
                      const updated = await fetchParkingStatus();
                      setData(updated);
                    }}
                  />
                )}

                {activeTab === 'operations' && (
                  <OperationsPage
                    data={data}
                    apiError={apiError}
                    onRefreshData={async () => {
                      const updated = await fetchParkingStatus();
                      setData(updated);
                    }}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Reservation Picker Modal */}
      <AnimatePresence>
        {showReserveModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3.5 sm:p-4 bg-[#0F172A]/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-[18px] p-4 sm:p-6 max-w-md w-full shadow-modal border border-[#E2E8F0] text-[#0F172A]"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <h3 className="text-sm sm:text-base font-extrabold text-[#0F172A]">Reserve Parking Bay</h3>
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[#64748B] font-semibold mt-3">
                Select an available bay to lock for arrival. Optical IR sensors confirm arrival automatically.
              </p>

              <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                {['P1', 'P2', 'P3'].map((slotId) => {
                  const status = data?.slots?.[slotId] || 'Available';
                  const isAvailable = status === 'Available';

                  return (
                    <button
                      key={slotId}
                      disabled={!isAvailable || actionLoading}
                      onClick={() => handleConfirmReservation(slotId)}
                      className={`p-3 sm:p-4 rounded-[12px] sm:rounded-[14px] border-2 flex flex-col items-center justify-center transition-all ${
                        isAvailable
                          ? 'border-[#10B981] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] cursor-pointer shadow-xs'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#94A3B8] cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span className="font-black text-base sm:text-lg">{slotId}</span>
                      <span className="text-[9px] sm:text-[10px] uppercase font-bold mt-1 tracking-wide">
                        {status}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 sm:mt-6 flex justify-end">
                <button
                  onClick={() => setShowReserveModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#64748B] hover:bg-[#F1F5F9] rounded-[10px] border border-[#E2E8F0] transition-colors cursor-pointer"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 max-w-[calc(100vw-2rem)] px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-[14px] shadow-card border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === 'success'
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]'
                : toast.type === 'error'
                ? 'bg-[#FEF2F2] text-[#991B1B] border-[#EF4444]'
                : 'bg-white text-[#0F172A] border-[#E2E8F0]'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
            )}
            <span className="truncate">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
