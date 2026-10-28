#!/usr/bin/env node

/**
 * Script d'initialisation de la sécurité
 * Guide l'utilisateur pour la première configuration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const encryptedPath = path.join(__dirname, '..', '.env.encrypted');

function log(message, type = 'info') {
  const icons = {
    step: '📍',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  console.log(`${icons[type]}  ${message}`);
}

function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     🔐 Initialisation de la sécurité - SecureRetail Ops   ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Étape 1 : Vérifier si .env.encrypted existe déjà
  if (fs.existsSync(encryptedPath)) {
    log('Le fichier .env.encrypted existe déjà', 'warning');
    const answer = await prompt('Voulez-vous le remplacer? (o/n): ');
    
    if (answer.toLowerCase() !== 'o' && answer.toLowerCase() !== 'oui') {
      console.log('\n❌ Initialisation annulée\n');
      process.exit(0);
    }
  }
  
  // Étape 2 : Créer .env depuis .env.example
  console.log('\n📍 Étape 1/4 : Création du fichier .env\n');
  
  if (!fs.existsSync(envExamplePath)) {
    log('Fichier .env.example introuvable', 'error');
    process.exit(1);
  }
  
  if (fs.existsSync(envPath)) {
    log('Le fichier .env existe déjà', 'warning');
  } else {
    fs.copyFileSync(envExamplePath, envPath);
    log('Fichier .env créé depuis .env.example', 'success');
  }
  
  // Étape 3 : Éditer .env
  console.log('\n📍 Étape 2/4 : Configuration des variables\n');
  log('Éditez le fichier .env avec vos vraies valeurs', 'info');
  console.log('');
  console.log('   nano .env');
  console.log('');
  console.log('   Ou utilisez votre éditeur préféré:');
  console.log('   - VS Code: code .env');
  console.log('   - Vim: vim .env');
  console.log('');
  
  const ready = await prompt('Appuyez sur Entrée quand vous avez terminé...');
  
  // Étape 4 : Choisir un mot de passe
  console.log('\n📍 Étape 3/4 : Choix du mot de passe de chiffrement\n');
  log('Ce mot de passe protégera toutes vos variables sensibles', 'info');
  log('CONSERVEZ-LE EN LIEU SÛR - Il ne peut pas être récupéré', 'warning');
  console.log('');
  
  let password = await prompt('Mot de passe (min. 8 caractères): ');
  
  while (password.length < 8) {
    log('Le mot de passe doit contenir au moins 8 caractères', 'error');
    password = await prompt('Mot de passe (min. 8 caractères): ');
  }
  
  const confirm = await prompt('Confirmez le mot de passe: ');
  
  while (password !== confirm) {
    log('Les mots de passe ne correspondent pas', 'error');
    password = await prompt('Mot de passe (min. 8 caractères): ');
    const confirm2 = await prompt('Confirmez le mot de passe: ');
    if (password !== confirm2) {
      continue;
    }
    break;
  }
  
  // Étape 5 : Chiffrer
  console.log('\n📍 Étape 4/4 : Chiffrement du fichier\n');
  
  try {
    const { execSync } = require('child_process');
    execSync(`node ${path.join(__dirname, 'encrypt-env.js')} "${password}"`, {
      stdio: 'inherit'
    });
  } catch (error) {
    log('Erreur lors du chiffrement', 'error');
    process.exit(1);
  }
  
  // Étape 6 : Nettoyer
  console.log('\n📍 Nettoyage\n');
  
  if (fs.existsSync(envPath)) {
    const deleteEnv = await prompt('Supprimer le fichier .env en clair? (recommandé) (o/n): ');
    
    if (deleteEnv.toLowerCase() === 'o' || deleteEnv.toLowerCase() === 'oui') {
      fs.unlinkSync(envPath);
      log('Fichier .env supprimé', 'success');
    } else {
      log('Fichier .env conservé (attention: ne pas commiter!)', 'warning');
    }
  }
  
  // Résumé
  console.log('\n' + '═'.repeat(60));
  console.log('\n✅ INITIALISATION TERMINÉE\n');
  console.log('📁 Fichiers créés:');
  console.log('   - .env.encrypted (chiffré, peut être commité)');
  console.log('   - .env.example (template, peut être commité)');
  console.log('');
  console.log('🔐 Votre mot de passe de chiffrement:');
  console.log('   Conservez-le dans un gestionnaire de mots de passe');
  console.log('   (1Password, Bitwarden, KeePass, etc.)');
  console.log('');
  console.log('📖 Pour déchiffrer et travailler:');
  console.log('   node scripts/decrypt-env.js');
  console.log('');
  console.log('📚 Documentation complète:');
  console.log('   docs/SECURITY.md');
  console.log('');
  console.log('═'.repeat(60) + '\n');
}

main().catch(error => {
  console.error('Erreur:', error.message);
  process.exit(1);
});
