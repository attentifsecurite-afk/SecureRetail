#!/usr/bin/env node

/**
 * Script de chiffrement du fichier .env
 * Utilisation: node scripts/encrypt-env.js [mot-de-passe]
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

function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Entrez le mot de passe de chiffrement: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  try {
    // Vérifier que le fichier .env existe
    if (!fs.existsSync(envPath)) {
      console.error('❌ Erreur: Le fichier .env n\'existe pas');
      process.exit(1);
    }
    
    // Lire le contenu du fichier .env
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Obtenir le mot de passe
    let password = process.argv[2];
    if (!password) {
      password = await promptPassword();
    }
    
    if (!password || password.length < 8) {
      console.error('❌ Erreur: Le mot de passe doit contenir au moins 8 caractères');
      process.exit(1);
    }
    
    // Chiffrer le contenu
    const encrypted = encrypt(envContent, password);
    
    // Écrire le fichier chiffré
    fs.writeFileSync(encryptedPath, encrypted);
    
    console.log('✅ Fichier .env chiffré avec succès');
    console.log(`📁 Fichier créé: ${encryptedPath}`);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - Conservez votre mot de passe en lieu sûr');
    console.log('   - Ne commitez JAMAIS le fichier .env');
    console.log('   - Le fichier .env.encrypted peut être commité');
    console.log('');
    console.log('📖 Pour déchiffrer:');
    console.log('   node scripts/decrypt-env.js');
    
  } catch (error) {
    console.error('❌ Erreur lors du chiffrement:', error.message);
    process.exit(1);
  }
}

main();
