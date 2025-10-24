import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, User, Phone, Calendar, GraduationCap, Eye, Download } from 'lucide-react';
import { studentService, Student } from '../../services/api';
import StudentDetailsModal from './StudentDetailsModal';
import SimpleVirtualizedList from '../common/SimpleVirtualizedList';

interface StudentsSectionProps {
  schoolId: string;
  schoolName?: string;
  schoolCode?: string;
}

export default function StudentsSection({ schoolId, schoolName, schoolCode }: StudentsSectionProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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
      const data = await studentService.listStudents({});
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

  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const exportToExcel = () => {
    // Créer les données CSV avec informations de l'école
    const csvData = [
      ['École', schoolName || 'Non spécifiée', ''],
      ['Code d\'accès', schoolCode || 'Non spécifié', ''],
      ['Date d\'export', new Date().toLocaleDateString('fr-FR'), ''],
      ['', '', ''], // Ligne vide
      ['NOM', 'Prénom', 'ID Unique'], // Header des élèves
      ...filteredStudents.map(student => [
        student.lastName,
        student.firstName,
        student.uniqueId
      ])
    ];

    // Convertir en CSV
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    
    // Créer le nom de fichier avec école et code
    const schoolNameClean = schoolName ? schoolName.replace(/[^a-zA-Z0-9]/g, '_') : 'ecole';
    const schoolCodeClean = schoolCode ? schoolCode.replace(/[^a-zA-Z0-9]/g, '_') : 'code';
    const fileName = `eleves_${schoolNameClean}_${schoolCodeClean}_${new Date().toISOString().split('T')[0]}.csv`;
    
    // Créer et télécharger le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des élèves...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <div className="text-red-600 mr-3">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec recherche et filtres */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Users className="w-8 h-8 mr-3 text-blue-600" />
            Gestion des élèves
          </h2>
          <button
            onClick={exportToExcel}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors duration-200"
            title="Exporter la liste des élèves"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher un élève..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
              >
                <option value="">Toutes les classes</option>
                {classes.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement des élèves...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Liste des élèves ({filteredStudents.length})
            </h3>
            
            {/* Liste virtualisée des élèves */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden">
              {/* Header des colonnes */}
              <div className="bg-gray-100 border-b-2 border-gray-300 p-4">
                <div className="flex items-center w-full justify-between">
                  <div className="w-48 px-2">
                    <span className="text-sm text-gray-600">Nom complet</span>
                  </div>
                  <div className="w-24 text-center px-2">
                    <span className="text-sm text-gray-600">Âge / Sexe</span>
                  </div>
                  <div className="w-24 text-center px-2">
                    <span className="text-sm text-gray-600">Classe</span>
                  </div>
                  <div className="w-28 text-center px-2">
                    <span className="text-sm text-gray-600">Date de naissance</span>
                  </div>
                  <div className="w-32 text-center px-2">
                    <span className="text-sm text-gray-600">Parent/Tuteur</span>
                  </div>
                  <div className="w-28 text-center px-2">
                    <span className="text-sm text-gray-600">Téléphone</span>
                  </div>
                  <div className="w-24 text-center px-2">
                    <span className="text-sm text-gray-600">ID unique</span>
                  </div>
                  <div className="w-28 text-center px-2">
                    <span className="text-sm text-gray-600">Consultation</span>
                  </div>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Users className="w-12 h-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Aucun élève trouvé</h3>
                  <p className="text-gray-600">
                    {searchTerm || selectedClass 
                      ? 'Aucun élève ne correspond à vos critères de recherche.'
                      : 'Aucun élève enregistré pour le moment.'
                    }
                  </p>
                </div>
              ) : (
                <SimpleVirtualizedList<Student>
                  items={filteredStudents}
                  height={600}
                  itemHeight={80}
                  renderItem={({ item: student }) => (
                    <div 
                      key={student.id}
                      className="hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 p-4 h-20 flex items-center"
                    >
                      <div className="flex items-center w-full justify-between">
                        {/* Nom complet */}
                        <div className="flex items-center w-48 px-2">
                          <div className="bg-blue-100 p-2 rounded-lg mr-3">
                            <User className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {student.firstName} {student.lastName}
                            </div>
                          </div>
                        </div>

                        {/* Âge / Sexe */}
                        <div className="w-24 text-center px-2">
                          <div className="text-sm text-gray-900">
                            {calculateAge(student.birthdate)} ans
                          </div>
                          <div className="text-sm text-gray-500">
                            {student.sex === 'M' ? 'M' : 'F'}
                          </div>
                        </div>

                        {/* Classe */}
                        <div className="w-24 flex items-center justify-center px-2">
                          <div className="flex items-center text-sm text-gray-900">
                            <GraduationCap className="w-4 h-4 mr-1 text-gray-400" />
                            {student.className}
                          </div>
                        </div>

                        {/* Date de naissance */}
                        <div className="w-28 text-center px-2">
                          <div className="flex items-center justify-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {formatDate(student.birthdate)}
                          </div>
                        </div>

                        {/* Parent/Tuteur */}
                        <div className="w-32 text-center px-2">
                          <div className="text-sm text-gray-900 truncate">
                            {student.parentName || '-'}
                          </div>
                        </div>

                        {/* Téléphone */}
                        <div className="w-28 text-center px-2">
                          <div className="flex items-center justify-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {student.parentPhone || '-'}
                          </div>
                        </div>

                        {/* ID unique */}
                        <div className="w-24 text-center px-2">
                          <div className="text-sm text-gray-900 font-mono truncate">
                            {student.uniqueId}
                          </div>
                        </div>

                        {/* Consultation */}
                        <div className="w-28 flex justify-center px-2">
                          <button
                            onClick={() => handleViewStudent(student)}
                            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                />
              )}
            </div>
          </div>
        )}
      </div>

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