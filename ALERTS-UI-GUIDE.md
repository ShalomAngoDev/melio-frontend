# 🚨 Guide de l'Interface Alertes Agent Social

## 🎯 Vue d'ensemble

L'interface agent social intègre maintenant un système complet de gestion des alertes générées par l'IA à partir des journaux intimes des élèves.

## 🚀 Fonctionnalités implémentées

### ✅ **Service API Alertes**
- `alertService.getAlerts()` - Récupération des alertes avec filtres
- `alertService.getAlertStats()` - Statistiques des alertes
- `alertService.updateAlertStatus()` - Mise à jour du statut
- `alertService.getAlert()` - Détails d'une alerte

### ✅ **Interface AlertsSection**
- **Statistiques en temps réel** : Total, Nouvelles, En cours, Traitées
- **Filtres par statut** : Tous, Nouvelles, En cours, Traitées
- **Cartes d'alertes détaillées** avec :
  - Informations élève (nom, classe, humeur)
  - Niveau de risque (FAIBLE, MOYEN, ELEVE, CRITIQUE)
  - Score de risque (0-100)
  - Résumé IA et recommandations
  - Actions (Prendre en charge, Marquer comme traitée)
- **Détails étendus** : Informations techniques et contexte
- **Actualisation en temps réel**

## 🎨 Design et UX

### **Couleurs par niveau de risque :**
- 🔴 **CRITIQUE** : Rouge (score ≥ 85)
- 🟠 **ELEVE** : Orange (score 65-84)
- 🟡 **MOYEN** : Jaune (score 40-64)
- ⚪ **FAIBLE** : Gris (score < 40)

### **Couleurs par statut :**
- 🔵 **NOUVELLE** : Bleu
- 🟠 **EN_COURS** : Orange
- 🟢 **TRAITEE** : Vert

### **Icônes d'humeur :**
- 😢 TRES_TRISTE
- 😔 TRISTE
- 😐 NEUTRE
- 😊 CONTENT
- 😄 TRES_HEUREUX

## 📱 Navigation

L'interface est accessible via le menu principal de l'agent social :
1. **Alertes** (priorité) - Section par défaut
2. Statistiques
3. Rapports
4. Élèves
5. École

## 🔧 Utilisation

### **1. Connexion Agent**
```
Email: agent@college-victor-hugo.fr
Password: agent123
School Code: JMO75-01
```

### **2. Navigation vers Alertes**
- Cliquer sur "Alertes" dans le menu latéral
- Section active par défaut au chargement

### **3. Gestion des Alertes**
- **Voir les détails** : Cliquer sur "Détails" pour étendre
- **Prendre en charge** : Bouton pour passer de NOUVELLE à EN_COURS
- **Marquer comme traitée** : Bouton pour passer de EN_COURS à TRAITEE
- **Filtrer** : Utiliser le filtre par statut
- **Actualiser** : Bouton pour recharger les données

### **4. Comprendre les Alertes**
Chaque alerte contient :
- **Élève concerné** : Nom, classe, humeur
- **Analyse IA** : Résumé automatique de la situation
- **Recommandation** : Conseil stratégique pour l'agent
- **Score de risque** : Évaluation quantitative (0-100)
- **Niveau de risque** : Classification qualitative
- **Contexte technique** : Source, ID, timestamp

## 🧪 Tests recommandés

### **Test 1 : Affichage des alertes**
1. Se connecter en tant qu'agent
2. Aller dans la section "Alertes"
3. Vérifier que les alertes existantes s'affichent
4. Vérifier les statistiques en haut

### **Test 2 : Filtrage**
1. Utiliser le filtre "Nouvelles"
2. Vérifier que seules les alertes NOUVELLE s'affichent
3. Tester les autres filtres

### **Test 3 : Gestion des statuts**
1. Prendre une alerte NOUVELLE en charge
2. Vérifier qu'elle passe en EN_COURS
3. Marquer une alerte EN_COURS comme traitée
4. Vérifier qu'elle passe en TRAITEE

### **Test 4 : Détails étendus**
1. Cliquer sur "Détails" d'une alerte
2. Vérifier l'affichage des informations techniques
3. Vérifier les informations élève

## 🔄 Flux de travail recommandé

### **1. Arrivée d'une nouvelle alerte**
- L'alerte apparaît automatiquement dans la liste
- Statut : NOUVELLE (badge bleu)
- Action : Cliquer sur "Prendre en charge"

### **2. Traitement de l'alerte**
- Statut : EN_COURS (badge orange)
- Lire l'analyse IA et les recommandations
- Contacter l'élève si nécessaire
- Suivre les conseils stratégiques

### **3. Finalisation**
- Statut : TRAITEE (badge vert)
- Action : Cliquer sur "Marquer comme traitée"
- L'alerte reste visible pour historique

## 📊 Métriques importantes

### **Statistiques à surveiller :**
- **Nouvelles** : Alertes non traitées (priorité)
- **En cours** : Alertes en cours de traitement
- **Traitées** : Alertes résolues
- **Par niveau** : Répartition des risques

### **Seuils d'alerte :**
- **CRITIQUE** : Intervention immédiate requise
- **ELEVE** : Action rapide nécessaire
- **MOYEN** : Surveillance renforcée
- **FAIBLE** : Suivi régulier

## 🚨 Cas d'urgence

### **Alerte CRITIQUE :**
1. **Priorité absolue** - Traitement immédiat
2. Contacter l'élève dans la journée
3. Informer la direction si nécessaire
4. Suivre les recommandations IA

### **Alerte ELEVE :**
1. **Action rapide** - Sous 48h
2. Entretien avec l'élève
3. Mise en place de mesures de protection
4. Suivi régulier

## 🔧 Dépannage

### **Problème : Pas d'alertes affichées**
- Vérifier la connexion au backend
- Vérifier l'authentification agent
- Vérifier que des alertes existent en base

### **Problème : Erreur de chargement**
- Vérifier les logs de la console
- Vérifier la configuration API
- Vérifier les permissions agent

### **Problème : Mise à jour de statut échoue**
- Vérifier la connexion réseau
- Vérifier les permissions agent
- Recharger la page si nécessaire

## 🎯 Prochaines améliorations

- **Notifications temps réel** : WebSocket pour alertes instantanées
- **Historique détaillé** : Suivi des actions sur les alertes
- **Rapports automatisés** : Génération de rapports périodiques
- **Intégration calendrier** : Planification des entretiens
- **Alertes par email** : Notifications externes


