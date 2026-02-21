/**
 * SQLite schema for submissions table.
 * Run on DB init.
 */

const SQL = `
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  guests TEXT NOT NULL,
  transport INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_updated_at ON submissions(updated_at);
`;

function createSchema(db) {
  db.exec(SQL);
}

module.exports = { createSchema, SQL };
