# 🗺️ Cartographie Avancée - SecureRetail Ops

## Vue d'ensemble

La cartographie avancée offre une visualisation interactive et intelligente de l'ensemble de vos sites de sécurité avec des fonctionnalités d'analyse spatiale en temps réel.

## 🎯 Fonctionnalités principales

### 1. **Heatmap des incidents**
- Visualisation thermique de la densité d'incidents
- Pondération par gravité (critique = 3x, haute = 2x, moyenne = 1x)
- Gradient de couleurs : cyan → jaune → rouge
- Rayon d'influence configurable
- Mise à jour en temps réel

**Activation** : Bouton "Heatmap" dans le panneau de contrôle

### 2. **Zones de couverture**
- Cercles proportionnels à la surface de chaque site
- Code couleur selon le score de risque
- Visualisation de l'empreinte spatiale de chaque magasin
- Opacité ajustable pour superposition

**Activation** : Bouton "Zones" dans le panneau de contrôle

### 3. **Itinéraires entre sites**
- Tracé automatique des routes entre tous les sites affichés
- Lignes géodésiques (suivant la courbure terrestre)
- Utile pour visualiser les trajets des agents mobiles
- Couleur bleue avec opacité 60%

**Activation** : Bouton "Afficher trajets" dans le panneau de contrôle

### 4. **Filtrage avancé**
- **Par zone géographique** : Paris Centre, Paris Sud, Ouest, Sud-Est, Nord-Est
- **Par criticité** : Critique, Élevée, Moyenne, Faible
- **Par type de carte** : Plan, Satellite, Hybride
- Filtrage combiné pour analyses ciblées

### 5. **Markers intelligents**
- **Taille dynamique** : 16px si alerte active, 12px sinon
- **Code couleur** selon le score de risque :
  - 🔴 Rouge : Score ≥ 70 (Critique)
  - 🟠 Orange : Score 50-69 (Élevé)
  - 🟡 Jaune : Score 30-49 (Moyen)
  - 🟢 Vert : Score < 30 (Faible)
- **Bordure rouge pulsée** pour les sites avec alarmes actives
- **Info-bulle enrichie** au clic

### 6. **Info-bulles enrichies**
Au clic sur un marker, affichage de :
- Nom du site et adresse
- Badge de criticité
- **Statistiques** :
  - Caméras (en ligne / total)
  - Agents en service
  - Capteurs actifs
  - Surface en m²
- **Score de risque** avec barre de progression
- **Alarmes actives** (si présentes)
- **Événements récents** (3 derniers)
- Type de site et zone géographique

### 7. **Panneau de statistiques**
Quatre cartes en bas de page affichant :
- 🚨 **Sites critiques** : Nombre de sites avec score ≥ 70
- 🔔 **Alarmes actives** : Total en temps réel
- 📹 **Caméras totales** : Somme sur tous les sites affichés
- 👮 **Agents en service** : Effectif terrain

