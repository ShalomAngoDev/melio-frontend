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
import GlobalStatisticsSection from './GlobalStatisticsSection';
import GlobalReportsSection from './GlobalReportsSection';
import AddSchoolForm from './AddSchoolForm';
import { AgentsManagement } from './AgentsManagement';

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
    { id: 'schools', label: 'Écoles', icon: School, color: 'indigo' },
    { id: 'agents', label: 'Agents Référents', icon: Users, color: 'purple' },
    { id: 'statistics', label: 'Statistiques', icon: BarChart3, color: 'pink' },
    { id: 'reports', label: 'Rapports', icon: FileText, color: 'violet' }
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
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Fixe à gauche, pleine hauteur */}
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-sm">
        {/* Logo & Badge */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center mb-4">
            <img src={logoIcon} alt="Melio" className="w-8 h-8 mr-3" />
            <img src={fullLogo} alt="Melio" className="h-6 w-auto" />
          </div>
          <div className="bg-melio-pink-light text-melio-purple px-3 py-2 rounded-full text-sm font-medium text-center">
            Administration Melio
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Menu Principal
          </h2>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  isActive
                    ? `bg-${item.color}-100 text-${item.color}-700 shadow-md`
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info - En bas de la sidebar */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-melio-pink-light rounded-xl p-3 mb-3 border border-melio-purple-light">
            <div className="flex items-center mb-1">
              <Shield className="w-4 h-4 text-melio-purple mr-2" />
              <span className="text-xs font-medium text-melio-purple">Administrateur</span>
            </div>
            <p className="text-xs text-melio-purple-light">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content - Utilise tout l'espace restant */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {menuItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-600">Gestion globale de la plateforme Melio</p>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                {globalStats.totalSchools} écoles
              </div>
              <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                {globalStats.totalStudents} élèves
              </div>
            </div>
          </div>
        </header>

        {/* Content Area - Scrollable, pleine largeur */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin text-melio-purple mb-4" />
                <p className="text-gray-600">Chargement des données...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
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
            <div className="space-y-6 h-full">
              {/* Key Metrics - Grille élargie */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
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

                  <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
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

                  <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
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

                  <div className="bg-white rounded-2xl p-4 shadow-md border border-gray-200">
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
              <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions rapides</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => setActiveSection('schools')}
                    className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all duration-200 border border-blue-200 hover:shadow-md"
                  >
                    <School className="w-6 h-6 text-blue-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-blue-800 text-sm">Gérer les écoles</div>
                      <div className="text-xs text-blue-600">Voir toutes les écoles</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveSection('statistics')}
                    className="flex items-center p-4 bg-red-50 hover:bg-red-100 rounded-xl transition-all duration-200 border border-red-200 hover:shadow-md"
                  >
                    <Activity className="w-6 h-6 text-red-600 mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-red-800 text-sm">Statistiques</div>
                      <div className="text-xs text-red-600">Analyses détaillées</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveSection('reports')}
                    className="flex items-center p-4 bg-melio-pink-light hover:bg-melio-purple-light/50 rounded-xl transition-all duration-200 border border-melio-purple-light hover:shadow-md"
                  >
                    <FileText className="w-6 h-6 text-melio-purple mr-3" />
                    <div className="text-left">
                      <div className="font-medium text-melio-purple text-sm">Rapports globaux</div>
                      <div className="text-xs text-melio-purple-light">Générer des rapports</div>
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
          
          {!isLoading && !error && activeSection === 'agents' && <AgentsManagement />}
          
          {!isLoading && !error && activeSection === 'statistics' && <GlobalStatisticsSection />}
          {!isLoading && !error && activeSection === 'reports' && <GlobalReportsSection />}
        </div>
      </main>
    </div>
  );
}
