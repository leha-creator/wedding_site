/**
 * CRUD service for form submissions.
 * Uses SQLite via src/db (sql.js).
 */

const { getDb, saveDb } = require('../db');

const LOG_LEVEL = (process.env.LOG_LEVEL || 'info').toLowerCase();
const log = {
  info: (msg, data) => {
    if (['debug', 'info'].includes(LOG_LEVEL)) {
      console.log('[submissions]', msg, data !== undefined ? data : '');
    }
  },
  warn: (msg, data) => {
    if (['debug', 'info', 'warn'].includes(LOG_LEVEL)) {
      console.warn('[submissions] WARN', msg, data !== undefined ? data : '');
    }
  },
  error: (msg, err) => {
    console.error('[submissions] ERROR', msg, err?.message || err);
  },
};

function toIso() {
  return new Date().toISOString();
}

function rowToSubmission(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    guests: JSON.parse(row.guests || '[]'),
    transport: Boolean(row.transport),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function createOrUpdate(userId, { guests, transport }) {
  log.info('createOrUpdate', { userId, guestCount: guests?.length });

  const db = getDb();
  const now = toIso();
  const guestsJson = JSON.stringify(Array.isArray(guests) ? guests : []);
  const transportInt = transport ? 1 : 0;

  try {
    const stmt = db.prepare('SELECT id FROM submissions WHERE user_id = ?');
    stmt.bind([userId]);
    const existing = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (existing) {
      db.run(
        `UPDATE submissions SET guests = ?, transport = ?, updated_at = ? WHERE user_id = ?`,
        [guestsJson, transportInt, now, userId]
      );
      log.info('Updated submission', { userId });
      saveDb();
      return { created: false, userId };
    } else {
      db.run(
        `INSERT INTO submissions (user_id, guests, transport, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, guestsJson, transportInt, now, now]
      );
      log.info('Created submission', { userId });
      saveDb();
      return { created: true, userId };
    }
  } catch (err) {
    log.error('createOrUpdate failed', err);
    throw err;
  }
}

function getByUserId(userId) {
  log.info('getByUserId', { userId });

  const db = getDb();
  try {
    const stmt = db.prepare(
      'SELECT id, user_id, guests, transport, created_at, updated_at FROM submissions WHERE user_id = ?'
    );
    stmt.bind([userId]);
    const row = stmt.step() ? stmt.getAsObject() : null;
    stmt.free();

    if (!row) return null;
    return rowToSubmission(row);
  } catch (err) {
    log.error('getByUserId failed', err);
    throw err;
  }
}

const ALLOWED_SORT = ['created_at', 'updated_at', 'user_id'];
const ALLOWED_ORDER = ['asc', 'desc'];

function getAll({ limit = 50, offset = 0, sortBy = 'updated_at', order = 'desc', search = '' } = {}) {
  log.info('getAll', { limit, offset, sortBy, order, search: search ? '...' : '' });

  const sort = ALLOWED_SORT.includes(sortBy) ? sortBy : 'updated_at';
  const ord = ALLOWED_ORDER.includes(order.toLowerCase()) ? order.toUpperCase() : 'DESC';

  const db = getDb();

  try {
    let where = '';
    const params = [];

    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      where = ' WHERE user_id LIKE ? OR guests LIKE ?';
      params.push(q, q);
    }

    const countSql = `SELECT COUNT(*) as total FROM submissions${where}`;
    const countStmt = db.prepare(countSql);
    countStmt.bind(params);
    const total = countStmt.step() ? countStmt.getAsObject().total : 0;
    countStmt.free();

    const sql = `SELECT id, user_id, guests, transport, created_at, updated_at
                 FROM submissions${where}
                 ORDER BY ${sort} ${ord}
                 LIMIT ? OFFSET ?`;
    const allParams = [...params, limit, offset];
    const stmt = db.prepare(sql);
    stmt.bind(allParams);
    const items = [];
    while (stmt.step()) {
      items.push(rowToSubmission(stmt.getAsObject()));
    }
    stmt.free();

    return { items, total };
  } catch (err) {
    log.error('getAll failed', err);
    throw err;
  }
}

function deleteByUserId(userId) {
  log.info('deleteByUserId', { userId });

  const db = getDb();
  try {
    const existing = getByUserId(userId);
    if (!existing) {
      log.warn('No submission to delete', { userId });
      return false;
    }
    db.run('DELETE FROM submissions WHERE user_id = ?', [userId]);
    log.info('Deleted submission', { userId });
    saveDb();
    return true;
  } catch (err) {
    log.error('deleteByUserId failed', err);
    throw err;
  }
}

module.exports = {
  createOrUpdate,
  getByUserId,
  getAll,
  deleteByUserId,
};
