# GOVQUEUE AI

> **"Smart Government Appointments. Faster Queues. Better Public Service."**  
> *Developed for the "Build to Ship — AI Engineering Program" Hackathon / Demo.*

---

## 🏛️ Project Overview

**GOVQUEUE AI** is a production-ready, full-stack GovTech platform designed to eliminate counter congestion across public administration offices (District Collectorates, Regional Transport Offices, Passport Seva Kendras, Tehsil Revenue Offices, and Municipal Suvidha Kendras). 

Citizens can discover verified government procedures, check required documents with AI assistance, book guaranteed time slots, and monitor their real-time desk queue tokens directly from their smartphones.

Staff and Administrators manage counter operations and monitor platform-wide KPIs within the same unified portal through a **restricted personnel entry point** (`/internal`), protected by role-based server-side authorization and an immutable audit log.

---

## ⚡ Architectural Highlights

* **No Long-Running Express Server:** Serverless architecture deployable directly to **Vercel** with native `/api/*` endpoints. Zero reliance on `app.listen()`, `0.0.0.0`, or custom server processes.
* **Single Unified Application:** Citizens, Staff, and Administrators access the same website. Navigation links to staff and administrative portals are hidden from citizens.
* **Strict Role-Based Authorization:**
  * Citizen attempts to authenticate through `/api/auth/internal-login` receive an explicit `403 Forbidden` (`RESTRICTED_ACCESS`).
  * Backend derives roles directly from verified database records—never trusting client-supplied parameters.
* **Double-Booking Prevention:** Server-side slot locking validates counter desk availability at the moment of booking to prevent race conditions.
* **Real-Time Telemetry & Token Calling:** Desk tokens (e.g., `A-092`, `A-104`) with dynamic wait time computation based on counter processing rates, accompanied by audible announcements and visual pulsing alerts.
* **GovGuide AI:** Powered by **Google Gemini API** (`@google/genai`) on the server. The client never accesses Gemini credentials. In case of network interruptions, it falls back to grounded service catalog data with statutory compliance disclaimers.
* **Immutable Audit Trail:** Sensitive actions (`LOGIN`, `INTERNAL_LOGIN`, `ROLE_CHANGED`, `SERVICE_CREATED`, `APPOINTMENT_CREATED`, `QUEUE_TOKEN_CALLED`, etc.) are captured with user metadata and timestamp.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Lucide Icons |
| **Backend** | Vercel Serverless Functions (`api/*`), TypeScript, Node.js HTTP runtime |
| **Authentication** | HTTP-only Lax Secure Cookies, `jose` (JWT), `bcryptjs` password hashing, `zod` validation |
| **Database** | Supabase PostgreSQL (`@supabase/supabase-js`) with complete SQL migrations + resilient local fallback |
| **AI Integration** | Google Gemini (`@google/genai`), contextual catalog retrieval, structured JSON outputs |
| **Deployment** | Native Vercel build (`npm run build` &rarr; `dist/` + `api/`) with clean SPA rewrites in `vercel.json` |

---

## 📁 Repository Structure

