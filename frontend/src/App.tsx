import React, { useState, Suspense, lazy } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/common/Layout';
import { PageLoader } from './components/common/PageLoader';
import { AnalysisResponse } from './types/analysis';

const Dashboard = lazy(() => import('./components/dashboard/Dashboard').then(module => ({ default: module.Dashboard })));
const FileUpload = lazy(() => import('./components/analysis/FileUpload').then(module => ({ default: module.FileUpload })));
const AIInsights = lazy(() => import('./components/ai-insights/AIInsights').then(module => ({ default: module.AIInsights })));
const Reports = lazy(() => import('./components/reports/Reports').then(module => ({ default: module.Reports })));
const Analytics = lazy(() => import('./components/analytics/Analytics').then(module => ({ default: module.Analytics })));
const History = lazy(() => import('./components/history/History').then(module => ({ default: module.History })));
const Alerts = lazy(() => import('./components/alerts/Alerts').then(module => ({ default: module.Alerts })));
const Templates = lazy(() => import('./components/templates/Templates').then(module => ({ default: module.Templates })));
const Users = lazy(() => import('./components/users/Users').then(module => ({ default: module.Users })));
const Settings = lazy(() => import('./components/settings/Settings').then(module => ({ default: module.Settings })));
const ReportDetail = lazy(() => import('./components/reports/ReportDetail').then(module => ({ default: module.ReportDetail })));
const AIChatPage = lazy(() => import('./pages/AIChatPage').then(module => ({ default: module.AIChatPage })));

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const navigate = useNavigate();

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setAnalysisResult(result);
    navigate('/ai-insights');
  };

  return (
    <ThemeProvider>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route
              path="/upload"
              element={<FileUpload onAnalysisComplete={handleAnalysisComplete} />}
            />
            <Route
              path="/ai-insights"
              element={<AIInsights analysisResult={analysisResult} />}
            />
            <Route path="/reports" element={<Reports />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/history" element={<History />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/users" element={<Users />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/reports/:id" element={<ReportDetail />} />
            <Route path="/ai-chat" element={<AIChatPage />} />
          </Routes>
        </Suspense>
      </Layout>
    </ThemeProvider>
  );
}

export default App;