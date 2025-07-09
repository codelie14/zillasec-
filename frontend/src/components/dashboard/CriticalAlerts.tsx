import React from 'react';
import { AlertTriangle, WifiOff } from 'lucide-react';

const alerts = [
    { type: 'unusual_access', count: 12, location: 'ABJ', accounts: ['EMP20345', 'EMP21567'] },
    { type: 'api_throttling', endpoint: '/analyze', error_rate: '4.8%' }
];

export const CriticalAlerts: React.FC = () => (
    <div className="dashboard-card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Critical Alerts (Last 24h)</h3>
        <ul className="space-y-3">
            {alerts.map((alert, index) => (
                <li key={index} className="flex items-start p-3 bg-red-50 dark:bg-red-900/20 rounded-md">
                    <div className="alert-badge mr-3">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        {alert.type === 'unusual_access' && (
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                {alert.count} unusual access events from {alert.location}.
                                <span className="text-xs block text-red-600 dark:text-red-300">
                                    Affected accounts: {alert.accounts.join(', ')}
                                </span>
                            </p>
                        )}
                        {alert.type === 'api_throttling' && (
                            <p className="text-sm font-medium text-red-800 dark:text-red-200">
                                API Throttling on {alert.endpoint}.
                                <span className="text-xs block text-red-600 dark:text-red-300">
                                    Error rate: {alert.error_rate}
                                </span>
                            </p>
                        )}
                    </div>
                </li>
            ))}
        </ul>
    </div>
);
