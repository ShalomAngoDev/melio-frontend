import React, { useState } from 'react';
import { School, Users, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { logoIcon, fullLogo } from '../../assets/images';
import { useToast } from '../../contexts/ToastContext';

interface LoginScreenProps {
  onShowAdminLogin?: () => void;
}

export default function LoginScreen({ onShowAdminLogin }: LoginScreenProps) {
  const { showSuccess, showError } = useToast();
  const [schoolCode, setSchoolCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  
  const { agentLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Éviter les soumissions multiples
    if (isLoading) {
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await agentLogin(schoolCode.toUpperCase(), email, password);
      // Si on arrive ici, la connexion a réussi
      showSuccess('Connexion réussie !');
    } catch (err: any) {
      console.error('Erreur de connexion agent:', err);
      
      // Gérer différents types d'erreurs
      let errorMsg = 'Erreur de connexion. Veuillez réessayer.';
      
      if (err.response?.status === 401) {
        errorMsg = 'Code école, email ou mot de passe incorrect';
      } else if (err.response?.status === 500) {
        errorMsg = 'Erreur du serveur. Veuillez réessayer plus tard.';
      } else if (err.message?.includes('Network Error')) {
        errorMsg = 'Erreur de connexion. Vérifiez votre connexion internet.';
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }
      
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { 
      school: 'JMO75-01', 
      email: 'agent@college-victor-hugo.fr', 
      password: 'agent123', 
      name: 'Agent Collège Victor Hugo', 
      description: 'Gestion des élèves et alertes' 
    }
  ];

  const quickLogin = (school: string, email: string, password: string) => {
    setSchoolCode(school);
    setEmail(email);
    setPassword(password);
    agentLogin(school, email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-3 flex justify-center">
            <img src={fullLogo} alt="Melio" className="h-10 w-auto" />
          </div>
          <p className="text-gray-600 text-lg">Interface de gestion pour les écoles</p>
          <div className="flex items-center justify-center mt-4 space-x-4 text-sm text-gray-500">
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>Sécurisé</span>
            </div>
            <div className="flex items-center">
              <img src={logoIcon} alt="Melio" className="w-4 h-4 mr-1" />
              <span>Confidentiel</span>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection - Web app is only for staff */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center p-4 rounded-2xl border-2 border-blue-500 bg-blue-50 text-blue-700">
                <Users className="w-6 h-6 mr-2" />
                <div className="text-sm font-medium">Agent social</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Interface web réservée aux agents sociaux</p>
            </div>

            {/* School Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code école
              </label>
              <input
                type="text"
                value={schoolCode}
                onChange={(e) => setSchoolCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: COLLEGE2024"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: agent@ecole.fr"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                placeholder="Votre mot de passe"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-2xl font-medium hover:from-pink-600 hover:to-purple-700 focus:ring-4 focus:ring-pink-200 disabled:opacity-50 transition-all duration-200 shadow-lg"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Demo Access */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="flex items-center justify-center w-full text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              {showDemo ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {showDemo ? 'Masquer' : 'Voir'} les comptes de démonstration
            </button>
            
            {showDemo && (
              <div className="mt-4 space-y-3">
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    onClick={() => quickLogin(cred.school, cred.email, cred.password)}
                    className="w-full p-3 text-left rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-all duration-200"
                  >
                    <div className="font-medium text-gray-800">{cred.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{cred.description}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {cred.school} • {cred.email}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Admin Access */}
        {onShowAdminLogin && (
          <div className="mt-6 text-center">
            <button
              onClick={onShowAdminLogin}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium transition-colors duration-200"
            >
              Accès administrateur Melio →
            </button>
          </div>
        )}

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Interface sécurisée pour la gestion des signalements.<br />
            Accès réservé aux agents sociaux et administrateurs d'école.
          </p>
        </div>
      </div>
    </div>
  );
}