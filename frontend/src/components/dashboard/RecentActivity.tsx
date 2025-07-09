import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const activities = [
    { time: '10:23', user: 'admin', action: 'File Upload', status: '✅' },
    { time: '09:45', user: 'j.doe', action: 'Risk Review', status: '⚠️' },
    { time: '08:12', user: 'a.smith', action: 'Report Export', status: '✅' }
];

export const RecentActivity: React.FC = () => (
    <div className="dashboard-card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Recent Activity</h3>
        <table className="w-full text-sm">
            <thead>
                <tr className="text-left text-slate-500 dark:text-slate-400">
                    <th className="pb-2">Time</th>
                    <th className="pb-2">User</th>
                    <th className="pb-2">Action</th>
                    <th className="pb-2 text-right">Status</th>
                </tr>
            </thead>
            <tbody>
                {activities.map((activity, index) => (
                    <tr key={index} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="py-2">{activity.time}</td>
                        <td className="py-2">{activity.user}</td>
                        <td className="py-2">{activity.action}</td>
                        <td className="py-2 text-right">{activity.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);
