# 🎥 Connexion Caméras - Guide Complet

## 📋 Vue d'ensemble

Le module **Connexion Caméras** permet de gérer tous vos équipements de vidéosurveillance et contrôle d'accès depuis une interface centralisée. Il supporte les caméras IP, DVR, NVR et systèmes de contrôle d'accès de toutes les marques majeures.

## 🎯 Fonctionnalités principales

### 1. Support multi-protocoles
- **ONVIF** (Profile S, G, T) - Standard ouvert pour la vidéosurveillance
- **RTSP** (Real Time Streaming Protocol) - Streaming vidéo en temps réel
- **HTTP/HTTPS** - Accès web et snapshots
- **Protocoles propriétaires** - SDK spécifiques aux fabricants
- **CGI** (Common Gateway Interface) - Contrôle basique

### 2. Types d'appareils supportés
- **Caméras IP** - Fixes, PTZ, dôme, thermiques
- **DVR** (Digital Video Recorder) - Enregistreurs numériques
- **NVR** (Network Video Recorder) - Enregistreurs réseau
- **Contrôle d'accès** - Lecteurs de badges, biométrie, interphones
- **Encodeurs vidéo** - Conversion analogique vers IP

### 3. Marques compatibles
- Hikvision
- Dahua
- Axis Communications
- Hanwha (Wisenet)
- Bosch
- Milestone
- Uniview
- Et toute caméra compatible ONVIF/RTSP

### 4. Détection automatique
- Scan réseau pour découvrir les appareils
- Identification automatique de la marque et du modèle
- Configuration assistée avec paramètres par défaut
- Vérification de connectivité en temps réel

### 5. Gestion des flux vidéo
- URLs RTSP pré-configurées par marque
- Support multi-flux (principal, secondaire)
- Résolution et FPS configurables
- Chemins de streaming personnalisables

## 🚀 Démarrage rapide

### Ajouter une caméra manuellement

1. Cliquez sur **"Ajouter manuellement"**
2. Sélectionnez le **type d'appareil** (Caméra IP, DVR, NVR, Contrôle d'accès)
3. Choisissez la **marque** et le **modèle**
4. Entrez l'**adresse IP** et le **port**
5. Configurez les **identifiants** (utilisateur/mot de passe)
6. Le **chemin du flux** est auto-rempli selon la marque
7. Cliquez sur **"Enregistrer"**

### Scanner le réseau

1. Cliquez sur **"Scanner réseau"**
2. L'application découvre automatiquement les appareils
3. Chaque appareil détecté affiche :
   - Marque et modèle
   - Adresse IP et MAC
   - Type d'appareil
4. Cliquez sur **"Ajouter"** pour configurer l'appareil
5. Les paramètres par défaut sont appliqués automatiquement

### Tester la connexion

- Cliquez sur l'icône **Refresh** (🔄) à droite de l'appareil
- Le statut change :
  - 🔵 **Test...** - Connexion en cours
  - 🟢 **En ligne** - Connexion réussie
  - 🔴 **Hors ligne** - Appareil inaccessible
  - 🟠 **Erreur** - Problème d'authentification ou configuration

## 📊 Tableau de bord

### Statistiques en temps réel
- **Total** - Nombre total d'appareils
- **En ligne** - Appareils accessibles
- **Hors ligne** - Appareils déconnectés
- **Erreur** - Appareils avec problème de configuration
- **Caméras IP** - Nombre de caméras
- **DVR** - Nombre d'enregistreurs DVR
- **NVR** - Nombre d'enregistreurs NVR
- **Contrôle d'accès** - Nombre de dispositifs d'accès

### Filtres avancés
- **Recherche** - Par nom, IP ou modèle
- **Type** - Caméra IP, DVR, NVR, Contrôle d'accès
- **Marque** - Toutes les marques supportées
- **Statut** - En ligne, hors ligne, erreur

## 🔧 Configuration par marque

### Hikvision

**Caméras IP :**
- Port ONVIF : 80
- Port RTSP : 554
- Port SDK : 8000
- Chemin RTSP : `/Streaming/Channels/101`
- URL exemple : `rtsp://admin:password@192.168.1.101:554/Streaming/Channels/101`

**DVR/NVR :**
- Port SDK : 8000
- Canaux : 4, 8, 16, 32, 64
- Chemin RTSP : `/Streaming/Channels/{channel}01`

**Contrôle d'accès :**
- Port SDK : 8000
- Modèles : DS-K1T671MWX, DS-K1T341, etc.

### Dahua

**Caméras IP :**
- Port ONVIF : 80
- Port RTSP : 554
- Port SDK : 37777
- Chemin RTSP : `/cam/realmonitor?channel=1&subtype=0`
- URL exemple : `rtsp://admin:password@192.168.1.102:554/cam/realmonitor?channel=1&subtype=0`

**DVR/NVR :**
- Port SDK : 37777
- Canaux : 4, 8, 16, 32
- Sous-types : 0 (principal), 1 (secondaire)

### Axis

**Caméras IP :**
- Port ONVIF : 80
- Port RTSP : 554
- Port HTTP : 80
- Chemin RTSP : `/axis-media/media.amp`
- URL exemple : `rtsp://root:password@192.168.1.103:554/axis-media/media.amp`

