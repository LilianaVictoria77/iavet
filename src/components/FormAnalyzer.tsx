import React, { useState } from 'react';
import { Search, FileText, BarChart3, TrendingUp, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { FormAnalysisService, FormData, FormComparison } from '../services/FormAnalysisService';

interface FormAnalyzerProps {
  formDataHistory: FormData[];
}

export default function FormAnalyzer({ formDataHistory }: FormAnalyzerProps) {
  const [selectedFormType, setSelectedFormType] = useState<string>('all');
  const [selectedData1, setSelectedData1] = useState<FormData | null>(null);
  const [selectedData2, setSelectedData2] = useState<FormData | null>(null);
  const [comparison, setComparison] = useState<FormComparison | null>(null);
  const [analysisReport, setAnalysisReport] = useState<any>(null);

  const formTypes = ['all', 'aiFeeding', 'userManagement', 'messaging'];
  const schemas = FormAnalysisService.getAllSchemas();

  const filteredData = selectedFormType === 'all' 
    ? formDataHistory 
    : formDataHistory.filter(data => data.formType === selectedFormType);

  const handleCompare = () => {
    if (!selectedData1 || !selectedData2) {
      alert('Selecciona dos formularios para comparar');
      return;
    }

    if (selectedData1.formType !== selectedData2.formType) {
      alert('Solo se pueden comparar formularios del mismo tipo');
      return;
    }

    try {
      const comparisonResult = FormAnalysisService.compareFormData(
        selectedData1.formType,
        selectedData1,
        selectedData2
      );
      setComparison(comparisonResult);
    } catch (error) {
      alert('Error al comparar formularios: ' + error);
    }
  };

  const handleAnalyze = (data: FormData) => {
    try {
      const report = FormAnalysisService.generateFormReport(data.formType, data);
      setAnalysisReport({ ...report, formData: data });
    } catch (error) {
      alert('Error al analizar formulario: ' + error);
    }
  };

  const getFormTypeLabel = (type: string) => {
    switch (type) {
      case 'aiFeeding': return 'Alimentación IA';
      case 'userManagement': return 'Gestión Usuarios';
      case 'messaging': return 'Mensajería';
      default: return type;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <BarChart3 className="w-8 h-8 text-red-500" />
        <h2 className="text-3xl font-bold text-white">Análisis de Formularios</h2>
      </div>

      {/* Schemas Overview */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Esquemas de Formularios Identificados</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(schemas).map(([key, schema]) => (
            <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <h4 className="text-lg font-medium text-white mb-2">{schema.formName}</h4>
              <p className="text-gray-400 text-sm mb-3">{schema.purpose}</p>
              <div className="space-y-2">
                <p className="text-gray-300 text-sm font-medium">Campos ({schema.fields.length}):</p>
                <div className="space-y-1">
                  {schema.fields.map((field, index) => (
                    <div key={index} className="flex items-center justify-between text-xs">
                      <span className="text-gray-300">{field.label}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full ${
                          field.required ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {field.type}
                        </span>
                        {field.required && (
                          <span className="text-red-400">*</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Data List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Datos de Formularios</h3>
            <select
              value={selectedFormType}
              onChange={(e) => setSelectedFormType(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-red-500"
            >
              <option value="all">Todos los tipos</option>
              {formTypes.slice(1).map(type => (
                <option key={type} value={type}>{getFormTypeLabel(type)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No hay datos de formularios</p>
              </div>
            ) : (
              filteredData.map((data) => (
                <div key={data.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{getFormTypeLabel(data.formType)}</h4>
                      <p className="text-gray-400 text-sm">{data.timestamp.toLocaleString()}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAnalyze(data)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/10"
                      >
                        <Search className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => setSelectedData1(data)}
                      className={`p-2 rounded border text-left ${
                        selectedData1?.id === data.id 
                          ? 'border-red-500 bg-red-500/10 text-red-400' 
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      Comparar A
                    </button>
                    <button
                      onClick={() => setSelectedData2(data)}
                      className={`p-2 rounded border text-left ${
                        selectedData2?.id === data.id 
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400' 
                          : 'border-gray-600 hover:border-gray-500 text-gray-300'
                      }`}
                    >
                      Comparar B
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {selectedData1 && selectedData2 && (
            <button
              onClick={handleCompare}
              className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-5 h-5" />
              <span>Comparar Formularios</span>
            </button>
          )}
        </div>

        {/* Analysis Results */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-4">Resultados de Análisis</h3>
          
          {analysisReport && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-medium text-white">Reporte Individual</h4>
                  <span className={`text-2xl font-bold ${getScoreColor(analysisReport.overallScore)}`}>
                    {analysisReport.overallScore}%
                  </span>
                </div>
                <p className="text-gray-300 text-sm mb-4">{analysisReport.summary}</p>
                
                <div className="space-y-3">
                  <h5 className="text-white font-medium">Análisis por Campo:</h5>
                  {analysisReport.fieldAnalysis.map((field: any, index: number) => (
                    <div key={index} className="bg-gray-700 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{field.field}</span>
                        <Info className="w-4 h-4 text-gray-400" />
                      </div>
                      <p className="text-gray-300 text-sm mb-2">{field.analysis}</p>
                      {field.recommendations.length > 0 && (
                        <div className="space-y-1">
                          {field.recommendations.map((rec: string, recIndex: number) => (
                            <p key={recIndex} className="text-yellow-400 text-xs flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>{rec}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {analysisReport.recommendations.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-white font-medium mb-2">Recomendaciones Generales:</h5>
                    <div className="space-y-1">
                      {analysisReport.recommendations.map((rec: string, index: number) => (
                        <p key={index} className="text-blue-400 text-sm flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>{rec}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {comparison && (
            <div className="space-y-4">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h4 className="text-lg font-medium text-white mb-3">Comparación de Formularios</h4>
                <p className="text-gray-300 text-sm mb-4">{comparison.interpretation}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                  <div>
                    <span className="text-gray-400">Cambios totales:</span>
                    <span className="text-white ml-2 font-medium">{comparison.overallChanges}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Cambios significativos:</span>
                    <span className="text-white ml-2 font-medium">{comparison.significantChanges.length}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <h5 className="text-white font-medium">Cambios Detectados:</h5>
                  {comparison.fieldComparisons.map((fieldComp, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(fieldComp.severity)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{fieldComp.fieldName}</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-current bg-opacity-20">
                          {fieldComp.severity}
                        </span>
                      </div>
                      <p className="text-sm opacity-90 mb-2">{fieldComp.interpretation}</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="opacity-75">Anterior:</span>
                          <p className="font-mono bg-gray-800 p-1 rounded mt-1">
                            {Array.isArray(fieldComp.oldValue) 
                              ? fieldComp.oldValue.join(', ') 
                              : String(fieldComp.oldValue || 'vacío')
                            }
                          </p>
                        </div>
                        <div>
                          <span className="opacity-75">Nuevo:</span>
                          <p className="font-mono bg-gray-800 p-1 rounded mt-1">
                            {Array.isArray(fieldComp.newValue) 
                              ? fieldComp.newValue.join(', ') 
                              : String(fieldComp.newValue || 'vacío')
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!analysisReport && !comparison && (
            <div className="text-center py-8">
              <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">Selecciona formularios para analizar o comparar</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}