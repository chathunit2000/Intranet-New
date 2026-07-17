/**
 * Imports a raw .sql dump (tables + data) into the project's MySQL database.
 *
 * This is a Node.js port of the Python import script — same logic (strip
 * comments, split on ';', skip CREATE DATABASE/USE, ignore "already exists"
 * and "Duplicate entry" errors, print a summary + row counts) but reuses
 * this project's own DB_HOST/DB_USER/DB_PASSWORD/DB_NAME from `.env`
 * instead of hardcoded credentials, so you don't maintain two configs.
 *
 * Usage:
 *   npm run db:import
 *   npm run db:import -- --file=./db/UCFE_Template_mysql.sql
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// ── CONFIG ────────────────────────────────────────────────────────────────
const DATABASE = process.env.DB_NAME || 'intranet';

// File path: --file=... flag > SQL_IMPORT_FILE env var > default location
const fileArg = process.argv.find((arg) => arg.startsWith('--file='));
const SQL_FILE = path.resolve(
  fileArg
    ? fileArg.replace('--file=', '')
    : process.env.SQL_IMPORT_FILE || path.join(__dirname, 'UCFE_Template_mysql.sql')
);

// Tables to report row counts for once the import finishes.
// Edit this list to match the tables in your .sql dump.
const TABLES_TO_VERIFY = [
  'tblLogin2',
  'tblAttenID',
  'userRole',
  'systemRole',
  'tblrole',
  'tblsystem',
  'tbluser',
  'tblcredential',
  'userSystem',
];

async function main() {
  console.log('Connecting to MySQL...');
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'intranet_app',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: false,
  });
  console.log(`Connected to MySQL server at ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);

  // Make sure the target database exists, then switch to it
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DATABASE}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await connection.query(`USE \`${DATABASE}\``);

  // ── READ SQL FILE ─────────────────────────────────────────────────────
  console.log(`\nReading SQL file: ${SQL_FILE}`);
  if (!fs.existsSync(SQL_FILE)) {
    console.error(`Could not find file: ${SQL_FILE}`);
    console.error('Place your .sql dump at that path, or run with --file=/path/to/your.sql');
    await connection.end();
    process.exit(1);
  }

  const raw = fs.readFileSync(SQL_FILE);
  let sqlText;
  if (raw[0] === 0xff && raw[1] === 0xfe) {
    sqlText = raw.toString('utf16le');
  } else if (raw[0] === 0xfe && raw[1] === 0xff) {
    sqlText = raw.swap16().toString('utf16le'); // big-endian UTF-16 fallback
  } else {
    sqlText = raw.toString('utf8');
  }
  console.log('File read successfully');

  // ── STRIP COMMENT LINES & SPLIT INTO STATEMENTS BY ';' ──────────────────
  const cleanedSql = sqlText
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');

  const statements = cleanedSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  console.log(`Found ${statements.length} SQL statements to execute`);
  console.log('\nExecuting statements...\n');

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i += 1) {
    const stmt = statements[i];

    if (/^\s*CREATE DATABASE/i.test(stmt) || /^\s*USE\s+/i.test(stmt)) {
      skipCount += 1;
      continue;
    }

    try {
      await connection.query(stmt);
      successCount += 1;
      if (successCount % 500 === 0) {
        console.log(`  ${successCount} statements executed so far...`);
      }
    } catch (err) {
      const message = err.message || String(err);

      if (message.includes('already exists') || message.includes('Duplicate entry')) {
        skipCount += 1;
        continue;
      }

      console.log(`  Statement ${i + 1} error: ${message.slice(0, 150)}`);
      console.log(`     -> ${stmt.slice(0, 120)}...`);
      errorCount += 1;
    }
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Done — ${successCount} statements executed`);
  console.log(`Skipped — ${skipCount} statements (duplicates / USE / CREATE DATABASE)`);
  console.log(`Errors  — ${errorCount} statements`);
  console.log('='.repeat(50));

  // ── VERIFY ROW COUNTS ───────────────────────────────────────────────────
  console.log(`\nVerifying row counts in each table (database: ${DATABASE}):\n`);

  for (const table of TABLES_TO_VERIFY) {
    try {
      const [rows] = await connection.query(`SELECT COUNT(*) AS count FROM \`${table}\``);
      console.log(`  ${table.padEnd(20)} -> ${String(rows[0].count).padStart(6)} rows`);
    } catch (err) {
      console.log(`  ${table.padEnd(20)} -> Error: ${err.message}`);
    }
  }

  await connection.end();
  console.log('\nConnection closed. All done!');
}

main().catch((err) => {
  console.error('Import failed:', err.message);
  process.exit(1);
});