**Paramètres optionnels :**
- Résolution : `?resolution=1920x1080`
- Compression : `?compression=50`
- FPS : `?fps=30`

### Hanwha (Wisenet)

**Caméras IP :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/stream1`
- URL exemple : `rtsp://admin:password@192.168.1.104:554/stream1`

### Bosch

**Caméras IP :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/rtsp_tunnel`
- URL exemple : `rtsp://service:password@192.168.1.105:554/rtsp_tunnel`

## 🔐 Sécurité

### Bonnes pratiques

1. **Changez les mots de passe par défaut**
   - Ne jamais utiliser "admin/admin" ou "123456"
   - Utilisez des mots de passe forts (12+ caractères)
   - Combinez majuscules, minuscules, chiffres, symboles

2. **Isoler le réseau**
   - VLAN dédié pour les caméras
   - Pas d'accès Internet direct
   - Firewall entre réseau caméras et réseau principal

3. **Chiffrement**
   - HTTPS pour l'interface web
   - RTSPS (RTSP over TLS) si supporté
   - ONVIF avec authentification digest

4. **Mises à jour**
   - Firmware à jour
   - Correctifs de sécurité appliqués
   - Désactiver les services inutilisés

5. **Audit**
   - Logs de connexion
   - Surveillance des accès
   - Détection d'intrusion réseau

### Permissions recommandées

```bash
# Fichier .env avec les credentials
chmod 600 .env

# Scripts de gestion
chmod +x scripts/*.js
```

## 🛠️ Dépannage

### Caméra hors ligne

**Vérifications :**
1. Caméra allumée ?
2. Câble réseau connecté ?
3. Adresse IP correcte ?
4. Port accessible ?
5. Identifiants valides ?

**Commandes de diagnostic :**
```bash
# Test de connectivité
ping 192.168.1.101

# Test du port RTSP
nc -zv 192.168.1.101 554

# Test ONVIF
curl -X POST http://192.168.1.101/onvif/device_service

# Test du flux RTSP avec FFmpeg
ffplay rtsp://admin:password@192.168.1.101:554/Streaming/Channels/101
```

### Erreur d'authentification

**Causes possibles :**
- Utilisateur inexistant
- Mot de passe incorrect
- Compte désactivé
- Permissions insuffisantes

**Solutions :**
1. Accéder à l'interface web de la caméra
2. Réinitialiser le mot de passe
3. Vérifier les permissions de l'utilisateur
4. Mettre à jour les credentials dans l'application

### Flux vidéo saccadé

**Causes possibles :**
- Bande passante insuffisante
- Résolution trop élevée
- FPS trop important
- Réseau saturé

**Solutions :**
1. Réduire la résolution
2. Diminuer les FPS
3. Utiliser le flux secondaire (subtype=1)
4. Vérifier la bande passante disponible

### Scan réseau ne trouve rien

**Causes possibles :**
- Appareils sur un sous-réseau différent
- Firewall bloquant les requêtes
- ONVIF désactivé sur les caméras
- Port bloqué

**Solutions :**
1. Vérifier le sous-réseau
2. Désactiver temporairement le firewall
3. Activer ONVIF sur les caméras
4. Scanner manuellement par plage IP

## 📚 Intégration avec d'autres modules

### ShopGuard AI
- Les caméras configurées sont automatiquement disponibles pour l'analyse IA
- Détection d'objets en temps réel
- Tracking multi-objets
- Alertes intelligentes

### Vidéosurveillance
- Statut des caméras synchronisé
- Alertes centralisées
- Historique des événements

### Cartographie avancée
- Position des caméras sur la carte
- Zones de couverture
- Visualisation des angles morts

## 🎓 Formation

### Pour les administrateurs

1. **Configuration initiale** (30 min)
   - Ajouter les premières caméras
   - Configurer les identifiants
   - Tester les connexions

2. **Gestion quotidienne** (15 min)
   - Surveiller les statuts
   - Gérer les alertes
   - Maintenir les configurations

3. **Dépannage** (30 min)
   - Diagnostiquer les problèmes
   - Résoudre les erreurs courantes
   - Optimiser les performances

### Pour les opérateurs

1. **Utilisation de base** (15 min)
   - Consulter les caméras
   - Comprendre les statuts
   - Signaler les problèmes

## 📞 Support

**Documentation :**
- Guide d'installation : `docs/CAMERA_INSTALLATION.md`
- Sécurité : `docs/SECURITY.md`
- Dépannage : `docs/TROUBLESHOOTING.md`

**Contact :**
- Email : support@secureretail-ops.fr
- Téléphone : +33 1 XX XX XX XX
- Horaires : Lun-Ven 9h-18h

## 🔄 Mises à jour

### Version 2.1.0 (Janvier 2026)
- ✅ Support contrôle d'accès
- ✅ Scan réseau automatique
- ✅ Détection multi-marques
- ✅ Configuration assistée
- ✅ Test de connexion en temps réel

### Prochaines versions
- 🔜 Intégration avec systèmes d'alarme
- 🔜 Support des caméras thermiques
- 🔜 Gestion des licences
- 🔜 Export de configuration

---

**Dernière mise à jour** : Janvier 2026  
**Version** : 2.1.0  
**Statut** : ✅ Production
