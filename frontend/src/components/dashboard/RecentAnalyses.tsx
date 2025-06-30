import React from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { FileAnalysis } from '../../types/analysis';

const mockAnalyses: FileAnalysis[] = [
  {
    id: '1',
    fileName: 'access_logs_2024.xlsx',
    fileType: 'excel',
    fileSize: 2048000,
    uploadDate: '2024-01-15T10:30:00Z',
    status: 'completed',
    analysis: {
      summary: 'Analysis completed successfully',
      anomalies: ['Unusual access pattern detected'],
      risks: [],
      recommendations: [],
      metrics: { riskScore: 75, confidenceLevel: 92, processingTime: 23 }
    }
  },
  {
    id: '2',
    fileName: 'user_permissions.csv',
    fileType: 'csv',
    fileSize: 512000,
    uploadDate: '2024-01-15T09:15:00Z',
    status: 'analyzing',
    analysis: undefined
  },
  {
    id: '3',
    fileName: 'security_events.xlsx',
    fileType: 'excel',
    fileSize: 1024000,
    uploadDate: '2024-01-15T08:45:00Z',
    status: 'completed',
    analysis: {
      summary: 'High-risk anomalies detected',
      anomalies: ['Multiple failed login attempts', 'Privilege escalation detected'],
      risks: [],
      recommendations: [],
      metrics: { riskScore: 89, confidenceLevel: 96, processingTime: 31 }
    }
  }
];

export const RecentAnalyses: React.FC = () => {
  const getStatusIcon = (status: FileAnalysis['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'analyzing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
    }
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-100';
    if (score >= 60) return 'text-orange-600 bg-orange-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-emerald-600 bg-emerald-100';
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Recent Analyses</h3>
        <FileText className="h-5 w-5 text-slate-600" />
      </div>
      
      <div className="space-y-4">
        {mockAnalyses.map((analysis) => (
          <div key={analysis.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center space-x-3">
              {getStatusIcon(analysis.status)}
              <div>
                <p className="font-medium text-slate-900">{analysis.fileName}</p>
                <p className="text-sm text-slate-600">
                  {new Date(analysis.uploadDate).toLocaleDateString()} • {(analysis.fileSize / 1024).toFixed(0)}KB
                </p>
              </div>
            </div>
            
            {analysis.analysis && (
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.analysis.metrics.riskScore)}`}>
                  Risk: {analysis.analysis.metrics.riskScore}
                </span>
                <span className="text-xs text-slate-500">
                  {analysis.analysis.metrics.processingTime}s
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors">
        View All Analyses
      </button>
    </div>
  );
};