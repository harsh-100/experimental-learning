# Deployment — serve frontend and backend from a single server

This repository supports deploying both the frontend and backend on a single server. The backend will serve the frontend static files if a build exists at `frontend/dist`.

### Steps (recommended)

1. Build frontend

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist`.

2. Copy/build to server

Copy the repository to the server or build on the server. Ensure Node.js is installed.

3. Configure environment

Create a `.env` file in `backend/` with at least the `BASE_URL` value — the public URL clients will use (no trailing slash):

```
BASE_URL=https://your-domain.com
PORT=3000
```

If you want to use relative paths (for example, serving from the same domain without hardcoding), you can omit `BASE_URL` and the backend will compute the base URL from the incoming request. But setting `BASE_URL` ensures QR images and returned `shortUrl` values use the canonical public URL.

4. Install backend dependencies and start

```bash
cd backend
npm install
NODE_ENV=production node index.js
```

(Use PM2, systemd, or another process manager for production.)

5. Verify

- Visit `https://your-domain.com` and the frontend should load.
- Shorten a URL and verify the `shortUrl` points to `https://your-domain.com/<code>`.
- Scanning or visiting that short URL should redirect to the original URL.

### Notes & Tips

- If you deploy behind a reverse proxy (nginx), ensure proxy passes `Host` and protocol (use `proxy_set_header Host $host;` and `proxy_set_header X-Forwarded-Proto $scheme;`). The backend uses `BASE_URL` when provided, otherwise it builds URLs from request origin.

- If you do not set `BASE_URL`, the backend uses the request host/protocol to construct `shortUrl` which works behind properly configured proxies.

- If `sharp` fails to install on your server (requires build toolchain), you can remove it from `backend/package.json` and the backend will still return PNG from `qrcode`. For JPEG support you will need conversion; otherwise, the frontend can accept PNG.

- For TLS, terminate at the reverse proxy (nginx/Caddy) and run the backend on localhost:3000.

---

If you want, I can generate a sample `nginx` config and a `systemd` unit file for running the backend as a service. Let me know your target hosting (DigitalOcean droplet, VPS, container, etc.).

---

## Option 1 — Single Docker image with Nginx reverse proxy (Fly.io / Docker)

This repository includes an example `Dockerfile` and `nginx.conf` to build a single image that serves the React build with Nginx and proxies `/api` to the Node backend (running on internal port 4000).

Quick steps:

1. Build and test locally with Docker:

```bash
docker build -t link-short-qr .
docker run -p 8080:80 --env BASE_URL=http://localhost:8080 link-short-qr
```

2. Visit `http://localhost:8080` to test the full stack.

3. Deploy to Fly (example):

```bash
# install flyctl, login, create app
flyctl launch --dockerfile Dockerfile
flyctl deploy
```

Notes:
- The Dockerfile builds frontend and backend, installs node in the final image, copies the Nginx config, and starts both Node and Nginx. This is convenient for simple deployments like Fly but may be split into separate containers in production-grade setups.
- The example `fly.toml` is included for reference — set `app` to your Fly app name before deploying.
- The backend default port in this repo is 4000; the Nginx config proxies `/api/` to `127.0.0.1:4000`.

If you want, I can:
- Create a `systemd` service file instead of running Node in the background in the container (more robust).
- Split the frontend and backend into separate containers and orchestrate them with Docker Compose.
- Provide an automated GitHub Actions workflow that builds the Docker image and pushes to a registry, then deploys to Fly.

