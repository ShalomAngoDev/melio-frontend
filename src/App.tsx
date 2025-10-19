import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { ToastProvider } from './contexts/ToastContext';
import LoginScreen from './components/auth/LoginScreen';
import AdminLoginScreen from './components/auth/AdminLoginScreen';
import StaffDashboard from './components/staff/StaffDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import LoadingScreen from './components/common/LoadingScreen';

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AlertProvider>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <AppContent />
          </div>
        </AlertProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(() => {
    // Vérifier si l'URL contient un paramètre admin ou si c'est dans sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const saved = sessionStorage.getItem('showAdminLogin');
    return urlParams.get('admin') === 'true' || saved === 'true';
  });

  useEffect(() => {
    if (user) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300); // Réduire le temps de transition
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
    }
  }, [user]);

  useEffect(() => {
    sessionStorage.setItem('showAdminLogin', showAdminLogin.toString());
  }, [showAdminLogin]);

  // Fonctions pour gérer la navigation
  const handleShowAdminLogin = () => {
    setShowAdminLogin(true);
  };

  const handleBackToLogin = () => {
    setShowAdminLogin(false);
  };

  if (isLoading || isTransitioning) {
    return <LoadingScreen />;
  }

  if (!user) {
    if (showAdminLogin) {
      return <AdminLoginScreen onBackToLogin={handleBackToLogin} />;
    }
    return <LoginScreen onShowAdminLogin={handleShowAdminLogin} />;
  }

  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  // Seuls les agents peuvent accéder à l'interface web
  return <StaffDashboard />;
}

export default App;