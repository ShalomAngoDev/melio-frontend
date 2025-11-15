import React from 'react';
import { logoIcon, fullLogo } from '../../assets/images';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-md animate-pulse bg-gray-50 border border-gray-200">
          <img src={logoIcon} alt="Melio" className="w-12 h-12" />
        </div>
        <div className="mb-4 flex justify-center">
          <img src={fullLogo} alt="Melio" className="h-10 w-auto" />
        </div>
        <div className="flex items-center justify-center space-x-1">
          <div className="w-2 h-2 bg-melio-pink rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-melio-purple rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-melio-purple-light rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <p className="text-gray-600 mt-4">Chargement de ton espace sécurisé...</p>
      </div>
    </div>
  );
}