#!/usr/bin/env node

/**
 * Générateur de mot de passe fort pour le chiffrement des secrets
 * Utilisation: node scripts/generate-password.js [longueur]
 */

const crypto = require('crypto');

function generatePassword(length = 32) {
  const chars = {
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
  };
  
  const allChars = Object.values(chars).join('');
  
  // S'assurer qu'au moins un caractère de chaque type
  let password = '';
  password += chars.lowercase[crypto.randomInt(chars.lowercase.length)];
  password += chars.uppercase[crypto.randomInt(chars.uppercase.length)];
  password += chars.numbers[crypto.randomInt(chars.numbers.length)];
  password += chars.symbols[crypto.randomInt(chars.symbols.length)];
  
  // Remplir le reste
  for (let i = password.length; i < length; i++) {
    password += allChars[crypto.randomInt(allChars.length)];
  }
  
  // Mélanger
  password = password.split('').sort(() => crypto.randomInt(3) - 1).join('');
  
  return password;
}

function generatePassphrase(wordCount = 5) {
  const words = [
    'secure', 'retail', 'guard', 'shield', 'protect',
    'cipher', 'vault', 'lock', 'key', 'safe',
    'cloud', 'storm', 'fire', 'ice', 'rock',
    'tiger', 'eagle', 'wolf', 'bear', 'lion',
    'alpha', 'beta', 'gamma', 'delta', 'omega',
    'quantum', 'nexus', 'prime', 'core', 'edge'
  ];
  
  const passphrase = [];
  for (let i = 0; i < wordCount; i++) {
    const word = words[crypto.randomInt(words.length)];
    // Capitaliser aléatoirement
    if (crypto.randomInt(2) === 0) {
      passphrase.push(word.charAt(0).toUpperCase() + word.slice(1));
    } else {
      passphrase.push(word);
    }
  }
  
  // Ajouter un nombre et un symbole
  passphrase.push(crypto.randomInt(100).toString());
  passphrase.push(['!', '@', '#', '$', '%'][crypto.randomInt(5)]);
  
  return passphrase.join('-');
}

function main() {
  const length = parseInt(process.argv[2]) || 32;
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     🔐 Générateur de mot de passe sécurisé                ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  console.log('📝 Mot de passe aléatoire (complexe):\n');
  console.log(`   ${generatePassword(length)}\n`);
  
  console.log('📝 Phrase de passe (mémorable):\n');
  console.log(`   ${generatePassphrase()}\n`);
  
  console.log('💡 Conseils:\n');
  console.log('   - Utilisez un gestionnaire de mots de passe');
  console.log('   - Minimum 16 caractères pour une sécurité optimale');
  console.log('   - Ne réutilisez jamais le même mot de passe');
  console.log('   - Changez régulièrement (tous les 90 jours)\n');
  
  console.log('📚 Stockage recommandé:\n');
  console.log('   - 1Password: https://1password.com');
  console.log('   - Bitwarden: https://bitwarden.com');
  console.log('   - KeePass: https://keepass.info\n');
}

main();
