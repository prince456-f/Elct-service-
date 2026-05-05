// src/database.js
// Gestion base de données SQLite avec better-sqlite3

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Crée le dossier data s'il n'existe pas
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'tl_elect.db'));

// Active les performances WAL
db.pragma('journal_mode = WAL');

// ===== CRÉATION DES TABLES =====
db.exec(`
  CREATE TABLE IF NOT EXISTS requests (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    phone       TEXT    NOT NULL,
    address     TEXT    NOT NULL,
    service     TEXT    NOT NULL,
    message     TEXT    DEFAULT '',
    status      TEXT    DEFAULT 'new',   -- 'new' | 'done'
    created_at  TEXT    DEFAULT (datetime('now', 'localtime'))
  );

  CREATE TABLE IF NOT EXISTS admin (
    id            INTEGER PRIMARY KEY,
    username      TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL
  );
`);

// ===== SEED ADMIN par défaut (si table vide) =====
// Mot de passe : tlelectadmin2024  (hashé en SHA-256 simple)
const crypto = require('crypto');

function hashPassword(pwd) {
  return crypto.createHash('sha256').update(pwd + 'tl_elect_salt_2024').digest('hex');
}

const adminExists = db.prepare('SELECT id FROM admin WHERE id = 1').get();
if (!adminExists) {
  db.prepare('INSERT INTO admin (id, username, password_hash) VALUES (1, ?, ?)').run(
    'admin',
    hashPassword('tlelectadmin2024')
  );
  console.log('✅ Admin créé — user: admin / pwd: tlelectadmin2024');
}

// ===== REQUÊTES PRÉPARÉES =====
const queries = {
  // Demandes
  getAllRequests: db.prepare(`
    SELECT * FROM requests ORDER BY
      CASE status WHEN 'new' THEN 0 ELSE 1 END,
      created_at DESC
  `),

  getRequestById: db.prepare('SELECT * FROM requests WHERE id = ?'),

  insertRequest: db.prepare(`
    INSERT INTO requests (name, phone, address, service, message)
    VALUES (@name, @phone, @address, @service, @message)
  `),

  updateStatus: db.prepare('UPDATE requests SET status = ? WHERE id = ?'),

  deleteRequest: db.prepare('DELETE FROM requests WHERE id = ?'),

  getStats: db.prepare(`
    SELECT
      COUNT(*)                                AS total,
      SUM(CASE WHEN status='new'  THEN 1 ELSE 0 END) AS new_count,
      SUM(CASE WHEN status='done' THEN 1 ELSE 0 END) AS done_count
    FROM requests
  `),

  // Admin
  getAdmin: db.prepare('SELECT * FROM admin WHERE username = ?'),
  updateAdminPassword: db.prepare('UPDATE admin SET password_hash = ? WHERE id = 1'),
};

module.exports = { db, queries, hashPassword };
