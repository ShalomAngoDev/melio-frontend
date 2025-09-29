import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, User, Phone, Mail, Calendar, GraduationCap, Edit, Trash2, Eye } from 'lucide-react';
import { studentService, Student } from '../../services/api';
import AddStudentForm from './AddStudentForm';
import StudentDetailsModal from './StudentDetailsModal';
import EditStudentForm from './EditStudentForm';

export default function StudentsSection() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Récupérer les données depuis le contexte d'authentification
  const schoolCode = 'JMO75-01'; // TODO: Récupérer depuis le contexte

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setIsLoading(true);
      const data = await studentService.listStudents({
        search: searchTerm || undefined,
        className: selectedClass || undefined,
      });
      setStudents(data);
      
      // Extraire les classes uniques
      const uniqueClasses = [...new Set(data.map(student => student.className))].sort();
      setClasses(uniqueClasses);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des élèves');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [searchTerm, selectedClass]);

  const handleStudentAdded = () => {
    setShowAddForm(false);
    loadStudents();
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      // TODO: Implémenter la suppression côté API
      console.log('Delete student:', studentId);
      setShowDeleteConfirm(null);
      loadStudents();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la suppression');
    }
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowEditForm(true);
  };

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
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
        onSuccess={handleStudentAdded}
        onCancel={() => setShowAddForm(false)}
        schoolCode={schoolCode}
      />
    );
  }

  if (showEditForm && selectedStudent) {
    return (
      <EditStudentForm
        student={selectedStudent}
        onSuccess={() => {
          setShowEditForm(false);
          setSelectedStudent(null);
          loadStudents();
        }}
        onCancel={() => {
          setShowEditForm(false);
          setSelectedStudent(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center">
              <Users className="w-6 h-6 mr-3 text-blue-600" />
              Gestion des élèves
            </h1>
            <p className="text-gray-600">Gérez les élèves de votre établissement</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 transition-all duration-200 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un élève
          </button>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher par nom ou prénom..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none"
            >
              <option value="">Toutes les classes</option>
              {classes.map(className => (
                <option key={className} value={className}>{className}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-2xl mr-4">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{students.length}</div>
              <div className="text-sm text-gray-600">Total élèves</div>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-2xl mr-4">
              <GraduationCap className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{classes.length}</div>
              <div className="text-sm text-gray-600">Classes</div>
            </div>
          </div>
        </div>

      </div>

      {/* Liste des élèves */}
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
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
              className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200"
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Liste des élèves ({students.length})
            </h3>
            
            {/* Tableau des élèves */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom complet
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Âge / Sexe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classe
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date de naissance
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parent/Tuteur
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Téléphone
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID unique
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-12 text-center">
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
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => (
                        <tr key={student.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                <User className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {student.firstName} {student.lastName}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {calculateAge(student.birthdate)} ans
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.sex === 'M' ? 'Masculin' : 'Féminin'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                              {student.className}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                              {formatDate(student.birthdate)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.parentName || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center text-sm text-gray-900">
                              <Phone className="w-4 h-4 mr-2 text-gray-400" />
                              {student.parentPhone}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {student.parentEmail || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-mono">
                              {student.uniqueId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleViewStudent(student)}
                                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
                                onClick={() => setShowDeleteConfirm(student.id)}
                                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center mb-4">
              <div className="bg-red-100 p-3 rounded-2xl mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Supprimer l'élève</h3>
                <p className="text-sm text-gray-600">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Êtes-vous sûr de vouloir supprimer cet élève ? Toutes ses données seront définitivement supprimées.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={() => handleDeleteStudent(showDeleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de l'élève */}
      {showDetailsModal && selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedStudent(null);
          }}
        />
      )}
    </div>
  );
}
