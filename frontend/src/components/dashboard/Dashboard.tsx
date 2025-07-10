import React, { useEffect, useState, useCallback } from 'react';
import { QuickActions } from './QuickActions';
import { SecurityPulse } from './SecurityPulse';
import { ClusterStatus } from './ClusterStatus';
import { CriticalAlerts } from './CriticalAlerts';
import { RecentActivity } from './RecentActivity';
import { SystemStatus } from './SystemStatus';
import { RefreshCw } from 'lucide-react';
import { PageLoader } from '../common/PageLoader';
import { logError } from '../../utils/logger';

// Define the types for the data we expect from the API
interface SecurityPulseMetric {
    value: string;
    change: string;
    trend: string;
}
interface SecurityPulseData {
    total_accounts: SecurityPulseMetric;
    active_sessions: SecurityPulseMetric;
    high_risk_accounts: SecurityPulseMetric;
    api_success_rate: SecurityPulseMetric;
}
interface ClusterStatusData {
    labels: string[];
    values: number[];
}
interface CriticalAlertData {
    type: string;
    count?: number;
    location?: string;
    accounts?: string[];
    endpoint?: string;
    error_rate?: string;
}
interface RecentActivityItem {
    time: string;
    user: string;
    action: string;
    status: string;
}
interface SystemStatusItem {
    component: string;
    status: number;
}
interface DashboardData {
    security_pulse: SecurityPulseData;
    cluster_status: ClusterStatusData;
    critical_alerts: CriticalAlertData[];
    recent_activity: RecentActivityItem[];
    system_status: SystemStatusItem[];
}

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/dashboard-data');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: DashboardData = await response.json();
      setData(result);
    } catch (e: any) {
      setError(e.message);
      logError('Failed to fetch dashboard data', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <PageLoader />;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error loading dashboard data: {error}</div>;
  }

  if (!data) {
    return <div className="text-center p-8">No data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Access Intelligence Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-400">Real-time overview of your access security posture.</p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <QuickActions />
      <SecurityPulse data={data.security_pulse} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <CriticalAlerts alerts={data.critical_alerts} />
          <RecentActivity activities={data.recent_activity} />
        </div>
        <div className="space-y-6">
          <ClusterStatus data={data.cluster_status} />
          <SystemStatus data={data.system_status} />
        </div>
      </div>
    </div>
  );
};
