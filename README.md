# TaskFlow — Team Task Management Platform

A full-stack task management application with Google OAuth 2.0 login, task assignment, and Gmail email notifications.

**Live App:** https://taskflow-weld-pi.vercel.app  
**GitHub:** https://github.com/anju-914/taskflow  
**Backend API:** https://taskflow-production-f4e8.up.railway.app

---

## Features

- Google OAuth 2.0 login via Supabase Auth
- Create tasks with title, description, priority, and due date
- Assign tasks to other registered users
- Email notification to assignee when a task is created
- Email notification to creator when a task is completed
- Filter tasks by status — Pending, In Progress, Completed
- Search tasks by title or description
- Delete tasks (creator only)
- Fully responsive UI

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Backend | Python Flask |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth 2.0 |
| Email | Gmail SMTP with App Password |
| Frontend Hosting | Vercel |
| Backend Hosting | Railway |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER BROWSER                             │
│                   Next.js Frontend                              │
│                 (Vercel – Edge Network)                         │
└───────────────────────┬─────────────────────────────────────────┘
                        │  HTTPS + JWT Bearer Token
         ┌──────────────┴──────────────┐
         │                             │
         ▼                             ▼
┌─────────────────────┐    ┌────────────────────────┐
│   Flask REST API    │    │    Supabase Auth        │
│     (Railway)       │    │  (Google OAuth 2.0)     │
│                     │    │                         │
│  /api/tasks  CRUD   │    │  - JWT token issuance   │
│  /api/users  list   │    │  - Google SSO           │
│  /api/auth   sync   │    │  - Session management   │
└──────────┬──────────┘    └────────────┬────────────┘
           │                            │
           ▼                            ▼
┌──────────────────────────────────────────────────┐
│              Supabase (PostgreSQL)               │
│                                                  │
│  Tables: profiles, tasks                         │
│  Row Level Security enforced                     │
│  Trigger: auto-create profile on signup          │
└──────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Gmail SMTP        │
│                     │
│  App Password auth  │
│                     │
│  Sends:             │
│  - Task assigned    │
│  - Task completed   │
└─────────────────────┘
```

---

## Data Flow — Creating a Task

```
1. User fills CreateTaskModal → clicks "Create Task"
2. Frontend calls POST /api/tasks with JWT Bearer token
3. Flask @require_auth middleware verifies JWT with Supabase
4. Flask inserts task into Supabase (tasks table)
5. Flask fetches assignee profile from Supabase
6. Flask connects to Gmail SMTP → sends notification email
7. Task returned to frontend → task list updates instantly
```

---

## Authentication Flow

```
1. User clicks "Continue with Google"
2. Supabase redirects to Google consent screen
3. Google redirects to /auth/callback?code=...
4. Next.js Route Handler exchanges code for Supabase session
5. Frontend calls POST /api/auth/sync-profile (upserts profile row)
6. JWT stored in browser via Supabase SSR cookies
7. All API requests include JWT in Authorization header
```

---

## Project Structure

```
taskflow/
├── migrations/
│   └── 001_initial_schema.sql     ← Run in Supabase SQL editor
│
├── backend/
│   ├── app.py                     ← Flask app, CORS, blueprints
│   ├── Procfile                   ← Gunicorn command for Railway
│   ├── requirements.txt
│   ├── runtime.txt
│   ├── .env.example
│   ├── routes/
│   │   ├── auth.py                ← /api/auth — profile sync
│   │   ├── tasks.py               ← /api/tasks — CRUD + emails
│   │   └── users.py               ← /api/users — user list
│   └── services/
│       ├── supabase_client.py     ← Supabase singleton
│       ├── auth_middleware.py     ← JWT verification decorator
│       └── email_service.py      ← Gmail SMTP email sender
│
└── frontend/
    ├── app/
    │   ├── layout.tsx             ← Root layout
    │   ├── page.tsx               ← Redirect to dashboard
    │   ├── globals.css            ← Tailwind + design tokens
    │   ├── login/page.tsx         ← Login page
    │   ├── dashboard/page.tsx     ← Main dashboard
    │   └── auth/callback/route.ts ← OAuth callback handler
    ├── components/
    │   ├── Navbar.tsx             ← Top navigation
    │   ├── TaskCard.tsx           ← Task card with status
    │   ├── CreateTaskModal.tsx    ← New task form
    │   └── StatsBar.tsx           ← Summary stats
    ├── hooks/
    │   ├── useAuth.ts             ← Auth state management
    │   └── useTasks.ts            ← Task CRUD state
    ├── lib/
    │   ├── supabase.ts            ← Supabase browser client
    │   └── api.ts                 ← Fetch wrapper with JWT
    └── types/
        └── index.ts               ← TypeScript interfaces
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+
- Python 3.12+
- Git
- Supabase account
- Google Cloud account

