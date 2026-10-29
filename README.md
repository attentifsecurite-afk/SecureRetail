# SecureRetail Ops — Plateforme SaaS de pilotage sécurité retail

Plateforme complète de supervision multi-sites pour la sécurité privée et la sûreté retail (Paris + Grande Couronne).

## 🎯 Fonctionnalités

### Modules opérationnels
- **Tour de contrôle** — Dashboard temps réel avec KPIs et alertes
- **Cartographie Google Maps** — Visualisation géographique des 10 sites avec scores de risque
- **ShopGuard AI Engine** — Moteur IA multi-caméras (YOLO26 + Pose + TensorRT + LLM Guard)
- **Connexion caméras** — Gestion IP/ONVIF/DVR/NVR/Contrôle d'accès multi-marques
- **Installation caméras** — Configuration et paramétrage des équipements
- **Main courante électronique** — Journal des événements sûreté
- **Rondes & patrouilles** — Suivi des circuits et points de contrôle
- **Anti-intrusion & alarmes** — Gestion des alarmes et levées de doute
- **Vidéosurveillance** — Statut caméras et conformité RGPD/CNIL
- **Sites multi-sites** — Référentiel avec scoring de risque
- **Agents** — Personnel APS/ADS/SSIAP avec suivi qualifications
- **Démarque inconnue** — Analyse des pertes et détection d'anomalies
- **Reporting** — Dashboards direction et exploitation

### ShopGuard Ultimate Engine
Moteur IA avancé intégrant :
- **YOLO26s** — Détection d'objets et personnes
- **BoT-SORT** — Tracking multi-objets
- **YOLO26n-Pose** — Estimation de pose
- **LLM Guard** — Décision contextuelle avec prompt optimisé
- **Memory Guard** — Gestion mémoire CUDA/RAM
- **TensorRT** — Accélération GPU (optionnel)

Caractéristiques :
- Multi-caméras temps réel (6 caméras simulées)
- Détections avec bounding boxes et track IDs
- Alertes intelligentes avec niveaux de criticité
- Métriques en temps réel (FPS, latence, mémoire)
- Pipeline complet : détection → tracking → pose → LLM → décision
- Conforme RGPD/CNIL (pas de reconnaissance faciale, données anonymisées)

## 🔐 Sécurité & Gestion des Secrets

### ⚡ Démarrage rapide

```bash
# Initialiser la sécurité (première fois)
node scripts/init-security.js

# Déchiffrer pour travailler
node scripts/decrypt-env.js

# Re-chiffrer avant de commit
node scripts/encrypt-env.js
```

📖 **[Guide rapide complet →](SECURITY_QUICKSTART.md)**

### 🛡️ Chiffrement des variables d'environnement

SecureRetail Ops utilise un système de chiffrement **AES-256-GCM** pour protéger les secrets.

#### Installation

```bash
# 1. Copier le template
cp .env.example .env

# 2. Éditer avec vos vraies valeurs
nano .env

# 3. Chiffrer le fichier
node scripts/encrypt-env.js
```

#### Utilisation quotidienne

```bash
# Déchiffrer pour travailler
node scripts/decrypt-env.js

# Travailler normalement...
npm run dev

# Re-chiffrer avant de commit
node scripts/encrypt-env.js
```

#### Gestionnaire de secrets

```bash
# Lister les variables (valeurs masquées)
node scripts/secrets-manager.js list

# Ajouter/modifier une variable
node scripts/secrets-manager.js set VITE_API_KEY "valeur"

# Changer le mot de passe
node scripts/secrets-manager.js rotate

# Vérifier la configuration
node scripts/verify-security.js
```

#### 📖 Documentation complète

Consultez **[docs/SECURITY.md](docs/SECURITY.md)** pour :
- Architecture de sécurité détaillée
- Bonnes pratiques de gestion des secrets
- Procédures de rotation et d'urgence
- Conformité RGPD
- Formation de l'équipe

