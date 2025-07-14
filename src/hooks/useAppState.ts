import { useState, useEffect } from 'react';
import { AnalysisResult, Alert, Message, User } from '../types';

export function useAppState() {
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Dr. María González',
      email: 'maria.gonzalez@vet.com',
      role: 'veterinario',
      avatar: 'https://images.pexels.com/photos/5327585/pexels-photo-5327585.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isOnline: true,
      lastSeen: new Date(),
    },
    {
      id: '2',
      name: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@ganadero.com',
      role: 'ganadero',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isOnline: false,
      lastSeen: new Date(Date.now() - 3600000),
    },
    {
      id: '3',
      name: 'Dra. Ana Martínez',
      email: 'ana.martinez@research.com',
      role: 'investigador',
      avatar: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      isOnline: true,
      lastSeen: new Date(),
    },
  ]);

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Cojera detectada en bovino',
      description: 'Patrón de marcha anormal detectado con 89% de confianza',
      severity: 'high',
      timestamp: new Date(Date.now() - 1800000),
      isRead: false,
      animalId: 'BOV-001',
      detectedPatterns: ['Cojera', 'Reducción de actividad'],
      suggestedDiseases: ['Pododermatitis', 'Artritis'],
    },
    {
      id: '2',
      title: 'Comportamiento agresivo en porcino',
      description: 'Movimientos agresivos repetitivos identificados',
      severity: 'medium',
      timestamp: new Date(Date.now() - 7200000),
      isRead: true,
      animalId: 'POR-045',
      detectedPatterns: ['Comportamiento agresivo', 'Vocalización excesiva'],
      suggestedDiseases: ['Estrés', 'Síndrome de cola mordida'],
    },
  ]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: '1',
      receiverId: '2',
      content: 'He revisado el análisis del bovino BOV-001. Recomiendo examen veterinario inmediato.',
      timestamp: new Date(Date.now() - 900000),
      isRead: false,
      attachments: [],
    },
    {
      id: '2',
      senderId: '2',
      receiverId: '1',
      content: 'Perfecto, programaré la visita para mañana temprano. ¿Necesitas algún análisis adicional?',
      timestamp: new Date(Date.now() - 600000),
      isRead: true,
      attachments: [],
    },
  ]);

  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([
    {
      id: '1',
      fileName: 'bovino_caminando.mp4',
      fileType: 'video',
      patterns: [
        {
          name: 'Cojera',
          confidence: 0.89,
          description: 'Marcha irregular con favoritismo de pata trasera derecha',
          isSymptom: true,
          associatedDiseases: ['Pododermatitis', 'Artritis', 'Lesión en casco'],
          severity: 'high',
        },
        {
          name: 'Reducción de actividad',
          confidence: 0.76,
          description: 'Movimiento limitado y postura de descanso frecuente',
          isSymptom: true,
          associatedDiseases: ['Dolor crónico', 'Infección'],
          severity: 'medium',
        },
      ],
      confidence: 0.89,
      timestamp: new Date(Date.now() - 1800000),
      animalSpecies: 'Bovino',
    },
    {
      id: '2',
      fileName: 'porcino_comportamiento.jpg',
      fileType: 'image',
      patterns: [
        {
          name: 'Comportamiento agresivo',
          confidence: 0.82,
          description: 'Postura defensiva y signos de agitación',
          isSymptom: true,
          associatedDiseases: ['Estrés', 'Síndrome de cola mordida', 'Territorialidad'],
          severity: 'medium',
        },
      ],
      confidence: 0.82,
      timestamp: new Date(Date.now() - 7200000),
      animalSpecies: 'Porcino',
    },
  ]);

  const addAnalysisResult = (result: AnalysisResult) => {
    setAnalysisResults(prev => [result, ...prev]);
  };

  const addAlert = (alert: Alert) => {
    setAlerts(prev => [alert, ...prev]);
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [message, ...prev]);
  };

  const markAlertAsRead = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, isRead: true } : alert
    ));
  };

  const markMessageAsRead = (messageId: string) => {
    setMessages(prev => prev.map(message => 
      message.id === messageId ? { ...message, isRead: true } : message
    ));
  };

  return {
    users,
    alerts,
    messages,
    analysisResults,
    addAnalysisResult,
    addAlert,
    addMessage,
    markAlertAsRead,
    markMessageAsRead,
  };
}