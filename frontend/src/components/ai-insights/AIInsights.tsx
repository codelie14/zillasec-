import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface InsightCard {
  id: string;
  type: 'anomaly' | 'trend' | 'recommendation' | 'prediction';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export const AIInsights: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'anomaly' | 'trend' | 'recommendation' | 'prediction'>('all');

  const insights: InsightCard[] = [
    {
      id: '1',
      type: 'anomaly',
      title: 'Unusual Access Pattern Detected',
      description: 'User john.doe@company.com accessed 47 different systems within 2 hours, which is 340% above their normal pattern.',
      confidence: 94,
      impact: 'high',
      timestamp: '2024-01-15T14:30:00Z'
    },
    {
      id: '2',
      type: 'trend',
      title: 'Increasing After-Hours Access',
      description: 'After-hours system access has increased by 23% over the past 30 days, primarily in the finance department.',
      confidence: 87,
      impact: 'medium',
      timestamp: '2024-01-15T13:15:00Z'
    },
    {
      id: '3',
      type: 'recommendation',
      title: 'Optimize Permission Structure',
      description: 'Analysis suggests consolidating 12 similar roles into 4 standardized roles could reduce complexity by 60%.',
      confidence: 91,
      impact: 'medium',
      timestamp: '2024-01-15T12:45:00Z'
    },
    {
      id: '4',
      type: 'prediction',
      title: 'Potential Security Breach Risk',
      description: 'Current access patterns suggest 73% probability of unauthorized access attempt within next 48 hours.',
      confidence: 82,
      impact: 'critical',
      timestamp: '2024-01-15T11:20:00Z'
    }
  ];

  const getTypeIcon = (type: InsightCard['type']) => {
    switch (type) {
      case 'anomaly':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'trend':
        return <TrendingUp className="h-5 w-5 text-blue-500" />;
      case 'recommendation':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'prediction':
        return <Zap className="h-5 w-5 text-purple-500" />;
    }
  };

  const getImpactColor = (impact: InsightCard['impact']) => {
    switch (impact) {
      case 'low':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300';
      case 'critical':
        return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
    }
  };

  const filteredInsights = selectedFilter === 'all' 
    ? insights 
    : insights.filter(insight => insight.type === selectedFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI Insights</h1>
        <p className="text-slate-600 dark:text-slate-300">Advanced AI-powered analysis and recommendations</p>
      </div>

      {/* AI Processing Status */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Analysis Status</h3>
          <Brain className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Clock className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-blue-800 dark:text-blue-300">Processing</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-200">3</p>
          </div>
          
          <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Completed Today</p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-200">47</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <Zap className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">Avg Confidence</p>
            <p className="text-2xl font-bold text-purple-900 dark:text-purple-200">89%</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-2 border border-slate-200 dark:border-slate-700">
        {[
          { key: 'all', label: 'All Insights' },
          { key: 'anomaly', label: 'Anomalies' },
          { key: 'trend', label: 'Trends' },
          { key: 'recommendation', label: 'Recommendations' },
          { key: 'prediction', label: 'Predictions' }
        ].map((filter) => (
          <button
            key={filter.key}
            onClick={() => setSelectedFilter(filter.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedFilter === filter.key
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredInsights.map((insight) => (
          <div key={insight.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getTypeIcon(insight.type)}
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{insight.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 capitalize">{insight.type}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(insight.impact)}`}>
                {insight.impact.toUpperCase()}
              </span>
            </div>
            
            <p className="text-slate-600 dark:text-slate-300 mb-4">{insight.description}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Confidence</p>
                  <p className="font-semibold text-slate-900 dark:text-white">{insight.confidence}%</p>
                </div>
                <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${insight.confidence}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(insight.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};