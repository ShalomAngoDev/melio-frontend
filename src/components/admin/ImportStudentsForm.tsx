import React, { useState } from 'react';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X, Loader2 } from 'lucide-react';
import { adminService } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';

interface ImportStudentsFormProps {
  schoolId: string;
  schoolName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

interface ImportResult {
  message: string;
  results: {
    success: number;
    errors: Array<{
      student: string;
      error: string;
    }>;
    created: Array<{
      id: string;
      name: string;
      uniqueId: string;
    }>;
  };
}

export default function ImportStudentsForm({ schoolId, schoolName, onSuccess, onCancel }: ImportStudentsFormProps) {
  const { showSuccess, showError } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [studentsData, setStudentsData] = useState<any[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      showError('Veuillez sélectionner un fichier Excel (.xlsx ou .xls)');
      return;
    }

    // Simuler la lecture du fichier Excel
    // En réalité, vous utiliseriez une bibliothèque comme xlsx
    const mockData = [
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        birthdate: '2010-05-15',
        sex: 'M',
        className: '6ème A',
        parentName: 'Marie Dupont',
        parentPhone: '06 12 34 56 78',
        parentEmail: 'marie.dupont@email.com'
      },
      {
        firstName: 'Sophie',
        lastName: 'Martin',
        birthdate: '2010-08-22',
        sex: 'F',
        className: '6ème A',
        parentName: 'Pierre Martin',
        parentPhone: '06 98 76 54 32',
        parentEmail: 'pierre.martin@email.com'
      }
    ];

    setStudentsData(mockData);
    showSuccess('Fichier Excel chargé avec succès');
  };

  const handleImport = async () => {
    if (studentsData.length === 0) {
      showError('Aucune donnée à importer');
      return;
    }

    try {
      setIsLoading(true);
      const result = await adminService.importSchoolStudents(schoolId, studentsData);
      setImportResult(result);
      
      if (result.results.success > 0) {
        showSuccess(`Import réussi: ${result.results.success} élèves créés`);
      }
      
      if (result.results.errors.length > 0) {
        showError(`${result.results.errors.length} erreurs lors de l'import`);
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Erreur lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    // Créer un template Excel
    const templateData = [
      ['Prénom', 'Nom', 'Date de naissance (YYYY-MM-DD)', 'Sexe (M/F)', 'Classe', 'Nom du parent', 'Téléphone parent', 'Email parent'],
      ['Jean', 'Dupont', '2010-05-15', 'M', '6ème A', 'Marie Dupont', '06 12 34 56 78', 'marie.dupont@email.com'],
      ['Sophie', 'Martin', '2010-08-22', 'F', '6ème A', 'Pierre Martin', '06 98 76 54 32', 'pierre.martin@email.com']
    ];

    // Convertir en CSV pour le téléchargement
    const csvContent = templateData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_eleves.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Upload className="w-6 h-6 mr-3 text-blue-600" />
              Importer des élèves depuis Excel
            </h2>
            <p className="text-gray-600">École: {schoolName}</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!importResult ? (
          <div className="space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FileSpreadsheet className="w-5 h-5 mr-2 text-blue-600" />
                Instructions d'import
              </h3>
              <div className="space-y-3 text-sm text-gray-700">
                <p>1. Téléchargez le modèle Excel ci-dessous</p>
                <p>2. Remplissez le fichier avec les données de vos élèves</p>
                <p>3. Respectez le format des colonnes (voir modèle)</p>
                <p>4. Uploadez le fichier rempli</p>
                <p>5. Vérifiez les données avant l'import final</p>
              </div>
            </div>

            {/* Téléchargement du template */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Modèle Excel</h3>
              <button
                onClick={downloadTemplate}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Télécharger le modèle
              </button>
            </div>

            {/* Upload du fichier */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Fichier Excel</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-700 mb-2">
                    Cliquez pour sélectionner un fichier Excel
                  </p>
                  <p className="text-sm text-gray-500">
                    Formats acceptés: .xlsx, .xls
                  </p>
                </label>
              </div>
            </div>

            {/* Aperçu des données */}
            {studentsData.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Aperçu des données ({studentsData.length} élèves)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left">Prénom</th>
                        <th className="px-4 py-2 text-left">Nom</th>
                        <th className="px-4 py-2 text-left">Date naissance</th>
                        <th className="px-4 py-2 text-left">Sexe</th>
                        <th className="px-4 py-2 text-left">Classe</th>
                        <th className="px-4 py-2 text-left">Parent</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData.slice(0, 5).map((student, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-4 py-2">{student.firstName}</td>
                          <td className="px-4 py-2">{student.lastName}</td>
                          <td className="px-4 py-2">{student.birthdate}</td>
                          <td className="px-4 py-2">{student.sex}</td>
                          <td className="px-4 py-2">{student.className}</td>
                          <td className="px-4 py-2">{student.parentName}</td>
                        </tr>
                      ))}
                      {studentsData.length > 5 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-2 text-center text-gray-500">
                            ... et {studentsData.length - 5} autres élèves
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onCancel}
                className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading || studentsData.length === 0}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Importer {studentsData.length} élèves
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* Résultats de l'import */
          <div className="space-y-6">
            <div className="bg-green-50 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Résultats de l'import
              </h3>
              <p className="text-gray-700">{importResult.message}</p>
            </div>

            {/* Élèves créés avec succès */}
            {importResult.results.created.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Élèves créés ({importResult.results.created.length})
                </h4>
                <div className="space-y-2">
                  {importResult.results.created.map((student, index) => (
                    <div key={index} className="flex items-center justify-between bg-green-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium">{student.name}</span>
                      </div>
                      <span className="text-sm text-gray-600 font-mono">{student.uniqueId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Erreurs */}
            {importResult.results.errors.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-red-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  Erreurs ({importResult.results.errors.length})
                </h4>
                <div className="space-y-2">
                  {importResult.results.errors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between bg-red-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="font-medium">{error.student}</span>
                      </div>
                      <span className="text-sm text-red-600">{error.error}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                onClick={onSuccess}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200"
              >
                Terminer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





