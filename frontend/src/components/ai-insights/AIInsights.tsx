import React from 'react';
import { Brain, FileText, BarChart2, AlertTriangle, CheckCircle, Users, Database, Shield } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';
import { Navigate } from 'react-router-dom';

interface AIInsightsProps {
  analysisResult: AnalysisResponse | null;
}

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
  <div className="bg-slate-50 p-4 rounded-lg flex items-center">
    <div className="p-2 bg-slate-200 rounded-md mr-4">{icon}</div>
    <div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export const AIInsights: React.FC<AIInsightsProps> = ({ analysisResult }) => {

  if (!analysisResult) {
    return <Navigate to="/upload" />;
  }

  const { fichier_details, resultat_analyse } = analysisResult;
  const { metadata, statistiques, verification_bd, alertes, details_comptes } = resultat_analyse;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Analysis Report</h1>
        <p className="text-slate-600">
          For <span className="font-medium">{metadata.fichier}</span> analyzed on {new Date(metadata.date_analyse).toLocaleDateString()}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total" value={statistiques.total_comptes} icon={<Users className="h-6 w-6 text-blue-600" />} />
        <StatCard title="Active" value={statistiques.comptes_actifs} icon={<CheckCircle className="h-6 w-6 text-green-600" />} />
        <StatCard title="Inactive" value={statistiques.comptes_desactives} icon={<AlertTriangle className="h-6 w-6 text-yellow-600" />} />
        <StatCard title="Admins" value={statistiques.comptes_admin} icon={<Shield className="h-6 w-6 text-red-600" />} />
        <StatCard title="Affiliates" value={statistiques.comptes_filiale} icon={<Users className="h-6 w-6 text-purple-600" />} />
        <StatCard title="Support" value={statistiques.comptes_support} icon={<Users className="h-6 w-6 text-orange-600" />} />
      </div>
      
      {/* DB Verification & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-blue-500 mr-3" />
            <h2 className="text-xl font-semibold text-slate-900">Database Verification</h2>
          </div>
          <div className="space-y-3">
            <p>Present in DB: <span className="font-bold">{verification_bd.comptes_presents}</span></p>
            <p>Absent from DB: <span className="font-bold">{verification_bd.comptes_absents}</span></p>
            {verification_bd.incoherences_statut.length > 0 && (
              <div>
                <h4 className="font-semibold mt-2">Status Inconsistencies:</h4>
                <ul className="list-disc list-inside">
                  {verification_bd.incoherences_statut.map((inc, i) => (
                    <li key={i}>{inc.prenom} {inc.nom}: File says {inc.statut_fichier}, DB says {inc.statut_bd}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-red-500 mr-3" />
            <h2 className="text-xl font-semibold text-slate-900">Alerts</h2>
          </div>
           <div className="space-y-3">
            <p>Disabled Admins: <span className="font-bold">{alertes.admin_desactives}</span></p>
            <p>Disabled Sensitive Access: <span className="font-bold">{alertes.acces_sensibles_desactives}</span></p>
            {alertes.doublons_cuid.length > 0 && (
              <div>
                <h4 className="font-semibold mt-2">Duplicate CUIDs:</h4>
                <ul className="list-disc list-inside">
                  {alertes.doublons_cuid.map((cuid, i) => <li key={i}>{cuid}</li>)}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Details Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Account Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th scope="col" className="px-6 py-3">Name</th>
                <th scope="col" className="px-6 py-3">Huawei ID</th>
                <th scope="col" className="px-6 py-3">CUID</th>
                <th scope="col" className="px-6 py-3">File Status</th>
                <th scope="col" className="px-6 py-3">In DB?</th>
                <th scope="col" className="px-6 py-3">DB Status</th>
              </tr>
            </thead>
            <tbody>
              {details_comptes.map((acc, i) => (
                <tr key={i} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{acc.prenom} {acc.nom}</td>
                  <td className="px-6 py-4">{acc.id_huawei}</td>
                  <td className="px-6 py-4">{acc.cuid}</td>
                  <td className="px-6 py-4">{acc.statut}</td>
                  <td className="px-6 py-4">{acc.present_en_bd ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4">{acc.statut_bd ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};