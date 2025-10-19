# 🚀 Déploiement sur Vercel - Configuration reCAPTCHA

## Configuration des variables d'environnement

### 1. Variables d'environnement sur Vercel

1. Allez sur [Vercel Dashboard](https://vercel.com/dashboard)
2. Sélectionnez votre projet Melio
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez ces variables :

```
VITE_RECAPTCHA_SITE_KEY = 6Lcxbd0rAAAAAJoSctUtmfjJI1c_rzfUYkuYClMY
VITE_API_BASE_URL = https://web-production-39a0b.up.railway.app/api/v1
```

### 2. Configuration reCAPTCHA

1. Allez sur [Google reCAPTCHA Admin](https://www.google.com/recaptcha/admin)
2. Sélectionnez votre site Melio
3. Cliquez sur **Settings** (icône d'engrenage)
4. Dans **"Domains"**, ajoutez :
   - `votre-app.vercel.app` (domaine Vercel)
   - `melio-soutien.fr` (domaine personnalisé si applicable)

### 3. Déploiement

```bash
# Installer Vercel CLI (si pas déjà fait)
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer
vercel --prod
```

### 4. Vérification

Après déploiement, vérifiez que :
- ✅ reCAPTCHA s'affiche correctement
- ✅ Pas de message "testing purpose only"
- ✅ La validation fonctionne
- ✅ Les domaines sont autorisés dans reCAPTCHA

## 🔐 Sécurité

### Clés reCAPTCHA
- **✅ Site Key (publique)** : `VITE_RECAPTCHA_SITE_KEY` 
  - **Sûre à exposer** publiquement
  - Visible côté client (navigateur)
  - Conçue pour être publique

- **🔒 Secret Key (privée)** : `RECAPTCHA_SECRET_KEY`
  - **CONFIDENTIELLE** - Ne jamais exposer
  - À configurer côté serveur uniquement (Railway)
  - Utilisée pour valider les tokens côté backend

## 📝 Notes importantes

- La clé secrète doit être configurée côté backend (Railway)
- Les domaines doivent être autorisés dans la console reCAPTCHA
- Redéployez après modification des variables d'environnement
