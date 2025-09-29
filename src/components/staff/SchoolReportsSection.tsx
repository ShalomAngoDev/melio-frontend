import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, BarChart3, Users, AlertTriangle, TrendingUp, Clock, Filter, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { alertService, reportService, statisticsService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { pdfGenerator } from '../../services/pdfGenerator';

interface ReportData {
  period: string;
  totalAlerts: number;
  newAlerts: number;
  inProgressAlerts: number;
  resolvedAlerts: number;
  totalReports: number;
  newReports: number;
  inProgressReports: number;
  resolvedReports: number;
  studentsCount: number;
  averageResponseTime: string;
  trends: {
    alerts: number[];
    reports: number[];
  };
  schoolInfo?: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
  };
  alertsByRiskLevel?: {
    CRITIQUE: number;
    ELEVE: number;
    MOYEN: number;
    FAIBLE: number;
  };
  reportsByUrgency?: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
}

export default function SchoolReportsSection() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [reportType, setReportType] = useState('summary');

  const periods = [
    { value: '7d', label: '7 derniers jours' },
    { value: '30d', label: '30 derniers jours' },
    { value: '90d', label: '3 derniers mois' },
    { value: '1y', label: '1 an' }
  ];

  const reportTypes = [
    { 
      value: 'summary', 
      label: 'Rapport de synthèse', 
      description: 'Vue d\'ensemble des activités',
      content: [
        '• Métriques principales (alertes, signalements, étudiants)',
        '• Répartition des alertes par niveau de risque',
        '• Répartition des signalements par urgence',
        '• Temps de réponse moyen',
        '• Graphiques de tendances sur la période sélectionnée',
        '• Recommandations générales'
      ]
    },
    { 
      value: 'detailed', 
      label: 'Rapport détaillé', 
      description: 'Analyse approfondie des données',
      content: [
        '• Toutes les métriques du rapport de synthèse',
        '• Analyse détaillée par classe',
        '• Évolution temporelle jour par jour',
        '• Analyse des patterns et corrélations',
        '• Détails des interventions et actions menées',
        '• Recommandations spécifiques par situation'
      ]
    },
    { 
      value: 'trends', 
      label: 'Rapport de tendances', 
      description: 'Évolution dans le temps',
      content: [
        '• Graphiques d\'évolution des alertes et signalements',
        '• Comparaison avec les périodes précédentes',
        '• Identification des pics d\'activité',
        '• Analyse saisonnière et cyclique',
        '• Prédictions et projections',
        '• Recommandations préventives'
      ]
    },
    { 
      value: 'compliance', 
      label: 'Rapport de conformité', 
      description: 'Respect des procédures',
      content: [
        '• Temps de traitement des alertes et signalements',
        '• Taux de résolution par type d\'incident',
        '• Respect des délais réglementaires',
        '• Qualité des interventions',
        '• Formation et sensibilisation',
        '• Recommandations d\'amélioration'
      ]
    }
  ];

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod]);

  const loadReportData = async () => {
    if (!user?.schoolId) return;
    
    setIsLoading(true);
    try {
      // Charger les données en parallèle
      const [generalStats, temporalStats, classStats, trends] = await Promise.all([
        statisticsService.getGeneralStats(user.schoolId),
        statisticsService.getTemporalStats(user.schoolId, 'month'),
        statisticsService.getClassStats(user.schoolId),
        statisticsService.getTrends(user.schoolId)
      ]);

      // Calculer les tendances pour la période sélectionnée
      const periodDays = selectedPeriod === '7d' ? 7 : selectedPeriod === '30d' ? 30 : selectedPeriod === '90d' ? 90 : 365;
      const alertsTrend = temporalStats.alerts.slice(-periodDays) || [];
      const reportsTrend = temporalStats.reports.slice(-periodDays) || [];

      const reportData: ReportData = {
        period: selectedPeriod,
        totalAlerts: generalStats.totalAlerts,
        newAlerts: generalStats.alertsByStatus?.NOUVELLE || 0,
        inProgressAlerts: generalStats.alertsByStatus?.EN_COURS || 0,
        resolvedAlerts: generalStats.alertsByStatus?.TRAITEE || 0,
        totalReports: generalStats.totalReports,
        newReports: generalStats.reportsByStatus?.NOUVEAU || 0,
        inProgressReports: generalStats.reportsByStatus?.EN_COURS || 0,
        resolvedReports: generalStats.reportsByStatus?.TRAITE || 0,
        studentsCount: generalStats.totalStudents,
        averageResponseTime: '2h 15min', // TODO: Calculer à partir des données réelles
        trends: {
          alerts: alertsTrend.map(d => d.critical + d.high + d.medium + d.low),
          reports: reportsTrend.map(d => d.critical + d.high + d.medium + d.low)
        },
        schoolInfo: {
          name: user.schoolName || 'École',
          address: 'Adresse de l\'école',
          city: 'Ville',
          postalCode: 'Code postal'
        },
        alertsByRiskLevel: generalStats.alertsByRiskLevel,
        reportsByUrgency: generalStats.reportsByUrgency
      };
      
      setReportData(reportData);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      showError('Erreur lors du chargement des données du rapport');
    } finally {
      setIsLoading(false);
    }
  };

  const generateReport = async () => {
    if (!reportData) {
      showError('Aucune donnée disponible pour générer le rapport');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Vérifier que les données essentielles existent
      if (typeof reportData.totalAlerts === 'undefined' || 
          typeof reportData.totalReports === 'undefined') {
        showError('Données de rapport incomplètes. Veuillez réessayer.');
        return;
      }
      
      // Générer le PDF avec le générateur
      pdfGenerator.generateReport(reportData, reportType, selectedPeriod);
      
      showSuccess('Rapport PDF généré avec succès !');
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
      showError(`Erreur lors de la génération du rapport: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-3"></div>
          <p className="text-gray-600">Génération du rapport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center mb-4">
          <FileText className="w-7 h-7 text-indigo-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-800">Rapports de synthèse</h2>
        </div>
        <p className="text-gray-600">Analysez les tendances et générez des rapports détaillés pour votre établissement</p>
      </div>

      {/* Configuration du rapport */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Configuration du rapport</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Période */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Période d'analyse</label>
            <div className="grid grid-cols-2 gap-2">
              {periods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => setSelectedPeriod(period.value)}
                  className={`px-3 py-2 rounded-xl text-sm border transition ${
                    selectedPeriod === period.value
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type de rapport */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type de rapport</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {reportTypes.map((type) => (
                <label
                  key={type.value}
                  className={`flex flex-col items-center p-4 rounded-xl border cursor-pointer transition-all duration-200 text-center ${
                    reportType === type.value
                      ? 'bg-indigo-50 border-indigo-200 shadow-md'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:shadow-sm'
                  }`}
                >
                  <input
                    type="radio"
                    name="reportType"
                    value={type.value}
                    checked={reportType === type.value}
                    onChange={(e) => setReportType(e.target.value)}
                    className="sr-only"
                  />
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                    <FileText className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-sm font-semibold text-gray-900 mb-1">{type.label}</div>
                  <div className="text-xs text-gray-600 leading-tight">{type.description}</div>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Aperçu du rapport sélectionné */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 shadow-lg border border-indigo-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FileText className="w-6 h-6 text-indigo-600 mr-3" />
            <h3 className="text-lg font-semibold text-gray-800">Aperçu du rapport</h3>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-500">Période</div>
              <div className="font-medium text-gray-800">{periods.find(p => p.value === selectedPeriod)?.label}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Format</div>
              <div className="font-medium text-indigo-600">PDF Professionnel</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-4">
              <FileText className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {reportTypes.find(t => t.value === reportType)?.label}
              </h4>
              <p className="text-sm text-gray-600">
                {reportTypes.find(t => t.value === reportType)?.description}
              </p>
            </div>
          </div>
          
          <div className="border-t pt-4">
            <div className="text-sm font-semibold text-gray-700 mb-3">Contenu détaillé du rapport :</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {reportTypes.find(t => t.value === reportType)?.content.map((item, index) => (
                <div key={index} className="flex items-start text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Données du rapport */}
      {reportData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertes */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Alertes</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-red-50 rounded-xl">
                <div className="text-2xl font-bold text-red-600">{reportData.totalAlerts}</div>
                <div className="text-sm text-red-700">Total</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <div className="text-2xl font-bold text-orange-600">{reportData.newAlerts}</div>
                <div className="text-sm text-orange-700">Nouvelles</div>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-xl">
                <div className="text-2xl font-bold text-yellow-600">{reportData.inProgressAlerts}</div>
                <div className="text-sm text-yellow-700">En cours</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{reportData.resolvedAlerts}</div>
                <div className="text-sm text-green-700">Résolues</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Temps de réponse moyen</span>
                <span className="font-medium">{reportData.averageResponseTime}</span>
              </div>
            </div>
          </div>

          {/* Signalements */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
            <div className="flex items-center mb-4">
              <FileText className="w-6 h-6 text-purple-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-800">Signalements</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-purple-50 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{reportData.totalReports}</div>
                <div className="text-sm text-purple-700">Total</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{reportData.newReports}</div>
                <div className="text-sm text-blue-700">Nouveaux</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-xl">
                <div className="text-2xl font-bold text-amber-600">{reportData.inProgressReports}</div>
                <div className="text-sm text-amber-700">En cours</div>
              </div>
              <div className="text-center p-3 bg-emerald-50 rounded-xl">
                <div className="text-2xl font-bold text-emerald-600">{reportData.resolvedReports}</div>
                <div className="text-sm text-emerald-700">Traités</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <div className="flex items-center justify-between">
                <span>Élèves concernés</span>
                <span className="font-medium">{reportData.studentsCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Graphique des tendances */}
      {reportData && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-800">Tendances sur 7 jours</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Alertes par jour</h4>
              <div className="flex items-end space-x-1 h-20">
                {reportData.trends.alerts.map((value, index) => (
                  <div
                    key={index}
                    className="bg-red-200 rounded-t flex-1 flex items-end justify-center"
                    style={{ height: `${(value / Math.max(...reportData.trends.alerts)) * 100}%` }}
                  >
                    <span className="text-xs text-red-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Signalements par jour</h4>
              <div className="flex items-end space-x-1 h-20">
                {reportData.trends.reports.map((value, index) => (
                  <div
                    key={index}
                    className="bg-purple-200 rounded-t flex-1 flex items-end justify-center"
                    style={{ height: `${(value / Math.max(...reportData.trends.reports)) * 100}%` }}
                  >
                    <span className="text-xs text-purple-700 font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Informations de conformité */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6">
        <div className="flex items-start">
          <FileText className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informations importantes :</p>
            <ul className="space-y-1 text-blue-700">
              <li>• Tous les rapports sont anonymisés et sécurisés</li>
              <li>• Les données personnelles ne sont jamais incluses</li>
              <li>• Les rapports respectent la RGPD et la confidentialité</li>
              <li>• Les métriques sont calculées en temps réel</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bouton de génération en bas */}
      {reportData && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Générer le rapport</h3>
            <p className="text-gray-600 mb-6">
              Toutes les données sont prêtes. Cliquez sur le bouton ci-dessous pour générer et télécharger votre rapport PDF.
            </p>
            <button
              onClick={generateReport}
              disabled={isLoading}
              className="inline-flex items-center px-8 py-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 text-lg font-medium shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                  Génération en cours...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-3" />
                  Générer le rapport PDF
                </>
              )}
            </button>
            <div className="mt-4 text-sm text-gray-500">
              Le rapport sera téléchargé automatiquement au format PDF
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
