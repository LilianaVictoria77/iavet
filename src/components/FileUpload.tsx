import React, { useState, useRef } from 'react';
import { Upload, Video, Image, FileText, Link, Loader2, AlertCircle } from 'lucide-react';
import { useAIAnalysis } from '../hooks/useAIAnalysis';

export default function FileUpload() {
  const [dragActive, setDragActive] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { analyzeContent, isAnalyzing, error } = useAIAnalysis();

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
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    const fileType = getFileType(file);
    if (!fileType) {
      alert('Tipo de archivo no soportado. Use videos, imágenes o PDFs.');
      return;
    }

    await analyzeContent({ file, type: fileType });
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) return;
    
    await analyzeContent({ url: urlInput, type: 'url' });
    setUrlInput('');
  };

  const getFileType = (file: File): 'video' | 'image' | 'pdf' | null => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return null;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'image': return Image;
      case 'pdf': return FileText;
      default: return Upload;
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Análisis de IA</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => setUploadType('file')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadType === 'file'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Archivo
          </button>
          <button
            onClick={() => setUploadType('url')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              uploadType === 'url'
                ? 'bg-red-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            URL
          </button>
        </div>
      </div>

      {uploadType === 'file' ? (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
            accept="video/*,image/*,.pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />

          {isAnalyzing ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-red-500 animate-spin" />
              <p className="text-white font-medium">Analizando con IA...</p>
              <p className="text-gray-400 text-sm">Procesando contenido con GPT-4 Vision</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-white font-medium mb-2">
                  Arrastra archivos aquí o haz clic para seleccionar
                </p>
                <p className="text-gray-400 text-sm">
                  Soporta videos, imágenes y PDFs (máx. 100MB)
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
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://ejemplo.com/video.mp4"
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                disabled={isAnalyzing}
              />
            </div>
            <button
              onClick={handleUrlSubmit}
              disabled={isAnalyzing || !urlInput.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              {isAnalyzing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              <span>{isAnalyzing ? 'Analizando...' : 'Analizar'}</span>
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Ingresa la URL de un video para análisis automático
          </p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error en el análisis</p>
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Supported formats */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { type: 'video', label: 'Videos', formats: 'MP4, AVI, MOV' },
          { type: 'image', label: 'Imágenes', formats: 'JPG, PNG, GIF' },
          { type: 'pdf', label: 'Documentos', formats: 'PDF' },
          { type: 'url', label: 'URLs', formats: 'Enlaces web' },
        ].map((format) => {
          const Icon = getFileIcon(format.type);
          return (
            <div key={format.type} className="bg-gray-800 rounded-lg p-4 text-center">
              <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-white font-medium text-sm">{format.label}</p>
              <p className="text-gray-400 text-xs">{format.formats}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}