### 8. **Liste des sites**
- Grille responsive (1/2/3 colonnes selon l'écran)
- Indicateur visuel du score de risque
- Badge d'alerte avec animation si alarme active
- Clic pour centrer la carte sur le site
- Affichage : nom, adresse, type, zone, score

## 🎨 Personnalisation visuelle

### Types de carte
- **Plan** : Vue standard Google Maps
- **Satellite** : Images aériennes
- **Hybride** : Satellite + labels

### Couches superposables
Vous pouvez combiner :
- Heatmap + Zones de couverture
- Heatmap + Itinéraires
- Zones + Itinéraires
- Toutes les couches simultanément

## 📊 Analyse spatiale

### Cas d'usage

#### 1. **Identification des zones à risque**
- Activez la heatmap pour voir les concentrations d'incidents
- Filtrez par criticité "Critique" pour isoler les points chauds
- Analysez la corrélation avec les zones de couverture

#### 2. **Optimisation des tournées**
- Activez les itinéraires pour visualiser les trajets
- Identifiez les sites proches pour regrouper les interventions
- Planifiez les rondes mobiles efficacement

#### 3. **Supervision en temps réel**
- Observez les markers pulsants (alertes actives)
- Consultez les info-bulles pour le contexte
- Prenez des décisions rapides basées sur la géolocalisation

#### 4. **Analyse comparative**
- Filtrez par zone géographique
- Comparez les scores de risque entre régions
- Identifiez les zones sous-performantes

## 🔧 Configuration technique

### Prérequis
- Clé API Google Maps avec bibliothèque "visualization" activée
- Variable d'environnement : `VITE_GOOGLE_MAPS_API_KEY`

### Bibliothèques Google Maps utilisées
```typescript
libraries: ['places', 'visualization']
```

### Composants React utilisés
- `GoogleMap` : Carte principale
- `Marker` : Marqueurs de sites
- `Circle` : Zones de couverture et alertes
- `HeatmapLayer` : Carte de chaleur
- `Polyline` : Itinéraires
- `InfoWindow` : Info-bulles

## 📐 Dimensions et performance

- **Hauteur de carte** : 700px
- **Nombre max de sites** : Illimité (testé jusqu'à 100+)
- **Rafraîchissement** : Temps réel via état React
- **Optimisation** : `useMemo` pour les données filtrées

## 🎯 Interactions

### Navigation
- **Zoom** : Molette ou boutons +/-
- **Pan** : Glisser-déposer
- **Plein écran** : Bouton en haut à droite
- **Recentrage** : Clic sur un site dans la liste

### Filtres
- Tous les filtres sont combinables
- Mise à jour instantanée de la carte
- Conservation du zoom et de la position

### Info-bulles
- Ouverture : Clic sur un marker
- Fermeture : Clic sur le X ou ailleurs sur la carte
- Contenu : Dynamique selon les données du site

## 🚀 Améliorations futures

### Planifiées
- [ ] Clustering automatique pour > 50 sites
- [ ] Animations de transition entre filtres
- [ ] Export de la carte en PNG/PDF
- [ ] Mode " replay " historique
- [ ] Intégration avec ShopGuard AI (zones de détection)
- [ ] Alertes géofencing (périmètres virtuels)
- [ ] Calcul automatique d'itinéraires optimisés
- [ ] Heatmap temporelle (évolution dans le temps)

### Suggestions
- Marqueurs personnalisés (icônes par type de site)
- Légende interactive (clic pour masquer/afficher)
- Mesure de distances entre sites
- Import/Export de zones personnalisées
- Intégration avec données météo
- Couche de trafic en temps réel

## 📝 Notes d'utilisation

### Bonnes pratiques
1. **Commencez par une vue globale** (tous les sites, pas de filtres)
2. **Utilisez les filtres** pour isoler les problèmes
3. **Superposez les couches** pour corréler les données
4. **Consultez les info-bulles** pour le contexte détaillé
5. **Analysez les statistiques** en bas de page

### Performance
- La heatmap peut être lourde avec > 1000 événements
- Désactivez les couches inutilisées pour fluidifier
- Le filtrage est instantané (pas de rechargement)

### Accessibilité
- Navigation au clavier possible (Tab entre les sites)
- Contrastes élevés pour les codes couleur
- Labels textuels en plus des indicateurs visuels

## 🔗 Intégration avec d'autres modules

### Dashboard
- Les KPIs du dashboard sont cohérents avec les stats de la carte
- Clic sur un site dans la carte → peut ouvrir la fiche site

### ShopGuard AI
- Future intégration : affichage des zones de détection IA
- Superposition des alertes ShopGuard sur la carte

### Installation caméras
- Future intégration : affichage des champs de vision des caméras
- Visualisation des angles morts

### Reporting
- Export de cartes thématiques pour les rapports
- Snapshots de la carte avec annotations

## 📞 Support

Pour toute question sur la cartographie avancée :
- Documentation technique : `/docs/CAMERA_INSTALLATION.md`
- Issues GitHub : [Lien vers le repo]
- Contact : support@secureretail-ops.fr

---

**Version** : 2.0  
**Dernière mise à jour** : Janvier 2026  
**Auteur** : Équipe SecureRetail Ops
