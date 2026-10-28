#!/usr/bin/env node

/**
 * Gestionnaire de secrets pour SecureRetail Ops
 * Utilisation: node scripts/secrets-manager.js [commande]
 * 
 * Commandes:
 *   list    - Liste toutes les variables d'environnement
 *   get     - Affiche la valeur d'une variable
 *   set     - Définit ou met à jour une variable
 *   delete  - Supprime une variable
 *   rotate  - Change le mot de passe de chiffrement
 *   export  - Exporte les variables pour déploiement
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

const envPath = path.join(__dirname, '..', '.env');
const encryptedPath = path.join(__dirname, '..', '.env.encrypted');

function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
}

function encrypt(text, password) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = deriveKey(password, salt);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([
    cipher.update(text, 'utf8'),
    cipher.final()
  ]);
  
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([
    salt,
    iv,
    tag,
    encrypted
  ]).toString('base64');
}

function decrypt(encryptedText, password) {
  const buffer = Buffer.from(encryptedText, 'base64');
  
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = deriveKey(password, salt);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final()
  ]);
  
  return decrypted.toString('utf8');
}

function parseEnv(content) {
  const vars = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      vars[match[1]] = match[2];
    }
  }
  
  return vars;
}

function serializeEnv(vars) {
  let content = '# SecureRetail Ops — Variables d\'environnement\n';
  content += '# Fichier généré automatiquement - Ne pas modifier manuellement\n';
  content += `# Dernière modification: ${new Date().toISOString()}\n\n`;
  
  for (const [key, value] of Object.entries(vars)) {
    content += `${key}=${value}\n`;
  }
  
  return content;
}

function promptPassword(message = 'Entrez le mot de passe: ') {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question(message, (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function loadEnv(password) {
  if (!fs.existsSync(encryptedPath)) {
    console.error('❌ Fichier .env.encrypted introuvable');
    console.log('   Exécutez: node scripts/encrypt-env.js');
    process.exit(1);
  }
  
  const encrypted = fs.readFileSync(encryptedPath, 'utf8');
  
  try {
    const decrypted = decrypt(encrypted, password);
    return parseEnv(decrypted);
  } catch (error) {
    console.error('❌ Mot de passe incorrect');
    process.exit(1);
  }
}

function saveEnv(vars, password) {
  const content = serializeEnv(vars);
  const encrypted = encrypt(content, password);
  fs.writeFileSync(encryptedPath, encrypted);
}

async function listCommand(password) {
  const vars = await loadEnv(password);
  
  console.log('\n📋 Variables d\'environnement:\n');
  console.log('─'.repeat(60));
  
  for (const [key, value] of Object.entries(vars)) {
    const masked = value.length > 8 
      ? value.substring(0, 4) + '•'.repeat(value.length - 8) + value.substring(value.length - 4)
      : '••••••••';
    console.log(`  ${key.padEnd(35)} ${masked}`);
  }
  
  console.log('─'.repeat(60));
  console.log(`\n  Total: ${Object.keys(vars).length} variable(s)\n`);
}

async function getCommand(password, key) {
  if (!key) {
    console.error('❌ Usage: node scripts/secrets-manager.js get <NOM_VARIABLE>');
    process.exit(1);
  }
  
  const vars = await loadEnv(password);
  
  if (vars[key]) {
    console.log(`\n${key}=${vars[key]}\n`);
  } else {
    console.error(`❌ Variable "${key}" introuvable`);
    process.exit(1);
  }
}

async function setCommand(password, key, value) {
  if (!key || !value) {
    console.error('❌ Usage: node scripts/secrets-manager.js set <NOM_VARIABLE> <VALEUR>');
    process.exit(1);
  }
  
  const vars = await loadEnv(password);
  vars[key] = value;
  saveEnv(vars, password);
  
  console.log(`✅ Variable "${key}" définie avec succès`);
}

async function deleteCommand(password, key) {
  if (!key) {
    console.error('❌ Usage: node scripts/secrets-manager.js delete <NOM_VARIABLE>');
    process.exit(1);
  }
  
  const vars = await loadEnv(password);
  
  if (!vars[key]) {
    console.error(`❌ Variable "${key}" introuvable`);
    process.exit(1);
  }
  
  delete vars[key];
  saveEnv(vars, password);
  
  console.log(`✅ Variable "${key}" supprimée avec succès`);
}

async function rotateCommand(oldPassword) {
  const vars = await loadEnv(oldPassword);
  
  const newPassword = await promptPassword('Nouveau mot de passe: ');
  if (newPassword.length < 8) {
    console.error('❌ Le mot de passe doit contenir au moins 8 caractères');
    process.exit(1);
  }
  
  const confirm = await promptPassword('Confirmez le nouveau mot de passe: ');
  if (newPassword !== confirm) {
    console.error('❌ Les mots de passe ne correspondent pas');
    process.exit(1);
  }
  
  saveEnv(vars, newPassword);
  
  console.log('✅ Mot de passe changé avec succès');
  console.log('⚠️  Conservez le nouveau mot de passe en lieu sûr');
}

async function exportCommand(password) {
  const vars = await loadEnv(password);
  
  console.log('\n📤 Export des variables pour déploiement:\n');
  console.log('─'.repeat(60));
  console.log('# Copiez ces lignes dans votre environnement de déploiement\n');
  
  for (const [key, value] of Object.entries(vars)) {
    console.log(`export ${key}="${value}"`);
  }
  
  console.log('─'.repeat(60));
  console.log('\n⚠️  Attention: Ces variables contiennent des secrets sensibles\n');
}

async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     🔐 SecureRetail Ops - Gestionnaire de Secrets         ║
╚════════════════════════════════════════════════════════════╝

Usage: node scripts/secrets-manager.js <commande> [options]

Commandes:
  list                          Liste toutes les variables
  get <NOM>                     Affiche une variable
  set <NOM> <VALEUR>            Définit une variable
  delete <NOM>                  Supprime une variable
  rotate                        Change le mot de passe
  export                        Exporte pour déploiement

Exemples:
  node scripts/secrets-manager.js list
  node scripts/secrets-manager.js set API_KEY abc123
  node scripts/secrets-manager.js get API_KEY
`);
    process.exit(0);
  }
  
  const password = await promptPassword();
  
  switch (command) {
    case 'list':
      await listCommand(password);
      break;
    case 'get':
      await getCommand(password, process.argv[3]);
      break;
    case 'set':
      await setCommand(password, process.argv[3], process.argv[4]);
      break;
    case 'delete':
      await deleteCommand(password, process.argv[3]);
      break;
    case 'rotate':
      await rotateCommand(password);
      break;
    case 'export':
      await exportCommand(password);
      break;
    default:
      console.error(`❌ Commande inconnue: ${command}`);
      process.exit(1);
  }
}

main();
