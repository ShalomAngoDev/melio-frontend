import React from 'react';
import { X, User, Phone, Mail, Calendar, GraduationCap, Hash, Clock, Users } from 'lucide-react';
import { Student } from '../../services/api';

interface StudentDetailsModalProps {
  student: Student;
  onClose: () => void;
}

export default function StudentDetailsModal({ student, onClose }: StudentDetailsModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-2xl mr-4">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-gray-600">
                {calculateAge(student.birthdate)} ans • {student.className}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informations personnelles */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Hash className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Identifiant unique</span>
                </div>
                <p className="text-lg font-mono text-gray-800">{student.uniqueId}</p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <GraduationCap className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Classe</span>
                </div>
                <p className="text-lg text-gray-800">{student.className}</p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Calendar className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Date de naissance</span>
                </div>
                <p className="text-lg text-gray-800">{formatDate(student.birthdate)}</p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Âge</span>
                </div>
                <p className="text-lg text-gray-800">{calculateAge(student.birthdate)} ans</p>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Users className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Sexe</span>
                </div>
                <p className="text-lg text-gray-800">{student.sex === 'M' ? 'Masculin' : 'Féminin'}</p>
              </div>
            </div>
          </div>

          {/* Informations du parent/tuteur */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations du parent/tuteur</h3>
            <div className="space-y-4">
              {student.parentName && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Nom du parent/tuteur</span>
                  </div>
                  <p className="text-lg text-gray-800">{student.parentName}</p>
                </div>
              )}
              
              <div className="bg-gray-50 rounded-2xl p-4">
                <div className="flex items-center mb-2">
                  <Phone className="w-4 h-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Téléphone</span>
                </div>
                <p className="text-lg text-gray-800">{student.parentPhone}</p>
              </div>
              
              {student.parentEmail && (
                <div className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center mb-2">
                    <Mail className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Email</span>
                  </div>
                  <p className="text-lg text-gray-800">{student.parentEmail}</p>
                </div>
              )}
            </div>
          </div>

          {/* Informations système */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Informations système</h3>
            <div className="bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center mb-2">
                <Clock className="w-4 h-4 text-gray-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">Date de création</span>
              </div>
              <p className="text-lg text-gray-800">
                {new Date(student.createdAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 text-white rounded-2xl hover:bg-gray-700 transition-all duration-200"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
