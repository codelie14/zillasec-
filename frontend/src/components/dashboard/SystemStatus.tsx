import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const data = {
    labels: ['AI Engine', 'Database', 'API'],
    datasets: [{
        label: 'System Health (%)',
        data: [100, 95, 98],
        backgroundColor: ['#76b7b2', '#59a14f', '#4e79a7'],
    }],
};

export const SystemStatus: React.FC = () => (
    <div className="dashboard-card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">System Status</h3>
        <div className="h-48">
            <Bar 
                data={data} 
                options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true, max: 100 } }
                }} 
            />
        </div>
    </div>
);