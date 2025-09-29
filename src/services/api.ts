import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Configuration de base d'axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs de réponse et le renouvellement automatique des tokens
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Éviter la boucle infinie : ne pas essayer de refresh pour les requêtes de refresh
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/refresh')) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // Essayer de renouveler le token
          const response = await authService.refreshToken(refreshToken);
          if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
            if (response.refreshToken) {
              localStorage.setItem('refreshToken', response.refreshToken);
            }
            
            // Refaire la requête originale avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        console.error('Erreur lors du renouvellement du token:', refreshError);
      }

      // Si le refresh échoue, déconnecter l'utilisateur
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('melio_user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Types pour les données
export interface School {
  id: string;
  code: string;
  name: string;
  address1: string;
  address2?: string;
  postalCode: string;
  city: string;
  country: string;
  timezone: string;
  level?: string;
  uaiCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  settings?: any;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  sex: string;
  className: string;
  parentName?: string;
  parentPhone: string;
  parentEmail?: string;
  uniqueId: string;
  createdAt: string;
}

export interface CreateSchoolData {
  name: string;
  address1: string;
  address2?: string;
  postalCode: string;
  city: string;
  country?: string;
  timezone?: string;
  level?: string;
  uaiCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  settings?: any;
}

export interface CreateStudentData {
  schoolCode: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  sex: string;
  className: string;
  parentName?: string;
  parentPhone: string;
  parentEmail?: string;
}

export interface SchoolInfo {
  id: string;
  code: string;
  name: string;
  address1: string;
  address2?: string;
  postalCode: string;
  city: string;
  country: string;
  timezone: string;
  level?: string;
  uaiCode?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  status: string;
  createdAt: string;
}

// Services API
export const authService = {
  // Connexion agent
  agentLogin: async (schoolCode: string, email: string, password: string) => {
    const response = await api.post('/auth/agent/login', {
      schoolCode,
      email,
      password,
    });
    return response.data;
  },

  // Connexion admin
  adminLogin: async (email: string, password: string) => {
    const response = await api.post('/auth/admin/login', {
      email,
      password,
    });
    return response.data;
  },

  // Connexion élève
  studentLogin: async (schoolCode: string, studentIdentifier: string) => {
    const response = await api.post('/auth/student/login', {
      schoolCode,
      studentIdentifier,
    });
    return response.data;
  },

  // Rafraîchir le token
  refreshToken: async (refreshToken: string) => {
    const response = await api.post('/auth/refresh', {
      refreshToken,
    });
    return response.data;
  },
};

export const schoolService = {
  // Créer une école (admin seulement)
  createSchool: async (data: CreateSchoolData): Promise<School> => {
    const response = await api.post('/admin/schools', data);
    return response.data;
  },

  // Lister les écoles (admin seulement)
  listSchools: async (filters?: {
    search?: string;
    city?: string;
    status?: string;
    level?: string;
  }): Promise<School[]> => {
    const response = await api.get('/admin/schools', { params: filters });
    return response.data;
  },

  // Récupérer une école par ID (admin seulement)
  getSchoolById: async (id: string): Promise<School> => {
    const response = await api.get(`/admin/schools/${id}`);
    return response.data;
  },

  // Récupérer les informations de l'école de l'agent connecté
  getMySchoolInfo: async (): Promise<SchoolInfo> => {
    const response = await api.get('/schools/me');
    return response.data;
  },
};

export const studentService = {
  // Créer un élève (agent seulement)
  createStudent: async (data: CreateStudentData): Promise<Student> => {
    const response = await api.post('/students', data);
    return response.data;
  },

  // Lister les élèves (agent seulement)
  listStudents: async (filters?: {
    className?: string;
    search?: string;
  }): Promise<Student[]> => {
    const response = await api.get('/students', { params: filters });
    return response.data;
  },

  // Récupérer un élève par ID (agent seulement)
  getStudentById: async (id: string): Promise<Student> => {
    const response = await api.get(`/students/${id}`);
    return response.data;
  },
};

// ===== ALERTES SERVICE =====

export interface Alert {
  id: string;
  schoolId: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    className: string;
  };
  sourceId: string;
  sourceType: string;
  createdAt: string;
  riskLevel: 'FAIBLE' | 'MOYEN' | 'ELEVE' | 'CRITIQUE';
  riskScore: number;
  childMood: string;
  aiSummary: string;
  aiAdvice: string;
  status: 'NOUVELLE' | 'EN_COURS' | 'TRAITEE';
}

export interface AlertStats {
  total: number;
  nouvelles: number;
  enCours: number;
  traitees: number;
  parNiveau: {
    MOYEN: number;
    ELEVE: number;
    CRITIQUE: number;
  };
}

export interface AlertComment {
  id: string;
  alertId: string;
  agentId: string;
  agentName: string;
  oldStatus?: string;
  newStatus: string;
  comment: string;
  createdAt: string;
}

