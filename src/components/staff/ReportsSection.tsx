import { useState, useEffect } from 'react';
import { 
  Megaphone, 
  Eye, 
  EyeOff, 
  Filter, 
  RefreshCw,
  Calendar,
  TrendingUp,
  Shield,
  AlertCircle,
  User,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { reportService, Report, ReportStats } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

interface ReportsSectionProps {
  onReportsViewed?: () => void;
}

export default function ReportsSection({ onReportsViewed }: ReportsSectionProps) {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('NOUVEAU');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(() => {
    const saved = localStorage.getItem('reports-showFilters');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(22);

  const schoolId = user?.schoolId || '';

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

  // Sauvegarder l'état des filtres dans localStorage
  useEffect(() => {
    localStorage.setItem('reports-showFilters', JSON.stringify(showFilters));
  }, [showFilters]);

  // Effect for filtering - INSTANTANÉ
  useEffect(() => {
    applyFilter();
  }, [selectedStatus, allReports]);

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
    
    if (selectedStatus) {
      filtered = allReports.filter(report => report.status === selectedStatus);
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
      case 'NOUVEAU': return 'bg-red-50 border-red-200';
      case 'EN_COURS': return 'bg-orange-50 border-orange-200';
      case 'TRAITE': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return <AlertCircle className="w-4 h-4 text-red-600" />;
      case 'EN_COURS': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'TRAITE': return <CheckCircle className="w-4 h-4 text-green-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Megaphone className="w-8 h-8 text-blue-500 mr-3" />
          <div>
              <h2 className="text-2xl font-bold text-gray-800">Signalements</h2>
              <p className="text-gray-600">Gestion des signalements des élèves</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => { loadReports(); loadStats(); }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
              title="Filtres"
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtres et Statistiques */}
      {showFilters && stats && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div 
              className={`text-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedStatus === 'NOUVEAU' 
                  ? 'bg-red-50 border-red-300 text-red-800' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleStatusFilter('NOUVEAU')}
            >
              <div className="text-2xl font-bold">{stats.nouveau}</div>
              <div className="text-sm">Nouveaux</div>
            </div>
            <div 
              className={`text-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedStatus === 'EN_COURS' 
                  ? 'bg-orange-50 border-orange-300 text-orange-800' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleStatusFilter('EN_COURS')}
            >
              <div className="text-2xl font-bold">{stats.enCours}</div>
              <div className="text-sm">En cours</div>
            </div>
            <div 
              className={`text-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                selectedStatus === 'TRAITE' 
                  ? 'bg-green-50 border-green-300 text-green-800' 
                  : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => handleStatusFilter('TRAITE')}
            >
              <div className="text-2xl font-bold">{stats.traite}</div>
              <div className="text-sm">Traités</div>
            </div>
          </div>
        </div>
      )}

      {/* Liste des signalements */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
            <div className="flex items-center">
              <XCircle className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {reports.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun signalement</h3>
            <p className="text-gray-600">
              {selectedStatus ? `Aucun signalement avec le statut "${selectedStatus}"` : 'Aucun signalement trouvé'}
            </p>
                </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  {/* Contenu principal */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <Megaphone className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-600">
                        #{report.id.substring(0, 8)}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(report.urgency)}`}>
                        {getUrgencyLabel(report.urgency)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDate(report.createdAt)}
                      </span>
                </div>
                    
                    <p className="text-sm text-gray-800 mb-2 line-clamp-2">
                      {report.content}
                    </p>
                    
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span>{report.anonymous ? 'Anonyme' : `Élève ID: ${report.studentId?.substring(0, 8)}...`}</span>
                </div>
                      <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{new Date(report.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-2 ml-4">
                    <select
                      value={report.status}
                      onChange={(e) => handleStatusUpdate(report.id, e.target.value as 'NOUVEAU' | 'EN_COURS' | 'TRAITE')}
                      className={`px-3 py-1 rounded-lg text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(report.status)}`}
                    >
                      <option value="NOUVEAU">Nouveau</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="TRAITE">Traité</option>
                    </select>
                    
                    <button
                      onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                      className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title={expandedReport === report.id ? 'Masquer les détails' : 'Voir les détails'}
                    >
                      {expandedReport === report.id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
            </div>
                </div>

                {/* Détails expandés */}
                {expandedReport === report.id && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-sm text-gray-700 leading-relaxed">{report.content}</p>
              </div>
            </div>
          )}
        </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 mt-4">
        <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} • {reports.length} signalement(s) sur cette page
          </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <span className="px-3 py-2 text-sm text-gray-600">
                {currentPage} / {totalPages}
              </span>
          <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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