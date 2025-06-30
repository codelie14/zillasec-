import React from 'react';
import { 
  BarChart3, 
  FileUp, 
  History, 
  Settings, 
  Users, 
  AlertTriangle,
  FileText,
  Brain,
  TrendingUp,
  Layout
} from 'lucide-react';
import { useNavigation, NavigationPage } from '../../hooks/useNavigation';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
      active 
        ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </button>
);

export const Sidebar: React.FC = () => {
  const { currentPage, navigateTo } = useNavigation();

  const menuItems: Array<{ id: NavigationPage; icon: React.ReactNode; label: string }> = [
    { id: 'dashboard', icon: <BarChart3 className="h-5 w-5" />, label: 'Dashboard' },
    { id: 'upload', icon: <FileUp className="h-5 w-5" />, label: 'File Analysis' },
    { id: 'ai-insights', icon: <Brain className="h-5 w-5" />, label: 'AI Insights' },
    { id: 'reports', icon: <FileText className="h-5 w-5" />, label: 'Reports' },
    { id: 'analytics', icon: <TrendingUp className="h-5 w-5" />, label: 'Analytics' },
    { id: 'history', icon: <History className="h-5 w-5" />, label: 'History' },
    { id: 'alerts', icon: <AlertTriangle className="h-5 w-5" />, label: 'Alerts' },
    { id: 'templates', icon: <Layout className="h-5 w-5" />, label: 'Templates' },
    { id: 'users', icon: <Users className="h-5 w-5" />, label: 'Users' },
    { id: 'settings', icon: <Settings className="h-5 w-5" />, label: 'Settings' },
  ];

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 p-4 transition-colors duration-300">
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={currentPage === item.id}
            onClick={() => navigateTo(item.id)}
          />
        ))}
      </nav>
    </div>
  );
};