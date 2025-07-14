import React, { useState, useRef } from 'react';
import { Database, Upload, Video, Image, FileText, Link, Plus, Trash2, Save } from 'lucide-react';
import { TrainingData } from '../types';

interface AIFeedingProps {
  trainingData: TrainingData[];
  onAddTrainingData: (data: TrainingData) => void;
}

export default function AIFeeding({ trainingData, onAddTrainingData }: AIFeedingProps) {
  const [uploadType, setUploadType] = useState<'file' | 'url'>('file');
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    symptoms: [''],
    diseases: [''],
    animalType: 'vaca' as 'vaca' | 'caballo' | 'ambos',
    url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const addSymptom = () => {
    setFormData(prev => ({
      ...prev,
      symptoms: [...prev.symptoms, '']
    }));
  };

  const removeSymptom = (index: number) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.filter((_, i) => i !== index)
    }));
  };

  const updateSymptom = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.map((symptom, i) => i === index ? value : symptom)
    }));
  };

  const addDisease = () => {
    setFormData(prev => ({
      ...prev,
      diseases: [...prev.diseases, '']
    }));
  };

  const removeDisease = (index: number) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.filter((_, i) => i !== index)
    }));
  };

  const updateDisease = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      diseases: prev.diseases.map((disease, i) => i === index ? value : disease)
    }));
  };

  const getFileType = (file: File): 'video' | 'image' | 'pdf' | null => {
    if (file.type.startsWith('video/')) return 'video';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return null;
  };

  const handleSubmit = () => {
    if (uploadType === 'file' && !selectedFile) {
      alert('Por favor selecciona un archivo');
      return;
    }
    if (uploadType === 'url' && !formData.url.trim()) {
      alert('Por favor ingresa una URL');
      return;
    }
    if (!formData.description.trim()) {
      alert('Por favor ingresa una descripción');
      return;
    }

    const validSymptoms = formData.symptoms.filter(s => s.trim());
    const validDiseases = formData.diseases.filter(d => d.trim());

    if (validSymptoms.length === 0) {
      alert('Por favor ingresa al menos un síntoma');
      return;
    }

    const newTrainingData: TrainingData = {
      id: Date.now().toString(),
      fileName: uploadType === 'file' ? selectedFile!.name : formData.url,
      fileType: uploadType === 'file' ? getFileType(selectedFile!)! : 'url',
      description: formData.description,
      symptoms: validSymptoms,
      diseases: validDiseases,
      animalType: formData.animalType,
      uploadedAt: new Date(),
      fileSize: selectedFile?.size,
      url: uploadType === 'url' ? formData.url : undefined,
    };

    onAddTrainingData(newTrainingData);

    // Reset form
    setFormData({
      description: '',
      symptoms: [''],
      diseases: [''],
      animalType: 'vaca',
      url: ''
    });
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    alert('Datos de entrenamiento agregados exitosamente');
  };

  const deleteTrainingData = (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar estos datos de entrenamiento?')) {
      // Aquí implementarías la eliminación real
      console.log('Eliminar datos de entrenamiento:', id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Database className="w-8 h-8 text-red-500" />
        <h2 className="text-3xl font-bold text-white">Alimentación de IA</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">Cargar Datos de Entrenamiento</h3>

          {/* Upload Type Toggle */}
          <div className="flex space-x-2 mb-6">
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

          {/* File Upload or URL Input */}
          {uploadType === 'file' ? (
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
                accept="video/*,image/*,.pdf"
                onChange={handleFileSelect}
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="text-2xl">
                    {selectedFile.type.startsWith('video/') && '🎥'}
                    {selectedFile.type.startsWith('image/') && '📷'}
                    {selectedFile.type === 'application/pdf' && '📄'}
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
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-white font-medium mb-2">
                      Arrastra archivos aquí o haz clic para seleccionar
                    </p>
                    <p className="text-gray-400 text-sm">
                      Videos, imágenes y PDFs (máx. 100MB)
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
              <label className="block text-sm font-medium text-gray-300 mb-2">
                URL del Video
              </label>
              <div className="relative">
                <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://ejemplo.com/video.mp4"
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción del Contenido *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe qué síntomas o comportamientos se observan en este contenido..."
              rows={3}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Animal Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tipo de Animal
            </label>
            <select
              value={formData.animalType}
              onChange={(e) => setFormData(prev => ({ ...prev, animalType: e.target.value as any }))}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500"
            >
              <option value="vaca">Vaca</option>
              <option value="caballo">Caballo</option>
              <option value="ambos">Ambos</option>
            </select>
          </div>

          {/* Symptoms */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Síntomas Observados *
            </label>
            {formData.symptoms.map((symptom, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={symptom}
                  onChange={(e) => updateSymptom(index, e.target.value)}
                  placeholder="Ej: Cojera, Temblores, Aislamiento..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                {formData.symptoms.length > 1 && (
                  <button
                    onClick={() => removeSymptom(index)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addSymptom}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar síntoma</span>
            </button>
          </div>

          {/* Diseases */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Enfermedades Asociadas
            </label>
            {formData.diseases.map((disease, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={disease}
                  onChange={(e) => updateDisease(index, e.target.value)}
                  placeholder="Ej: Pododermatitis, Artritis, Mastitis..."
                  className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                />
                {formData.diseases.length > 1 && (
                  <button
                    onClick={() => removeDisease(index)}
                    className="text-red-400 hover:text-red-300 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={addDisease}
              className="flex items-center space-x-2 text-red-400 hover:text-red-300 text-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar enfermedad</span>
            </button>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Guardar Datos de Entrenamiento</span>
          </button>
        </div>

        {/* Training Data List */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <h3 className="text-xl font-semibold text-white mb-6">
            Datos de Entrenamiento ({trainingData.length})
          </h3>

          {trainingData.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No hay datos de entrenamiento cargados</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {trainingData.map((data) => (
                <div key={data.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {data.fileType === 'video' && '🎥'}
                        {data.fileType === 'image' && '📷'}
                        {data.fileType === 'pdf' && '📄'}
                        {data.fileType === 'url' && '🔗'}
                      </span>
                      <div>
                        <p className="text-white font-medium">{data.fileName}</p>
                        <p className="text-gray-400 text-sm">{data.animalType}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteTrainingData(data.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-gray-300 text-sm mb-3">{data.description}</p>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-gray-400 text-xs mb-1">Síntomas:</p>
                      <div className="flex flex-wrap gap-1">
                        {data.symptoms.map((symptom, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {data.diseases.length > 0 && (
                      <div>
                        <p className="text-gray-400 text-xs mb-1">Enfermedades:</p>
                        <div className="flex flex-wrap gap-1">
                          {data.diseases.map((disease, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-500/10 text-orange-400 text-xs rounded-full border border-orange-500/20"
                            >
                              {disease}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-gray-500 text-xs mt-2">
                    {data.uploadedAt.toLocaleString()}
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