import React, { useState, useMemo, useRef } from 'react';
import { TrendingUp, Users, UserPlus, Download, RefreshCw, UserX } from 'lucide-react';
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
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { PageLoader } from '../common/PageLoader';

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

const emptyChartData = {
  labels: [],
  datasets: [{ data: [], backgroundColor: ['#cccccc'] }],
};

export const Analytics: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState('all');
  
  const pieChartRef = useRef<ChartJS<'pie'>>(null);
  const lineChartRef = useRef<ChartJS<'line'>>(null);

  const { data, loading, error, refetch } = useAnalyticsData(selectedCluster, selectedAffiliate);

  const handleClusterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCluster(e.target.value);
    setSelectedAffiliate('all'); // Reset affiliate when cluster changes
  };

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
    if (!data) return;

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
        { text: data.key_metrics.total.value, options: { color: '4e79a7' } }
    ], { x: 0.5, y: 1.0, fontSize: 18 });
    chartSlide.addText([
        { text: 'Comptes Actifs: ', options: { bold: true } },
        { text: data.key_metrics.active.value, options: { color: '4e79a7' } }
    ], { x: 0.5, y: 1.5, fontSize: 18 });
     chartSlide.addText([
        { text: 'Nouveaux Comptes: ', options: { bold: true } },
        { text: data.key_metrics.new.value, options: { color: '4e79a7' } }
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
    const tableRows = data.details_table.map(item => [
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
            disabled={loading || !data?.affiliates_list}
          >
            <option value="all">All Affiliates</option>
            {data?.affiliates_list.map(aff => <option key={aff} value={aff}>{aff}</option>)}
          </select>
          <button 
            onClick={() => refetch()}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            disabled={loading || !data}
          >
            <Download className="h-4 w-4" />
            <span>Générer</span>
          </button>
        </div>
      </div>

      {loading && <PageLoader />}
      {error && <div className="text-red-500 text-center p-8">Error loading analytics data: {error}</div>}
      
      {!loading && !error && data && (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard icon={Users} title="Comptes Totaux" value={data.key_metrics.total.value} change={data.key_metrics.total.change} />
            <MetricCard icon={UserPlus} title="Comptes Actifs" value={data.key_metrics.active.value} change={data.key_metrics.active.change} />
            <MetricCard icon={UserX} title="Comptes Désactivés" value={data.key_metrics.disabled.value} change={data.key_metrics.disabled.change} />
          </div>

          {/* Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-4">{pieChartTitle}</h3>
              <div className="h-64 flex items-center justify-center">
                <Pie ref={pieChartRef} data={data.pie_chart_data || emptyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="lg:col-span-3 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold mb-4">{lineChartTitle}</h3>
              <div className="h-64">
                <Line ref={lineChartRef} data={data.line_chart_data || emptyChartData} options={{ responsive: true, maintainAspectRatio: false }} />
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
                  {data.details_table.map(item => (
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
        </>
      )}
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
