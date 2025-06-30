import React from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Zap, FileText, BarChart2, ThumbsUp, AlertOctagon } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';
import { Navigate } from 'react-router-dom';

interface AIInsightsProps {
  analysisResult: AnalysisResponse | null;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ analysisResult }) => {

  if (!analysisResult) {
    // Redirect to upload page if no result is available
    return <Navigate to="/upload" />;
  }

  const { fichier_details, resultat_analyse } = analysisResult;

  const getImpactColor = (score: number) => {
    if (score > 0.75) return 'bg-red-100 text-red-800';
    if (score > 0.5) return 'bg-orange-100 text-orange-800';
    if (score > 0.25) return 'bg-yellow-100 text-yellow-800';
    return 'bg-emerald-100 text-emerald-800';
  };
  
  const getImpactText = (score: number) => {
    if (score > 0.75) return 'Critical';
    if (score > 0.5) return 'High';
    if (score > 0.25) return 'Medium';
    return 'Low';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Analysis Report</h1>
        <p className="text-slate-600">Results for: <span className="font-medium">{fichier_details.nom}</span></p>
      </div>

      {/* Summary Card */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center mb-4">
          <Brain className="h-6 w-6 text-blue-600 mr-3" />
          <h2 className="text-xl font-semibold text-slate-900">Executive Summary</h2>
        </div>
        <p className="text-slate-700 leading-relaxed">{resultat_analyse.synthese}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg text-center">
          <AlertOctagon className={`h-10 w-10 mx-auto mb-3 ${getImpactColor(resultat_analyse.metriques.score_risque).split(' ')[1]}`} />
          <p className="text-sm font-medium text-slate-600">Overall Risk Score</p>
          <p className={`text-3xl font-bold ${getImpactColor(resultat_analyse.metriques.score_risque).split(' ')[1]}`}>
            {(resultat_analyse.metriques.score_risque * 100).toFixed(0)}
          </p>
           <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-2 ${getImpactColor(resultat_analyse.metriques.score_risque)}`}>
            {getImpactText(resultat_analyse.metriques.score_risque)}
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg text-center">
          <Zap className="h-10 w-10 text-purple-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Analysis Confidence</p>
          <p className="text-3xl font-bold text-purple-800">
            {(resultat_analyse.metriques.confiance_analyse * 100).toFixed(0)}%
          </p>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg text-center">
          <FileText className="h-10 w-10 text-green-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Data Points Analyzed</p>
          <p className="text-3xl font-bold text-green-800">
            {fichier_details.lignes * fichier_details.colonnes.length}
          </p>
        </div>
      </div>

      {/* Detailed Findings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Anomalies */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-500 mr-3" />
            <h2 className="text-xl font-semibold text-slate-900">Anomalies Detected</h2>
          </div>
          <ul className="space-y-3 list-disc list-inside text-slate-600">
            {resultat_analyse.anomalies.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
             {resultat_analyse.anomalies.length === 0 && <p>No significant anomalies detected.</p>}
          </ul>
        </div>

        {/* Risks */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center mb-4">
            <BarChart2 className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-slate-900">Potential Risks</h2>
          </div>
          <ul className="space-y-3 list-disc list-inside text-slate-600">
            {resultat_analyse.risques.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
            {resultat_analyse.risques.length === 0 && <p>No significant risks identified.</p>}
          </ul>
        </div>
      </div>
      
      {/* Recommendations */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center mb-4">
          <ThumbsUp className="h-6 w-6 text-emerald-500 mr-3" />
          <h2 className="text-xl font-semibold text-slate-900">Recommendations</h2>
        </div>
        <ul className="space-y-3 list-disc list-inside text-slate-600">
          {resultat_analyse.recommandations.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
          {resultat_analyse.recommandations.length === 0 && <p>No specific recommendations at this time.</p>}
        </ul>
      </div>
    </div>
  );
};