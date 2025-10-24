import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, User, Phone, Calendar, GraduationCap, Edit, Trash2, Eye, Upload, Download, ArrowLeft } from 'lucide-react';
import { adminService } from '../../services/api';
import AddStudentForm from './AddStudentForm';
import EditStudentForm from './EditStudentForm';
import ImportStudentsForm from './ImportStudentsForm';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  birthdate: string;
  sex: 'M' | 'F';
  className: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  uniqueId: string;
  createdAt: string;
}

interface SchoolStudentsManagementProps {
  schoolId: string;
  schoolName: string;
  onBack: () => void;
}

export default function SchoolStudentsManagement({ schoolId, schoolName, onBack }: SchoolStudentsManagementProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);

  // État local pour les étudiants
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    loadStudents();
  }, [schoolId]);

  // Filtrage des étudiants
  useEffect(() => {
    let filtered = [...students];

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(student => 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.uniqueId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par classe
    if (selectedClass) {
      filtered = filtered.filter(student => student.className === selectedClass);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, selectedClass]);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await adminService.getSchoolStudents(schoolId);
      setStudents(data);
      setError(null);
      
      // Extraire les classes uniques
      const uniqueClasses = [...new Set(data.map(student => student.className))].sort();
      setClasses(uniqueClasses);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des élèves');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction de chargement pour la pagination infinie
  const fetchStudents = async (page: number, limit: number) => {
    try {
      const data = await adminService.getSchoolStudents(schoolId, {
        search: searchTerm || undefined,
        className: selectedClass || undefined,
        page,
        limit,
      });
      
      return {
        data,
        hasMore: data.length === limit,
      };
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement');
      return { data: [], hasMore: false };
    }
  };

  const handleStudentAdded = () => {
    setShowAddForm(false);
    loadStudents();
  };

  const handleStudentUpdated = () => {
    setShowEditForm(false);
    setSelectedStudent(null);
    loadStudents();
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet élève ? Cette action est irréversible.')) {
      try {
        await adminService.deleteSchoolStudent(schoolId, studentId);
        toast.success('Élève supprimé avec succès');
        loadStudents();
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
      }
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    // TODO: Implémenter modal de détails
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (showAddForm) {
    return (
      <AddStudentForm
        schoolId={schoolId}
        schoolName={schoolName}
        onSuccess={handleStudentAdded}
        onCancel={() => setShowAddForm(false)}
      />
    );
  }

  if (showEditForm && selectedStudent) {
    return (
      <EditStudentForm
        schoolId={schoolId}
        student={selectedStudent}
        onSuccess={handleStudentUpdated}
        onCancel={() => {
          setShowEditForm(false);
          setSelectedStudent(null);
        }}
      />
    );
  }

  if (showImportForm) {
    return (
      <ImportStudentsForm
        schoolId={schoolId}
        schoolName={schoolName}
        onSuccess={() => {
          setShowImportForm(false);
          loadStudents();
        }}
        onCancel={() => setShowImportForm(false)}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-indigo-100 p-2 rounded-xl">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-gray-800">
                    Gestion des élèves
                  </h1>
                  <p className="text-sm text-gray-600">{schoolName}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowImportForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center"
              >
                <Upload className="w-4 h-4 mr-2" />
                Importer Excel
              </button>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter un élève
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full overflow-auto">

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou prénom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="">Toutes les classes</option>
              {classes.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-indigo-50 rounded-2xl p-4">
            <div className="flex items-center">
              <div className="bg-indigo-100 p-3 rounded-2xl mr-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{students.length}</div>
                <div className="text-sm text-gray-600">Total élèves</div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-2xl p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-2xl mr-4">
                <GraduationCap className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{classes.length}</div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-2xl mr-4">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {students.filter(s => s.sex === 'M').length}
                </div>
                <div className="text-sm text-gray-600">Garçons</div>
              </div>
            </div>
          </div>

          <div className="bg-pink-50 rounded-2xl p-4">
            <div className="flex items-center">
              <div className="bg-pink-100 p-3 rounded-2xl mr-4">
                <User className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {students.filter(s => s.sex === 'F').length}
                </div>
                <div className="text-sm text-gray-600">Filles</div>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des élèves */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des élèves...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <Users className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Erreur</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadStudents}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <VirtualizedTable
              data={filteredStudents}
              columns={[
                {
                  key: 'name',
                  label: 'Nom complet',
                  width: 200,
                  render: (student: Student) => (
                    <div className="flex items-center">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'age',
                  label: 'Âge / Sexe',
                  width: 120,
                  render: (student: Student) => (
                    <div>
                      <div className="text-sm text-gray-900">
                        {calculateAge(student.birthdate)} ans
                      </div>
                      <div className="text-sm text-gray-500">
                        {student.sex === 'M' ? 'Masculin' : 'Féminin'}
                      </div>
                    </div>
                  ),
                },
                {
                  key: 'class',
                  label: 'Classe',
                  width: 120,
                  render: (student: Student) => (
                    <div className="flex items-center text-sm text-gray-900">
                      <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                      {student.className}
                    </div>
                  ),
                },
                {
                  key: 'birthdate',
                  label: 'Date de naissance',
                  width: 140,
                  render: (student: Student) => (
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      {formatDate(student.birthdate)}
                    </div>
                  ),
                },
                {
                  key: 'parent',
                  label: 'Parent/Tuteur',
                  width: 150,
                  render: (student: Student) => (
                    <div className="text-sm text-gray-900">
                      {student.parentName || '-'}
                    </div>
                  ),
                },
                {
                  key: 'phone',
                  label: 'Téléphone',
                  width: 140,
                  render: (student: Student) => (
                    <div className="flex items-center text-sm text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {student.parentPhone}
                    </div>
                  ),
                },
                {
                  key: 'uniqueId',
                  label: 'ID unique',
                  width: 120,
                  render: (student: Student) => (
                    <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                      {student.uniqueId}
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  label: 'Actions',
                  width: 120,
                  render: (student: Student) => (
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        title="Voir les détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ),
                },
              ]}
              height={600}
              rowHeight={80}
              loading={paginationLoading}
              onLoadMore={() => loadMore(fetchStudents)}
              hasNextPage={hasNextPage}
              emptyState={
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <Users className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun élève trouvé</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || selectedClass 
                      ? 'Aucun élève ne correspond à vos critères de recherche.'
                      : 'Commencez par ajouter votre premier élève.'
                    }
                  </p>
                  {!searchTerm && !selectedClass && (
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 flex items-center mx-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Ajouter un élève
                    </button>
                  )}
                </div>
              }
            />
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

// Les composants AddStudentForm, EditStudentForm et ImportStudentsForm 
// sont maintenant importés depuis leurs fichiers séparés
