import React from 'react';
import { ArrowLeft, FileText, Shield, AlertTriangle, Users, Lock, Phone } from 'lucide-react';
import { fullLogo } from '../assets/images';

interface TermsOfServiceProps {
  onBack: () => void;
}

export default function TermsOfService({ onBack }: TermsOfServiceProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-3">
              <img src={fullLogo} alt="Melio" className="h-8 w-auto" />
              <h1 className="text-xl font-bold text-gray-900">Conditions d'Utilisation</h1>
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
              <FileText className="w-8 h-8 text-blue-600 mr-3" />
              <h2 className="text-2xl font-bold text-gray-900">Conditions d'Utilisation Melio</h2>
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
                1. Objet et acceptation
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Les présentes conditions d'utilisation régissent l'utilisation de la plateforme Melio, 
                destinée à l'accompagnement des jeunes en milieu scolaire. L'utilisation de nos services 
                implique l'acceptation pleine et entière de ces conditions.
              </p>
            </section>

            {/* Définitions */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">2. Définitions</h3>
              <div className="space-y-3">
                <div>
                  <strong className="text-gray-800">Plateforme Melio :</strong>
                  <span className="text-gray-700"> Service web sécurisé pour l'accompagnement des jeunes</span>
                </div>
                <div>
                  <strong className="text-gray-800">Utilisateur :</strong>
                  <span className="text-gray-700"> Professionnel autorisé à utiliser la plateforme</span>
                </div>
                <div>
                  <strong className="text-gray-800">Données sensibles :</strong>
                  <span className="text-gray-700"> Informations relatives aux jeunes et à leur accompagnement</span>
                </div>
              </div>
            </section>

            {/* Accès et utilisation */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-blue-600" />
                3. Accès et utilisation
              </h3>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">3.1 Conditions d'accès</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Être un professionnel autorisé par un établissement partenaire</li>
                  <li>Disposer d'identifiants valides fournis par l'établissement</li>
                  <li>Respecter les procédures de sécurité établies</li>
                </ul>

                <h4 className="font-semibold text-gray-800">3.2 Utilisation autorisée</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Suivi et accompagnement des jeunes</li>
                  <li>Gestion des alertes et signalements</li>
                  <li>Communication sécurisée entre professionnels</li>
                  <li>Génération de rapports d'activité</li>
                </ul>
              </div>
            </section>

            {/* Obligations */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-600" />
                4. Obligations des utilisateurs
              </h3>
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800">4.1 Confidentialité</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Respecter la confidentialité des données des jeunes</li>
                  <li>Ne pas partager les identifiants de connexion</li>
                  <li>Signaler immédiatement toute violation de sécurité</li>
                </ul>

                <h4 className="font-semibold text-gray-800">4.2 Utilisation responsable</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Utiliser la plateforme uniquement dans le cadre professionnel</li>
                  <li>Respecter les droits des jeunes et de leurs familles</li>
                  <li>Suivre les procédures établies par l'établissement</li>
                </ul>
              </div>
            </section>

            {/* Interdictions */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                5. Utilisations interdites
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Accès non autorisé aux données d'autres utilisateurs</li>
                <li>Modification ou suppression non autorisée de données</li>
                <li>Utilisation de la plateforme à des fins non professionnelles</li>
                <li>Partage d'informations sensibles en dehors de la plateforme</li>
                <li>Tentative de contournement des mesures de sécurité</li>
              </ul>
            </section>

            {/* Protection des données */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-5 h-5 mr-2 text-blue-600" />
                6. Protection des données
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Melio s'engage à protéger les données personnelles conformément au RGPD :
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                <li>Chiffrement de toutes les données sensibles</li>
                <li>Accès restreint et tracé</li>
                <li>Sauvegarde sécurisée</li>
                <li>Audits de sécurité réguliers</li>
                <li>Formation du personnel</li>
              </ul>
            </section>

            {/* Responsabilité */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">7. Responsabilité</h3>
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  L'utilisateur est responsable de :
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>La sécurité de ses identifiants de connexion</li>
                  <li>L'utilisation conforme de la plateforme</li>
                  <li>Le respect de la confidentialité des données</li>
                  <li>La signalisation de tout incident de sécurité</li>
                </ul>
              </div>
            </section>

            {/* Modification des conditions */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">8. Modification des conditions</h3>
              <p className="text-gray-700 leading-relaxed">
                Melio se réserve le droit de modifier ces conditions d'utilisation. 
                Les utilisateurs seront informés des modifications par email ou via la plateforme. 
                L'utilisation continue de la plateforme après modification vaut acceptation des nouvelles conditions.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                9. Contact
              </h3>
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 mb-2">
                  Pour toute question concernant ces conditions d'utilisation :
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
