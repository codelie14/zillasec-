import React from 'react';
import { 
  BarChart3, 
  FileUp, 
  History, 
  Settings,
  Users,
  FileText,
  Brain,
  TrendingUp,
  Layout as TemplateIcon,
  MessageCircle,
  Database,
  ChevronLeft, // Added for collapse icon
  ChevronRight  // Added for expand icon
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void; // Added toggle function
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  isSidebarOpen: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, to, active, isSidebarOpen }) => (
  <Link
    to={to}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-left rounded-lg transition-all duration-200 ${
      active
        ? 'bg-blue-600 text-white shadow-lg'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
    } ${!isSidebarOpen && 'justify-center'}`}
    title={isSidebarOpen ? undefined : label}
  >
    {icon}
    <span className={`font-medium transition-all duration-200 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>{label}</span>
  </Link>
);

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    { to: '/', icon: <BarChart3 className="h-5 w-5 flex-shrink-0" />, label: 'Dashboard' },
    { to: '/upload', icon: <FileUp className="h-5 w-5 flex-shrink-0" />, label: 'File Analysis' },
    { to: '/ai-insights', icon: <Brain className="h-5 w-5 flex-shrink-0" />, label: 'AI Insights' },
    { to: '/ai-chat', icon: <MessageCircle className="h-5 w-5 flex-shrink-0" />, label: 'AI Chat' },
    { to: '/reports', icon: <FileText className="h-5 w-5 flex-shrink-0" />, label: 'Reports' },
    { to: '/analytics', icon: <TrendingUp className="h-5 w-5 flex-shrink-0" />, label: 'Analytics' },
    { to: '/history', icon: <History className="h-5 w-5 flex-shrink-0" />, label: 'History' },
    { to: '/templates', icon: <TemplateIcon className="h-5 w-5 flex-shrink-0" />, label: 'Templates' },
    { to: '/users', icon: <Users className="h-5 w-5 flex-shrink-0" />, label: 'Users' },
    { to: '/database', icon: <Database className="h-5 w-5 flex-shrink-0" />, label: 'Database' },
    { to: '/settings', icon: <Settings className="h-5 w-5 flex-shrink-0" />, label: 'Settings' },
  ];

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-r border-slate-200 dark:border-slate-700 p-4 transition-all duration-300 overflow-y-auto flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
      <nav className="flex-grow space-y-2">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.to}
            icon={item.icon}
            label={item.label}
            to={item.to}
            active={location.pathname === item.to}
            isSidebarOpen={isSidebarOpen}
          />
        ))}
      </nav>
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={toggleSidebar}
          className={`w-full flex items-center justify-center px-4 py-3 text-left rounded-lg transition-all duration-200
            text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white`}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {isSidebarOpen ? (
            <ChevronLeft className="h-5 w-5 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-5 w-5 flex-shrink-0" />
          )}
          <span className={`font-medium transition-all duration-200 ${isSidebarOpen ? 'opacity-100 ml-3' : 'opacity-0 w-0'}`}>
            {isSidebarOpen ? 'Collapse' : 'Expand'}
          </span>
        </button>
      </div>
    </div>
  );
};