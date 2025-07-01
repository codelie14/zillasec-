import React from 'react';
import { Clock, FileText, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';

interface RecentAnalysesProps {
  analyses: AnalysisResponse[];
}

export const RecentAnalyses: React.FC<RecentAnalysesProps> = ({ analyses }) => {

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
        {analyses.map((analysis) => (
          <div key={analysis.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center space-x-3">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              <div>
                <p className="font-medium text-slate-900">{analysis.fichier_details.nom}</p>
                <p className="text-sm text-slate-600">
                  {(analysis.fichier_details.taille / 1024).toFixed(0)}KB
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(analysis.resultat_analyse.metriques.score_risque)}`}>
                Risk: {analysis.resultat_analyse.metriques.score_risque.toFixed(0)}
              </span>
            </div>
          </div>
        ))}
      </div>
      
      <button className="w-full mt-4 text-center text-blue-600 hover:text-blue-700 font-medium text-sm py-2 hover:bg-blue-50 rounded-lg transition-colors">
        View All Analyses
      </button>
    </div>
  );
};