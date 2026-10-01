# FinFlow — Financial Management Prototype

FinFlow is a full-stack financial management prototype for university societies and clubs. It provides an event-centric foundation for organizing budgets, submitting income and expense transactions, reviewing financial requests, and presenting financial summaries through responsive web interfaces.

The project demonstrates a typed Next.js and NestJS architecture, JWT-based authentication, role-aware backend authorization, relational financial data modeling, and Supabase PostgreSQL persistence through Prisma ORM. FinFlow is actively evolving; advanced accounting, automation, and end-to-end integration capabilities are identified separately below rather than presented as complete.

---

## Project Overview

The current prototype models and supports:

- Users and the `ADMIN`, `PRESIDENT`, `TREASURER`, and `COMMITTEE_MEMBER` roles
- Society events, budget categories, and event-specific budget items
- Income and expense transaction submission
- President-restricted transaction approval, rejection, and revision requests
- Financial-report and audit-log data models
- Financial summary, reporting, chart, and audit-log interface foundations
- Responsive pages for authentication, dashboards, events, transactions, approvals, reports, and audit logs
- Fixed-decimal monetary fields using `Decimal(18,2)`
- Supabase PostgreSQL configuration through Prisma ORM

The backend includes database-aware services alongside in-memory fallback data, while several frontend views still use sample or partially integrated data. This keeps the prototype demonstrable as database and UI integration continues.

---

## Workflow

### Current Prototype Workflow

```text
Authenticate → Create Event/Budget Data → Submit Transaction → President Review → Approved-Transaction Reporting
```

- Users register or sign in and receive a JWT for authenticated API access.
- The prototype can create event records, while the Prisma schema models the categorized budget structures linked to those events.
- Authenticated users can submit income or expense transactions against an event, optionally linking a budget item.
- President-only endpoints approve, reject, or request revisions to submitted transactions.
- The reporting service summarizes approved income and expense transactions, with fallback values still used in parts of the prototype.

### Planned Workflow

```text
Budget Baseline Approval → Automated Variance Validation → Persistent Receipt Storage → Complete Audit Integration → Formal Ledger Support
```

These stages describe the intended progression of FinFlow and are not yet complete end to end.

---

## Architecture and Technology Stack

| Layer | Technology | Current Use |
|---|---|---|
| Frontend | Next.js 16, React 19, TypeScript | App Router pages, typed components, authentication context, and responsive financial interfaces |
| Styling | Tailwind CSS 4 | Responsive layouts, status indicators, forms, tables, and dashboards |
| Visualizations | Recharts | Chart components for financial and budget views |
| Backend API | NestJS, Node.js, TypeScript | Modular REST API with controllers, services, DTO validation, and guards |
| Database | Supabase PostgreSQL | Relational persistence configured through Prisma connection variables |
| ORM | Prisma ORM | Schema modeling, generated client access, and database queries |
| Authentication | JWT, Bcrypt | Bearer-token authentication and password hashing |
| Authorization | NestJS role guards | Route-level role restrictions, including President-only transaction decisions |

### Data Model

The Prisma schema currently defines:

- `User`
- `Event`
- `BudgetCategory`
- `BudgetItem`
- `Transaction`
- `FinancialReport`
- `AuditLog`

Monetary values—including event totals, budget allocations, transaction amounts, and report totals—use PostgreSQL `Decimal(18,2)` fields.

### Authentication and Authorization

- Registration hashes passwords with Bcrypt.
- Login issues JWT access tokens.
- Protected routes use a NestJS JWT guard.
- Role-restricted routes use a dedicated NestJS roles guard and role metadata.
- Transaction approval, rejection, and revision-request endpoints are restricted to the `PRESIDENT` role.

### Receipt Upload Foundation

The API includes a multipart receipt-upload endpoint and a `CloudinaryService` abstraction. The current service is a placeholder that constructs a Cloudinary-style URL but does not persist the uploaded file. Real Cloudinary upload streaming and durable receipt storage remain planned work.

