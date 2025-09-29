# 🚀 Guide de Déploiement - Melio Frontend

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Accès au repository GitHub

## 🔧 Configuration

### 1. Variables d'environnement

Créez un fichier `.env` à la racine du projet :

```bash
# URL de l'API backend (Railway)
VITE_API_BASE_URL=https://votre-app.railway.app/api/v1
```

### 2. Installation

```bash
npm install
```

### 3. Build de production

```bash
npm run build
```

## 🌐 Déploiement

### Option 1: Vercel (Recommandé)

1. **Connectez votre repository GitHub à Vercel**
2. **Configurez les variables d'environnement** :
   - `VITE_API_BASE_URL` = `https://votre-app.railway.app/api/v1`
3. **Déployez automatiquement**

### Option 2: Netlify

1. **Connectez votre repository GitHub à Netlify**
2. **Configurez les variables d'environnement**
3. **Déployez**

### Option 3: GitHub Pages

1. **Configurez GitHub Actions** (voir `.github/workflows/deploy.yml`)
2. **Push sur la branche main**
3. **Le déploiement se fait automatiquement**

## 🔗 URLs importantes

- **API Backend** : `https://votre-app.railway.app/api/v1`
- **Documentation API** : `https://votre-app.railway.app/api/v1/docs`
- **Health Check** : `https://votre-app.railway.app/api/v1/health/basic`

## 🛠️ Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint
```

## 📱 Fonctionnalités

- **Interface Admin** : Gestion des établissements
- **Interface Agent** : Gestion des élèves et alertes
- **Interface Élève** : Journal intime et signalements
- **Responsive Design** : Compatible mobile et desktop
- **Authentification JWT** : Sécurisé et moderne

## 🔐 Sécurité

- **HTTPS obligatoire** en production
- **CORS configuré** pour l'API Railway
- **Tokens JWT** avec refresh automatique
- **Validation des données** côté client et serveur
