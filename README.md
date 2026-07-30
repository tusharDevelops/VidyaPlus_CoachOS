# CoachOS: Premium Coaching Institute Management Platform

An enterprise-grade, multi-tenant SaaS tailored for modern coaching hubs. CoachOS streamlines the entire operational lifecycle—from student enrollment and batch scheduling to fee collection and granular staff delegation—all wrapped in a premium, Mintlify-inspired design system.

---

## 🎨 Design Philosophy: "The Mintlify Standard"

CoachOS is built with a focus on developer-grade information density and cinematic aesthetics:
- **Mintlify Aesthetic**: High-contrast typography (Inter & Geist Mono) with a vibrant `#00D4A4` brand palette.
- **Atmospheric UI**: Cinematic hero sections and glassmorphism-inspired card components.
- **Tailwind CSS v4**: Leveraging the latest CSS-first engine for maximum performance and design flexibility.
- **Dark Mode**: Native support with preference persistence and high-contrast accessibility.

---

## 🚀 Core Modules

### 👥 Student & Academic Management
- **Smart Enrollment**: Auto-generated institute-scoped student codes (VP-YY-NNNN).
- **Batch Engine**: Advanced scheduling with conflict detection for teachers and classrooms.
- **Academic Context**: Full lifecycle tracking from enrollment to alumni status.

### 📅 Attendance System
- **Real-time Marking**:  Attendance marking (Present, Absent, Late) with 24-hour locking logic.
- **Visual Analytics**: Interactive heatmap calendars and 30-day attendance summaries for every student.

### 💸 Fee Collection Engine
- **Automated Dues**: Period-based generation (monthly, quarterly, course-wide) from flexible fee plans.
- **Payment Ledger**: Multi-mode recording (UPI, Cash, Bank) with auto-generated printable receipts.
- **Financial Dashboard**: Live KPIs for collection summary, outstanding dues, and overdue alerts.

### 🛡️ Delegation & Roles
- **Granular Permissions**: 18+ specific permissions (e.g., `fees.collect`, `attendance.mark`) for precise control.
- **Custom Admin Roles**: Create specific roles like "Front Desk", "Accountant", or "Senior Teacher" with scoped UI access.
- **Payroll Management**: Integrated staff salary tracking and payment history.

### 🔔 Notification Hub
- **Automated Alerts**: In-app notifications for fee reminders, student absence, and system updates.
- **Live Updates**: Real-time unread counts and filterable notification lists.

---

## 🛠️ Technical Stack

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Frontend**: Vite + React + TypeScript + Zustand
- **Backend**: Express + Prisma + TypeScript
- **Database**: Neon PostgreSQL (Multi-tenant row-level isolation)
- **Styling**: Tailwind CSS v4 + Mintlify Design System
- **Authentication**: JWT (Access + Refresh tokens) with role-based routing

---

## 🔧 Installation & Setup

1. **Clone & Enter**:
   ```bash
   git clone <repository_url>
   cd Maneza2.0
   ```

2. **Environment Configuration**:
   Create an `.env` file in `apps/api/` and `apps/web/`:
   ```env
   # apps/api/.env
   DATABASE_URL="postgresql://user:password@hostname/dbname?sslmode=require"
   JWT_ACCESS_SECRET="your-secret"
   JWT_REFRESH_SECRET="your-secret"
   ```

3. **Install & Initialize**:
   ```bash
   npm install
   npm run db:generate --workspace=@coachOS/api
   npm run db:migrate --workspace=@coachOS/api
   ```

4. **Run Development Server**:
   ```bash
   npm run dev
   ```
   - **Institute Web**: http://localhost:5173
   - **Super Admin**: http://localhost:5174
   - **API Server**: http://localhost:3001

---

## 📄 Documentation

For detailed PRDs and business strategies, refer to the [docs/](file:///d:/Maneza2.0/docs) directory:
- `CoachOS_PRD_Part1.pdf`: Core Platform & Auth
- `CoachOS_PRD_Part2.pdf`: Operational Modules
- `CoachOS_PRD_Part3.pdf`: Advanced Features
- `Coachos Complete Business Strategy.pdf`: Pricing & Blueprint

---

*Built with ❤️ for the modern coaching ecosystem.*
