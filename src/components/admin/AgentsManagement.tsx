import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Plus, 
  Mail, 
  School, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  Copy,
  Check,
  Shield,
  Loader2,
  Search,
  X,
  AlertCircle
} from 'lucide-react';
import { adminService, schoolService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import SimpleVirtualizedList from '../common/SimpleVirtualizedList';

interface Agent {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  schools: Array<{
    id: string;
    code: string;
    name: string;
  }>;
  createdAt: string;
}

interface AgentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  editAgent?: Agent | null;
}

function AgentForm({ onSuccess, onCancel, editAgent }: AgentFormProps) {
  const { showSuccess, showError } = useToast();
  const isEditing = !!editAgent;
  const [firstName, setFirstName] = useState(editAgent?.firstName || '');
  const [lastName, setLastName] = useState(editAgent?.lastName || '');
  const [email, setEmail] = useState(editAgent?.email || '');
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>(
    editAgent?.schools.map(s => s.id) || []
  );
  const [availableSchools, setAvailableSchools] = useState<any[]>([]);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Générer un mot de passe sécurisé
  const generatePassword = () => {
    const length = 16;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    // Assurer au moins une majuscule, une minuscule, un chiffre et un caractère spécial
    password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)];
    password += '0123456789'[Math.floor(Math.random() * 10)];
    password += '!@#$%^&*'[Math.floor(Math.random() * 8)];
    
    // Compléter le reste
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }
    
    // Mélanger les caractères
    password = password.split('').sort(() => Math.random() - 0.5).join('');
    
    return password;
  };

  useEffect(() => {
    // Générer un mot de passe au chargement (uniquement pour création)
    if (!isEditing) {
      setGeneratedPassword(generatePassword());
    }
    
    // Charger la liste des écoles
    const loadSchools = async () => {
      try {
        const schools = await schoolService.listSchools();
        setAvailableSchools(schools);
      } catch (error) {
        console.error('Erreur chargement écoles:', error);
        showError('Erreur lors du chargement des écoles');
      }
    };
    loadSchools();

    // Fermer le dropdown si on clique ailleurs
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.school-dropdown-container')) {
        setShowSchoolDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isEditing]);

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showSuccess('Mot de passe copié !');
    } catch (error) {
      showError('Erreur lors de la copie');
    }
  };

  const addSchool = (schoolId: string) => {
    if (!selectedSchools.includes(schoolId)) {
      setSelectedSchools([...selectedSchools, schoolId]);
    }
    setSchoolSearchQuery('');
    setShowSchoolDropdown(false);
  };

  const removeSchool = (schoolId: string) => {
    setSelectedSchools(selectedSchools.filter(id => id !== schoolId));
  };

  const getSelectedSchoolsData = () => {
    return availableSchools.filter(school => selectedSchools.includes(school.id));
  };

  const getFilteredAvailableSchools = () => {
    const query = schoolSearchQuery.toLowerCase();
    return availableSchools.filter(school => 
      !selectedSchools.includes(school.id) &&
      (school.name.toLowerCase().includes(query) ||
       school.code.toLowerCase().includes(query) ||
       school.city?.toLowerCase().includes(query))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedSchools.length === 0) {
      showError('Veuillez sélectionner au moins une école');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && editAgent) {
        // Modification d'un agent existant
        await adminService.updateAgent(editAgent.id, {
          firstName,
          lastName,
          schoolIds: selectedSchools,
        });
        showSuccess(`Agent ${firstName} ${lastName} modifié avec succès !`);
      } else {
        // Création d'un nouvel agent
        await adminService.createGlobalAgent({
          email,
          password: generatedPassword,
          firstName,
          lastName,
          schoolIds: selectedSchools,
        });
        showSuccess(`Agent ${firstName} ${lastName} créé avec succès !`);
      }
      
      onSuccess();
    } catch (error: any) {
      showError(error.response?.data?.message || `Erreur lors de la ${isEditing ? 'modification' : 'création'} de l'agent`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {isEditing ? 'Modifier l\'Agent Référent' : 'Créer un Agent Référent'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prénom *
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Jean"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom *
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Dupont"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email professionnel *
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            placeholder="agent@school.fr"
            disabled={isEditing}
            required
          />
          {isEditing && (
            <p className="text-xs text-gray-500 mt-1">
              L'email ne peut pas être modifié pour des raisons de sécurité
            </p>
          )}
        </div>

        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe (généré automatiquement)
            </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type={showPassword ? 'text' : 'password'}
                value={generatedPassword}
                readOnly
                className="w-full px-4 py-2 pr-20 rounded-xl border border-gray-300 bg-gray-50 font-mono text-sm"
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={copyPassword}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGeneratedPassword(generatePassword())}
              className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 transition-colors font-medium text-sm"
            >
              Regénérer
            </button>
          </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Copiez ce mot de passe avant de créer l'agent. Il ne sera plus visible après.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Écoles attribuées * ({selectedSchools.length})
          </label>
          
          {/* Écoles sélectionnées - Chips */}
          <div className="mb-3">
            {selectedSchools.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-4 text-center">
                <School className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucune école sélectionnée</p>
                <p className="text-xs text-gray-400">Recherchez une école ci-dessous pour l'ajouter</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-xl border border-gray-300">
                {getSelectedSchoolsData().map((school) => (
                  <div
                    key={school.id}
                    className="flex items-center bg-purple-100 text-purple-800 px-3 py-2 rounded-lg border border-purple-300"
                  >
                    <School className="w-4 h-4 mr-2" />
                    <span className="font-medium text-sm">{school.name}</span>
                    <span className="text-xs text-purple-600 ml-2">({school.code})</span>
                    <button
                      type="button"
                      onClick={() => removeSchool(school.id)}
                      className="ml-2 p-1 hover:bg-purple-200 rounded-full transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recherche d'écoles */}
          <div className="relative school-dropdown-container">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={schoolSearchQuery}
                onChange={(e) => {
                  setSchoolSearchQuery(e.target.value);
                  setShowSchoolDropdown(true);
                }}
                onFocus={() => setShowSchoolDropdown(true)}
                placeholder="Rechercher une école à ajouter..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Dropdown des résultats */}
            {showSchoolDropdown && getFilteredAvailableSchools().length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                {getFilteredAvailableSchools().map((school) => (
                  <button
                    key={school.id}
                    type="button"
                    onClick={() => addSchool(school.id)}
                    className="w-full flex items-center justify-between p-3 hover:bg-purple-50 transition-colors text-left border-b last:border-b-0"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{school.name}</div>
                      <div className="text-xs text-gray-600">{school.code} • {school.city}</div>
                    </div>
                    <Plus className="w-4 h-4 text-purple-600" />
                  </button>
                ))}
              </div>
            )}

            {showSchoolDropdown && schoolSearchQuery && getFilteredAvailableSchools().length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg p-4 text-center">
                <p className="text-sm text-gray-500">Aucune école trouvée</p>
              </div>
            )}
          </div>

          {selectedSchools.length === 0 && (
            <p className="text-xs text-red-500 mt-2 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1" />
              Au moins une école est requise
            </p>
          )}
        </div>

        <div className="flex space-x-3 pt-4 border-t">
          <button
            type="submit"
            disabled={isLoading || selectedSchools.length === 0}
            className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {isEditing ? 'Modification...' : 'Création...'}
              </div>
            ) : (
              isEditing ? 'Enregistrer les modifications' : 'Créer l\'agent'
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AgentsManagement() {
  const { showSuccess, showError } = useToast();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const loadAgents = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getAllAgents();
      setAgents(data);
      setFilteredAgents(data);
    } catch (error) {
      showError('Erreur lors du chargement des agents');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgents();
  }, []);

  // Filtrage des agents par recherche
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredAgents(agents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = agents.filter(agent => 
      agent.email.toLowerCase().includes(query) ||
      agent.firstName?.toLowerCase().includes(query) ||
      agent.lastName?.toLowerCase().includes(query) ||
      agent.schools.some(school => 
        school.name.toLowerCase().includes(query) ||
        school.code.toLowerCase().includes(query) ||
        school.city?.toLowerCase().includes(query)
      )
    );
    setFilteredAgents(filtered);
  }, [searchQuery, agents]);

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) return;

    try {
      await adminService.deleteAgent(agentId);
      showSuccess('Agent supprimé avec succès');
      loadAgents();
    } catch (error) {
      showError('Erreur lors de la suppression de l\'agent');
    }
  };

  if (showAddAgent || editingAgent) {
    return (
      <AgentForm
        editAgent={editingAgent}
        onSuccess={() => {
          setShowAddAgent(false);
          setEditingAgent(null);
          loadAgents();
        }}
        onCancel={() => {
          setShowAddAgent(false);
          setEditingAgent(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec recherche et bouton ajouter */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Agents Référents</h2>
            <p className="text-gray-600">
              {filteredAgents.length} agent(s) • Gestion globale des agents sociaux
            </p>
          </div>
          <button
            onClick={() => setShowAddAgent(true)}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-600 hover:to-indigo-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvel agent
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, email ou école..."
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* Liste des agents */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchQuery ? 'Aucun résultat' : 'Aucun agent'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez avec d\'autres mots-clés'
              : 'Créez votre premier agent référent'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddAgent(true)}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
            >
              Créer un agent
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
          {/* Header des colonnes */}
          <div className="bg-gray-100 border-b-2 border-gray-300 p-4">
            <div className="flex items-center w-full justify-between">
              <div className="w-48 px-2">
                <span className="text-sm text-gray-600">Agent</span>
              </div>
              <div className="w-64 px-2">
                <span className="text-sm text-gray-600">Email</span>
              </div>
              <div className="w-48 px-2">
                <span className="text-sm text-gray-600">Écoles</span>
              </div>
              <div className="w-24 px-2">
                <span className="text-sm text-gray-600">Créé le</span>
              </div>
              <div className="w-28 text-center px-2">
                <span className="text-sm text-gray-600">Actions</span>
              </div>
            </div>
          </div>

          <SimpleVirtualizedList<Agent>
            items={filteredAgents}
            height={600}
            itemHeight={80}
            renderItem={({ item: agent }) => (
              <div
                key={agent.id}
                className="hover:bg-purple-50/50 transition-colors border-b border-gray-200 p-4 h-20 flex items-center"
              >
                <div className="flex items-center w-full justify-between">
                  {/* Agent - Largeur fixe */}
                  <div className="flex items-center w-48 px-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3">
                      {agent.firstName?.[0] || agent.email[0].toUpperCase()}
                      {agent.lastName?.[0] || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {agent.firstName && agent.lastName 
                          ? `${agent.firstName} ${agent.lastName}`
                          : agent.email
                        }
                      </div>
                      <div className="flex items-center text-xs text-gray-500">
                        <Shield className="w-3 h-3 mr-1" />
                        Agent Social
                      </div>
                    </div>
                  </div>

                  {/* Email - Largeur fixe */}
                  <div className="w-64 px-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2 text-purple-500" />
                      <span className="font-mono text-xs truncate">{agent.email}</span>
                    </div>
                  </div>

                  {/* Écoles - Largeur fixe */}
                  <div className="w-48 px-2">
                    <div className="flex items-center text-xs text-gray-600">
                      <School className="w-4 h-4 mr-1 text-purple-600" />
                      {agent.schools?.length || 0} école(s)
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      {agent.schools?.slice(0, 2).map(s => s.name).join(', ')}
                      {agent.schools && agent.schools.length > 2 && '...'}
                    </div>
                  </div>

                  {/* Date de création - Largeur fixe */}
                  <div className="w-24 px-2">
                    <div className="text-xs text-gray-500">
                      {new Date(agent.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {/* Actions - Largeur fixe */}
                  <div className="w-28 flex justify-center space-x-1 px-2">
                    <button
                      onClick={() => setEditingAgent(agent)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

export { AgentsManagement };

