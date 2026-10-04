# Restaurant Operations Management System — Deployment & Run Guide

This guide explains how to run the system on a development machine and how to deploy it to a server. It is written for the person who installs and operates the system, not for developers changing its code.

---

## 1. What you are running

The system has three parts:

| Part | Technology | Default port | Purpose |
|---|---|---|---|
| Database | PostgreSQL 17 | 5432 | Stores all business data |
| Backend API | NestJS (Node.js 20+) | 3001 | Business logic, permissions, JWT auth |
| Frontend | Next.js 16 (Node.js 20+) | 3000 | The web screens users work in |

Users only ever open the **frontend** in a browser. The frontend calls the **backend** on the server side; the browser never talks to the backend or the database directly.

---

## 2. Prerequisites

| Software | Version | Needed for |
|---|---|---|
| Node.js | 20 LTS or newer | Running/building backend and frontend |
| npm | Ships with Node.js | Installing packages |
| PostgreSQL | 17 (or Docker running `postgres:17`) | Database |
| Docker + Docker Compose | Current | Optional: containerised deployment |
| Git | Any | Getting the source code |

---

## 3. Get the code

```bash
git clone <repository-url> restaurant-management-system
cd restaurant-management-system
```

The project layout:

```
restaurant-management-system/
├── backend/        NestJS API
├── frontend/       Next.js web app
├── docs/           Design documents
└── docker-compose.yml
```

---

## 4. Database

The backend creates all tables automatically on start-up (see the note on `synchronize` in section 9). You only need an empty PostgreSQL database and a user that owns it.

### Option A — PostgreSQL in Docker (simplest)

From the project root:

```bash
docker compose up -d postgres
```

This starts `postgres:17` on port 5432 with:

- user: `restaurant_user`
- password: `restaurant_password`
- database: `restaurant_management`

### Option B — PostgreSQL installed on the machine

Create the user and database (run as the `postgres` superuser, for example with `psql`):

```sql
CREATE USER restaurant_user WITH PASSWORD 'choose-a-strong-password';
CREATE DATABASE restaurant_management OWNER restaurant_user;
```

Use the same values in `backend/.env` (section 5).

---

## 5. Backend configuration

Create `backend/.env` (copy it from your secure store, or create it by hand). It must contain:

```ini
# Database connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=restaurant_user
DB_PASSWORD=choose-a-strong-password
DB_NAME=restaurant_management

# Login tokens. Use a long random string (at least 32 characters).
JWT_SECRET=replace-with-a-long-random-string
JWT_EXPIRES_IN=8h

# First-start administrator. Only used when the users table is empty.
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=choose-a-strong-admin-password
```

Generate a suitable `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Important rules:

- **`JWT_SECRET` must be kept private.** Anyone who knows it can forge a login token for any user.
- **`ADMIN_PASSWORD` is only read on the very first start** (when no users exist). Changing it later does not change the existing admin's password — use the in-app *Change password* screen or the Administration screens instead.
- `backend/.env` is excluded from Docker images on purpose. In Docker, supply these values through `docker-compose.yml` or your server's secret store (see section 8).

---

## 6. Frontend configuration

Create `frontend/.env.local`:

```ini
# Address of the backend API, as seen FROM THE FRONTEND SERVER.
BACKEND_API_URL=http://localhost:3001
```

| Variable | Default if not set | Meaning |
|---|---|---|
| `BACKEND_API_URL` | `http://localhost:3001` | Where the frontend server sends API requests. Must be reachable from the machine/container running the frontend. |

No other variable is read by the frontend.

---

## 7. Run the system for development (on one machine)

Open three terminals.

**Terminal 1 — database** (skip if PostgreSQL is already running):

```bash
docker compose up -d postgres
```

**Terminal 2 — backend:**

```bash
cd backend
npm install
npm run start:dev
```

Wait until the log shows the application listening on port 3001. On the first start the backend creates all tables and, if the users table is empty, creates the admin account from `ADMIN_*`.

**Terminal 3 — frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** in a browser.

### Quick health checks

| Check | Command | Expected |
|---|---|---|
| Backend is up | `curl -i http://localhost:3001/auth/me` | `401 Unauthorized` (correct: no token supplied) |
| Frontend is up | `curl -i http://localhost:3000/login` | `200 OK` |

---

## 8. Deploy with Docker Compose

The repository contains a `docker-compose.yml` that builds the backend and frontend images and starts all three services.

```bash
docker compose up -d --build
```

Then open **http://<server-address>:3000**.

### Known gaps in the current `docker-compose.yml`

These must be fixed before using Docker in a real environment. The compose file as committed does **not** yet produce a working deployment:

1. **Backend fails to start.** `JWT_SECRET` is required but is not set under the `backend` service's `environment:`. Add it, and take the value from a secret, not from the file.
2. **Admin account uses the built-in default.** `ADMIN_USERNAME` / `ADMIN_PASSWORD` are not set, so the first admin gets the code default password. Set them.
3. **Frontend cannot reach the backend.** The frontend reads `BACKEND_API_URL`, but compose sets `NEXT_PUBLIC_API_URL`, which the code does not use. Inside the frontend container `localhost` is the container itself, so every API call fails. Set:
   ```yaml
   BACKEND_API_URL: http://backend:3001
   ```
4. **Hard-coded database password** in both the `postgres` and `backend` services. Move it to an environment file or secret.
5. **Uploaded files are lost when the backend container is recreated.** Files are written to `backend/uploads`, which is not a mounted volume. Add a volume for `/app/uploads` on the `backend` service.

Example corrected `backend` and `frontend` sections (replace the secret values):

