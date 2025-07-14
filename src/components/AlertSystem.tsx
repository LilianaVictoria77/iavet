import React, { useState } from 'react';
import { AlertTriangle, Clock, CheckCircle, XCircle, Filter, Search } from 'lucide-react';
import { Alert } from '../types';

interface AlertSystemProps {
  alerts: Alert[];
}

export default function AlertSystem({ alerts }: AlertSystemProps) {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         alert.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'read' && alert.isRead) ||
                         (statusFilter === 'unread' && !alert.isRead);
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/10 border-green-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📋';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Medio';
      case 'low': return 'Bajo';
      default: return severity;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `hace ${minutes} minuto${minutes > 1 ? 's' : ''}`;
    return 'hace un momento';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="w-8 h-8 text-red-500" />
          <h2 className="text-3xl font-bold text-white">Sistema de Alertas</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-sm">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-gray-400">{alerts.filter(a => !a.isRead).length} sin leer</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar alertas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full pl-10 pr-8 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 appearance-none"
            >
              <option value="all">Todas las severidades</option>
              <option value="critical">Crítico</option>
              <option value="high">Alto</option>
              <option value="medium">Medio</option>
              <option value="low">Bajo</option>
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 appearance-none"
          >
            <option value="all">Todos los estados</option>
            <option value="unread">Sin leer</option>
            <option value="read">Leídas</option>
          </select>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`bg-gray-900 rounded-lg border p-6 transition-all hover-scale ${
              alert.isRead ? 'border-gray-800' : 'border-red-500/30 bg-red-500/5'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div className="text-3xl">{getSeverityIcon(alert.severity)}</div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{alert.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(alert.severity)}`}>
                      {getSeverityLabel(alert.severity)}
                    </span>
                    {!alert.isRead && (
                      <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </div>
                  
                  <p className="text-gray-300 mb-3">{alert.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(alert.timestamp)}</span>
                    </div>
                    {alert.animalId && (
                      <div className="flex items-center space-x-1">
                        <span>ID Animal:</span>
                        <span className="text-white font-medium">{alert.animalId}</span>
                      </div>
                    )}
                  </div>

                  {/* Detected Patterns */}
                  {alert.detectedPatterns.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-300 mb-2">Patrones detectados:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.detectedPatterns.map((pattern, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-500/10 text-blue-400 text-sm rounded-full border border-blue-500/20"
                          >
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested Diseases */}
                  {alert.suggestedDiseases.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-300 mb-2">Enfermedades sugeridas:</p>
                      <div className="flex flex-wrap gap-2">
                        {alert.suggestedDiseases.map((disease, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-orange-500/10 text-orange-400 text-sm rounded-full border border-orange-500/20"
                          >
                            {disease}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex space-x-2">
                {!alert.isRead && (
                  <button className="text-green-400 hover:text-green-300 p-2 rounded-lg hover:bg-green-500/10 transition-colors">
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
                <button className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-red-500/10 transition-colors">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAlerts.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No se encontraron alertas</h3>
          <p className="text-gray-400">
            {alerts.length === 0 
              ? 'No hay alertas en el sistema' 
              : 'Intenta ajustar los filtros de búsqueda'
            }
          </p>
        </div>
      )}
    </div>
  );
}