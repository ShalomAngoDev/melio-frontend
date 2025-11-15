# 📚 Melio Web App - Documentation

**Service:** Frontend Web  
**Framework:** React 18 + Vite  
**Langage:** TypeScript  
**Port:** 5173 (dev)  
**Build:** Vite

## 🎯 Vue d'ensemble

L'application web Melio est une interface React pour les agents éducatifs et administrateurs. Elle permet de gérer les écoles, élèves, alertes, signalements et statistiques.

## 🏗️ Architecture

### Stack Technique
- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios
- **Routing:** React Router (implémenté dans App.tsx)
- **State Management:** React Context (AuthContext, ToastContext)

### Pages Principales
- **Login:** Authentification unifiée
- **AdminDashboard:** Dashboard administrateur Melio
- **StaffDashboard:** Dashboard agent éducatif
- **SchoolManagement:** Gestion des écoles
- **StudentManagement:** Gestion des élèves
- **AlertsManagement:** Gestion des alertes
- **ReportsManagement:** Gestion des signalements
- **Statistics:** Statistiques et analytics

## 🚀 Démarrage Local

### Prérequis
- Node.js 18+
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <repository-url>
cd web

# Installer dépendances
npm install

# Configuration
cp env.example .env
# Éditer .env
nano .env
```

**Variables minimales:**
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Démarrage

```bash
# Développement
npm run dev
```

**App disponible sur:** `http://localhost:5173`

### Build Production

```bash
# Build
npm run build

# Preview production
npm run preview
```

**Output:** `dist/`

## ⚙️ Variables d'Environnement

### Requises
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Production
```bash
VITE_API_BASE_URL=https://api.melio.app/v1
```

## 🔐 Authentification

### Rôles
- **ADMIN_MELIO:** Administrateur Melio (toutes les écoles)
- **ADMIN_SCHOOL:** Administrateur école (une école)
- **AGENT:** Agent éducatif (une ou plusieurs écoles)

### Flow
1. Login avec email/password
2. Backend retourne access token + refresh token
3. Token stocké dans localStorage
4. Token automatiquement refreshé si expiré
5. Logout efface les tokens

## 📱 Pages & Composants

### Pages
- `LoginScreen` - Authentification
- `AdminDashboard` - Dashboard admin
- `StaffDashboard` - Dashboard agent
- `SchoolManagement` - Gestion écoles
- `StudentManagement` - Gestion élèves
- `AlertsSection` - Gestion alertes
- `ReportsSection` - Gestion signalements
- `StatisticsSection` - Statistiques

### Composants Communs
- `LoadingScreen` - Écran de chargement
- `VirtualizedList` - Liste virtualisée
- `SimpleVirtualizedList` - Liste simple virtualisée

## 🚢 Déploiement

### Vercel
- Configuration: `vercel.json`
- Build automatique sur push
- Variables d'environnement dans Vercel Dashboard

**Variables Vercel:**
- `VITE_API_BASE_URL` (production)

**Voir:** `DEPLOYMENT-VERCEL.md` (obsolète, voir docs centralisées)

## 📝 Structure du Code

```
web/
├── src/
│   ├── components/
│   │   ├── admin/          # Composants admin
│   │   ├── staff/          # Composants agent
│   │   ├── auth/           # Authentification
│   │   └── common/         # Composants communs
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ToastContext.tsx
│   ├── services/
│   │   ├── api.ts          # Client API
│   │   └── pdfGenerator.ts # Génération PDF
│   ├── utils/
│   │   ├── auth-error-handler.ts
│   │   └── clear-auth.js
│   ├── App.tsx
│   └── main.tsx
├── public/
│   └── favicon.ico
└── vercel.json
```

## 🔗 Liens Utiles

- **React Docs:** https://react.dev
- **Vite Docs:** https://vitejs.dev
- **Tailwind CSS:** https://tailwindcss.com

---

**Owner:** @lead-dev  
**Dernière mise à jour:** 2025-11-05


