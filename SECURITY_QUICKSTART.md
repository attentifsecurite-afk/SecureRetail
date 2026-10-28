# 🚀 Guide Rapide - Sécurité des Secrets

## ⚡ Démarrage rapide (5 minutes)

### 1. Initialisation

```bash
# Lancer le script d'initialisation
node scripts/init-security.js
```

Le script va :
- ✅ Créer le fichier `.env` depuis le template
- ✅ Vous guider pour configurer vos variables
- ✅ Choisir un mot de passe de chiffrement
- ✅ Chiffrer le fichier `.env`
- ✅ Supprimer le fichier en clair

### 2. Travailler avec les secrets

```bash
# Déchiffrer pour travailler
node scripts/decrypt-env.js

# Travailler normalement
npm run dev

# Re-chiffrer avant de commit
node scripts/encrypt-env.js
```

### 3. Vérifier la configuration

```bash
# Vérifier que tout est bien configuré
node scripts/verify-security.js
```

## 📋 Commandes essentielles

| Action | Commande |
|--------|----------|
| Initialiser | `node scripts/init-security.js` |
| Déchiffrer | `node scripts/decrypt-env.js` |
| Chiffrer | `node scripts/encrypt-env.js` |
| Lister les variables | `node scripts/secrets-manager.js list` |
| Obtenir une variable | `node scripts/secrets-manager.js get NOM` |
| Définir une variable | `node scripts/secrets-manager.js set NOM valeur` |
| Changer le mot de passe | `node scripts/secrets-manager.js rotate` |
| Vérifier la config | `node scripts/verify-security.js` |

## 🔐 Règles d'or

### ✅ TOUJOURS faire

- Chiffrer `.env` avant de commit
- Utiliser un gestionnaire de mots de passe
- Rotation tous les 90 jours
- Vérifier avec `verify-security.js`

### ❌ JAMAIS faire

- Commiter `.env` en clair
- Partager le mot de passe par email
- Utiliser des mots de passe faibles
- Stocker les secrets dans le code

## 📁 Structure des fichiers

```
.env                  ❌ Jamais commité (clair)
.env.encrypted        ✅ Commité (chiffré)
.env.example          ✅ Commité (template)
```

## 🆘 En cas de problème

### Mot de passe perdu
→ Les données chiffrées sont perdues définitivement
→ Recréer `.env` depuis `.env.example`
→ Régénérer les clés API

### Fichier corrompu
```bash
# Restaurer depuis Git
git checkout HEAD -- .env.encrypted

# Tenter de déchiffrer
node scripts/decrypt-env.js
```

### Fuite de secrets
1. Révoquer immédiatement les clés exposées
2. Générer de nouvelles clés
3. Mettre à jour `.env`
4. Re-chiffrer
5. Nettoyer l'historique Git

## 📚 Documentation complète

- **[docs/SECURITY.md](docs/SECURITY.md)** - Guide complet de sécurité
- **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)** - Dépannage

## 🎓 Formation

Pour former votre équipe :
1. Lire ce guide rapide (5 min)
2. Lire docs/SECURITY.md (30 min)
3. Pratiquer avec les scripts (15 min)
4. Simuler un incident (15 min)

---

**Besoin d'aide ?** → docs/SECURITY.md ou security@secureretail-ops.fr
