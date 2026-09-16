# FinFlow — Society Accounting & Financial Management System

An auditable, event-driven, full-stack financial management and accounting system designed for societies, associations, and clubs.

FinFlow combines enterprise accounting principles with modern software engineering to manage financial activities with strict role-based governance, pre-event budgeting, real-time variance validation, transaction approval workflows, and financial intelligence dashboards.

---

##  Core Business Concept & Workflow

$$\text{PLAN} \longrightarrow \text{BUDGET} \longrightarrow \text{TRANSACTION} \longrightarrow \text{REVIEW} \longrightarrow \text{APPROVAL} \longrightarrow \text{ACCOUNTING} \longrightarrow \text{ANALYSIS} \longrightarrow \text{REPORTING}$$

1. **Event Planning & Categorized Budgeting**: Authorized users define estimated revenues and categorized expense budgets (Food, Transport, Venue, Equipment, Printing, etc.).
2. **Budget Baseline Approval**: Budgets undergo formal review and approval by the President before becoming the active tracking baseline.
3. **Transaction Submission**: Income and expense requests are submitted by Treasurers or Committee Members with supporting receipts.
4. **Variance & Impact Validation**: During transaction review, the system calculates real-time budget impacts:
   $$\text{Projected Spending} = \text{Previously Approved} + \text{New Expense}$$
   $$\text{Budget Variance} = \text{Approved Budget} - \text{Projected Spending}$$
5. **President Approval Workflow**: Pending transactions are reviewed with receipts and variance warnings. Over-budget expenses require explicit justification for override.
6. **Authoritative Accounting**: Only approved/posted transactions affect balances, event profit/loss, and financial reports.
7. **Complete Audit Trail**: Immutable logging of every critical action, state transition, and role change.

---

##  Architecture & Technology Stack

| Component | Technology | Description |
|---|---|---|
| **Frontend** | Next.js 15+ (App Router), React, TypeScript | Modern server/client architecture with typed components |
| **Styling & UI** | Tailwind CSS, Lucide Icons | Responsive modern design system and financial status badges |
| **Visualizations** | Recharts | Financial dashboards, budget utilization, planned vs. actual charts |
| **Backend API** | NestJS (Node.js), TypeScript | Enterprise modular architecture (Controllers, Services, DTOs, Guards) |
| **Database** | Microsoft SQL Server | Relational integrity, `DECIMAL(18,2)` monetary precision, atomic transactions |
| **ORM** | Prisma ORM | Type-safe data modeling and schema migrations |
| **Auth & RBAC** | JWT & Bcrypt | Role-Based Access Control (`ADMIN`, `PRESIDENT`, `TREASURER`, `COMMITTEE_MEMBER`) |
| **Receipt Storage** | Cloudinary | Cloud-hosted receipt image and PDF document management |

---

##  Repository Structure

```text
FinFlow/
├── backend/                  # NestJS REST API + Prisma ORM
│   ├── src/
│   │   ├── app.module.ts     # Root application module
│   │   └── main.ts           # API entrypoint (port 5000, /api prefix, CORS, validation)
│   ├── .env.example          # Backend environment template
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                 # Next.js Web Application
│   ├── src/
│   │   ├── app/              # Next.js App Router (Layouts, Pages, Routes)
│   │   └── components/       # Reusable UI & Chart components
│   ├── .env.example          # Frontend environment template
│   ├── package.json
│   └── tsconfig.json
│
├── .gitignore                # Root gitignore excluding dependencies, build caches, and secrets
└── README.md                 # Project documentation
```

---

##  Getting Started

### Prerequisites

- **Node.js**: `v20.x` or higher
- **npm**: `v10.x` or higher

---


---

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Copy environment template
cp .env.example .env

# Start the NestJS development server
npm run start:dev
```

The backend REST API will be accessible at: `http://localhost:5000/api`

---

### 2. Frontend Setup

```bash
# In a new terminal window, navigate to frontend directory
cd frontend

# Copy environment template
cp .env.example .env.local

# Start the Next.js development server
npm run dev
```

The frontend web application will be accessible at: `http://localhost:3500` (or `http://localhost:3000`)

---

##  User Roles & Permissions

- **ADMIN**: User provisioning, role assignments, society configuration, audit log inspection.
- **PRESIDENT**: Financial review, budget approvals, transaction approvals/rejections, financial overview.
- **TREASURER**: Event creation, budget drafting/editing, income/expense submission, receipt uploads, financial reporting.
- **COMMITTEE_MEMBER**: Expense & income submission with receipts, event planning drafting, submission status tracking. *(Strictly prohibited from self-approvals).*

---

##  Branching & Contributing Strategy

All feature work follows the feature-branching standard:
- `development` : Main integration branch
- `feature/<phase-or-feature-name>` : Isolated feature development

