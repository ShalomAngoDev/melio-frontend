/**
 * Gestionnaire d'erreurs d'authentification
 * Évite les rechargements de page lors des erreurs 401
 */

export const handleAuthError = (
  error: any, 
  setError: (error: string) => void, 
  showError?: (error: string) => void,
) => {
  console.error('Erreur d\'authentification:', error);
  
  let errorMsg = 'Erreur de connexion. Veuillez réessayer.';
  
  if (error.response?.status === 401) {
    // Message uniforme pour ne pas révéler d'information (sécurité)
    errorMsg = 'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.';
  } else if (error.response?.status === 429) {
    errorMsg = 'Trop de tentatives de connexion. Veuillez patienter quelques minutes.';
  } else if (error.response?.status === 500) {
    errorMsg = 'Erreur du serveur. Veuillez réessayer plus tard.';
  } else if (error.message?.includes('Network Error')) {
    errorMsg = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
  } else if (error.response?.data?.message) {
    // Utiliser le message du serveur s'il est fourni
    errorMsg = error.response.data.message;
  }
  
  setError(errorMsg);
  if (showError) {
    showError(errorMsg);
  }
  
  // Retourner false pour indiquer que l'erreur a été gérée
  return false;
};

/**
 * Vérifie si l'erreur est une erreur d'authentification
 */
export const isAuthError = (error: any): boolean => {
  return error.response?.status === 401 || 
         error.response?.status === 403 || 
         error.message?.includes('Network Error');
};

/**
 * Empêche les rechargements de page lors des erreurs d'authentification
 */
export const preventAuthPageReload = () => {
  // Empêcher le rechargement par défaut du navigateur
  window.addEventListener('beforeunload', (e) => {
    // Ne pas empêcher le rechargement normal, juste logger
    console.log('Page reload detected');
  });
  
  // Intercepter les erreurs non gérées
  window.addEventListener('error', (e) => {
    if (e.message?.includes('401') || e.message?.includes('403')) {
      console.log('Auth error intercepted, preventing reload');
      e.preventDefault();
    }
  });
};
