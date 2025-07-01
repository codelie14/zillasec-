import React from 'react';
import { X, File as FileIcon, Download } from 'lucide-react';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (format: 'pdf' | 'excel' | 'pptx') => void;
  analysisId: number;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ isOpen, onClose, onDownload, analysisId }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Download Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <p className="text-slate-600 mb-6">
          Select a format to download the report for analysis ID: <span className="font-bold">{analysisId}</span>.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => onDownload('pdf')}
            className="w-full flex items-center justify-center space-x-3 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FileIcon className="h-5 w-5" />
            <span>Download as PDF</span>
          </button>
          <button
            onClick={() => onDownload('excel')}
            className="w-full flex items-center justify-center space-x-3 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Download className="h-5 w-5" />
            <span>Download as Excel</span>
          </button>
          <button
            onClick={() => onDownload('pptx')}
            className="w-full flex items-center justify-center space-x-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <FileIcon className="h-5 w-5" />
            <span>Download as PowerPoint</span>
          </button>
        </div>
      </div>
    </div>
  );
};