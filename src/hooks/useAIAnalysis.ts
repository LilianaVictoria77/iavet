import { useState } from 'react';
import { AnalysisResult, UploadData } from '../types';
import { AIAnalysisService } from '../services/AIAnalysisService';

export function useAIAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeContent = async (uploadData: UploadData): Promise<AnalysisResult | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await AIAnalysisService.analyzeContent(uploadData);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido en el análisis';
      setError(errorMessage);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeContent,
    isAnalyzing,
    error,
  };
}