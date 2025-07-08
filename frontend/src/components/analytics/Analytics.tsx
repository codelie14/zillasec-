import React, { useState, useMemo } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, Download } from 'lucide-react';
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

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('analyses');
  const [selectedPerimeter, setSelectedPerimeter] = useState('all');
  const [selectedAffiliate, setSelectedAffiliate] = useState('all');

  const rawAnalysisTrendsData = [
    { date: '2025-06-25', analyses: 10, perimeter: 'IN', affiliate: 'ABIDJAN' },
    { date: '2025-06-26', analyses: 12, perimeter: 'VAS', affiliate: 'DAKAR' },
    { date: '2025-06-27', analyses: 8, perimeter: 'IN', affiliate: 'ABIDJAN' },
    { date: '2025-06-28', analyses: 15, perimeter: 'CS', affiliate: 'ABIDJAN' },
    { date: '2025-06-29', analyses: 11, perimeter: 'IN', affiliate: 'DAKAR' },
    { date: '2025-06-30', analyses: 13, perimeter: 'PS', affiliate: 'ABIDJAN' },
    { date: '2025-07-01', analyses: 14, perimeter: 'IN', affiliate: 'ABIDJAN' },
  ];

  const rawRiskDistributionData = [
    { name: 'High Risk', value: 400, perimeter: 'IN', affiliate: 'ABIDJAN' },
    { name: 'Medium Risk', value: 300, perimeter: 'VAS', affiliate: 'DAKAR' },
    { name: 'Low Risk', value: 200, perimeter: 'CS', affiliate: 'ABIDJAN' },
    { name: 'No Risk', value: 100, perimeter: 'PS', affiliate: 'DAKAR' },
  ];

  const filteredAnalysisTrendsData = useMemo(() => {
    return rawAnalysisTrendsData.filter(data =>
      (selectedPerimeter === 'all' || data.perimeter === selectedPerimeter) &&
      (selectedAffiliate === 'all' || data.affiliate === selectedAffiliate)
    );
  }, [selectedPerimeter, selectedAffiliate]);

  const filteredRiskDistributionData = useMemo(() => {
    return rawRiskDistributionData.filter(data =>
      (selectedPerimeter === 'all' || data.perimeter === selectedPerimeter) &&
      (selectedAffiliate === 'all' || data.affiliate === selectedAffiliate)
    );
  }, [selectedPerimeter, selectedAffiliate]);

  const COLORS = ['#EF4444', '#F59E0B', '#3B82F6', '#10B981']; // Tailwind colors for risks

  const analysisTrendsChartData = {
    labels: filteredAnalysisTrendsData.map(data => data.date),
    datasets: [
      {
        label: 'Analyses',
        data: filteredAnalysisTrendsData.map(data => data.analyses),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const analysisTrendsChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
    },
    scales: {
      x: { ticks: { color: '#64748B' } }, // slate-500/600
      y: { ticks: { color: '#64748B' } },
    },
  };

  const riskDistributionChartData = {
    labels: filteredRiskDistributionData.map(data => data.name),
    datasets: [
      {
        data: filteredRiskDistributionData.map(data => data.value),
        backgroundColor: COLORS,
        borderColor: COLORS,
        borderWidth: 1,
      },
    ],
  };

  const riskDistributionChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const },
      title: { display: false },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Analytics</h1>
          <p className="text-slate-600 dark:text-slate-300">Detailed insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <select
            value={selectedPerimeter}
            onChange={(e) => setSelectedPerimeter(e.target.value)}
            className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Perimeters</option>
            <option value="IN">IN</option>
            <option value="VAS">VAS</option>
            <option value="CS">CS</option>
            <option value="PS">PS</option>
            <option value="IP">IP</option>
            <option value="TRANS">TRANS</option>
            <option value="RAN">RAN</option>
            <option value="CLOUD">CLOUD</option>
            <option value="DIGITAL">DIGITAL</option>
            <option value="Security">Security</option>
            <option value="DAO">DAO</option>
          </select>
          <select
            value={selectedAffiliate}
            onChange={(e) => setSelectedAffiliate(e.target.value)}
            className="px-4 py-2 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Affiliates</option>
            <option value="ABIDJAN">ABIDJAN (ABJ)</option>
            <option value="DAKAR">DAKAR (DKR)</option>
          </select>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Display selected filters */}
      <div className="text-sm text-slate-500 dark:text-slate-400 mt-4">
        Showing data for: <span className="font-semibold">{selectedPeriod === '7d' ? 'Last 7 days' : selectedPeriod === '30d' ? 'Last 30 days' : selectedPeriod === '90d' ? 'Last 90 days' : 'Last year'}</span>,
        Perimeter: <span className="font-semibold">{selectedPerimeter === 'all' ? 'All' : selectedPerimeter}</span>,
        Affiliate: <span className="font-semibold">{selectedAffiliate === 'all' ? 'All' : selectedAffiliate}</span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Analyses', value: '2,847', change: '+12%', icon: BarChart3, color: 'blue' },
          { label: 'Success Rate', value: '94.2%', change: '+2.1%', icon: TrendingUp, color: 'green' },
          { label: 'Avg Processing Time', value: '18.4s', change: '-5.2%', icon: Activity, color: 'orange' },
          { label: 'API Efficiency', value: '89.7%', change: '+3.4%', icon: PieChart, color: 'purple' }
        ].map((metric) => (
          <div key={metric.label} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <metric.icon className={`h-8 w-8 text-${metric.color}-500`} />
              <span className={`text-sm font-medium ${
                metric.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{metric.value}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300">{metric.label}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Trends */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analysis Trends</h3>
            <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          
          <div className="h-64">
            <Line data={analysisTrendsChartData} options={analysisTrendsChartOptions} />
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Distribution</h3>
            <PieChart className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          
          <div className="h-64">
            <Pie data={riskDistributionChartData} options={riskDistributionChartOptions} />
          </div>
        </div>
      </div>

      {/* Performance Metrics Table */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Breakdown</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Metric</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Current</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Previous</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Change</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-slate-900 dark:text-white">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {[
                { metric: 'Files Processed', current: '2,847', previous: '2,541', change: '+12.0%', trend: 'up', perimeter: 'IN', affiliate: 'ABIDJAN' },
                { metric: 'Average File Size', current: '2.4 MB', previous: '2.1 MB', change: '+14.3%', trend: 'up', perimeter: 'VAS', affiliate: 'DAKAR' },
                { metric: 'Processing Speed', current: '18.4s', previous: '19.4s', change: '-5.2%', trend: 'down', perimeter: 'CS', affiliate: 'ABIDJAN' },
                { metric: 'Error Rate', current: '5.8%', previous: '7.2%', change: '-19.4%', trend: 'down', perimeter: 'PS', affiliate: 'DAKAR' },
                { metric: 'API Calls', current: '8,247', previous: '7,891', change: '+4.5%', trend: 'up', perimeter: 'IN', affiliate: 'ABIDJAN' }
              ].filter(row =>
                (selectedPerimeter === 'all' || row.perimeter === selectedPerimeter) &&
                (selectedAffiliate === 'all' || row.affiliate === selectedAffiliate)
              ).map((row) => (
                <tr key={row.metric} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{row.metric}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.current}</td>
                  <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{row.previous}</td>
                  <td className={`px-6 py-4 font-medium ${
                    row.change.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {row.change}
                  </td>
                  <td className="px-6 py-4">
                    <TrendingUp className={`h-4 w-4 ${
                      row.trend === 'up' ? 'text-emerald-500' : 'text-red-500'
                    } ${row.trend === 'down' ? 'rotate-180' : ''}`} />
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