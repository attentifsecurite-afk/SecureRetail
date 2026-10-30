# SecureRetail Ops Backend API

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- PostgreSQL 14+
- Redis (optionnel, pour le cache)

### Installation

```bash
# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Créer la base de données
createdb secureretail

# Exécuter les migrations
npm run db:migrate

# Lancer en développement
npm run dev

# Build pour production
npm run build
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur
- `POST /api/auth/logout` - Déconnexion
- `PUT /api/auth/profile` - Mise à jour profil
- `PUT /api/auth/password` - Changement mot de passe

### Sites
- `GET /api/sites` - Liste des sites
- `GET /api/sites/:id` - Détails d'un site
- `POST /api/sites` - Créer un site
- `PUT /api/sites/:id` - Modifier un site
- `DELETE /api/sites/:id` - Supprimer un site
- `GET /api/sites/:id/stats` - Statistiques d'un site

### Caméras
- `GET /api/cameras` - Liste des caméras
- `GET /api/cameras/:id` - Détails d'une caméra
- `POST /api/cameras` - Créer une caméra
- `PUT /api/cameras/:id` - Modifier une caméra
- `DELETE /api/cameras/:id` - Supprimer une caméra
- `POST /api/cameras/:id/test` - Tester la connexion
- `GET /api/cameras/site/:siteId` - Caméras par site

### Agents
- `GET /api/agents` - Liste des agents
- `GET /api/agents/:id` - Détails d'un agent
- `POST /api/agents` - Créer un agent
- `PUT /api/agents/:id` - Modifier un agent
- `DELETE /api/agents/:id` - Supprimer un agent
- `PATCH /api/agents/:id/status` - Mise à jour statut
- `GET /api/agents/site/:siteId` - Agents par site

### Événements
- `GET /api/events` - Liste des événements
- `GET /api/events/:id` - Détails d'un événement
- `POST /api/events` - Créer un événement
- `PUT /api/events/:id` - Modifier un événement
- `DELETE /api/events/:id` - Supprimer un événement
- `GET /api/events/site/:siteId` - Événements par site

### Alarmes
- `GET /api/alarms` - Liste des alarmes
- `GET /api/alarms/:id` - Détails d'une alarme
- `POST /api/alarms` - Créer une alarme
- `PUT /api/alarms/:id` - Modifier une alarme
- `GET /api/alarms/active/all` - Alarmes actives
- `GET /api/alarms/site/:siteId` - Alarmes par site

### Rondes
- `GET /api/rounds` - Liste des rondes
- `GET /api/rounds/:id` - Détails d'une ronde
- `POST /api/rounds` - Créer une ronde
- `PUT /api/rounds/:id` - Modifier une ronde
- `GET /api/rounds/site/:siteId` - Rondes par site
- `GET /api/rounds/agent/:agentId` - Rondes par agent

### CRM
- `GET /api/crm/contacts` - Liste des contacts
- `POST /api/crm/contacts` - Créer un contact
- `GET /api/crm/installations` - Liste des installations
- `POST /api/crm/installations` - Créer une installation
- `GET /api/crm/interventions` - Liste des interventions
- `POST /api/crm/interventions` - Créer une intervention
- `GET /api/crm/contracts` - Liste des contrats
- `POST /api/crm/contracts` - Créer un contrat
- `GET /api/crm/stats` - Statistiques CRM

### Facturation
- `GET /api/billing/invoices` - Liste des factures
- `GET /api/billing/invoices/:id` - Détails d'une facture
- `POST /api/billing/invoices` - Créer une facture
- `PUT /api/billing/invoices/:id` - Modifier une facture
- `POST /api/billing/create-checkout-session` - Créer session Stripe
- `GET /api/billing/subscription` - Abonnement utilisateur
- `POST /api/billing/webhook` - Webhook Stripe
- `GET /api/billing/stats` - Statistiques facturation

### Support
- `GET /api/support/tickets` - Liste des tickets
- `GET /api/support/tickets/:id` - Détails d'un ticket
- `POST /api/support/tickets` - Créer un ticket
- `POST /api/support/tickets/:id/messages` - Ajouter un message
- `PATCH /api/support/tickets/:id/status` - Modifier statut
- `POST /api/support/tickets/:id/rate` - Noter un ticket
- `GET /api/support/stats` - Statistiques support

### ShopGuard AI
- `GET /api/shopguard/status` - Statut du moteur
- `GET /api/shopguard/cameras/:cameraId/results` - Résultats d'analyse
- `GET /api/shopguard/alerts` - Alertes actives
- `POST /api/shopguard/config` - Configuration
- `POST /api/shopguard/engine/:action` - Démarrer/Arrêter
- `GET /api/shopguard/metrics` - Métriques

## 🔐 Authentification

Toutes les routes API (sauf `/api/auth/login` et `/api/auth/register`) nécessitent un token JWT dans le header `Authorization`:

```
Authorization: Bearer <token>
```

## 📡 WebSocket

Le serveur WebSocket est disponible sur le même port que l'API.

### Channels
- `site-{siteId}` - Événements en temps réel pour un site
- `ticket-{ticketId}` - Messages de ticket en temps réel
- `admins` - Alertes critiques pour les administrateurs

### Événements
- `new-event` - Nouvel événement créé
- `event-updated` - Événement mis à jour
- `new-alarm` - Nouvelle alarme
- `alarm-updated` - Alarme mise à jour
- `round-updated` - Ronde mise à jour
- `new-message` - Nouveau message de ticket
- `critical-alarm` - Alerte critique

## 🗄️ Base de données

### Tables principales
- `users` - Utilisateurs
- `sessions` - Sessions JWT
- `sites` - Sites
- `cameras` - Caméras
- `agents` - Agents
- `events` - Événements
- `alarms` - Alarmes
- `rounds` - Rondes
- `contacts` - Contacts CRM
- `installations` - Installations
- `interventions` - Interventions
- `contracts` - Contrats
- `invoices` - Factures
- `subscriptions` - Abonnements Stripe
- `tickets` - Tickets support
- `ticket_messages` - Messages de tickets
- `loss_metrics` - Métriques démarque inconnue
- `audit_logs` - Logs d'audit

## 🧪 Tests

```bash
npm test
```

## 📝 Logs

Les logs sont stockés dans le dossier `logs/`:
- `error.log` - Erreurs uniquement
- `combined.log` - Tous les logs

## 🚀 Déploiement

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 8000
CMD ["npm", "start"]
```

### Variables d'environnement production
- `NODE_ENV=production`
- `DATABASE_URL` - URL PostgreSQL
- `JWT_SECRET` - Clé JWT sécurisée
- `STRIPE_SECRET_KEY` - Clé Stripe production
- `GOOGLE_MAPS_API_KEY` - Clé Google Maps

---

**SecureRetail Ops Backend API** - Version 2.0.0
