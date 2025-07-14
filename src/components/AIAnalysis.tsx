import React, { useState, useRef } from 'react';
import { Brain, Upload, Video, Camera, AlertTriangle, Play, Pause, RotateCcw } from 'lucide-react';
import { AnalysisResult, Alert, User } from '../types';
import { AIAnalysisService } from '../services/AIAnalysisService';

interface AIAnalysisProps {
  analysisResults: AnalysisResult[];
  onAddAnalysisResult: (result: AnalysisResult) => void;
  onCreateAlert: (alert: Alert) => void;
  users: User[];
}

export default function AIAnalysis({ analysisResults, onAddAnalysisResult, onCreateAlert, users }: AIAnalysisProps) {
  const [analysisType, setAnalysisType] = useState<'upload' | 'camera'>('upload');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('video/') || file.type.startsWith('image/')) {
        setSelectedFile(file);
      } else {
        alert('Solo se permiten archivos de video e imagen');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: false 
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      alert('Error al acceder a la cámara: ' + error);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsRecording(false);
  };

  const startAnalysis = async () => {
    if (analysisType === 'upload' && !selectedFile) {
      alert('Por favor selecciona un archivo para analizar');
      return;
    }

    if (analysisType === 'camera' && !cameraStream) {
      alert('Por favor inicia la cámara primero');
      return;
    }

    setIsAnalyzing(true);

    try {
      let result: AnalysisResult;

      if (analysisType === 'upload') {
        result = await AIAnalysisService.analyzeFile(selectedFile!);
      } else {
        // Capturar frame de la cámara para análisis
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (videoRef.current && context) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          context.drawImage(videoRef.current, 0, 0);
          
          // Convertir a blob para análisis
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
              result = await AIAnalysisService.analyzeFile(file);
              result.fileType = 'camera';
              result.fileName = 'Análisis en tiempo real';
              
              onAddAnalysisResult(result);
              
              // Generar alerta si se detectan síntomas críticos
              await generateAlertIfNeeded(result);
            }
          }, 'image/jpeg', 0.8);
        }
        return;
      }

      onAddAnalysisResult(result);
      
      // Generar alerta si se detectan síntomas críticos
      await generateAlertIfNeeded(result);
      
      // Reset
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      alert('Error en el análisis: ' + error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAlertIfNeeded = async (result: AnalysisResult) => {
    const criticalSymptoms = result.symptoms.filter(s => s.severity === 'critical' || s.severity === 'high');
    
    if (criticalSymptoms.length > 0) {
      const alert: Alert = {
        id: Date.now().toString(),
        title: `Síntomas detectados en ${result.animalType}`,
        description: `Se detectaron ${criticalSymptoms.length} síntomas que requieren atención`,
        severity: criticalSymptoms.some(s => s.severity === 'critical') ? 'critical' : 'high',
        timestamp: new Date(),
        isRead: false,
        animalType: result.animalType,
        detectedSymptoms: criticalSymptoms.map(s => s.name),
        suggestedDiseases: [...new Set(criticalSymptoms.flatMap(s => s.associatedDiseases))],
        analysisId: result.id,
        sentToUsers: users.map(u => u.id),
      };

      onCreateAlert(alert);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Brain className="w-8 h-8 text-red-500" />
        <h2 className="text-3xl font-bold text-white">Análisis de IA</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Analysis Input */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">Análisis de Comportamiento</h3>

          {/* Analysis Type Toggle */}
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setAnalysisType('upload')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                analysisType === 'upload'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Subir Archivo</span>
            </button>
            <button
              onClick={() => setAnalysisType('camera')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                analysisType === 'camera'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Cámara en Vivo</span>
            </button>
          </div>

          {analysisType === 'upload' ? (
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center mb-6 transition-colors ${
                dragActive
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="video/*,image/*"
                onChange={handleFileSelect}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-2xl">
                    {selectedFile.type.startsWith('video/') ? '🎥' : '📷'}
                  </div>
                  <p className="text-white font-medium">{selectedFile.name}</p>
                  <p className="text-gray-400 text-sm">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Cambiar archivo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Video className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium mb-2">
                      Arrastra videos o imágenes aquí
                    </p>
                    <p className="text-gray-400 text-sm">
                      Para análisis de comportamiento animal
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Seleccionar Archivo
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                {cameraStream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                    <Camera className="w-16 h-16 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {!cameraStream ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Play className="w-4 h-4" />
                    <span>Iniciar Cámara</span>
                  </button>
                ) : (
                  <button
                    onClick={stopCamera}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Pause className="w-4 h-4" />
                    <span>Detener Cámara</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Analyze Button */}
          <button
            onClick={startAnalysis}
            disabled={isAnalyzing || (analysisType === 'upload' && !selectedFile) || (analysisType === 'camera' && !cameraStream)}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>Analizando...</span>
              </>
            ) : (
              <>
                <Brain className="w-5 h-5" />
                <span>Iniciar Análisis</span>
              </>
            )}
          </button>
        </div>

        {/* Analysis Results */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">
            Resultados de Análisis ({analysisResults.length})
          </h3>

          {analysisResults.length === 0 ? (
            <div className="text-center py-8">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No hay análisis realizados</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {analysisResults.map((result) => (
                <div key={result.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {result.fileType === 'video' && '🎥'}
                        {result.fileType === 'image' && '📷'}
                        {result.fileType === 'camera' && '📹'}
                      </span>
                      <div>
                        <p className="text-white font-medium">{result.fileName}</p>
                        <p className="text-gray-400 text-sm">{result.animalType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-400 font-bold">
                        {Math.round(result.confidence * 100)}%
                      </p>
                      <p className="text-gray-400 text-xs">Confianza</p>
                    </div>
                  </div>

                  {result.symptoms.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-gray-300 text-sm font-medium">Síntomas detectados:</p>
                      {result.symptoms.map((symptom, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${getSeverityColor(symptom.severity)}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-medium">{symptom.name}</p>
                            <span className="text-sm font-bold">
                              {Math.round(symptom.confidence * 100)}%
                            </span>
                          </div>
                          <p className="text-sm opacity-90 mb-2">{symptom.description}</p>
                          {symptom.associatedDiseases.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {symptom.associatedDiseases.map((disease, diseaseIndex) => (
                                <span
                                  key={diseaseIndex}
                                  className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full"
                                >
                                  {disease}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {result.alertGenerated && (
                    <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-red-400 text-sm">Alerta generada automáticamente</span>
                    </div>
                  )}

                  <p className="text-gray-500 text-xs mt-3">
                    {result.timestamp.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}