### Audit Foundation

FinFlow includes an `AuditLog` Prisma model, audit service and controller, role-protected retrieval, and an audit-log frontend page. Workflow-wide persistent audit recording is incomplete because every event, transaction, authentication, and approval action is not yet connected to the audit service.

---

## Capabilities Under Development

The following capabilities are planned or partially scaffolded and should not be considered complete:

- Automated budget-variance calculation and enforcement
- President approval of event budget baselines
- Persistent Cloudinary receipt uploads
- Complete audit logging for every workflow action
- Formal accounting-ledger or double-entry accounting support
- Fully data-driven frontend dashboards and reports
- Multi-society support

---

## Repository Structure

```text
FinFlow/
├── backend/
│   ├── api/                  # Serverless API entrypoint
│   ├── prisma/
│   │   ├── schema.prisma    # PostgreSQL data model
│   │   └── seed.ts          # Seed data
│   ├── src/
│   │   ├── auth/            # JWT authentication and role guards
│   │   ├── events/          # Event endpoints and services
│   │   ├── transactions/    # Submission and President review endpoints
│   │   ├── reports/         # Approved-transaction summaries
│   │   ├── audit/           # Audit-log retrieval and recording foundation
│   │   ├── upload/          # Receipt-upload placeholder service
│   │   ├── prisma/          # Prisma service and connection lifecycle
│   │   └── main.ts          # NestJS bootstrap and `/api` prefix
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Navigation, modals, metrics, and charts
│   │   ├── context/         # Authentication and toast state
│   │   └── utils/           # Supabase client utilities
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm 10 or later
- A PostgreSQL database, such as a Supabase PostgreSQL project

### 1. Configure and Run the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configure these backend environment variables before starting the API:

| Variable | Purpose |
|---|---|
| `PORT` | API port; use `5000` for the documented local setup |
| `DATABASE_URL` | PostgreSQL connection string used by Prisma; a pooled Supabase connection may be used |
| `DIRECT_URL` | Direct PostgreSQL connection required by the Prisma datasource, typically the direct Supabase database URL |
| `JWT_SECRET` | Secret used to sign and verify access tokens; replace the example value outside local development |
| `FRONTEND_URL` | Frontend origin retained for environment configuration |

Then generate the Prisma client and start the NestJS development server:

```bash
npx prisma generate
npm run start:dev
```

The backend is available at:

```text
http://localhost:5000/api
```

Database connectivity is required for persistent records. Some services intentionally fall back to in-memory prototype data when the database is unavailable.

JWT signing uses `JWT_SECRET`. The current authentication module sets access-token expiry to seven days in code; the `JWT_EXPIRES_IN` value shown in the example environment file is not yet read by the module.

### 2. Configure and Run the Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local` with the local backend URL:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

The repository also contains Supabase browser/server client utilities. If those utilities are used in the active frontend flow, provide:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Start the frontend:

```bash
npm run dev
```

The development script explicitly starts Next.js at:

```text
http://localhost:3500
```

### Optional Future Cloudinary Configuration

Cloudinary credentials are reserved for the planned persistent receipt-upload integration. The checked-in service does not yet perform a real upload, so adding credentials alone does not enable durable receipt storage.

Never commit database credentials, JWT secrets, or third-party API secrets.

---

## Roles and Permissions

- **ADMIN**: Recognized by the RBAC model; broader user and society administration is planned.
- **PRESIDENT**: Can approve, reject, or request revisions to transactions.
- **TREASURER**: Can create events and submit transactions.
- **COMMITTEE_MEMBER**: Can submit income and expense transactions.

Only the role permissions described above are currently represented; broader society-administration features remain planned.

---

## Branching Strategy

The repository uses feature branches organized around implementation phases:

- `development` — primary integration branch
- `feature/<phase-or-feature-name>` — isolated feature development
- `fix/<issue-name>` — targeted corrections and stabilization

Keep changes focused, avoid committing secrets, and validate both frontend and backend builds before merging.
