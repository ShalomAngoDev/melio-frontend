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
    // Persister l'état showAdminLogin dans sessionStorage
    const saved = sessionStorage.getItem('showAdminLogin');
    return saved === 'true';
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

  // Sauvegarder l'état dans sessionStorage
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