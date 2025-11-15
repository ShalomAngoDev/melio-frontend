import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, BarChart3, FileText, Users, LogOut, Building2, Megaphone, Filter } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { alertService, reportService } from '../../services/api';
import { logoIcon, fullLogo } from '../../assets/images';
import AlertsSection from './AlertsSection';
import StatisticsSection from './StatisticsSection';
import ReportsSection from './ReportsSection';
import SchoolReportsSection from './SchoolReportsSection';
import StudentsSection from './StudentsSection';
import SchoolInfoSection from './SchoolInfoSection';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('alerts');
  const [selectedSchoolId, setSelectedSchoolId] = useState(user?.schoolId || '');
  const [newAlertsCount, setNewAlertsCount] = useState(0);
  const [hasViewedAlerts, setHasViewedAlerts] = useState(false);
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [hasViewedReports, setHasViewedReports] = useState(false);

  // Mettre à jour l'école sélectionnée si l'utilisateur change
  useEffect(() => {
    if (user?.schoolId) {
      setSelectedSchoolId(user.schoolId);
    }
  }, [user?.schoolId]);

  // Réinitialiser les compteurs et l'état quand on change d'école
  useEffect(() => {
    setNewAlertsCount(0);
    setNewReportsCount(0);
    setHasViewedAlerts(false);
    setHasViewedReports(false);
  }, [selectedSchoolId]);

  // Charger le nombre d'alertes nouvelles pour l'école sélectionnée
  useEffect(() => {
    const loadNewAlertsCount = async () => {
      try {
        // Vérifier l'authentification avant de faire l'appel API
        const token = localStorage.getItem('accessToken');
        if (!token || !selectedSchoolId) {
          console.log('Utilisateur non authentifié ou aucune école sélectionnée');
          return;
        }
        
        // Récupérer TOUTES les alertes (sans filtre de statut) pour pouvoir filtrer côté client
        const allAlerts = await alertService.getAlerts(undefined, undefined, undefined, selectedSchoolId);
        
        // Filtrer pour ne garder SEULEMENT les nouvelles alertes
        // Le backend stocke 'pending' dans statusRaw et le mappe en 'NOUVELLE' dans status
        // On utilise statusRaw pour être sûr d'avoir le statut réel en base de données
        const newAlertsOnly = allAlerts.filter(alert => {
          // Utiliser statusRaw en priorité (statut réel en BDD) ou status comme fallback
          const rawStatus = (alert.statusRaw || alert.status || '').toLowerCase();
          const mappedStatus = (alert.status || '').toUpperCase();
          
          // Nouvelles alertes = 'pending' en BDD (qui est mappé en 'NOUVELLE' par le backend)
          return rawStatus === 'pending' || mappedStatus === 'NOUVELLE';
        });
        const currentCount = newAlertsOnly.length;
        
        // Debug: logger le nombre total vs nouvelles
        console.log(`[StaffDashboard] Total alertes: ${allAlerts.length}, Nouvelles (pending): ${currentCount}`);
        
        // Si l'agent a consulté les alertes et qu'il n'y en a plus de nouvelles, cacher le badge
        if (hasViewedAlerts && currentCount === 0) {
          setNewAlertsCount(0);
        } else {
          // Sinon, afficher uniquement le nombre de nouvelles alertes
          setNewAlertsCount(currentCount);
          
          // Si de nouvelles alertes arrivent après consultation, réinitialiser l'état "vu"
          if (hasViewedAlerts && currentCount > 0) {
            setHasViewedAlerts(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre d\'alertes:', error);
        // En cas d'erreur 401, ne pas afficher d'erreur car c'est normal si non connecté
        if (error.response?.status !== 401) {
          setNewAlertsCount(0);
        }
      }
    };

    if (selectedSchoolId) {
      loadNewAlertsCount();
      
      // Actualiser toutes les 30 secondes
      const interval = setInterval(loadNewAlertsCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedSchoolId, hasViewedAlerts]);

  // Charger le nombre de signalements nouveaux pour l'école sélectionnée
  useEffect(() => {
    const loadNewReportsCount = async () => {
      try {
        // Vérifier l'authentification avant de faire l'appel API
        const token = localStorage.getItem('accessToken');
        if (!token || !selectedSchoolId) {
          console.log('Utilisateur non authentifié ou aucune école sélectionnée');
          return;
        }
        
        const reports = await reportService.getReports(selectedSchoolId, 'NOUVEAU');
        const currentCount = reports.length;
        
        // Si l'agent a consulté les signalements et qu'il n'y en a plus de nouveaux, cacher le badge
        if (hasViewedReports && currentCount === 0) {
          setNewReportsCount(0);
        } else {
          // Sinon, afficher le nombre réel de signalements "NOUVEAU"
          setNewReportsCount(currentCount);
          
          // Si de nouveaux signalements arrivent après consultation, réinitialiser l'état "vu"
          if (hasViewedReports && currentCount > 0) {
            setHasViewedReports(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre de signalements:', error);
        // En cas d'erreur 401, ne pas afficher d'erreur car c'est normal si non connecté
        if (error.response?.status !== 401) {
          setNewReportsCount(0);
        }
      }
    };

    if (selectedSchoolId) {
      loadNewReportsCount();
      
      // Actualiser toutes les 30 secondes
      const interval = setInterval(loadNewReportsCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [selectedSchoolId, hasViewedReports]);

  // Fonction pour marquer les alertes comme consultées
  const handleAlertsViewed = () => {
    // Marquer comme consulté
    setHasViewedAlerts(true);
  };

  // Fonction pour marquer les signalements comme consultés
  const handleReportsViewed = () => {
    // Marquer comme consulté
    setHasViewedReports(true);
  };

  const menuItems = [
    { id: 'alerts', label: 'Alertes', icon: AlertTriangle, color: 'red', badge: newAlertsCount },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3, color: 'blue' },
    { id: 'reports', label: 'Signalements', icon: Megaphone, color: 'purple', badge: newReportsCount },
    { id: 'school-reports', label: 'Rapports', icon: FileText, color: 'indigo' },
    { id: 'students', label: 'Élèves', icon: Users, color: 'green' },
    { id: 'school-info', label: 'École', icon: Building2, color: 'gray' }
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Fixe à gauche, pleine hauteur */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo et Badge */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <img src={logoIcon} alt="Melio" className="w-14 h-14 mr-3" />
            <img src={fullLogo} alt="Melio" className="h-10 w-auto" />
          </div>
          <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-xl text-sm font-medium text-center">
            Espace Agent Social
          </div>

          {/* Indicateur école active */}
          <div className="mt-4">
            <label className="block text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">
              École active
            </label>
            
            {user?.schools && user.schools.length > 1 ? (
              <>
                <select
                  value={selectedSchoolId}
                  onChange={(e) => setSelectedSchoolId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-300 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all cursor-pointer hover:border-gray-400"
                >
                  {user.schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    {user.schools.length} école(s) assignée(s)
                  </p>
                  <span className="text-xs font-medium text-melio-purple bg-melio-pink-light px-2 py-1 rounded-full">
                    Multi-écoles
                  </span>
                </div>
              </>
            ) : (
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl px-4 py-3">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-gray-600 mr-2" />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">
                      {user?.schools && user.schools.length === 1 
                        ? user.schools[0].name 
                        : user?.schoolName || 'École'}
                    </div>
                    <div className="text-xs text-gray-600">
                      {user?.schools && user.schools.length === 1 
                        ? user.schools[0].code 
                        : user?.schoolCode}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Menu</h2>
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    if (item.id === 'alerts') handleAlertsViewed();
                    if (item.id === 'reports') handleReportsViewed();
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                    isActive
                      ? `bg-${item.color}-100 text-${item.color}-700 shadow-md`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <div className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {item.badge}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Profil Agent en bas */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-melio-purple to-melio-pink rounded-full flex items-center justify-center text-white font-bold">
                {user?.name?.[0] || 'A'}
              </div>
              <div className="ml-3">
                <div className="font-medium text-gray-800 text-sm">{user?.name}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-red-100 text-gray-700 hover:text-red-700 rounded-xl transition-all font-medium text-sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main Content - Utilise tout l'espace restant */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar avec titre de section */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label || 'Tableau de bord'}
              </h1>
              <div className="flex items-center mt-1 space-x-3">
                <p className="text-sm text-gray-600 flex items-center">
                  <Building2 className="w-4 h-4 mr-1" />
                  {user?.schools && user.schools.length > 1
                    ? user.schools.find(s => s.id === selectedSchoolId)?.name || user.schoolName
                    : user?.schoolName
                  }
                </p>
                {user?.schools && user.schools.length > 1 && (
                  <span className="text-xs bg-melio-pink-light text-melio-purple px-3 py-1 rounded-full font-medium flex items-center">
                    <Filter className="w-3 h-3 mr-1" />
                    Données filtrées pour cette école uniquement
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Scrollable, pleine largeur */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {!selectedSchoolId ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune école sélectionnée</h3>
                <p className="text-gray-500">Veuillez sélectionner une école dans le menu</p>
              </div>
            </div>
          ) : (
            <>
              {activeSection === 'alerts' && <AlertsSection onAlertsViewed={handleAlertsViewed} schoolId={selectedSchoolId} />}
              {activeSection === 'statistics' && <StatisticsSection schoolId={selectedSchoolId} />}
              {activeSection === 'reports' && <ReportsSection onReportsViewed={handleReportsViewed} schoolId={selectedSchoolId} />}
              {activeSection === 'school-reports' && <SchoolReportsSection schoolId={selectedSchoolId} />}
              {activeSection === 'students' && (
                <StudentsSection 
                  schoolId={selectedSchoolId} 
                  schoolName={user?.schools && user.schools.length > 1
                    ? user.schools.find(s => s.id === selectedSchoolId)?.name || user.schoolName
                    : user?.schoolName
                  }
                  schoolCode={user?.schools && user.schools.length > 1
                    ? user.schools.find(s => s.id === selectedSchoolId)?.code || user.schoolCode
                    : user?.schoolCode
                  }
                />
              )}
              {activeSection === 'school-info' && <SchoolInfoSection schoolId={selectedSchoolId} />}
            </>
          )}
        </div>
      </main>
    </div>
  );
}