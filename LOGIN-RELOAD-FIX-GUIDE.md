# 🔧 Guide de correction - Problème de rechargement lors des erreurs 401

## 🚨 Problème identifié

**Symptôme :** Lors d'une tentative de connexion avec des identifiants incorrects, la page se recharge/redirige au lieu d'afficher simplement l'erreur.

**Causes identifiées :**
1. **Interceptor Axios problématique** : `window.location.href = '/'` forçait un rechargement même sur la page de login
2. **Gestion d'erreur incorrecte** : `e.stopPropagation()` et `e.preventDefault()` dans le catch
3. **Configuration cookies manquante** : Pas de `withCredentials: true` sur les appels de login

## ✅ Corrections apportées

### 1. **Interceptor Axios amélioré** (`web/src/services/api.ts`)
```typescript
// AVANT - Forçait toujours un rechargement
window.location.href = '/';

// APRÈS - Évite le rechargement sur la page de login
if (!window.location.pathname.includes('/login')) {
  window.location.href = '/';
}
```

### 2. **Support des cookies activé** (`web/src/services/api.ts`)
```typescript
// Configuration axios avec support des cookies
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ✅ Nouveau
});

// Appels de login avec cookies explicites
agentLogin: async (schoolCode: string, email: string, password: string) => {
  const response = await api.post('/auth/agent/login', {
    schoolCode, email, password,
  }, {
    withCredentials: true, // ✅ Nouveau
  });
  return response.data;
},
```

### 3. **Protection contre les soumissions multiples**
```typescript
// Dans LoginScreen.tsx et AdminLoginScreen.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ✅ Nouveau - Éviter les soumissions multiples
  if (isLoading) {
    return;
  }
  
  setIsLoading(true);
  // ... reste du code
};
```

### 4. **Gestion d'erreur simplifiée** (`AdminLoginScreen.tsx`)
```typescript
// AVANT - Logique incorrecte
e.stopPropagation();
e.preventDefault();

// APRÈS - Supprimé, gestion normale
setError(errorMessage);
setIsLoading(false);
```

## 🧪 Tests de validation

### Test 1 : Email invalide (devrait rester sur la page)
1. Aller sur `/login`
2. Saisir un email invalide comme `azaz@sd`
3. Cliquer "Se connecter"
4. **Résultat attendu :** Aucun appel réseau, pas de rechargement

### Test 2 : Identifiants incorrects (devrait afficher l'erreur sans recharger)
1. Aller sur `/login`
2. Saisir un email valide comme `test@example.com`
3. Saisir un mot de passe incorrect
4. Cliquer "Se connecter"
5. **Résultat attendu :** Erreur 401 affichée, page ne se recharge pas

### Test 3 : Identifiants corrects (devrait rediriger normalement)
1. Aller sur `/login`
2. Saisir les identifiants de démo
3. Cliquer "Se connecter"
4. **Résultat attendu :** Connexion réussie, redirection vers le dashboard

### Test 4 : Protection contre double-clic
1. Aller sur `/login`
2. Saisir des identifiants incorrects
3. Cliquer rapidement plusieurs fois sur "Se connecter"
4. **Résultat attendu :** Un seul appel API, pas de requêtes multiples

## 🔍 Vérifications DevTools

### Network Tab
- **Avant correction :** Plusieurs requêtes, codes 30x (redirections)
- **Après correction :** Une seule requête POST, code 401 propre

### Console
- **Avant correction :** Erreurs de navigation/redirection
- **Après correction :** Erreur 401 propre sans redirection

### Application Tab (Cookies)
- Vérifier que les cookies de session sont bien posés et persistants
- Vérifier les paramètres `SameSite` et `Secure` selon l'environnement

## 🌐 Configuration CORS (Backend)

Le backend est déjà configuré correctement :
```typescript
// backend/src/main.ts
app.enableCors({
  origin: corsOrigins, // Défini dans CORS_ORIGINS
  credentials: true,   // ✅ Support des cookies
});
```

## 📋 Variables d'environnement requises

```bash
# Backend (.env)
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080,https://ton-domaine.com

# Frontend (.env)
VITE_API_BASE_URL=https://ton-api.com/api/v1
```

## 🚀 Déploiement

1. **Backend :** Aucun changement requis (CORS déjà configuré)
2. **Frontend :** Déployer les fichiers modifiés
3. **Variables :** S'assurer que `CORS_ORIGINS` inclut le domaine de production

## ✅ Validation finale

Après déploiement, tester :
- [ ] Connexion avec identifiants corrects → Redirection normale
- [ ] Connexion avec identifiants incorrects → Erreur sans rechargement
- [ ] Email invalide → Validation frontend, pas d'appel réseau
- [ ] Double-clic → Protection contre soumissions multiples
- [ ] Cookies persistants → Session maintenue entre les requêtes

Le problème de "flash + recharge" devrait maintenant être résolu ! 🎉
