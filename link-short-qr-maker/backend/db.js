const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const DB_PATH = path.join(dataDir, 'links.db');
const db = new sqlite3.Database(DB_PATH);

// Initialize table
db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS links (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE NOT NULL,
      original_url TEXT UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`
  );
});

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

module.exports = {
  async getByCode(code) {
    return get('SELECT * FROM links WHERE code = ?', [code]);
  },
  async getByUrl(url) {
    return get('SELECT * FROM links WHERE original_url = ?', [url]);
  },
  async createLink(code, url) {
    return run('INSERT INTO links (code, original_url) VALUES (?, ?)', [code, url]);
  },
};
