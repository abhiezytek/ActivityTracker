# InsureTrack — Insurance Sales Activity Tracker

A full-stack web application for Insurance Sales Activity Tracking, built with **React.js** (frontend), **Node.js/Express** (backend), and **MySQL** (database).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, React Router, React Query, Recharts |
| Backend | Node.js, Express 4, JWT, bcrypt |
| .NET API | ASP.NET Core 8, Dapper, JWT, Swashbuckle (Swagger) |
| Database | MySQL 8 (no ORM — raw `mysql2` queries) |
| API Docs | Swagger UI at `/api/docs` |

---

## Quick Start

### Prerequisites
- Node.js 18+
- MySQL 8+
- .NET 8 SDK (for the .NET API)

### 1. Database Setup
```bash
mysql -u root -p < backend/database/schema.sql
mysql -u root -p activity_tracker < backend/database/seed.sql
```

### 2. Backend (Node.js)
```bash
cd backend
cp .env.example .env        # Edit DB credentials and JWT secret
npm install
npm run dev                 # Starts on http://localhost:5000
```

### 3. .NET API
```bash
cd dotnet-api
cp appsettings.example.json appsettings.json  # Edit DB credentials and JWT secret
dotnet run                  # Starts on http://localhost:5112
```

Swagger UI is available at: `http://localhost:5112/api/docs`

### 4. Frontend
```bash
cd frontend
npm install
npm run dev                 # Starts on http://localhost:5173
```

### Default Login
| Field | Value |
|---|---|
| Email | admin@example.com |
| Password | Admin@123 |

---

## Features

### Core Modules
- **Lead Management** — Create/edit leads, Excel bulk upload, status lifecycle, auto-assignment
- **Activity Tracking** — Log calls, meetings, follow-ups; schedule with reminders; geo-location capture
- **Sales Pipeline** — Kanban board view by lead status
- **Performance Dashboard** — KPI cards, pipeline chart, agent performance charts
- **Policy & Renewal Tracking** — 30/60/90-day renewal alerts with color coding
- **Notifications** — Follow-up reminders, missed activity alerts, renewal alerts
- **Compliance & Audit** — Full audit trail for all create/update/delete actions

### User Roles (Configurable)
- Admin
- Sales Agent
- Team Leader
- Branch Manager
- Compliance Officer

### Admin Configuration (Settings)
- Add/delete/edit **roles** at runtime
- Manage **product types** (Life, Motor, Health — configurable)
- Configure **lead sub-statuses** per lead status
- Manage **users** (create, assign roles/branches)

---

## API Documentation

### Node.js Backend
Swagger UI is available at: `http://localhost:5000/api/docs`

### .NET API
Swagger UI is available at: `http://localhost:5112/api/docs`

The .NET API provides full OpenAPI documentation including JWT Bearer authentication support. Use the **Authorize** button in Swagger UI to enter your JWT token and test protected endpoints.

### Key Endpoints
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/login` | Login, get JWT |
| GET | `/api/leads` | List leads (role-filtered) |
| POST | `/api/leads` | Create lead |
| PUT | `/api/leads/:id` | Update lead |
| POST | `/api/leads/upload` | Excel bulk import |
| POST | `/api/activities` | Log activity |
| GET | `/api/dashboard/kpis` | Dashboard KPIs |
| GET | `/api/policies/renewals` | Renewal alerts |
| GET | `/api/notifications` | User notifications |
| GET | `/api/config/roles` | List/manage roles |

---

## Database Schema

12 tables: `users`, `roles`, `branches`, `leads`, `lead_sub_statuses`, `activities`, `opportunities`, `policies`, `notifications`, `audit_logs`, `product_types`, `documents`.

See [`backend/database/schema.sql`](backend/database/schema.sql) for the full schema.

---

## Environment Variables (`backend/.env`)

```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=activity_tracker
JWT_SECRET=change-this-to-a-long-random-secret
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Security

- Passwords hashed with **bcrypt** (saltRounds=10)
- All APIs protected with **JWT Bearer token**
- **RBAC** enforced on every route (role + permission checks)
- **Audit trail** — every POST/PUT/DELETE logged to `audit_logs` with old/new values
- Rate limiting on auth endpoints
- Helmet.js security headers
