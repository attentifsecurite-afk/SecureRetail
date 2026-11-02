# 🔧 Résolution de l'erreur "Cannot read properties of null (reading 'useState')"

## 🐛 Problème identifié

L'erreur `Cannot read properties of null (reading 'useState')` indique que React est null au moment de l'exécution. Cela peut avoir plusieurs causes :

1. **Import incorrect de React** dans les fichiers de service
2. **Conflit de versions** de React dans le projet
3. **Problème de chargement** des modules
4. **Configuration Vite** incorrecte

## ✅ Corrections appliquées

### 1. Fichier `src/services/api.ts`

**Problème** : Le fichier importait `useState` et `useEffect` sans importer React correctement.

**Correction** :
```typescript
// Avant
import { useState, useEffect } from 'react';

// Après
import React, { useState, useEffect } from 'react';
```

### 2. Fichier `src/main.tsx`

**Problème** : Pas de vérification que React est correctement chargé avant le rendu.

**Correction** :
```typescript
// Ajout de vérification
if (!React || !React.useState) {
  console.error('React is not properly loaded');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Erreur: React n\'est pas correctement chargé.</div>';
  throw new Error('React is not properly loaded');
}

// Ajout de try-catch pour le rendu
try {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} catch (error) {
  console.error('Error rendering app:', error);
  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  document.body.innerHTML = `<div style="padding: 20px; color: red;">Erreur de rendu: ${errorMessage}</div>`;
}
```

### 3. Fichier `src/contexts/AuthContext.tsx`

**Problème** : Import statique de `authApi` qui pouvait causer des problèmes de chargement circulaire.

**Correction** :
```typescript
// Avant
import { authApi } from '../services/api';

// Après - Import dynamique
useEffect(() => {
  const initAuth = async () => {
    try {
      const { authApi } = await import('../services/api');
      // ... reste du code
    } catch (error) {
      console.error('Error initializing auth:', error);
      setLoading(false);
    }
  };
  initAuth();
}, []);
```

### 4. Fichier `vite.config.js`

**Problème** : Configuration Vite insuffisante pour garantir une seule instance de React.

**Correction** :
```javascript
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
    tailwindcss()
  ],
  resolve: {
    dedupe: ['react', 'react-dom'],
    alias: {
      'react': 'react',
      'react-dom': 'react-dom',
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
        },
      },
    },
  },
});
```

## 🔍 Diagnostic

### Vérifier que React est correctement chargé

Ouvrez la console du navigateur et exécutez :
```javascript
console.log('React:', typeof React);
console.log('React.useState:', typeof React?.useState);
```

Si React est `undefined` ou `null`, il y a un problème de chargement.

### Vérifier les imports

Dans chaque fichier qui utilise des hooks React, vérifiez que React est importé :
```typescript
import React, { useState, useEffect } from 'react';
```

### Vérifier les conflits de versions

```bash
npm list react react-dom
```

Vous devriez voir une seule version de React et react-dom.

## 🚀 Solutions alternatives

### Solution 1 : Réinstaller les dépendances

```bash
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstaller
npm install

# Rebuild
npm run build
```

### Solution 2 : Vérifier package.json

Assurez-vous que `react` et `react-dom` sont dans les dépendances :
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

### Solution 3 : Désactiver StrictMode temporairement

```typescript
// Dans main.tsx
ReactDOM.createRoot(rootElement).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
```

### Solution 4 : Vérifier le fichier index.html

Assurez-vous que le div root existe :
```html
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
```

## 📋 Checklist de vérification

- [ ] React est correctement importé dans tous les fichiers
- [ ] Une seule version de React dans le projet
- [ ] Vite est correctement configuré avec `dedupe: ['react', 'react-dom']`
- [ ] Le fichier `main.tsx` vérifie que React est chargé
- [ ] Les imports dynamiques sont utilisés pour éviter les cycles
- [ ] Le build passe sans erreur

## 🎯 Résultat attendu

Après ces corrections, l'application devrait :
- ✅ Charger React correctement
- ✅ Initialiser les hooks sans erreur
- ✅ Rendre l'application sans crash
- ✅ Afficher un message d'erreur clair si React n'est pas chargé

## 📞 Support

Si le problème persiste :
1. Vérifiez la console du navigateur pour plus de détails
2. Vérifiez que toutes les dépendances sont installées
3. Essayez de réinstaller les dépendances
4. Consultez la documentation React : https://react.dev/

---

**Dernière mise à jour** : Janvier 2026  
**Statut** : ✅ Corrections appliquées
