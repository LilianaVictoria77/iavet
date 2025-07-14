import React, { useState } from 'react';
import { MessageSquare, Send, Paperclip, Search, Circle, Image, Video, FileText } from 'lucide-react';
import { Message, User } from '../types';

interface MessagingSystemProps {
  messages: Message[];
  users: User[];
}

export default function MessagingSystem({ messages, users }: MessagingSystemProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getConversationMessages = (userId: string) => {
    return messages.filter(msg =>
      (msg.senderId === userId || msg.receiverId === userId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  };

  const getLastMessage = (userId: string) => {
    const userMessages = getConversationMessages(userId);
    return userMessages[userMessages.length - 1];
  };

  const getUnreadCount = (userId: string) => {
    return messages.filter(msg =>
      msg.senderId === userId && !msg.isRead
    ).length;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    // Aquí se enviaría el mensaje
    console.log('Sending message:', newMessage, 'to:', selectedUser.name);
    setNewMessage('');
  };

  const getAttachmentIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return FileText;
      default: return Paperclip;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <MessageSquare className="w-8 h-8 text-red-500" />
        <h2 className="text-3xl font-bold text-white">Sistema de Mensajería</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Users List */}
        <div className="bg-gray-900 rounded-lg border border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredUsers.map((user) => {
              const lastMessage = getLastMessage(user.id);
              const unreadCount = getUnreadCount(user.id);
              
              return (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 text-left hover:bg-gray-800 transition-colors border-b border-gray-800 ${
                    selectedUser?.id === user.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <img
                        src={user.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-gray-900 ${
                        user.isOnline ? 'bg-green-400' : 'bg-gray-500'
                      }`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-white font-medium truncate">{user.name}</p>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm truncate">
                        {lastMessage ? lastMessage.content : 'Sin mensajes'}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {lastMessage ? lastMessage.timestamp.toLocaleTimeString() : ''}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-800 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center space-x-3">
                <img
                  src={selectedUser.avatar || `https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop`}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-white font-semibold">{selectedUser.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Circle className={`w-2 h-2 ${selectedUser.isOnline ? 'text-green-400 fill-current' : 'text-gray-500'}`} />
                    <span className="text-gray-400 text-sm">
                      {selectedUser.isOnline ? 'En línea' : `Visto ${selectedUser.lastSeen.toLocaleTimeString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {getConversationMessages(selectedUser.id).map((message) => {
                  const isOwn = message.senderId !== selectedUser.id;
                  
                  return (
                    <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-800 text-white'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        
                        {message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => {
                              const Icon = getAttachmentIcon(attachment.type);
                              return (
                                <div key={attachment.id} className="flex items-center space-x-2 p-2 bg-black bg-opacity-20 rounded">
                                  <Icon className="w-4 h-4" />
                                  <span className="text-xs truncate">{attachment.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        <p className="text-xs opacity-75 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-800">
                <div className="flex space-x-2">
                  <button className="text-gray-400 hover:text-white">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un mensaje..."
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Selecciona una conversación</h3>
                <p className="text-gray-400">
                  Elige un usuario de la lista para comenzar a chatear
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}