```text
/
├── api/                             # Vercel Serverless API Functions
│   ├── auth/
│   │   ├── login.ts                 # Citizen sign-in
│   │   ├── internal-login.ts        # Restricted staff/admin personnel sign-in (403 for citizens)
│   │   ├── logout.ts                # Session termination & cookie clear
│   │   ├── me.ts                    # Session state inspection
│   │   └── register.ts              # Citizen registration
│   ├── ai/
│   │   └── guide.ts                 # GovGuide AI Gemini consultation endpoint
│   ├── services/
│   │   └── index.ts                 # Public listing & Admin CRUD for services
│   ├── centers/
│   │   └── index.ts                 # Public listing & Admin CRUD for centers
│   ├── appointments/
│   │   └── index.ts                 # Appointment scheduling & anti-double booking
│   ├── queues/
│   │   └── index.ts                 # Live queue telemetry, token generation, and desk calls
│   ├── notifications/
│   │   └── index.ts                 # Citizen alerts & unread tracking
│   ├── admin/
│   │   ├── analytics.ts             # Aggregated platform telemetry & charts
│   │   ├── users.ts                 # User search & audited role modification
│   │   ├── staff.ts                 # Desk operator assignments
│   │   └── audit-logs.ts            # Immutable security audit trail
│   └── lib/
│       ├── auth.ts                  # JWT signing, verification, and role guards
│       ├── db.ts                    # Supabase database manager with in-memory seed fallback
│       ├── gemini.ts                # Gemini AI grounding and domain fallback
│       └── http.ts                  # Standardized request normalization and responses
│
├── src/                             # React Client Single Page Application
│   ├── components/                  # ProtectedRoute, UI widgets
│   ├── context/                     # AuthContext, ToastContext
│   ├── layouts/
│   │   ├── PublicLayout.tsx         # Citizen public header & footer
│   │   ├── CitizenLayout.tsx        # Citizen sidebar (NO internal/staff/admin links!)
│   │   ├── StaffLayout.tsx          # Desk operator console layout
│   │   └── AdminLayout.tsx          # Chief administrator portal layout
│   ├── pages/
│   │   ├── LandingPage.tsx          # Citizen homepage & search
│   │   ├── LoginPage.tsx            # Citizen login
│   │   ├── RegisterPage.tsx         # Citizen registration
│   │   ├── CitizenDashboardPage.tsx # Upcoming appointment & live token card
│   │   ├── ServicesPage.tsx         # Services catalog directory
│   │   ├── ServiceDetailPage.tsx    # Interactive document checklist & center list
│   │   ├── BookAppointmentPage.tsx  # 5-step scheduling wizard
│   │   ├── AppointmentsPage.tsx     # Citizen appointments history & cancellation
│   │   ├── AppointmentDetailPage.tsx# Digital pass with QR preview
│   │   ├── LiveQueuePage.tsx        # Real-time token caller and virtual queue join
│   │   ├── NotificationsPage.tsx    # Notifications center
│   │   ├── GovGuidePage.tsx         # Interactive Gemini chat interface
│   │   ├── ProfilePage.tsx          # Citizen identity & credentials
│   │   ├── InternalPortalPage.tsx   # Restricted personnel login (/internal)
│   │   ├── staff/                   # Staff dashboard, queue controls, appointments
│   │   └── admin/                   # Analytics, services, centers, staff, users, audit logs
│   ├── services/
│   │   └── api.ts                   # Strongly typed fetch client
│   ├── App.tsx                      # Client router configuration
│   ├── main.tsx                     # React entry point
│   └── index.css                    # GovTech styling system & scrollbars
│
├── shared/                          # Universal Types, Constants, and Zod Schemas
│   ├── types.ts                     # TypeScript data interfaces
│   ├── schemas.ts                   # Zod request validation schemas
│   └── constants.ts                 # Demo users, departments, categories, and slots
│
├── supabase/                        # Database Migrations & Seeds
│   ├── schema.sql                   # Full PostgreSQL schema, constraints, and indexes
│   └── seed.sql                     # Indian public administration demo seed data
│
├── index.html                       # HTML5 template with SEO metadata
├── package.json                     # Project scripts and dependencies
├── tsconfig.json                    # TypeScript compiler options & aliases
├── vite.config.ts                   # Vite configuration with local API serverless runner
├── vercel.json                      # Vercel deployment routing (SPA rewrite without breaking /api/*)
├── .env.example                     # Environment variables specification
└── README.md                        # Documentation
```

---

## 🔐 Credentials & Demo Accounts

For hackathon evaluation and demonstration, the platform includes pre-configured demo credentials. Use the one-click autofill buttons available directly on the login pages:

| Role | Email | Password | Primary Portal URL | Access Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@govqueue.demo` | `DemoPassword123!` | `/login` | Public catalog, booking, live queue pass, GovGuide AI |
| **Staff** | `staff@govqueue.demo` | `DemoPassword123!` | `/internal` | Counter Desk 04, Call Next, Recall, Complete, No-Show |
| **Admin** | `admin@govqueue.demo` | `DemoPassword123!` | `/internal` | Global analytics, service CRUD, centers, roles, audit logs |

> ⚠️ **Note on Role Enforcement:** If `citizen@govqueue.demo` attempts to log in via `/internal`, the backend returns `403 Forbidden` with the message:  
> *"Restricted Access: Citizen accounts must use the citizen portal."*

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies

```bash
git clone <repository-url>
cd govqueue-ai
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Set your configuration values:

