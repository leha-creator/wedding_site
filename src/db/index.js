/**
 * SQLite database initialization (sql.js — pure JS, no native compilation).
 * Creates data directory if needed, loads/saves DB file, runs schema.
 */

const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const { createSchema } = require('./schema');

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const log = {
  debug: (msg, data) => {
    if (['debug'].includes(LOG_LEVEL)) {
      console.log('[db]', msg, data !== undefined ? data : '');
    }
  },
  error: (msg, err) => {
    console.error('[db] ERROR', msg, err?.message || err);
  },
};

let db = null;
let SQL = null;

function getDbPath() {
  const dbPath = process.env.DB_PATH || './data/submissions.db';
  const resolved = path.isAbsolute(dbPath) ? dbPath : path.join(process.cwd(), dbPath);
  return resolved;
}

function ensureDataDir(dbPath) {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    log.debug('Created data directory', { dir });
  }
}

async function initDb() {
  if (db) return db;

  const dbPath = getDbPath();
  log.debug('Initializing database', { dbPath });

  try {
    ensureDataDir(dbPath);
    SQL = await initSqlJs();

    let data = null;
    if (fs.existsSync(dbPath)) {
      data = fs.readFileSync(dbPath);
    }
    db = data ? new SQL.Database(data) : new SQL.Database();
    createSchema(db);
    log.debug('Schema created');
  } catch (err) {
    log.error('Failed to init database', err);
    throw err;
  }

  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.');
  }
  return db;
}

function saveDb() {
  if (!db) return;
  try {
    const dbPath = getDbPath();
    ensureDataDir(dbPath);
    const data = db.export();
    fs.writeFileSync(dbPath, Buffer.from(data));
    log.debug('Database saved');
  } catch (err) {
    log.error('Failed to save database', err);
    throw err;
  }
}

function closeDb() {
  if (db) {
    try {
      saveDb();
      db.close();
      log.debug('Database closed');
    } catch (err) {
      log.error('Failed to close database', err);
    }
    db = null;
  }
}

module.exports = {
  initDb,
  getDb,
  saveDb,
  closeDb,
};
