import React, { useCallback, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Upload, File as FileIcon, X, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { AnalysisResponse } from '../../types/analysis';

interface UploadedFile {
  id: string;
  file: File;
  status: 'ready' | 'analyzing' | 'completed' | 'error';
  error?: string;
}

interface FileUploadProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
}

const DEFAULT_INSTRUCTION = `Analysez ces données d'accès et identifiez: 1) Les anomalies, 2) Les risques potentiels, 3) Les suggestions d'amélioration. Structurez la réponse en JSON en suivant ce schéma : {
  "synthese": "",
  "anomalies": [],
  "risques": [],
  "recommandations": [],
  "metriques": {
    "score_risque": 0.0,
    "confiance_analyse": 0.0
  }
}`;

export const FileUpload: React.FC<FileUploadProps> = ({ onAnalysisComplete }) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [instruction, setInstruction] = useState(DEFAULT_INSTRUCTION);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.templateInstruction) {
      setInstruction(location.state.templateInstruction);
    }
  }, [location.state]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  }, []);

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.type === 'text/csv'
    );

    const uploadedFiles: UploadedFile[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      status: 'ready',
    }));

    setFiles(prev => [...prev, ...uploadedFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id));
  };

  const startAnalysis = async (id: string) => {
    const fileToAnalyze = files.find(f => f.id === id);
    if (!fileToAnalyze) return;

    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'analyzing' } : f
    ));

    const formData = new FormData();
    formData.append('file', fileToAnalyze.file);
    formData.append('instruction', instruction);

    try {
      const response = await fetch('http://127.0.0.1:8000/analyze/', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Analysis failed');
      }

      const result: AnalysisResponse = await response.json();
      
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'completed' } : f
      ));

      onAnalysisComplete(result);

    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'error', error: error.message } : f
      ));
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'analyzing':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">File Analysis</h2>
        <p className="text-slate-600">Upload Excel or CSV files for AI-powered security analysis</p>
      </div>

      {/* Instruction Text Area */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
        <label htmlFor="instruction" className="flex items-center text-lg font-semibold text-slate-900 mb-3">
          <Bot className="h-6 w-6 mr-2 text-blue-600" />
          <span>Analysis Instruction (Prompt)</span>
        </label>
        <textarea
          id="instruction"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          rows={6}
          className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          placeholder="Enter the analysis instruction for the AI..."
        />
        <button 
          onClick={() => setInstruction(DEFAULT_INSTRUCTION)}
          className="mt-3 text-sm text-slate-600 hover:text-blue-600 transition-colors"
        >
          Reset to Default
        </button>
      </div>

      {/* Upload Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-slate-600 mb-4">
          Supports Excel (.xlsx, .xls) and CSV files up to 10MB
        </p>
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
          Select Files
        </button>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-slate-200 shadow-lg">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Uploaded Files</h3>
          
          <div className="space-y-4">
            {files.map((uploadedFile) => (
              <div key={uploadedFile.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStatusIcon(uploadedFile.status)}
                  <div>
                    <p className="font-medium text-slate-900">{uploadedFile.file.name}</p>
                    <p className="text-sm text-slate-600">
                      {(uploadedFile.file.size / 1024).toFixed(1)} KB • {uploadedFile.file.type.includes('excel') ? 'Excel' : 'CSV'}
                    </p>
                    {uploadedFile.status === 'analyzing' && (
                       <p className="text-xs text-slate-500 mt-1">Analyzing...</p>
                    )}
                     {uploadedFile.status === 'error' && (
                       <p className="text-xs text-red-500 mt-1">{uploadedFile.error}</p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'ready' && (
                    <button
                      onClick={() => startAnalysis(uploadedFile.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Analyze
                    </button>
                  )}
                  
                  {uploadedFile.status === 'completed' && (
                    <p className="text-sm font-medium text-emerald-600">Completed</p>
                  )}
                  
                  <button
                    onClick={() => removeFile(uploadedFile.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};