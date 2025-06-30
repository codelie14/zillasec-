import React from 'react';
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

export const Dashboard: React.FC = () => {
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
          value="2,847"
          change={{ value: 12, type: 'increase' }}
          icon={<FileText className="h-6 w-6" />}
          color="blue"
        />
        <MetricsCard
          title="Active Users"
          value="156"
          change={{ value: 8, type: 'increase' }}
          icon={<Users className="h-6 w-6" />}
          color="green"
        />
        <MetricsCard
          title="Avg Processing Time"
          value="18.4s"
          change={{ value: 5, type: 'decrease' }}
          icon={<Clock className="h-6 w-6" />}
          color="orange"
        />
        <MetricsCard
          title="Critical Alerts"
          value="7"
          change={{ value: 15, type: 'increase' }}
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
            <span className="font-medium">8,247 / 10,000</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: '82.47%' }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>Reset in 12 days</span>
            <span>$247.80 / $300.00</span>
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