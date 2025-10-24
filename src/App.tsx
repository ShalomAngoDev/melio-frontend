import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AlertProvider } from './contexts/AlertContext';
import { ToastProvider } from './contexts/ToastContext';
import UnifiedLoginScreen from './components/auth/UnifiedLoginScreen';
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

  useEffect(() => {
    if (user) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setIsTransitioning(false);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsTransitioning(false);
    }
  }, [user]);

  if (isLoading || isTransitioning) {
    return <LoadingScreen />;
  }

  // Page de connexion unifiée pour agents et admins
  if (!user) {
    return <UnifiedLoginScreen />;
  }

  // Redirection automatique selon le rôle
  if (user.role === 'admin') {
    return <AdminDashboard />;
  }

  // Agents
  return <StaffDashboard />;
}

export default App;