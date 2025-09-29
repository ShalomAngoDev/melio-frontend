// Script de diagnostic pour l'authentification
export function debugAuth() {
  console.log('🔍 === DIAGNOSTIC AUTHENTIFICATION ===');
  
  // Vérifier le localStorage
  const user = localStorage.getItem('melio_user');
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  console.log('📱 LocalStorage:');
  console.log('  - Utilisateur:', user ? JSON.parse(user) : 'Aucun');
  console.log('  - Access Token:', accessToken ? `${accessToken.substring(0, 20)}...` : 'Aucun');
  console.log('  - Refresh Token:', refreshToken ? `${refreshToken.substring(0, 20)}...` : 'Aucun');
  
  // Vérifier le token JWT
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      console.log('🔐 Token JWT:');
      console.log('  - Payload:', payload);
      console.log('  - Rôle:', payload.role);
      console.log('  - Expiration:', new Date(payload.exp * 1000));
      console.log('  - Est expiré:', new Date() > new Date(payload.exp * 1000));
    } catch (error) {
      console.error('❌ Erreur lors du décodage du token:', error);
    }
  }
  
  console.log('🔍 === FIN DIAGNOSTIC ===');
}

// Fonction pour tester une requête API
export async function testApiRequest() {
  console.log('🧪 === TEST REQUÊTE API ===');
  
  try {
    const response = await fetch('http://localhost:3000/api/v1/admin/statistics/global', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Réponse API:');
    console.log('  - Status:', response.status);
    console.log('  - Headers:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('  - Données:', data);
    } else {
      const error = await response.text();
      console.log('  - Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la requête:', error);
  }
  
  console.log('🧪 === FIN TEST ===');
}


