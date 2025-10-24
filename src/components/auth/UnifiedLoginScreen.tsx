import React, { useState } from 'react';
import { Shield, Users, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fullLogo } from '../../assets/images';
import { useToast } from '../../contexts/ToastContext';
import { handleAuthError } from '../../utils/auth-error-handler';
import PrivacyPolicy from '../PrivacyPolicy';
import TermsOfService from '../TermsOfService';

export default function UnifiedLoginScreen() {
  const { showSuccess, showError } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);
  
  const { unifiedLogin } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Éviter les soumissions multiples
    if (isLoading) {
      return;
    }

    // Validation côté client
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await unifiedLogin(email.trim(), password);
      showSuccess('Connexion réussie !');
    } catch (err: any) {
      handleAuthError(err, setError, showError);
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher les pages de politique et conditions
  if (showPrivacyPolicy) {
    return <PrivacyPolicy onBack={() => setShowPrivacyPolicy(false)} />;
  }

  if (showTermsOfService) {
    return <TermsOfService onBack={() => setShowTermsOfService(false)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/6437585/pexels-photo-6437585.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)'
        }}
      ></div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-purple-900/60 to-indigo-900/70"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-300/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-200/20 to-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-100/10 to-purple-100/10 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left text-white">
            <div className="mb-8">
              <img src={fullLogo} alt="Melio" className="h-20 w-auto mx-auto lg:mx-0 mb-6" />
              <h1 className="text-5xl lg:text-6xl font-bold mb-6">
                Bienvenue sur
                <span 
                  className="block"
                  style={{
                    background: 'linear-gradient(135deg, #895cf1, #d8268d)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  Melio
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Plateforme sécurisée pour l'accompagnement des jeunes en milieu scolaire
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto lg:mx-0">
              <div className="relative flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-blue-300/40 to-transparent transform -skew-x-12 -translate-x-full animate-[light-sweep_3s_ease-in-out_infinite]"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/50 to-indigo-600/50 rounded-xl flex items-center justify-center relative z-10">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-1">Sécurisé</h3>
                  <p className="text-sm text-gray-700 font-medium">Chiffrement de bout en bout</p>
                </div>
              </div>
              <div className="relative flex items-center space-x-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/60 overflow-hidden group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-purple-300/50 to-transparent transform -skew-x-12 -translate-x-full animate-[light-sweep_3s_ease-in-out_infinite_1.5s]"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/50 to-purple-600/50 rounded-xl flex items-center justify-center relative z-10">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-base font-bold text-gray-900 mb-1">Collaboratif</h3>
                  <p className="text-sm text-gray-700 font-medium">Travail d'équipe facilité</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-lg">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/30">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Connexion</h2>
                  <p className="text-gray-600">Agent ou Administrateur</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email professionnel
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                      placeholder="votre.email@example.com"
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50"
                        placeholder="Votre mot de passe"
                        disabled={isLoading}
                        autoComplete="current-password"
                        required
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
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading || !email.trim() || !password.trim()}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg"
                  >
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </button>
                </form>

                {/* Identifiants oubliés */}
                <div className="mt-3 text-center">
                  <p className="text-sm text-gray-600">
                    Identifiants oubliés ? Contactez-le{' '}
                    <a href="tel:+33745697503" className="text-blue-600 hover:text-blue-800 font-medium">
                      +33 0745697503
                    </a>
                  </p>
                </div>

                {/* Conditions d'utilisation */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs text-gray-600 text-center leading-relaxed">
                    En me connectant, j'accepte les conditions d'utilisation du service Melio, 
                    notamment en matière de données personnelles et de confidentialité.
                  </p>
                </div>

                {/* reCAPTCHA */}
                <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
                      <span className="text-xs font-bold text-gray-600">✓</span>
                    </div>
                    <span>Protection par reCAPTCHA</span>
                  </div>
                  <span>•</span>
                  <button 
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Confidentialité
                  </button>
                  <span>•</span>
                  <button 
                    onClick={() => setShowTermsOfService(true)}
                    className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                  >
                    Conditions
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