```env
# Google Gemini API Key (Server-only!)
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase PostgreSQL Database (Optional for local zero-config evaluation)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
SUPABASE_JWKS_URL=https://[project-ref].supabase.co/rest/v1/rpc

# Security & Session Secrets
JWT_SECRET=govqueue-super-secret-key-change-in-production-min-32-chars
APP_URL=http://localhost:5173
NODE_ENV=development
```

*(Note: The server-side database adapter automatically operates with local persistence and full Indian public service seed data if Supabase keys are not yet configured!)*

### 3. Start Local Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The Vite dev server includes a native serverless runner plugin that serves `/api/*` routes without requiring an Express server!

### 4. Build for Production

```bash
npm run build
```

This validates all TypeScript types with `tsc` and compiles the bundle into `dist/`.

---

## ☁️ Vercel Deployment

Deploy directly using the Vercel CLI or via GitHub integration:

```bash
npx vercel
```

### Vercel Configuration (`vercel.json`)
The application is pre-configured for Vercel:
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/api/:match*",
      "destination": "/api/:match*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```
* `/api/*` calls are routed natively to the TypeScript serverless functions in `api/`.
* All client-side React Router paths (e.g. `/services`, `/internal`, `/staff`, `/admin/analytics`) fall back to `/index.html` without returning 404 errors.

### Vercel Environment Variables to Set:
In your Vercel Project Dashboard &rarr; **Settings** &rarr; **Environment Variables**, add:
* `GEMINI_API_KEY` (Required for live Gemini AI responses)
* `JWT_SECRET` (Minimum 32 character cryptographic string)
* `SUPABASE_URL` (Your Supabase project URL)
* `SUPABASE_SECRET_KEY` (Your Supabase service role key)
* `NODE_ENV` (`production`)

---

## 🗄️ Supabase PostgreSQL Setup

To connect to your own Supabase cloud database:
1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Copy and run [`supabase/schema.sql`](file:///c:/Users/varsh/OneDrive/Desktop/Build%20to%20Ship/supabase/schema.sql) to create tables and indexes.
4. Copy and run [`supabase/seed.sql`](file:///c:/Users/varsh/OneDrive/Desktop/Build%20to%20Ship/supabase/seed.sql) to load initial services and centers.
5. Add your `SUPABASE_URL` and `SUPABASE_SECRET_KEY` to your environment variables.

---

## 🤖 GovGuide AI Safety & Compliance

* **Server-Only Credentials:** `GEMINI_API_KEY` is loaded only inside `api/ai/guide.ts` via `process.env`. It is never bundled into frontend assets or exposed via `VITE_*` variables.
* **Service Grounding:** Every question is contextualized with the application's actual service catalog (departments, durations, and required documents) before querying Gemini.
* **Grounded Fallback:** If Gemini is unreachable or no API key is supplied, GovGuide AI utilizes a rule-based domain parser to provide structured checklists from verified local records.
* **Compliance Notice:** Every response includes:  
  *"Please verify current requirements with the relevant government department."*

---

## 🛡️ Security Audit Checklist

- [x] Passwords hashed with `bcryptjs` (salt rounds: 10)
- [x] Session tokens managed via `httpOnly`, `sameSite: "lax"`, and `secure` cookies
- [x] Passwords (`password_hash`) stripped from all API outputs
- [x] Server-side double booking prevention via slot collision verification
- [x] Zero client-side role trust (actual role derived server-side from database)
- [x] Protected internal personnel route `/internal` hidden from public citizen navigation
- [x] Citizen accounts blocked with `403 Forbidden` from personnel login
- [x] Immutable audit trail for role adjustments and sensitive operations
- [x] Strict input schema validation powered by `zod`
- [x] No Express server dependencies or `app.listen()` calls

---

## 📜 License & Acknowledgments

Created for the **Build to Ship — AI Engineering Program** Hackathon.  
Built to deliver accessible, efficient, and crowd-free public services across India.
