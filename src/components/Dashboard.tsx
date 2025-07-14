import React from 'react';
import { BarChart3, TrendingUp, AlertTriangle, Users, Brain, Activity } from 'lucide-react';
import { AnalysisResult, Alert, User } from '../types';

interface DashboardProps {
  analysisResults: AnalysisResult[];
  alerts: Alert[];
  users: User[];
}

export default function Dashboard({ analysisResults, alerts, users }: DashboardProps) {
  const unreadAlerts = alerts.filter(alert => !alert.isRead).length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
  const onlineUsers = users.filter(user => user.isOnline).length;
  const recentAnalyses = analysisResults.slice(0, 5);

  const stats = [
    {
      title: 'Análisis Totales',
      value: analysisResults.length,
      icon: Brain,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Alertas Activas',
      value: unreadAlerts,
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Usuarios Online',
      value: onlineUsers,
      icon: Users,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Alertas Críticas',
      value: criticalAlerts,
      icon: Activity,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
    },
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10';
      case 'high': return 'text-orange-400 bg-orange-500/10';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'low': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white">Dashboard</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Sistema IA Activo</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover-scale">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Analyses */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Análisis Recientes</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <p className="text-white font-medium">{analysis.fileName}</p>
                  <p className="text-gray-400 text-sm">
                    {analysis.patterns.length} patrones detectados
                  </p>
                  <p className="text-gray-500 text-xs">
                    {analysis.timestamp.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-green-400 font-medium">
                    {Math.round(analysis.confidence * 100)}%
                  </p>
                  <p className="text-gray-400 text-sm">{analysis.animalSpecies}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-white">Alertas Recientes</h3>
            <AlertTriangle className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-start space-x-3 p-3 bg-gray-800 rounded-lg">
                <div className={`p-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{alert.title}</p>
                  <p className="text-gray-400 text-sm">{alert.description}</p>
                  <p className="text-gray-500 text-xs">
                    {alert.timestamp.toLocaleString()}
                  </p>
                </div>
                {!alert.isRead && (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Estado del Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">API GPT-4 Vision</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Sistema de Alertas</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Procesamiento de Archivos</span>
          </div>
        </div>
      </div>
    </div>
  );
}