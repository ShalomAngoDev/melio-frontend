/**
 * Gestionnaire d'erreurs d'authentification
 * Évite les rechargements de page lors des erreurs 401
 */

export const handleAuthError = (error: any, setError: (error: string) => void, showError?: (error: string) => void) => {
  console.error('Erreur d\'authentification:', error);
  
  let errorMsg = 'Erreur de connexion. Veuillez réessayer.';
  
  if (error.response?.status === 401) {
    errorMsg = 'Code école, email ou mot de passe incorrect';
  } else if (error.response?.status === 500) {
    errorMsg = 'Erreur du serveur. Veuillez réessayer plus tard.';
  } else if (error.message?.includes('Network Error')) {
    errorMsg = 'Erreur de connexion. Vérifiez votre connexion internet.';
  } else if (error.response?.data?.message) {
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
