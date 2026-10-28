# 🔧 Troubleshooting - Erreur "Cannot read properties of null (reading 'useRef')"

## Problème identifié

L'erreur `Cannot read properties of null (reading 'useRef')` indique que React lui-même est null au moment de l'exécution. Cette erreur critique peut avoir plusieurs causes :

## Causes possibles

### 1. Conflit de versions React
**Symptôme** : Plusieurs instances de React dans le projet
**Solution appliquée** : Ajout de `resolve.dedupe` dans `vite.config.js`

```javascript
resolve: {
  dedupe: ['react', 'react-dom'],
}
```

### 2. Problème avec `@react-google-maps/api`
**Symptôme** : L'erreur se produit uniquement quand la carte est rendue
**Cause** : La bibliothèque utilise des hooks internes qui peuvent avoir des problèmes avec React 18.2.0

### 3. Import circulaire
**Symptôme** : L'erreur se produit au chargement de l'application
**Cause** : Un composant importe un autre composant qui l'importe en retour

### 4. Configuration JSX incorrecte
**Symptôme** : Erreurs de compilation ou d'exécution
**Cause** : Conflit entre `jsx: "react-jsx"` et les imports React

## Corrections appliquées

### ✅ Correction 1 : Vite Config
**Fichier** : `vite.config.js`
**Modification** : Ajout de `resolve.dedupe` pour forcer une seule instance de React

### ✅ Correction 2 : ErrorBoundary
**Fichier** : `src/components/ErrorBoundary.tsx`
**Modification** : Création d'un composant ErrorBoundary pour catcher les erreurs

### ✅ Correction 3 : React.StrictMode
**Fichier** : `src/main.tsx`
**Modification** : Enveloppement de l'application dans React.StrictMode

### ✅ Correction 4 : Vérification de la clé API
**Fichier** : `src/components/AdvancedMap.tsx`
**Modification** : Vérification de la clé API avant le rendu

### ✅ Correction 5 : Gestion des accès Google Maps
**Fichier** : `src/components/AdvancedMap.tsx`
**Modification** : Vérification de `window.google?.maps` avant tout accès

## Solutions alternatives

### Option A : Réinstaller les dépendances

```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller
npm install

# Rebuild
npm run build
```

### Option B : Remplacer @react-google-maps/api

Si le problème persiste, remplacer `@react-google-maps/api` par une approche plus simple :

#### Version sans bibliothèque externe

```typescript
import { useEffect, useRef, useState } from 'react';

export const SimpleMap: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || map) return;

    // Charger Google Maps dynamiquement
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`;
    script.async = true;
    script.onload = () => {
      if (mapRef.current && window.google) {
        const newMap = new window.google.maps.Map(mapRef.current, {
          center: { lat: 48.8566, lng: 2.3522 },
          zoom: 10,
        });
        setMap(newMap);
      }
    };
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '600px' }} />;
};
```

### Option C : Downgrade de React

Si le problème vient d'une incompatibilité avec React 18.2.0 :

```bash
npm install react@17.0.2 react-dom@17.0.2
npm install --save-dev @types/react@17.0.2 @types/react-dom@17.0.2
```

### Option D : Changer la configuration JSX

Dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "jsx": "react"  // Au lieu de "react-jsx"
  }
}
```

Puis ajouter `import React from 'react'` dans tous les fichiers JSX.

## Diagnostic avancé

### Vérifier les versions de React

```bash
npm list react react-dom
```

### Vérifier les imports circulaires

```bash
# Installer madge
npm install -g madge

# Vérifier les imports circulaires
madge --circular src/
```

### Vérifier le bundle final

```bash
# Analyser le bundle
npm install -g source-map-explorer
source-map-explorer dist/assets/*.js
```

## Étapes de débogage

1. **Isoler le problème**
   - Commenter tous les composants sauf un
   - Réactiver un par un pour identifier le composant problématique

2. **Vérifier les logs console**
   - Ouvrir la console du navigateur
   - Chercher des erreurs avant "Cannot read properties of null"

3. **Vérifier le network tab**
   - S'assurer que tous les fichiers JS sont chargés correctement
   - Vérifier qu'il n'y a pas de fichiers 404

4. **Vérifier les sources maps**
   - Activer les sources maps dans les dev tools
   - Identifier la ligne exacte où l'erreur se produit

## Contact support

Si le problème persiste après avoir essayé toutes les solutions :

1. Ouvrir une issue sur le repository
2. Inclure :
   - Version de Node.js (`node --version`)
   - Version de npm (`npm --version`)
   - Logs d'erreur complets
   - Capture d'écran de la console
   - Contenu de `package.json`

---

**Dernière mise à jour** : Janvier 2026  
**Statut** : En cours d'investigation
