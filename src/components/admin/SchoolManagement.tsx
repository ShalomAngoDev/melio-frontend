import React, { useState, useEffect } from 'react';
import { 
  School, 
  Edit3, 
  Trash2, 
  Users, 
  Plus, 
  X, 
  Save, 
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Search
} from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

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
  updatedAt: string;
}

interface Agent {
  id: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface SchoolManagementProps {
  onSchoolUpdate: () => void;
}

export default function SchoolManagement({ onSchoolUpdate }: SchoolManagementProps) {
  const { showSuccess, showError } = useToast();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<SchoolData | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingAgent, setIsAddingAgent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showAgents, setShowAgents] = useState(false);
  const [editingSchool, setEditingSchool] = useState<Partial<SchoolData>>({});
  const [newAgent, setNewAgent] = useState({ email: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(30);

  // Charger les écoles au montage du composant
  useEffect(() => {
    loadSchools();
  }, []);

  // Filtrer et trier les écoles en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === '') {
      // Trier par ordre alphabétique
      const sorted = [...schools].sort((a, b) => a.name.localeCompare(b.name));
      setFilteredSchools(sorted);
      setIsSearching(false);
    } else {
      setIsSearching(true);
      // Simuler un délai de recherche pour l'UX
      const timeoutId = setTimeout(() => {
        const filtered = schools
          .filter(school =>
            school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            school.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            school.city.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .sort((a, b) => a.name.localeCompare(b.name)); // Trier par ordre alphabétique
        setFilteredSchools(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    }
    // Réinitialiser la page à 1 lors du changement de recherche
    setCurrentPage(1);
  }, [schools, searchTerm]);

  const loadSchools = async () => {
    try {
      setIsLoading(true);
      const schoolsData = await adminService.getAllSchools();
      setSchools(schoolsData);
    } catch (error) {
      console.error('Erreur lors du chargement des écoles:', error);
      showError('Erreur lors du chargement des écoles');
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les agents de l'école sélectionnée
  useEffect(() => {
    if (selectedSchool) {
      loadSchoolAgents(selectedSchool.id);
    }
  }, [selectedSchool]);

  const loadSchoolAgents = async (schoolId: string) => {
    try {
      setIsLoading(true);
      const agentsData = await adminService.getSchoolAgents(schoolId);
      setAgents(agentsData);
    } catch (error) {
      console.error('Erreur lors du chargement des agents:', error);
      showError('Erreur lors du chargement des agents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSchool = (school: SchoolData) => {
    setSelectedSchool(school);
    setEditingSchool(school);
    setIsEditing(true);
  };

  const handleSaveSchool = async () => {
    if (!selectedSchool) return;

    try {
      setIsLoading(true);
      await adminService.updateSchool(selectedSchool.id, editingSchool);
      showSuccess('École modifiée avec succès');
      setIsEditing(false);
      loadSchools(); // Recharger la liste des écoles
      onSchoolUpdate();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      showError('Erreur lors de la modification de l\'école');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSchool = async (school: SchoolData) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'école "${school.name}" ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setIsLoading(true);
      await adminService.deleteSchool(school.id);
      showSuccess('École supprimée avec succès');
      loadSchools(); // Recharger la liste des écoles
      onSchoolUpdate();
      if (selectedSchool?.id === school.id) {
        setSelectedSchool(null);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      showError('Erreur lors de la suppression de l\'école');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAgent = async () => {
    if (!selectedSchool || !newAgent.email || !newAgent.password) {
      showError('Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      await adminService.addAgentToSchool(selectedSchool.id, newAgent);
      showSuccess('Agent ajouté avec succès');
      setNewAgent({ email: '', password: '' });
      setIsAddingAgent(false);
      loadSchoolAgents(selectedSchool.id);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'agent:', error);
      showError('Erreur lors de l\'ajout de l\'agent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAgent = async (agentId: string) => {
    if (!selectedSchool) return;

    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
      return;
    }

    try {
      setIsLoading(true);
      await adminService.removeAgentFromSchool(selectedSchool.id, agentId);
      showSuccess('Agent supprimé avec succès');
      loadSchoolAgents(selectedSchool.id);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'agent:', error);
      showError('Erreur lors de la suppression de l\'agent');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'INACTIVE': return 'Inactive';
      default: return status;
    }
  };

  // Calculer les données de pagination
  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchools = filteredSchools.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll vers le haut de la liste
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6">
      {/* Liste des écoles */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <School className="w-6 h-6 mr-3 text-blue-500" />
            Gestion des Écoles
          </h3>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, code ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="mt-2 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filteredSchools.length} école(s) trouvée(s) sur {schools.length}
              </div>
              <button
                onClick={() => setSearchTerm('')}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Effacer la recherche
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {isSearching ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-500 mb-2">Recherche en cours...</h3>
              <p className="text-gray-400">Recherche de "{searchTerm}"</p>
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">
                {searchTerm ? 'Aucune école trouvée' : 'Aucune école disponible'}
              </h3>
              <p className="text-gray-400">
                {searchTerm 
                  ? `Aucune école ne correspond à "${searchTerm}"`
                  : 'Commencez par ajouter une école'
                }
              </p>
            </div>
          ) : (
            currentSchools.map((school) => (
            <div
              key={school.id}
              className={`p-3 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                selectedSchool?.id === school.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => setSelectedSchool(school)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-800 text-sm mb-1 truncate" title={school.name}>
                    {school.name}
                  </h4>
                  <p className="text-xs text-gray-600 mb-1">Code: {school.code}</p>
                  <p className="text-xs text-gray-500 truncate" title={`${school.city}, ${school.country}`}>
                    {school.city}, {school.country}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ml-2 flex-shrink-0 ${getStatusColor(school.status)}`}>
                  {getStatusLabel(school.status)}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSchool(school);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    title="Modifier l'école"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSchool(school);
                    }}
                    className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                    title="Supprimer l'école"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAgents(!showAgents);
                  }}
                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  title="Voir les agents"
                >
                  <Users className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {filteredSchools.length > itemsPerPage && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Affichage de {startIndex + 1} à {Math.min(endIndex, filteredSchools.length)} sur {filteredSchools.length} école(s)
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              
              <div className="flex items-center space-x-1">
                {(() => {
                  const pages = [];
                  const maxVisiblePages = 5;
                  
                  if (totalPages <= maxVisiblePages) {
                    // Afficher toutes les pages si peu de pages
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    // Logique de pagination intelligente
                    if (currentPage <= 3) {
                      // Début de la liste
                      for (let i = 1; i <= 4; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    } else if (currentPage >= totalPages - 2) {
                      // Fin de la liste
                      pages.push(1);
                      pages.push('...');
                      for (let i = totalPages - 3; i <= totalPages; i++) {
                        pages.push(i);
                      }
                    } else {
                      // Milieu de la liste
                      pages.push(1);
                      pages.push('...');
                      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                        pages.push(i);
                      }
                      pages.push('...');
                      pages.push(totalPages);
                    }
                  }
                  
                  return pages.map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-2 py-2 text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page as number)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  ));
                })()}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Détails de l'école sélectionnée */}
      {selectedSchool && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-800">
              {isEditing ? 'Modifier l\'école' : 'Détails de l\'école'}
            </h3>
            <div className="flex space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => handleEditSchool(selectedSchool)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveSchool}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Formulaire de modification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom de l'école</label>
              <input
                type="text"
                value={isEditing ? editingSchool.name || '' : selectedSchool.name}
                onChange={(e) => setEditingSchool({ ...editingSchool, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code</label>
              <input
                type="text"
                value={selectedSchool.code}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
              <input
                type="text"
                value={isEditing ? editingSchool.address1 || '' : selectedSchool.address1}
                onChange={(e) => setEditingSchool({ ...editingSchool, address1: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
              <input
                type="text"
                value={isEditing ? editingSchool.postalCode || '' : selectedSchool.postalCode}
                onChange={(e) => setEditingSchool({ ...editingSchool, postalCode: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
              <input
                type="text"
                value={isEditing ? editingSchool.city || '' : selectedSchool.city}
                onChange={(e) => setEditingSchool({ ...editingSchool, city: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
              <input
                type="text"
                value={isEditing ? editingSchool.country || '' : selectedSchool.country}
                onChange={(e) => setEditingSchool({ ...editingSchool, country: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Niveau</label>
              <select
                value={isEditing ? editingSchool.level || '' : selectedSchool.level}
                onChange={(e) => setEditingSchool({ ...editingSchool, level: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="PRIMAIRE">Primaire</option>
                <option value="COLLEGE">Collège</option>
                <option value="LYCEE">Lycée</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={isEditing ? editingSchool.status || '' : selectedSchool.status}
                onChange={(e) => setEditingSchool({ ...editingSchool, status: e.target.value })}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>

          {/* Section des agents */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-500" />
                Agents ({agents.length})
              </h4>
              <button
                onClick={() => setIsAddingAgent(!isAddingAgent)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un agent
              </button>
            </div>

            {/* Formulaire d'ajout d'agent */}
            {isAddingAgent && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h5 className="font-medium text-gray-800 mb-3">Nouvel agent</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={newAgent.email}
                      onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="agent@exemple.fr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mot de passe</label>
                    <input
                      type="password"
                      value={newAgent.password}
                      onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mot de passe"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <button
                    onClick={() => setIsAddingAgent(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleAddAgent}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {isLoading ? 'Ajout...' : 'Ajouter'}
                  </button>
                </div>
              </div>
            )}

            {/* Liste des agents */}
            <div className="space-y-2">
              {agents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Aucun agent dans cette école</p>
              ) : (
                agents.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <Users className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{agent.email}</p>
                        <p className="text-sm text-gray-500">
                          Créé le {new Date(agent.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveAgent(agent.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer l'agent"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
