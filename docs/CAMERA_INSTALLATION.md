# Guide d'installation des caméras - SecureRetail Ops

## 📹 Installation caméras DVR/NVR/ONVIF

Ce guide explique comment configurer vos caméras de vidéosurveillance dans la plateforme SecureRetail Ops.

---

## 🎯 Protocoles supportés

### ONVIF (Open Network Video Interface Forum)
- **Profile S** : Streaming vidéo en temps réel
- **Profile G** : Stockage et enregistrement
- **Profile T** : Streaming avancé (H.265)
- **Découverte automatique** des caméras sur le réseau

### RTSP (Real Time Streaming Protocol)
- Standard universel pour le streaming vidéo
- Compatible avec toutes les marques
- Faible latence

### HTTP/HTTPS
- Flux MJPEG
- Snapshots
- Compatible avec les navigateurs web

---

## 🏭 Marques compatibles

### Hikvision
**Modèles supportés :**
- DS-2CD2xxx (série 2)
- DS-2CD3xxx (série 3)
- iDS-2CD (Intelligent Series)
- DS-76xx/78xx (DVR/NVR)

**Configuration par défaut :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/Streaming/Channels/101`
- Format URL : `rtsp://{user}:{pass}@{ip}:554/Streaming/Channels/101`

**Exemple :**
```
rtsp://admin:password123@192.168.1.101:554/Streaming/Channels/101
```

---

### Dahua
**Modèles supportés :**
- IPC-HFWxxx (Bullet)
- IPC-HDWxxx (Dôme)
- NVR4xxx (NVR)
- XVRxxxx (DVR)

**Configuration par défaut :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/cam/realmonitor?channel=1&subtype=0`
- Format URL : `rtsp://{user}:{pass}@{ip}:554/cam/realmonitor?channel=1&subtype=0`

**Exemple :**
```
rtsp://admin:password123@192.168.1.102:554/cam/realmonitor?channel=1&subtype=0
```

**Sous-types disponibles :**
- `subtype=0` : Flux principal (haute qualité)
- `subtype=1` : Flux secondaire (basse qualité)
- `subtype=2` : Flux mobile

---

### Axis Communications
**Modèles supportés :**
- Série P (P12, P13, P14, P32, P33, P55, P56)
- Série Q (Q16, Q17, Q19, Q60, Q61, Q62)
- Série M (M10, M11, M20, M30, M31, M32)

**Configuration par défaut :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/axis-media/media.amp`
- Format URL : `rtsp://{user}:{pass}@{ip}:554/axis-media/media.amp`

**Exemple :**
```
rtsp://root:password123@192.168.1.103:554/axis-media/media.amp
```

**Paramètres optionnels :**
- Résolution : `?resolution=1920x1080`
- FPS : `?fps=30`
- Compression : `?compression=50`

---

### Hanwha (Wisenet)
**Modèles supportés :**
- XNV (Network Video)
- XND (Network Dome)
- XNB (Network Bullet)
- DVR/NVR série

**Configuration par défaut :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/stream1`
- Format URL : `rtsp://{user}:{pass}@{ip}:554/stream1`

**Exemple :**
```
rtsp://admin:password123@192.168.1.104:554/stream1
```

---

### Bosch
**Modèles supportés :**
- AUTODOME IP
- FLEXIDOME IP
- MIC IP
- NVR série

**Configuration par défaut :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/rtsp_tunnel`
- Format URL : `rtsp://{user}:{pass}@{ip}:554/rtsp_tunnel`

**Exemple :**
```
rtsp://service:password123@192.168.1.105:554/rtsp_tunnel
```

---

### Milestone
**Modèles supportés :**
- NVR série
- XProtect VMS

**Configuration par défaut :**
- Port ONVIF : 80
- Port RTSP : 554
- Chemin RTSP : `/stream`
- Format URL : `rtsp://{user}:{pass}@{ip}:554/stream`

---

## 🔧 Procédure d'installation

### 1. Préparation réseau

**Vérifier la connectivité :**
```bash
# Ping de la caméra
ping 192.168.1.101

# Test du port RTSP
telnet 192.168.1.101 554

# Test ONVIF
curl -X POST http://192.168.1.101/onvif/device_service
```

**Configuration réseau recommandée :**
- VLAN dédié pour les caméras
- Adresses IP statiques
- DHCP reservations pour les caméras
- Bande passante : 4-8 Mbps par caméra HD

---

### 2. Configuration via l'interface web

#### Étape 1 : Accéder au module "Installation caméras"
- Menu latéral → **Installation caméras**
- Cliquez sur **"Ajouter une caméra"**

#### Étape 2 : Renseigner les informations
- **Nom** : Identifiant unique (ex: "Entrée principale")
- **Site** : Sélectionnez le magasin
- **Emplacement** : Zone précise (ex: "Hall entrée")
- **Marque** : Sélectionnez la marque (Hikvision, Dahua, etc.)
- **Modèle** : Référence du modèle
- **Protocole** : ONVIF (recommandé) ou RTSP

#### Étape 3 : Configuration réseau
- **Adresse IP** : IP de la caméra
- **Port** : Port du service (80 pour ONVIF, 554 pour RTSP)
- **Utilisateur** : Compte d'accès
- **Mot de passe** : Mot de passe associé

#### Étape 4 : Chemin du flux
- Auto-rempli selon la marque sélectionnée
- Modifiable si configuration personnalisée
- Exemple Hikvision : `/Streaming/Channels/101`

