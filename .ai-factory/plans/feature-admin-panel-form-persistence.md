# Implementation Plan: Admin Panel + Form Persistence

Branch: `feature/admin-panel-form-persistence`
Created: 2026-02-22

## Settings
- Testing: yes
- Logging: verbose
- Docs: yes

## Summary

Add admin dashboard for viewing/exporting form submissions, and implement user-specific form persistence (anonymous user ID in localStorage/cookie) with create/update/delete operations. One record per user; admin table shows latest version only.

## Commit Plan

- **Commit 1** (after tasks 1–3): `feat: add SQLite database, Docker config, submissions model`
- **Commit 2** (after tasks 4–5): `feat: CRUD API and user ID persistence for form`
- **Commit 3** (after tasks 6–7): `feat: form UX – restoration, delete, timestamps`
- **Commit 4** (after tasks 8–10): `feat: admin dashboard with auth, table, export`

## Tasks

### Phase 1: Database & Models

#### Task 1: Add SQLite database and submissions schema ✅
**Files:** `package.json`, `.env.example`, `src/db/schema.js` (new), `src/db/index.js` (new)

- Install `better-sqlite3` (sync API, no callbacks)
- Add to `.env.example`: `DB_PATH=./data/submissions.db`, `ADMIN_USER=`, `ADMIN_PASSWORD=`
- Use `DB_PATH` from env (default: `./data/submissions.db`); create `./data/` dir if missing
- Create `src/db/` with schema: table `submissions`:
  - `id` INTEGER PRIMARY KEY
  - `user_id` TEXT UNIQUE NOT NULL (UUID)
  - `guests` TEXT (JSON array)
  - `transport` INTEGER (0/1)
  - `created_at` TEXT ISO8601
  - `updated_at` TEXT ISO8601
- Add index on `user_id` for lookups
- Init DB and create table on server start
- **Logging:** Log DB init, schema creation, any migration steps at DEBUG; log errors at ERROR

#### Task 2: Configure Docker for SQLite persistence and native build ✅
**Files:** `Dockerfile`, `docker-compose.yml`

- **Dockerfile:** `better-sqlite3` is a native module. Either use `node:20-slim` (Debian, better native support) or add `python3 make g++` to Alpine for build. If staying on Alpine: add build deps in build stage or switch base image.
- **docker-compose.yml:** Add volume for SQLite file, e.g. `./data:/app/data`, and set `DB_PATH=/app/data/submissions.db` (or via env). Ensures DB survives container restarts.

#### Task 3: Create submissions service with CRUD ✅
**Files:** `src/services/submissions.js` (new)

- `createOrUpdate(userId, { guests, transport })` — upsert by user_id
- `getByUserId(userId)` — fetch one record
- `getAll({ limit, offset, sortBy, order, search })` — for admin, with server-side pagination, sorting (e.g. by `created_at`, `updated_at`, `user_id`), and search (guests JSON, user_id)
- `deleteByUserId(userId)` — remove user's record
- **Logging:** Log each operation (create/update/get/delete) with user_id at INFO; log validation failures at WARN; log DB errors at ERROR

---

### Phase 2: API & User Identification

#### Task 4: Extend submit API and add form CRUD endpoints ✅
**Files:** `src/routes/submit.js`, `src/routes/form.js` (new), `server.js`

- Modify `POST /api/submit`:
  - Require `user_id` in body (UUID string)
  - Validate user_id format (UUID v4)
  - **Order:** Save to DB first via `submissions.createOrUpdate()`, then send Telegram notification. If Telegram fails, return 502 but data is already saved.
  - On update (resubmit): also send to Telegram (e.g. "Обновлённая анкета" or same format as new)
  - Return `{ success, data? }` with created/updated record
- Add `GET /api/form/:userId` — return user's submission or 404
- Add `DELETE /api/form/:userId` — delete user's submission
- Mount `/api/form` router in `server.js`
- **Logging:** Log each request with method, user_id at DEBUG; log validation errors at WARN; log success/failure at INFO

#### Task 5: User ID persistence (localStorage + cookie fallback) ✅
**Files:** `js/user-id.js` (new), `index.html`

