# Workflow Tracker

A full-stack application workflow tracker built with **Django + Django Ninja** (backend) and **React + Vite** (frontend).

## Workflow

```
Draft → Submitted → Under Review → Approved
                              → Rejected
                              → Need More Information → Submitted → ...
```

---

## What This Repo Includes

- Backend: Django + Django Ninja API implementing the application model and workflow endpoints.
- Frontend: React + Vite app with list, create/edit form, detail view, and reviewer decision UI.
- Workflow rules enforced server-side (draft → submit → review → decision).
- Basic backend tests for workflow rules (see `backend/applications/tests.py`).


## Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+

---

## Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# (Optional) Create a superuser for the Django admin
python manage.py createsuperuser

# Start the development server
python manage.py runserver
```

### Run backend tests

Activate your virtual environment and run tests from the `backend` folder:

```bash
python manage.py test
```

If you see an import error for `corsheaders`, ensure you installed dependencies into the active venv:

```bash
pip install -r requirements.txt
```


The API will be available at **http://localhost:8000/api/**

Interactive API docs (Swagger UI): **http://localhost:8000/api/docs**

---

## Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Build for production

Set the API base URL then build:

```bash
VITE_API_URL=http://localhost:8000/api npm run build
```

### Common npm permission issue

If you tried `npm install -g ...` and got EACCES permission errors, prefer one of these:

- Use `npx` for one-off tools: `npx react-devtools`
- Install globals with `--location=global` (npm >=9): `npm install --location=global PACKAGE`
- Use a node version manager (`nvm`) and install global packages per-user.


The app will be available at **http://localhost:5173**

> The Vite dev server proxies `/api` requests to `http://localhost:8000`, so no CORS config is needed in development.

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/applications/` | Create a draft application |
| `GET` | `/api/applications/` | List all applications (optional `?status=` filter) |
| `GET` | `/api/applications/{id}` | Get application details |
| `PUT` | `/api/applications/{id}` | Update draft/NMI application |
| `POST` | `/api/applications/{id}/submit` | Submit a draft or NMI application |
| `POST` | `/api/applications/{id}/start-review` | Move to Under Review |
| `POST` | `/api/applications/{id}/decision` | Record reviewer decision |

---

## Workflow Rules

- Only **Draft** and **Need More Information** applications can be edited.
- Only **Draft** and **Need More Information** applications can be submitted.
- Only **Submitted** applications can move to **Under Review**.
- Only **Under Review** applications can receive a reviewer decision.
- **Approved** and **Rejected** applications are immutable.
- Reviewer comment is **required** for `Rejected` and `Need More Information` decisions.

---

## Assumptions Made

1. **No authentication** — the assignment focuses on workflow logic, so auth was omitted. In production, JWT or session-based auth would be added.
2. **SQLite** used for simplicity. PostgreSQL is recommended for production.
3. `Need More Information` applications can be resubmitted (same endpoint as initial submit) to keep the API simple.
4. The frontend proxies API requests via Vite's dev server — no CORS headers needed in development.
5. Tracking numbers are auto-generated (`APP-XXXXXXXX`) and cannot be changed.

---

## What I Would Improve With More Time

- **Authentication & roles** — separate applicant and reviewer roles with JWT auth.
- **PostgreSQL** — swap SQLite for Postgres, add `DATABASE_URL` env support.
- **Pagination** — add cursor-based pagination to the list endpoint.
- **Email notifications** — send emails on status transitions using Celery + Redis.
- **Audit log** — track all status changes with timestamps and actor info.
- **Tests** — unit tests for workflow rules (pytest-django) and React component tests (Vitest + Testing Library).
- **Docker Compose** — containerize both services for one-command startup.
- **CI/CD** — GitHub Actions for linting, tests, and deployment.
- **Filtering & search** — full-text search across applicant name, company, tracking number.
- **Environment variables** — `.env` file support with `django-environ`.