#### Étape 5 : Tester la connexion
- Cliquez sur l'icône **Refresh** pour tester
- Statut attendu : **En ligne** (vert)
- En cas d'erreur, vérifier :
  - IP et port corrects
  - Identifiants valides
  - Caméra allumée et connectée au réseau
  - Pare-feu ne bloquant pas le port

#### Étape 6 : Enregistrer
- Cliquez sur **"Enregistrer"**
- La caméra apparaît dans la liste
- Le flux est automatiquement intégré au module Vidéosurveillance

---

### 3. Configuration via API (avancé)

**Endpoint REST :**
```http
POST /api/cameras
Content-Type: application/json

{
  "name": "Entrée principale",
  "siteId": "S001",
  "location": "Hall entrée",
  "brand": "Hikvision",
  "model": "DS-2CD2143G2-I",
  "protocol": "onvif",
  "ipAddress": "192.168.1.101",
  "port": 80,
  "username": "admin",
  "password": "password123",
  "streamPath": "/Streaming/Channels/101",
  "resolution": "2688x1520",
  "fps": 25,
  "enabled": true
}
```

**Réponse :**
```json
{
  "id": "CAM-001",
  "status": "online",
  "lastSeen": "2026-01-15T14:30:00Z"
}
```

---

## 🔐 Sécurité

### Bonnes pratiques

1. **Changer les mots de passe par défaut**
   - Ne jamais utiliser "admin/admin"
   - Mots de passe complexes (12+ caractères)
   - Rotation régulière des credentials

2. **Isoler le réseau des caméras**
   - VLAN dédié
   - Pas d'accès Internet direct
   - Firewall entre VLAN caméra et réseau principal

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

---

## 🐛 Dépannage

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

### Flux vidéo saccadé

**Causes possibles :**
- Bande passante insuffisante
- Résolution trop élevée
- FPS trop important
- Réseau saturé

**Solutions :**
- Réduire la résolution
- Diminuer les FPS
- Utiliser le flux secondaire (subtype=1)
- Vérifier la bande passante disponible

### Erreur d'authentification

**Vérifications :**
1. Utilisateur existe-t-il sur la caméra ?
2. Mot de passe correct ?
3. Compte activé ?
4. Permissions suffisantes ?

**Réinitialisation :**
- Accéder à l'interface web de la caméra
- Réinitialiser le mot de passe
- Mettre à jour les credentials dans SecureRetail Ops

---

## 📊 Intégration ShopGuard AI

Les caméras configurées sont automatiquement disponibles pour le moteur **ShopGuard AI** :

1. **Détection d'objets** (YOLO26)
   - Personnes, sacs, objets
   - Tracking multi-objets

2. **Analyse comportementale**
   - Détection de comportements suspects
   - Alertes en temps réel

3. **Corrélation multi-caméras**
   - Suivi d'individus entre caméras
   - Reconstruction de parcours

4. **Intégration ShopGuard**
   - Menu "ShopGuard AI"
   - Sélection des caméras à analyser
   - Configuration des règles de détection

---

## 📞 Support technique

**Documentation :**
- Manuel utilisateur complet disponible dans `/docs`
- FAQ : `/docs/faq.md`
- Changelog : `/CHANGELOG.md`

**Contact :**
- Email : support@secureretail-ops.fr
- Téléphone : +33 1 XX XX XX XX
- Horaires : Lun-Ven 9h-18h

---

## 📝 Notes techniques

### Backend Python (ONVIF)

**Dépendances :**
```bash
pip install onvif-zeep
pip install python-onvif
```

**Exemple de code :**
```python
from onvif import ONVIFCamera

# Connexion
cam = ONVIFCamera('192.168.1.101', 80, 'admin', 'password')

# Récupération des profils
media_service = cam.create_media_service()
profiles = media_service.GetProfiles()

# Obtention de l'URI RTSP
stream_uri = media_service.GetStreamUri({
    'StreamSetup': {
        'Stream': 'RTP-Unicast',
        'Transport': {'Protocol': 'RTSP'}
    },
    'ProfileToken': profiles[0].token
})

print(f"Flux RTSP: {stream_uri.Uri}")
```

### FFmpeg (conversion de flux)

**Conversion RTSP → HLS :**
```bash
ffmpeg -i rtsp://admin:password@192.168.1.101:554/Streaming/Channels/101 \
  -c:v copy -c:a copy -f hls -hls_time 4 -hls_list_size 5 \
  output/stream.m3u8
```

**Conversion RTSP → MP4 :**
```bash
ffmpeg -i rtsp://admin:password@192.168.1.101:554/Streaming/Channels/101 \
  -c:v copy -c:a copy output.mp4
```

---

## ✅ Checklist d'installation

- [ ] Caméra physiquement installée
- [ ] Alimentation électrique OK
- [ ] Câble réseau connecté
- [ ] Adresse IP configurée
- [ ] Accès à l'interface web de la caméra
- [ ] Identifiants créés/modifiés
- [ ] ONVIF activé (si applicable)
- [ ] Résolution et FPS configurés
- [ ] Test de connectivité réussi
- [ ] Caméra ajoutée dans SecureRetail Ops
- [ ] Flux vidéo testé
- [ ] Intégration ShopGuard AI (optionnel)
- [ ] Documentation mise à jour

---

**Version du document :** 1.0  
**Dernière mise à jour :** Janvier 2026  
**Auteur :** Équipe SecureRetail Ops
