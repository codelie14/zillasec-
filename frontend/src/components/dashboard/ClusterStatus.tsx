import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    data: {
        labels: string[];
        values: number[];
    };
}

export const ClusterStatus: React.FC<Props> = ({ data }) => {
    const chartData = {
        labels: data.labels,
        datasets: [{
            data: data.values,
            backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2'],
            hoverBackgroundColor: ['#3e6387', '#c27021', '#b04242', '#5a8a87'],
        }],
    };

    return (
        <div className="dashboard-card bg-white dark:bg-slate-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Active Accounts by Cluster</h3>
            <div className="h-48 flex items-center justify-center">
                <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
        </div>
    );
};
