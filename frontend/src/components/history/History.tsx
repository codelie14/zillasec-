import React, { useState } from 'react';
import { History as HistoryIcon, Calendar, Filter, Search, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface HistoryItem {
  id: string;
  action: string;
  fileName?: string;
  user: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning' | 'info';
  details: string;
  duration?: number;
}

export const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | HistoryItem['status']>('all');
  const [dateRange, setDateRange] = useState('7d');

  const historyItems: HistoryItem[] = [
    {
      id: '1',
      action: 'File Analysis Completed',
      fileName: 'access_logs_2024.xlsx',
      user: 'admin@zillasec.com',
      timestamp: '2024-01-15T14:30:00Z',
      status: 'success',
      details: 'Analysis completed successfully with 3 anomalies detected',
      duration: 23
    },
    {
      id: '2',
      action: 'Report Generated',
      fileName: 'security_summary.pdf',
      user: 'admin@zillasec.com',
      timestamp: '2024-01-15T13:45:00Z',
      status: 'success',
      details: 'Monthly security report generated and exported',
      duration: 8
    },
    {
      id: '3',
      action: 'File Upload Failed',
      fileName: 'corrupted_data.csv',
      user: 'user@zillasec.com',
      timestamp: '2024-01-15T12:20:00Z',
      status: 'error',
      details: 'File format validation failed - unsupported encoding',
      duration: 2
    },
    {
      id: '4',
      action: 'AI Analysis Started',
      fileName: 'permissions_audit.xlsx',
      user: 'admin@zillasec.com',
      timestamp: '2024-01-15T11:15:00Z',
      status: 'info',
      details: 'AI analysis initiated for permission audit file',
      duration: 45
    },
    {
      id: '5',
      action: 'High Risk Alert',
      user: 'system',
      timestamp: '2024-01-15T10:30:00Z',
      status: 'warning',
      details: 'Unusual access pattern detected - automatic alert triggered'
    }
  ];

  const getStatusIcon = (status: HistoryItem['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'info':
        return <Clock className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status: HistoryItem['status']) => {
    switch (status) {
      case 'success':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'warning':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'info':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
    }
  };

  const filteredItems = historyItems.filter(item => {
    const matchesSearch = item.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.fileName && item.fileName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Activity History</h1>
        <p className="text-slate-600 dark:text-slate-300">Track all system activities and operations</p>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Activities', value: '1,247', icon: HistoryIcon, color: 'blue' },
          { label: 'Successful', value: '1,156', icon: CheckCircle, color: 'green' },
          { label: 'Warnings', value: '67', icon: AlertCircle, color: 'orange' },
          { label: 'Errors', value: '24', icon: XCircle, color: 'red' }
        ].map((stat) => (
          <div key={stat.label} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-300">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 text-${stat.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search activities..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Status</option>
          <option value="success">Success</option>
          <option value="error">Error</option>
          <option value="warning">Warning</option>
          <option value="info">Info</option>
        </select>

        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="1d">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
          <option value="90d">Last 90 days</option>
        </select>
      </div>

      {/* History Timeline */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Activity Timeline</h3>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredItems.map((item, index) => (
            <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(item.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">{item.action}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.toUpperCase()}
                    </span>
                  </div>
                  
                  {item.fileName && (
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">{item.fileName}</span>
                    </div>
                  )}
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{item.details}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>By {item.user}</span>
                    <span>•</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                    {item.duration && (
                      <>
                        <span>•</span>
                        <span>{item.duration}s duration</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};