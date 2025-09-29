import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-lg animate-pulse bg-white/70">
          <img src="/logo-icon.png" alt="Melio" className="w-12 h-12" />
        </div>
        <div className="mb-4 flex justify-center">
          <img src="/fullLogo.png" alt="Melio" className="h-10 w-auto" />
        </div>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-gray-600 mt-4">Chargement de ton espace sécurisé...</p>
      </div>
    </div>
  );
}