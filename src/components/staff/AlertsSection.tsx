import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  Filter, 
  RefreshCw,
  Calendar,
  TrendingUp,
  Shield,
  AlertCircle
} from 'lucide-react';
import { alertService, Alert, AlertStats } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface AlertsSectionProps {
  onAlertsViewed?: () => void;
}

export default function AlertsSection({ onAlertsViewed }: AlertsSectionProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('NOUVELLE');
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(() => {
    const saved = localStorage.getItem('alerts-showFilters');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(22);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [comment, setComment] = useState('');
  const [alertComments, setAlertComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [editCommentText, setEditCommentText] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCommentId, setSelectedCommentId] = useState<string | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([loadAlerts(), loadStats()]);
    };
    initializeData();
  }, []); // Only load on component mount

  // Sauvegarder l'état des filtres dans localStorage
  useEffect(() => {
    localStorage.setItem('alerts-showFilters', JSON.stringify(showFilters));
  }, [showFilters]);

  // Effect for filtering and pagination - INSTANTANÉ
  useEffect(() => {
    applyFilter();
  }, [selectedStatus, allAlerts]);

  useEffect(() => {
    applyPagination();
  }, [currentPage, filteredAlerts]);

  // Filtrage local INSTANTANÉ
  const applyFilter = () => {
    if (!allAlerts.length) return;
    
    let filtered = allAlerts;
    
    if (selectedStatus) {
      filtered = allAlerts.filter(alert => alert.status === selectedStatus);
    }
    
    // Éviter les re-renders inutiles
    setFilteredAlerts(prev => {
      if (JSON.stringify(prev) === JSON.stringify(filtered)) {
        return prev;
      }
      return filtered;
    });
    setCurrentPage(1); // Reset to first page when filtering
  };

  // Pagination locale INSTANTANÉE
  const applyPagination = () => {
    if (!filteredAlerts.length) return;
    
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedAlerts = filteredAlerts.slice(startIndex, endIndex);
    
    // Éviter les re-renders inutiles
    setAlerts(prev => {
      if (JSON.stringify(prev) === JSON.stringify(paginatedAlerts)) {
        return prev;
      }
      return paginatedAlerts;
    });
  };

  const loadAlerts = async (isInitialLoad = true) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Charger TOUTES les alertes une seule fois
      const data = await alertService.getAlerts(undefined, 1000, 0); // Récupérer toutes les alertes
      console.log(`Loaded ${data.length} alerts`);
      setAllAlerts(data);
      
      // Notifier que les alertes ont été vues
      if (onAlertsViewed) {
        onAlertsViewed();
      }
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des alertes');
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  const loadStats = async () => {
    try {
      const data = await alertService.getAlertStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };



  const handleStatusChange = (alertId: string, status: 'NOUVELLE' | 'EN_COURS' | 'TRAITEE') => {
    setSelectedAlertId(alertId);
    setNewStatus(status);
    setComment('');
    setShowCommentModal(true);
  };

  const submitStatusChange = async () => {
    if (!selectedAlertId || !comment.trim()) {
      setError('Le commentaire est obligatoire');
      showWarning('Le commentaire est obligatoire pour modifier le statut');
      return;
    }

    try {
      await alertService.updateAlertStatusWithComment(
        selectedAlertId, 
        newStatus as 'NOUVELLE' | 'EN_COURS' | 'TRAITEE', 
        comment
      );
      
      // Recharger les données pour s'assurer que tout est synchronisé (sans loading)
      await Promise.all([loadAlerts(false), loadStats()]);
      
      setShowCommentModal(false);
      setSelectedAlertId(null);
      setNewStatus('');
      setComment('');
      
      // Notification de succès
      const statusLabels = {
        'NOUVELLE': 'Nouvelle',
        'EN_COURS': 'En cours',
        'TRAITEE': 'Traitée'
      };
      showSuccess(`Alerte marquée comme "${statusLabels[newStatus as keyof typeof statusLabels]}" avec succès`);
    } catch (err: any) {
      console.error('Failed to update alert status:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    // Le filtrage se fait automatiquement via useEffect
  };

  const loadAlertComments = async (alertId: string) => {
    setLoadingComments(true);
    try {
      const comments = await alertService.getAlertComments(alertId);
      setAlertComments(comments);
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      setError(err.response?.data?.message || 'Erreur lors du chargement des commentaires');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setSelectedCommentId(commentId);
    setEditCommentText(currentText);
    setShowEditModal(true);
  };

  const submitEditComment = async () => {
    if (!selectedCommentId || !editCommentText.trim()) {
      setError('Le commentaire ne peut pas être vide');
      showWarning('Le commentaire ne peut pas être vide');
      return;
    }

    try {
      // Note: Cette fonctionnalité nécessiterait un endpoint backend pour modifier les commentaires
      // Pour l'instant, on simule la mise à jour côté client
      setAlertComments(prev => prev.map(comment => 
        comment.id === selectedCommentId 
          ? { ...comment, comment: editCommentText }
          : comment
      ));
      
      setShowEditModal(false);
      setSelectedCommentId(null);
      setEditCommentText('');
      showSuccess('Commentaire modifié avec succès');
    } catch (err: any) {
      console.error('Failed to edit comment:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la modification du commentaire';
      setError(errorMessage);
      showError(errorMessage);
    }
  };

  const handleQuickStatusChange = async (alertId: string, newStatus: 'NOUVELLE' | 'EN_COURS' | 'TRAITEE') => {
    setSelectedAlertId(alertId);
    setNewStatus(newStatus);
    setComment('');
    setShowCommentModal(true);
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'CRITIQUE': return 'text-red-600 bg-red-100 border-red-200';
      case 'ELEVE': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'MOYEN': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'FAIBLE': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };


  // Fonction pour obtenir les couleurs de carte selon le statut
  const getCardColors = (status: string) => {
    switch (status) {
      case 'NOUVELLE': 
        return {
          card: 'bg-white/80 border-l-4 border-red-300',
          header: 'bg-white/20',
          badge: 'text-red-600 bg-red-100/80 border-red-200',
          button: 'bg-red-400 hover:bg-red-500 text-white'
        };
      case 'EN_COURS': 
        return {
          card: 'bg-white/80 border-l-4 border-orange-300',
          header: 'bg-white/20',
          badge: 'text-orange-600 bg-orange-100/80 border-orange-200',
          button: 'bg-orange-400 hover:bg-orange-500 text-white'
        };
      case 'TRAITEE': 
        return {
          card: 'bg-white/80 border-l-4 border-emerald-300',
          header: 'bg-white/20',
          badge: 'text-emerald-600 bg-emerald-100/80 border-emerald-200',
          button: 'bg-emerald-400 hover:bg-emerald-500 text-white'
        };
      default: 
        return {
          card: 'bg-white/80 border-l-4 border-gray-300',
          header: 'bg-white/20',
          badge: 'text-gray-600 bg-gray-100/80 border-gray-200',
          button: 'bg-gray-400 hover:bg-gray-500 text-white'
        };
    }
  };

  const getMoodIcon = (mood: string) => {
    switch (mood) {
      case 'TRES_TRISTE': return '😢';
      case 'TRISTE': return '😔';
      case 'NEUTRE': return '😐';
      case 'CONTENT': return '😊';
      case 'TRES_HEUREUX': return '😄';
      default: return '😐';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NOUVELLE': return 'Nouvelle';
      case 'EN_COURS': return 'En cours';
      case 'TRAITEE': return 'Traitée';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="text-center p-8 bg-white/60 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20">
        <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Chargement des alertes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center">
        <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Alertes de sécurité</h2>
              <p className="text-gray-600">Gestion des alertes de sécurité des élèves</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadAlerts}
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
            <button
              onClick={() => handleStatusFilter('')}
              className={`rounded-xl p-3 text-center border transition-all duration-200 ${
                selectedStatus === ''
                  ? 'bg-gray-200 border-gray-300 shadow-md'
                  : 'bg-white/80 border-white/20 hover:bg-gray-50'
              }`}
            >
              <div className="text-lg font-bold text-gray-800">{stats.total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </button>
            <button
              onClick={() => handleStatusFilter('NOUVELLE')}
              className={`rounded-xl p-3 text-center border transition-all duration-200 ${
                selectedStatus === 'NOUVELLE'
                  ? 'bg-gradient-to-r from-red-100/90 to-red-200/70 border-red-300 shadow-md'
                  : 'bg-gradient-to-r from-red-50/80 to-red-100/60 border-red-200 hover:from-red-100/90 hover:to-red-150/80'
              }`}
            >
              <div className="text-lg font-bold text-red-700">{stats.nouvelles}</div>
              <div className="text-xs text-red-600 font-medium">Nouvelles</div>
            </button>
            <button
              onClick={() => handleStatusFilter('EN_COURS')}
              className={`rounded-xl p-3 text-center border transition-all duration-200 ${
                selectedStatus === 'EN_COURS'
                  ? 'bg-gradient-to-r from-orange-100/90 to-orange-200/70 border-orange-300 shadow-md'
                  : 'bg-gradient-to-r from-orange-50/80 to-orange-100/60 border-orange-200 hover:from-orange-100/90 hover:to-orange-150/80'
              }`}
            >
              <div className="text-lg font-bold text-orange-700">{stats.enCours}</div>
              <div className="text-xs text-orange-600 font-medium">En cours</div>
            </button>
            <button
              onClick={() => handleStatusFilter('TRAITEE')}
              className={`rounded-xl p-3 text-center border transition-all duration-200 ${
                selectedStatus === 'TRAITEE'
                  ? 'bg-gradient-to-r from-emerald-100/90 to-emerald-200/70 border-emerald-300 shadow-md'
                  : 'bg-gradient-to-r from-emerald-50/80 to-emerald-100/60 border-emerald-200 hover:from-emerald-100/90 hover:to-emerald-150/80'
              }`}
            >
              <div className="text-lg font-bold text-emerald-700">{stats.traitees}</div>
              <div className="text-xs text-emerald-600 font-medium">Traitées</div>
            </button>
            </div>
          </div>
        )}


      {/* Liste des alertes */}
      <div className="flex-1 overflow-y-auto">
        {/* Indicateur de chargement simple */}
        {isLoading && (
          <div className="absolute top-0 left-0 right-0 z-20 bg-white/90 backdrop-blur-sm rounded-lg p-4 flex items-center justify-center shadow-lg">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mr-2" />
            <span className="text-gray-700">Chargement...</span>
          </div>
        )}
        
        {alerts.length === 0 && !isLoading ? (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 text-center shadow-lg border border-white/20">
            <Shield className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h3 className="text-base font-medium text-gray-700 mb-1">Aucune alerte</h3>
            <p className="text-sm text-gray-500">Aucune alerte de sécurité détectée pour le moment.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
            const colors = getCardColors(alert.status);
            return (
              <div
                key={alert.id}
                className={`${colors.card} backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden hover:shadow-xl transition-all duration-200`}
              >
              {/* Header compact */}
              <div className={`p-3 ${colors.header}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{getMoodIcon(alert.childMood)}</span>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-800">
                        {alert.student.firstName} {alert.student.lastName}
                      </h3>
                      <p className="text-xs text-gray-600">{alert.student.className}</p>
                          </div>
                      </div>

                  <div className="flex items-center space-x-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getRiskLevelColor(alert.riskLevel)}`}>
                      {alert.riskLevel} ({alert.riskScore}/100)
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${colors.badge}`}>
                      {getStatusText(alert.status)}
                    </span>
                        </div>
                        </div>

                {/* Résumé compact */}
                <div className="mb-2">
                  <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                    <h4 className="text-xs font-semibold text-blue-800 mb-1 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Analyse IA
                    </h4>
                    <p className="text-blue-700 text-xs leading-relaxed line-clamp-2">{alert.aiSummary}</p>
                        </div>
                      </div>

                {/* Actions compactes */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-xs text-gray-500">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(alert.createdAt)}
                      </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const newExpandedAlert = expandedAlert === alert.id ? null : alert.id;
                        setExpandedAlert(newExpandedAlert);
                        if (newExpandedAlert) {
                          loadAlertComments(alert.id);
                        }
                      }}
                      className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center"
                    >
                      {expandedAlert === alert.id ? (
                        <>
                          <EyeOff className="w-3 h-3 mr-1" />
                          Masquer
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3 mr-1" />
                          Détails
                        </>
                      )}
                    </button>
                    
                    {alert.status === 'NOUVELLE' && (
                      <button
                        onClick={() => handleStatusChange(alert.id, 'EN_COURS')}
                        className={`px-3 py-1 ${colors.button} rounded-lg transition-all duration-200 text-xs font-medium`}
                      >
                        Prendre en charge
                      </button>
                    )}
                    
                    {alert.status === 'EN_COURS' && (
                        <button
                        onClick={() => handleStatusChange(alert.id, 'TRAITEE')}
                        className={`px-3 py-1 ${colors.button} rounded-lg transition-all duration-200 text-xs font-medium`}
                        >
                        Marquer comme traitée
                        </button>
                      )}
                  </div>
                </div>
              </div>

              {/* Détails étendus - Format compact */}
              {expandedAlert === alert.id && (
                <div className="border-t border-gray-200 bg-gray-50/50 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Informations élève</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><span className="font-medium">Nom :</span> {alert.student.firstName} {alert.student.lastName}</p>
                        <p><span className="font-medium">Classe :</span> {alert.student.className}</p>
                        <p><span className="font-medium">Humeur :</span> {alert.childMood}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-semibold text-gray-700 mb-2">Détails technique</h4>
                      <div className="space-y-1 text-xs text-gray-600">
                        <p><span className="font-medium">Source :</span> {alert.sourceType}</p>
                        <p><span className="font-medium">ID Source :</span> {alert.sourceId}</p>
                        <p><span className="font-medium">Score :</span> {alert.riskScore}/100</p>
                      </div>
                    </div>
                  </div>

                  {/* Recommandation détaillée */}
                  <div className="mt-3 bg-green-50 rounded-xl p-3 border border-green-200">
                    <h4 className="text-xs font-semibold text-green-800 mb-1 flex items-center">
                      <Shield className="w-3 h-3 mr-1" />
                      Recommandation
                    </h4>
                    <p className="text-green-700 text-xs leading-relaxed">{alert.aiAdvice}</p>
                  </div>

                  {/* Historique des commentaires */}
                  <div className="mt-3 bg-gray-50 rounded-xl p-3 border border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      Historique du suivi
                    </h4>
                    
                    {loadingComments ? (
                      <div className="flex items-center justify-center py-2">
                        <RefreshCw className="w-4 h-4 text-gray-400 animate-spin mr-2" />
                        <span className="text-xs text-gray-500">Chargement de l'historique...</span>
                      </div>
                    ) : alertComments.length === 0 ? (
                      <div className="text-center py-2">
                        <p className="text-xs text-gray-500">Aucun commentaire pour le moment</p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {alertComments.map((comment) => (
                          <div key={comment.id} className="bg-white rounded-lg p-2 border border-gray-200">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-medium text-gray-700">
                                  {comment.agentName}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1">
                                {comment.oldStatus && (
                                  <span className="text-xs text-gray-500">{comment.oldStatus}</span>
                                )}
                                {comment.oldStatus && (
                                  <span className="text-xs text-gray-400">→</span>
                                )}
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  comment.newStatus === 'NOUVELLE' ? 'bg-blue-100 text-blue-700' :
                                  comment.newStatus === 'EN_COURS' ? 'bg-orange-100 text-orange-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {comment.newStatus}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-start justify-between">
                              <p className="text-xs text-gray-600 leading-relaxed flex-1 mr-2">
                                {comment.comment}
                              </p>
                              
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleEditComment(comment.id, comment.comment)}
                                  className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                  title="Modifier le commentaire"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                
                                <button
                                  onClick={() => handleQuickStatusChange(alert.id, comment.newStatus === 'NOUVELLE' ? 'EN_COURS' : 'TRAITEE')}
                                  className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200"
                                  title="Changer le statut"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    </div>
                </div>
              )}
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredAlerts.length > itemsPerPage && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20 mt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {Math.ceil(filteredAlerts.length / itemsPerPage)} • {alerts.length} alerte(s) sur cette page
            </div>
            <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                const newPage = Math.max(1, currentPage - 1);
                setCurrentPage(newPage);
              }}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Précédent
            </button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, Math.ceil(filteredAlerts.length / itemsPerPage)) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => {
                      setCurrentPage(page);
                    }}
                    className={`px-2 py-1 text-xs rounded transition-all duration-200 ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => {
                setCurrentPage(currentPage + 1);
              }}
              disabled={currentPage >= Math.ceil(filteredAlerts.length / itemsPerPage)}
              className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Suivant
            </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de commentaire */}
      {showCommentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4" style={{ zIndex: 9999, minHeight: '100vh' }}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Modifier le statut de l'alerte
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nouveau statut
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
                {getStatusText(newStatus)}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire obligatoire *
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Expliquez les actions prises ou les raisons du changement de statut..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedAlertId(null);
                  setNewStatus('');
                  setComment('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={submitStatusChange}
                disabled={!comment.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition de commentaire */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4" style={{ zIndex: 9999, minHeight: '100vh' }}>
          <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-full mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Modifier le commentaire
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire *
              </label>
              <textarea
                value={editCommentText}
                onChange={(e) => setEditCommentText(e.target.value)}
                placeholder="Modifiez le commentaire..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                rows={4}
                required
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedCommentId(null);
                  setEditCommentText('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={submitEditComment}
                disabled={!editCommentText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Modifier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}