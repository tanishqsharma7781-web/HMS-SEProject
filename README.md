# Hostel Management System (HMS)

> An enterprise-grade, responsive, full-stack web application designed to digitize and streamline institutional campus residence operations. Engineered with **Django REST Framework**, **React.js**, **PostgreSQL**, **Tailwind CSS**, and **JWT Authentication**.

---

## 1. Project Overview & Architecture

Hostel Management System (HMS) provides a centralized, role-segregated platform for academic institutions. The system supports four distinct user roles with strict Role-Based Access Control (RBAC):
1. **Administrator**: Global hostel control, capacity planning, student/staff onboarding, fee structures, notices, and analytics.
2. **Warden**: Daily hostel operations, block jurisdiction, roll call attendance, room allocations, complaint resolutions, and visitor tracking.
3. **Student / Resident**: Room view, fee invoices & instant demo payment gateway, daily 4-meal food menu, maintenance complaints filing with audit trail, and campus announcements.
4. **Security Staff**: Gate check-in/out, visitor entry pass issuance with ID proof verification, active visitor tracking, and departure logging.

```
┌─────────────────────────────────────────────────────────────┐
│                   React.js Frontend                         │
│   (Vite, Tailwind CSS, Lucide React, Recharts, Axios)       │
└──────────────────────────────┬──────────────────────────────┘
                               │  REST API (JSON / JWT)
┌──────────────────────────────▼──────────────────────────────┐
│             Python Django REST Framework Backend            │
│   ┌───────────────┬─────────────────┬───────────────────┐   │
│   │ users (Auth)  │ hostels (Rooms) │ fees (Payments)   │   │
│   ├───────────────┼─────────────────┼───────────────────┤   │
│   │ complaints    │ food_menu       │ visitors          │   │
│   ├───────────────┼─────────────────┼───────────────────┤   │
│   │ attendance    │ notices         │ analytics         │   │
│   └───────────────┴─────────────────┴───────────────────┘   │
└──────────────────────────────┬──────────────────────────────┘
                               │  SQL / ORM
┌──────────────────────────────▼──────────────────────────────┐
│                    PostgreSQL Database                      │
│                  (18 Normalized Tables)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React Icons, Recharts Data Visualizations, Axios HTTP Client, React Router v6.
- **Backend**: Python 3.11+, Django 5.2, Django REST Framework (DRF), `djangorestframework-simplejwt` (JWT Auth), `django-cors-headers`.
- **Database**: PostgreSQL 18 (with graceful SQLite fallback option).
- **Authentication**: Stateless JSON Web Tokens (`Bearer` Authorization Header) with automatic access token renewal.

---

## 3. Pre-Configured Demo Accounts

For demonstration and testing, use the following credentials (or use the **One-Click Quick Login** buttons on the login page):

| Role | Username | Password | Purpose & Access Scope |
|---|---|---|---|
| **Administrator** | `admin` | `adminpassword123` | Full system control, reports, wardens, settings, global stats |
| **Warden** | `warden.sharma` | `wardenpassword123` | Boys Block A jurisdiction, room allocation, attendance, complaints |
| **Warden** | `warden.patel` | `wardenpassword123` | Girls Block B jurisdiction, room allocation, attendance, complaints |
| **Security Staff** | `security.singh` | `securitypassword123` | Gate 1 pass issuance, active visitors check-in and departures |
| **Student** | `student.aarav` | `studentpassword123` | Room A-101 (Paid fee, active complaint in progress) |
| **Student** | `student.kabir` | `studentpassword123` | Room A-102 (**Pending Fee** - ideal for testing online checkout) |
| **Student** | `student.arjun` | `studentpassword123` | **Unallocated** - ideal for testing room allocation flow |

---

## 4. Database Schema (18 Normalized Tables)

1. `users_user`: Custom User model extending `AbstractUser` with `role` (`ADMIN`, `WARDEN`, `STUDENT`, `SECURITY`), phone, and avatar.
2. `users_studentprofile`: OneToOne with User, unique `student_id`, department, course, year, parent details, emergency contact.
3. `users_wardenprofile`: OneToOne with User, unique `employee_id`, qualification, assigned Block FK.
4. `users_securityprofile`: OneToOne with User, unique `employee_id`, shift (Day/Night/Rotating), gate number.
5. `hostels_hostel`: Hostel campus information, warden in charge.
6. `hostels_block`: Residential block, gender type (`BOYS`, `GIRLS`, `COED`), total rooms.
7. `hostels_room`: Room number, floor, room type (`SINGLE`, `DOUBLE`, `TRIPLE`, `QUAD`), capacity, semester fee, active status.
8. `hostels_roomallocation`: Student allocation to room and bed, capacity validation (preventing over-capacity and double-allocations).
9. `fees_fee`: Student fee invoice (Composite, Hostel, Mess, Maintenance), amount, due date, status (`PENDING`, `PARTIAL`, `PAID`).
10. `fees_payment`: Transaction record, receipt number, payment mode, amount, verification status.
11. `attendance_attendance`: Daily roll call per student, date, status (`PRESENT`, `ABSENT`, `ON_LEAVE`), marked by warden.
12. `visitors_visitor`: Guest pass record, phone, ID proof, student visited, entry time, exit time, status (`INSIDE`, `EXITED`).
13. `complaints_complaint`: Student maintenance complaint, category, priority, status lifecycle, resolution remarks.
14. `complaints_complaintassignment`: Complaint audit trail and warden dispatch history.
15. `food_menu_foodmenu`: Daily food schedule date, day of week, publish status toggle.
16. `food_menu_foodmenuitem`: 4 meal items per day (`BREAKFAST`, `LUNCH`, `SNACKS`, `DINNER`), service timings, special dish highlight.
17. `notices_notice`: Campus announcements, target audience (`ALL`, `STUDENT`, `WARDEN`, `SECURITY`), priority level.
18. `notices_notification`: User-specific notification alerts.

---

## 5. REST API Endpoints Reference

### Authentication & Users
- `POST /api/auth/login/` - Login with credentials, returns JWT tokens and user payload
- `POST /api/auth/refresh/` - Refresh expired access token
- `GET /api/auth/me/` - Retrieve authenticated user profile and room allocation
- `PUT /api/auth/profile/` - Update profile safe fields
- `POST /api/auth/change-password/` - Update password
- `GET/POST /api/users/students/` - Student CRUD (Admin & Warden)
- `GET/POST /api/users/wardens/` - Warden CRUD (Admin only)
- `GET/POST /api/users/security/` - Security staff CRUD (Admin only)
- `POST /api/users/accounts/{id}/toggle_active/` - Deactivate/Reactivate account

### Hostels & Rooms
- `GET/POST /api/hostels/hostels/` - Hostels management
- `GET/POST /api/hostels/blocks/` - Residential blocks
- `GET/POST /api/hostels/rooms/` - Rooms listing (filters: `block`, `floor`, `vacant=true`)
- `GET/POST /api/hostels/allocations/` - Student bed allocation
- `POST /api/hostels/allocations/{id}/vacate/` - Vacate student allocation
- `GET /api/hostels/allocations/my_room/` - Student's room and roommates endpoint

### Fees & Payments
- `GET/POST /api/fees/records/` - Student fee invoices (filters by status and term)
- `GET /api/fees/records/summary/` - Billed, collected, and pending totals
- `POST /api/fees/payments/checkout/` - Demo online payment processing and receipt generation
- `GET /api/fees/payments/` - Verified transaction receipts archive

### Food Menu
- `GET/POST /api/food-menu/` - Food menu list & creation (nested 4 meals)
- `GET /api/food-menu/today/` - Today's published mess menu
- `GET /api/food-menu/upcoming/` - Next 7 days scheduled menus
- `POST /api/food-menu/{id}/toggle_publish/` - Toggle published/draft state

### Complaints
- `GET/POST /api/complaints/` - List/File complaints (students see own, staff see all)
- `PATCH /api/complaints/{id}/` - Update status, assign warden, record resolution notes
- `GET /api/complaints/stats/` - Status counts and category breakdown

### Attendance
- `GET /api/attendance/` - Attendance logs by date
- `POST /api/attendance/bulk_mark/` - Save daily roll call sheet
- `GET /api/attendance/stats/` - Daily turnout percentages

### Visitors
- `GET/POST /api/visitors/` - Register visitor pass & view logs
- `POST /api/visitors/{id}/mark_exit/` - Record departure timestamp
- `GET /api/visitors/stats/` - Active inside count and daily entries

### Analytics & Reports
- `GET /api/analytics/admin-dashboard/` - High-level metrics, charts data
- `GET /api/analytics/warden-dashboard/` - Block jurisdiction stats
- `GET /api/analytics/security-dashboard/` - Live gate activity
- `GET /api/analytics/reports/?type={students|occupancy|fees|complaints|attendance}` - Institutional reports

---

## 6. Installation & Setup Instructions

### Prerequisites
- Python 3.11+
- Node.js v18+ and npm
- PostgreSQL 14+ (running on port 5432)

### Step 1: Clone or Open Project Directory
```powershell
cd HMS-SEProject
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `backend/.env`:
```powershell
cp .env.example backend/.env
```
Ensure your PostgreSQL credentials match in `backend/.env`:
```env
SECRET_KEY=django-insecure-hms-secret-key-super-secure-production-2026
DEBUG=True
DB_ENGINE=postgresql
DB_NAME=hms_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=127.0.0.1
DB_PORT=5432
```

