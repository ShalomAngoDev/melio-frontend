import React, { useState } from 'react';
import { Plus, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { schoolService, CreateSchoolData } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface AddSchoolFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AddSchoolForm({ onSuccess, onCancel }: AddSchoolFormProps) {
  const { showSuccess, showError, showWarning } = useToast();
  const [formData, setFormData] = useState<CreateSchoolData>({
    name: '',
    address1: '',
    address2: '',
    postalCode: '',
    city: '',
    country: 'FR',
    timezone: 'Europe/Paris',
    level: 'COLLEGE',
    uaiCode: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    settings: {
      dataRetentionMonths: 18,
      aiThresholds: { LOW: 40, MEDIUM: 65, HIGH: 85 },
      notify: { critical: 'realtime', others: 'daily' }
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      if (!formData.name || !formData.address1 || !formData.postalCode || !formData.city) {
        const errorMsg = 'Veuillez remplir tous les champs obligatoires';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      // Validation du code postal français
      if (formData.country === 'FR' && !/^\d{5}$/.test(formData.postalCode)) {
        const errorMsg = 'Le code postal français doit contenir 5 chiffres';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      // Validation de l'email si fourni
      if (formData.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contactEmail)) {
        const errorMsg = 'Format d\'email invalide';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      // Validation du code UAI si fourni
      if (formData.uaiCode && !/^[A-Z0-9]{8,10}$/.test(formData.uaiCode)) {
        const errorMsg = 'Le code UAI doit contenir entre 8 et 10 caractères alphanumériques';
        showWarning(errorMsg);
        throw new Error(errorMsg);
      }

      await schoolService.createSchool(formData);
      setSuccess(true);
      showSuccess(`École "${formData.name}" créée avec succès !`);
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création de l\'école';
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
          <h3 className="text-xl font-semibold text-gray-800 mb-2">École créée avec succès !</h3>
          <p className="text-gray-600">L'école a été ajoutée à la base de données.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Ajouter une école</h2>
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
        {/* Informations générales */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Informations générales</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'établissement *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Ex: Collège Jean Moulin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Niveau d'enseignement
              </label>
              <select
                name="level"
                value={formData.level}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="PRIMARY">Primaire</option>
                <option value="COLLEGE">Collège</option>
                <option value="LYCEE">Lycée</option>
                <option value="SUP">Supérieur</option>
                <option value="MIXTE">Mixte</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code UAI
              </label>
              <input
                type="text"
                name="uaiCode"
                value={formData.uaiCode}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Ex: 0751234A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pays
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              >
                <option value="FR">France</option>
                <option value="BE">Belgique</option>
                <option value="CH">Suisse</option>
              </select>
            </div>
          </div>
        </div>

        {/* Adresse */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Adresse</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse principale *
            </label>
            <input
              type="text"
              name="address1"
              value={formData.address1}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Ex: 12 rue des Écoles"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse complémentaire
            </label>
            <input
              type="text"
              name="address2"
              value={formData.address2}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Ex: Bâtiment A, 2ème étage"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code postal *
              </label>
              <input
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Ex: 75015"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Ex: Paris"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Contact</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du contact
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Ex: Mme Dupont"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Ex: +33123456789"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              placeholder="Ex: direction@ecole.fr"
            />
          </div>
        </div>

        {/* Boutons */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200 text-sm font-medium"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center text-sm font-medium"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Création...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Créer l'école
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
