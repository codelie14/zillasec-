import { Route, Routes } from 'react-router-dom';
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

function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/ai-insights" element={<AIInsights />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/users" element={<Users />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}

export default App;