### Step 3: Backend Setup
```powershell
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
.\venv\Scripts\python.exe manage.py migrate
.\venv\Scripts\python.exe manage.py seed_data
```

### Step 4: Frontend Setup
```powershell
cd ../frontend
npm install
npm run build
```

---

## 7. Running the Application

### One-Click Startup Scripts (Windows)
- Double click `run_backend.bat` to launch Django on `http://127.0.0.1:8000`
- Double click `run_frontend.bat` to launch Vite React on `http://localhost:5173`

### Manual Terminal Commands
**Terminal 1 (Backend):**
```powershell
cd backend
.\venv\Scripts\python.exe manage.py runserver 0.0.0.0:8000
```

**Terminal 2 (Frontend):**
```powershell
cd frontend
npm run dev
```

Open your browser at: **`http://localhost:5173`**

---

## 8. Running the Automated Test Suite

Run the full functional, security, and integration test suite:
```powershell
cd backend
.\venv\Scripts\python.exe manage.py test
```
**Test Suite Coverage Highlights:**
- `Functional`: Valid/invalid authentication, student registration, room allocations, food menus, complaints, fee billing.
- `Security`: Non-admin access prevention, student data segregation, unauthorized account modification blocking.
- `Integration`: Room capacity limits enforcement, real-time fee balance updates upon checkout, complaint audit trail.