```yaml
  backend:
    build: ./backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: restaurant_user
      DB_PASSWORD: ${DB_PASSWORD}
      DB_NAME: restaurant_management
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 8h
      ADMIN_USERNAME: ${ADMIN_USERNAME}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
    volumes:
      - uploads_data:/app/uploads
    ports:
      - "3001:3001"
    depends_on:
      postgres:
        condition: service_healthy

  frontend:
    build: ./frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      BACKEND_API_URL: http://backend:3001
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
  uploads_data:
```

Put the secret values in a `.env` file next to `docker-compose.yml` (Compose reads it automatically). **Do not commit that file.**

### Useful Docker commands

```bash
docker compose ps                     # service status
docker compose logs -f backend        # live backend log
docker compose restart backend        # restart one service
docker compose down                   # stop (keeps data)
docker compose down -v                # stop AND DELETE the database — destructive
```

---

## 9. Production requirements and warnings

**a. Schema auto-sync is on.** `backend/src/app.module.ts` sets `synchronize: true`. This makes TypeORM alter tables to match the code on every start. That is convenient in development but can drop or change columns in production. Before going live, set it to `false` and manage schema changes with migrations. Take a database backup before any upgrade regardless.

**b. HTTPS is required for login on a real network.** Session cookies are marked `secure` when `NODE_ENV=production`. Browsers do not send `secure` cookies over plain `http://` (except on `localhost`), so login will appear to succeed but the user will be sent back to the login screen. Put the frontend behind a reverse proxy with a TLS certificate (for example Nginx, Caddy, or a cloud load balancer) and serve it at `https://`.

**c. Back up the database and the uploads folder** on a schedule. The uploads folder holds employee documents and the business logo.

**d. Keep `.env` files out of version control.** The repository already ignores them; confirm before every push.

**e. Change the first admin password** after first login.

---

## 10. Production build without Docker

Use this if you run Node.js directly on a server (for example under systemd or PM2).

```bash
# Backend
cd backend
npm ci
npm run build
NODE_ENV=production node dist/main          # listens on 3001

# Frontend (in another shell)
cd frontend
npm ci
npm run build
BACKEND_API_URL=http://localhost:3001 npm run start   # listens on 3000
```

The backend must be started from the `backend/` directory so that `backend/.env` and the `uploads/` folder resolve correctly.

Put a reverse proxy in front of port 3000 (section 9b).

---

## 11. First-time setup after the system starts

1. Open the login page and sign in as the admin account (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
2. Change the admin password from your profile page.
3. **Administration → Branches:** create each restaurant branch with its name and code.
4. **Administration → Roles:** review the built-in roles. The **System Owner** role cannot be deleted.
5. **Administration → Users:** create a user for each staff member, set their primary branch, and assign roles per branch.
6. **Settings:** enter the business profile, upload the logo, and choose the currency, date, and time formats.
7. **Roster:** create departments, positions, and shift templates, then add employees.

Users with a role limited to one branch only see that branch. A user who needs several branches receives one role assignment per branch.

---

## 12. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Backend exits at start with a message about `JWT_SECRET` | `JWT_SECRET` not set | Add it to `backend/.env` or compose environment |
| Backend exits with a database connection error | Postgres not running, or wrong `DB_*` values | Check `docker compose ps` / `pg_isready`; compare credentials |
| Frontend shows errors on every page after login | `BACKEND_API_URL` wrong for this environment | Set it to the backend address the frontend can reach |
| Login works on `localhost` but not on the server | No HTTPS, so `secure` cookies are dropped | Serve the frontend over HTTPS (section 9b) |
| Cannot sign in as admin | `ADMIN_PASSWORD` changed after first start | Admin account exists already; reset the password from another admin account, or use the database |
| Uploaded logo or documents disappear after an update | `uploads/` not persisted | Mount a volume (section 8) and restore from backup |
| Port already in use | Another program on 3000/3001/5432 | Stop it, or change the port mapping |
| Dev server logs "Unauthorized" on every request | Session expired (8-hour lifetime) | Sign in again |

To see backend detail, run it with `npm run start:dev` (development) and read the terminal output, or `docker compose logs -f backend` in Docker.

---

## 13. Stopping and updating

**Stop (development):** press `Ctrl+C` in each terminal.

**Update to a new version:**

```bash
# 1. Back up the database first (example)
pg_dump -U restaurant_user restaurant_management > backup-$(date +%F).sql

# 2. Get the new code
git pull

# 3. Rebuild and restart
docker compose up -d --build        # Docker
# or, without Docker:
cd backend && npm ci && npm run build && cd ..
cd frontend && npm ci && npm run build && cd ..
```

Then restart the backend and frontend processes.

---

## Appendix A — Service addresses at a glance

| Service | Development URL | Where it is used |
|---|---|---|
| Web application | http://localhost:3000 | Users' browsers |
| Backend API | http://localhost:3001 | Frontend server only |
| PostgreSQL | localhost:5432 | Backend only |

## Appendix B — Environment variable summary

| Variable | Set in | Required | Notes |
|---|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` | backend | Yes | Database connection |
| `JWT_SECRET` | backend | Yes | Keep secret; no default |
| `JWT_EXPIRES_IN` | backend | No | Defaults in code; set to `8h` |
| `ADMIN_USERNAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | backend | First start only | Creates the first admin |
| `PORT` | backend | No | Defaults to 3001 |
| `NODE_ENV` | backend, frontend | Recommended `production` | Enables secure cookies |
| `BACKEND_API_URL` | frontend | Yes outside localhost | Where the frontend reaches the API |
