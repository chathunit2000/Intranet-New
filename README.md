# AASL-style Intranet — Full-Stack Scaffold

Two independent apps talking over a REST API:

```
intranet-project/
├── backend/    Node.js API (Express auth, employees, attendance, updates, docs) backed by MySQL
└── frontend/   React + Vite dashboard matching the design
```

## How the pieces fit together

1. **Node.js + MySQL** owns the data and business logic: employees, daily
   attendance, the "New Updates" / pending-actions feed, quick links, and
   the three document panels — all stored in MySQL tables. Everything is
   exposed through a small JSON API protected by bearer-token auth.
2. **React** is a pure SPA. It logs in against `POST /api/login`, stores
   the token, then loads the whole dashboard in one call to
   `GET /api/dashboard` and renders the five sections you can see in the
   original design: profile card, attendance card, updates/pending card,
   the icon strip of quick links, and the three bottom document panels.

## Get both running locally

```bash
# 1. Backend  (http://localhost:8000)
cd backend
npm install
copy .env.example .env    # Windows — use `cp` on macOS/Linux
# create the MySQL database + user first — see backend/README.md
npm run db:migrate
npm run db:seed
npm start

# 2. Frontend (http://localhost:5173)
cd frontend
npm install
copy .env.example .env    # Windows — use `cp` on macOS/Linux
npm run dev
```

Verify the API (and its database connection) is reachable at any point with:

```bash
curl http://localhost:8000/api/health
```

Log in with the seeded demo employee: **Service No `6609`**, **password `6609`**.

Full MySQL setup (creating the database/user, schema, and env variables) is
documented in `backend/README.md`.

## Why this structure

- The frontend never talks to the data source directly — it only knows the
  API shape, so you can extend the backend by adding new Express routes
  and data providers without changing React.
- Auth is stateless bearer-token auth, which is the simplest option when
  frontend and backend are served from different origins/ports in dev.

## What's intentionally left as a next step

This scaffold covers the dashboard shown in the screenshot end-to-end.
It does **not** yet implement the destination pages behind each tile
(Leave Management System, e-Directory, ERP Learning Hub, Vehicle
Management, etc.) — each of those is its own mini-module you'd build by
adding a new backend route and a page component on the frontend.