export const alertService = {
  // Récupérer les alertes de l'établissement
  getAlerts: async (status?: string, limit?: number, offset?: number): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await api.get(`/alerts?${params.toString()}`);
    return response.data;
  },

  // Récupérer une alerte spécifique
  getAlert: async (alertId: string): Promise<Alert> => {
    const response = await api.get(`/alerts/${alertId}`);
    return response.data;
  },

  // Mettre à jour le statut d'une alerte
  updateAlertStatus: async (alertId: string, status: 'NOUVELLE' | 'EN_COURS' | 'TRAITEE'): Promise<Alert> => {
    const response = await api.patch(`/alerts/${alertId}/status`, { status });
    return response.data;
  },

  // Récupérer les statistiques des alertes
  getAlertStats: async (): Promise<AlertStats> => {
    const response = await api.get('/alerts/stats');
    return response.data;
  },

  // Mettre à jour le statut d'une alerte avec un commentaire obligatoire
  updateAlertStatusWithComment: async (
    alertId: string, 
    newStatus: 'NOUVELLE' | 'EN_COURS' | 'TRAITEE', 
    comment: string
  ): Promise<Alert> => {
    const response = await api.patch(`/alerts/${alertId}/status-with-comment`, {
      newStatus,
      comment,
    });
    return response.data;
  },

  // Récupérer les commentaires d'une alerte
  getAlertComments: async (alertId: string): Promise<AlertComment[]> => {
    const response = await api.get(`/alerts/${alertId}/comments`);
    return response.data;
  },
};

// ===== TYPES POUR LES SIGNALEMENTS =====

