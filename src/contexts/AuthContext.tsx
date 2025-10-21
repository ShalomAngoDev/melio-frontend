import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api';

interface SchoolInfo {
  id: string;
  code: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  role: 'student' | 'staff' | 'admin';
  schoolCode?: string;
  schoolId?: string;
  email?: string;
  schools?: SchoolInfo[]; // V2: Liste des écoles pour agents multi-écoles
}

interface AuthContextType {
  user: User | null;
  studentLogin: (schoolCode: string, studentIdentifier: string) => Promise<boolean>;
  unifiedLogin: (email: string, password: string) => Promise<boolean>; // V2: Méthode principale pour agents/admins
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const initializeAuth = async () => {
      const savedUser = localStorage.getItem('melio_user');
      const savedToken = localStorage.getItem('accessToken');
      const savedRefreshToken = localStorage.getItem('refreshToken');

      if (savedUser && savedToken) {
        try {
          // Temporairement désactiver la validation du token pour déboguer
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Erreur lors de la validation du token:', error);
          logout();
        }
      }
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

  // ===== UNIFIED LOGIN (V2) - Remplace agentLogin et adminLogin =====
  const unifiedLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await authService.unifiedLogin(email, password);
      
      // Déterminer si c'est un admin ou un agent
      if (response.admin) {
        const newUser: User = {
          id: response.admin.id,
          name: response.admin.email,
          role: 'admin',
          email: response.admin.email
        };

        setUser(newUser);
        localStorage.setItem('melio_user', JSON.stringify(newUser));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        return true;
      } 
      
      if (response.agent) {
        const newUser: User = {
          id: response.agent.id,
          name: response.agent.email,
          role: 'staff',
          email: response.agent.email,
          schoolId: response.agent.currentSchoolId,
          schools: response.agent.schools || [],
          // Utiliser le code de la première école comme schoolCode
          schoolCode: response.agent.schools && response.agent.schools.length > 0 
            ? response.agent.schools[0].code 
            : undefined
        };

        setUser(newUser);
        localStorage.setItem('melio_user', JSON.stringify(newUser));
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        return true;
      }

      throw new Error('No valid user data in response');
    } catch (error: any) {
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
    <AuthContext.Provider value={{ user, studentLogin, unifiedLogin, logout, isLoading }}>
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