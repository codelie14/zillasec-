import React from 'react';

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

interface Props {
    data: SecurityPulseData;
}

export const SecurityPulse: React.FC<Props> = ({ data }) => {
    const metrics = [
        { label: 'Total Accounts', ...data.total_accounts },
        { label: 'Active Sessions', ...data.active_sessions },
        { label: 'High Risk Accounts', ...data.high_risk_accounts },
        { label: 'API Success Rate', ...data.api_success_rate }
    ];

    return (
        <div className="dashboard-card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Security Pulse</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map(metric => (
                    <div key={metric.label} className="text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">{metric.label}</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                        <p className={`text-xs ${metric.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                            {metric.change} (24h) {metric.trend}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};