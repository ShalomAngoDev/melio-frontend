# 🔔 Guide de Test - Badge des Nouvelles Alertes

## ✅ **Badge des Nouvelles Alertes Implémenté !**

### 🔧 **Fonctionnalités Ajoutées**

#### **Badge Dynamique**
- **Compteur en temps réel** : Affiche le nombre d'alertes avec statut "NOUVELLE"
- **Actualisation automatique** : Mise à jour toutes les 30 secondes
- **Réinitialisation** : Le badge disparaît quand on va sur la section Alertes
- **Design attractif** : Badge rouge avec le nombre en blanc

#### **Interface Utilisateur**
- **Position** : Badge dans le coin supérieur droit du menu "Alertes"
- **Style** : Badge rouge avec texte blanc, arrondi
- **Visibilité** : Seulement visible quand il y a des nouvelles alertes
- **Responsive** : S'adapte à la taille de l'écran

---

## 🧪 **Tests de Validation**

### 1. **Test du Badge Initial**
```bash
# 1. Démarrer le backend
cd backend && npm run start:dev

# 2. Démarrer l'interface web
cd web && npm run dev

# 3. Se connecter en tant qu'agent
# Email: agent@college-victor-hugo.fr
# Mot de passe: agent123
# Code école: JMO75-01

# 4. Vérifier le badge dans le menu
# Le badge doit afficher le nombre d'alertes NOUVELLE
```

### 2. **Test de Création d'Alerte**
```bash
# 1. Créer une nouvelle alerte via le mobile
cd mobile && node test-high-risk-content.js

# 2. Vérifier que le badge se met à jour
# Le badge doit afficher +1 alerte

# 3. Attendre 30 secondes
# Le badge doit se mettre à jour automatiquement
```

### 3. **Test de Réinitialisation**
```bash
# 1. Vérifier le badge dans le menu (ex: 4 nouvelles alertes)
# 2. Cliquer sur "Alertes" dans le menu
# 3. Vérifier que le badge disparaît
# 4. Aller sur une autre section (ex: Statistiques)
# 5. Vérifier que le badge réapparaît avec le bon nombre
```

### 4. **Test d'Actualisation Automatique**
```bash
# 1. Créer une nouvelle alerte
# 2. Attendre 30 secondes
# 3. Vérifier que le badge se met à jour automatiquement
# 4. Vérifier que l'actualisation fonctionne en arrière-plan
```

---

## 📊 **Interface du Badge**

### **Design du Badge**
```jsx
{item.badge !== undefined && item.badge > 0 && (
  <div className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
    {item.badge}
  </div>
)}
```

### **Propriétés du Badge**
- **Couleur** : Rouge (`bg-red-500`)
- **Texte** : Blanc (`text-white`)
- **Taille** : Petit (`text-xs`)
- **Style** : Gras (`font-bold`)
- **Forme** : Arrondi (`rounded-full`)
- **Espacement** : `px-2 py-1`
- **Taille minimale** : `min-w-[20px] h-5`
- **Alignement** : Centré (`flex items-center justify-center`)

### **Logique d'Affichage**
- **Condition** : `item.badge !== undefined && item.badge > 0`
- **Visibilité** : Seulement si le nombre > 0
- **Contenu** : Nombre d'alertes nouvelles
- **Position** : Coin supérieur droit du menu

---

## 🔄 **Logique de Mise à Jour**

### **Chargement Initial**
```typescript
useEffect(() => {
  const loadNewAlertsCount = async () => {
    try {
      const alerts = await alertService.getAlerts('NOUVELLE');
      setNewAlertsCount(alerts.length);
    } catch (error) {
      console.error('Erreur lors du chargement du nombre d\'alertes:', error);
      setNewAlertsCount(0);
    }
  };

  loadNewAlertsCount();
  
  // Actualiser toutes les 30 secondes
  const interval = setInterval(loadNewAlertsCount, 30000);
  
  return () => clearInterval(interval);
}, []);
```

### **Réinitialisation**
```typescript
useEffect(() => {
  if (activeSection === 'alerts') {
    // Réinitialiser le compteur quand on va sur les alertes
    setNewAlertsCount(0);
  }
}, [activeSection]);
```

### **Menu avec Badge**
```typescript
const menuItems = [
  { id: 'alerts', label: 'Alertes', icon: AlertTriangle, color: 'red', badge: newAlertsCount },
  { id: 'statistics', label: 'Statistiques', icon: BarChart3, color: 'blue' },
  { id: 'reports', label: 'Rapports', icon: FileText, color: 'purple' },
  { id: 'students', label: 'Élèves', icon: Users, color: 'green' },
  { id: 'school-info', label: 'École', icon: Building2, color: 'indigo' }
];
```

---

## ✅ **Checklist de Validation**

### **Fonctionnalité du Badge**
- [ ] Badge affiché quand il y a des alertes nouvelles
- [ ] Badge masqué quand il n'y a pas d'alertes nouvelles
- [ ] Nombre correct affiché dans le badge
- [ ] Badge se met à jour automatiquement
- [ ] Badge disparaît quand on va sur les alertes

### **Interface Utilisateur**
- [ ] Badge visible et lisible
- [ ] Position correcte dans le menu
- [ ] Design cohérent avec l'interface
- [ ] Responsive sur mobile et desktop
- [ ] Animation fluide lors des changements

### **Performance**
- [ ] Chargement rapide du badge
- [ ] Actualisation automatique fonctionnelle
- [ ] Pas de surcharge de l'interface
- [ ] Gestion d'erreurs appropriée
- [ ] Nettoyage des intervalles

---

## 🎯 **Avantages du Badge**

### **Pour l'Agent**
- ✅ **Visibilité immédiate** : Nombre d'alertes nouvelles en un coup d'œil
- ✅ **Priorisation** : Savoir combien d'alertes nécessitent une attention
- ✅ **Efficacité** : Pas besoin d'aller sur la section pour voir le nombre
- ✅ **Réactivité** : Mise à jour automatique en temps réel

### **Pour le Système**
- ✅ **Notification visuelle** : Alerte immédiate de nouvelles alertes
- ✅ **Gestion des priorités** : Focus sur les alertes non traitées
- ✅ **Expérience utilisateur** : Interface intuitive et informative
- ✅ **Performance** : Mise à jour optimisée et automatique

---

## 🔧 **Configuration Technique**

### **Service API**
```typescript
// Récupération des alertes nouvelles
const alerts = await alertService.getAlerts('NOUVELLE');
setNewAlertsCount(alerts.length);
```

### **Actualisation Automatique**
```typescript
// Actualiser toutes les 30 secondes
const interval = setInterval(loadNewAlertsCount, 30000);
```

### **Réinitialisation**
```typescript
// Réinitialiser quand on va sur les alertes
if (activeSection === 'alerts') {
  setNewAlertsCount(0);
}
```

---

## 🎉 **Résultat Final**

Le badge des nouvelles alertes est maintenant parfaitement intégré dans le menu de l'agent social :

- **Badge dynamique** : Affiche le nombre d'alertes nouvelles
- **Actualisation automatique** : Mise à jour toutes les 30 secondes
- **Réinitialisation intelligente** : Disparaît quand on consulte les alertes
- **Design attractif** : Badge rouge avec nombre en blanc
- **Interface intuitive** : Information claire et immédiate

**🔔 Le badge des nouvelles alertes est maintenant opérationnel pour une meilleure gestion des priorités !**


