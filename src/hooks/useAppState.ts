import { useState } from 'react';
import { User, TrainingData, AnalysisResult, Alert, Message } from '../types';

export function useAppState() {
  const [users, setUsers] = useState<User[]>([]);
  const [trainingData, setTrainingData] = useState<TrainingData[]>([]);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  };

  const addTrainingData = (data: TrainingData) => {
    setTrainingData(prev => [data, ...prev]);
  };

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
    trainingData,
    analysisResults,
    alerts,
    messages,
    addUser,
    addTrainingData,
    addAnalysisResult,
    addAlert,
    addMessage,
    markAlertAsRead,
    markMessageAsRead,
  };
}