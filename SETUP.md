# Apsara OTT — Setup Guide

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 16+ (for standalone dev) or Docker + Docker Compose (for production)
- A Google Cloud project with OAuth 2.0 credentials
- A Razorpay account

---

## Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
cp .env.example .env
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Random secret for Auth.js (run `npx auth secret`) |
| `AUTH_GOOGLE_ID` | Google OAuth Client ID |
| `AUTH_GOOGLE_SECRET` | Google OAuth Client Secret |
| `RAZORPAY_KEY_ID` | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `PUBLIC_RAZORPAY_KEY_ID` | Same as `RAZORPAY_KEY_ID` (public) |
| `UPLOAD_DIR` | Directory where media files are stored (default: `./uploads`) |
| `MEDIA_BASE_URL` | Base URL to serve media (dev: `http://localhost:5173/api/media`, prod: `http://yourdomain.com/media`) |
| `SUPER_ADMIN_EMAIL` | Your Google account email that gets auto-assigned super_admin role |

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Navigate to **APIs & Services → Credentials**
5. Create **OAuth 2.0 Client ID** (Web application)
6. Add Authorized redirect URIs:
   - Dev: `http://localhost:5173/auth/callback/google`
   - Prod: `https://yourdomain.com/auth/callback/google`

---

## Option A: Standalone Development (No Docker)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up PostgreSQL locally
```bash
# macOS with Homebrew
brew install postgresql@16
brew services start postgresql@16
createdb apsara

# Update .env:
# DATABASE_URL=postgresql://localhost/apsara
```

### 3. Run database migrations
```bash
npm run db:push
```

### 4. Start the dev server
```bash
npm run dev
```

The app runs on **http://localhost:5173**

In dev mode, media files are served via `GET /api/media/[...path]` directly from the SvelteKit server (no Nginx needed).

### 5. Seed super admin (first time)

After signing in with your Google account for the first time (use the email from `SUPER_ADMIN_EMAIL`), your role is automatically set to `super_admin`.

Alternatively, run:
```bash
npm run db:seed
```

> **Note:** Set `UPLOAD_DIR` to an absolute path like `/Users/yourname/apsara-uploads` and `MEDIA_BASE_URL` to `http://localhost:5173/api/media` in your `.env`.

---

## Option B: Docker (Production)

### 1. Configure `.env`
```bash
cp .env.example .env
# Fill all values
# Set MEDIA_BASE_URL=http://yourdomain.com/media
# Set ORIGIN=http://yourdomain.com
```

### 2. Build and start all services
```bash
docker compose up -d --build
```

This starts:
- **PostgreSQL** on internal network
- **SvelteKit app** on port 3000 (internal)
- **Nginx** on port **80** as reverse proxy + media file server

### 3. Run database migrations
```bash
docker compose exec app npm run db:push
```

### 4. Check logs
```bash
docker compose logs -f app
```

### Volume Locations

| Volume | Purpose |
|---|---|
| `pgdata` | PostgreSQL data |
| `uploads` | All uploaded media files |

---

## Admin Dashboard

Access at `/admin` — requires `editor`, `admin`, or `super_admin` role.

### First Login
1. Sign in with your `SUPER_ADMIN_EMAIL` Google account
2. Go to `/admin`
3. Start by adding genres, then movies/series

---

## File Uploads

All uploaded files (posters, videos, subtitles) are:
- Renamed to a **UUID** (e.g., `3f2b1a4c-...mp4`)
- Stored under `UPLOAD_DIR/posters/`, `UPLOAD_DIR/videos/`, `UPLOAD_DIR/subtitles/`
- Referenced via the `media_files` table in the database

---

## NPM Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run db:push` | Push schema to database (dev) |
| `npm run db:generate` | Generate migration files |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Drizzle Studio (DB GUI) |
| `npm run db:seed` | Seed super admin |
