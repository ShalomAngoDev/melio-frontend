import { useState, useEffect } from 'react';
import { 
  RefreshCw,
  Shield,
  Eye,
  AlertCircle,
  Brain,
  Calendar,
  MessageCircle,
  BookOpen
} from 'lucide-react';
import { alertService, Alert, AlertStats } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SimpleVirtualizedList from '../common/SimpleVirtualizedList';

interface AlertsSectionProps {
  onAlertsViewed?: () => void;
  schoolId: string;
}

export default function AlertsSection({ onAlertsViewed, schoolId }: AlertsSectionProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [allAlerts, setAllAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<AlertStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('NOUVELLE');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('');
  const [showCommentModal, setShowCommentModal] = useState(false);

  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [comment, setComment] = useState('');
  const [alertComments, setAlertComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      await loadAlerts();
      // Auto-filtrer sur les nouvelles alertes (pending) au chargement
      setSelectedStatus('pending');
    };
    initializeData();
  }, [schoolId]); // Recharger quand on change d'école

  // Recalculer les stats quand les alertes changent
  useEffect(() => {
    if (allAlerts && allAlerts.length >= 0) {
      loadStats();
    }
  }, [allAlerts]);

  // Effect for filtering and pagination - INSTANTANÉ
  useEffect(() => {
    applyFilter();
  }, [selectedStatus, selectedRiskLevel, allAlerts]);

  // Filtrage local INSTANTANÉ
  const applyFilter = () => {
    // S'assurer que allAlerts est un tableau
    if (!Array.isArray(allAlerts) || !allAlerts.length) {
      setFilteredAlerts([]);
      return;
    }
    
    let filtered = [...allAlerts];
    
    // Filtrer par statut (utiliser statusRaw en priorité, sinon status)
    if (selectedStatus) {
      filtered = filtered.filter(alert => {
        const rawStatus = (alert.statusRaw || alert.status || '').toLowerCase();
        const mappedStatus = (alert.status || '').toUpperCase();
        
        // Correspondance avec le statut sélectionné
        if (selectedStatus === 'pending') {
          return rawStatus === 'pending';
        } else if (selectedStatus === 'acknowledged') {
          return rawStatus === 'acknowledged';
        } else if (selectedStatus === 'resolved') {
          return rawStatus === 'resolved';
        } else if (selectedStatus === 'NOUVELLE') {
          return rawStatus === 'pending' || mappedStatus === 'NOUVELLE';
        } else if (selectedStatus === 'EN_COURS') {
          return rawStatus === 'acknowledged' || mappedStatus === 'EN_COURS';
        } else if (selectedStatus === 'TRAITEE') {
          return rawStatus === 'resolved' || mappedStatus === 'TRAITEE';
        }
        return false;
      });
    }
    
    // Filtrer par niveau de risque
    if (selectedRiskLevel) {
      filtered = filtered.filter(alert => {
        // Normaliser les accents pour la comparaison
        const normalize = (str: string) => str
          .toUpperCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
        
        const riskLevelRaw = alert.riskLevel || '';
        const levelRaw = alert.level || '';
        const selectedUpper = normalize(selectedRiskLevel);
        
        // Normaliser les deux champs
        const riskLevelNormalized = normalize(riskLevelRaw);
        const levelNormalized = normalize(levelRaw);
        
        // Mapping des niveaux (anglais: CRITICAL, HIGH, MEDIUM, LOW)
        if (selectedUpper === 'CRITIQUE' || selectedUpper === 'CRITICAL' || selectedUpper === 'T3') {
          return riskLevelNormalized === 'CRITICAL' || riskLevelNormalized === 'CRITIQUE' || levelNormalized === 'T3';
        } else if (selectedUpper === 'ELEVE' || selectedUpper === 'HIGH' || selectedUpper === 'T2') {
          // Support ancien format (ELEVE/ÉLEVÉ) et nouveau format (HIGH) ou T2
          return riskLevelNormalized === 'HIGH' || riskLevelNormalized === 'ELEVE' || levelNormalized === 'T2';
        } else if (selectedUpper === 'MOYEN' || selectedUpper === 'MEDIUM' || selectedUpper === 'T1') {
          return riskLevelNormalized === 'MEDIUM' || riskLevelNormalized === 'MOYEN' || levelNormalized === 'T1';
        } else if (selectedUpper === 'FAIBLE' || selectedUpper === 'LOW' || selectedUpper === 'T0') {
          return riskLevelNormalized === 'LOW' || riskLevelNormalized === 'FAIBLE' || levelNormalized === 'T0';
        }
        // Fallback: comparaison exacte
        return riskLevelNormalized === selectedUpper || levelNormalized === selectedUpper;
      });
    }
    
    setFilteredAlerts(filtered);
  };

  const loadAlerts = async (isInitialLoad = true) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Charger TOUTES les alertes pour l'école sélectionnée
      const data = await alertService.getAlerts(undefined, 1000, 0, schoolId); // V2: Passer schoolId
      console.log(`Loaded ${data?.length || 0} alerts`);
      setAllAlerts(data || []); // S'assurer que c'est toujours un tableau
      
      // Notifier que les alertes ont été vues
      if (onAlertsViewed) {
        onAlertsViewed();
      }
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des alertes');
      setAllAlerts([]); // En cas d'erreur, initialiser avec un tableau vide
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };


  const refreshAlerts = async () => {
    console.log('Refreshing alerts...');
    setIsLoading(true);
    setError(null);
    
    try {
      // Vider le cache local
      setAllAlerts([]);
      
      // Recharger les alertes
      await loadAlerts(false);
      
      // Fermer les détails d'alerte ouverts
      setAlertComments([]);
      setShowDetailModal(false);
      
      showSuccess('Alertes actualisées avec succès');
    } catch (err: any) {
      console.error('Failed to refresh alerts:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors de l\'actualisation des alertes');
      showError('Erreur lors de l\'actualisation des alertes');
    } finally {
      setIsLoading(false);
    }
  };


  const loadStats = async () => {
    try {
      // Calculer les stats à partir des alertes réelles chargées
      // pour utiliser le statut réel (statusRaw) au lieu du statut mappé
      if (allAlerts && allAlerts.length >= 0) {
        const statsCalculated = {
          total: allAlerts.length,
          nouvelles: allAlerts.filter(a => {
            const rawStatus = (a.statusRaw || a.status || '').toLowerCase();
            const mappedStatus = (a.status || '').toUpperCase();
            return rawStatus === 'pending' || mappedStatus === 'NOUVELLE';
          }).length,
          enCours: allAlerts.filter(a => {
            const rawStatus = (a.statusRaw || a.status || '').toLowerCase();
            const mappedStatus = (a.status || '').toUpperCase();
            return rawStatus === 'acknowledged' || mappedStatus === 'EN_COURS';
          }).length,
          traitees: allAlerts.filter(a => {
            const rawStatus = (a.statusRaw || a.status || '').toLowerCase();
            const mappedStatus = (a.status || '').toUpperCase();
            return rawStatus === 'resolved' || mappedStatus === 'TRAITEE';
          }).length,
          parNiveau: {
            T2: allAlerts.filter(a => {
              const level = (a.level || a.riskLevel || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return level === 'T2' || level === 'HIGH' || level === 'ELEVE';
            }).length,
            T3: allAlerts.filter(a => {
              const level = (a.level || a.riskLevel || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
              return level === 'T3' || level === 'CRITICAL' || level === 'CRITIQUE';
            }).length,
          }
        };
        setStats(statsCalculated);
      } else {
        // Si pas d'alertes chargées, utiliser l'API comme fallback
        const data = await alertService.getAlertStats(schoolId);
        setStats(data);
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err);
    }
  };



  const handleStatusChange = (alertId: string, status: 'pending' | 'acknowledged' | 'resolved' | 'NOUVELLE' | 'EN_COURS' | 'TRAITEE') => {
    // Vérifier que l'alerte existe encore
    const alertExists = allAlerts.find(alert => alert.id === alertId);
    if (!alertExists) {
      console.warn(`Alert ${alertId} no longer exists`);
      showWarning('Cette alerte n\'existe plus. Veuillez actualiser la page.');
      return;
    }
    
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

    // Mapper le statut vers le format API si nécessaire
    const mapStatusToApi = (status: string): 'pending' | 'acknowledged' | 'resolved' => {
      const normalized = status.toUpperCase();
      if (normalized === 'NOUVELLE' || normalized === 'PENDING') return 'pending';
      if (normalized === 'EN_COURS' || normalized === 'ACKNOWLEDGED') return 'acknowledged';
      if (normalized === 'TRAITEE' || normalized === 'RESOLVED') return 'resolved';
      return status as 'pending' | 'acknowledged' | 'resolved';
    };

    const apiStatus = mapStatusToApi(newStatus);

    try {
      // Le backend attend maintenant les statuts en anglais (pending, acknowledged, resolved)
      // Mais l'API accepte encore l'ancien format, donc on peut essayer les deux
      try {
        await alertService.updateAlertStatusWithComment(selectedAlertId, apiStatus, comment);
      } catch (e: any) {
        // Si l'erreur indique que le format n'est pas accepté, essayer l'ancien format
        if (e.response?.status === 400) {
          // Mapper vers l'ancien format français pour compatibilité
          const oldFormatStatus = apiStatus === 'pending' ? 'NOUVELLE' : 
                                  apiStatus === 'acknowledged' ? 'EN_COURS' : 'TRAITEE';
          await alertService.updateAlertStatusWithComment(selectedAlertId, oldFormatStatus as any, comment);
        } else {
          throw e;
        }
      }
      
      // Recharger les données pour s'assurer que tout est synchronisé (sans loading)
      await Promise.all([loadAlerts(false), loadStats()]);
      
      setShowCommentModal(false);
      setSelectedAlertId(null);
      setNewStatus('');
      setComment('');
      
      // Notification de succès avec traduction
      showSuccess(`Alerte marquée comme "${getStatusText(newStatus)}" avec succès`);
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

  // Calculer les stats de risque en fonction du statut sélectionné
  const getRiskStats = () => {
    // S'assurer que allAlerts est un tableau
    if (!Array.isArray(allAlerts)) {
      return { CRITIQUE: 0, ELEVE: 0, MOYEN: 0, FAIBLE: 0 };
    }
    
    // Filtrer par statut si sélectionné
    let alertsToCount = allAlerts;
    if (selectedStatus) {
      alertsToCount = allAlerts.filter(a => {
        const rawStatus = (a.statusRaw || a.status || '').toLowerCase();
        const mappedStatus = (a.status || '').toUpperCase();
        
        if (selectedStatus === 'pending') {
          return rawStatus === 'pending';
        } else if (selectedStatus === 'acknowledged') {
          return rawStatus === 'acknowledged';
        } else if (selectedStatus === 'resolved') {
          return rawStatus === 'resolved';
        } else if (selectedStatus === 'NOUVELLE') {
          return rawStatus === 'pending' || mappedStatus === 'NOUVELLE';
        } else if (selectedStatus === 'EN_COURS') {
          return rawStatus === 'acknowledged' || mappedStatus === 'EN_COURS';
        } else if (selectedStatus === 'TRAITEE') {
          return rawStatus === 'resolved' || mappedStatus === 'TRAITEE';
        }
        return true;
      });
    }
    
    // Normaliser les accents pour la comparaison
    const normalize = (str: string) => str
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Supprimer les accents
    
    // Compter par niveau de risque (anglais: CRITICAL, HIGH, MEDIUM, LOW)
    // Support aussi ancien format français pour compatibilité
    return {
      CRITIQUE: alertsToCount.filter(a => {
        const riskLevelNorm = normalize(a.riskLevel || '');
        const levelNorm = normalize(a.level || '');
        return riskLevelNorm === 'CRITICAL' || riskLevelNorm === 'CRITIQUE' || levelNorm === 'T3';
      }).length,
      ELEVE: alertsToCount.filter(a => {
        const riskLevelNorm = normalize(a.riskLevel || '');
        const levelNorm = normalize(a.level || '');
        // Support nouveau format (HIGH) et ancien format (ELEVE/ÉLEVÉ) ou T2
        return riskLevelNorm === 'HIGH' || riskLevelNorm === 'ELEVE' || levelNorm === 'T2';
      }).length,
      MOYEN: alertsToCount.filter(a => {
        const riskLevelNorm = normalize(a.riskLevel || '');
        const levelNorm = normalize(a.level || '');
        return riskLevelNorm === 'MEDIUM' || riskLevelNorm === 'MOYEN' || levelNorm === 'T1';
      }).length,
      FAIBLE: alertsToCount.filter(a => {
        const riskLevelNorm = normalize(a.riskLevel || '');
        const levelNorm = normalize(a.level || '');
        return riskLevelNorm === 'LOW' || riskLevelNorm === 'FAIBLE' || levelNorm === 'T0';
      }).length,
    };
  };

  const loadAlertComments = async (alertId: string) => {
    setLoadingComments(true);
    try {
      // Vérifier d'abord si l'alerte existe encore
      const alertExists = allAlerts.find(alert => alert.id === alertId);
      if (!alertExists) {
        console.warn(`Alert ${alertId} no longer exists, refreshing alerts...`);
        await loadAlerts(false); // Recharger les alertes
        setError('Cette alerte n\'existe plus. Les données ont été actualisées.');
        showWarning('Cette alerte n\'existe plus. Les données ont été actualisées.');
        return;
      }

      const comments = await alertService.getAlertComments(alertId);
      setAlertComments(comments);
    } catch (err: any) {
      console.error('Failed to load comments:', err);
      
      // Si l'erreur est 404 ou 500, l'alerte n'existe probablement plus
      if (err.response?.status === 404 || err.response?.status === 500) {
        console.warn(`Alert ${alertId} not found, refreshing alerts...`);
        await loadAlerts(false); // Recharger les alertes
        setError('Cette alerte n\'existe plus. Les données ont été actualisées.');
        showWarning('Cette alerte n\'existe plus. Les données ont été actualisées.');
      } else {
        setError(err.response?.data?.message || 'Erreur lors du chargement des commentaires');
        showError(err.response?.data?.message || 'Erreur lors du chargement des commentaires');
      }
    } finally {
      setLoadingComments(false);
    }
  };


  const handleOpenDetailModal = async (alert: Alert) => {
    setSelectedAlert(alert);
    setShowDetailModal(true);
    // Charger les commentaires pour cette alerte
    await loadAlertComments(alert.id);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedAlert(null);
    setAlertComments([]);
  };

  // Fonction pour traduire le niveau de risque en français pour l'affichage
  const translateRiskLevel = (level: string): string => {
    if (!level) return '';
    const normalized = level.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    switch (normalized) {
      case 'CRITICAL':
      case 'CRITIQUE':
      case 'T3': return 'Critique';
      case 'HIGH':
      case 'ELEVE':
      case 'T2': return 'Élevé';
      case 'MEDIUM':
      case 'MOYEN':
      case 'T1': return 'Moyen';
      case 'LOW':
      case 'FAIBLE':
      case 'T0': return 'Faible';
      default: return level;
    }
  };

  const getRiskLevelColor = (level: string) => {
    // Normaliser pour gérer anglais et français
    const normalized = (level || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    switch (normalized) {
      case 'CRITICAL':
      case 'CRITIQUE':
      case 'T3': return 'text-red-600 bg-red-100 border-red-200';
      case 'HIGH':
      case 'ELEVE':
      case 'T2': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'MEDIUM':
      case 'MOYEN':
      case 'T1': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'LOW':
      case 'FAIBLE':
      case 'T0': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  // Fonction pour obtenir l'icône et le texte selon le type de source
  const getSourceInfo = (sourceType: string) => {
    switch (sourceType) {
      case 'CHAT':
        return {
          icon: MessageCircle,
          text: 'Conversation',
          color: 'text-blue-600 bg-blue-100',
          description: 'Détecté dans une conversation avec Mélio'
        };
      case 'JOURNAL':
        return {
          icon: BookOpen,
          text: 'Journal',
          color: 'text-purple-600 bg-purple-100',
          description: 'Détecté dans le journal intime'
        };
      default:
        return {
          icon: AlertCircle,
          text: 'Autre',
          color: 'text-gray-600 bg-gray-100',
          description: 'Source inconnue'
        };
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

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'TRES_TRISTE': return 'bg-red-500';
      case 'TRISTE': return 'bg-orange-500';
      case 'NEUTRE': return 'bg-gray-500';
      case 'CONTENT': return 'bg-blue-500';
      case 'TRES_HEUREUX': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'TRES_TRISTE': return 'Très triste';
      case 'TRISTE': return 'Triste';
      case 'NEUTRE': return 'Neutre';
      case 'CONTENT': return 'Content';
      case 'TRES_HEUREUX': return 'Très heureux';
      default: return mood;
    }
  };

  // Fonction pour traduire le statut en français pour l'affichage
  const getStatusText = (status: string) => {
    if (!status) return '';
    const normalized = status.toUpperCase();
    switch (normalized) {
      case 'PENDING':
      case 'NOUVELLE': return 'Nouvelle';
      case 'ACKNOWLEDGED':
      case 'EN_COURS': return 'En cours';
      case 'RESOLVED':
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
    <div className="space-y-4">
      {/* Stats en header compact */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {allAlerts.length} alerte(s) affichée(s)
            </div>
            <button
              onClick={refreshAlerts}
            className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
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
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes • {stats?.total || 0}
            </button>
            <button
              onClick={() => handleStatusFilter('pending')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === 'pending'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Nouvelles • {stats?.nouvelles || 0}
            </button>
            <button
              onClick={() => handleStatusFilter('acknowledged')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === 'acknowledged'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              En cours • {stats?.enCours || 0}
            </button>
            <button
              onClick={() => handleStatusFilter('resolved')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedStatus === 'resolved'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Traitées • {stats?.traitees || 0}
            </button>
            </div>
          </div>

        {/* Filtre par niveau de risque */}
        <div className="pt-3 border-t border-gray-200">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
            Niveau de risque {selectedStatus && <span className="text-gray-400">({getStatusText(selectedStatus)})</span>}
          </label>
          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            <button
              onClick={() => setSelectedRiskLevel('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedRiskLevel === ''
                  ? 'bg-gray-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tous niveaux
            </button>
            <button
              onClick={() => setSelectedRiskLevel('CRITIQUE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRiskLevel === 'CRITIQUE'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              Critique • {getRiskStats().CRITIQUE}
            </button>
            <button
              onClick={() => setSelectedRiskLevel('ELEVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRiskLevel === 'ELEVE'
                  ? 'bg-orange-600 text-white'
                  : 'bg-orange-100 text-orange-700 hover:bg-orange-200'
              }`}
            >
              Élevé • {getRiskStats().ELEVE}
            </button>
            <button
              onClick={() => setSelectedRiskLevel('MOYEN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRiskLevel === 'MOYEN'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              Moyen • {getRiskStats().MOYEN}
            </button>
            <button
              onClick={() => setSelectedRiskLevel('FAIBLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRiskLevel === 'FAIBLE'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              Faible • {getRiskStats().FAIBLE || 0}
            </button>
          </div>
        </div>
      </div>


      {/* Liste des alertes - Vue Table Compacte */}
      {filteredAlerts.length === 0 && !isLoading ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20">
          <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">Aucune alerte</h3>
            <p className="text-sm text-gray-500">Aucune alerte de sécurité détectée pour le moment.</p>
          </div>
        ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Header des colonnes */}
          <div className="bg-gray-100 border-b-2 border-gray-300 p-4">
            <div className="flex items-center w-full justify-between">
              <div className="w-48 px-2">
                <span className="text-sm text-gray-600">Élève</span>
              </div>
              <div className="w-24 text-center px-2">
                <span className="text-sm text-gray-600">Source</span>
              </div>
              <div className="w-24 text-center px-2">
                <span className="text-sm text-gray-600">Risque</span>
              </div>
              <div className="flex-1 mx-4 px-2">
                <span className="text-sm text-gray-600">Résumé</span>
              </div>
              <div className="w-24 text-center px-2">
                <span className="text-sm text-gray-600">Statut</span>
              </div>
              <div className="w-20 text-center px-2">
                <span className="text-sm text-gray-600">Date</span>
              </div>
              <div className="w-24 text-center px-2">
                <span className="text-sm text-gray-600">Actions</span>
              </div>
            </div>
          </div>

          <SimpleVirtualizedList<Alert>
          items={filteredAlerts}
          height={600}
          itemHeight={80}
          renderItem={({ item: alert }) => {
            const sourceInfo = getSourceInfo(alert.sourceType);
            const SourceIcon = sourceInfo.icon;
            
            return (
              <div
                key={alert.id}
                onClick={() => handleOpenDetailModal(alert)}
                className="hover:bg-indigo-50/50 transition-colors cursor-pointer border-b border-gray-200 p-4 h-20 flex items-center"
              >
                <div className="flex items-center w-full">
                  {/* Élève - Largeur fixe */}
                  <div className="flex items-center space-x-3 w-48">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {alert.student?.firstName?.[0] || 'E'}{alert.student?.lastName?.[0] || 'L'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate">
                          {alert.student?.firstName || 'Élève'} {alert.student?.lastName || 'Inconnu'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">{alert.student?.className || 'Classe inconnue'}</div>
                          </div>
                      </div>

                  {/* Source - Largeur fixe */}
                  <div className="w-24 flex justify-center">
                    <div className="flex items-center justify-center">
                      {alert.sourceType === 'chat' ? (
                        <MessageCircle className="w-5 h-5 text-blue-600" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-green-600" />
                      )}
                      <span className="ml-1 text-xs text-gray-600">
                        {alert.sourceLabel || 'Journal'}
                    </span>
                        </div>
                        </div>

                  {/* Risque - Largeur fixe */}
                  <div className="w-24 flex justify-center">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getRiskLevelColor(alert.riskLevel || alert.level)}`}>
                      {translateRiskLevel(alert.riskLevel || alert.level || 'T2')}
                    </span>
                        </div>

                  {/* Résumé - Largeur fixe */}
                  <div className="flex-1 mx-4 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-2 truncate">{alert.aiSummary || alert.summary || 'Aucun résumé disponible'}</p>
                      </div>

                  {/* Statut - Largeur fixe */}
                  <div className="w-24 flex justify-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      (alert.status?.toUpperCase() === 'PENDING' || alert.status === 'NOUVELLE') ? 'bg-red-100 text-red-700' :
                      (alert.status?.toUpperCase() === 'ACKNOWLEDGED' || alert.status === 'EN_COURS') ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                        {getStatusText(alert.status)}
                      </span>
                      </div>

                  {/* Date - Largeur fixe */}
                  <div className="w-20 text-xs text-gray-600 text-center">
                    {new Date(alert.createdAt).toLocaleDateString('fr-FR')}
                  </div>

                  {/* Actions - Largeur fixe */}
                  <div className="w-24 flex justify-center">
                    {(alert.status?.toUpperCase() === 'PENDING' || alert.status === 'NOUVELLE') && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(alert.id, 'acknowledged');
                        }}
                      className="px-3 py-1 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-medium transition-all"
                      >
                      Prendre
                      </button>
                    )}
                    {(alert.status?.toUpperCase() === 'ACKNOWLEDGED' || alert.status === 'EN_COURS') && (
                        <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(alert.id, 'resolved');
                        }}
                      className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition-all"
                        >
                      Traiter
                        </button>
                      )}
                  {(alert.status?.toUpperCase() === 'RESOLVED' || alert.status === 'TRAITEE') && (
                    <Eye className="w-4 h-4 text-gray-400" />
                      )}
                  </div>
                </div>
              </div>
          );
          }}
        />
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
                rows={8}
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

      {/* Modal de détails complet */}
      {showDetailModal && selectedAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50" onClick={handleCloseDetailModal}>
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header du modal */}
            <div className={`p-6 ${getCardColors(selectedAlert.status).header} border-b border-gray-200`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-14 ${getMoodColor(selectedAlert.childMood)} rounded-full flex items-center justify-center shadow-lg`}>
                    <span className="text-white font-bold text-lg">
                      {selectedAlert.student.firstName[0]}{selectedAlert.student.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedAlert.student.firstName} {selectedAlert.student.lastName}
                    </h2>
                    <p className="text-gray-600">{selectedAlert.student.className}</p>
                    <p className="text-sm text-gray-500 mt-1">Humeur : {getMoodLabel(selectedAlert.childMood)}</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseDetailModal}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Badges de statut */}
              <div className="flex items-center space-x-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${getRiskLevelColor(selectedAlert.riskLevel)}`}>
                  Niveau {translateRiskLevel(selectedAlert.riskLevel || selectedAlert.level || '')}
                </span>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold border-2 ${getCardColors(selectedAlert.status).badge}`}>
                  {getStatusText(selectedAlert.status)}
                </span>
                <span className="px-3 py-1.5 rounded-lg text-sm font-semibold border-2 border-gray-300 bg-gray-100 text-gray-700">
                  {selectedAlert.sourceLabel || 'Journal'}
                </span>
              </div>
            </div>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto max-h-[calc(90vh-250px)] p-6">
              <div className="space-y-6">

                {/* Analyse IA */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Analyse IA
                    {selectedAlert.triage && (
                      <span className={`ml-3 px-2 py-1 rounded-lg text-xs font-bold ${
                        selectedAlert.triage === 'T3' ? 'bg-red-100 text-red-700' :
                        selectedAlert.triage === 'T2' ? 'bg-orange-100 text-orange-700' :
                        selectedAlert.triage === 'T1' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {selectedAlert.triage}
                      </span>
                    )}
                  </h3>
                  <p className="text-blue-800 leading-relaxed">{selectedAlert.aiSummary || selectedAlert.summary || 'Aucune analyse disponible'}</p>
                </div>

                {/* Recommandation */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border-2 border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-3 flex items-center">
                    <Shield className="w-5 h-5 mr-2" />
                    Recommandation
                  </h3>
                  <p className="text-green-800 leading-relaxed">
                    {selectedAlert.aiAdvice || selectedAlert.recommendedActions?.join('; ') || 'Aucune recommandation disponible'}
                  </p>
                </div>


                {/* Historique des commentaires */}
                <div className="bg-white rounded-2xl p-5 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Historique du suivi ({alertComments.length})
                  </h3>
                  
                  {loadingComments ? (
                    <div className="flex items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mr-3" />
                      <span className="text-gray-600">Chargement de l'historique...</span>
                    </div>
                  ) : alertComments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Aucun commentaire pour le moment</p>
                      <p className="text-sm mt-2">Les changements de statut et commentaires apparaîtront ici</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {alertComments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold">
                                {comment.agentName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-800">{comment.agentName}</p>
                                <p className="text-xs text-gray-500">
                                  {new Date(comment.createdAt).toLocaleString('fr-FR', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {comment.oldStatus && (
                                <>
                                  <span className="text-xs px-2 py-1 rounded bg-gray-200 text-gray-700">
                                    {getStatusText(comment.oldStatus)}
                                  </span>
                                  <span className="text-gray-400">→</span>
                                </>
                              )}
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                (comment.newStatus?.toUpperCase() === 'PENDING' || comment.newStatus === 'NOUVELLE') ? 'bg-red-100 text-red-700' :
                                (comment.newStatus?.toUpperCase() === 'ACKNOWLEDGED' || comment.newStatus === 'EN_COURS') ? 'bg-orange-100 text-orange-700' :
                                'bg-green-100 text-green-700'
                              }`}>
                                {getStatusText(comment.newStatus)}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700 leading-relaxed pl-11">{comment.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer avec actions */}
            <div className="p-6 bg-gray-50 border-t border-gray-200 flex items-center justify-end">
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleCloseDetailModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Fermer
                </button>
                
                {(selectedAlert.status?.toUpperCase() === 'PENDING' || selectedAlert.status === 'NOUVELLE') && (
                  <button
                    onClick={() => {
                      handleCloseDetailModal();
                      handleStatusChange(selectedAlert.id, 'acknowledged');
                    }}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-all duration-200 font-medium"
                  >
                    Prendre en charge
                  </button>
                )}
                
                {(selectedAlert.status?.toUpperCase() === 'ACKNOWLEDGED' || selectedAlert.status === 'EN_COURS') && (
                  <button
                    onClick={() => {
                      handleCloseDetailModal();
                      handleStatusChange(selectedAlert.id, 'resolved');
                    }}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 font-medium"
                  >
                    Marquer comme traitée
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}