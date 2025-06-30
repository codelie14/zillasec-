import React, { useState } from 'react';
import { TrendingUp, BarChart3, PieChart, Activity, Calendar, Download } from 'lucide-react';

export const Analytics: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('analyses');

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
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
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
          
          {/* Mock Chart */}
          <div className="h-64 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-300">Chart visualization would appear here</p>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Risk Distribution</h3>
            <PieChart className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </div>
          
          {/* Mock Pie Chart */}
          <div className="h-64 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <PieChart className="h-12 w-12 text-purple-500 mx-auto mb-2" />
              <p className="text-slate-600 dark:text-slate-300">Pie chart visualization would appear here</p>
            </div>
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
                { metric: 'Files Processed', current: '2,847', previous: '2,541', change: '+12.0%', trend: 'up' },
                { metric: 'Average File Size', current: '2.4 MB', previous: '2.1 MB', change: '+14.3%', trend: 'up' },
                { metric: 'Processing Speed', current: '18.4s', previous: '19.4s', change: '-5.2%', trend: 'down' },
                { metric: 'Error Rate', current: '5.8%', previous: '7.2%', change: '-19.4%', trend: 'down' },
                { metric: 'API Calls', current: '8,247', previous: '7,891', change: '+4.5%', trend: 'up' }
              ].map((row) => (
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