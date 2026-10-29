# 📊 Module CRM - Gestion des Sites

## 🎯 Vue d'ensemble

Le module CRM (Customer Relationship Management) permet de gérer l'ensemble de la relation client pour chaque site de vidéosurveillance. Il centralise toutes les informations relatives aux contacts, installations, interventions et contrats.

## 🚀 Fonctionnalités

### 1. Gestion des Sites
- **Vue d'ensemble** : Liste complète des sites avec scores de satisfaction
- **Filtrage** : Recherche par nom/adresse, filtrage par statut de contrat
- **Indicateurs visuels** : Score client, statut du contrat, interventions en cours

### 2. Contacts
- **Gestion multi-contacts** : Plusieurs contacts par site
- **Contact principal** : Identification du contact privilégié
- **Informations complètes** : Nom, rôle, email, téléphone
- **Avatars** : Initiales automatiques

### 3. Installations
- **Historique complet** : Toutes les installations réalisées
- **Types d'équipements** : Caméras, DVR, NVR, alarmes, contrôle d'accès
- **Détails techniques** : Marque, modèle, quantité, technicien
- **Statuts** : Planifié, en cours, terminé, maintenance
- **Notes** : Commentaires et spécificités de l'installation

### 4. Interventions
- **Suivi des interventions** : Maintenance, pannes, upgrades, support
- **Priorités** : Basse, moyenne, haute, critique
- **Statuts** : Ouvert, en cours, résolu
- **Métriques** : Date, durée, technicien assigné
- **Descriptions** : Détails de l'intervention

### 5. Contrats
- **Gestion des contrats** : Maintenance, supervision, complet
- **Dates clés** : Début, fin, renouvellement
- **Montants** : Valeur annuelle des contrats
- **Statuts** : Actif, à renouveler, expiré
- **Numéros de contrat** : Référence unique

### 6. Notes et Historique
- **Notes client** : Commentaires importants
- **Dernier contact** : Date de la dernière interaction
- **Prochaine intervention** : Planification des visites

## 📈 KPIs CRM

### Indicateurs Globaux
- **Sites total** : Nombre de sites gérés
- **Contrats actifs** : Sites avec contrat en cours
- **À renouveler** : Contrats arrivant à échéance
- **Interventions ouvertes** : Tickets en cours
- **CA annuel** : Chiffre d'affaires total des contrats actifs
- **Score moyen** : Satisfaction client moyenne

### Score Client (0-100)
- **90-100** : Excellent (vert)
- **70-89** : Bon (bleu)
- **< 70** : À améliorer (orange)

## 🎨 Interface Utilisateur

### Layout Principal
```
┌─────────────────────────────────────────────────────────┐
│  Header : Titre + Export                                │
├─────────────────────────────────────────────────────────┤
│  KPIs : 6 cartes d'indicateurs                          │
├─────────────────────────────────────────────────────────┤
│  Filtres : Recherche + Statut contrat                   │
├──────────────────┬──────────────────────────────────────┤
│  Liste Sites     │  Détails du site sélectionné         │
│  (1/3 largeur)   │  (2/3 largeur)                       │
│                  │  ├─ Header site + score              │
│  • Site 1        │  ├─ Stats rapides                    │
│  • Site 2        │  └─ Onglets :                        │
│  • Site 3        │     ├─ Vue d'ensemble                │
│  • ...           │     ├─ Contacts                      │
│                  │     ├─ Installations                 │
│                  │     ├─ Interventions                 │
│                  │     └─ Contrats                      │
└──────────────────┴──────────────────────────────────────┘
```

### Onglets Détaillés

#### Vue d'ensemble
- Dernière activité (dernier contact, prochaine intervention)
- Notes importantes

#### Contacts
- Liste des contacts avec avatar
- Informations de contact complètes
- Badge "Principal" pour le contact privilégié

#### Installations
- Timeline des installations
- Icônes par type d'équipement
- Statuts colorés
- Notes techniques

#### Interventions
- Liste des interventions
- Codes couleur par priorité
- Statuts visuels
- Durée et technicien

#### Contrats
- Cartes de contrats
- Dates et montants
- Statuts (actif/renouvellement/expiré)
- Numéros de référence

