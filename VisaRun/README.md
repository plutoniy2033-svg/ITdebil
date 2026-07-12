# VisaRun

VisaRun helps tourists prepare for visa runs with a clear deadline, route hints, and a quick readiness checklist.

## Run locally

### 1. Start PostgreSQL

Option A — Docker (recommended):

```bash
npm run db:up
```

Option B — local PostgreSQL installation (Windows):

1. Install PostgreSQL from https://www.postgresql.org/download/windows/
2. During setup remember the password for user `postgres`
3. Open **SQL Shell (psql)** or pgAdmin and run:

```sql
CREATE USER visarun WITH PASSWORD 'visarun';
CREATE DATABASE visarun OWNER visarun;
CREATE DATABASE visarun_test OWNER visarun;
```

Option C — Docker (if installed):

```bash
npm run db:up
```

### 2. Configure environment

```bash
copy .env.example .env
```

Set at least:

```env
DATABASE_URL=postgresql://visarun:visarun@localhost:5432/visarun
JWT_SECRET=change-me-to-a-long-random-secret
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### 3. Install and run

```bash
npm install
npm run migrate
npm run dev:all
```

- Frontend: `http://localhost:5173/`
- API: `http://localhost:3001/`
- Health check: `http://localhost:3001/api/health`

For frontend only (without API):

```bash
npm run dev
```

Without API the auth screen will fail because login requires the backend.

## Auth and user data

- Splash screen on startup
- Login / registration before entering the app
- PostgreSQL stores accounts, visa tracker, and settings per user
- API routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`
  - `GET/PUT/PATCH /api/tracker`
  - `POST/DELETE /api/tracker/history`
  - `GET/PUT/PATCH /api/settings`

### One-time local import

If you already had data in browser localStorage, it is imported once on first login after this update. PIN stays local-only and is not synced to the server.

## Tests

Create test database (if using Docker, same user can access it):

```sql
CREATE DATABASE visarun_test OWNER visarun;
```

Run API integration tests:

```bash
npm test
```

Optional:

```env
TEST_DATABASE_URL=postgresql://visarun:visarun@localhost:5432/visarun_test
TEST_PORT=3099
```

## Current status

- Ready:
  - Visa day tracker with overstay warning
  - Checkpoint directory with map
  - Community boards (local storage only)
  - Multi-language UI (RU/EN/VI)
  - Pre-trip readiness checklist and plan sharing
  - Splash screen and client auth
  - Server sync for tracker and settings (PostgreSQL)
- Demo (not integrated with backend APIs yet):
  - Tour booking
  - E-Visa wizard submission (practice mode only)
  - PIN lock (stored locally only)
- In progress:
  - Stronger real-time border data
  - Full offline document package

## Product goal

The main goal is to make visa run preparation easier for tourists:

- understand deadline quickly
- avoid missing important preparation steps
- choose safer checkpoints and routes
- keep emergency contacts and FAQ nearby

## Technical notes

- Frontend: React + TypeScript + Vite
- Backend: Express + PostgreSQL (`pg`)
- Auth: JWT token in browser localStorage
- State: React Context + server sync
- Routing: react-router-dom
- Map: Leaflet

## Test roadmap

Planned frontend tests (next step):

1. `visaRules` default day-limit selection for each citizenship and entry type.
2. Tracker date logic:
   - entry date parsing
   - days remaining calculation
   - overstay edge cases
3. Reminder logic:
   - threshold notifications (14/7/3/1)
   - one-notification-per-day deduplication
4. Form validation:
   - E-Visa minimum required fields
   - security PIN length (4-6)
   - community report/post minimum content.
