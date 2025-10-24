import { useState, useEffect } from 'react';
import {
  Megaphone, 
  RefreshCw,
  AlertCircle,
  Shield,
  X
} from 'lucide-react';
import { reportService, Report, ReportStats } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SimpleVirtualizedList from '../common/SimpleVirtualizedList';

interface ReportsSectionProps {
  onReportsViewed?: () => void;
  schoolId: string;
}

export default function ReportsSection({ schoolId }: ReportsSectionProps) {
  const { showSuccess, showError } = useToast();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('NOUVEAU');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);


  useEffect(() => {
    if (schoolId) {
      const initializeData = async () => {
        await Promise.all([loadReports(), loadStats()]);
      };
      initializeData();
      // Ne pas notifier immédiatement que les signalements ont été vus
      // Le badge doit rester visible jusqu'à ce que l'agent consulte réellement
    }
  }, [schoolId]);

  // Effect for filtering - INSTANTANÉ
  useEffect(() => {
    applyFilter();
  }, [selectedStatus, selectedUrgency, allReports]);

  // Fonction de filtrage
  const applyFilter = () => {
    let filtered = [...allReports];

    // Filtrer par statut
    if (selectedStatus) {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }

    // Filtrer par urgence
    if (selectedUrgency) {
      filtered = filtered.filter(report => report.urgency === selectedUrgency);
    }

    setFilteredReports(filtered);
  };


  // Mise à jour automatique des signalements toutes les 30 secondes
  useEffect(() => {
    if (!schoolId) return;

    const interval = setInterval(async () => {
      try {
        // Recharger les données en arrière-plan sans déclencher les effets
        const data = await reportService.getReports(schoolId, undefined);
        
        // Éviter les re-renders inutiles
        setAllReports(prev => {
          if (JSON.stringify(prev) === JSON.stringify(data)) {
            return prev;
          }
          return data;
        });
        
        const statsData = await reportService.getReportStats(schoolId);
        setStats(prev => {
          if (JSON.stringify(prev) === JSON.stringify(statsData)) {
            return prev;
          }
          return statsData;
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour automatique:', error);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [schoolId]);

  const loadReports = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Charger TOUS les signalements une seule fois
      const data = await reportService.getReports(schoolId, undefined); // Utiliser le schoolId de l'utilisateur
      console.log(`Loaded ${data.length} reports`);
      setAllReports(data);
    } catch (err: any) {
      console.error('Failed to load reports:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des signalements');
    } finally {
      setIsLoading(false);
    }
  };


  const loadStats = async () => {
    try {
      const data = await reportService.getReportStats(schoolId);
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };


  // Pagination locale instantanée

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    // Le filtrage se fait automatiquement via useEffect
  };

  // Calculer les stats d'urgence en fonction du statut sélectionné
  const getUrgencyStats = () => {
    const reportsToCount = selectedStatus 
      ? allReports.filter(r => r.status === selectedStatus)
      : allReports;
    
    return {
      CRITICAL: reportsToCount.filter(r => r.urgency === 'CRITICAL').length,
      HIGH: reportsToCount.filter(r => r.urgency === 'HIGH').length,
      MEDIUM: reportsToCount.filter(r => r.urgency === 'MEDIUM').length,
      LOW: reportsToCount.filter(r => r.urgency === 'LOW').length,
    };
  };

  const handleStatusUpdate = async (reportId: string, newStatus: 'NOUVEAU' | 'EN_COURS' | 'TRAITE') => {
    try {
      await reportService.updateReport(reportId, schoolId, newStatus);
      await loadReports();
      await loadStats();
      
      const statusLabels = {
        'NOUVEAU': 'Nouveau',
        'EN_COURS': 'En cours',
        'TRAITE': 'Traité'
      };
      showSuccess(`Signalement marqué comme "${statusLabels[newStatus]}" avec succès`);
    } catch (err: any) {
      console.error('Failed to update report status:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      showError(errorMessage);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'LOW': return 'Faible';
      case 'MEDIUM': return 'Moyen';
      case 'HIGH': return 'Élevé';
      case 'CRITICAL': return 'Très urgent';
      default: return urgency;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return 'bg-red-100 text-red-700';
      case 'EN_COURS': return 'bg-orange-100 text-orange-700';
      case 'TRAITE': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des signalements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats en header compact */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {allReports.length} signalement(s) affiché(s)
          </div>
          <button
            onClick={() => { loadReports(); loadStats(); }}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Actualiser"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtres compacts */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
        {/* Filtre par statut */}
        <div className="mb-3">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Statut
          </label>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleStatusFilter('')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === ''
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous • {stats?.total || 0}
            </button>
            <button
              onClick={() => handleStatusFilter('NOUVEAU')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === 'NOUVEAU'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nouveaux • {stats?.nouveau || 0}
            </button>
            <button
              onClick={() => handleStatusFilter('EN_COURS')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === 'EN_COURS'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En cours • {stats?.enCours || 0}
            </button>
            <button
              onClick={() => handleStatusFilter('TRAITE')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === 'TRAITE'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Traités • {stats?.traite || 0}
            </button>
          </div>
        </div>

        {/* Filtre par urgence */}
        <div className="pt-3 border-t border-gray-200">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Niveau d'urgence {selectedStatus && <span className="text-gray-400">({selectedStatus})</span>}
          </label>
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setSelectedUrgency('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedUrgency === ''
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes urgences
            </button>
            {getUrgencyStats().CRITICAL > 0 && (
              <button
                onClick={() => setSelectedUrgency('CRITICAL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedUrgency === 'CRITICAL'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }`}
              >
                Critique • {getUrgencyStats().CRITICAL}
              </button>
            )}
            {getUrgencyStats().HIGH > 0 && (
              <button
                onClick={() => setSelectedUrgency('HIGH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedUrgency === 'HIGH'
                    ? 'bg-orange-600 text-white'
                    : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                }`}
              >
                Élevée • {getUrgencyStats().HIGH}
              </button>
            )}
            {getUrgencyStats().MEDIUM > 0 && (
              <button
                onClick={() => setSelectedUrgency('MEDIUM')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedUrgency === 'MEDIUM'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                }`}
              >
                Moyenne • {getUrgencyStats().MEDIUM}
              </button>
            )}
            {getUrgencyStats().LOW > 0 && (
              <button
                onClick={() => setSelectedUrgency('LOW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedUrgency === 'LOW'
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                }`}
              >
                Faible • {getUrgencyStats().LOW}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Liste des signalements - Vue Table Compacte */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {filteredReports.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun signalement</h3>
          <p className="text-sm text-gray-500">
            {selectedStatus ? `Aucun signalement avec le statut "${selectedStatus}"` : 'Aucun signalement trouvé'}
          </p>
        </div>
      ) : (
        <SimpleVirtualizedList<Report>
          items={filteredReports}
          height={600}
          itemHeight={80}
          renderItem={({ item: report }) => (
            <div 
              key={report.id}
              onClick={() => {
                setSelectedReport(report);
                setShowDetailModal(true);
              }}
              className="hover:bg-purple-50/50 transition-colors cursor-pointer border-b border-gray-200 p-4 h-20 flex items-center"
            >
              <div className="flex items-center w-full">
                {/* ID - Largeur fixe */}
                <div className="w-20 text-center">
                  <span className="text-xs font-mono text-gray-600">
                    #{report.id.substring(0, 8)}
                  </span>
                </div>

                {/* Contenu - Largeur fixe */}
                <div className="flex-1 mx-4 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-2 truncate">{report.content}</p>
                </div>

                {/* Urgence - Largeur fixe */}
                <div className="w-24 flex justify-center">
                  <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getUrgencyColor(report.urgency)}`}>
                    {getUrgencyLabel(report.urgency)}
                  </span>
                </div>

                {/* Auteur - Largeur fixe */}
                <div className="w-32 flex justify-center">
                  {report.anonymous ? (
                    <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                      <Shield className="w-3 h-3 mr-1" />
                      Anonyme
                    </span>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {report.student?.firstName?.[0] || 'E'}{report.student?.lastName?.[0] || ''}
                      </div>
                      <div className="text-xs min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {report.student?.firstName && report.student?.lastName 
                            ? `${report.student.firstName} ${report.student.lastName}`
                            : 'Élève'
                          }
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Date - Largeur fixe */}
                <div className="w-20 text-xs text-gray-600 text-center">
                  {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                </div>

                {/* Statut - Largeur fixe */}
                <div className="w-28 flex justify-center">
                  <select
                    value={report.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusUpdate(report.id, e.target.value as 'NOUVEAU' | 'EN_COURS' | 'TRAITE');
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(report.status)}`}
                  >
                    <option value="NOUVEAU">Nouveau</option>
                    <option value="EN_COURS">En cours</option>
                    <option value="TRAITE">Traité</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        />
      )}

      {/* Modal de détails du signalement */}
      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800">Détails du signalement</h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenu du signalement */}
              <div className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">ID</label>
                    <p className="text-sm text-gray-800 font-mono">#{selectedReport.id.substring(0, 8)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Date</label>
                    <p className="text-sm text-gray-800">
                      {new Date(selectedReport.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Auteur */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Auteur</label>
                  <div className="mt-1">
                    {selectedReport.anonymous ? (
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Signalement anonyme</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {selectedReport.student?.firstName?.[0] || 'E'}{selectedReport.student?.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {selectedReport.student?.firstName && selectedReport.student?.lastName 
                              ? `${selectedReport.student.firstName} ${selectedReport.student.lastName}`
                              : 'Élève'
                            }
                          </p>
                          {selectedReport.student?.className && (
                            <p className="text-xs text-gray-500">{selectedReport.student.className}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contenu */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Contenu du signalement</label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{selectedReport.content}</p>
                  </div>
                </div>

                {/* Urgence */}
                <div>
                  <label className="text-sm font-medium text-gray-500">Niveau d'urgence</label>
                  <div className="mt-1">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${getUrgencyColor(selectedReport.urgency)}`}>
                      {getUrgencyLabel(selectedReport.urgency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => {
                    handleStatusUpdate(selectedReport.id, selectedReport.status === 'NOUVEAU' ? 'EN_COURS' : 'TRAITE');
                    setShowDetailModal(false);
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {selectedReport.status === 'NOUVEAU' ? 'Prendre en charge' : 'Marquer comme traité'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}