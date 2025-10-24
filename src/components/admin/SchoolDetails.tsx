import React, { useState, useEffect } from 'react';
import {
  School,
  MapPin,
  Mail,
  Phone,
  Users,
  Bell,
  FileText,
  ArrowLeft,
  Edit,
  Save,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  UserPlus,
  Search,
  Trash2,
  Shield,
  BarChart3,
  GraduationCap
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SchoolStudentsManagement from './SchoolStudentsManagement';

interface SchoolDetailsProps {
  schoolId: string;
  onBack: () => void;
  onUpdate: () => void;
}

interface SchoolData {
  id: string;
  code: string;
  name: string;
  address1: string;
  address2?: string;
  postalCode: string;
  city: string;
  country: string;
  level: string;
  uaiCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  createdAt: string;
}

interface Agent {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface SchoolStats {
  totalStudents: number;
  totalAlerts: number;
  totalReports: number;
  alertsByRiskLevel?: { [key: string]: number };
  reportsByStatus?: { [key: string]: number };
}

export default function SchoolDetails({ schoolId, onBack, onUpdate }: SchoolDetailsProps) {
  const { showSuccess, showError } = useToast();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [stats, setStats] = useState<SchoolStats | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [allAgents, setAllAgents] = useState<Agent[]>([]);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [showAgentDropdown, setShowAgentDropdown] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showStudentsManagement, setShowStudentsManagement] = useState(false);

  // Données du formulaire
  const [formData, setFormData] = useState({
    name: '',
    address1: '',
    address2: '',
    postalCode: '',
    city: '',
    country: 'France',
    level: '',
    uaiCode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    loadSchoolDetails();
  }, [schoolId]);

  // Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.agent-dropdown-container')) {
        setShowAgentDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSchoolDetails = async () => {
    try {
      setIsLoading(true);
      
      // Charger les détails de l'école
      const data = await adminService.getSchoolById(schoolId);
      setSchool(data);
      setFormData({
        name: data.name,
        address1: data.address1,
        address2: data.address2 || '',
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        level: data.level,
        uaiCode: data.uaiCode,
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        status: data.status,
      });

      // Charger les statistiques
      try {
        const statsData = await adminService.getSchoolStats(schoolId);
        setStats(statsData);
      } catch (error) {
        console.error('Erreur stats:', error);
      }

      // Charger les agents de l'école
      try {
        const agentsData = await adminService.getSchoolAgents(schoolId);
        setAgents(agentsData);
      } catch (error) {
        console.error('Erreur agents:', error);
      }

      // Charger tous les agents pour la recherche
      try {
        const allAgentsData = await adminService.getAllAgents();
        setAllAgents(allAgentsData);
      } catch (error) {
        console.error('Erreur tous les agents:', error);
      }
    } catch (error) {
      showError('Erreur lors du chargement des détails');
      onBack();
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableAgents = () => {
    const query = agentSearchQuery.toLowerCase();
    const assignedAgentIds = agents.map(a => a.id);
    
    return allAgents.filter(agent => 
      !assignedAgentIds.includes(agent.id) &&
      (agent.email.toLowerCase().includes(query) ||
       agent.firstName?.toLowerCase().includes(query) ||
       agent.lastName?.toLowerCase().includes(query))
    );
  };

  const handleAddAgent = async (agentId: string) => {
    try {
      await adminService.assignAgentToSchool(schoolId, { agentId });
      showSuccess('Agent ajouté à l\'école');
      setAgentSearchQuery('');
      setShowAgentDropdown(false);
      loadSchoolDetails();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Erreur lors de l\'ajout de l\'agent');
    }
  };

  const handleRemoveAgent = async (agentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir retirer cet agent de cette école ?')) return;
    
    try {
      await adminService.removeAgentFromSchool(schoolId, agentId);
      showSuccess('Agent retiré de l\'école');
      loadSchoolDetails();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Erreur lors du retrait de l\'agent');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await adminService.updateSchool(schoolId, formData);
      showSuccess('École mise à jour avec succès !');
      setIsEditing(false);
      onUpdate();
      loadSchoolDetails();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (school) {
      setFormData({
        name: school.name,
        address1: school.address1,
        address2: school.address2 || '',
        postalCode: school.postalCode,
        city: school.city,
        country: school.country,
        level: school.level,
        uaiCode: school.uaiCode,
        contactName: school.contactName,
        contactEmail: school.contactEmail,
        contactPhone: school.contactPhone,
        status: school.status,
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!school) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-2xl">
              {school.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{school.name}</h2>
              <div className="flex items-center space-x-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  school.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {school.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                </span>
                <span className="text-sm text-gray-600 font-mono bg-gray-100 px-3 py-1 rounded-lg">
                  {school.code}
                </span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Edit className="w-5 h-5 mr-2" />
              Modifier
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="flex items-center px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
              >
                <X className="w-5 h-5 mr-2" />
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Gestion des élèves */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />
            Élèves ({stats?.totalStudents || 0})
          </h3>
          <button
            onClick={() => setShowStudentsManagement(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center"
          >
            <Users className="w-4 h-4 mr-2" />
            Gérer les élèves
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Gérez la liste des élèves de cette école, ajoutez-en de nouveaux ou importez depuis Excel.
        </p>
      </div>

      {/* Statistiques de suivi détaillées */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
          <BarChart3 className="w-6 h-6 mr-2 text-indigo-600" />
          Suivi et Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Alertes en attente */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Bell className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-1 rounded-full">
                En attente
              </span>
            </div>
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {stats ? (stats.alertsByStatus?.NOUVELLE || 0) + (stats.alertsByStatus?.EN_COURS || 0) : '-'}
            </div>
            <div className="text-xs text-orange-700">Alertes non traitées</div>
            {stats && stats.alertsByRiskLevel?.CRITIQUE > 0 && (
              <div className="mt-2 text-xs font-semibold text-red-600 flex items-center">
                <AlertCircle className="w-3 h-3 mr-1" />
                {stats.alertsByRiskLevel.CRITIQUE} critique(s)
              </div>
            )}
          </div>

          {/* Signalements en attente */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
                À traiter
              </span>
            </div>
            <div className="text-3xl font-bold text-purple-600 mb-1">
              {stats ? (stats.reportsByStatus?.NOUVEAU || 0) + (stats.reportsByStatus?.EN_COURS || 0) : '-'}
            </div>
            <div className="text-xs text-purple-700">Signalements en cours</div>
          </div>

          {/* Taux de résolution alertes */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-xs font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                Alertes
              </span>
            </div>
            <div className="text-3xl font-bold text-green-600 mb-1">
              {stats && stats.totalAlerts > 0 
                ? Math.round(((stats.alertsByStatus?.TRAITEE || 0) / stats.totalAlerts) * 100)
                : 0}%
            </div>
            <div className="text-xs text-green-700">Taux de résolution</div>
            <div className="mt-2 text-xs text-gray-600">
              {stats?.alertsByStatus?.TRAITEE || 0} / {stats?.totalAlerts || 0} résolues
            </div>
          </div>

          {/* Taux de résolution signalements */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-700 bg-blue-100 px-2 py-1 rounded-full">
                Signalements
              </span>
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-1">
              {stats && stats.totalReports > 0 
                ? Math.round(((stats.reportsByStatus?.TRAITE || 0) / stats.totalReports) * 100)
                : 0}%
            </div>
            <div className="text-xs text-blue-700">Taux de traitement</div>
            <div className="mt-2 text-xs text-gray-600">
              {stats?.reportsByStatus?.TRAITE || 0} / {stats?.totalReports || 0} traités
            </div>
          </div>
        </div>

        {/* Indicateurs de performance */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Temps de réponse moyen */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Réactivité</h4>
              <span className="text-xs text-gray-500">Moyenne estimée</span>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-800">~24h</div>
                <div className="text-xs text-gray-600">Temps de réponse</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                true ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
              }`}>
                Bon
              </div>
            </div>
          </div>

          {/* Charge de travail */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Charge de travail</h4>
              <span className="text-xs text-gray-500">Par agent</span>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-800">
                  {agents.length > 0 && stats 
                    ? Math.round(((stats.totalAlerts + stats.totalReports) / agents.length))
                    : '-'}
                </div>
                <div className="text-xs text-gray-600">Cas par agent</div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                agents.length > 0 && stats && ((stats.totalAlerts + stats.totalReports) / agents.length) < 20
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }`}>
                {agents.length > 0 && stats && ((stats.totalAlerts + stats.totalReports) / agents.length) < 20 ? 'Normal' : 'Élevée'}
              </div>
            </div>
          </div>

          {/* Agents actifs */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-gray-700">Équipe</h4>
              <span className="text-xs text-gray-500">Actifs</span>
            </div>
            <div className="flex items-center">
              <div className="flex-1">
                <div className="text-2xl font-bold text-gray-800">{agents.length}</div>
                <div className="text-xs text-gray-600">Agent(s) assigné(s)</div>
              </div>
              <Shield className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Informations principales */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informations générales */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <School className="w-5 h-5 mr-2 text-indigo-600" />
              Informations de l'établissement
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'établissement *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Niveau *
                </label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                >
                  <option value="MATERNELLE">Maternelle</option>
                  <option value="PRIMAIRE">Primaire</option>
                  <option value="COLLEGE">Collège</option>
                  <option value="LYCEE">Lycée</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Code UAI *
                </label>
                <input
                  type="text"
                  value={formData.uaiCode}
                  onChange={(e) => setFormData({ ...formData, uaiCode: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Statut
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Adresse */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
              Adresse
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse ligne 1 *
                </label>
                <input
                  type="text"
                  value={formData.address1}
                  onChange={(e) => setFormData({ ...formData, address1: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse ligne 2
                </label>
                <input
                  type="text"
                  value={formData.address2}
                  onChange={(e) => setFormData({ ...formData, address2: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays *
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Mail className="w-5 h-5 mr-2 text-indigo-600" />
              Contact de l'école
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du contact *
                </label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Statistiques et infos */}
        <div className="space-y-6">
          {/* Statistiques rapides */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-4 text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.totalStudents ?? '-'}
                </div>
                <div className="text-sm text-blue-700">Élèves</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-4 text-center">
                <Bell className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-600">
                  {stats?.totalAlerts ?? '-'}
                </div>
                <div className="text-sm text-orange-700">Alertes</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <FileText className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.totalReports ?? '-'}
                </div>
                <div className="text-sm text-purple-700">Signalements</div>
              </div>
            </div>
          </div>

          {/* Informations système */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Informations système</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-600">Code école</span>
                <span className="font-mono font-semibold text-gray-800">{school.code}</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-gray-600">Créée le</span>
                <span className="font-medium text-gray-800">
                  {new Date(school.createdAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Statut</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  school.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {school.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                </span>
              </div>
            </div>
          </div>


          {/* Agents attribués - EN DERNIER pour que le dropdown soit au-dessus */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 relative">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-purple-600" />
              Agents ({agents.length})
            </h3>

            {/* Liste des agents */}
            <div className="space-y-2 mb-4">
              {agents.length === 0 ? (
                <div className="text-center py-4 text-gray-500 text-sm">
                  Aucun agent attribué
                </div>
              ) : (
                agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="flex items-center justify-between bg-purple-50 rounded-lg p-3 border border-purple-200"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {agent.firstName?.[0] || agent.email[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-800">
                          {agent.firstName && agent.lastName 
                            ? `${agent.firstName} ${agent.lastName}`
                            : agent.email
                          }
                        </div>
                        <div className="text-xs text-gray-600">{agent.email}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAgent(agent.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                      title="Retirer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Recherche pour ajouter un agent */}
            <div className="relative agent-dropdown-container">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ajouter un agent
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={agentSearchQuery}
                  onChange={(e) => {
                    setAgentSearchQuery(e.target.value);
                    setShowAgentDropdown(true);
                  }}
                  onFocus={() => setShowAgentDropdown(true)}
                  placeholder="Rechercher un agent..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Dropdown */}
              {showAgentDropdown && getAvailableAgents().length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {getAvailableAgents().map((agent) => (
                    <button
                      key={agent.id}
                      type="button"
                      onClick={() => handleAddAgent(agent.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-purple-50 transition-colors text-left border-b last:border-b-0"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {agent.firstName?.[0] || agent.email[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {agent.firstName && agent.lastName 
                              ? `${agent.firstName} ${agent.lastName}`
                              : agent.email
                            }
                          </div>
                          <div className="text-xs text-gray-600">{agent.email}</div>
                        </div>
                      </div>
                      <UserPlus className="w-4 h-4 text-purple-600" />
                    </button>
                  ))}
                </div>
              )}

              {showAgentDropdown && agentSearchQuery && getAvailableAgents().length === 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-center">
                  <p className="text-sm text-gray-500">Aucun agent disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de gestion des élèves */}
      {showStudentsManagement && school && (
        <SchoolStudentsManagement
          schoolId={school.id}
          schoolName={school.name}
          onBack={() => setShowStudentsManagement(false)}
        />
      )}
    </div>
  );
}

