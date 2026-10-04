# Installation Workflow — New Installation

Written for: the person setting up the system on a new computer or server.

Two ways to install. Pick one:

| Option | Use when | Needs |
|---|---|---|
| **Local** (recommended for a single computer) | You want everything on one Windows computer | Node.js 20+, PostgreSQL 17 |
| **Docker** | You run the system on a server, or want to avoid installing PostgreSQL by hand | Docker Desktop |

---

## Part A — Local installation (Windows)

### Step 1 — Install the prerequisites

1. **Node.js 20 LTS** from https://nodejs.org (accept the defaults).
2. **PostgreSQL 17** from https://www.postgresql.org/download/windows/. Keep the superuser (`postgres`) password you choose; the installer asks for it.

Optional: open a terminal and confirm both tools:

```
node -v
psql --version
```

### Step 2 — Get the code

Copy the project folder to the computer, for example `D:\Projects\restaurant-management-system`.

### Step 3 — Check the prerequisites

From the project folder:

```
powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -CheckOnly
```

This changes nothing. Fix anything it reports as an error before continuing.

### Step 4 — Run the installer

```
powershell -ExecutionPolicy Bypass -File scripts\install.ps1
```

The installer asks for:

| Question | Notes |
|---|---|
| Address staff will open the app at | Use `http://localhost:3000` for a single computer, or the server's network address (for example `http://192.168.1.20:3000`) so other devices can reach it. |
| Administrator username and email | The first administrator account. |
| Administrator password | Entered twice. Use a strong password and store it safely. |
| PostgreSQL superuser password | Only if `psql` was found. Used once to create the database and user. |

It then does the following automatically:

1. Creates `.env` in the project folder, with a generated database password and signing secret.
2. Writes the settings for the API (`backend\.env`) and the web app (`frontend\.env.local`).
3. Creates the database user `restaurant_user` and the database `restaurant_management`.
4. Installs the packages and builds the API and the web app.
5. Starts both, and waits until they respond.

The first start creates all the database tables and the administrator account, which can take a minute.

### Step 5 — Sign in and set up

1. Open the address you chose (default http://localhost:3000).
2. Sign in as the administrator.
3. Change the administrator password from **My Profile**.
4. Follow section 6 of [business-documentation.md](business-documentation.md) for the initial setup: business profile and logo, currency, branches, roles, staff, and the stock and preservation settings.

---

## Part B — Docker installation

1. Install **Docker Desktop** and make sure it is running.
2. From the project folder:

```
powershell -ExecutionPolicy Bypass -File scripts\install.ps1 -Mode Docker
```

The installer writes `.env` (the same questions as Part A), then runs `docker compose up -d --build`. The database, the API and the web app all start in containers. Data is kept in Docker volumes, so it survives restarts.

Check that everything is running:

```
docker compose ps
```

Sign in at the address you chose, as in Part A, step 5.

---

## Starting and stopping after installation

| Task | Local | Docker |
|---|---|---|
| Start | `powershell -ExecutionPolicy Bypass -File scripts\start.ps1` | `powershell -ExecutionPolicy Bypass -File scripts\start.ps1 -Mode Docker` |
| Stop | Close the minimised `cmd` windows, or end `node` in Task Manager | `docker compose stop` |
| Logs | `logs\backend.log` and `logs\frontend.log` | `docker compose logs -f` |

Restart the computer and then run `start.ps1` again. For the Docker option, the containers restart automatically when Docker starts.

---

## Settings to review before going live

Open the `.env` file in the project folder:

- **DB_SYNC:** `true` on a fresh install, so the tables are created. Once the first start has worked, set it to `false` so the structure is never changed automatically. Take a backup before any upgrade.
- **APP_PUBLIC_URL:** must be the address phones and staff use. QR stickers print this address, so `localhost` will not work on a phone.
- **HTTPS:** staff sign-in needs HTTPS on a real network. Put the web app behind a reverse proxy with a certificate (see [deployment-guide.md](deployment-guide.md)).

Keep `.env` private. It holds the database password and the signing secret.

---

## Updating an installed system

1. Back up the database (`pg_dump` or the backup tool of your PostgreSQL install).
2. Copy the new code over, keeping `.env`.
3. Run `scripts\install.ps1` again. It keeps the existing configuration, rebuilds, and restarts.

---

## Troubleshooting

| Message or symptom | Cause and fix |
|---|---|
| "Node.js 20 or newer is needed" | Install Node.js 20 LTS, then open a new terminal. |
| "psql not found" | Create the database by hand, as the installer shows, or add PostgreSQL's `bin` folder to the PATH. |
| "npm ci failed" | Check the internet connection and run the installer again. |
| API does not start within 3 minutes | Read `logs\backend.log`. Usually the database is not reachable: check that PostgreSQL is running and the password in `backend\.env` matches. |
| Web app does not start | Read `logs\frontend.log`. Re-run `npm run build` in `frontend` after any change. |
| Sign-in page shows "fetch failed" | The API is not running. Run `start.ps1`. |
| Port 3000 or 3001 already in use | Another program or an old copy of the system is running. Stop it and start again. |
| Currency shows "$" | Set the currency in Settings → System (the default is USD). |
| QR codes do not open on a phone | Change `APP_PUBLIC_URL` in `.env` to the network address. For a local install also set `NEXT_PUBLIC_APP_URL` in `frontend\.env.local`, then rebuild and restart the web app. The installer keeps an existing `.env`, so a re-run does not change the address. |
