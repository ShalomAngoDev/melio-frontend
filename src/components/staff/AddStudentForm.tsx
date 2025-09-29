import React, { useState } from 'react';
import { Plus, X, Save, AlertCircle, CheckCircle, User } from 'lucide-react';
import { studentService, CreateStudentData } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface AddStudentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  schoolCode: string;
}

export default function AddStudentForm({ onSuccess, onCancel, schoolCode }: AddStudentFormProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState<CreateStudentData>({
    schoolCode,
    firstName: '',
    lastName: '',
    birthdate: '',
    sex: 'F',
    className: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
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
        const errorMsg = 'Veuillez remplir tous les champs obligatoires';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      // Validation de la date de naissance
      const birthDate = new Date(formData.birthdate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      
      if (age >= 21) {
        const errorMsg = 'L\'élève doit avoir moins de 21 ans';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      // Validation de l'email si fourni
      if (formData.parentEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
        const errorMsg = 'Format d\'email invalide';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      // Validation du téléphone
      if (!/^[\+]?[0-9\s\-\(\)]{9,15}$/.test(formData.parentPhone)) {
        const errorMsg = 'Format de téléphone invalide';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      await studentService.createStudent(formData);
      setSuccess(true);
      showSuccess(`Élève ${formData.firstName} ${formData.lastName} créé avec succès !`);
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création de l\'élève';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
        <div className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Élève créé avec succès !</h3>
          <p className="text-gray-600">L'élève a été ajouté à la base de données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ajouter un élève</h2>
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

        {/* Code école (lecture seule) */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-xl mr-3">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Code établissement</h4>
              <p className="text-sm text-blue-700 font-mono">{schoolCode}</p>
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
            className="px-6 py-3 bg-green-600 text-white rounded-2xl hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Créer l'élève
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
