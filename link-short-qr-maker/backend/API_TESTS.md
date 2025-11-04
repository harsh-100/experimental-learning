# API Test Data — Link Short + QR Maker

Location: `backend/`

Purpose: Quick reference and test data for the backend API. Use these curl examples to validate endpoints and confirm behavior locally (server default: http://localhost:4000).

Prerequisites
- Start the backend server:

```bash
cd backend
npm install    # if you haven't already
npm run start  # or `npm run dev` for nodemon
```

- Database file is created at `backend/data/links.db` automatically on first run.

Test endpoints

1) Health check
- Method: GET
- Path: `/health`
- Purpose: confirm server is running

Example:

```bash
curl http://localhost:4000/health
```

Expected response:

```json
{"status":"ok"}
```

2) Root
- Method: GET
- Path: `/`
- Purpose: human-readable root

Example:

```bash
curl http://localhost:4000/
```

Expected response: plain text greeting (e.g., "Link Short + QR Maker backend").

3) Shorten URL
- Method: POST
- Path: `/api/shorten`
- Body: JSON { "url": "<original-url>" }
- Purpose: create or return a short code for the provided URL. Returns the short URL and code.

Sample test data (use these URLs):
- https://example.com/long/path
- https://github.com/harsh-100
- https://www.mozilla.org/en-US/

Example (create new short URL):

```bash
curl -s -X POST http://localhost:4000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com/long/path"}' | jq
```

Expected response (200):

```json
{
  "shortUrl": "http://localhost:4000/Abc123X",
  "code": "Abc123X",
  "originalUrl": "https://example.com/long/path"
}
```

Notes:
- If the same URL is shortened again, the server returns the existing code (idempotent behavior).
- If the URL is invalid or missing, server returns 400 with `{ "error": "invalid url" }` or `{ "error": "url required" }`.

4) Redirect by code
- Method: GET
- Path: `/:code` (example: `/Abc123X`)
- Purpose: redirect to the original URL represented by the code.

Example (replace CODE with the actual code returned earlier):

```bash
curl -v http://localhost:4000/CODE
```

Expected behavior:
- Response is a 302 redirect (Location header points to original URL).
- If code not found => 404 Not Found.

5) Generate QR for arbitrary URL
- Method: GET
- Path: `/api/qr`
- Query params:
  - `url` (required): URL to encode
  - `size` (optional): integer pixel size (default 300)
  - `format` (optional): `png` (default) or `jpeg`/`jpg`
- Purpose: return QR image (PNG or JPEG) for any URL.

Example (PNG):

```bash
curl "http://localhost:4000/api/qr?url=https://example.com&size=300&format=png" --output qr.png
file qr.png   # on Linux/macOS to confirm file type
```

Example (JPEG):

```bash
curl "http://localhost:4000/api/qr?url=https://example.com&size=400&format=jpeg" --output qr.jpg
```

Expected:
- `qr.png` (image/png) or `qr.jpg` (image/jpeg) created; open it to verify it encodes the provided URL.

6) Generate QR for short code (short URL)
- Method: GET
- Path: `/api/qr/code/:code`
- Query params: `size`, `format` (same meanings as above)
- Purpose: return QR image encoding the short URL (for scanning to reach the short URL).

Example (PNG):

```bash
curl "http://localhost:4000/api/qr/code/CODE?size=300&format=png" --output short-qr.png
```

Example (JPEG):

```bash
curl "http://localhost:4000/api/qr/code/CODE?size=500&format=jpeg" --output short-qr.jpg
```

Expected:
- Image containing QR that points to `http://localhost:4000/CODE`.

Edge cases and error cases to test
- Missing URL in `/api/shorten` => 400 `{ "error": "url required" }`
- Invalid URL in `/api/shorten` => 400 `{ "error": "invalid url" }`
- Non-existing code for `/CODE` redirect => 404 Not Found
- Non-existing code for `/api/qr/code/:code` => 404 `{ "error": "code not found" }`
- Invalid `format` parameter: server currently supports `png` and `jpeg/jpg`; others will default to `png` or return png image.

Testing duplicate URL behavior
1. Shorten the same URL twice and confirm the returned `code` is identical:

```bash
curl -s -X POST http://localhost:4000/api/shorten -H "Content-Type: application/json" -d '{"url":"https://example.com/long/path"}' | jq
curl -s -X POST http://localhost:4000/api/shorten -H "Content-Type: application/json" -d '{"url":"https://example.com/long/path"}' | jq
```

Expected: both responses have same `code` and `shortUrl`.

Testing QR download + manual verification
1. After saving the image file (`qr.png`), open it with an image viewer or use a smartphone QR scanner to ensure it encodes the expected URL.

Notes for maintainers / devs
- DB path: `backend/data/links.db` (SQLite). You can inspect with `sqlite3 backend/data/links.db "SELECT * FROM links;"`.
- If sharp fails to build on `npm install`, remove `sharp` from `package.json` and the server will still return PNG from `qrcode` (change JPEG conversion accordingly). I can provide an alternate code path if you prefer no native deps.

If you want, I can also create a Postman collection or a small shell script to run these tests automatically.

---
Created by the project scaffolding script. If you find any mismatches between expected responses and actual behavior, paste the server logs and I will triage.
