import React, { useState } from 'react';
import { FileText, Download, Eye, Calendar, Filter, Search, Plus } from 'lucide-react';

interface Report {
  id: string;
  name: string;
  type: 'pdf' | 'excel' | 'powerpoint';
  category: 'security' | 'compliance' | 'analysis' | 'summary';
  createdAt: string;
  size: string;
  status: 'ready' | 'generating' | 'error';
  description: string;
}

export const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | Report['category']>('all');

  const reports: Report[] = [
    {
      id: '1',
      name: 'Monthly Security Analysis',
      type: 'pdf',
      category: 'security',
      createdAt: '2024-01-15T10:30:00Z',
      size: '2.4 MB',
      status: 'ready',
      description: 'Comprehensive security analysis for January 2024'
    },
    {
      id: '2',
      name: 'Access Compliance Report',
      type: 'excel',
      category: 'compliance',
      createdAt: '2024-01-15T09:15:00Z',
      size: '1.8 MB',
      status: 'ready',
      description: 'GDPR and SOX compliance verification report'
    },
    {
      id: '3',
      name: 'AI Insights Summary',
      type: 'powerpoint',
      category: 'analysis',
      createdAt: '2024-01-15T08:45:00Z',
      size: '3.2 MB',
      status: 'generating',
      description: 'Executive summary of AI-powered insights'
    },
    {
      id: '4',
      name: 'Risk Assessment Dashboard',
      type: 'pdf',
      category: 'summary',
      createdAt: '2024-01-14T16:20:00Z',
      size: '1.5 MB',
      status: 'ready',
      description: 'Visual dashboard of current risk levels'
    }
  ];

  const getTypeIcon = (type: Report['type']) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'excel':
        return '📊';
      case 'powerpoint':
        return '📈';
    }
  };

  const getCategoryColor = (category: Report['category']) => {
    switch (category) {
      case 'security':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
      case 'compliance':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
      case 'analysis':
        return 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300';
      case 'summary':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reports</h1>
          <p className="text-slate-600 dark:text-slate-300">Generate and manage analysis reports</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors">
          <Plus className="h-5 w-5" />
          <span>Generate Report</span>
        </button>
      </div>

      {/* Report Templates */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Security Summary', icon: '🛡️', description: 'Weekly security overview' },
            { name: 'Compliance Check', icon: '✅', description: 'Regulatory compliance status' },
            { name: 'Risk Analysis', icon: '⚠️', description: 'Detailed risk assessment' }
          ].map((template) => (
            <button
              key={template.name}
              className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-left"
            >
              <div className="text-2xl mb-2">{template.icon}</div>
              <h4 className="font-medium text-slate-900 dark:text-white">{template.name}</h4>
              <p className="text-sm text-slate-600 dark:text-slate-300">{template.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as any)}
          className="px-4 py-3 bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          <option value="all">All Categories</option>
          <option value="security">Security</option>
          <option value="compliance">Compliance</option>
          <option value="analysis">Analysis</option>
          <option value="summary">Summary</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-3xl">{getTypeIcon(report.type)}</div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{report.name}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{report.description}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}>
                      {report.category.toUpperCase()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{report.size}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {report.status === 'generating' ? (
                  <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                    <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Generating...</span>
                  </div>
                ) : (
                  <>
                    <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <Eye className="h-5 w-5" />
                    </button>
                    <button className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                      <Download className="h-5 w-5" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};