# 🛠️ Scripts de Sécurité - SecureRetail Ops

## Vue d'ensemble

Ce répertoire contient tous les scripts nécessaires pour gérer la sécurité des variables d'environnement et des secrets.

## 📋 Liste des scripts

### 🔐 Gestion des secrets

#### `init-security.js`
**Initialisation de la sécurité pour les nouveaux projets**

```bash
node scripts/init-security.js
```

**Fonctionnalités :**
- Guide l'utilisateur étape par étape
- Crée `.env` depuis `.env.example`
- Configure un mot de passe de chiffrement
- Chiffre automatiquement le fichier
- Supprime le fichier en clair

**Utilisation :** Première configuration uniquement

---

#### `encrypt-env.js`
**Chiffre le fichier `.env` en `.env.encrypted`**

```bash
# Avec mot de passe en argument
node scripts/encrypt-env.js "MonMotDePasse123!"

# Avec prompt interactif
node scripts/encrypt-env.js
```

**Caractéristiques :**
- Algorithme : AES-256-GCM
- Dérivation : PBKDF2 (100 000 itérations)
- Salt aléatoire : 64 bytes
- IV aléatoire : 16 bytes

**Utilisation :** Avant chaque commit

---

#### `decrypt-env.js`
**Déchiffre `.env.encrypted` en `.env`**

```bash
# Avec mot de passe en argument
node scripts/decrypt-env.js "MonMotDePasse123!"

# Avec prompt interactif
node scripts/decrypt-env.js
```

**Caractéristiques :**
- Vérification d'intégrité
- Permissions automatiques : 600
- Protection contre les erreurs

**Utilisation :** Pour travailler localement

---

#### `secrets-manager.js`
**Gestionnaire complet de secrets**

```bash
# Afficher l'aide
node scripts/secrets-manager.js

# Lister toutes les variables (valeurs masquées)
node scripts/secrets-manager.js list

# Obtenir une variable spécifique
node scripts/secrets-manager.js get VITE_API_KEY

# Définir/mettre à jour une variable
node scripts/secrets-manager.js set VITE_API_KEY "nouvelle_valeur"

# Supprimer une variable
node scripts/secrets-manager.js delete VITE_OLD_KEY

# Changer le mot de passe de chiffrement
node scripts/secrets-manager.js rotate

# Exporter pour déploiement
node scripts/secrets-manager.js export
```

**Utilisation :** Gestion quotidienne des secrets

---

### 🔍 Vérification et audit

#### `verify-security.js`
**Vérifie la configuration de sécurité**

```bash
node scripts/verify-security.js
```

**Vérifications :**
- ✅ Présence de `.env.encrypted`
- ✅ Absence de `.env` en clair
- ✅ Configuration `.gitignore`
- ✅ Permissions des fichiers
- ✅ Présence des scripts
- ✅ Documentation

**Utilisation :** Avant commit, CI/CD, audit

---

### 🔑 Génération de mots de passe

#### `generate-password.js`
**Génère des mots de passe forts**

```bash
# Longueur par défaut : 32 caractères
node scripts/generate-password.js

# Longueur personnalisée
node scripts/generate-password.js 64
```

**Fonctionnalités :**
- Mot de passe complexe (aléatoire)
- Phrase de passe (mémorable)
- Caractères spéciaux inclus
- Distribution cryptographiquement sûre

**Utilisation :** Création de mots de passe initiaux

---

## 🔄 Workflow typique

### Première configuration

```bash
# 1. Initialiser
node scripts/init-security.js

# 2. Vérifier
node scripts/verify-security.js

# 3. Commit
git add .env.encrypted .gitignore
git commit -m "chore: initialisation sécurité"
```

### Travail quotidien

```bash
# 1. Déchiffrer
node scripts/decrypt-env.js

# 2. Travailler
npm run dev
# ... modifications ...

# 3. Re-chiffrer
node scripts/encrypt-env.js

# 4. Commit
git add .env.encrypted
git commit -m "chore: mise à jour secrets"
```

### Rotation des secrets

```bash
# 1. Changer le mot de passe
node scripts/secrets-manager.js rotate

# 2. Vérifier
node scripts/verify-security.js

# 3. Commit
git add .env.encrypted
git commit -m "security: rotation des secrets"
```

---

## 🔒 Sécurité des scripts

### Bonnes pratiques

✅ **À faire :**
- Utiliser des mots de passe forts (16+ caractères)
- Stocker les mots de passe dans un gestionnaire
- Rotation régulière (90 jours)
- Vérifier avec `verify-security.js`

❌ **À ne jamais faire :**
- Écrire les mots de passe dans des fichiers
- Partager par email/messagerie
- Réutiliser des mots de passe
- Commiter `.env` en clair

### Permissions recommandées

```bash
# Scripts exécutables
chmod +x scripts/*.js

# Fichier .env (si présent)
chmod 600 .env

# Fichier chiffré
chmod 644 .env.encrypted
```

---

## 🐛 Dépannage

### Erreur : "Mot de passe incorrect"

**Causes possibles :**
- Mot de passe mal saisi
- Fichier `.env.encrypted` corrompu
- Caractères spéciaux mal échappés

**Solutions :**
```bash
# Vérifier le fichier
file .env.encrypted

# Restaurer depuis Git
git checkout HEAD -- .env.encrypted

# Réinitialiser (perd les données)
rm .env.encrypted
node scripts/init-security.js
```

### Erreur : "Fichier .env.encrypted introuvable"

**Solution :**
```bash
# Initialiser
node scripts/init-security.js
```

### Erreur : "Permission denied"

**Solution :**
```bash
# Rendre les scripts exécutables
chmod +x scripts/*.js

# Ou utiliser node explicitement
node scripts/encrypt-env.js
```

---

## 📚 Documentation complémentaire

- **[docs/SECURITY.md](../docs/SECURITY.md)** - Guide complet de sécurité
- **[docs/TROUBLESHOOTING.md](../docs/TROUBLESHOOTING.md)** - Dépannage avancé
- **[SECURITY_QUICKSTART.md](../SECURITY_QUICKSTART.md)** - Guide rapide

---

## 🎓 Formation

### Pour les nouveaux développeurs

1. **Lire** ce README (10 min)
2. **Exécuter** `node scripts/init-security.js` (5 min)
3. **Tester** les commandes de base (10 min)
4. **Consulter** docs/SECURITY.md (30 min)

### Pour les administrateurs

1. **Maîtriser** tous les scripts
2. **Comprendre** l'architecture de chiffrement
3. **Savoir** gérer les incidents
4. **Former** l'équipe

---

## 📞 Support

**Contact sécurité :**
- Email : security@secureretail-ops.fr
- Slack : #security-team
- Documentation : https://wiki.secureretail-ops.fr/security

**Signaler un incident :**
- Email : incident@secureretail-ops.fr
- Téléphone : +33 1 XX XX XX XX (24/7)

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 2.0  
**Statut** : ✅ Production
