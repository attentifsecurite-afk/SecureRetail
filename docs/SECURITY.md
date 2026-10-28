# 🔐 Sécurité et Gestion des Secrets

## Vue d'ensemble

SecureRetail Ops utilise un système de chiffrement robuste pour protéger les variables d'environnement sensibles (clés API, mots de passe, URLs, etc.).

## 🛡️ Architecture de sécurité

```
┌─────────────────────────────────────────────────────────┐
│                    Fichier .env                          │
│         (clair, jamais commité, permissions 600)        │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ encrypt-env.js
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Fichier .env.encrypted                      │
│      (chiffré AES-256-GCM, peut être commité)          │
└─────────────────────────────────────────────────────────┘
                     │
                     │ decrypt-env.js
                     ▼
┌─────────────────────────────────────────────────────────┐
│              Fichier .env (déployé)                      │
│         (clair, utilisé par l'application)              │
└─────────────────────────────────────────────────────────┘
```

## 📋 Prérequis

- Node.js 14+
- OpenSSL (inclus avec Node.js)

## 🚀 Installation et configuration

### 1. Premier démarrage

```bash
# Créer le fichier .env
cp .env.example .env

# Éditer avec vos valeurs réelles
nano .env

# Chiffrer le fichier
node scripts/encrypt-env.js
```

### 2. Configuration initiale

Le script vous demandera un **mot de passe de chiffrement** :
- Minimum 8 caractères
- Recommandé : 16+ caractères avec majuscules, minuscules, chiffres, symboles
- **CONSERVEZ CE MOT DE PASSE EN LIEU SÛR**

### 3. Vérification

```bash
# Déchiffrer pour vérifier
node scripts/decrypt-env.js

# Le fichier .env doit être recréé
cat .env
```

## 🔧 Scripts disponibles

### encrypt-env.js

**Chiffre le fichier .env en .env.encrypted**

```bash
# Avec mot de passe en argument
node scripts/encrypt-env.js "MonMotDePasseSecurise123!"

# Avec prompt interactif
node scripts/encrypt-env.js
```

**Caractéristiques :**
- Algorithme : AES-256-GCM
- Dérivation de clé : PBKDF2 (100 000 itérations)
- Salt aléatoire : 64 bytes
- IV aléatoire : 16 bytes
- Auth tag : 16 bytes

### decrypt-env.js

**Déchiffre .env.encrypted en .env**

```bash
# Avec mot de passe en argument
node scripts/decrypt-env.js "MonMotDePasseSecurise123!"

# Avec prompt interactif
node scripts/decrypt-env.js
```

**Sécurité :**
- Permissions automatiques : 600 (propriétaire uniquement)
- Vérification d'intégrité via auth tag
- Protection contre les attaques par force brute

### secrets-manager.js

**Gestionnaire complet de secrets**

```bash
# Afficher l'aide
node scripts/secrets-manager.js

# Lister toutes les variables (valeurs masquées)
node scripts/secrets-manager.js list

# Obtenir une variable spécifique
node scripts/secrets-manager.js get VITE_GOOGLE_MAPS_API_KEY

# Définir/mettre à jour une variable
node scripts/secrets-manager.js set VITE_API_KEY "nouvelle_valeur"

# Supprimer une variable
node scripts/secrets-manager.js delete VITE_OLD_KEY

# Changer le mot de passe de chiffrement
node scripts/secrets-manager.js rotate

# Exporter pour déploiement
node scripts/secrets-manager.js export
```

## 📁 Structure des fichiers

```
project/
├── .env                      # ❌ Jamais commité (gitignore)
├── .env.encrypted            # ✅ Commité (chiffré)
├── .env.example              # ✅ Template (valeurs factices)
├── .gitignore                # Exclut .env, inclut .env.encrypted
├── scripts/
│   ├── encrypt-env.js        # Chiffrement
│   ├── decrypt-env.js        # Déchiffrement
│   └── secrets-manager.js    # Gestionnaire complet
└── docs/
    └── SECURITY.md           # Cette documentation
```

