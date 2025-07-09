import React, { useState, useMemo, useRef } from 'react';
import { TrendingUp, Users, UserPlus, Download } from 'lucide-react';
import { Line, Pie } from 'react-chartjs-2';
import PptxGenJS from 'pptxgenjs';
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
  
  const pieChartRef = useRef<ChartJS<'pie'>>(null);
  const lineChartRef = useRef<ChartJS<'line'>>(null);

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
      const affiliateData = allAffiliateData.find(d => d.affiliate === selectedAffiliate);
      labels = domains;
      data = affiliateData ? domains.map(domain => affiliateData.domains[domain] || 0) : [];
    } else {
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

  const handleGenerateReport = () => {
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';

    // Slide 1: Title Slide
    const titleSlide = pptx.addSlide();
    titleSlide.addText('Rapport Analytics', { x: 0.5, y: 1.5, fontSize: 36, bold: true, color: '003366' });
    titleSlide.addText(`Date: ${new Date().toLocaleDateString()}`, { x: 0.5, y: 2.5, fontSize: 18, color: '333333' });
    const clusterText = selectedCluster === 'all' ? 'Tous les clusters' : selectedCluster;
    const affiliateText = selectedAffiliate === 'all' ? 'Toutes les affiliates' : selectedAffiliate;
    titleSlide.addText(`Filtres: ${clusterText}, ${affiliateText}`, { x: 0.5, y: 3.0, fontSize: 14, color: '555555' });

    // Slide 2: Key Metrics & Charts
    const chartSlide = pptx.addSlide();
    chartSlide.addText('Indicateurs et Visualisations Clés', { x: 0.5, y: 0.25, fontSize: 24, bold: true, color: '003366' });

    // Key Metrics
    chartSlide.addText([
        { text: 'Comptes Totaux: ', options: { bold: true } },
        { text: keyMetrics.total.value, options: { color: '4e79a7' } }
    ], { x: 0.5, y: 1.0, fontSize: 18 });
    chartSlide.addText([
        { text: 'Comptes Actifs: ', options: { bold: true } },
        { text: keyMetrics.active.value, options: { color: '4e79a7' } }
    ], { x: 0.5, y: 1.5, fontSize: 18 });
     chartSlide.addText([
        { text: 'Comptes Désactivés: ', options: { bold: true } },
        { text: keyMetrics.new.value, options: { color: '4e79a7' } }
    ], { x: 0.5, y: 2.0, fontSize: 18 });

    // Charts
    const pieChartImg = pieChartRef.current?.toBase64Image();
    if (pieChartImg) {
      chartSlide.addImage({ data: pieChartImg, x: 0.5, y: 2.5, w: 5.5, h: 3.0 });
    }
    const lineChartImg = lineChartRef.current?.toBase64Image();
    if (lineChartImg) {
      chartSlide.addImage({ data: lineChartImg, x: 6.5, y: 2.5, w: 6.0, h: 3.0 });
    }

    // Slide 3: Details Table
    const tableSlide = pptx.addSlide();
    tableSlide.addText('Détails par Affiliate', { x: 0.5, y: 0.25, fontSize: 24, bold: true, color: '003366' });
    
    const tableHeaders = ['Affiliate', 'Comptes Total', 'Comptes GNOC', 'Comptes Affiliate', 'Comptes Admin', 'Δ Mois'];
    const tableRows = filteredData.map(item => [
      item.affiliate,
      item.total.toLocaleString(),
      item.comptesGNOC.toLocaleString(),
      item.comptesAffiliate.toLocaleString(),
      item.comptesAdmin.toLocaleString(),
      item.change
    ]);

    tableSlide.addTable([tableHeaders, ...tableRows], { 
        x: 0.5, y: 1.0, w: 12.0, 
        rowH: 0.4,
        fill: { color: 'F7F7F7' },
        border: { type: 'solid', pt: 1, color: 'CCCCCC' },
        align: 'center',
        valign: 'middle',
        fontSize: 10,
    });

    pptx.writeFile({ fileName: `Analytics_Report_${selectedCluster}_${selectedAffiliate}.pptx` });
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
          <button 
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
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
            <Pie ref={pieChartRef} data={pieChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold mb-4">{lineChartTitle}</h3>
          <div className="h-64">
            <Line ref={lineChartRef} data={lineChartData} options={{ responsive: true, maintainAspectRatio: false }} />
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
