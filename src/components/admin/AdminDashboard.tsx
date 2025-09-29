import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  LogOut, 
  BarChart3, 
  School, 
  Users, 
  TrendingUp,
  Globe,
  Activity,
  FileText,
  Settings,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { adminService } from '../../services/api';
import { logoIcon, fullLogo } from '../../assets/images';
import SchoolsOverview from './SchoolsOverview';
import SchoolManagement from './SchoolManagement';
import GlobalStatisticsSection from './GlobalStatisticsSection';
import GlobalReportsSection from './GlobalReportsSection';
import AddSchoolForm from './AddSchoolForm';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [globalStats, setGlobalStats] = useState({
    totalSchools: 0,
    totalStudents: 0,
    totalAgents: 0,
    totalAlerts: 0,
    totalReports: 0,
    activeSchools: 0,
    criticalAlerts: 0,
    resolvedAlerts: 0,
    newReports: 0,
    resolvedReports: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Globe, color: 'blue' },
    { id: 'schools', label: 'Écoles', icon: School, color: 'green' },
    { id: 'school-management', label: 'Gestion Écoles', icon: Settings, color: 'orange' },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3, color: 'purple' },
    { id: 'reports', label: 'Rapports', icon: FileText, color: 'indigo' }
  ];

  // Charger les statistiques globales
  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        setIsLoading(true);
        const stats = await adminService.getGlobalStats();
        setGlobalStats(stats);
      } catch (err) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };

    loadGlobalStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header
        className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center mr-8">
                <img src={logoIcon} alt="Melio" className="w-8 h-8 mr-3" />
                <img src={fullLogo} alt="Melio" className="h-6 w-auto" />
              </div>
              <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                Administration Melio
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-white/60 rounded-full px-4 py-2">
                <Shield className="w-4 h-4 text-purple-600 mr-2" />
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
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center px-4 py-3 rounded-2xl text-left transition-all duration-200 ${
                          isActive
                            ? `bg-${item.color}-100 text-${item.color}-700 border-2 border-${item.color}-200`
                            : 'text-gray-600 hover:bg-gray-50 border-2 border-transparent'
                        }`}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-8 p-4 bg-purple-50 rounded-2xl border border-purple-200">
                  <div className="flex items-center mb-2">
                    <Shield className="w-5 h-5 text-purple-600 mr-2" />
                    <span className="text-sm font-medium text-purple-800">Accès Administrateur</span>
                  </div>
                  <p className="text-xs text-purple-700">
                    Vue d'ensemble complète de toutes les écoles et signalements.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {isLoading && (
              <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
                  <p className="text-gray-600">Chargement des données...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-lg">
                <div className="flex items-center">
                  <Activity className="w-6 h-6 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
                    <p className="text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && activeSection === 'overview' && (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
                  <h1 className="text-2xl font-bold text-gray-800 mb-2">Vue d'ensemble globale</h1>
                  <p className="text-gray-600">Tableau de bord administrateur Melio</p>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-blue-100 p-2 rounded-xl">
                        <School className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">{globalStats.totalSchools}</div>
                        <div className="text-xs text-gray-600">Écoles</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <Activity className="w-3 h-3 text-green-500 mr-1" />
                      <span className="text-green-600">{globalStats.activeSchools} actives</span>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-green-100 p-2 rounded-xl">
                        <Users className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">{globalStats.totalStudents}</div>
                        <div className="text-xs text-gray-600">Élèves</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-gray-600">{globalStats.totalAgents} agents</span>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-red-100 p-2 rounded-xl">
                        <Activity className="w-5 h-5 text-red-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">{globalStats.totalAlerts}</div>
                        <div className="text-xs text-gray-600">Alertes</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-red-600">{globalStats.criticalAlerts} critiques</span>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="bg-indigo-100 p-2 rounded-xl">
                        <FileText className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-800">{globalStats.totalReports}</div>
                        <div className="text-xs text-gray-600">Signalements</div>
                      </div>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className="text-indigo-600">{globalStats.newReports} nouveaux</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
                  <h3 className="text-base font-semibold text-gray-800 mb-3">Actions rapides</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <button
                      onClick={() => setActiveSection('schools')}
                      className="flex items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200"
                    >
                      <School className="w-5 h-5 text-blue-600 mr-2" />
                      <div className="text-left">
                        <div className="font-medium text-blue-800 text-sm">Gérer les écoles</div>
                        <div className="text-xs text-blue-600">Voir toutes les écoles</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSection('statistics')}
                      className="flex items-center p-3 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 border border-red-200"
                    >
                      <Activity className="w-5 h-5 text-red-600 mr-2" />
                      <div className="text-left">
                        <div className="font-medium text-red-800 text-sm">Statistiques</div>
                        <div className="text-xs text-red-600">Voir les analyses détaillées</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveSection('reports')}
                      className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-all duration-200 border border-purple-200"
                    >
                      <FileText className="w-5 h-5 text-purple-600 mr-2" />
                      <div className="text-left">
                        <div className="font-medium text-purple-800 text-sm">Rapports globaux</div>
                        <div className="text-xs text-purple-600">Générer des rapports</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {!isLoading && !error && activeSection === 'schools' && (
              showAddSchool ? (
                <AddSchoolForm
                  onSuccess={() => {
                    setShowAddSchool(false);
                    // Rafraîchir les statistiques globales
                    const refreshStats = async () => {
                      try {
                        const stats = await adminService.getGlobalStats();
                        setGlobalStats(stats);
                      } catch (err) {
                        console.error('Erreur lors du rafraîchissement:', err);
                      }
                    };
                    refreshStats();
                  }}
                  onCancel={() => setShowAddSchool(false)}
                />
              ) : (
                <SchoolsOverview onAddSchool={() => setShowAddSchool(true)} />
              )
            )}
            {!isLoading && !error && activeSection === 'school-management' && (
              <SchoolManagement 
                onSchoolUpdate={() => {
                  // Rafraîchir les statistiques globales
                  const refreshStats = async () => {
                    try {
                      const stats = await adminService.getGlobalStats();
                      setGlobalStats(stats);
                    } catch (err) {
                      console.error('Erreur lors du rafraîchissement:', err);
                    }
                  };
                  refreshStats();
                }}
              />
            )}
            {!isLoading && !error && activeSection === 'statistics' && <GlobalStatisticsSection />}
            {!isLoading && !error && activeSection === 'reports' && <GlobalReportsSection />}
          </div>
        </div>
      </div>
    </div>
  );
}