---

## 9. Academic Demonstration Workflow

1. **Admin Demonstration (`admin` / `adminpassword123`)**:
   - Inspect the Executive Dashboard with live charts (occupancy by block and complaint categories).
   - Navigate to **Hostels & Rooms** and **Room Allocation** to see live vacancy tracking.
   - Open **Food Menu** to view or schedule 4-meal daily menus and toggle the publish switch.
   - View **Reports** and test exporting data as CSV or printing.
2. **Warden Demonstration (`warden.sharma` / `wardenpassword123`)**:
   - Inspect managed block metrics (Block A).
   - Open **Attendance** to take roll call with 1-click "Mark All Present".
   - Open **Complaints** to assign technicians and update complaint status.
3. **Student Demonstration (`student.kabir` / `studentpassword123`)**:
   - View allocated room details and roommates.
   - View **Food Menu** with timings and special items.
   - Navigate to **Fee Details** and click **Pay Online** to experience the demonstration checkout flow with immediate receipt generation.
   - Submit a new complaint under **My Complaints** and observe real-time status progression.
4. **Security Staff Demonstration (`security.singh` / `securitypassword123`)**:
   - View the active gate dashboard.
   - Click **Register Visitor** to issue an entry pass.
   - Navigate to **Visitor Entry/Exit** and click **Log Exit** to record departure.
