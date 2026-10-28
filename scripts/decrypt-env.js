#!/usr/bin/env node

/**
 * Script de déchiffrement du fichier .env.encrypted
 * Utilisation: node scripts/decrypt-env.js [mot-de-passe]
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

function promptPassword() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    rl.question('Entrez le mot de passe de déchiffrement: ', (password) => {
      rl.close();
      resolve(password);
    });
  });
}

async function main() {
  try {
    // Vérifier que le fichier .env.encrypted existe
    if (!fs.existsSync(encryptedPath)) {
      console.error('❌ Erreur: Le fichier .env.encrypted n\'existe pas');
      console.log('');
      console.log('📖 Pour créer le fichier chiffré:');
      console.log('   node scripts/encrypt-env.js');
      process.exit(1);
    }
    
    // Vérifier si le fichier .env existe déjà
    if (fs.existsSync(envPath)) {
      console.log('⚠️  Le fichier .env existe déjà');
      console.log('');
      
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      const answer = await new Promise((resolve) => {
        rl.question('Voulez-vous le remplacer? (o/n): ', (ans) => {
          rl.close();
          resolve(ans.toLowerCase());
        });
      });
      
      if (answer !== 'o' && answer !== 'oui') {
        console.log('❌ Opération annulée');
        process.exit(0);
      }
    }
    
    // Lire le contenu chiffré
    const encryptedContent = fs.readFileSync(encryptedPath, 'utf8');
    
    // Obtenir le mot de passe
    let password = process.argv[2];
    if (!password) {
      password = await promptPassword();
    }
    
    if (!password) {
      console.error('❌ Erreur: Le mot de passe est requis');
      process.exit(1);
    }
    
    // Déchiffrer le contenu
    let decrypted;
    try {
      decrypted = decrypt(encryptedContent, password);
    } catch (error) {
      console.error('❌ Erreur: Mot de passe incorrect ou fichier corrompu');
      process.exit(1);
    }
    
    // Écrire le fichier .env
    fs.writeFileSync(envPath, decrypted);
    
    // Définir les permissions restrictives (lecture/écriture uniquement pour le propriétaire)
    fs.chmodSync(envPath, 0o600);
    
    console.log('✅ Fichier .env déchiffré avec succès');
    console.log(`📁 Fichier créé: ${envPath}`);
    console.log('');
    console.log('⚠️  IMPORTANT:');
    console.log('   - Le fichier .env ne doit JAMAIS être commité');
    console.log('   - Supprimez-le après utilisation en production');
    console.log('   - Permissions définies: 600 (lecture/écriture propriétaire uniquement)');
    
  } catch (error) {
    console.error('❌ Erreur lors du déchiffrement:', error.message);
    process.exit(1);
  }
}

main();