---

### 1. Clone the Repository

```bash
git clone https://github.com/anju-914/taskflow.git
cd taskflow
```

---

### 2. Supabase Setup

1. Create a new project at https://supabase.com
2. Go to **SQL Editor** → run `migrations/001_initial_schema.sql`
3. Go to **Authentication → Providers** → enable **Google**
4. Add your Google OAuth Client ID and Secret
5. Go to **Authentication → URL Configuration** → add:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`
6. Copy **Project URL**, **anon key**, **service role key** from **Settings → API**

---

### 3. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in all values in .env

python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Test: http://localhost:5000/api/health → `{"status": "ok"}`

---

### 4. Frontend Setup

```bash
cd frontend
cp .env.example .env.local
# Fill in values in .env.local

npm install
npm run dev
```

Open: http://localhost:3000

---

### 5. Environment Variables

**`backend/.env`**
```
FLASK_ENV=development
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
FRONTEND_URL=http://localhost:3000
GMAIL_SENDER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-digit-app-password
```

**`frontend/.env.local`**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## Deployment

### Backend → Railway

1. Push code to GitHub
2. Go to https://railway.app → New Project → Deploy from GitHub
3. Select `anju-914/taskflow` repo
4. Set **Root Directory** to `backend`
5. Add all environment variables from `.env.example`
6. Railway auto-detects `Procfile` and runs Gunicorn

### Frontend → Vercel

1. Go to https://vercel.com → New Project
2. Import `anju-914/taskflow` repo
3. Set **Root Directory** to `frontend`
4. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   NEXT_PUBLIC_API_URL=https://your-railway-url.up.railway.app
   ```
5. Click Deploy

---

## Email Notifications

| Trigger | Recipient | Content |
|---------|-----------|---------|
| Task created with assignee | Assignee | Task details + link to dashboard |
| Task marked as completed | Task creator | Completion notice + link |

---

## Database Schema

```sql
-- profiles table
id          UUID  (linked to auth.users)
email       TEXT
full_name   TEXT
avatar_url  TEXT
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ

-- tasks table
id          UUID
title       TEXT
description TEXT
status      TEXT  (pending / in_progress / completed)
priority    TEXT  (low / medium / high)
due_date    TIMESTAMPTZ
created_by  UUID  → profiles
assigned_to UUID  → profiles
created_at  TIMESTAMPTZ
updated_at  TIMESTAMPTZ
```

---

## Security

- `SUPABASE_SERVICE_ROLE_KEY` is only on the server — never in the browser
- All API endpoints protected by `@require_auth` decorator
- Row Level Security on all Supabase tables
- CORS restricted to frontend origin only
- `.env` files excluded from Git via `.gitignore`

---

## Git Commit History

```
feat: initial TaskFlow setup — Flask backend + Next.js frontend
chore: remove .env and pycache from tracking
chore: add backend gitignore
```

---

## Developer

**Anju Narwal**  
B.Tech Computer Science — Vaish College of Engineering, Rohtak  
GitHub: https://github.com/anju-914  
Email: narwalanju108@gmail.com
