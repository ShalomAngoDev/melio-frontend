import { useState, useEffect } from 'react';
import { 
  School, 
  AlertTriangle, 
  MapPin, 
  Plus,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  Users,
  Bell,
  FileText
} from 'lucide-react';
import { adminService } from '../../services/api';
import SchoolDetails from './SchoolDetails';

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
  const [selectedSchoolId, setSelectedSchoolId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

  // Appliquer les filtres et la recherche
  useEffect(() => {
    let filtered = schools;
    
    // Filtre par statut
    if (filter === 'active') {
      filtered = filtered.filter(school => school.status === 'ACTIVE');
    } else if (filter === 'inactive') {
      filtered = filtered.filter(school => school.status === 'INACTIVE');
    }
    
    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(school =>
        school.name.toLowerCase().includes(query) ||
        school.code.toLowerCase().includes(query) ||
        school.city.toLowerCase().includes(query) ||
        school.uaiCode.toLowerCase().includes(query) ||
        school.level.toLowerCase().includes(query)
      );
    }
    
    setFilteredSchools(filtered);
    setCurrentPage(1); // Reset à la première page
  }, [schools, filter, searchQuery]);

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

  // Fonction pour recharger les écoles
  const reloadSchools = async () => {
    try {
      const schoolsData = await adminService.getSchools();
      const schoolsWithStats = await Promise.all(
        schoolsData.map(async (school) => {
          try {
            const stats = await adminService.getSchoolStats(school.id);
            return {
              ...school,
              students: stats.totalStudents,
              staff: 1,
              alerts: stats.totalAlerts,
              criticalAlerts: stats.alertsByRiskLevel?.CRITIQUE || 0,
              resolvedAlerts: stats.alertsByStatus?.TRAITEE || 0,
              reports: stats.totalReports,
              newReports: stats.reportsByStatus?.NOUVEAU || 0,
            };
          } catch (error) {
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
    } catch (error) {
      console.error('Erreur lors du rechargement:', error);
    }
  };

  // Si une école est sélectionnée, afficher ses détails
  if (selectedSchoolId) {
    return (
      <SchoolDetails
        schoolId={selectedSchoolId}
        onBack={() => setSelectedSchoolId(null)}
        onUpdate={reloadSchools}
      />
    );
  }

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
    <div className="space-y-6">
      {/* Header avec recherche */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Gestion des Écoles</h2>
            <p className="text-gray-600">
              {filteredSchools.length} école(s) • {totalStats.students} élèves
            </p>
          </div>
          <button
            onClick={onAddSchool}
            className="flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-blue-700 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle école
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, ville, code UAI ou niveau..."
            className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
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

      {/* Filtres rapides */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                filter === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Toutes • {schools.length}
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                filter === 'active'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Actives • {schools.filter(s => s.status === 'ACTIVE').length}
            </button>
            <button
              onClick={() => setFilter('inactive')}
              className={`px-4 py-2 rounded-xl font-medium transition-all text-sm ${
                filter === 'inactive'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Inactives • {schools.filter(s => s.status === 'INACTIVE').length}
            </button>
          </div>

          {/* Stats rapides */}
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1 text-blue-500" />
              <span className="font-medium">{totalStats.students}</span>
              <span className="ml-1">élèves</span>
            </div>
            <div className="flex items-center">
              <Bell className="w-4 h-4 mr-1 text-orange-500" />
              <span className="font-medium">{totalStats.alerts}</span>
              <span className="ml-1">alertes</span>
            </div>
            <div className="flex items-center">
              <FileText className="w-4 h-4 mr-1 text-purple-500" />
              <span className="font-medium">{totalStats.reports}</span>
              <span className="ml-1">signalements</span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des écoles */}
      {displayedSchools.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20">
          <School className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchQuery ? 'Aucun résultat' : 'Aucune école trouvée'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchQuery 
              ? 'Essayez avec d\'autres mots-clés'
              : filter === 'active' ? 'Aucune école active' : 
                filter === 'inactive' ? 'Aucune école inactive' : 
                'Créez votre première école'
            }
          </p>
          {!searchQuery && (
            <button
              onClick={onAddSchool}
              className="px-6 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
            >
              Créer une école
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayedSchools.map((school) => (
            <button
              key={school.code}
              onClick={() => setSelectedSchoolId(school.id)}
              className={`bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/20 hover:shadow-xl transition-all text-left ${
                school.status === 'INACTIVE' ? 'opacity-60' : ''
              } hover:scale-[1.02] hover:border-indigo-300`}
            >
              {/* Header de la carte */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {school.name[0]}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">{school.name}</h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin className="w-3 h-3 mr-1" />
                      {school.city}
                    </div>
                  </div>
                </div>
              </div>

              {/* Badge statut + code */}
              <div className="flex items-center justify-between mb-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  school.status === 'ACTIVE' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {school.status === 'ACTIVE' ? '● Active' : '○ Inactive'}
                </span>
                <span className="text-xs text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                  {school.code}
                </span>
              </div>

              {/* Stats compactes */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-blue-50 rounded-lg p-2 text-center">
                  <Users className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-blue-600">{school.students}</div>
                  <div className="text-xs text-blue-700">Élèves</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-2 text-center">
                  <Bell className="w-4 h-4 text-orange-600 mx-auto mb-1" />
                  <div className="text-lg font-bold text-orange-600">{school.alerts}</div>
                  <div className="text-xs text-orange-700">Alertes</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page <span className="font-semibold">{currentPage}</span> sur <span className="font-semibold">{totalPages}</span>
              <span className="mx-2">•</span>
              <span className="font-semibold">{displayedSchools.length}</span> école(s)
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  const isActive = pageNum === currentPage;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-indigo-500 text-white shadow-lg'
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
                className="p-2 rounded-xl bg-gray-100 text-gray-600 hover:bg-indigo-100 hover:text-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}