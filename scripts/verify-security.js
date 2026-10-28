#!/usr/bin/env node

/**
 * Script de vérification de la configuration de sécurité
 * Vérifie que tous les fichiers sont correctement configurés
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
const encryptedPath = path.join(__dirname, '..', '.env.encrypted');
const gitignorePath = path.join(__dirname, '..', '.gitignore');

let hasErrors = false;
let hasWarnings = false;

function log(message, type = 'info') {
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  console.log(`${icons[type]}  ${message}`);
}

function checkFile(filePath, shouldExist, description) {
  const exists = fs.existsSync(filePath);
  
  if (shouldExist && !exists) {
    log(`${description} - Fichier manquant: ${filePath}`, 'error');
    hasErrors = true;
    return false;
  }
  
  if (!shouldExist && exists) {
    log(`${description} - Fichier ne devrait pas exister: ${filePath}`, 'error');
    hasErrors = true;
    return false;
  }
  
  log(`${description} - OK`, 'success');
  return true;
}

function checkGitignore() {
  if (!fs.existsSync(gitignorePath)) {
    log('.gitignore manquant', 'error');
    hasErrors = true;
    return;
  }
  
  const content = fs.readFileSync(gitignorePath, 'utf8');
  
  // Vérifier que .env est exclu
  if (!content.includes('.env') || content.includes('!.env\n')) {
    log('.env n\'est pas correctement exclu dans .gitignore', 'error');
    hasErrors = true;
  } else {
    log('.env est exclu dans .gitignore', 'success');
  }
  
  // Vérifier que .env.encrypted est inclus
  if (!content.includes('!.env.encrypted')) {
    log('.env.encrypted n\'est pas explicitement inclus dans .gitignore', 'warning');
    hasWarnings = true;
  } else {
    log('.env.encrypted est inclus dans .gitignore', 'success');
  }
}

function checkFilePermissions(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const stats = fs.statSync(filePath);
  const mode = stats.mode.toString(8).slice(-3);
  
  if (mode !== '600') {
    log(`Permissions de ${path.basename(filePath)}: ${mode} (recommandé: 600)`, 'warning');
    hasWarnings = true;
  } else {
    log(`Permissions de ${path.basename(filePath)}: 600 (OK)`, 'success');
  }
}

function main() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     🔐 Vérification de la configuration de sécurité       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  // Vérifier les fichiers
  console.log('📁 Vérification des fichiers:\n');
  
  checkFile(envPath, false, '.env (ne devrait pas être commité)');
  checkFile(encryptedPath, true, '.env.encrypted (fichier chiffré)');
  checkFile(path.join(__dirname, '..', '.env.example'), true, '.env.example (template)');
  
  // Vérifier .gitignore
  console.log('\n🔒 Vérification de .gitignore:\n');
  checkGitignore();
  
  // Vérifier les permissions
  console.log('\n👥 Vérification des permissions:\n');
  checkFilePermissions(envPath);
  
  // Vérifier les scripts
  console.log('\n🛠️  Vérification des scripts:\n');
  checkFile(path.join(__dirname, 'encrypt-env.js'), true, 'encrypt-env.js');
  checkFile(path.join(__dirname, 'decrypt-env.js'), true, 'decrypt-env.js');
  checkFile(path.join(__dirname, 'secrets-manager.js'), true, 'secrets-manager.js');
  
  // Vérifier la documentation
  console.log('\n📚 Vérification de la documentation:\n');
  checkFile(path.join(__dirname, '..', 'docs', 'SECURITY.md'), true, 'docs/SECURITY.md');
  
  // Résumé
  console.log('\n' + '═'.repeat(60));
  
  if (hasErrors) {
    console.log('\n❌ ERREURS DÉTECTÉES - Configuration incomplète\n');
    console.log('Actions requises:');
    console.log('  1. Vérifiez que .env.encrypted existe');
    console.log('  2. Vérifiez que .env n\'existe pas (ou est dans .gitignore)');
    console.log('  3. Consultez docs/SECURITY.md pour la configuration');
    process.exit(1);
  }
  
  if (hasWarnings) {
    console.log('\n⚠️  AVERTISSEMENTS - Configuration fonctionnelle mais à améliorer\n');
    console.log('Recommandations:');
    console.log('  - Ajustez les permissions des fichiers sensibles');
    console.log('  - Vérifiez que .env.encrypted est dans .gitignore');
  }
  
  if (!hasErrors && !hasWarnings) {
    console.log('\n✅ CONFIGURATION PARFAITE - Tous les contrôles sont OK\n');
  }
  
  console.log('═'.repeat(60) + '\n');
}

main();
