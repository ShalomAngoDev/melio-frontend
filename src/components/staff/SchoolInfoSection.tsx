import React, { useState, useEffect } from 'react';
import { Building2, MapPin, Phone, Mail, Globe, Calendar, Users, Shield, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { schoolService, SchoolInfo } from '../../services/api';


interface AgentInfo {
  id: string;
  email: string;
  schoolId: string;
  role: string;
}

interface SchoolInfoSectionProps {
  schoolId: string;
}

export default function SchoolInfoSection({ schoolId }: SchoolInfoSectionProps) {
  const { user } = useAuth();
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo | null>(null);
  const [agentInfo, setAgentInfo] = useState<AgentInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchoolAndAgentInfo();
  }, [schoolId]);

  const loadSchoolAndAgentInfo = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // V2: Pour agents multi-écoles, récupérer l'école spécifique via l'API
      const schoolData = await schoolService.getSchoolInfo(schoolId);
      setSchoolInfo(schoolData);

      const agentInfo: AgentInfo = {
        id: user?.id || '',
        email: user?.email || '',
        schoolId: schoolId,
        role: 'ROLE_AGENT',
      };
      setAgentInfo(agentInfo);
    } catch (err: any) {
      console.error('Failed to load school info:', err);
      setError(err.response?.data?.message || err.message || 'Erreur lors du chargement des informations');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'INACTIVE':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'INACTIVE':
        return 'Inactif';
      case 'PENDING':
        return 'En attente';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
          <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Informations de l'établissement */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-3 rounded-2xl mr-4">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Informations de l'établissement</h2>
            <p className="text-gray-600">Détails de votre école</p>
          </div>
        </div>

        {schoolInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations générales */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Informations générales</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Building2 className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{schoolInfo.name}</div>
                      <div className="text-xs text-gray-500">Nom de l'établissement</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{schoolInfo.code}</div>
                      <div className="text-xs text-gray-500">Code établissement</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Globe className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{schoolInfo.level || 'Non spécifié'}</div>
                      <div className="text-xs text-gray-500">Niveau d'enseignement</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-gray-500 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{formatDate(schoolInfo.createdAt)}</div>
                      <div className="text-xs text-gray-500">Date de création</div>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(schoolInfo.status)}`}>
                      {getStatusText(schoolInfo.status)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Adresse et contact */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Adresse et contact</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="w-4 h-4 text-gray-500 mr-3 mt-0.5" />
                    <div>
                      <div className="text-sm font-medium text-gray-700">{schoolInfo.address1}</div>
                      {schoolInfo.address2 && (
                        <div className="text-sm text-gray-600">{schoolInfo.address2}</div>
                      )}
                      <div className="text-sm text-gray-600">
                        {schoolInfo.postalCode} {schoolInfo.city}
                      </div>
                      <div className="text-xs text-gray-500">Adresse</div>
                    </div>
                  </div>

                  {schoolInfo.contactName && (
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">{schoolInfo.contactName}</div>
                        <div className="text-xs text-gray-500">Contact principal</div>
                      </div>
                    </div>
                  )}

                  {schoolInfo.contactPhone && (
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">{schoolInfo.contactPhone}</div>
                        <div className="text-xs text-gray-500">Téléphone</div>
                      </div>
                    </div>
                  )}

                  {schoolInfo.contactEmail && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">{schoolInfo.contactEmail}</div>
                        <div className="text-xs text-gray-500">Email</div>
                      </div>
                    </div>
                  )}

                  {schoolInfo.uaiCode && (
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-500 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-700">{schoolInfo.uaiCode}</div>
                        <div className="text-xs text-gray-500">Code UAI</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Informations de l'agent */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-lg border border-white/20">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-3 rounded-2xl mr-4">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Vos informations</h2>
            <p className="text-gray-600">Profil de l'agent connecté</p>
          </div>
        </div>

        {agentInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center">
                <Mail className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-700">{agentInfo.email}</div>
                  <div className="text-xs text-gray-500">Email de connexion</div>
                </div>
              </div>

              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-700">Agent social</div>
                  <div className="text-xs text-gray-500">Rôle</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <Building2 className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-700">{schoolInfo?.name}</div>
                  <div className="text-xs text-gray-500">Établissement assigné</div>
                </div>
              </div>

              <div className="flex items-center">
                <Shield className="w-4 h-4 text-gray-500 mr-3" />
                <div>
                  <div className="text-sm font-medium text-gray-700">{schoolInfo?.code}</div>
                  <div className="text-xs text-gray-500">Code établissement</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
