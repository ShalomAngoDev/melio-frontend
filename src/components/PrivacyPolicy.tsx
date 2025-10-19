import React from 'react';
import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, FileText } from 'lucide-react';
import { fullLogo } from '../assets/images';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export default function PrivacyPolicy({ onBack }: PrivacyPolicyProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <img src={fullLogo} alt="Melio" className="h-8 w-auto" />
              <h1 className="text-xl font-bold text-gray-900">Politique de Confidentialité</h1>
            </div>
            <button
              onClick={onBack}
              className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Politique de Confidentialité Melio</h2>
            </div>
            <p className="text-gray-600">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                1. Introduction
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Melio s'engage à protéger la confidentialité et la sécurité des données personnelles 
                des jeunes et des professionnels utilisant notre plateforme. Cette politique explique 
                comment nous collectons, utilisons et protégeons vos informations.
              </p>
            </section>

            {/* Données collectées */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-blue-600" />
                2. Données que nous collectons
              </h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Données des jeunes :</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Informations d'identification (nom, prénom, date de naissance)</li>
                    <li>Informations scolaires (établissement, classe)</li>
                    <li>Données de suivi psychologique et éducatif</li>
                    <li>Alertes et signalements</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Données des professionnels :</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                    <li>Informations de contact (email, téléphone)</li>
                    <li>Informations professionnelles (établissement, fonction)</li>
                    <li>Données de connexion et d'utilisation</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Utilisation des données */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-5 h-5 mr-2 text-blue-600" />
                3. Utilisation des données
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Nous utilisons vos données uniquement pour :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Fournir et améliorer nos services d'accompagnement</li>
                <li>Faciliter la communication entre professionnels</li>
                <li>Assurer la sécurité et la protection des jeunes</li>
                <li>Respecter nos obligations légales</li>
                <li>Générer des rapports anonymisés pour les établissements</li>
              </ul>
            </section>

            {/* Protection des données */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                4. Protection des données
              </h3>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  Nous mettons en place des mesures de sécurité strictes :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Chiffrement de bout en bout de toutes les données sensibles</li>
                  <li>Accès restreint aux données selon le principe du besoin d'en connaître</li>
                  <li>Audits de sécurité réguliers</li>
                  <li>Formation du personnel sur la protection des données</li>
                  <li>Sauvegarde sécurisée et redondante des données</li>
                </ul>
              </div>
            </section>

            {/* Droits des utilisateurs */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <UserCheck className="w-5 h-5 mr-2 text-blue-600" />
                5. Vos droits
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Droit d'accès à vos données personnelles</li>
                <li>Droit de rectification des données inexactes</li>
                <li>Droit à l'effacement dans certaines conditions</li>
                <li>Droit à la portabilité des données</li>
                <li>Droit d'opposition au traitement</li>
                <li>Droit de limitation du traitement</li>
              </ul>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">6. Contact</h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 mb-2">
                  Pour toute question concernant cette politique de confidentialité :
                </p>
                <p className="text-gray-700">
                  <strong>Email :</strong> support@melio-soutien.fr<br />
                  <strong>Téléphone :</strong> +33 0745697503<br />
                  <strong>Adresse :</strong> Melio, 123 Rue de la Protection, 75001 Paris
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
