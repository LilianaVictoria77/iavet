import React, { useState } from 'react';
import { Brain, Users, MessageSquare, AlertTriangle, Upload, Video, Database, BarChart3 } from 'lucide-react';
import AIFeeding from './components/AIFeeding';
import AIAnalysis from './components/AIAnalysis';
import UserManagement from './components/UserManagement';
import MessagingSystem from './components/MessagingSystem';
import AlertSystem from './components/AlertSystem';
import FormAnalyzer from './components/FormAnalyzer';
import { useAppState } from './hooks/useAppState';
import { FormData } from './types';

type ActiveTab = 'feeding' | 'analysis' | 'users' | 'messages' | 'alerts' | 'analyzer';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('feeding');
  const [formDataHistory, setFormDataHistory] = useState<FormData[]>([]);
  
  const { 
    users, 
    alerts, 
    messages, 
    trainingData,
    analysisResults,
    addUser,
    addAlert,
    addMessage,
    addTrainingData,
    addAnalysisResult
  } = useAppState();

  // Función para agregar datos de formulario al historial
  const addFormData = (formType: string, data: Record<string, any>) => {
    const formData: FormData = {
      id: Date.now().toString(),
      formType,
      data,
      timestamp: new Date(),
    };
    setFormDataHistory(prev => [formData, ...prev]);
  };

  const tabs = [
    { id: 'feeding' as const, label: 'Alimentación IA', icon: Database },
    { id: 'analysis' as const, label: 'Análisis IA', icon: Brain },
    { id: 'users' as const, label: 'Usuarios', icon: Users },
    { id: 'messages' as const, label: 'Mensajes', icon: MessageSquare },
    { id: 'alerts' as const, label: 'Alertas', icon: AlertTriangle },
    { id: 'analyzer' as const, label: 'Análisis Formularios', icon: BarChart3 },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'feeding':
        return <AIFeeding 
          trainingData={trainingData} 
          onAddTrainingData={(data) => {
            addTrainingData(data);
            addFormData('aiFeeding', data);
          }} 
        />;
      case 'analysis':
        return <AIAnalysis 
          analysisResults={analysisResults} 
          onAddAnalysisResult={addAnalysisResult}
          onCreateAlert={addAlert}
          users={users}
        />;
      case 'users':
        return <UserManagement 
          users={users} 
          onAddUser={(userData) => {
            const user = addUser(userData);
            addFormData('userManagement', userData);
            return user;
          }} 
        />;
      case 'messages':
        return <MessagingSystem 
          messages={messages} 
          users={users} 
          onSendMessage={(message) => {
            addMessage(message);
            addFormData('messaging', {
              content: message.content,
              receiverId: message.receiverId,
              attachments: message.attachments
            });
          }}
        />;
      case 'alerts':
        return <AlertSystem alerts={alerts} />;
      case 'analyzer':
        return <FormAnalyzer formDataHistory={formDataHistory} />;
      default:
        return <AIFeeding 
          trainingData={trainingData} 
          onAddTrainingData={(data) => {
            addTrainingData(data);
            addFormData('aiFeeding', data);
          }} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Brain className="w-8 h-8 text-red-500" />
              <h1 className="text-xl font-bold">Sistema IA Comportamiento Animal</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-1 text-sm text-gray-400">
                <Video className="w-4 h-4" />
                <Upload className="w-4 h-4" />
                <Database className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-400">Sistema Real Activo</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-500'
                      : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;