## 🔑 Bonnes pratiques

### 1. Gestion des mots de passe

✅ **À faire :**
- Utiliser un gestionnaire de mots de passe (1Password, Bitwarden, KeePass)
- Créer un mot de passe unique pour ce projet
- Partager le mot de passe via un canal sécurisé (pas d'email/Slack)
- Documenter l'emplacement du mot de passe dans votre vault

❌ **À ne jamais faire :**
- Écrire le mot de passe dans un fichier non chiffré
- Partager le mot de passe par email ou messagerie non sécurisée
- Utiliser le même mot de passe que pour d'autres services
- Commiter le mot de passe dans Git

### 2. Cycle de vie des secrets

```
Développement          Production
    │                       │
    ├─ .env (local)         ├─ Variables d'environnement système
    ├─ .env.encrypted       ├─ Vault (HashiCorp, AWS Secrets Manager)
    │   (commité)           ├─ CI/CD secrets (GitHub Actions, GitLab CI)
    │                       └─ Kubernetes secrets
    └─ Git repository
```

### 3. Rotation des secrets

**Fréquence recommandée :**
- Clés API : Tous les 90 jours
- Mots de passe : Tous les 180 jours
- Tokens : Selon expiration (généralement 1 an)

**Procédure de rotation :**

```bash
# 1. Déchiffrer
node scripts/decrypt-env.js

# 2. Modifier les valeurs
nano .env

# 3. Chiffrer avec le nouveau mot de passe
node scripts/secrets-manager.js rotate

# 4. Commiter le fichier chiffré
git add .env.encrypted
git commit -m "chore: rotation des secrets"
git push
```

### 4. Déploiement

#### Option A : Variables d'environnement système

```bash
# Sur le serveur de production
export VITE_GOOGLE_MAPS_API_KEY="votre_clé"
export VITE_SHOPGUARD_API_URL="https://api.example.com"
```

#### Option B : Déchiffrement au déploiement

```bash
# Dans votre script de déploiement (deploy.sh)
#!/bin/bash

# Déchiffrer le fichier .env
node scripts/decrypt-env.js "$MASTER_PASSWORD"

# Builder l'application
npm run build

# Supprimer le fichier .env après build
rm .env
```

#### Option C : CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Decrypt secrets
        env:
          MASTER_PASSWORD: ${{ secrets.MASTER_PASSWORD }}
        run: |
          node scripts/decrypt-env.js "$MASTER_PASSWORD"
      
      - name: Build
        run: npm run build
      
      - name: Deploy
        run: ./deploy.sh
```

## 🔒 Algorithmes de chiffrement

### AES-256-GCM

**Caractéristiques :**
- **Algorithme** : AES (Advanced Encryption Standard)
- **Taille de clé** : 256 bits
- **Mode** : GCM (Galois/Counter Mode)
- **Authentification** : Intégrée (pas de HMAC nécessaire)
- **Sécurité** : Considéré comme sûr pour les données top secrètes

**Avantages :**
- Chiffrement + authentification en une seule passe
- Protection contre les attaques par modification
- Performance élevée (accélération matérielle)

### PBKDF2

**Caractéristiques :**
- **Fonction** : Password-Based Key Derivation Function 2
- **Itérations** : 100 000
- **Hash** : SHA-512
- **Salt** : 64 bytes aléatoires

**Objectif :**
- Ralentir les attaques par force brute
- Résister aux attaques par dictionnaire
- Générer une clé cryptographique à partir d'un mot de passe

## 🚨 Gestion des incidents

### Mot de passe perdu

**Si vous perdez le mot de passe de chiffrement :**

1. **Vérifier** si quelqu'un d'autre dans l'équipe le connaît
2. **Consulter** le gestionnaire de mots de passe de l'équipe
3. **Si introuvable** :
   - Les données chiffrées sont **perdues définitivement**
   - Recréer le fichier `.env` à partir de `.env.example`
   - Régénérer toutes les clés API si nécessaire

**Prévention :**
- Toujours avoir au moins 2 personnes qui connaissent le mot de passe
- Stocker le mot de passe dans un gestionnaire de mots de passe d'équipe
- Documenter la procédure de récupération

### Fichier corrompu

**Symptômes :**
- Erreur "Mot de passe incorrect" alors que le mot de passe est correct
- Erreur de déchiffrement

**Causes possibles :**
- Fichier `.env.encrypted` modifié manuellement
- Erreur de transfert (FTP, git)
- Corruption du disque

**Solution :**
```bash
# Vérifier l'intégrité du fichier
file .env.encrypted

# Restaurer depuis Git
git checkout HEAD -- .env.encrypted

# Tenter de déchiffrer
node scripts/decrypt-env.js
```

### Fuite de secrets

**Si des secrets sont exposés (commités par erreur) :**

1. **Révoquer immédiatement** toutes les clés API exposées
2. **Générer de nouvelles clés** auprès des fournisseurs
3. **Mettre à jour** le fichier `.env` avec les nouvelles clés
4. **Re-chiffrer** le fichier
5. **Nettoyer l'historique Git** :
   ```bash
   # Supprimer le fichier de l'historique
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (attention: réécrit l'historique)
   git push origin --force --all
   ```
6. **Informer** l'équipe et les parties prenantes
7. **Auditer** les accès pour détecter d'éventuelles utilisations frauduleuses

## 📊 Audit et conformité

### Journalisation

Les scripts de gestion des secrets peuvent être configurés pour logger les opérations :

```bash
# Activer la journalisation
export SECRETS_LOG_FILE="/var/log/secrets-manager.log"

# Toutes les opérations seront loguées
node scripts/secrets-manager.js list
```

### Vérification d'intégrité

```bash
# Script de vérification (à créer)
node scripts/verify-secrets.js

# Vérifie :
# - Présence de .env.encrypted
# - Validité du chiffrement
# - Cohérence des variables requises
```

### Conformité RGPD

**Données sensibles à protéger :**
- Clés API (considérées comme données techniques)
- URLs de production
- Identifiants de service

**Mesures implementées :**
- ✅ Chiffrement au repos (AES-256-GCM)
- ✅ Contrôle d'accès (permissions 600)
- ✅ Journalisation des accès
- ✅ Rotation régulière
- ✅ Procédure de destruction sécurisée

## 🎓 Formation de l'équipe

### Checklist pour les nouveaux développeurs

- [ ] Lire cette documentation
- [ ] Recevoir le mot de passe de chiffrement via canal sécurisé
- [ ] Tester le déchiffrement localement
- [ ] Configurer son gestionnaire de mots de passe
- [ ] Comprendre la procédure de rotation

### Formation recommandée

1. **Sensibilisation** (30 min)
   - Importance des secrets
   - Risques de fuites
   - Bonnes pratiques

2. **Pratique** (1h)
   - Installation locale
   - Manipulation des scripts
   - Simulation d'incident

3. **Évaluation** (15 min)
   - Quiz sur les bonnes pratiques
   - Exercice de rotation
   - Procédure d'urgence

## 🔗 Ressources

### Documentation officielle

- [Node.js Crypto](https://nodejs.org/api/crypto.html)
- [OWASP Secrets Management](https://owasp.org/www-project-cheat-sheets/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [NIST SP 800-132](https://csrc.nist.gov/publications/detail/sp/800-132/final) (PBKDF2)

### Outils recommandés

- **Gestionnaires de mots de passe** : 1Password, Bitwarden, KeePass
- **Vault** : HashiCorp Vault, AWS Secrets Manager
- **CI/CD** : GitHub Secrets, GitLab CI Variables
- **Audit** : git-secrets, truffleHog, detect-secrets

## 📞 Support

**Contact sécurité :**
- Email : security@secureretail-ops.fr
- Slack : #security-team
- Documentation interne : https://wiki.secureretail-ops.fr/security

**Signaler un incident :**
1. Email : incident@secureretail-ops.fr
2. Téléphone : +33 1 XX XX XX XX (24/7)
3. Slack : #incident-response

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 2.0  
**Statut** : ✅ Actif
