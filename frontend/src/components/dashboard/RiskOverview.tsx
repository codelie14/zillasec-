import React from 'react';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface RiskOverviewProps {
  metrics: {
    total_anomalies: number;
    total_risks: number;
  } | null;
}

export const RiskOverview: React.FC<RiskOverviewProps> = ({ metrics }) => {
  const riskData = [
    { level: 'High', count: metrics?.total_risks ?? 0, color: 'bg-orange-500', icon: AlertTriangle },
    { level: 'Medium', count: metrics?.total_anomalies ?? 0, color: 'bg-yellow-500', icon: AlertTriangle },
    { level: 'Low', count: 0, color: 'bg-emerald-500', icon: CheckCircle },
  ];

  const totalRisks = riskData.reduce((sum, risk) => sum + risk.count, 0);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Risk Overview</h3>
        <Shield className="h-5 w-5 text-slate-600" />
      </div>
      
      {totalRisks === 0 ? (
        <div className="text-center text-slate-500 py-8">
          No risk data available.
        </div>
      ) : (
        <>
          {/* Risk Distribution Chart */}
          <div className="mb-6">
            <div className="flex h-4 rounded-full overflow-hidden bg-slate-200">
              {riskData.map((risk) => (
                <div
                  key={risk.level}
                  className={`${risk.color} transition-all duration-500`}
                  style={{ width: `${(risk.count / totalRisks) * 100}%` }}
                />
              ))}
            </div>
          </div>
          
          {/* Risk Breakdown */}
          <div className="space-y-3">
            {riskData.map((risk) => {
              const Icon = risk.icon;
              return (
                <div key={risk.level} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-1 rounded ${risk.color} bg-opacity-20`}>
                      <Icon className={`h-4 w-4 ${risk.color.replace('bg-', 'text-')}`} />
                    </div>
                    <span className="font-medium text-slate-700">{risk.level}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{risk.count}</span>
                    <span className="text-xs text-slate-500">
                      ({((risk.count / totalRisks) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Security Score</span>
            </div>
            <div className="mt-2 flex items-end space-x-2">
              <span className="text-2xl font-bold text-blue-900">78</span>
              <span className="text-sm text-blue-600 mb-1">/100</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};