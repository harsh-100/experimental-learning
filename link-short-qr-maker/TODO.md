# TODO — Link Short + QR Maker

This file splits the project into small, actionable parts so we can implement and iterate in stages.

---

## Part 0 — Discovery & environment (short, ~1 day)
1. Read the existing `Readme.md` and confirm feature list (done).
2. Decide exact tech choices and minimal stack:
   - Frontend: React + Tailwind CSS
   - Backend: Node.js + Express
   - Storage: SQLite (or lowdb for prototype)
   - QR generation: `qrcode` (Node) or client-side canvas for downloads
3. Create development skeleton (folders, `.gitignore`, minimal package.json placeholders).

Acceptance criteria: short spec written and repo skeleton created.

---

## Part 1 — Backend core (API) (2–3 days)
- Tasks:
  - Initialize `backend/` with Express server.
  - Implement POST `/api/shorten` that accepts `{ url: string }` and returns `{ shortUrl, code }`.
  - Implement GET `/:code` to redirect to the original URL.
  - Implement minimal persistence (SQLite or file-based mapping).
  - Add simple validation for URLs.
- Edge cases:
  - Duplicate URLs -> return same short code.
  - Invalid URLs -> 400 response.
  - Collisions -> regenerate code.

Acceptance criteria: API endpoints work locally and return expected responses.

---

## Part 2 — QR generation & media (1–2 days)
- Tasks:
  - Provide ability to create two QR codes for each URL:
    1. QR for original URL
    2. QR for short URL
  - Support size parameter for QR generation.
  - Support download in PNG or JPEG.
  - Decide whether QR generation is server-side (Node) or client-side (browser). For quick iteration, do client-side using `qrcode.react` or canvas.

Acceptance criteria: QR codes render in UI and downloadable in both formats at requested sizes.

---

## Part 3 — Frontend UI (React + Tailwind) (2–3 days)
- Tasks:
  - Build a small UI with a form to input the URL.
  - Show short URL with "Copy" button.
  - Render both QR codes with size slider and download buttons.
  - Provide minimal responsive layout.

Acceptance criteria: Users can shorten a URL and download both QR codes.

---

## Part 4 — Tests, CI, and local dev DX (1–2 days)
- Tasks:
  - Add basic unit tests for the backend (Jest or Mocha).
  - Add one or two React component tests (React Testing Library).
  - Add GitHub Actions workflow to run lint/tests on PRs.

Acceptance criteria: CI runs tests and reports green on the main branch.

---

## Part 5 — Polish, docs & deploy (1–2 days)
- Tasks:
  - Improve `Readme.md` with setup and run instructions.
  - Document API endpoints and example requests.
  - Prepare deployment instructions for hosting both parts (combined or separate).

Acceptance criteria: Clear README and at least one documented deployment path.

---

## Minimal iteration plan (sprints)
- Sprint A: Part 0 + Part 1 minimal implementation (shorten + redirect) — aim for MVP.
- Sprint B: Part 2 + Part 3 (QR features + UI).
- Sprint C: Tests, CI, docs, and deploy.

---

## Notes / Decisions to make
- Persistent store: SQLite for a small, real store; lowdb or an in-memory map for fastest prototype.
- QR generation: server-side gives consistent file generation (PNG/JPEG), client-side is faster to iterate.

---

When you confirm this split, I can scaffold the rest (backend dependencies, express server, or a React + Tailwind starter). Which part would you like me to begin next?