export interface Report {
  id: string;
  schoolId: string;
  studentId?: string;
  content: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anonymous: boolean;
  status: 'NOUVEAU' | 'EN_COURS' | 'TRAITE';
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportData {
  schoolId: string;
  studentId?: string;
  content: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anonymous: boolean;
}

export interface ReportStats {
  total: number;
  nouveau: number;
  enCours: number;
  traite: number;
}

export const reportService = {
  // Créer un signalement
  createReport: async (data: CreateReportData): Promise<Report> => {
    const response = await api.post('/reports', data);
    return response.data;
  },

  // Récupérer les signalements
  getReports: async (schoolId: string, status?: string): Promise<Report[]> => {
    const params = new URLSearchParams();
    params.append('schoolId', schoolId);
    if (status) params.append('status', status);
    
    const response = await api.get(`/reports?${params.toString()}`);
    return response.data;
  },

  // Récupérer un signalement spécifique
  getReport: async (reportId: string, schoolId: string): Promise<Report> => {
    const response = await api.get(`/reports/${reportId}?schoolId=${schoolId}`);
    return response.data;
  },

  // Mettre à jour un signalement
  updateReport: async (reportId: string, schoolId: string, status: 'NOUVEAU' | 'EN_COURS' | 'TRAITE'): Promise<Report> => {
    const response = await api.patch(`/reports/${reportId}?schoolId=${schoolId}`, { status });
    return response.data;
  },

  // Supprimer un signalement
  deleteReport: async (reportId: string, schoolId: string): Promise<void> => {
    await api.delete(`/reports/${reportId}?schoolId=${schoolId}`);
  },

  // Récupérer les statistiques des signalements
  getReportStats: async (schoolId: string): Promise<ReportStats> => {
    const response = await api.get(`/reports/stats?schoolId=${schoolId}`);
    return response.data;
  },
};

// Services de statistiques
export const statisticsService = {
  // Obtenir les statistiques générales
  getGeneralStats: async (schoolId: string, period?: 'week' | 'month' | 'year'): Promise<{
    totalAlerts: number;
    totalReports: number;
    totalStudents: number;
    alertsByStatus: { [key: string]: number };
    reportsByStatus: { [key: string]: number };
    alertsByRiskLevel: { [key: string]: number };
    reportsByUrgency: { [key: string]: number };
  }> => {
    const params = new URLSearchParams();
    params.append('schoolId', schoolId);
    if (period) {
      params.append('period', period);
    }
    const response = await api.get(`/statistics/general?${params.toString()}`);
    return response.data;
  },

  // Obtenir les statistiques temporelles (graphiques)
  getTemporalStats: async (schoolId: string, period: 'week' | 'month' | 'year'): Promise<{
    alerts: Array<{
      label: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
    reports: Array<{
      label: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
  }> => {
    const response = await api.get(`/statistics/temporal?schoolId=${schoolId}&period=${period}`);
    return response.data;
  },

  // Obtenir les statistiques par classe
  getClassStats: async (schoolId: string): Promise<Array<{
    className: string;
    studentCount: number;
    alertCount: number;
    reportCount: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }>> => {
    const response = await api.get(`/statistics/classes?schoolId=${schoolId}`);
    return response.data;
  },

  // Obtenir les tendances
  getTrends: async (schoolId: string): Promise<{
    alertsTrend: 'up' | 'down' | 'stable';
    reportsTrend: 'up' | 'down' | 'stable';
    alertsPercentage: number;
    reportsPercentage: number;
  }> => {
    const response = await api.get(`/statistics/trends?schoolId=${schoolId}`);
    return response.data;
  },
};

// Services pour l'admin Melio
export const adminService = {
  // Obtenir toutes les écoles
  getSchools: async (): Promise<Array<{
    id: string;
    code: string;
    name: string;
    address1: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    level: string;
    uaiCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await api.get('/admin/schools');
    return response.data;
  },

  // Obtenir toutes les écoles (alias pour la gestion)
  getAllSchools: async (): Promise<Array<{
    id: string;
    code: string;
    name: string;
    address1: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    level: string;
    uaiCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await api.get('/admin/schools');
    return response.data;
  },

  // Obtenir une école par ID
  getSchoolById: async (id: string): Promise<{
    id: string;
    code: string;
    name: string;
    address1: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    level: string;
    uaiCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }> => {
    const response = await api.get(`/admin/schools/${id}`);
    return response.data;
  },

  // Créer une nouvelle école
  createSchool: async (schoolData: {
    name: string;
    address1: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    level: string;
    uaiCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  }): Promise<{
    id: string;
    code: string;
    name: string;
    address1: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    level: string;
    uaiCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  }> => {
    const response = await api.post('/admin/schools', schoolData);
    return response.data;
  },

  // Obtenir les statistiques globales
  getGlobalStats: async (period?: 'week' | 'month' | 'year'): Promise<{
    totalSchools: number;
    totalStudents: number;
    totalAgents: number;
    totalAlerts: number;
    totalReports: number;
    activeSchools: number;
    criticalAlerts: number;
    resolvedAlerts: number;
    newReports: number;
    resolvedReports: number;
    alertsByRiskLevel: { [key: string]: number };
    reportsByUrgency: { [key: string]: number };
  }> => {
    const params = new URLSearchParams();
    if (period) {
      params.append('period', period);
    }
    const response = await api.get(`/admin/statistics/global?${params.toString()}`);
    return response.data;
  },

  // Obtenir les statistiques temporelles globales
  getGlobalTemporalStats: async (period: 'week' | 'month' | 'year' = 'month'): Promise<{
    alerts: Array<{
      label: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
    reports: Array<{
      label: string;
      critical: number;
      high: number;
      medium: number;
      low: number;
    }>;
  }> => {
    const response = await api.get(`/admin/statistics/temporal?period=${period}`);
    return response.data;
  },

  // Obtenir les alertes globales
  getGlobalAlerts: async (status?: string, limit?: number, offset?: number): Promise<Array<{
    id: string;
    schoolId: string;
    studentId: string;
    sourceId: string;
    sourceType: string;
    riskLevel: string;
    riskScore: number;
    childMood: string;
    aiSummary: string;
    aiAdvice: string;
    status: string;
    createdAt: string;
    student: {
      id: string;
      firstName: string;
      lastName: string;
      className: string;
    };
    school: {
      id: string;
      name: string;
      code: string;
    };
  }>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await api.get(`/admin/alerts?${params.toString()}`);
    return response.data;
  },

  // Obtenir les signalements globaux
  getGlobalReports: async (status?: string, limit?: number, offset?: number): Promise<Array<{
    id: string;
    schoolId: string;
    studentId?: string;
    content: string;
    urgency: string;
    anonymous: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    student?: {
      id: string;
      firstName: string;
      lastName: string;
      className: string;
    };
    school: {
      id: string;
      name: string;
      code: string;
    };
  }>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    const response = await api.get(`/admin/reports?${params.toString()}`);
    return response.data;
  },

  // Obtenir les statistiques par école
  getSchoolStats: async (schoolId: string): Promise<{
    schoolId: string;
    schoolName: string;
    schoolCode: string;
    totalStudents: number;
    totalAlerts: number;
    totalReports: number;
    alertsByStatus: { [key: string]: number };
    reportsByStatus: { [key: string]: number };
    alertsByRiskLevel: { [key: string]: number };
    reportsByUrgency: { [key: string]: number };
  }> => {
    const response = await api.get(`/admin/statistics/school/${schoolId}`);
    return response.data;
  },

  // Modifier une école
  updateSchool: async (schoolId: string, schoolData: {
    name: string;
    address1: string;
    address2?: string;
    postalCode: string;
    city: string;
    country: string;
    level: string;
    uaiCode: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
    status: string;
    settings?: any;
  }): Promise<School> => {
    const response = await api.put(`/admin/schools/${schoolId}`, schoolData);
    return response.data;
  },

  // Supprimer une école
  deleteSchool: async (schoolId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/schools/${schoolId}`);
    return response.data;
  },

  // Ajouter un agent à une école
  addAgentToSchool: async (schoolId: string, agentData: {
    email: string;
    password: string;
  }): Promise<{
    id: string;
    email: string;
    schoolId: string;
    role: string;
    createdAt: string;
  }> => {
    const response = await api.post(`/admin/schools/${schoolId}/agents`, agentData);
    return response.data;
  },

  // Récupérer les agents d'une école
  getSchoolAgents: async (schoolId: string): Promise<Array<{
    id: string;
    email: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }>> => {
    const response = await api.get(`/admin/schools/${schoolId}/agents`);
    return response.data;
  },

  // Supprimer un agent d'une école
  removeAgentFromSchool: async (schoolId: string, agentId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/admin/schools/${schoolId}/agents/${agentId}`);
    return response.data;
  },
};

export default api;
