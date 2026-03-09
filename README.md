# SkillMentor — Online Mentoring Platform

> **An end-to-end solution** for browsing expert mentors, booking personalised learning sessions, and managing academic progress — all secured by role-based access control.

[![Frontend — Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://skillmentor.vercel.app)
[![Backend — Render](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](https://skillmentor-api.onrender.com/swagger-ui/index.html)
[![Auth — Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk)](https://clerk.com)

---

## 📋 Table of Contents

1. [Project Overview](#-project-overview)
2. [Features](#-features)
3. [Tech Stack](#%EF%B8%8F-tech-stack)
4. [Project Structure](#-project-structure)
5. [Getting Started](#-getting-started)
6. [Environment Variables](#-environment-variables)
7. [API Documentation](#-api-documentation)
8. [Deployed Links](#-deployed-links)
9. [Test Admin Account](#-test-admin-account)

---

## 🎯 Project Overview

**SkillMentor** is a full-stack Online Mentoring Platform that connects students with subject-matter experts. Students can discover mentors by subject, book time-boxed sessions, upload payment proof, and track their learning journey from a personal dashboard. Administrators manage the entire platform — onboarding mentors, approving payments, setting meeting links, and maintaining subjects — through a dedicated role-gated control panel.

The platform is built as a **mono-repository** containing a **React + TypeScript** frontend and a **Spring Boot** backend, authenticated end-to-end via **Clerk**, with roles stored in `publicMetadata`.

---

## ✨ Features

### 👩‍🎓 Student Features
| Feature | Description |
|---|---|
| **Mentor Discovery** | Browse all available mentors; filter by name or subject expertise |
| **Dynamic Mentor Profiles** | View skills, experience highlights, session rates, and ratings |
| **Session Booking** | Choose a date, time slot, and duration; backend validates against conflicts |
| **Payment Proof Upload** | Upload a bank-slip image at booking time for admin review |
| **Personal Dashboard** | Track upcoming and past bookings with live status badges |

### 🛡️ Admin Features
| Feature | Description |
|---|---|
| **Role-Based Dashboard** | Accessible **only** to users with `role: ADMIN` in Clerk `publicMetadata` |
| **Mentor Management** | Create mentor profiles with avatar, bio, skills, and experience highlights |
| **Subject Management** | Add and maintain the subject catalogue used for mentor tagging |
| **Booking Management** | Full table with filters, sorting, payment approval, meeting-link injection, and session completion |
| **Payment Approval** | Admins review uploaded bank slips and confirm or reject enrolments |

### ⚙️ Advanced / Cross-Cutting Features
| Feature | Description |
|---|---|
| **Double-Booking Prevention** | Backend rejects any booking where the **mentor** or the **student** already has an overlapping confirmed session |
| **Past-Date Validation** | Bookings for dates in the past are rejected at the API level |
| **Automatic Role Redirection** | `RoleRedirect` component sends Admins → `/admin` and Students → `/dashboard` automatically after sign-in |
| **Keep-Alive Health Check** | `GET /api/v1/health` endpoint pinged every 14 minutes by Cron-job.org to prevent Render free-tier cold starts |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** + **TypeScript** | UI framework & type safety |
| **Vite 7** | Lightning-fast dev server & bundler |
| **Tailwind CSS 4** | Utility-first styling |
| **shadcn/ui** + **Radix UI** | Accessible, composable component primitives |
| **React Router 7** | Client-side routing & protected routes |
| **React Hook Form** + **Zod** | Form management & schema validation |
| **Clerk** | Authentication, session management, RBAC via `publicMetadata` |
| **Lucide React** | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| **Spring Boot 3** (Java 17) | REST API framework |
| **Spring Security** | Request-level security & filter chain |
| **Clerk JWT Verification** | Custom `AuthenticationFilter` validates Clerk-issued JWTs |
| **Spring Data JPA** + **Hibernate** | ORM & database access |
| **PostgreSQL** (via **Supabase**) | Relational database |
| **SpringDoc OpenAPI 3** | Auto-generated Swagger UI |
| **Lombok** + **ModelMapper** | Boilerplate reduction & DTO mapping |
| **Jakarta Validation** | Bean-level input validation |

---

## 📁 Project Structure

```text
skillmentor-platform/                   ← Mono-repository root
│
├── frontend/                           ← React + Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/                 ← Shared UI components (layouts, guards)
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── RoleRedirect.tsx
│   │   │   └── ...
│   │   ├── pages/                      ← Route-level page components
│   │   │   ├── admin/
│   │   │   │   ├── CreateMentorPage.tsx
│   │   │   │   ├── CreateSubjectPage.tsx
│   │   │   │   └── BookingManagementPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── MentorsPage.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   ├── api.ts                  ← Centralised Axios API client
│   │   │   └── utils.ts
│   │   ├── App.tsx                     ← Router configuration
│   │   └── main.tsx
│   ├── .env                            ← Frontend environment variables
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── backend/                            ← Spring Boot application
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/stemlink/skillmentor/
│   │   │   │   ├── configs/
│   │   │   │   │   └── SecurityConfig.java
│   │   │   │   ├── controllers/
│   │   │   │   │   ├── HealthController.java   ← Keep-alive endpoint
│   │   │   │   │   ├── MentorController.java
│   │   │   │   │   ├── SessionController.java
│   │   │   │   │   ├── AdminController.java
│   │   │   │   │   └── SubjectController.java
│   │   │   │   ├── models/
│   │   │   │   ├── repositories/
│   │   │   │   ├── services/
│   │   │   │   ├── dtos/
│   │   │   │   └── security/
│   │   │   │       └── AuthenticationFilter.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
└── README.md
```

---

## 🏁 Getting Started

### Prerequisites
- **Java 17+** and **Maven 3.8+**
- **Node.js 20+** and **npm 10+**
- A **PostgreSQL** database (local or [Supabase](https://supabase.com) cloud)
- A **Clerk** account with a configured application

---

### 1 — Clone the Repository

```bash
git clone https://github.com/<your-username>/skillmentor-platform.git
cd skillmentor-platform
```

---

### 2 — Backend Setup

```bash
cd backend

# Copy the example env and fill in your values (see Environment Variables section)
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Build and run
./mvnw clean install
./mvnw spring-boot:run
```

> The REST API will be available at **`http://localhost:8081`**
> Swagger UI: **`http://localhost:8081/swagger-ui/index.html`**

---

### 3 — Frontend Setup

```bash
cd ../frontend

# Copy the example env and fill in your values
cp .env.example .env

npm install
npm run dev
```

> The app will be available at **`http://localhost:5173`**

---

## 🔑 Environment Variables

### Backend — `backend/src/main/resources/application.properties`

```properties
# Database
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}

# Server
server.port=${PORT:8081}

# Clerk (JWT public key fetched automatically from JWKS endpoint)
clerk.issuer=https://clerk.your-domain.com
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL JDBC connection string | `jdbc:postgresql://db.supabase.co:5432/postgres` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `your-db-password` |
| `PORT` | Server port (Render sets this automatically) | `8081` |

---

### Frontend — `frontend/.env`

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=https://skillmentor-api.onrender.com
```

| Variable | Description |
|---|---|
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk Publishable Key from your Clerk Dashboard |
| `VITE_API_BASE_URL` | Base URL of the deployed (or local) Spring Boot API |

---

## 📑 API Documentation

Full interactive documentation is available via **Swagger UI** at:
`GET <VITE_API_BASE_URL>/swagger-ui/index.html`

### Key Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | ❌ Public | Keep-alive health check — returns `{ "status": "UP" }` |
| `GET` | `/api/v1/mentors` | ❌ Public | List all mentors (supports filter by name/subject) |
| `GET` | `/api/v1/mentors/{id}` | ❌ Public | Retrieve a single mentor profile |
| `GET` | `/api/v1/subjects` | ❌ Public | List all available subjects |
| `POST` | `/api/v1/sessions/enroll` | ✅ Student | Book a session; validates double-bookings & past dates |
| `GET` | `/api/v1/sessions/my` | ✅ Student | List the authenticated student's bookings |
| `GET` | `/api/v1/admin/bookings` | ✅ Admin | List all bookings platform-wide |
| `PATCH` | `/api/v1/admin/bookings/{id}/approve` | ✅ Admin | Approve a payment and confirm a session |
| `PATCH` | `/api/v1/admin/bookings/{id}/meeting-link` | ✅ Admin | Attach a Zoom/Meet link to a confirmed session |
| `POST` | `/api/v1/admin/mentors` | ✅ Admin | Create a new mentor profile |
| `POST` | `/api/v1/admin/subjects` | ✅ Admin | Create a new subject |

> **🔐 Auth note:** Protected endpoints require a valid **Clerk JWT** in the `Authorization: Bearer <token>` header. Role-restricted endpoints additionally require `role: ADMIN` in the user's Clerk `publicMetadata`.

---

### Keep-Alive Design

```
Cron-job.org (every 14 min)
        │
        │  GET /api/v1/health
        ▼
┌───────────────────┐
│  Render Free Tier │  ← stays warm, no cold starts
│  Spring Boot API  │
└───────────────────┘
        │
        └─ 200 OK  { "status": "UP", "service": "SkillMentor API" }
```

Render's free tier idles after **15 minutes** of inactivity. A Cron-job.org job pings `/api/v1/health` every **14 minutes**, keeping the instance warm and eliminating multi-second cold-start delays for real users.

---

## 🌐 Deployed Links

| Service | URL |
|---|---|
| **Frontend (Vercel)** | https://skillmentor.vercel.app |
| **Backend API (Render)** | https://skillmentor-api.onrender.com |
| **Swagger UI** | https://skillmentor-api.onrender.com/swagger-ui/index.html |

---

## 🧪 Test Admin Account

> **Role management is handled entirely through Clerk's `publicMetadata`.**
> There are no plaintext passwords stored in the database.

To grant admin access to any user:

1. Go to your **Clerk Dashboard → Users**.
2. Select the target user.
3. Edit their **Public Metadata** and set:

```json
{
  "role": "ADMIN"
}
```

4. The user will be automatically redirected to `/admin` on their next sign-in via the `RoleRedirect` component.

| Field | Value |
|---|---|
| **Test Admin Email** | `admin@skillmentor.dev` *(set up in your Clerk app)* |
| **Password** | Managed by Clerk — use the "Sign in" flow |
| **Role** | Set via `publicMetadata → { "role": "ADMIN" }` |

---

## 📄 License

This project was developed as an academic submission. All rights reserved © 2025 SkillMentor Team.