- Create `getOrCreateUserId()` in `js/user-id.js` (root-level, matches project structure: `css/`, `assets/`):
  - Check `localStorage.getItem('wedding_user_id')`
  - If missing, check `document.cookie` for `wedding_user_id`
  - If still missing, generate UUID (`crypto.randomUUID` or fallback)
  - Save to localStorage and set cookie: `wedding_user_id=UUID; max-age=31536000; path=/; SameSite=Lax`
  - Return user_id
- Expose as `window.getOrCreateUserId` or global for form scripts
- Add `<script src="js/user-id.js">` in `index.html` before form script
- **Logging:** No backend logging; frontend can `console.debug` if needed

---

### Phase 3: Form UX – Restoration & Delete

#### Task 6: Form state restoration and delete button ✅
**Files:** `index.html` (modal form script)

- On modal open: show loading indicator, call `GET /api/form/:userId` (user_id from `getOrCreateUserId()`)
- If data exists: populate FIO fields and transport checkbox. **FIO restoration:** first row uses existing first input; clear extra rows; for `guests[1..n]` create new rows via same logic as "Добавить гостя" (fio-row with input + remove button), filling each input with guest value
- Show message "Загружена ваша предыдущая анкета от [дата/время]"
- Add "Очистить мои данные" button — confirmation dialog → `DELETE /api/form/:userId` → reset form, show success
- Show submission timestamp in form (e.g. "Последняя отправка: 15.02.2026 14:30")
- **Logging:** Backend: log GET/DELETE at INFO; frontend: optional console.debug for load/save

#### Task 7: Update form submit to send user_id and handle upsert ✅
**Files:** `index.html` (form submit handler)

- Before `fetch('/api/submit')`, get `user_id` from `getOrCreateUserId()` and include in body
- On success: show brief "Анкета сохранена" / toast; optionally refresh "last submission" display
- On error: show user-friendly message
- Add visual loading state (spinner/disabled) during submit
- **Logging:** Log submit attempts and responses at DEBUG on client; server already logs in Task 4

---

### Phase 4: Admin Panel

#### Task 8: Basic admin authentication ✅
**Files:** `src/middleware/auth.js` (new), `server.js`

- Create `src/middleware/auth.js` with HTTP Basic Auth middleware (no separate admin-auth routes file)
- Add env vars: `ADMIN_USER`, `ADMIN_PASSWORD` (or `ADMIN_CREDENTIALS=user:pass`)
- Apply middleware to `/admin` and `/api/admin` routes
- If no Basic header: return 401 with `WWW-Authenticate: Basic`
- **Logging:** Log auth attempts (success/fail) at INFO; never log passwords

#### Task 9: Admin dashboard page with table ✅
**Files:** `src/routes/admin.js` (new), `admin.html` (new), `css/admin.css` (new), `server.js`

- `GET /admin` — serve `admin.html` (explicit route; static won't serve `/admin` as `admin.html`)
- `GET /api/admin/submissions` — use `submissions.getAll({ limit, offset, sortBy, order, search })` from query params; return JSON
- Table columns: user_id, guests (joined), transport, created_at, updated_at
- **Logging:** Log each admin API request at INFO; log access denials at WARN

#### Task 10: Table features and export (CSV, Excel) ✅
**Files:** `admin.html`, `src/routes/admin.js`, `package.json`

- Install `exceljs` for Excel export (xlsx has known vulns, no fix)
- Table: sortable columns (click header), search/filter input, pagination controls
- Add "Экспорт CSV" and "Экспорт Excel" buttons
- `GET /api/admin/submissions/export?format=csv` — stream CSV
- `GET /api/admin/submissions/export?format=xlsx` — return .xlsx file
- Export includes all columns; respect current filters if any
- **Logging:** Log export requests at INFO with format and row count

---

## Technical Notes

- **Database:** `better-sqlite3` — file-based, no external service; use volume in Docker for persistence
- **User ID:** UUID v4; stored in localStorage + cookie (`wedding_user_id`) as fallback
- **Admin auth:** HTTP Basic Auth middleware only
- **Excel:** `exceljs` package for `.xlsx` generation
- **Russian locale:** All admin UI strings in Russian (per project)

## Dependencies to Add

- `better-sqlite3` — SQLite
- `exceljs` — Excel export
