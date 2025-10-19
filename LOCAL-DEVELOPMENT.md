# 🚀 Développement Local - Melio Web (École)

Ce guide vous permet de configurer et lancer l'application web Melio en local pour les agents et administrateurs.

## 📋 Prérequis

### 1. Logiciels requis
- **Node.js** (v18+)
- **npm** ou **yarn**
- **Backend Melio** en cours d'exécution sur `http://localhost:3000`

### 2. Installation des dépendances
```bash
cd web
npm install
```

## ⚙️ Configuration

### 1. Fichier de configuration

Le fichier `.env` a été créé automatiquement avec la configuration locale :

```bash
# Configuration de l'API pour développement local
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### 2. Vérifier la configuration

Le fichier `src/services/api.ts` utilise automatiquement la variable d'environnement :
- En **local** : `http://localhost:3000/api/v1`
- En **production** : URL Railway (configurée automatiquement)

## 🚀 Lancement

### Mode Développement

```bash
cd web
npm run dev
```

L'application sera accessible sur : **http://localhost:5173**

### Mode Production Locale (pour tester le build)

```bash
cd web
npm run build
npm run preview
```

## 👥 Comptes de test

### Compte Admin Melio

**Pour accéder au tableau de bord administrateur :**
- **URL** : http://localhost:5173
- **Email** : `admin@melio.app`
- **Mot de passe** : `admin123`
- **Rôle** : Administrateur Melio (gestion de tous les établissements)

### Comptes Agents

Les comptes agents doivent être créés par l'administrateur Melio via l'interface web.

**Pour créer un agent :**
1. Se connecter en tant qu'admin Melio
2. Accéder à "Gestion des Écoles"
3. Sélectionner une école
4. Ajouter un agent avec son email et mot de passe

## 📁 Structure du Projet

```
web/
├── src/
│   ├── components/         # Composants React
│   │   ├── admin/         # Pages admin Melio
│   │   ├── auth/          # Pages de connexion
│   │   ├── common/        # Composants réutilisables
│   │   └── staff/         # Pages agents d'établissement
│   ├── contexts/          # Contextes React (Auth, Toast, Alert)
│   ├── services/          # Services API
│   └── utils/             # Utilitaires
├── public/                # Ressources statiques
├── .env                   # Configuration locale (ignoré par Git)
└── vite.config.ts         # Configuration Vite
```

## 🔧 Résolution de problèmes

### Erreur de connexion au backend

**Symptôme** : `Network Error` ou `CORS Error`

**Solutions** :
1. Vérifier que le backend est bien lancé sur `http://localhost:3000`
2. Vérifier que le fichier `.env` contient la bonne URL
3. Vérifier les logs du backend pour voir s'il reçoit les requêtes

```bash
# Dans un terminal séparé, vérifier le backend
cd ../backend
npm run dev
```

### Le hot-reload ne fonctionne pas

**Solution** :
```bash
# Arrêter le serveur (Ctrl+C)
# Supprimer le cache
rm -rf node_modules/.vite
# Relancer
npm run dev
```

### Port 3000 déjà utilisé

**Problème** : Le port 3000 est déjà utilisé par le backend.

**Solution 1** : Modifier le port dans `vite.config.ts` :
```typescript
server: {
  port: 5173,  // Changer ici
  host: true,
}
```

**Solution 2** : Utiliser un port différent temporairement :
```bash
PORT=5173 npm run dev
```

### Problèmes d'authentification

**Symptôme** : Impossible de se connecter, erreur 401

**Solutions** :
1. Vider le localStorage du navigateur :
   - Ouvrir la console (F12)
   - Onglet "Application" → "Local Storage"
   - Supprimer toutes les clés
   - Recharger la page

2. Vérifier que l'admin existe dans la base :
```bash
cd ../backend
psql -U postgres -d melio_local -c "SELECT email, role FROM admin_users;"
```

3. Recréer l'admin si nécessaire :
```bash
cd ../backend
npx ts-node prisma/seed-admin.ts
```

## 🔍 Débogage

### Voir les requêtes API

Ouvrir la console du navigateur (F12) :
- Onglet **Network** : voir toutes les requêtes HTTP
- Onglet **Console** : voir les logs JavaScript

### Logs du backend

```bash
cd ../backend
npm run dev
```

Les logs afficheront toutes les requêtes reçues.

## 📦 Build Production

Pour créer un build de production :

```bash
npm run build
```

Le build sera généré dans le dossier `dist/`.

Pour tester le build localement :

```bash
npm run preview
```

## 🔄 Workflow Complet Local

### Démarrage complet (Backend + Web)

**Terminal 1 - Backend** :
```bash
cd backend
npm run dev
```

**Terminal 2 - Web** :
```bash
cd web
npm run dev
```

**Terminal 3 - Base de données (optionnel)** :
```bash
cd backend
npm run prisma:studio
```

### Arrêt

Dans chaque terminal, appuyer sur `Ctrl+C`.

## 🌐 Accès à l'application

- **Web** : http://localhost:5173
- **API Backend** : http://localhost:3000/api/v1
- **Swagger API Docs** : http://localhost:3000/api/v1/docs
- **Prisma Studio** : http://localhost:5555

## 📝 Notes Importantes

- Le fichier `.env` est ignoré par Git pour la sécurité
- Les modifications du code sont rechargées automatiquement (hot-reload)
- Les tokens JWT sont stockés dans le localStorage du navigateur
- En développement, les tokens expirent après 15 minutes (configurable)

---

*Guide de développement local Melio Web - Mis à jour automatiquement*