## 📊 Données Mockées

### Sites Exemples
- **S001 - Paris Châtelet** : Score 92, contrat actif, 3 installations, 2 interventions
- **S002 - Paris Opéra** : Score 78, contrat à renouveler, 1 installation
- **S004 - La Défense** : Score 95, contrat actif, 2 installations, site VIP

### Types d'Équipements
- **Caméra** : Hikvision, Dahua, Axis
- **DVR** : Enregistreurs numériques
- **NVR** : Enregistreurs réseau
- **Alarme** : Systèmes d'alarme
- **Contrôle d'accès** : Badges, biométrie

### Types d'Interventions
- **Maintenance** : Entretien régulier
- **Panne** : Réparation d'équipement
- **Upgrade** : Mise à niveau
- **Support** : Assistance technique

## 🔧 Utilisation

### Navigation
1. Cliquez sur **"CRM Sites"** dans la barre latérale
2. La liste des sites apparaît à gauche
3. Cliquez sur un site pour voir les détails à droite

### Filtrage
- **Recherche** : Tapez le nom ou l'adresse d'un site
- **Statut** : Filtrez par statut de contrat (actif, à renouveler, expiré)

### Gestion des Sites
1. Sélectionnez un site dans la liste
2. Naviguez entre les onglets pour voir les différentes informations
3. Consultez les contacts, installations, interventions et contrats

### Export
- Cliquez sur **"Exporter rapport"** pour générer un rapport PDF
- Le rapport contient toutes les informations du site sélectionné

## 💡 Cas d'Usage

### 1. Suivi Commercial
- Identifier les contrats à renouveler
- Planifier les rendez-vous de renouvellement
- Suivre la satisfaction client

### 2. Gestion Technique
- Historique complet des installations
- Suivi des interventions en cours
- Planification de la maintenance

### 3. Reporting
- CA par site et global
- Nombre d'interventions par type
- Score de satisfaction moyen

### 4. Support Client
- Accès rapide aux informations du site
- Historique des interventions
- Contacts à joindre

## 🎯 Métriques Clés

### Taux de Renouvellement
```
Contrats renouvelés / Contrats arrivant à échéance × 100
```

### Temps Moyen de Résolution
```
Somme des durées d'interventions / Nombre d'interventions résolues
```

### Score de Satisfaction
```
Moyenne des scores clients
```

### CA par Site
```
Montant du contrat actif / Nombre de mois restants
```

## 🔐 Sécurité

- **Accès restreint** : Module accessible uniquement aux utilisateurs autorisés
- **Données chiffrées** : Informations sensibles protégées
- **Audit trail** : Historique des modifications
- **Permissions** : Rôles définis (admin, commercial, technicien)

## 📱 Responsive

- **Desktop** : Layout 2 colonnes (liste + détails)
- **Tablet** : Layout adaptatif
- **Mobile** : Navigation simplifiée

## 🚀 Évolutions Prévues

### Version 2.0
- [ ] Ajout de contacts multiples avec rôles
- [ ] Timeline visuelle des événements
- [ ] Notifications automatiques (renouvellement, interventions)
- [ ] Intégration calendrier (Google Calendar, Outlook)
- [ ] Génération de devis et factures
- [ ] Signature électronique des contrats
- [ ] Portail client (accès client à ses informations)
- [ ] API REST pour intégration tierce
- [ ] Import/Export CSV
- [ ] Rapports personnalisés

### Version 3.0
- [ ] Intelligence artificielle (prédiction de churn)
- [ ] Chatbot pour support client
- [ ] Analyse de sentiment (emails, appels)
- [ ] Intégration CRM externe (Salesforce, HubSpot)
- [ ] Mobile app dédiée
- [ ] Voice-to-text pour notes
- [ ] Reconnaissance optique de documents

## 📞 Support

Pour toute question sur le module CRM :
- **Documentation** : `docs/CRM.md`
- **Support technique** : support@secureretail-ops.fr
- **Formation** : Demandez une session de formation

---

**Version** : 1.0  
**Dernière mise à jour** : Janvier 2026  
**Statut** : ✅ Production
