/**
 * Importe un fichier SQL dans la base configurée via DATABASE_URL.
 * Usage: node prisma/import-sql.js [--drop-first] <chemin-vers-fichier.sql>
 *
 * --drop-first : supprime toutes les tables avant l'import (évite "Table already exists").
 * Charge .env.local puis .env (comme Next.js).
 */

const fs = require('fs');
const path = require('path');
const { createConnection } = require('mysql2/promise');

function loadEnv() {
  const root = path.resolve(__dirname, '..');
  for (const file of ['.env.local', '.env']) {
    const p = path.join(root, file);
    if (fs.existsSync(p)) {
      const content = fs.readFileSync(p, 'utf8');
      for (const line of content.split('\n')) {
        const m = line.match(/^DATABASE_URL=(.+)$/);
        if (m) {
          const val = m[1].trim().replace(/^["']|["']$/g, '');
          return val;
        }
      }
    }
  }
  return process.env.DATABASE_URL;
}

function parseDatabaseUrl(url) {
  if (!url || !url.startsWith('mysql://')) {
    throw new Error('DATABASE_URL manquante ou invalide (doit commencer par mysql://)');
  }
  const u = new URL(url);
  return {
    host: u.hostname,
    port: parseInt(u.port || '3306', 10),
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    database: u.pathname.slice(1),
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dropFirst = args.includes('--drop-first');
  const sqlPath = args.find((a) => !a.startsWith('--'));

  if (!sqlPath) {
    console.error('Usage: node prisma/import-sql.js [--drop-first] <chemin-vers-fichier.sql>');
    console.error('Exemple: node prisma/import-sql.js --drop-first /Users/mac/Downloads/u729893412_tictac.sql');
    process.exit(1);
  }

  const absPath = path.isAbsolute(sqlPath) ? sqlPath : path.resolve(process.cwd(), sqlPath);
  if (!fs.existsSync(absPath)) {
    console.error('Fichier introuvable:', absPath);
    process.exit(1);
  }

  const url = loadEnv();
  const config = parseDatabaseUrl(url);
  config.multipleStatements = true;

  console.log('Connexion à', config.host, 'base', config.database, '...');
  const conn = await createConnection(config);

  try {
    if (dropFirst) {
      const dropPath = path.join(__dirname, 'drop-all-tables.sql');
      const dropSql = fs.readFileSync(dropPath, 'utf8');
      console.log('Suppression des tables existantes...');
      await conn.query(dropSql);
      console.log('Tables supprimées.');
    }

    const sql = fs.readFileSync(absPath, 'utf8');
    console.log('Exécution du fichier SQL (' + (sql.length / 1024).toFixed(1) + ' Ko)...');
    await conn.query(sql);
    console.log('Import terminé avec succès.');
  } catch (err) {
    console.error('Erreur lors de l\'import:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

main();
