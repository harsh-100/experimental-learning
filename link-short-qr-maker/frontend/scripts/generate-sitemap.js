const fs = require('fs');
const path = require('path');

// Config
const DIST_DIR = path.join(__dirname, '..', 'dist');
const ROUTES_MANIFEST = path.join(__dirname, '..', 'routes.json');
const BACKEND_DB = path.join(__dirname, '..', '..', 'backend', 'data', 'links.db');
// Try to load environment variables from .env files so postbuild scripts can pick up BASE_URL
function loadLocalEnv() {
  const candidates = [
    path.join(__dirname, '..', '.env'),
    path.join(__dirname, '..', '.env.production'),
    path.join(__dirname, '..', '..', '.env'),
    path.join(__dirname, '..', '..', '.env.production'),
  ];

  // Try dotenv if available
  try {
    const dotenv = require('dotenv');
    for (const p of candidates) {
      if (fs.existsSync(p)) {
        dotenv.config({ path: p });
      }
    }
    return;
  } catch (err) {
    // dotenv not available; fall back to simple parser
  }

  for (const p of candidates) {
    if (!fs.existsSync(p)) continue;
    try {
      const raw = fs.readFileSync(p, 'utf8');
      for (const line of raw.split(/\r?\n/)) {
        const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
        if (!m) continue;
        let [, key, val] = m;
        // strip optional surrounding quotes
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
    } catch (e) {
      // ignore parse errors
    }
  }
}

loadLocalEnv();

const BASE_URL = process.env.BASE_URL || process.env.VITE_BASE_URL || process.env.VITE_API_BASE || 'https://example.com';

function formatDate(d) {
  return d.toISOString();
}

async function readRoutes() {
  const raw = fs.readFileSync(ROUTES_MANIFEST, 'utf8');
  return JSON.parse(raw);
}

async function readDbLinks() {
  const dbPath = BACKEND_DB;
  if (!fs.existsSync(dbPath)) return [];

  // sqlite3 is optional here. If not installed in this package context, skip dynamic links.
  let sqlite3;
  try {
    sqlite3 = require('sqlite3').verbose();
  } catch (err) {
    console.warn('sqlite3 not available in this environment, skipping dynamic short-links in sitemap.');
    return [];
  }

  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
    });

    db.all('SELECT code, created_at FROM links ORDER BY created_at DESC LIMIT 1000', (err, rows) => {
      if (err) {
        db.close();
        return reject(err);
      }
      db.close();
      resolve(rows || []);
    });
  });
}

async function build() {
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  const routes = await readRoutes();
  const links = await readDbLinks();

  const now = new Date();
  const urlset = [];

  // Add static routes
  for (const r of routes) {
    urlset.push({
      loc: `${BASE_URL}${r.path}`,
      lastmod: formatDate(now),
      changefreq: r.changefreq || 'monthly',
      priority: r.priority == null ? 0.5 : r.priority,
    });
  }

  // Add dynamic short link pages
  for (const l of links) {
    const lastmod = l.created_at ? new Date(l.created_at) : now;
    urlset.push({
      loc: `${BASE_URL}/${l.code}`,
      lastmod: formatDate(lastmod),
      changefreq: 'monthly',
      priority: 0.4,
    });
  }

  // Build XML
  const header = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  const footer = '</urlset>\n';

  const body = urlset.map(u => {
    return '  <url>\n' +
      `    <loc>${u.loc}</loc>\n` +
      `    <lastmod>${u.lastmod}</lastmod>\n` +
      `    <changefreq>${u.changefreq}</changefreq>\n` +
      `    <priority>${u.priority}</priority>\n` +
      '  </url>\n';
  }).join('');

  const xml = header + body + footer;
  fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), xml, 'utf8');
  console.log('Wrote sitemap.xml with', urlset.length, 'entries to', DIST_DIR);
}

build().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
