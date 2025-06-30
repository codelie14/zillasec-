export interface FileAnalysis {
  id: string;
  fileName: string;
  fileType: 'excel' | 'csv';
  fileSize: number;
  uploadDate: string;
  status: 'uploading' | 'analyzing' | 'completed' | 'error';
  analysis?: AnalysisResult;
}

export interface AnalysisResult {
  summary: string;
  anomalies: string[];
  risks: RiskItem[];
  recommendations: string[];
  metrics: {
    riskScore: number;
    confidenceLevel: number;
    processingTime: number;
  };
  reportUrls?: {
    pdf?: string;
    excel?: string;
    powerpoint?: string;
  };
}

export interface RiskItem {
  level: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  category: string;
  impact: number;
}

export interface SystemMetrics {
  totalAnalyses: number;
  activeUsers: number;
  avgProcessingTime: number;
  anomaliesDetected: number;
  apiUsage: {
    used: number;
    limit: number;
  };
}