export interface User {
  id: string;
  name: string;
  email: string;
  role: 'veterinario' | 'ganadero' | 'investigador' | 'admin';
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
}

export interface DetectedPattern {
  name: string;
  confidence: number;
  description: string;
  isSymptom: boolean;
  associatedDiseases: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: 'video' | 'image' | 'pdf' | 'url';
  patterns: DetectedPattern[];
  confidence: number;
  timestamp: Date;
  animalSpecies?: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  isRead: boolean;
  animalId?: string;
  detectedPatterns: string[];
  suggestedDiseases: string[];
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  attachments: MessageAttachment[];
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
}