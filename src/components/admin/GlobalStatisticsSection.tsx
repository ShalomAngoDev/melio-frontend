import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  Activity,
  School,
  Globe,
  Target,
  Loader2
} from 'lucide-react';
import { adminService, statisticsService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { debugAuth, testApiRequest } from '../../utils/auth-debug';
import { clearAuth, forceAdminLogin } from '../../utils/clear-auth';
import SimpleVirtualizedList from '../common/SimpleVirtualizedList';

interface School {
  id: string;
  name: string;
  code: string;
}

interface GlobalStats {
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
}

interface TemporalStats {
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
}

export default function GlobalStatisticsSection() {
  const { showError } = useToast();
  const { user } = useAuth();
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [temporalStats, setTemporalStats] = useState<TemporalStats | null>(null);
  const [schools, setSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [selectedSchool, setSelectedSchool] = useState<string>('all');
  
  // Charger les statistiques réelles pour chaque école
  const [schoolStats, setSchoolStats] = useState<Record<string, any>>({});
  const [loadingSchoolStats, setLoadingSchoolStats] = useState(false);

  // Charger les données au montage du composant
  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    } else {
      setError('Accès refusé - Admin requis');
      setIsLoading(false);
    }
  }, [timeRange, user]);

  // Fonction pour charger les statistiques des écoles
  const loadSchoolStats = async () => {
    if (schools.length === 0) return;
    
    setLoadingSchoolStats(true);
    try {
      const statsPromises = schools.map(async (school) => {
        try {
          const stats = await statisticsService.getGeneralStats(school.id, timeRange);
          return { schoolId: school.id, stats };
        } catch (error) {
          console.error(`Erreur lors du chargement des stats pour ${school.name}:`, error);
          return { schoolId: school.id, stats: null };
        }
      });

      const results = await Promise.all(statsPromises);
      const statsMap = results.reduce((acc, { schoolId, stats }) => {
        acc[schoolId] = stats;
        return acc;
      }, {} as Record<string, any>);

      setSchoolStats(statsMap);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques des écoles:', error);
    } finally {
      setLoadingSchoolStats(false);
    }
  };

  // Charger les statistiques des écoles au montage
  useEffect(() => {
    loadSchoolStats();
  }, [schools, timeRange]);

  // Recharger les statistiques des écoles quand les filtres changent
  useEffect(() => {
    if (user?.role === 'admin' && schools.length > 0) {
      loadSchoolStats();
    }
  }, [timeRange]);

  const loadData = async () => {
    if (user?.role !== 'admin') {
      setError('Accès refusé - Admin requis');
      setIsLoading(false);
      return;
    }

    // Vérifier si le token est valide avant de faire des requêtes
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setError('Aucun token d\'accès - Veuillez vous reconnecter');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Charger les statistiques globales avec la période sélectionnée
      const globalStatsData = await adminService.getGlobalStats(timeRange);
      setGlobalStats(globalStatsData);

      // Charger les statistiques temporelles globales
      const temporalStatsData = await adminService.getGlobalTemporalStats(timeRange);
      setTemporalStats(temporalStatsData);

      // Charger la liste des écoles
      const schoolsData = await adminService.getAllSchools();
      setSchools(schoolsData.map(school => ({
        id: school.id,
        name: school.name,
        code: school.code
      })));

    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
      setError('Erreur lors du chargement des statistiques');
      showError('Erreur lors du chargement des statistiques');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculer les données pour les graphiques (filtrées)
  const currentData = selectedSchool === 'all' 
    ? (temporalStats?.alerts || [])
    : []; // Pas de données temporelles au niveau école pour le moment
  const maxValue = currentData.length > 0 ? Math.max(...currentData.map(d => d.critical + d.high + d.medium + d.low)) : 1;

  const getBarHeight = (value: number) => (value / maxValue) * 100;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <Activity className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {user?.role !== 'admin' ? 'Accès refusé' : 'Erreur de chargement'}
        </h3>
        <p className="text-gray-600 mb-4">
          {user?.role !== 'admin' 
            ? 'Vous devez être connecté en tant qu\'administrateur Melio pour accéder à cette page. Utilisez les identifiants : admin@melio.app / admin123'
            : error
          }
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          {user?.role === 'admin' && (
            <button
              onClick={loadData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          )}
          <button
            onClick={() => {
              debugAuth();
              testApiRequest();
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Diagnostic Console
          </button>
          <button
            onClick={forceAdminLogin}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Forcer Reconnexion Admin
          </button>
        </div>
      </div>
    );
  }


  // Données de comparaison des écoles avec vraies statistiques
  const allSchoolComparison = schools.map(school => {
    const stats = schoolStats[school.id];
    return {
      name: school.name,
      code: school.code,
      id: school.id,
      stats: stats ? {
        total: stats.totalAlerts || 0,
        critical: stats.alertsByRiskLevel?.CRITICAL || stats.alertsByRiskLevel?.CRITIQUE || 0,
        high: stats.alertsByRiskLevel?.HIGH || stats.alertsByRiskLevel?.ELEVE || 0,
        medium: stats.alertsByRiskLevel?.MEDIUM || stats.alertsByRiskLevel?.MOYEN || 0,
        low: stats.alertsByRiskLevel?.LOW || stats.alertsByRiskLevel?.FAIBLE || 0,
        resolved: stats.alertsByStatus?.TRAITEE || 0,
        totalReports: stats.totalReports || 0,
        byRiskLevel: {
          critical: stats.alertsByRiskLevel?.CRITICAL || stats.alertsByRiskLevel?.CRITIQUE || 0,
          high: stats.alertsByRiskLevel?.HIGH || stats.alertsByRiskLevel?.ELEVE || 0,
          medium: stats.alertsByRiskLevel?.MEDIUM || stats.alertsByRiskLevel?.MOYEN || 0,
          low: stats.alertsByRiskLevel?.LOW || stats.alertsByRiskLevel?.FAIBLE || 0
        }
      } : {
        total: 0,
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
        resolved: 0,
        totalReports: 0,
        byRiskLevel: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0
        }
      },
      students: stats?.totalStudents || 0,
      staff: 1, // On ne peut pas facilement récupérer le nombre d'agents par école
      region: 'Région' // Information non disponible dans l'API actuelle
    };
  });

  // Filtrer les écoles selon la sélection
  const schoolComparison = selectedSchool === 'all' 
    ? allSchoolComparison 
    : allSchoolComparison.filter(school => school.id === selectedSchool);

  // Calculer les statistiques filtrées selon l'école sélectionnée
  const getFilteredStats = () => {
    if (selectedSchool === 'all') {
      // Utiliser les statistiques globales
      return {
        totalAlerts: globalStats?.totalAlerts || 0,
        resolvedAlerts: globalStats?.resolvedAlerts || 0,
        totalStudents: globalStats?.totalStudents || 0,
        totalReports: globalStats?.totalReports || 0,
        criticalAlerts: globalStats?.criticalAlerts || 0,
        alertsByRiskLevel: globalStats?.alertsByRiskLevel || {},
        reportsByUrgency: globalStats?.reportsByUrgency || {}
      };
    } else {
      // Utiliser les statistiques de l'école sélectionnée
      const school = allSchoolComparison.find(s => s.id === selectedSchool);
      if (!school) return null;
      
      return {
        totalAlerts: school.stats?.total || 0,
        resolvedAlerts: school.stats?.resolved || 0,
        totalStudents: school.students || 0,
        totalReports: school.stats?.totalReports || 0,
        criticalAlerts: school.stats?.byRiskLevel?.critical || 0,
        alertsByRiskLevel: {
          CRITICAL: school.stats?.byRiskLevel?.critical || 0,
          HIGH: school.stats?.byRiskLevel?.high || 0,
          MEDIUM: school.stats?.byRiskLevel?.medium || 0,
          LOW: school.stats?.byRiskLevel?.low || 0,
          // Support ancien format pour compatibilité
          CRITIQUE: school.stats?.byRiskLevel?.critical || 0,
          ELEVE: school.stats?.byRiskLevel?.high || 0,
          MOYEN: school.stats?.byRiskLevel?.medium || 0,
          FAIBLE: school.stats?.byRiskLevel?.low || 0
        },
        reportsByUrgency: {} // Pas disponible au niveau école
      };
    }
  };

  const filteredStats = getFilteredStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {selectedSchool === 'all' ? 'Statistiques Globales' : 'Statistiques de l\'École'}
            </h1>
            <p className="text-gray-600">
              {selectedSchool === 'all' 
                ? 'Analyse des tendances pour toutes les écoles'
                : `Analyse des tendances pour ${schools.find(s => s.id === selectedSchool)?.name || 'l\'école sélectionnée'}`
              }
            </p>
          </div>
          
          <div className="flex space-x-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              disabled={isLoading}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                timeRange === 'week'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading && timeRange === 'week' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Semaine'
              )}
            </button>
            <button
              onClick={() => setTimeRange('month')}
              disabled={isLoading}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                timeRange === 'month'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading && timeRange === 'month' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Mois'
              )}
            </button>
            <button
              onClick={() => setTimeRange('year')}
              disabled={isLoading}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                timeRange === 'year'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isLoading && timeRange === 'year' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Année'
              )}
            </button>
            </div>
            
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <option value="all">Toutes les écoles</option>
              {schools.map(school => (
                <option key={school.id} value={school.id}>
                  {school.name} ({school.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Global Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{filteredStats?.totalAlerts || 0}</div>
              <div className="text-sm text-gray-600">Total alertes</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+{filteredStats?.criticalAlerts || 0} critiques</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{filteredStats?.resolvedAlerts || 0}</div>
              <div className="text-sm text-gray-600">Résolues</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600">
              {filteredStats?.totalAlerts ? Math.round((filteredStats.resolvedAlerts / filteredStats.totalAlerts) * 100) : 0}% du total
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{filteredStats?.totalStudents || 0}</div>
              <div className="text-sm text-gray-600">Élèves</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600">
              {selectedSchool === 'all' 
                ? `Dans ${globalStats?.totalSchools || 0} écoles`
                : 'École sélectionnée'
              }
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{filteredStats?.totalReports || 0}</div>
              <div className="text-sm text-gray-600">Signalements</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-gray-600">
              {selectedSchool === 'all' 
                ? `${globalStats?.newReports || 0} nouveaux`
                : 'Pour cette école'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Évolution des alertes par niveau de risque
          </h3>
          
          {currentData.length > 0 ? (
          <div className="h-64 flex items-end justify-between space-x-2">
            {currentData.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-12 flex flex-col-reverse space-y-reverse space-y-1">
                  {/* Critical */}
                  {data.critical > 0 && (
                    <div
                      className="bg-red-500 rounded-t"
                      style={{ height: `${getBarHeight(data.critical)}px` }}
                      title={`${data.critical} critique(s)`}
                    />
                  )}
                  {/* High */}
                  {data.high > 0 && (
                    <div
                      className="bg-orange-500"
                      style={{ height: `${getBarHeight(data.high)}px` }}
                      title={`${data.high} élevée(s)`}
                    />
                  )}
                  {/* Medium */}
                  {data.medium > 0 && (
                    <div
                      className="bg-yellow-500"
                      style={{ height: `${getBarHeight(data.medium)}px` }}
                      title={`${data.medium} moyenne(s)`}
                    />
                  )}
                  {/* Low */}
                  {data.low > 0 && (
                    <div
                      className="bg-blue-500 rounded-b"
                      style={{ height: `${getBarHeight(data.low)}px` }}
                      title={`${data.low} faible(s)`}
                    />
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-2">{data.label}</div>
              </div>
            ))}
          </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            </div>
          )}

          <div className="flex justify-center space-x-4 mt-6 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
              <span>Critique</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
              <span>Élevé</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
              <span>Moyen</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
              <span>Faible</span>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Répartition par niveau de risque
          </h3>
          
          <div className="space-y-4">
            {[
              { level: 'critical', label: 'Critique', count: (filteredStats?.alertsByRiskLevel?.CRITICAL || filteredStats?.alertsByRiskLevel?.CRITIQUE || 0), color: 'bg-red-500' },
              { level: 'high', label: 'Élevé', count: (filteredStats?.alertsByRiskLevel?.HIGH || filteredStats?.alertsByRiskLevel?.ELEVE || 0), color: 'bg-orange-500' },
              { level: 'medium', label: 'Moyen', count: (filteredStats?.alertsByRiskLevel?.MEDIUM || filteredStats?.alertsByRiskLevel?.MOYEN || 0), color: 'bg-yellow-500' },
              { level: 'low', label: 'Faible', count: (filteredStats?.alertsByRiskLevel?.LOW || filteredStats?.alertsByRiskLevel?.FAIBLE || 0), color: 'bg-blue-500' }
            ].map((item) => {
              const total = filteredStats?.totalAlerts || 0;
              const percentage = total > 0 ? (item.count / total) * 100 : 0;
              return (
                <div key={item.level}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    <span className="text-sm text-gray-600">{item.count} ({percentage.toFixed(1)}%)</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className={`${item.color} h-2 rounded-full transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Recommandations</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Focus sur la prévention si beaucoup d'alertes moyennes</li>
              <li>• Renforcer l'équipe si alertes critiques fréquentes</li>
              <li>• Analyser les tendances pour anticiper</li>
            </ul>
          </div>
        </div>
      </div>

      {/* School Comparison */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">
              Comparaison des écoles
            </h3>
            <p className="text-sm text-gray-600">
              {selectedSchool === 'all' 
                ? `${schoolComparison.length} école(s) affichée(s)`
                : `1 école sélectionnée`
              }
            </p>
          </div>
          {loadingSchoolStats && (
            <div className="flex items-center text-sm text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Chargement des statistiques...
            </div>
          )}
        </div>
        
        {schoolComparison.length === 0 ? (
          <div className="text-center py-12">
            <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">Aucune école disponible</h3>
            <p className="text-gray-400">Aucune donnée de comparaison pour le moment.</p>
          </div>
        ) : (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            {/* Header des colonnes */}
            <div className="bg-gray-100 border-b-2 border-gray-300 p-4">
              <div className="flex items-center w-full justify-between">
                <div className="w-48 px-2">
                  <span className="text-sm text-gray-600">École</span>
                </div>
                <div className="w-24 text-center px-2">
                  <span className="text-sm text-gray-600">Élèves</span>
                </div>
                <div className="w-24 text-center px-2">
                  <span className="text-sm text-gray-600">Agents</span>
                </div>
                <div className="w-24 text-center px-2">
                  <span className="text-sm text-gray-600">Alertes</span>
                </div>
                <div className="w-24 text-center px-2">
                  <span className="text-sm text-gray-600">Résolues</span>
                </div>
                <div className="w-32 text-center px-2">
                  <span className="text-sm text-gray-600">Taux résolution</span>
                </div>
                <div className="w-24 text-center px-2">
                  <span className="text-sm text-gray-600">Signalements</span>
                </div>
              </div>
            </div>

            <SimpleVirtualizedList<typeof schoolComparison[0]>
              items={schoolComparison}
              height={400}
              itemHeight={120}
              renderItem={({ item: school }) => (
                <div
                  key={school.code}
                  className="hover:bg-blue-50/50 transition-colors border-b border-gray-200 p-4 h-30"
                >
                  {/* Ligne principale avec les métriques */}
                  <div className="flex items-center w-full justify-between mb-3">
                    {/* École - Largeur fixe */}
                    <div className="flex items-center w-48 px-2">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <School className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate" title={school.name}>
                          {school.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {school.code} • {school.region}
                        </div>
                      </div>
                    </div>

                    {/* Élèves - Largeur fixe */}
                    <div className="w-24 text-center px-2">
                      <div className="text-lg font-bold text-gray-800">{school.students}</div>
                      <div className="text-xs text-gray-500">Élèves</div>
                    </div>

                    {/* Agents - Largeur fixe */}
                    <div className="w-24 text-center px-2">
                      <div className="text-lg font-bold text-gray-800">{school.staff}</div>
                      <div className="text-xs text-gray-500">Agents</div>
                    </div>

                    {/* Alertes - Largeur fixe */}
                    <div className="w-24 text-center px-2">
                      <div className="text-lg font-bold text-gray-800">{school.stats?.total || 0}</div>
                      <div className="text-xs text-gray-500">Alertes</div>
                    </div>

                    {/* Résolues - Largeur fixe */}
                    <div className="w-24 text-center px-2">
                      <div className="text-lg font-bold text-green-600">{school.stats?.resolved || 0}</div>
                      <div className="text-xs text-gray-500">Résolues</div>
                    </div>

                    {/* Taux de résolution - Largeur fixe */}
                    <div className="w-32 text-center px-2">
                      <div className="text-lg font-bold text-blue-600">
                        {(school.stats?.total || 0) > 0 ? Math.round(((school.stats?.resolved || 0) / (school.stats?.total || 1)) * 100) : 0}%
                      </div>
                      <div className="text-xs text-gray-500">Taux</div>
                    </div>

                    {/* Signalements - Largeur fixe */}
                    <div className="w-24 text-center px-2">
                      <div className="text-lg font-bold text-purple-600">{school.stats?.totalReports || 0}</div>
                      <div className="text-xs text-gray-500">Signalements</div>
                    </div>
                  </div>

                  {/* Détails des niveaux de risque - Ligne supplémentaire alignée */}
                  <div className="w-full">
                    <div className="flex justify-between text-xs text-gray-600 px-2">
                      <div className="w-48 px-2">
                        <span className="text-gray-400">Détails des risques:</span>
                      </div>
                      <div className="w-24 text-center px-2">
                        <span className="text-gray-400">-</span>
                      </div>
                      <div className="w-24 text-center px-2">
                        <span className="text-gray-400">-</span>
                      </div>
                      <div className="w-24 text-center px-2">
                        <span>Critiques: <span className="font-medium text-red-600">{school.stats?.byRiskLevel?.critical || 0}</span></span>
                      </div>
                      <div className="w-24 text-center px-2">
                        <span>Élevées: <span className="font-medium text-orange-600">{school.stats?.byRiskLevel?.high || 0}</span></span>
                      </div>
                      <div className="w-32 text-center px-2">
                        <span>Moyennes: <span className="font-medium text-yellow-600">{school.stats?.byRiskLevel?.medium || 0}</span></span>
                      </div>
                      <div className="w-24 text-center px-2">
                        <span>Faibles: <span className="font-medium text-blue-600">{school.stats?.byRiskLevel?.low || 0}</span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        )}
      </div>

      {/* Trends Analysis */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">
          Analyse des tendances
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-2xl border border-green-200">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <h4 className="font-semibold text-green-800 mb-1">Tendance positive</h4>
            <p className="text-sm text-green-700">
              Le taux de résolution s'améliore (+15% ce mois)
            </p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-2xl border border-blue-200">
            <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <h4 className="font-semibold text-blue-800 mb-1">Prévention efficace</h4>
            <p className="text-sm text-blue-700">
              Réduction des alertes critiques (-20% cette semaine)
            </p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-2xl border border-purple-200">
            <Globe className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <h4 className="font-semibold text-purple-800 mb-1">Couverture nationale</h4>
            <p className="text-sm text-purple-700">
              2 écoles actives dans 2 régions différentes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
