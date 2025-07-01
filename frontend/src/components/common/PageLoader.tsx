import React from 'react';

export const PageLoader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-slate-900 flex items-center justify-center z-50">
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-150"></div>
        <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse delay-300"></div>
      </div>
    </div>
  );
};