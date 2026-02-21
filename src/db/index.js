/**
 * SQLite database initialization.
 * Creates data directory if needed, opens DB, runs schema.
 */

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
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

function initDb() {
  if (db) return db;

  const dbPath = getDbPath();
  log.debug('Initializing database', { dbPath });

  try {
    ensureDataDir(dbPath);
    db = new Database(dbPath);
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
    return initDb();
  }
  return db;
}

function closeDb() {
  if (db) {
    try {
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
  closeDb,
};
