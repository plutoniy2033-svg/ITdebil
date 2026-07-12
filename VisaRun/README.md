# VisaRun

VisaRun helps tourists prepare for visa runs with a clear deadline, route hints, and a quick readiness checklist.

## Run locally

```bash
npm install
npm run dev:all
```

- Frontend: `http://localhost:5173/`
- API: `http://localhost:3001/`

For frontend only (without auth API):

```bash
npm run dev
```

## Auth and client database

- Splash screen on startup
- Login / registration before entering the app
- SQLite client database: `server/data/clients.db`
- API routes:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/me`

## Current status

- Ready:
  - Visa day tracker with overstay warning
  - Checkpoint directory with map
  - Community boards (now persisted in local storage)
  - Multi-language UI (RU/EN/VI)
  - Pre-trip readiness checklist and plan sharing
  - Splash screen and client auth (SQLite)
- Demo (not integrated with backend APIs yet):
  - Tour booking
  - E-Visa wizard submission (practice mode only)
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
- Backend: Express + SQLite (`better-sqlite3`)
- Auth: JWT token in browser localStorage
- State: React Context + localStorage persistence
- Routing: react-router-dom
- Map: Leaflet

## Test roadmap

Planned tests (next step):

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
