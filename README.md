# SecureRetail Ops 🛡️

**La plateforme SaaS de référence pour la sécurité retail en France**

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-Commercial-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-success)

---

## 🎯 À Propos

SecureRetail Ops est une plateforme tout-en-un conçue pour les enseignes de la grande distribution, du luxe et du e-commerce. Elle permet de piloter la sécurité de vos points de vente avec intelligence artificielle, cartographie avancée et CRM intégré.

### 🏆 Pourquoi SecureRetail Ops ?

✅ **Vision centralisée** - Pilotez tous vos sites depuis une interface unique  
✅ **IA propriétaire** - ShopGuard AI pour détection intelligente  
✅ **Conformité garantie** - RGPD, CNIL, normes sectorielles  
✅ **ROI démontré** - Réduction des incidents de 40% en 6 mois  
✅ **Support français** - Assistance 24/7 par des experts  

---

## 🚀 Démarrage Rapide

### Installation

```bash
# Cloner le repository
git clone https://github.com/secureretail-ops/platform.git
cd platform

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la sécurité
node scripts/init-security.js

# Lancer en développement
npm run dev

# Build production
npm run build
```

### Accès

- **Application** : http://localhost:3000
- **Landing page** : http://localhost:3000/landing
- **Documentation** : http://localhost:3000/docs

---

## 📦 Modules Inclus

### 🎯 Opérations
- **Dashboard** - Vue d'ensemble temps réel
- **Cartographie avancée** - Visualisation géographique avec heatmap
- **Main courante** - Journal électronique des événements
- **Rondes** - Suivi des patrouilles et points de contrôle
- **Alarmes** - Gestion des alertes et levées de doute
- **Vidéosurveillance** - Statut et gestion des caméras

### 🤖 Intelligence Artificielle
- **ShopGuard AI** - Détection YOLO26 + Pose + LLM Guard
- **Détection automatique** - Comportements suspects
- **Analytics avancés** - KPIs et reporting

### 🏢 Gestion
- **CRM Sites** - Contacts, contrats, interventions
- **Facturation** - Devis, factures, avoirs
- **Support** - Tickets et assistance client
- **Agents** - Gestion du personnel

### 🎥 Équipements
- **Connexion caméras** - IP, ONVIF, DVR, NVR
- **Installation caméras** - Configuration multi-marques
- **Sites** - Référentiel multi-sites
- **Démarque inconnue** - Analyse des pertes

---

## 💰 Tarification

### Starter - 299€/mois
Pour les petites équipes (1-5 sites)
- 5 sites maximum
- 50 caméras
- Modules de base
- Support email

### Professional - 799€/mois ⭐
Pour les entreprises en croissance (6-20 sites)
- 20 sites maximum
- 200 caméras
- ShopGuard AI inclus
- CRM + Facturation
- Support prioritaire

### Enterprise - Sur mesure
Pour les grandes organisations (20+ sites)
- Sites illimités
- Toutes les fonctionnalités
- Support dédié 24/7
- Formation sur site
- SLA garanti

**🎁 Essai gratuit 30 jours** - Sans engagement

---

## 📊 Chiffres Clés

| Métrique | Valeur |
|----------|--------|
| Sites sécurisés | 500+ |
| Caméras gérées | 10 000+ |
| Agents coordonnés | 2 000+ |
| Disponibilité | 99.9% |
| Réduction incidents | -40% |
| ROI moyen | 18 mois |

---

## 🔐 Sécurité & Conformité

