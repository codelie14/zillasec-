import React, { useState, useMemo } from 'react';
import { TrendingUp, Users, UserPlus, Download } from 'lucide-react';
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

// Data structures based on GEMINI.md
const affiliatesByCluster: { [key: string]: string[] } = {
  ABIDJAN: ["OCI", "OCD", "OCM", "OGN", "OSL", "OLB"],
  DAKAR: ["OCF", "OGB", "OBW", "OSN", "OML", "OMG"],
};
const allAffiliatesList = [...affiliatesByCluster.ABIDJAN, ...affiliatesByCluster.DAKAR];
const domains = ["IN", "VAS", "CS", "PS", "IP", "TRANS", "RAN", "CLOUD", "DIGITAL"];

// Mock data generation for domains per affiliate
const generateDomainData = () => {
  const data: { [key: string]: number } = {};
  domains.forEach(domain => {
    data[domain] = Math.floor(Math.random() * 100) + 10;
  });
  return data;
};

const allAffiliateData = [
  // ABIDJAN Cluster
  { affiliate: 'OCI', comptesGNOC: 450, comptesAffiliate: 100, comptesAdmin: 48, cluster: 'ABIDJAN', change: '+0.8%', domains: generateDomainData() },
  { affiliate: 'OCD', comptesGNOC: 600, comptesAffiliate: 120, comptesAdmin: 22, cluster: 'ABIDJAN', change: '+1.2%', domains: generateDomainData() },
  { affiliate: 'OCM', comptesGNOC: 200, comptesAffiliate: 40, comptesAdmin: 10, cluster: 'ABIDJAN', change: '+0.5%', domains: generateDomainData() },
  { affiliate: 'OGN', comptesGNOC: 300, comptesAffiliate: 70, comptesAdmin: 17, cluster: 'ABIDJAN', change: '-0.4%', domains: generateDomainData() },
  { affiliate: 'OSL', comptesGNOC: 70, comptesAffiliate: 15, comptesAdmin: 5, cluster: 'ABIDJAN', change: '+0.1%', domains: generateDomainData() },
  { affiliate: 'OLB', comptesGNOC: 10, comptesAffiliate: 3, comptesAdmin: 2, cluster: 'ABIDJAN', change: '-3.0%', domains: generateDomainData() },
  // DAKAR Cluster
  { affiliate: 'OCF', comptesGNOC: 350, comptesAffiliate: 50, comptesAdmin: 21, cluster: 'DAKAR', change: '+1.5%', domains: generateDomainData() },
  { affiliate: 'OGB', comptesGNOC: 140, comptesAffiliate: 30, comptesAdmin: 10, cluster: 'DAKAR', change: '-1.1%', domains: generateDomainData() },
  { affiliate: 'OBW', comptesGNOC: 100, comptesAffiliate: 15, comptesAdmin: 5, cluster: 'DAKAR', change: '+2.0%', domains: generateDomainData() },
  { affiliate: 'OSN', comptesGNOC: 40, comptesAffiliate: 8, comptesAdmin: 2, cluster: 'DAKAR', change: '+5.0%', domains: generateDomainData() },
  { affiliate: 'OML', comptesGNOC: 20, comptesAffiliate: 4, comptesAdmin: 1, cluster: 'DAKAR', change: '0%', domains: generateDomainData() },
  { affiliate: 'OMG', comptesGNOC: 5, comptesAffiliate: 2, comptesAdmin: 1, cluster: 'DAKAR', change: '+1.0%', domains: generateDomainData() },
].map(d => ({ ...d, total: d.comptesGNOC + d.comptesAffiliate + d.comptesAdmin }));

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState('all');

  const handleClusterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCluster(e.target.value);
    setSelectedAffiliate('all');
  };

  const filteredData = useMemo(() => {
    return allAffiliateData
      .filter(d => selectedCluster === 'all' || d.cluster === selectedCluster)
      .filter(d => selectedAffiliate === 'all' || d.affiliate === selectedAffiliate);
  }, [selectedCluster, selectedAffiliate]);

  const keyMetrics = useMemo(() => {
    const totalAccounts = filteredData.reduce((sum, item) => sum + item.total, 0);
    const activeAccounts = filteredData.reduce((sum, item) => sum + item.comptesGNOC + item.comptesAffiliate + item.comptesAdmin, 0);
    const activationRate = totalAccounts > 0 ? (activeAccounts / totalAccounts) * 100 : 0;
    return {
      total: { value: totalAccounts.toLocaleString(), change: '+3.1%' },
      active: { value: `${activeAccounts.toLocaleString()} (${activationRate.toFixed(1)}%)`, change: '+2.4%' },
      new: { value: '138', change: '-1.2%' },
    };
  }, [filteredData]);

  const pieChartData = useMemo(() => {
    if (selectedAffiliate === 'all') {
      const data = filteredData.sort((a, b) => b.total - a.total).slice(0, 12);
      return {
        labels: data.map(d => d.affiliate),
        datasets: [{
          data: data.map(d => d.total),
          backgroundColor: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab', '#86bc42', '#bf5b17'],
        }],
      };
    } else {
      const affiliateData = filteredData.find(d => d.affiliate === selectedAffiliate);
      if (!affiliateData) return { labels: [], datasets: [] };
      return {
        labels: ['Comptes GNOC', 'Comptes Affiliate', 'Comptes Admin'],
        datasets: [{
          data: [affiliateData.comptesGNOC, affiliateData.comptesAffiliate, affiliateData.comptesAdmin],
          backgroundColor: ['#4e79a7', '#f28e2b', '#e15759'],
        }],
      };
    }
  }, [filteredData, selectedAffiliate]);

  const lineChartData = useMemo(() => {
    let labels: string[];
    let data: number[];
    
    if (selectedAffiliate !== 'all') {
      // Single affiliate selected: show accounts per domain
      const affiliateData = allAffiliateData.find(d => d.affiliate === selectedAffiliate);
      labels = domains;
      data = affiliateData ? domains.map(domain => affiliateData.domains[domain] || 0) : [];
    } else {
      // All affiliates: show total active accounts per domain for the selected cluster
      labels = domains;
      data = domains.map(domain => 
        filteredData.reduce((sum, affiliate) => sum + (affiliate.domains[domain] || 0), 0)
      );
    }

    return {
      labels,
      datasets: [{
        label: 'Comptes Actifs par Domaine',
        data,
        borderColor: '#4e79a7',
        backgroundColor: 'rgba(78, 121, 167, 0.1)',
        fill: true,
        tension: 0.3,
      }],
    };
  }, [filteredData, selectedAffiliate]);

  const pieChartTitle = useMemo(() => {
    if (selectedAffiliate === 'all') return 'Répartition par Affiliate';
    return `Détail des comptes pour ${selectedAffiliate}`;
  }, [selectedAffiliate]);

  const lineChartTitle = useMemo(() => {
    if (selectedAffiliate !== 'all') {
      return `Comptes actifs par domaine pour ${selectedAffiliate}`;
    }
    if (selectedCluster === 'all') {
      return 'Comptes actifs par domaine (Tous les Clusters)';
    }
    return `Comptes actifs par domaine (${selectedCluster})`;
  }, [selectedAffiliate, selectedCluster]);

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
            onChange={handleClusterChange}
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
            {(selectedCluster === 'all' ? allAffiliatesList : affiliatesByCluster[selectedCluster]).map(aff => <option key={aff} value={aff}>{aff}</option>)}
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
        <MetricCard icon={TrendingUp} title="Comptes Désactivés" value={keyMetrics.new.value} change={keyMetrics.new.change} />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">{pieChartTitle}</h3>
          <div className="h-64 flex items-center justify-center">
            <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">{lineChartTitle}</h3>
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
                  <td className="px-6 py-4">{item.comptesGNOC.toLocaleString()}</td>
                  <td className="px-6 py-4">{item.comptesAffiliate.toLocaleString()}</td>
                  <td className="px-6 py-4">{item.comptesAdmin.toLocaleString()}</td>
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
