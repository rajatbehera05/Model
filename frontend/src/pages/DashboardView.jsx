import React from 'react';
import { MetricsSection } from '../components/MetricsSection';
import { LiveParkingMap } from '../components/LiveParkingMap';
import { ParkingOverviewPanel } from '../components/ParkingOverviewPanel';
import { RecentActivityPreview } from '../components/RecentActivityPreview';

export function DashboardView({
  data,
  onFindParking,
  onReserveSlot,
  onSlotClick,
  onTriggerGate,
  actionLoading,
  assignmentResult
}) {
  return (
    <div className="space-y-6">
      {/* 4 Summary Cards */}
      <MetricsSection metrics={data?.metrics} />

      {/* Main Grid: Live Layout (8 cols) + Overview & Controls (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <LiveParkingMap
            slots={data?.slots}
            slotDetails={data?.slotDetails}
            gate={data?.gate}
            onSlotClick={onSlotClick}
          />
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <ParkingOverviewPanel
            metrics={data?.metrics}
            gate={data?.gate}
            led={data?.led}
            onFindParking={onFindParking}
            onReserveSlot={onReserveSlot}
            onTriggerGate={onTriggerGate}
            actionLoading={actionLoading}
            assignmentResult={assignmentResult}
          />
        </div>
      </div>

      {/* Recent Activity Feed */}
      <RecentActivityPreview activities={data?.recentActivity} />
    </div>
  );
}
