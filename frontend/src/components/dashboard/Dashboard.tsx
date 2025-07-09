import React from 'react';
import { QuickActions } from './QuickActions';
import { SecurityPulse } from './SecurityPulse';
import { ClusterStatus } from './ClusterStatus';
import { CriticalAlerts } from './CriticalAlerts';
import { RecentActivity } from './RecentActivity';
import { SystemStatus } from './SystemStatus';
import { RefreshCw } from 'lucide-react';

export const Dashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Access Intelligence Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Real-time overview of your access security posture.</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Security Pulse */}
      <SecurityPulse />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Critical Alerts */}
          <CriticalAlerts />
          {/* Recent Activity */}
          <RecentActivity />
        </div>
        <div className="space-y-6">
          {/* Cluster Status */}
          <ClusterStatus />
          {/* System Status */}
          <SystemStatus />
        </div>
      </div>
    </div>
  );
};
