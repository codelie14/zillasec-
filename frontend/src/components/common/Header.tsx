import React from 'react';
import { Bell, Settings, User, Shield, Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigation } from '../../hooks/useNavigation';

interface HeaderProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const { navigateTo } = useNavigation();

  return (
    <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 px-6 py-4 fixed top-0 left-0 right-0 z-50 transition-colors duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isSidebarOpen ? <X className="h-6 w-6 text-slate-600 dark:text-slate-300" /> : <Menu className="h-6 w-6 text-slate-600 dark:text-slate-300" />}
          </button>
          <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">ZillaSec</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">AI-Powered Access Analysis</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
          >
            {theme === 'light' ? (
              <Moon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            ) : (
              <Sun className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            )}
          </button>
          
          <div className="relative">
            <Bell className="h-5 w-5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
          </div>
          
          <button
            onClick={() => navigateTo('settings')}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Settings className="h-5 w-5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors" />
          </button>
          
          <button
            onClick={() => navigateTo('profile')}
            className="flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 rounded-full pl-3 pr-4 py-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <User className="h-4 w-4 text-slate-600 dark:text-slate-300" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};