### ⚠️ Règles importantes

✅ **À faire :**
- Toujours chiffrer `.env` avant de commit
- Utiliser un gestionnaire de mots de passe
- Rotation régulière des secrets (90 jours)
- Vérifier la configuration avec `verify-security.js`

❌ **À ne jamais faire :**
- Commiter `.env` en clair
- Partager les mots de passe par email
- Utiliser des mots de passe faibles
- Stocker les secrets dans le code

### Conformité légale
- RGPD / CNIL respecté
- Pas de reconnaissance faciale
- Données anonymisées (track IDs temporaires)
- Rétention vidéo limitée à 30 jours
- Journalisation des accès et consultations
- DPIA réalisée

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos clés API
nano .env

# Lancer en développement
npm run dev

# Build de production
npm run build
```

## 📊 Données mockées

L'application utilise des données réalistes pour 10 sites Paris + Grande Couronne :
- Paris Châtelet, Opéra, Montparnasse, Bastille
- La Défense Westfield, Velizy 2
- Créteil Soleil, Rosny 2, Bobigny
- Saint-Quentin en Yvelines

Chaque site inclut :
- Coordonnées GPS pour la cartographie
- Score de risque (0-100)
- Nombre de caméras, capteurs, agents
- Niveau de criticité
- Surface en m²

## 🛠️ Stack technique

- **React 18** + **TypeScript**
- **Vite** — Build tool ultra-rapide
- **Tailwind CSS** — Styling utility-first
- **Recharts** — Graphiques et visualisations
- **Lucide React** — Icônes
- **@react-google-maps/api** — Intégration Google Maps
- **ShopGuard Engine** — Moteur IA Python (YOLO26 + TensorRT + LLM)

## 📁 Structure du projet

```
src/
├── components/
│   ├── Sidebar.tsx          # Navigation latérale
│   ├── Dashboard.tsx        # Tour de contrôle
│   ├── MapView.tsx          # Cartographie Google Maps
│   ├── ShopGuardAI.tsx      # Moteur IA ShopGuard
│   ├── MainCourante.tsx     # Journal événements
│   ├── Rondes.tsx           # Suivi patrouilles
│   ├── Alarmes.tsx          # Gestion alarmes
│   ├── Cameras.tsx          # Vidéosurveillance
│   ├── Sites.tsx            # Référentiel sites
│   ├── Agents.tsx           # Gestion personnel
│   ├── Demarque.tsx         # Analyse pertes
│   └── Reporting.tsx        # Dashboards
├── data/
│   └── mockData.ts          # Données mockées
├── App.tsx                  # Composant principal
├── main.tsx                 # Point d'entrée
└── index.css                # Styles globaux
```

## 🎨 Interface

- Design responsive (mobile / tablette / desktop)
- Thème clair professionnel
- Navigation intuitive
- Visualisations temps réel
- Alertes visuelles avec codes couleur
- Graphiques interactifs

## 📈 KPIs suivis

- Taux de pourvoi des postes
- Taux de rondes réalisées
- Délai moyen de traitement des alarmes
- Taux de fausses alarmes
- Nombre d'incidents ouverts / critiques
- Taux de caméras disponibles
- Taux de conformité SSIAP
- Score de risque moyen par magasin
- Taux d'anomalies clôturées sous 24/48h
- Taux de service global

## 🔗 Intégrations prévues (V2)

- VMS vidéosurveillance (Genetec, Milestone, HikCentral)
- Systèmes d'alarme intrusion
- Contrôle d'accès / badges
- POS / caisse pour démarque inconnue
- ERP / WMS pour inventaires
- Outil de planning RH
- Notifications (email, SMS, Teams, Slack)

## 📝 Licence

Projet propriétaire — SecureRetail Ops © 2026

## 🤝 Support

Pour toute question ou support technique, contactez l'équipe Direction Sûreté.
