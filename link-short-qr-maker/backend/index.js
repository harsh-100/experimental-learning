const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode');
const sharp = require('sharp');
const crypto = require('crypto');

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

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Root
app.get('/', (req, res) => res.send('Link Short + QR Maker backend'));

// Shorten URL: POST /api/shorten { url }
app.post('/api/shorten', async (req, res) => {
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
    console.log('existing', existing);
    if (existing) {
      const shortUrl = `${req.protocol}://${req.get('host')}/${existing.code}`;
        console.log('shortUrl', shortUrl);
        console.log('existing.code', existing.code);
        console.log('existing.original_url', existing.original_url);
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
    const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
    res.json({ shortUrl, code, originalUrl: url });
  } catch (err) {
    console.error('shorten error', err);
    res.status(500).json({ error: 'internal error' });
  }
});

// Redirect by code
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
app.get('/api/qr', async (req, res) => {
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

app.get('/api/qr/code/:code', async (req, res) => {
  const { code } = req.params;
  const { size = 300, format = 'png' } = req.query;
  try {
    const row = await db.getByCode(code);
    if (!row) return res.status(404).json({ error: 'code not found' });
    const shortUrl = `${req.protocol}://${req.get('host')}/${code}`;
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
