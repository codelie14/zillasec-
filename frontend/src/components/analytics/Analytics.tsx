import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, UserPlus, Download, PieChart, LineChart } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Mock data based on GEMINI.md
const affiliates = ["OCI", "OCD", "OCF", "OCM", "OGN", "OGB", "OBW", "OSL", "OSN", "OML", "OLB", "OMG"];

const allAffiliateData = [
  { affiliate: 'OCD', total: 742, active: 635, change: '+1.2%', cluster: 'ABIDJAN' },
  { affiliate: 'OCI', total: 598, active: 512, change: '+0.8%', cluster: 'ABIDJAN' },
  { affiliate: 'OCF', total: 421, active: 362, change: '+1.5%', cluster: 'ABIDJAN' },
  { affiliate: 'OGN', total: 387, active: 321, change: '-0.4%', cluster: 'DAKAR' },
  { affiliate: 'OCM', total: 250, active: 210, change: '+0.5%', cluster: 'ABIDJAN' },
  { affiliate: 'OGB', total: 180, active: 150, change: '-1.1%', cluster: 'DAKAR' },
  { affiliate: 'OBW', total: 120, active: 110, change: '+2.0%', cluster: 'DAKAR' },
  { affiliate: 'OSL', total: 90, active: 80, change: '+0.1%', cluster: 'ABIDJAN' },
  { affiliate: 'OSN', total: 50, active: 45, change: '+5.0%', cluster: 'DAKAR' },
  { affiliate: 'OML', total: 25, active: 20, change: '0%', cluster: 'ABIDJAN' },
  { affiliate: 'OLB', total: 15, active: 12, change: '-3.0%', cluster: 'DAKAR' },
  { affiliate: 'OMG', total: 8, active: 5, change: '+1.0%', cluster: 'ABIDJAN' },
];

const evolutionData = [
  { date: "2025-06-01", "active_accounts": 2310, cluster: 'ABIDJAN' },
  { date: "2025-06-15", "active_accounts": 2385, cluster: 'ABIDJAN' },
  { date: "2025-06-30", "active_accounts": 2412, cluster: 'ABIDJAN' },
  { date: "2025-07-01", "active_accounts": 2420, cluster: 'DAKAR' },
  { date: "2025-07-15", "active_accounts": 2450, cluster: 'DAKAR' },
  { date: "2025-07-30", "active_accounts": 2480, cluster: 'DAKAR' },
];

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState('all');

  const filteredData = useMemo(() => {
    return allAffiliateData
      .filter(d => selectedCluster === 'all' || d.cluster === selectedCluster)
      .filter(d => selectedAffiliate === 'all' || d.affiliate === selectedAffiliate);
  }, [selectedCluster, selectedAffiliate]);

  const filteredEvolutionData = useMemo(() => {
    return evolutionData.filter(d => selectedCluster === 'all' || d.cluster === selectedCluster);
  }, [selectedCluster]);

  const keyMetrics = useMemo(() => {
    const totalAccounts = filteredData.reduce((sum, item) => sum + item.total, 0);
    const activeAccounts = filteredData.reduce((sum, item) => sum + item.active, 0);
    const activationRate = totalAccounts > 0 ? (activeAccounts / totalAccounts) * 100 : 0;
    return {
      total: { value: totalAccounts.toLocaleString(), change: '+3.1%' },
      active: { value: `${activeAccounts.toLocaleString()} (${activationRate.toFixed(1)}%)`, change: '+2.4%' },
      new: { value: '138', change: '-1.2%' },
    };
  }, [filteredData]);

  const pieChartData = {
    labels: filteredData.slice(0, 5).map(d => d.affiliate),
    datasets: [{
      data: filteredData.slice(0, 5).map(d => d.active),
      backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f'],
    }],
  };

  const lineChartData = {
    labels: filteredEvolutionData.map(d => d.date),
    datasets: [{
      label: 'Comptes Actifs',
      data: filteredEvolutionData.map(d => d.active_accounts),
      borderColor: '#4e79a7',
      tension: 0.3,
    }],
  };

  return (
    <div className="space-y-8">
      {/* Header and Filters */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-slate-600 dark:text-slate-300">Focus sur les comptes actifs et leur évolution.</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="all">All Clusters</option>
            <option value="ABIDJAN">ABIDJAN (ABJ)</option>
            <option value="DAKAR">DAKAR (DKR)</option>
          </select>
          <select
            value={selectedAffiliate}
            onChange={(e) => setSelectedAffiliate(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg"
          >
            <option value="all">All Affiliates</option>
            {affiliates.map(aff => <option key={aff} value={aff}>{aff}</option>)}
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Générer</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard icon={Users} title="Comptes Totaux" value={keyMetrics.total.value} change={keyMetrics.total.change} />
        <MetricCard icon={UserPlus} title="Comptes Actifs" value={keyMetrics.active.value} change={keyMetrics.active.change} />
        <MetricCard icon={TrendingUp} title="Nouveaux Comptes" value={keyMetrics.new.value} change={keyMetrics.new.change} />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Répartition par Affiliate (Top 5)</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">Évolution des Comptes</h3>
          <div className="h-64">
            <Line data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Details Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold">Détails par Affiliate</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-3 font-medium">Affiliate</th>
                <th className="px-6 py-3 font-medium">Comptes Total</th>
                <th className="px-6 py-3 font-medium">Comptes GNOC</th>
                <th className="px-6 py-3 font-medium">Comptes Affiliate</th>
                <th className="px-6 py-3 font-medium">Comptes Admin</th>
                <th className="px-6 py-3 font-medium">Δ Mois</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredData.map(item => (
                <tr key={item.affiliate} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-6 py-4 font-bold">{item.affiliate}</td>
                  <td className="px-6 py-4">{item.total.toLocaleString()}</td>
                  <td className="px-6 py-4">{item.active.toLocaleString()}</td>
                  <td className="px-6 py-4">{((item.active / item.total) * 100).toFixed(1)}</td>
                  <td className="px-6 py-4">{((item.active / item.total) * 100).toFixed(1)}</td>
                  {/* <td className="px-6 py-4">{item.admin.toLocaleString()}</td> */}
                  <td className={`px-6 py-4 font-medium ${item.change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
                    {item.change}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Helper component for Key Metrics
interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: string;
  change: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, title, value, change }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
    <div className="flex justify-between items-start">
      <div className="flex items-center space-x-4">
        <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-lg">
          <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        </div>
      </div>
      <span className={`text-sm font-medium ${change.startsWith('+') ? 'text-emerald-500' : 'text-red-500'}`}>
        {change}
      </span>
    </div>
  </div>
);
