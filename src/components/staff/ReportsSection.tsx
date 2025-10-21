import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  RefreshCw,
  AlertCircle,
  Shield
} from 'lucide-react';
import { reportService, Report, ReportStats } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ReportsSectionProps {
  onReportsViewed?: () => void;
  schoolId: string;
}

export default function ReportsSection({ schoolId }: ReportsSectionProps) {
  const { showSuccess, showError } = useToast();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('NOUVEAU');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);

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

  // Effect for pagination - INSTANTANÉ
  useEffect(() => {
    applyPagination();
  }, [currentPage, filteredReports]);

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

  // Filtrage local instantané
  const applyFilter = () => {
    if (!allReports.length) return;
    
    let filtered = allReports;
    
    // Filtrer par statut
    if (selectedStatus) {
      filtered = filtered.filter(report => report.status === selectedStatus);
    }
    
    // Filtrer par urgence
    if (selectedUrgency) {
      filtered = filtered.filter(report => report.urgency === selectedUrgency);
    }
    
    // Éviter les re-renders inutiles
    setFilteredReports(prev => {
      if (JSON.stringify(prev) === JSON.stringify(filtered)) {
        return prev;
      }
      return filtered;
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination locale instantanée
  const applyPagination = () => {
    if (!filteredReports.length) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReports = filteredReports.slice(startIndex, endIndex);
    
    // Éviter les re-renders inutiles
    setReports(prev => {
      if (JSON.stringify(prev) === JSON.stringify(paginatedReports)) {
        return prev;
      }
      return paginatedReports;
    });
  };

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

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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
            {reports.length} signalement(s) affiché(s)
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

      {reports.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20">
          <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Aucun signalement</h3>
          <p className="text-sm text-gray-500">
            {selectedStatus ? `Aucun signalement avec le statut "${selectedStatus}"` : 'Aucun signalement trouvé'}
          </p>
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contenu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Urgence</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Auteur</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.map((report) => (
                  <tr 
                    key={report.id}
                    className="hover:bg-purple-50/50 transition-colors"
                  >
                    {/* ID */}
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono text-gray-600">
                        #{report.id.substring(0, 8)}
                      </span>
                    </td>

                    {/* Contenu */}
                    <td className="px-4 py-3 max-w-md">
                      <p className="text-sm text-gray-700 line-clamp-2">{report.content}</p>
                    </td>

                    {/* Urgence */}
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getUrgencyColor(report.urgency)}`}>
                        {getUrgencyLabel(report.urgency)}
                      </span>
                    </td>

                    {/* Auteur (Anonyme ou nom de l'élève) */}
                    <td className="px-4 py-3">
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
                          <div className="text-xs">
                            <div className="font-medium text-gray-800">
                              {report.student?.firstName && report.student?.lastName 
                                ? `${report.student.firstName} ${report.student.lastName}`
                                : 'Élève'
                              }
                            </div>
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Statut */}
                    <td className="px-4 py-3">
                      <select
                        value={report.status}
                        onChange={(e) => handleStatusUpdate(report.id, e.target.value as 'NOUVEAU' | 'EN_COURS' | 'TRAITE')}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${getStatusColor(report.status)}`}
                      >
                        <option value="NOUVEAU">Nouveau</option>
                        <option value="EN_COURS">En cours</option>
                        <option value="TRAITE">Traité</option>
                      </select>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR')}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                        className="px-3 py-1 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg text-xs font-medium transition-all"
                      >
                        {expandedReport === report.id ? 'Masquer' : 'Détails'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Détails expandés en dessous de la table */}
          {expandedReport && reports.find(r => r.id === expandedReport) && (
            <div className="border-t border-gray-200 bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Contenu complet</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {reports.find(r => r.id === expandedReport)?.content}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination simple */}
      {totalPages > 1 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/20">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Page {currentPage} / {totalPages}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg disabled:opacity-50 transition-all"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-1.5 bg-gray-100 hover:bg-purple-100 text-gray-700 hover:text-purple-700 rounded-lg disabled:opacity-50 transition-all"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}