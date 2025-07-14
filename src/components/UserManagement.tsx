import React, { useState } from 'react';
import { Users, UserPlus, Search, Filter, MoreVertical, Circle } from 'lucide-react';
import { User } from '../types';

interface UserManagementProps {
  users: User[];
}

export default function UserManagement({ users }: UserManagementProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUser, setShowAddUser] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'veterinario': return 'text-blue-400 bg-blue-500/10';
      case 'ganadero': return 'text-green-400 bg-green-500/10';
      case 'investigador': return 'text-purple-400 bg-purple-500/10';
      case 'admin': return 'text-red-400 bg-red-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'veterinario': return 'Veterinario';
      case 'ganadero': return 'Ganadero';
      case 'investigador': return 'Investigador';
      case 'admin': return 'Administrador';
      default: return role;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-red-500" />
          <h2 className="text-3xl font-bold text-white">Gestión de Usuarios</h2>
        </div>
        <button
          onClick={() => setShowAddUser(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <UserPlus className="w-5 h-5" />
          <span>Agregar Usuario</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-lg p-6 border border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-8 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 appearance-none"
            >
              <option value="all">Todos los roles</option>
              <option value="veterinario">Veterinarios</option>
              <option value="ganadero">Ganaderos</option>
              <option value="investigador">Investigadores</option>
              <option value="admin">Administradores</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <div key={user.id} className="bg-gray-900 rounded-lg p-6 border border-gray-800 hover-scale">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <img
                    src={user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${
                    user.isOnline ? 'bg-green-400' : 'bg-gray-500'
                  }`}></div>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{user.name}</h3>
                  <p className="text-gray-400 text-sm">{user.email}</p>
                </div>
              </div>
              <button className="text-gray-400 hover:text-white">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Rol</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                  {getRoleLabel(user.role)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Estado</span>
                <div className="flex items-center space-x-2">
                  <Circle className={`w-3 h-3 ${user.isOnline ? 'text-green-400 fill-current' : 'text-gray-500'}`} />
                  <span className="text-sm text-white">
                    {user.isOnline ? 'En línea' : 'Desconectado'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Última conexión</span>
                <span className="text-sm text-white">
                  {user.isOnline ? 'Ahora' : user.lastSeen.toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-800">
              <div className="flex space-x-2">
                <button className="flex-1 bg-gray-800 hover:bg-gray-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                  Ver Perfil
                </button>
                <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-3 rounded-lg text-sm font-medium transition-colors">
                  Mensaje
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-gray-900 rounded-lg p-8 border border-gray-800 text-center">
          <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No se encontraron usuarios</h3>
          <p className="text-gray-400">
            Intenta ajustar los filtros de búsqueda
          </p>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
            <h3 className="text-xl font-semibold text-white mb-4">Agregar Nuevo Usuario</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nombre completo"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
              <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500">
                <option value="">Seleccionar rol</option>
                <option value="veterinario">Veterinario</option>
                <option value="ganadero">Ganadero</option>
                <option value="investigador">Investigador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowAddUser(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
              <button className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Agregar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}