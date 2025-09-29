import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface User {
  id: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  schoolCode?: string;
  schoolId?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  studentLogin: (schoolCode: string, studentIdentifier: string) => Promise<boolean>;
  agentLogin: (schoolCode: string, email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Debug: Log when user changes
  useEffect(() => {
    console.log('👤 User state changed:', user);
    if (user === null) {
      console.log('🔄 User set to null - this might cause page reload');
    }
  }, [user]);

  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔄 Initializing auth...');
      const savedUser = localStorage.getItem('melio_user');
      const savedToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');

      console.log('📦 Saved data:', { 
        hasUser: !!savedUser, 
        hasToken: !!savedToken, 
        hasRefreshToken: !!savedRefreshToken 
      });

      if (savedUser && savedToken) {
        try {
          // Temporairement désactiver la validation du token pour déboguer
          console.log('🔄 Loading saved user without token validation');
          setUser(JSON.parse(savedUser));
          
          // TODO: Réactiver la validation du token plus tard
          // const isValid = await validateToken(savedToken);
          // if (isValid) {
          //   setUser(JSON.parse(savedUser));
          // } else if (savedRefreshToken) {
          //   const refreshed = await refreshAuthToken();
          //   if (refreshed) {
          //     setUser(JSON.parse(savedUser));
          //   } else {
          //     logout();
          //   }
          // } else {
          //   logout();
          // }
        } catch (error) {
          console.error('Erreur lors de la validation du token:', error);
          logout();
        }
      } else {
        console.log('❌ No saved user or token');
      }
      console.log('✅ Auth initialization complete');
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const studentLogin = async (schoolCode: string, studentIdentifier: string): Promise<boolean> => {
    try {
      const response = await authService.studentLogin(schoolCode, studentIdentifier);
      
      if (!response.student) {
        throw new Error('No student data in response');
      }

      const newUser: User = {
        id: response.student.id,
        name: `${response.student.firstName} ${response.student.lastName}`,
        role: 'student',
        schoolCode: schoolCode,
        schoolId: response.student.schoolId
      };

      setUser(newUser);
      localStorage.setItem('melio_user', JSON.stringify(newUser));
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return true;
    } catch (error) {
      console.error('Student login error:', error);
      return false;
    }
  };

  const agentLogin = async (schoolCode: string, email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.agentLogin(schoolCode, email, password);
      
      if (!response.agent) {
        throw new Error('No agent data in response');
      }

      const newUser: User = {
        id: response.agent.id,
        name: email, // Agent n'a pas de firstName/lastName dans la réponse
        role: 'staff',
        schoolCode: schoolCode,
        schoolId: response.agent.schoolId,
        email: response.agent.email
      };

      setUser(newUser);
      localStorage.setItem('melio_user', JSON.stringify(newUser));
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      return true;
    } catch (error: any) {
      console.error('Agent login error:', error);
      // Propager l'erreur pour que le composant puisse l'afficher
      throw error;
    }
  };

  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 Admin login attempt:', email);
    try {
      const response = await authService.adminLogin(email, password);
      console.log('✅ Admin login response:', response);
      
      if (!response.admin) {
        throw new Error('No admin data in response');
      }

      const newUser: User = {
        id: response.admin.id,
        name: response.admin.email, // Admin n'a pas de firstName/lastName
        role: 'admin',
        email: response.admin.email
      };

      console.log('👤 Setting admin user:', newUser);
      setUser(newUser);
      localStorage.setItem('melio_user', JSON.stringify(newUser));
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      console.log('✅ Admin login successful');
      return true;
    } catch (error: any) {
      console.error('❌ Admin login error:', error);
      console.log('🔄 Admin login failed - user should remain null');
      
      // Sauvegarder l'erreur dans localStorage aussi
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] 🔄 Admin login failed - user should remain null`;
      const existingLogs = localStorage.getItem('debug_logs') || '';
      localStorage.setItem('debug_logs', existingLogs + '\n' + logEntry);
      
      // Propager l'erreur pour que le composant puisse l'afficher
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('melio_user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  // Fonction pour valider un token
  const validateToken = async (token: string): Promise<boolean> => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://web-production-39a0b.up.railway.app/api/v1'}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  };

  // Fonction pour renouveler le token
  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const response = await authService.refreshToken(refreshToken);
      if (response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors du renouvellement du token:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, studentLogin, agentLogin, adminLogin, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}