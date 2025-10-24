// Script pour nettoyer l'authentification et forcer la reconnexion
export function clearAuth() {
  console.log('🧹 Nettoyage de l\'authentification...');
  
  // Supprimer tous les tokens et données utilisateur
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('melio_user');
  
  console.log('✅ Authentification nettoyée');
  console.log('🔄 Redirection vers la page de connexion...');
  
  // Rediriger vers la page de connexion
  window.location.href = '/';
}

// Fonction pour forcer la reconnexion admin
export function forceAdminLogin() {
  console.log('👑 Forçage de la reconnexion admin...');
  
  // Nettoyer l'authentification
  clearAuth();
  
  // Attendre un peu puis rediriger
  setTimeout(() => {
    console.log('🔑 Veuillez vous connecter avec :');
    console.log('   - Email: admin@melio.app');
    console.log('   - Mot de passe: admin123');
  }, 1000);
}










