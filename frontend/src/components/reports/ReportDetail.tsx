import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnalysisResponse } from '../../types/analysis';
import { ArrowLeft } from 'lucide-react';
import { AIInsights } from '../ai-insights/AIInsights'; // Reuse the AIInsights component for display

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/analyses/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch analysis details');
        }
        const data: AnalysisResponse = await response.json();
        setAnalysis(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchAnalysis();
    }
  }, [id]);

  if (loading) {
    return <div>Loading report...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!analysis) {
    return <div>Report not found.</div>;
  }

  return (
    <div className="space-y-6">
      <Link to="/reports" className="flex items-center space-x-2 text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Reports</span>
      </Link>
      
      {/* We can reuse the AIInsights component to display the details */}
      <AIInsights analysisResult={analysis} />
    </div>
  );
};