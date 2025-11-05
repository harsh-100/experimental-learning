const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const sharp = require('sharp');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// Optional base URL used when deploying frontend + backend together.
// If set (for example: https://example.com) it will be used to build short URLs
// and must NOT have a trailing slash.
const BASE_URL = process.env.BASE_URL || null;

function getBaseUrl(req) {
  if (BASE_URL) return BASE_URL.replace(/\/$/, '');
  return `${req.protocol}://${req.get('host')}`;
}

// Small secure code generator (alphanumeric)
function generateCode(length = 7) {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Create an API router so all API routes live under /api
const apiRouter = express.Router();

// Example middleware that runs for all /api/* requests
apiRouter.use((req, res, next) => {
  // simple logging + attach a request id
  const rid = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
  req.requestId = rid;
  console.log(`[api:${rid}] ${req.method} ${req.originalUrl}`);
  // you could add auth, rate-limiting, instrumentation here
  next();
});

// Root
app.get('/', (req, res) => res.send('Link Short + QR Maker backend'));

// Health (under /api)
apiRouter.get('/health', (req, res) => res.json({ status: 'ok' }));

// Shorten URL: POST /api/shorten { url }
apiRouter.post('/shorten', async (req, res) => {
  const { url } = req.body || {};
  if (!url) return res.status(400).json({ error: 'url required' });

  // Basic validation
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'invalid url' });
  }

  try {
    // If URL already exists, return existing code
    const existing = await db.getByUrl(url);
    if (existing) {
      const shortUrl = `${getBaseUrl(req)}/${existing.code}`;
      return res.json({ shortUrl, code: existing.code, originalUrl: existing.original_url });
    }

    // Generate a short unique code
    let code;
    let tries = 0;
    do {
      code = generateCode(7);
      const collision = await db.getByCode(code);
      if (!collision) break;
      tries++;
    } while (tries < 5);

  await db.createLink(code, url);
  const shortUrl = `${getBaseUrl(req)}/${code}`;
  res.json({ shortUrl, code, originalUrl: url });
  } catch (err) {
    console.error('shorten error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// Redirect by code (public short URLs)
app.get('/:code', async (req, res) => {
  const { code } = req.params;
  try {
    const row = await db.getByCode(code);
    if (!row) return res.status(404).send('Not found');
    console.log('redirecting to', row.original_url);
    // redirect to original url
    return res.redirect(302, row.original_url);
  } catch (err) {
    console.error('redirect error', err);
    res.status(500).send('Internal error');
  }
});

// Generate QR: either pass ?url=... or use code parameter to generate QR for short URL
// Example: GET /api/qr?url=https://example.com&size=300&format=png
// Example: GET /api/qr/code/abcd123?size=300&format=jpeg
apiRouter.get('/qr', async (req, res) => {

  console.log("Generating QR code for URL");
  const { url, size = 300, format = 'png' } = req.query;
  if (!url) return res.status(400).json({ error: 'url query param required' });

  const sizeInt = parseInt(size, 10) || 300;

  try {
    const pngBuffer = await qrcode.toBuffer(String(url), { type: 'png', width: sizeInt });
    if (format === 'jpeg' || format === 'jpg') {
      const jpeg = await sharp(pngBuffer).jpeg().toBuffer();
      res.set('Content-Type', 'image/jpeg');
      return res.send(jpeg);
    }
    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (err) {
    console.error('qr generation error', err);
    res.status(500).json({ error: 'failed to generate qr' });
  }
});

apiRouter.get('/qr/code/:code', async (req, res) => {
  const { code } = req.params;
  const { size = 300, format = 'png' } = req.query;
  try {
    const row = await db.getByCode(code);
    if (!row) return res.status(404).json({ error: 'code not found' });
    const shortUrl = `${getBaseUrl(req)}/${code}`;
    const sizeInt = parseInt(size, 10) || 300;
    const pngBuffer = await qrcode.toBuffer(shortUrl, { type: 'png', width: sizeInt });
    if (format === 'jpeg' || format === 'jpg') {
      const jpeg = await sharp(pngBuffer).jpeg().toBuffer();
      res.set('Content-Type', 'image/jpeg');
      return res.send(jpeg);
    }
    res.set('Content-Type', 'image/png');
    res.send(pngBuffer);
  } catch (err) {
    console.error('qr by code error', err);
    res.status(500).json({ error: 'failed to generate qr' });
  }
});

// Mount API router under /api
app.use('/api', apiRouter);

const PORT = process.env.PORT || 3000;
// If frontend build exists, serve it (so backend can host both API + frontend on same server)
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // Serve SPA index.html for unknown routes (after API routes)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
