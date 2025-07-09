import React from 'react';

const metrics = [
    { label: 'Total Accounts', value: '2,847', change: '+12', trend: '📈' },
    { label: 'Active Sessions', value: '142', change: '-5', trend: '📉' },
    { label: 'High Risk Accounts', value: '38', change: '+3', trend: '🔴' },
    { label: 'API Success Rate', value: '98.7%', change: '+0.8%', trend: '✅' }
];

export const SecurityPulse: React.FC = () => (
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
