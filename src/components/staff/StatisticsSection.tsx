import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, AlertTriangle, Activity, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { statisticsService } from '../../services/api';

interface StatisticsSectionProps {
  schoolId: string;
}

export default function StatisticsSection({ schoolId }: StatisticsSectionProps) {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les données
  const [generalStats, setGeneralStats] = useState<any>(null);
  const [temporalStats, setTemporalStats] = useState<any>(null);
  const [classStats, setClassStats] = useState<any[]>([]);
  const [trends, setTrends] = useState<any>(null);

  // Charger les données
  useEffect(() => {
    const loadStatistics = async () => {
      if (!schoolId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const [general, temporal, classes, trendsData] = await Promise.all([
          statisticsService.getGeneralStats(schoolId, timeRange),
          statisticsService.getTemporalStats(schoolId, timeRange),
          statisticsService.getClassStats(schoolId),
          statisticsService.getTrends(schoolId),
        ]);
        
        setGeneralStats(general);
        setTemporalStats(temporal);
        setClassStats(classes);
        setTrends(trendsData);
      } catch (err: any) {
        console.error('Erreur lors du chargement des statistiques:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
      } finally {
        setIsLoading(false);
      }
    };

    loadStatistics();
  }, [schoolId, timeRange]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Erreur</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  if (!generalStats || !temporalStats) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-800 mb-2">Aucune donnée</h3>
        <p className="text-gray-600">Aucune statistique disponible pour le moment.</p>
      </div>
    );
  }

  const currentData = temporalStats?.alerts || [];
  const maxValue = currentData.length > 0 
    ? Math.max(...currentData.map((d: any) => (d.critical || 0) + (d.high || 0) + (d.medium || 0) + (d.low || 0)), 1)
    : 1;

  const getBarHeight = (value: number) => {
    if (maxValue === 0 || value === 0) return 0;
    return Math.max((value / maxValue) * 240, 2); // 240px de hauteur max, minimum 2px pour visibilité
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Statistiques Anonymes</h1>
            <p className="text-gray-600">Analyse des tendances pour votre établissement</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setTimeRange('week')}
              className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                timeRange === 'week'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Semaine
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                timeRange === 'month'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mois
            </button>
            <button
              onClick={() => setTimeRange('year')}
              className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                timeRange === 'year'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Année
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-2xl">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{generalStats.totalAlerts}</div>
              <div className="text-sm text-gray-600">Alertes totales</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            {trends?.alertsTrend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
            ) : trends?.alertsTrend === 'down' ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1 rotate-180" />
            ) : (
              <div className="w-4 h-4 bg-gray-400 rounded-full mr-1" />
            )}
            <span className={trends?.alertsTrend === 'up' ? 'text-red-600' : trends?.alertsTrend === 'down' ? 'text-green-600' : 'text-gray-600'}>
              {trends?.alertsTrend === 'up' ? '+' : trends?.alertsTrend === 'down' ? '-' : ''}{trends?.alertsPercentage?.toFixed(1) || 0}% cette période
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-2xl">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{generalStats.totalReports}</div>
              <div className="text-sm text-gray-600">Signalements</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            {trends?.reportsTrend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-red-500 mr-1" />
            ) : trends?.reportsTrend === 'down' ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1 rotate-180" />
            ) : (
              <div className="w-4 h-4 bg-gray-400 rounded-full mr-1" />
            )}
            <span className={trends?.reportsTrend === 'up' ? 'text-red-600' : trends?.reportsTrend === 'down' ? 'text-green-600' : 'text-gray-600'}>
              {trends?.reportsTrend === 'up' ? '+' : trends?.reportsTrend === 'down' ? '-' : ''}{trends?.reportsPercentage?.toFixed(1) || 0}% cette période
            </span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-2xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{generalStats.totalStudents}</div>
              <div className="text-sm text-gray-600">Élèves suivis</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 bg-gray-400 rounded-full mr-1" />
            <span className="text-gray-600">Données en temps réel</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-2xl">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-800">{generalStats.alertsByStatus?.TRAITEE || 0}</div>
              <div className="text-sm text-gray-600">Résolues</div>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-4 h-4 bg-gray-400 rounded-full mr-1" />
            <span className="text-gray-600">Taux de résolution</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Évolution des alertes par niveau de risque
          </h3>
          
          {currentData.length > 0 ? (
            <div className="h-64 flex items-end justify-between space-x-2">
              {currentData.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full max-w-12 flex flex-col-reverse space-y-reverse space-y-1 min-h-[40px]">
                    {/* Critical */}
                    {data.critical > 0 && (
                      <div
                        className="bg-red-500 rounded-t"
                        style={{ height: `${getBarHeight(data.critical || 0)}px` }}
                        title={`${data.critical} critique(s)`}
                      />
                    )}
                    {/* High */}
                    {data.high > 0 && (
                      <div
                        className="bg-orange-500"
                        style={{ height: `${getBarHeight(data.high || 0)}px` }}
                        title={`${data.high} élevée(s)`}
                      />
                    )}
                    {/* Medium */}
                    {data.medium > 0 && (
                      <div
                        className="bg-yellow-500"
                        style={{ height: `${getBarHeight(data.medium || 0)}px` }}
                        title={`${data.medium} moyenne(s)`}
                      />
                    )}
                    {/* Low */}
                    {data.low > 0 && (
                      <div
                        className="bg-blue-500 rounded-b"
                        style={{ height: `${getBarHeight(data.low || 0)}px` }}
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
              { level: 'critical', label: 'Critique', count: generalStats?.alertsByRiskLevel?.CRITIQUE || 0, color: 'bg-red-500' },
              { level: 'high', label: 'Élevé', count: generalStats?.alertsByRiskLevel?.ELEVE || 0, color: 'bg-orange-500' },
              { level: 'medium', label: 'Moyen', count: generalStats?.alertsByRiskLevel?.MOYEN || 0, color: 'bg-yellow-500' },
              { level: 'low', label: 'Faible', count: generalStats?.alertsByRiskLevel?.FAIBLE || 0, color: 'bg-blue-500' }
            ].map((item) => {
              const total = generalStats?.totalAlerts || 0;
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
    </div>
  );
}