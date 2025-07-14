import React from 'react';
import { Brain, AlertTriangle, TrendingUp, Clock, Target } from 'lucide-react';
import { AnalysisResult } from '../types';

interface PatternAnalysisProps {
  results: AnalysisResult[];
}

export default function PatternAnalysis({ results }: PatternAnalysisProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return '🎥';
      case 'image': return '📷';
      case 'pdf': return '📄';
      case 'url': return '🔗';
      default: return '📁';
    }
  };

  if (results.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
        <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Sin análisis disponibles</h3>
        <p className="text-gray-400">
          Sube un archivo o ingresa una URL para comenzar el análisis con IA
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-white">Resultados de Análisis</h3>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <Brain className="w-4 h-4" />
          <span>{results.length} análisis completados</span>
        </div>
      </div>

      <div className="grid gap-6">
        {results.map((result) => (
          <div key={result.id} className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getFileTypeIcon(result.fileType)}</span>
                  <div>
                    <h4 className="text-lg font-semibold text-white">{result.fileName}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{result.timestamp.toLocaleString()}</span>
                      </span>
                      {result.animalSpecies && (
                        <span className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{result.animalSpecies}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-lg font-bold text-green-400">
                      {Math.round(result.confidence * 100)}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Confianza</p>
                </div>
              </div>
            </div>

            {/* Patterns */}
            <div className="p-6">
              <h5 className="text-lg font-semibold text-white mb-4">
                Patrones Detectados ({result.patterns.length})
              </h5>
              <div className="grid gap-4">
                {result.patterns.map((pattern, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getSeverityColor(pattern.severity)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <h6 className="font-semibold">{pattern.name}</h6>
                          {pattern.isSymptom && (
                            <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full border border-red-500/30">
                              Síntoma
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{Math.round(pattern.confidence * 100)}%</span>
                        <p className="text-xs opacity-75">Confianza</p>
                      </div>
                    </div>

                    <p className="text-sm opacity-90 mb-3">{pattern.description}</p>

                    {pattern.associatedDiseases.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2 flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4" />
                          <span>Posibles enfermedades asociadas:</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {pattern.associatedDiseases.map((disease, diseaseIndex) => (
                            <span
                              key={diseaseIndex}
                              className="px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-full border border-gray-700"
                            >
                              {disease}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
                <h6 className="font-semibold text-white mb-2">Resumen del Análisis</h6>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Síntomas detectados</p>
                    <p className="text-white font-medium">
                      {result.patterns.filter(p => p.isSymptom).length}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Severidad máxima</p>
                    <p className="text-white font-medium capitalize">
                      {result.patterns.reduce((max, pattern) => {
                        const severityOrder = { low: 1, medium: 2, high: 3, critical: 4 };
                        return severityOrder[pattern.severity as keyof typeof severityOrder] > 
                               severityOrder[max as keyof typeof severityOrder] ? pattern.severity : max;
                      }, 'low')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400">Enfermedades sugeridas</p>
                    <p className="text-white font-medium">
                      {[...new Set(result.patterns.flatMap(p => p.associatedDiseases))].length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}