import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Download, Eye, Search, Plus } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';
import { DownloadModal } from './DownloadModal';

export const Reports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [analyses, setAnalyses] = useState<AnalysisResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<number | null>(null);

  useEffect(() => {
    const fetchAnalyses = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/analyses/');
        if (!response.ok) {
          throw new Error('Failed to fetch analyses for reports');
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

  const handleDownloadClick = (id: number) => {
    setSelectedAnalysisId(id);
    setIsModalOpen(true);
  };

  const handleDownload = async (format: 'pdf' | 'excel' | 'pptx') => {
    if (!selectedAnalysisId) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/reports/${selectedAnalysisId}/download?format=${format}`);
      if (!response.ok) {
        throw new Error(`Failed to download ${format} report`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `report_${selectedAnalysisId}.${format === 'pptx' ? 'pptx' : format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsModalOpen(false);
    }
  };

  const filteredReports = analyses.filter(report => {
    const matchesSearch = report.fichier_details.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.resultat_analyse.synthese.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <>
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
        </div>

        {/* Reports List */}
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div key={report.id} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">📄</div>
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white">{report.fichier_details.nom}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{report.resultat_analyse.synthese}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {(report.fichier_details.taille / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Link to={`/reports/${report.id}`} className="p-2 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                    <Eye className="h-5 w-5" />
                  </Link>
                  <button onClick={() => handleDownloadClick(report.id)} className="p-2 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {selectedAnalysisId && (
        <DownloadModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDownload={handleDownload}
          analysisId={selectedAnalysisId}
        />
      )}
    </>
  );
};