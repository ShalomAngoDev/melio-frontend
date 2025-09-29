import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, BarChart3, FileText, Users, LogOut, Building2, Megaphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { alertService, reportService } from '../../services/api';
import AlertsSection from './AlertsSection';
import StatisticsSection from './StatisticsSection';
import ReportsSection from './ReportsSection';
import SchoolReportsSection from './SchoolReportsSection';
import StudentsSection from './StudentsSection';
import SchoolInfoSection from './SchoolInfoSection';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('alerts');
  const [newAlertsCount, setNewAlertsCount] = useState(0);
  const [hasViewedAlerts, setHasViewedAlerts] = useState(false);
  const [newReportsCount, setNewReportsCount] = useState(0);
  const [hasViewedReports, setHasViewedReports] = useState(false);

  // Charger le nombre d'alertes nouvelles
  useEffect(() => {
    const loadNewAlertsCount = async () => {
      try {
        const alerts = await alertService.getAlerts('NOUVELLE');
        const currentCount = alerts.length;
        
        // Si l'agent a consulté les alertes et qu'il n'y en a plus de nouvelles, cacher le badge
        if (hasViewedAlerts && currentCount === 0) {
          setNewAlertsCount(0);
        } else {
          // Sinon, afficher le nombre réel d'alertes "NOUVELLE"
          setNewAlertsCount(currentCount);
          
          // Si de nouvelles alertes arrivent après consultation, réinitialiser l'état "vu"
          if (hasViewedAlerts && currentCount > 0) {
            setHasViewedAlerts(false);
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement du nombre d\'alertes:', error);
        setNewAlertsCount(0);
      }
    };

    loadNewAlertsCount();
    
    // Actualiser toutes les 30 secondes
    const interval = setInterval(loadNewAlertsCount, 30000);
    
    return () => clearInterval(interval);
  }, [user?.schoolId, hasViewedAlerts]);

  // Charger le nombre de signalements nouveaux
  useEffect(() => {
    const loadNewReportsCount = async () => {
      try {
        const schoolId = user?.schoolId || '';
        if (!schoolId) return;
        
        const reports = await reportService.getReports(schoolId, 'NOUVEAU');
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
        setNewReportsCount(0);
      }
    };

    if (user?.schoolId) {
      loadNewReportsCount();
      
      // Actualiser toutes les 30 secondes
      const interval = setInterval(loadNewReportsCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user?.schoolId, hasViewedReports]);

  // Fonction pour réinitialiser le compteur d'alertes
  const handleAlertsViewed = () => {
    setNewAlertsCount(0);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header
        className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <img src="/logo-icon.png" alt="Melio" className="w-8 h-8 mr-3" />
                <img src="/fullLogo.png" alt="Melio" className="h-6 w-auto" />
              </div>
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Espace Agent Social
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white/60 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-gray-600 mr-2" />
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/60 rounded-full transition-all duration-200"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation - Fixed */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 lg:max-h-screen lg:overflow-y-auto">
              <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">Tableau de bord</h2>
                <nav className="space-y-3">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          // Marquer les signalements comme vus quand on clique sur la section
                          if (item.id === 'reports') {
                            handleReportsViewed();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                          isActive
                            ? `bg-${item.color}-100 text-${item.color}-700 border-2 border-${item.color}-200`
                            : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
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
                </nav>

                <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-800">Accès Sécurisé</span>
                  </div>
                  <p className="text-xs text-blue-700">
                    Vous n'avez accès qu'aux alertes d'urgence. Les journaux personnels restent privés.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === 'alerts' && <AlertsSection onAlertsViewed={handleAlertsViewed} />}
            {activeSection === 'statistics' && <StatisticsSection />}
            {activeSection === 'reports' && <ReportsSection onReportsViewed={handleReportsViewed} />}
            {activeSection === 'school-reports' && <SchoolReportsSection />}
            {activeSection === 'students' && <StudentsSection />}
            {activeSection === 'school-info' && <SchoolInfoSection />}
          </div>
        </div>
      </div>
    </div>
  );
}