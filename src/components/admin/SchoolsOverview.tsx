import { useState, useEffect } from 'react';
import { 
  School, 
  AlertTriangle, 
  MapPin, 
  Calendar,
  Eye,
  Settings,
  Plus,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
  EyeOff
} from 'lucide-react';
import { adminService } from '../../services/api';

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
  students: number;
  staff: number;
  alerts: number;
  criticalAlerts: number;
  resolvedAlerts: number;
  reports: number;
  newReports: number;
}

interface SchoolsOverviewProps {
  onAddSchool: () => void;
}

export default function SchoolsOverview({ onAddSchool }: SchoolsOverviewProps) {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [filteredSchools, setFilteredSchools] = useState<SchoolData[]>([]);
  const [displayedSchools, setDisplayedSchools] = useState<SchoolData[]>([]);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(() => {
    const saved = localStorage.getItem('schools-showFilters');
    return saved !== null ? JSON.parse(saved) : true;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(22);

  // Sauvegarder l'état des filtres dans localStorage
  useEffect(() => {
    localStorage.setItem('schools-showFilters', JSON.stringify(showFilters));
  }, [showFilters]);

  // Appliquer les filtres
  useEffect(() => {
    let filtered = schools;
    
    if (filter === 'active') {
      filtered = schools.filter(school => school.status === 'ACTIVE');
    } else if (filter === 'inactive') {
      filtered = schools.filter(school => school.status === 'INACTIVE');
    }
    
    setFilteredSchools(filtered);
    setCurrentPage(1); // Reset à la première page
  }, [schools, filter]);

  // Appliquer la pagination
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setDisplayedSchools(filteredSchools.slice(startIndex, endIndex));
  }, [filteredSchools, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);

  // Charger les écoles avec leurs statistiques
  useEffect(() => {
    const loadSchools = async () => {
      try {
        setIsLoading(true);
        const schoolsData = await adminService.getSchools();
        
        // Charger les statistiques pour chaque école
        const schoolsWithStats = await Promise.all(
          schoolsData.map(async (school) => {
            try {
              const stats = await adminService.getSchoolStats(school.id);
              return {
                ...school,
                students: stats.totalStudents,
                staff: 1, // 1 agent par école
                alerts: stats.totalAlerts,
                criticalAlerts: stats.alertsByRiskLevel?.CRITIQUE || 0,
                resolvedAlerts: stats.alertsByStatus?.TRAITEE || 0,
                reports: stats.totalReports,
                newReports: stats.reportsByStatus?.NOUVEAU || 0,
              };
            } catch (error) {
              console.error(`Erreur lors du chargement des stats pour ${school.name}:`, error);
              return {
                ...school,
                students: 0,
                staff: 1,
                alerts: 0,
                criticalAlerts: 0,
                resolvedAlerts: 0,
                reports: 0,
                newReports: 0,
              };
            }
          })
        );
        
        setSchools(schoolsWithStats);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des écoles');
      } finally {
        setIsLoading(false);
      }
    };

    loadSchools();
  }, []);

  const totalStats = schools.reduce((acc, school) => ({
    students: acc.students + school.students,
    staff: acc.staff + school.staff,
    alerts: acc.alerts + school.alerts,
    criticalAlerts: acc.criticalAlerts + school.criticalAlerts,
    resolvedAlerts: acc.resolvedAlerts + school.resolvedAlerts,
    reports: acc.reports + school.reports,
    newReports: acc.newReports + school.newReports,
  }), { students: 0, staff: 0, alerts: 0, criticalAlerts: 0, resolvedAlerts: 0, reports: 0, newReports: 0 });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mb-4" />
          <p className="text-gray-600">Chargement des écoles...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-lg">
        <div className="flex items-center">
          <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-red-800">Erreur de chargement</h3>
            <p className="text-red-600">{error}</p>
          </div>
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
            <School className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Gestion des Écoles</h2>
              <p className="text-gray-600">Vue d'ensemble de toutes les écoles connectées</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={onAddSchool}
              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter une école
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
      {showFilters && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 mb-4">
          <div className="space-y-4">
            {/* Boutons de filtre */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                  filter === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Toutes ({schools.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                  filter === 'active'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Actives ({schools.filter(s => s.status === 'ACTIVE').length})
              </button>
              <button
                onClick={() => setFilter('inactive')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                  filter === 'inactive'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Inactives ({schools.filter(s => s.status === 'INACTIVE').length})
              </button>
            </div>

            {/* Global Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <div className="text-lg font-bold text-blue-600">{totalStats.students}</div>
                <div className="text-xs text-blue-700">Élèves total</div>
              </div>
              <div className="bg-green-50 rounded-xl p-3 border border-green-100">
                <div className="text-lg font-bold text-green-600">{totalStats.staff}</div>
                <div className="text-xs text-green-700">Agents total</div>
              </div>
              <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
                <div className="text-lg font-bold text-orange-600">{totalStats.alerts}</div>
                <div className="text-xs text-orange-700">Alertes total</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
                <div className="text-lg font-bold text-purple-600">{totalStats.resolvedAlerts}</div>
                <div className="text-xs text-purple-700">Résolues</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone de contenu scrollable */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {displayedSchools.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 text-center shadow-lg border border-white/20">
              <School className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">Aucune école trouvée</h3>
              <p className="text-gray-500">
                {filter === 'active' ? 'Aucune école active' : 
                 filter === 'inactive' ? 'Aucune école inactive' : 
                 'Aucune école enregistrée'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedSchools.map((school) => {
                const isExpanded = selectedSchool === school.code;
                
                return (
                  <div
                    key={school.code}
                    className={`bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden transition-all duration-200 ${
                      school.status === 'INACTIVE' ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-blue-100 p-2 rounded-xl">
                              <School className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-gray-800">{school.name}</h3>
                              <div className="flex items-center space-x-3 text-xs text-gray-600">
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {school.city}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatDate(school.createdAt)}
                                </span>
                              </div>
                            </div>
                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                              school.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {school.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-gray-800">{school.students}</div>
                              <div className="text-xs text-gray-600">Élèves</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-gray-800">{school.staff}</div>
                              <div className="text-xs text-gray-600">Agents</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-gray-800">{school.alerts}</div>
                              <div className="text-xs text-gray-600">Alertes</div>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-3 text-center">
                              <div className="text-lg font-bold text-gray-800">{school.reports}</div>
                              <div className="text-xs text-gray-600">Signalements</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedSchool(selectedSchool === school.code ? null : school.code)}
                            className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all duration-200"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2 text-sm">Informations de l'école</h5>
                                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Adresse:</span>
                                    <span className="font-medium">{school.address1}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Ville:</span>
                                    <span className="font-medium">{school.city}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Code postal:</span>
                                    <span className="font-medium">{school.postalCode}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Niveau:</span>
                                    <span className="font-medium">{school.level}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Contact:</span>
                                    <span className="font-medium">{school.contactName}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Email:</span>
                                    <span className="font-medium">{school.contactEmail}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Téléphone:</span>
                                    <span className="font-medium">{school.contactPhone}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Créé le:</span>
                                    <span className="font-medium">{formatDate(school.createdAt)}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Statut:</span>
                                    <span className={`font-medium ${
                                      school.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                      {school.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2 text-sm">Statistiques des alertes</h5>
                                <div className="bg-gray-50 rounded-xl p-3 space-y-2">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Total alertes:</span>
                                    <span className="font-medium">{school.alerts}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Critiques:</span>
                                    <span className="font-medium text-red-600">{school.criticalAlerts}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Résolues:</span>
                                    <span className="font-medium text-green-600">{school.resolvedAlerts}</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-gray-600">Taux de résolution:</span>
                                    <span className="font-medium">
                                      {school.alerts > 0 ? Math.round((school.resolvedAlerts / school.alerts) * 100) : 0}%
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {currentPage} sur {totalPages} • {displayedSchools.length} école(s) sur cette page
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}