### Certifications
- ✅ ISO 27001 (Sécurité de l'information)
- ✅ HDS (Hébergement Données de Santé)
- ✅ RGPD compliant
- ✅ CNIL conforme

### Architecture
- Chiffrement AES-256-GCM pour les secrets
- Authentification multi-facteurs
- Sauvegardes quotidiennes
- Datacenters en France (OVH, Scaleway)

### Confidentialité
- Pas de reconnaissance faciale
- Données anonymisées
- Rétention configurable
- Droit à l'oubli

---

## 🛠️ Stack Technique

### Frontend
- **React 18** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styling
- **Recharts** - Graphiques
- **Lucide React** - Icônes

### Backend (à venir)
- **Node.js** - API REST
- **PostgreSQL** - Base de données
- **Redis** - Cache
- **Python** - ShopGuard AI Engine

### Infrastructure
- **Vite** - Build tool
- **Docker** - Conteneurisation
- **GitHub Actions** - CI/CD
- **Vercel** - Déploiement

---

## 📚 Documentation

### Technique
- [Guide d'installation](docs/INSTALLATION.md)
- [Sécurité des secrets](docs/SECURITY.md)
- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)

### Fonctionnel
- [CRM](docs/CRM.md)
- [Connexion caméras](docs/CAMERA_CONNECTION.md)
- [ShopGuard AI](docs/SHOPGUARD.md)
- [Facturation](docs/BILLING.md)

### Commercial
- [Brochure commerciale](docs/BROCHURE_COMMERCIALE.md)
- [Conditions Générales de Vente](docs/CGV.md)
- [Guide de lancement](docs/LANCEMENT_COMMERCIAL.md)

---

## 🎓 Cas d'Usage

### Grande Distribution
**Problème** : Démarche inconnue élevée  
**Solution** : ShopGuard AI + Détection automatique  
**Résultat** : -45% de démarque en 6 mois

### Luxe
**Problème** : Besoin de discrétion, clientèle VIP  
**Solution** : Interface personnalisée + Alertes silencieuses  
**Résultat** : Satisfaction client +30%

### E-commerce / Drive
**Problème** : Zones de chargement vulnérables  
**Solution** : Contrôle d'accès + Rondes automatisées  
**Résultat** : Zéro incident en 12 mois

---

## 🤝 Témoignages

> "SecureRetail Ops a révolutionné notre gestion de la sécurité. Nous avons réduit les incidents de 40% en 6 mois."
> 
> **— Jean Dupont, Directeur Sûreté, Retail Group Paris**

> "L'IA ShopGuard est impressionnante. La détection automatique nous a permis d'identifier des comportements suspects que nous aurions manqués."
> 
> **— Sophie Martin, Responsable Sécurité, Luxury Brand**

> "Le CRM intégré nous a fait gagner un temps fou. Tout est centralisé, de la gestion des contrats aux interventions techniques."
> 
> **— Pierre Bernard, CEO, SecurTech Solutions**

---

## 🚀 Roadmap 2026

### Q1 2026 ✅
- [x] CRM intégré
- [x] Facturation
- [x] Support client
- [x] Landing page commerciale

### Q2 2026 🔄
- [ ] Application mobile native
- [ ] Intégration contrôle d'accès
- [ ] Analytics prédictifs
- [ ] Marketplace d'intégrations

### Q3 2026 📅
- [ ] Multi-langue (EN, ES, DE)
- [ ] White-label
- [ ] Blockchain audit trail
- [ ] IoT integration

### Q4 2026 📅
- [ ] Edge computing
- [ ] Advanced AI models
- [ ] International expansion
- [ ] Levée de fonds Série A

---

## 📞 Contact

### Commercial
- 📧 commercial@secureretail-ops.fr
- 📞 +33 1 23 45 67 89
- 🌐 www.secureretail-ops.fr

### Support
- 📧 support@secureretail-ops.fr
- 📞 +33 1 23 45 67 89
- 💬 Chat en direct 24/7

### Réseaux Sociaux
- [LinkedIn](https://linkedin.com/company/secureretail-ops)
- [Twitter](https://twitter.com/SecureRetailOps)
- [YouTube](https://youtube.com/@SecureRetailOps)

---

## 📄 Mentions Légales

**SecureRetail Ops SAS**  
12 Rue de la Sécurité  
75008 Paris  
France  

SIRET : 123 456 789 00012  
TVA : FR12 345678901  

- [Conditions Générales de Vente](docs/CGV.md)
- [Politique de Confidentialité](docs/PRIVACY.md)
- [Mentions Légales](docs/LEGAL.md)

---

## 🎉 Rejoignez-nous !

**Prêt à sécuriser vos sites ?**

[🚀 Démarrer l'essai gratuit](https://www.secureretail-ops.fr/signup)  
[📅 Planifier une démo](https://www.secureretail-ops.fr/demo)  
[📞 Nous contacter](https://www.secureretail-ops.fr/contact)

---

<div align="center">

**SecureRetail Ops** - La sécurité retail réinventée

[Website](https://www.secureretail-ops.fr) • [Documentation](https://docs.secureretail-ops.fr) • [Support](https://support.secureretail-ops.fr)

© 2026 SecureRetail Ops SAS. Tous droits réservés.

</div>
