/**
 * Réinitialise le mot de passe d'un utilisateur par email.
 * Usage: NEW_PASSWORD="TonNouveauMotDePasse" node scripts/reset-password.js [email]
 * Si pas de NEW_PASSWORD, utilise "MotDePasse123" par défaut.
 */

const fs = require('fs');
const path = require('path');

// Charge .env.local puis .env
const root = path.resolve(__dirname, '..');
for (const file of ['.env.local', '.env']) {
  const p = path.join(root, file);
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf8');
    for (const line of content.split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) {
        const key = m[1].trim();
        const val = m[2].trim().replace(/^["']|["']$/g, '');
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');

  const email = process.argv[2] || 'bonheurthaddy0@gmail.com';
  const newPassword = process.env.NEW_PASSWORD || 'MotDePasse123';

  const prisma = new PrismaClient();

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    console.error('Utilisateur non trouvé:', email);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  console.log('Mot de passe mis à jour pour', email);
  console.log('Tu peux te connecter avec ce mot de passe (pense à le changer après connexion).');

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
