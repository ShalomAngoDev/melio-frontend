import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, CheckCircle, User } from 'lucide-react';
import { Student } from '../../services/api';

interface EditStudentFormProps {
  student: Student;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function EditStudentForm({ student, onSuccess, onCancel }: EditStudentFormProps) {
  const [formData, setFormData] = useState({
    firstName: student.firstName,
    lastName: student.lastName,
    birthdate: student.birthdate,
    sex: student.sex,
    className: student.className,
    parentName: student.parentName || '',
    parentPhone: student.parentPhone,
    parentEmail: student.parentEmail || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validation des champs obligatoires
      if (!formData.firstName || !formData.lastName || !formData.birthdate || !formData.sex || !formData.className || !formData.parentPhone) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation de la date de naissance
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age >= 21) {
        throw new Error('L\'élève doit avoir moins de 21 ans');
      }

      // Validation de l'email si fourni
      if (formData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        throw new Error('Format d\'email invalide');
      }

      // Validation du téléphone
      if (!/^[\+]?[0-9\s\-\(\)]{9,15}$/.test(formData.parentPhone)) {
        throw new Error('Format de téléphone invalide');
      }

      // TODO: Appeler l'API de mise à jour
      console.log('Update student:', student.id, formData);
      
      setSuccess(true);
      
      // Fermer le formulaire après 2 secondes
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2000);

    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de l\'élève');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Élève modifié avec succès !</h3>
          <p className="text-gray-600">Les modifications ont été enregistrées.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Modifier l'élève</h2>
        <button
          onClick={onCancel}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Erreur</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations de l'élève */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Informations de l'élève
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: Marie"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de famille *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: Dupont"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de naissance *
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sexe *
              </label>
              <select
                name="sex"
                value={formData.sex}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="F">Féminin</option>
                <option value="M">Masculin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Classe *
              </label>
              <input
                type="text"
                name="className"
                value={formData.className}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: 6ème A, 5ème B, 3ème C"
              />
            </div>
          </div>
        </div>

        {/* Informations du parent/tuteur */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Informations du parent/tuteur</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nom du parent/tuteur
            </label>
            <input
              type="text"
              name="parentName"
              value={formData.parentName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Ex: Mme Dupont"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: +33611223344"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Ex: parent@example.com"
              />
            </div>
          </div>
        </div>

        {/* Informations système (lecture seule) */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
          <div className="flex items-center mb-2">
            <div className="bg-gray-100 p-2 rounded-xl mr-3">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-800">Identifiant unique</h4>
              <p className="text-sm text-gray-600 font-mono">{student.uniqueId}</p>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-2xl transition-all duration-200"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Mise à jour...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Enregistrer les modifications
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
