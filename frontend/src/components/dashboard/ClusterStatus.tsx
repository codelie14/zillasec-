import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
    labels: ['ABIDJAN (ABJ)', 'DAKAR (DKR)'],
    datasets: [{
        data: [65, 35],
        backgroundColor: ['#4e79a7', '#f28e2b'],
        hoverBackgroundColor: ['#3e6387', '#c27021'],
    }],
};

export const ClusterStatus: React.FC = () => (
    <div className="dashboard-card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Accounts by Cluster</h3>
        <div className="h-48 flex items-center justify-center">
            <Pie data={data} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
    </div>
);