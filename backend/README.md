# Intranet Backend (Node.js API)

# Intranet Backend (Node.js + MySQL API)

This backend has been converted from the Laravel implementation to a lightweight Node.js + Express service backed by **MySQL**, so the existing React frontend can continue to work without the PHP stack.

## 1. Install dependencies

```bash
cd backend
npm install
```

## 2. Create the database and a dedicated user

Log into MySQL as root (or any admin user) and run:

```sql
CREATE DATABASE intranet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'intranet_app'@'localhost' IDENTIFIED BY 'intranet_pass';
GRANT ALL PRIVILEGES ON intranet.* TO 'intranet_app'@'localhost';
FLUSH PRIVILEGES;
```

(Use your own password in place of `intranet_pass` — just make sure it matches `DB_PASSWORD` in step 3.)

## 3. Configure environment variables

```bash
copy .env.example .env   # Windows
cp .env.example .env     # macOS / Linux
```

`.env` controls the port, JWT secret, allowed frontend origin(s), the MySQL
connection, and the seeded demo login. Defaults work out of the box if you
used the exact `CREATE USER` command above.

| Variable | Purpose |
|---|---|
| `DB_HOST` | MySQL host (default `localhost`) |
| `DB_PORT` | MySQL port (default `3306`) |
| `DB_USER` | MySQL user (default `intranet_app`) |
| `DB_PASSWORD` | MySQL password |
| `DB_NAME` | Database name (default `intranet`) |

## 4. Load your data — two options

**Option A: use the built-in demo schema + seed data**

```bash
npm run db:migrate   # creates the demo tables (employees, users, attendances...)
npm run db:seed       # inserts demo employee, quick links, updates, docs...
```

**Option B: import your own `.sql` dump**

If you have an existing MySQL dump (tables + data), drop the file at
`backend/db/UCFE_Template_mysql.sql` (or anywhere — just point
`SQL_IMPORT_FILE` in `.env` at it, or pass `--file=`), then run:

```bash
npm run db:import
# or, to point at a specific file without editing .env:
npm run db:import -- --file=./db/UCFE_Template_mysql.sql
```

This reads the `.env` database config already set up in step 3 — same
`DB_HOST`/`DB_USER`/`DB_PASSWORD`/`DB_NAME` — and executes every statement
in the file against that database. It:
- Creates the database if it doesn't exist yet
- Skips `CREATE DATABASE` / `USE` statements in the dump (already connected to the right DB)
- Skips "already exists" and "Duplicate entry" errors so it's safe to re-run
- Prints a summary (statements executed / skipped / errored) and final row counts for the tables listed in `TABLES_TO_VERIFY` inside `db/import-sql.js` — edit that array to match your dump's actual table names

**Important:** if you use Option B, `server.js` currently queries the demo
table names (`employees`, `users`, `attendances`, etc.). Once your real
dump is imported, the routes need to be rewritten to query *your* actual
table and column names instead — send me the dump (or its `CREATE TABLE`
statements) and I'll rewire the queries to match.

## 5. Run the API

```bash
npm start          # node server.js
npm run dev         # same, but auto-restarts on file changes
```

The API will be available at:

```text
http://localhost:8000/api
```

`GET /api/health` also confirms the database connection is live.

## Demo credentials

- Service No: `6609`
- Password: `6609`

## Endpoints

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| GET | `/api/health` | No | Health check — confirms the API and DB are up |
| POST | `/api/login` | No | Login with `service_no` + `password` |
| POST | `/api/logout` | Yes | End the current session |
| POST | `/api/change-password` | Yes | Update the current password (writes to MySQL) |
| GET | `/api/me` | Yes | Current user and employee details |
| GET | `/api/dashboard` | Yes | Dashboard payload for the SPA (from MySQL) |
| GET | `/api/attendance/history` | Yes | Paginated attendance history (from MySQL) |

Auth header for protected routes:

```text
Authorization: Bearer <token>
```

## Database schema

| Table | Purpose |
|---|---|
| `employees` | Core employee record |
| `users` | Login credentials, linked 1:1 to `employees` |
| `attendances` | Daily check-in/check-out per employee |
| `updates` | "What's new" dashboard cards |
| `pending_actions` | Per-employee to-do items on the dashboard |
| `quick_links` | Dashboard quick-link tiles |
| `document_groups` / `documents` | Grouped document panels on the dashboard |

## Extending this

Add new tables to `db/schema.sql`, seed data in `db/seed.js`, and new routes
in `server.js` using `pool.query(...)` — see the existing routes for the
pattern. Good next modules: leave requests, e-directory, complaint
management.

