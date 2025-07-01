import React, { useState, useEffect } from 'react';
import { MetricsCard } from './MetricsCard';
import { RecentAnalyses } from './RecentAnalyses';
import { RiskOverview } from './RiskOverview';
import { 
  FileText, 
  Users, 
  Clock, 
  AlertTriangle,
  Activity,
  Database
} from 'lucide-react';

interface DashboardMetrics {
    total_analyses: number;
    avg_risk_score: number;
    total_anomalies: number;
    total_risks: number;
}

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/dashboard/metrics/');
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard metrics');
        }
        const data: DashboardMetrics = await response.json();
        setMetrics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Overview of your security analysis platform</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricsCard
          title="Total Analyses"
          value={metrics?.total_analyses.toLocaleString() ?? '0'}
          icon={<FileText className="h-6 w-6" />}
          color="blue"
        />
        <MetricsCard
          title="Total Anomalies"
          value={metrics?.total_anomalies.toLocaleString() ?? '0'}
          icon={<Users className="h-6 w-6" />}
          color="green"
        />
        <MetricsCard
          title="Avg. Risk Score"
          value={metrics?.avg_risk_score.toFixed(2) ?? '0.00'}
          icon={<Clock className="h-6 w-6" />}
          color="orange"
        />
        <MetricsCard
          title="Total Risks"
          value={metrics?.total_risks.toLocaleString() ?? '0'}
          icon={<AlertTriangle className="h-6 w-6" />}
          color="red"
        />
      </div>

      {/* API Usage Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">API Usage</h3>
          <Activity className="h-5 w-5 text-slate-600" />
        </div>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">OpenRouter API Calls</span>
            <span className="font-medium">-- / --</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: '0%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>--</span>
            <span>--</span>
          </div>
        </div>
      </div>

      {/* Charts and Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskOverview />
        <RecentAnalyses />
      </div>
    </div>
  );
};