import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Filter, User, Phone, Calendar, GraduationCap, Edit, Trash2, Eye, Upload, Download, ArrowLeft, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { adminService } from '../../services/api';
import AddStudentForm from './AddStudentForm';
import EditStudentForm from './EditStudentForm';
import ImportStudentsForm from './ImportStudentsForm';
import VirtualizedList from '../common/VirtualizedList';

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
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showImportForm, setShowImportForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);

  // État local pour les étudiants
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [hasNextPage, setHasNextPage] = useState(true);

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

  const loadMore = async (fetchFunction: () => Promise<void>) => {
    if (paginationLoading) return;
    setPaginationLoading(true);
    try {
      await fetchFunction();
    } finally {
      setPaginationLoading(false);
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
    setShowViewModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Fonction d'export PDF des données des élèves
  const exportStudentsData = () => {
    const doc = new jsPDF('landscape', 'mm', 'a4');
    
    // Configuration des couleurs
    const primaryColor = '#4F46E5'; // Indigo
    const secondaryColor = '#F3F4F6'; // Gris clair
    const textColor = '#374151'; // Gris foncé
    
    // En-tête du document
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, 297, 20, 'F');
    
    // Titre principal
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Liste des Élèves', 20, 12);
    
    // Informations de l'école
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${schoolName}`, 20, 18);
    
    // Date d'export
    const exportDate = new Date().toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Exporté le ${exportDate}`, 200, 18);
    
    // Préparation des données pour le tableau
    const tableData = filteredStudents.map(student => [
      student.lastName,
      student.firstName,
      student.uniqueId,
      student.className,
      student.sex === 'M' ? 'Garçon' : 'Fille',
      new Date(student.birthdate).toLocaleDateString('fr-FR'),
      student.parentName || 'Non renseigné',
      student.parentPhone || 'Non renseigné',
      student.parentEmail || 'Non renseigné'
    ]);
    
    // Configuration du tableau
    const tableConfig = {
      startY: 25,
      head: [['Nom', 'Prénom', 'ID Unique', 'Classe', 'Sexe', 'Date de naissance', 'Parent', 'Téléphone', 'Email']],
      body: tableData,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: 'linebreak',
        halign: 'left'
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: secondaryColor
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Nom
        1: { cellWidth: 35 }, // Prénom
        2: { cellWidth: 30 }, // ID Unique
        3: { cellWidth: 25 }, // Classe
        4: { cellWidth: 25 }, // Sexe
        5: { cellWidth: 35 }, // Date de naissance
        6: { cellWidth: 35 }, // Parent
        7: { cellWidth: 35 }, // Téléphone
        8: { cellWidth: 42 }  // Email
      },
      margin: { top: 25, right: 0, bottom: 15, left: 0 },
      tableWidth: 'wrap'
    };
    
    // Génération du tableau
    autoTable(doc, tableConfig);
    
    // Pied de page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Numéro de page
      doc.setTextColor(textColor);
      doc.setFontSize(8);
      doc.text(`Page ${i} sur ${pageCount}`, 20, 200);
      
      // Logo ou signature
      doc.text('Melio - Plateforme de Soutien Scolaire', 200, 200);
    }
    
    // Téléchargement du PDF
    const fileName = `eleves_${schoolName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
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
                onClick={exportStudentsData}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all duration-200 flex items-center"
                title="Exporter la liste des élèves en PDF"
              >
                <FileText className="w-4 h-4 mr-2" />
                Exporter PDF
              </button>
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
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header du tableau */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-700">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Nom complet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Classe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>Sexe</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>Contact parent</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Date de naissance</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <span>Actions</span>
                  </div>
                </div>
              </div>
              
              {/* Liste virtualisée */}
              <VirtualizedList
                items={filteredStudents}
                height={520}
                itemHeight={80}
              renderItem={({ index, style, item: student }) => (
                <div style={style} className="flex items-center px-6 py-4 border-b border-gray-100 hover:bg-gray-50">
                  <div className="flex-1 grid grid-cols-6 gap-4 items-center">
                    {/* Nom complet */}
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {student.uniqueId}
                        </div>
                      </div>
                    </div>
                    
                    {/* Classe */}
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {student.className}
                      </span>
                    </div>
                    
                    {/* Sexe */}
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      student.sex === 'M' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-pink-100 text-pink-800'
                    }`}>
                      {student.sex === 'M' ? 'Garçon' : 'Fille'}
                    </span>
                    
                    {/* Contact parent */}
                    <div className="text-sm">
                      {student.parentName && (
                        <div className="font-medium text-gray-900">
                          {student.parentName}
                        </div>
                      )}
                      {student.parentPhone && (
                        <div className="flex items-center space-x-1 text-gray-600">
                          <Phone className="w-3 h-3" />
                          <span>{student.parentPhone}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Date de naissance */}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {new Date(student.birthdate).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewStudent(student)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditStudent(student)}
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudent(student)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              loading={paginationLoading}
              onLoadMore={() => loadMore(fetchStudents)}
              hasNextPage={hasNextPage}
              />
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Modal de visualisation des détails de l'élève */}
      {showViewModal && selectedStudent && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          {/* Header du modal */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedStudent.uniqueId}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowViewModal(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenu du modal */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations personnelles */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Informations personnelles</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Classe</p>
                      <p className="font-medium text-gray-900">{selectedStudent.className}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Date de naissance</p>
                      <p className="font-medium text-gray-900">
                        {new Date(selectedStudent.birthdate).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-5 h-5 flex items-center justify-center">
                      <span className="text-gray-400">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Sexe</p>
                      <p className="font-medium text-gray-900">
                        {selectedStudent.sex === 'M' ? 'Garçon' : 'Fille'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations de contact */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Contact parent</h4>
                
                <div className="space-y-3">
                  {selectedStudent.parentName && (
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Nom du parent</p>
                        <p className="font-medium text-gray-900">{selectedStudent.parentName}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedStudent.parentPhone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">Téléphone</p>
                        <p className="font-medium text-gray-900">{selectedStudent.parentPhone}</p>
                      </div>
                    </div>
                  )}
                  
                  {selectedStudent.parentEmail && (
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 flex items-center justify-center">
                        <span className="text-gray-400">📧</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-medium text-gray-900">{selectedStudent.parentEmail}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEditStudent(selectedStudent);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200 flex items-center space-x-2"
              >
                <Edit className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}

// Les composants AddStudentForm, EditStudentForm et ImportStudentsForm 
// sont maintenant importés depuis leurs fichiers séparés
