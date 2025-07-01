import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Calendar, Filter, Search, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';

export const History: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/analyses/');
        if (!response.ok) {
          throw new Error('Failed to fetch analyses history');
        }
        const data: AnalysisResponse[] = await response.json();
        setAnalyses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyses();
  }, []);


  const filteredItems = analyses.filter(item => {
    const matchesSearch = item.fichier_details.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.resultat_analyse.synthese.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Activity History</h1>
        <p className="text-slate-600 dark:text-slate-300">Track all system activities and operations</p>
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
      </div>

      {/* History Timeline */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Analysis Timeline</h3>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          {filteredItems.map((item, index) => (
            <div key={item.id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-slate-900 dark:text-white">File Analysis Completed</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800`}>
                      SUCCESS
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-300">{item.fichier_details.nom}</span>
                  </div>
                  
                  <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">{item.resultat_analyse.synthese}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <span>Analysis ID: {item.id}</span>
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