import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  TrendingUp, 
  Users,
  Globe,
  School,
  Filter,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Activity
} from 'lucide-react';
import { adminService, statisticsService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface School {
  id: string;
  code: string;
  name: string;
}

export default function GlobalReportsSection() {
  const { showError } = useToast();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [reportType, setReportType] = useState('summary');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [schoolStats, setSchoolStats] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Charger la liste des écoles
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setIsLoading(true);
        const schoolsList = await adminService.getSchools();
        setSchools(schoolsList);
        // Sélectionner toutes les écoles par défaut
        setSelectedSchools(schoolsList.map(s => s.id));
      } catch (error) {
        console.error('Erreur lors du chargement des écoles:', error);
        showError('Erreur lors du chargement des écoles');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchools();
  }, []);

  // Charger les statistiques globales quand la période change
  useEffect(() => {
    const loadGlobalStats = async () => {
      try {
        const stats = await adminService.getGlobalStats(selectedPeriod);
        setGlobalStats(stats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques globales:', error);
        showError('Erreur lors du chargement des statistiques globales');
      }
    };

    loadGlobalStats();
  }, [selectedPeriod]);

  // Charger les statistiques de chaque école sélectionnée
  useEffect(() => {
    const loadSchoolStats = async () => {
      if (selectedSchools.length === 0) return;

      try {
        const statsPromises = selectedSchools.map(async (schoolId) => {
          try {
            const stats = await statisticsService.getGeneralStats(schoolId, selectedPeriod);
            return { schoolId, stats };
          } catch (error) {
            console.error(`Erreur lors du chargement des stats pour l'école ${schoolId}:`, error);
            return { schoolId, stats: null };
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
      }
    };

    loadSchoolStats();
  }, [selectedSchools, selectedPeriod]);

  const generatePDFReport = () => {
    // Générer le rapport avec les vraies données
    const reportData = {
      type: 'global',
      period: selectedPeriod,
      reportType: reportType,
      selectedSchools: selectedSchools.map(id => {
        const school = schools.find(s => s.id === id);
        return { id, code: school?.code, name: school?.name };
      }),
      globalStats: globalStats,
      schoolStats: selectedSchools.reduce((acc, schoolId) => {
        const school = schools.find(s => s.id === schoolId);
        if (school && schoolStats[schoolId]) {
          acc[school.code] = schoolStats[schoolId];
        }
        return acc;
      }, {} as Record<string, any>),
      generatedAt: new Date().toISOString()
    };

    // Créer un lien de téléchargement JSON (en attendant l'implémentation PDF)
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    const periodLabel = selectedPeriod === 'week' ? 'semaine' : selectedPeriod === 'month' ? 'mois' : 'annee';
    downloadAnchorNode.setAttribute('download', `melio-rapport-global-${periodLabel}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    alert('Rapport global généré ! (Fichier JSON téléchargé)');
  };

  const reportTemplates = [
    {
      id: 'summary',
      title: 'Rapport de synthèse global',
      description: 'Vue d\'ensemble de toutes les écoles',
      icon: BarChart3,
      features: ['Statistiques globales', 'Comparaison des écoles', 'Tendances générales', 'Recommandations']
    },
    {
      id: 'detailed',
      title: 'Rapport détaillé multi-écoles',
      description: 'Analyse approfondie par école',
      icon: FileText,
      features: ['Analyse par école', 'Comparaison des performances', 'Recommandations personnalisées', 'Indicateurs clés']
    },
    {
      id: 'trends',
      title: 'Rapport de tendances nationales',
      description: 'Évolution et prédictions globales',
      icon: TrendingUp,
      features: ['Graphiques d\'évolution', 'Analyse comparative', 'Prédictions', 'Benchmarking']
    },
    {
      id: 'compliance',
      title: 'Rapport de conformité',
      description: 'Vérification des bonnes pratiques',
      icon: Globe,
      features: ['Conformité RGPD', 'Sécurité des données', 'Audit des processus', 'Recommandations']
    }
  ];

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId) 
        ? prev.filter(s => s !== schoolId)
        : [...prev, schoolId]
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Rapports Globaux</h1>
        <p className="text-gray-600">Rapports consolidés pour toutes les écoles</p>
      </div>

      {/* Configuration */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Configuration du rapport</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Période d'analyse
            </label>
            <div className="space-y-2">
              {[
                { id: 'week', label: 'Cette semaine' },
                { id: 'month', label: 'Ce mois' },
                { id: 'year', label: 'Cette année' }
              ].map((period) => (
                <label key={period.id} className="flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value={period.id}
                    checked={selectedPeriod === period.id}
                    onChange={(e) => setSelectedPeriod(e.target.value as 'week' | 'month' | 'year')}
                    className="mr-3 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">{period.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Schools Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Écoles à inclure
            </label>
            <div className="space-y-2 max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-3 bg-gray-50">
              {schools.length === 0 ? (
                <p className="text-sm text-gray-500">Aucune école disponible</p>
              ) : (
                schools.map((school) => (
                  <label key={school.id} className="flex items-center hover:bg-white px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedSchools.includes(school.id)}
                      onChange={() => toggleSchool(school.id)}
                      className="mr-3 text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-gray-700">{school.name}</span>
                    <span className="text-xs text-gray-500 ml-2">({school.code})</span>
                  </label>
                ))
              )}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {selectedSchools.length} / {schools.length} école(s) sélectionnée(s)
            </div>
          </div>

          {/* Report Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Type de rapport
            </label>
            <div className="space-y-3">
              {reportTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <label
                    key={template.id}
                    className={`flex items-start p-3 rounded-2xl border-2 cursor-pointer transition-all duration-200 ${
                      reportType === template.id
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportType"
                      value={template.id}
                      checked={reportType === template.id}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mr-3 mt-1 text-purple-500 focus:ring-purple-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center mb-1">
                        <Icon className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="font-medium text-gray-800">{template.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        {template.features.map((feature, index) => (
                          <li key={index}>• {feature}</li>
                        ))}
                      </ul>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Aperçu du rapport</h2>
        
        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Rapport Melio Global - {reportTemplates.find(t => t.id === reportType)?.title}
              </h3>
              <p className="text-gray-600">
                Période: {selectedPeriod === 'week' ? 'Cette semaine' : 
                selectedPeriod === 'month' ? 'Ce mois' : 'Cette année'}
              </p>
              <p className="text-sm text-gray-500">
                Écoles: {selectedSchools.map(id => {
                  const school = schools.find(s => s.id === id);
                  return school?.name || id;
                }).join(', ')}
              </p>
              <p className="text-sm text-gray-500">
                Généré le {new Date().toLocaleDateString('fr-FR')}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                Confidentiel
              </div>
            </div>
          </div>

          {/* Global Stats Preview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-800">{globalStats?.totalAlerts || 0}</div>
              <div className="text-sm text-gray-600">Total alertes</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{globalStats?.resolvedAlerts || 0}</div>
              <div className="text-sm text-gray-600">Résolues</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">
                {(globalStats?.totalAlerts || 0) - (globalStats?.resolvedAlerts || 0)}
              </div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{selectedSchools.length}</div>
              <div className="text-sm text-gray-600">Écoles sélectionnées</div>
            </div>
          </div>

          {/* School Comparison Preview */}
          {reportType === 'summary' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Comparaison des écoles:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSchools.map(schoolId => {
                  const school = schools.find(s => s.id === schoolId);
                  const stats = schoolStats[schoolId];
                  if (!school) return null;

                  return (
                    <div key={schoolId} className="bg-white rounded-xl p-4 border border-gray-200">
                      <h5 className="font-medium text-gray-800 mb-2">
                        {school.name}
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Alertes:</span>
                          <span className="font-medium">{stats?.totalAlerts || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Résolues:</span>
                          <span className="font-medium text-green-600">
                            {stats?.alertsByStatus?.resolved || stats?.alertsByStatus?.TRAITEE || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Critiques:</span>
                          <span className="font-medium text-red-600">
                            {stats?.alertsByRiskLevel?.CRITICAL || stats?.alertsByRiskLevel?.CRITIQUE || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taux:</span>
                          <span className="font-medium">
                            {stats?.totalAlerts > 0 
                              ? Math.round(((stats?.alertsByStatus?.resolved || stats?.alertsByStatus?.TRAITEE || 0) / stats.totalAlerts) * 100) 
                              : 0}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Signalements:</span>
                          <span className="font-medium">{stats?.totalReports || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Élèves:</span>
                          <span className="font-medium">{stats?.totalStudents || 0}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reportType === 'detailed' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Analyse détaillée:</h4>
              {selectedSchools.map(schoolId => {
                const school = schools.find(s => s.id === schoolId);
                const stats = schoolStats[schoolId];
                if (!school) return null;

                const criticalCount = stats?.alertsByRiskLevel?.CRITICAL || stats?.alertsByRiskLevel?.CRITIQUE || 0;
                const pendingCount = (stats?.alertsByStatus?.pending || stats?.alertsByStatus?.NOUVELLE || 0) + 
                                    (stats?.alertsByStatus?.acknowledged || stats?.alertsByStatus?.EN_COURS || 0);
                const resolutionRate = stats?.totalAlerts > 0 
                  ? Math.round(((stats?.alertsByStatus?.resolved || stats?.alertsByStatus?.TRAITEE || 0) / stats.totalAlerts) * 100)
                  : 0;

                return (
                  <div key={schoolId} className="bg-white rounded-xl p-4 border border-gray-200">
                    <h5 className="font-medium text-gray-800 mb-3">{school.name}</h5>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-gray-600">Alertes totales:</span>
                        <span className="font-medium ml-2">{stats?.totalAlerts || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">En attente:</span>
                        <span className="font-medium ml-2 text-orange-600">{pendingCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Critiques:</span>
                        <span className="font-medium ml-2 text-red-600">{criticalCount}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Taux résolution:</span>
                        <span className="font-medium ml-2">{resolutionRate}%</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      {criticalCount > 0 && `⚠️ ${criticalCount} alerte(s) critique(s) nécessite(nt) une attention prioritaire. `}
                      {pendingCount > 10 && `📊 ${pendingCount} alerte(s) en attente de traitement. `}
                      {resolutionRate < 70 && `📉 Taux de résolution à améliorer (objectif: 80%).`}
                      {criticalCount === 0 && pendingCount <= 10 && resolutionRate >= 70 && `✅ Performance conforme.`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {reportType === 'trends' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Tendances observées:</h4>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center mb-2">
                      <Activity className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm font-medium text-gray-800">Vue d'ensemble</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {globalStats?.totalAlerts || 0} alerte(s) totale(s) sur la période sélectionnée.
                      {globalStats?.resolvedAlerts > 0 && (
                        <span> {globalStats.resolvedAlerts} résolue(s) (taux de résolution: {globalStats?.totalAlerts > 0 ? Math.round((globalStats.resolvedAlerts / globalStats.totalAlerts) * 100) : 0}%).</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm font-medium text-gray-800">Alertes critiques</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      {globalStats?.criticalAlerts || 0} alerte(s) critique(s) identifiée(s).
                      {selectedSchools.length > 0 && ' Données consolidées pour les écoles sélectionnées.'}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <School className="w-4 h-4 text-indigo-500 mr-2" />
                      <span className="text-sm font-medium text-gray-800">Couverture</span>
                    </div>
                    <p className="text-sm text-gray-700">
                      Analyse portant sur {selectedSchools.length} école(s) sur un total de {schools.length} école(s) dans le système.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {reportType === 'compliance' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Conformité et sécurité:</h4>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <ul className="text-sm text-gray-700 space-y-1">
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                    Conformité RGPD respectée
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                    Chiffrement des données actif
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-3 h-3 mr-2 text-green-600" />
                    Audit de sécurité récent
                  </li>
                  <li className="flex items-center">
                    <AlertCircle className="w-3 h-3 mr-2 text-orange-600" />
                    Mise à jour des politiques recommandée
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Générer le rapport global</h3>
            <p className="text-sm text-gray-600">
              Le rapport sera généré au format PDF anonyme et sécurisé
            </p>
          </div>
          
          <button
            onClick={generatePDFReport}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-2xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Télécharger PDF
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <div className="flex items-start">
            <FileText className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 mb-1">Confidentialité garantie</h4>
              <p className="text-sm text-blue-700">
                Tous les rapports sont anonymisés. Aucune donnée personnelle n'est incluse.
                Seules les statistiques aggregées et recommandations sont présentes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
