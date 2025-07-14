export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  cargo: string;
  createdAt: Date;
}

export interface TrainingData {
  id: string;
  fileName: string;
  fileType: 'pdf' | 'image' | 'video' | 'url';
  description: string;
  symptoms: string[];
  diseases: string[];
  animalType: 'vaca' | 'caballo' | 'ambos';
  uploadedAt: Date;
  fileSize?: number;
  url?: string;
}

export interface DetectedSymptom {
  name: string;
  confidence: number;
  description: string;
  associatedDiseases: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  location?: string;
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: 'video' | 'image' | 'camera';
  symptoms: DetectedSymptom[];
  confidence: number;
  timestamp: Date;
  animalType: 'vaca' | 'caballo' | 'desconocido';
  cameraId?: string;
  alertGenerated: boolean;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  animalType: string;
  detectedSymptoms: string[];
  suggestedDiseases: string[];
  analysisId: string;
  sentToUsers: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments: MessageAttachment[];
  alertId?: string;
}

export interface MessageAttachment {
  id: string;
  type: 'image' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
}

export interface UploadData {
  file?: File;
  url?: string;
  type: 'video' | 'image' | 'pdf' | 'url';
  description?: string;
  symptoms?: string[];
  diseases?: string[];
  animalType?: 'vaca' | 'caballo' | 'ambos';
}