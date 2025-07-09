import React from 'react';
import { ArrowRight } from 'lucide-react';

const quickActions = [
    { icon: '📤', label: 'New Analysis', target: '/analyze' },
    { icon: '📊', label: 'Generate Report', target: '/reports' },
    { icon: '🛡️', label: 'Risk Audit', target: '/risks' },
    { icon: '⚙️', label: 'API Settings', target: '/settings' }
];

export const QuickActions: React.FC = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActions.map(action => (
            <a 
                key={action.label} 
                href={action.target}
                className="dashboard-card flex items-center p-4 bg-white dark:bg-slate-800 rounded-lg shadow transition-transform hover:scale-105"
            >
                <span className="text-2xl mr-4">{action.icon}</span>
                <div className="flex-grow">
                    <p className="font-semibold text-slate-900 dark:text-white">{action.label}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 dark:text-slate-500" />
            </a>
        ))}
    </div>
);
