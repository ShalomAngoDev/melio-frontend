import React, { useState } from 'react';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logoIcon, fullLogo } from '../../assets/images';

interface AdminLoginScreenProps {
  onBackToLogin?: () => void;
}

export default function AdminLoginScreen({ onBackToLogin }: AdminLoginScreenProps) {
  const { adminLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  // Fonction pour sauvegarder les logs
  const saveLog = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}${data ? ' - ' + JSON.stringify(data) : ''}`;
    console.log(logEntry);
    
    // Sauvegarder dans localStorage
    const existingLogs = localStorage.getItem('debug_logs') || '';
    const newLogs = existingLogs + '\n' + logEntry;
    localStorage.setItem('debug_logs', newLogs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    saveLog('📝 Admin form submitted');
    
    if (!email.trim() || !password.trim()) {
      setError('Veuillez saisir votre email et mot de passe');
      return;
    }

    saveLog('🔄 Starting admin login process');
    setIsLoading(true);
    setError('');

    try {
      await adminLogin(email.trim(), password);
      saveLog('✅ Admin login successful in component');
      // Si on arrive ici, la connexion a réussi
    } catch (err: any) {
      saveLog('❌ Erreur de connexion admin', err);
      
      // Gérer différents types d'erreurs
      let errorMessage = 'Erreur de connexion. Veuillez réessayer.';
      
      if (err.response?.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      } else if (err.response?.status === 400) {
        // Erreur 400 peut être une erreur de validation ou d'authentification
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = 'Email ou mot de passe incorrect';
        }
      } else if (err.response?.status === 500) {
        errorMessage = 'Erreur du serveur. Veuillez réessayer plus tard.';
      } else if (err.message?.includes('Network Error')) {
        errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      // Afficher l'erreur et empêcher le rechargement
      setError(errorMessage);
      saveLog('❌ Error set', errorMessage);
      
      // Logs ralentis pour débogage
      saveLog('🛑 STOPPING HERE - Error displayed, should not reload');
      saveLog('🛑 Current state should be: showAdminLogin=true, user=null');
      saveLog('🛑 ERROR MESSAGE', errorMessage);
      saveLog('🛑 ERROR OBJECT', err);
      saveLog('🛑 ERROR RESPONSE', err.response);
      saveLog('🛑 ERROR RESPONSE DATA', err.response?.data);
      saveLog('🛑 ERROR RESPONSE STATUS', err.response?.status);
      
      // Empêcher le rechargement en ajoutant un délai
      saveLog('🛑 Adding delay to prevent page reload...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      saveLog('🛑 Delay completed - page should still be here');
      
      // Attendre un peu avant de permettre une nouvelle tentative
      setTimeout(() => {
        saveLog('⏰ Error display timeout completed - page should still be here');
      }, 2000);
    } finally {
      saveLog('🏁 Admin login process finished');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <img src={logoIcon} alt="Melio" className="w-12 h-12 mr-3" />
            <img src={fullLogo} alt="Melio" className="h-8 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Administration Melio</h1>
          <p className="text-gray-600">Accès sécurisé au tableau de bord global</p>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-white/20">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-purple-100 p-3 rounded-2xl">
              <Shield className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Administrateur
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                placeholder="admin@melio.app"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                  placeholder="Votre mot de passe"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email.trim() || !password.trim()}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
            >
              {isLoading ? 'Connexion...' : 'Accéder au tableau de bord'}
            </button>
          </form>

          {/* Informations de test */}
          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Comptes de test :</h3>
            <div className="text-xs text-blue-700 space-y-1">
              <div><strong>admin@melio.app</strong> / admin123</div>
              <div><strong>superadmin@melio.app</strong> / superadmin123</div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Accès réservé aux administrateurs autorisés
            </p>
            {onBackToLogin && (
              <button
                onClick={onBackToLogin}
                className="mt-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                ← Retour à la connexion école
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
