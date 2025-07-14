import React, { useState, useRef } from 'react';
import { MessageSquare, Send, Paperclip, Search, Image, X } from 'lucide-react';
import { Message, User, MessageAttachment } from '../types';

interface MessagingSystemProps {
  messages: Message[];
  users: User[];
  onSendMessage: (message: Message) => void;
}

export default function MessagingSystem({ messages, users, onSendMessage }: MessagingSystemProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      alert('Solo se permiten archivos de imagen');
      return;
    }

    setAttachments(prev => [...prev, ...imageFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && attachments.length === 0) || !selectedUser) return;

    // Procesar attachments
    const messageAttachments: MessageAttachment[] = [];
    
    for (const file of attachments) {
      const url = URL.createObjectURL(file);
      messageAttachments.push({
        id: Date.now().toString() + Math.random(),
        type: 'image',
        url: url,
        name: file.name,
        size: file.size,
      });
    }

    const message: Message = {
      id: Date.now().toString(),
      senderId: 'current-user', // En una app real, esto vendría del usuario autenticado
      receiverId: selectedUser.id,
      content: newMessage,
      timestamp: new Date(),
      isRead: false,
      attachments: messageAttachments,
    };

    onSendMessage(message);
    setNewMessage('');
    setAttachments([]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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
            {filteredUsers.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-400">No hay usuarios disponibles</p>
              </div>
            ) : (
              filteredUsers.map((user) => {
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
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
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
                          {lastMessage ? lastMessage.content || 'Imagen' : 'Sin mensajes'}
                        </p>
                        <p className="text-gray-500 text-xs">
                          {lastMessage ? lastMessage.timestamp.toLocaleTimeString() : ''}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-gray-900 rounded-lg border border-gray-800 flex flex-col">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-800 flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-white font-semibold">{selectedUser.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedUser.cargo}</p>
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
                        {message.content && (
                          <p className="text-sm">{message.content}</p>
                        )}
                        
                        {message.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {message.attachments.map((attachment) => (
                              <div key={attachment.id}>
                                {attachment.type === 'image' && (
                                  <img
                                    src={attachment.url}
                                    alt={attachment.name}
                                    className="max-w-full h-auto rounded-lg"
                                  />
                                )}
                              </div>
                            ))}
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
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={file.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => removeAttachment(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Image className="w-5 h-5" />
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
                    disabled={!newMessage.trim() && attachments.length === 0}
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