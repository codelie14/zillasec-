import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { Layout } from './components/common/Layout';
import { Dashboard } from './components/dashboard/Dashboard';
import { FileUpload } from './components/analysis/FileUpload';
import { AIInsights } from './components/ai-insights/AIInsights';
import { Reports } from './components/reports/Reports';
import { Analytics } from './components/analytics/Analytics';
import { History } from './components/history/History';
import { Alerts } from './components/alerts/Alerts';
import { Templates } from './components/templates/Templates';
import { Users } from './components/users/Users';
import { Settings } from './components/settings/Settings';
import { useNavigation } from './hooks/useNavigation';

function AppContent() {
  const { currentPage } = useNavigation();

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <FileUpload />;
      case 'ai-insights':
        return <AIInsights />;
      case 'reports':
        return <Reports />;
      case 'analytics':
        return <Analytics />;
      case 'history':
        return <History />;
      case 'alerts':
        return <Alerts />;
      case 'templates':
        return <Templates />;
      case 'users':
        return <Users />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;