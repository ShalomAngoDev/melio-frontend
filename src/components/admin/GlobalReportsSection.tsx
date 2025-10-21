import React, { useState } from 'react';
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
  AlertCircle
} from 'lucide-react';
import { useAlerts } from '../../contexts/AlertContext';

const schoolNames = {
  'COLLEGE2024': 'Collège Victor Hugo',
  'LYCEE2024': 'Lycée Jean Moulin'
};

export default function GlobalReportsSection() {
  const { getAlertStats } = useAlerts();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [reportType, setReportType] = useState('summary');
  const [selectedSchools, setSelectedSchools] = useState<string[]>(['COLLEGE2024', 'LYCEE2024']);

  const globalStats = getAlertStats();
  const collegeStats = getAlertStats('COLLEGE2024');
  const lyceeStats = getAlertStats('LYCEE2024');

  const generatePDFReport = () => {
    // Simulation de génération de PDF
    const reportData = {
      type: 'global',
      period: selectedPeriod,
      reportType: reportType,
      selectedSchools: selectedSchools,
      globalStats: globalStats,
      schoolStats: {
        COLLEGE2024: collegeStats,
        LYCEE2024: lyceeStats
      },
      generatedAt: new Date().toISOString()
    };

    // Créer un faux lien de téléchargement
    const dataStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(reportData, null, 2))}`;
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute('href', dataStr);
    downloadAnchorNode.setAttribute('download', `melio-rapport-global-${selectedPeriod}-${Date.now()}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();

    alert('Rapport global généré ! (Simulation - fichier JSON téléchargé)');
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

  const toggleSchool = (schoolCode: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolCode) 
        ? prev.filter(s => s !== schoolCode)
        : [...prev, schoolCode]
    );
  };

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
                { id: 'quarter', label: 'Ce trimestre' },
                { id: 'year', label: 'Cette année' }
              ].map((period) => (
                <label key={period.id} className="flex items-center">
                  <input
                    type="radio"
                    name="period"
                    value={period.id}
                    checked={selectedPeriod === period.id}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
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
            <div className="space-y-2">
              {Object.entries(schoolNames).map(([code, name]) => (
                <label key={code} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedSchools.includes(code)}
                    onChange={() => toggleSchool(code)}
                    className="mr-3 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">{name}</span>
                </label>
              ))}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {selectedSchools.length} école(s) sélectionnée(s)
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
                selectedPeriod === 'month' ? 'Ce mois' : 
                selectedPeriod === 'quarter' ? 'Ce trimestre' : 'Cette année'}
              </p>
              <p className="text-sm text-gray-500">
                Écoles: {selectedSchools.map(code => schoolNames[code as keyof typeof schoolNames]).join(', ')}
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
              <div className="text-2xl font-bold text-gray-800">{globalStats.total}</div>
              <div className="text-sm text-gray-600">Total alertes</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{globalStats.resolved}</div>
              <div className="text-sm text-gray-600">Résolues</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{globalStats.unresolved}</div>
              <div className="text-sm text-gray-600">En cours</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{selectedSchools.length}</div>
              <div className="text-sm text-gray-600">Écoles</div>
            </div>
          </div>

          {/* School Comparison Preview */}
          {reportType === 'summary' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Comparaison des écoles:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedSchools.map(schoolCode => {
                  const stats = schoolCode === 'COLLEGE2024' ? collegeStats : lyceeStats;
                  return (
                    <div key={schoolCode} className="bg-white rounded-xl p-4 border border-gray-200">
                      <h5 className="font-medium text-gray-800 mb-2">
                        {schoolNames[schoolCode as keyof typeof schoolNames]}
                      </h5>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Alertes:</span>
                          <span className="font-medium">{stats.total}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Résolues:</span>
                          <span className="font-medium text-green-600">{stats.resolved}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Critiques:</span>
                          <span className="font-medium text-red-600">{stats.byRiskLevel.critical || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taux:</span>
                          <span className="font-medium">
                            {stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                          </span>
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
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h5 className="font-medium text-gray-800 mb-2">Recommandations par école:</h5>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Collège Victor Hugo: Renforcer la prévention en 6ème</li>
                  <li>• Lycée Jean Moulin: Améliorer le suivi des alertes moyennes</li>
                  <li>• Formation continue des équipes pédagogiques</li>
                </ul>
              </div>
            </div>
          )}

          {reportType === 'trends' && (
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-800">Tendances observées:</h4>
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center mb-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                  <span className="text-sm font-medium text-gray-800">Évolution positive</span>
                </div>
                <p className="text-sm text-gray-700">
                  Le taux de résolution global s'améliore (+15% ce mois). 
                  Les alertes critiques diminuent dans toutes les écoles.
                </p>
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
