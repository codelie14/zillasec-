import { useState } from 'react';

export type NavigationPage = 
  | 'dashboard' 
  | 'upload' 
  | 'ai-insights' 
  | 'reports' 
  | 'history' 
  | 'users' 
  | 'settings'
  | 'profile'
  | 'templates'
  | 'analytics';

export const useNavigation = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('dashboard');

  const navigateTo = (page: NavigationPage) => {
    setCurrentPage(page);
  };

  return {
    currentPage,
    navigateTo
  };
};