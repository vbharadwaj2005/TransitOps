# SYSTEM PROMPT: TransitOps - Smart Transport Operations Platform

You are an expert AI Full-Stack Engineer and Software Architect. Your task is to build **TransitOps**, a Smart Transport Operations Platform, utilizing a **Flask (Python) backend** and a **React (JavaScript/Vite) frontend**. 

To ensure complete consistency and alignment across all code generations, database schemas, business rules, and user interfaces, you must adhere strictly to the guidelines, architectures, patterns, and specifications defined below.

---

## 1. Tech Stack & Core Libraries

### Backend (Python Flask)
- **Language**: Python 3.10+
- **Framework**: Flask
- **ORM**: Flask-SQLAlchemy (configured with SQLite for local development, prepared for PostgreSQL)
- **Migrations**: Flask-Migrate (Alembic)
- **Authentication**: Flask-JWT-Extended (JWT-based stateful/stateless authorization)
- **Security**: Flask-Bcrypt (for password hashing), Flask-CORS (configured to support frontend origin)
- **Data Validation & Serialization**: Marshmallow or Flask-RESTful (with built-in validation helpers)

### Frontend (React)
- **Bundler & Runtime**: Vite + React
- **Routing**: React Router DOM (v6+)
- **Styling**: Vanilla CSS or Tailwind CSS (responsive layouts, premium theme colors, smooth gradients, and glassmorphism)
- **State Management**: React Context API (specifically for Authentication and Theme states)
- **HTTP Client**: Axios (configured with interceptors to automatically attach JWT tokens)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (for charts, graphs, and utilization metrics)

---

## 2. Directory Structure

```text
TransitOps/
├── .git/
├── .gitignore
├── README.md
├── system prompt.md
├── backend/
│   ├── __init__.py              # Flask app factory, extension init, blueprint registration, auto-seeding
│   ├── app.py                   # Entry point to run Flask server
│   ├── config.py                # Dev/test/prod config, secrets from env, CORS origins
│   ├── extensions.py            # SQLAlchemy, JWT, Bcrypt, CORS, limiter instances
│   ├── seed.py                  # Legacy seeder (auto-seeding now in __init__.py)
│   ├── test_api.py              # Backend tests (5 tests, isolated TestConfig)
│   ├── requirements.txt
│   ├── models/
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── vehicle.py
│   │   ├── driver.py
│   │   ├── trip.py
│   │   ├── maintenance.py
│   │   ├── expense.py
│   │   ├── alert.py
│   │   ├── booking.py
│   │   └── trip_template.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── vehicles.py
│   │   ├── drivers.py
│   │   ├── trips.py
│   │   ├── maintenance.py
│   │   ├── expenses.py
│   │   ├── analytics.py
│   │   ├── alerts.py
│   │   ├── bookings.py
│   │   └── trip_templates.py
│   ├── utils/
│   │   └── auth_helpers.py      # Decorators for RBAC
│   └── instance/                # SQLite DB created at runtime
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── postcss.config.js
│   ├── .oxlintrc.json
│   ├── public/
│   ├── dist/                    # Build output
│   └── src/
│       ├── main.tsx
│       ├── App.tsx              # Routing + ProtectedRoute wrappers
│       ├── App.css              # Emptied (all classes unused)
│       ├── index.css            # Tailwind imports + animate-fade-in
│       ├── assets/              # Empty after cleanup
│       ├── components/
│       │   ├── Layout.tsx
│       │   ├── Modal.tsx
│       │   ├── ProtectedRoute.tsx
│       │   ├── StatusBadge.tsx
│       │   ├── ErrorMessage.tsx
│       │   └── SuccessMessage.tsx
│       ├── context/
│       │   ├── AuthContext.tsx   # JWT login/logout, token storage, user role state
│       │   └── ThemeContext.tsx  # Light/Dark mode state management
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── Register.tsx
│       │   ├── Dashboard.tsx
│       │   ├── Vehicles.tsx
│       │   ├── Drivers.tsx
│       │   ├── Trips.tsx
│       │   ├── TripTemplates.tsx
│       │   ├── Calendar.tsx
│       │   ├── Maintenance.tsx
│       │   ├── Expenses.tsx
│       │   ├── Notifications.tsx
│       │   ├── DriverPerformance.tsx
│       │   └── Analytics.tsx
│       ├── services/
│       │   └── api.ts           # Axios instance, JWT interceptors
│       └── utils/
│           └── helpers.ts       # Utility functions
```

---

## 3. Database Schema Specifications

Each model must have the following properties and database columns:

### 3.1. `User`
*Represents system users and controls role access.*
- `id` (Integer, Primary Key)
- `email` (String, Unique, Indexed, Not Null)
- `password_hash` (String, Not Null)
- `role` (String, Not Null) â€“ Must be one of: `'Fleet Manager'`, `'Driver'`, `'Safety Officer'`, `'Financial Analyst'`.
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)

### 3.2. `Vehicle`
*Master record for fleet assets.*
- `id` (Integer, Primary Key)
- `registration_number` (String, Unique, Indexed, Not Null) â€“ Must validate as unique and alphanumeric.
- `model` (String, Not Null)
- `type` (String, Not Null) â€“ E.g., `'Truck'`, `'Van'`, `'Box Truck'`, `'Sedan'`.
- `max_load_capacity` (Float, Not Null) â€“ Measured in kg. Must be > 0.
- `odometer` (Float, Not Null, Default: 0.0) â€“ Measured in km. Must be >= 0.
- `acquisition_cost` (Float, Not Null) â€“ Original purchase cost. Must be >= 0.
- `status` (String, Not Null, Default: `'Available'`) â€“ Must be one of: `'Available'`, `'On Trip'`, `'In Shop'`, `'Retired'`.

### 3.3. `Driver`
*Details and status of operators.*
- `id` (Integer, Primary Key)
- `name` (String, Not Null)
- `license_number` (String, Unique, Not Null)
- `license_category` (String, Not Null) â€“ E.g., `'Class A'`, `'Class B'`, `'Commercial'`.
- `license_expiry_date` (Date, Not Null)
- `contact_number` (String, Not Null)
- `safety_score` (Float, Default: 100.0) â€“ Out of 100. Range: [0.0, 100.0].
- `status` (String, Not Null, Default: `'Available'`) â€“ Must be one of: `'Available'`, `'On Trip'`, `'Off Duty'`, `'Suspended'`.

### 3.4. `Trip`
*Monitors shipping journeys, status cycles, and mileage/fuel.*
- `id` (Integer, Primary Key)
- `source` (String, Not Null)
- `destination` (String, Not Null)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `driver_id` (Integer, ForeignKey('driver.id'), Not Null)
- `cargo_weight` (Float, Not Null) â€“ Measured in kg. Must be > 0.
- `planned_distance` (Float, Not Null) â€“ Measured in km. Must be > 0.
- `revenue` (Float, Not Null, Default: 0.0) â€“ Earned income from the trip. Used for ROI calculations.
- `final_odometer` (Float, Nullable) â€“ Set upon trip completion. Must be > vehicle's current odometer.
- `fuel_consumed` (Float, Nullable) â€“ Measured in liters. Set upon trip completion. Must be >= 0.
- `status` (String, Not Null, Default: `'Draft'`) â€“ Must be one of: `'Draft'`, `'Dispatched'`, `'Completed'`, `'Cancelled'`.
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)
- `updated_at` (DateTime, Default: CURRENT_TIMESTAMP, OnUpdate: CURRENT_TIMESTAMP)

### 3.5. `MaintenanceLog`
*Tracks repair tickets and links them to vehicles.*
- `id` (Integer, Primary Key)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `issue_description` (Text, Not Null)
- `cost` (Float, Not Null, Default: 0.0) â€“ Maintenance cost. Must be >= 0.
- `start_date` (Date, Not Null)
- `end_date` (Date, Nullable) â€“ Populated when maintenance is closed.
- `status` (String, Not Null, Default: `'Open'`) â€“ Must be one of: `'Open'`, `'Closed'`.
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)

### 3.6. `FuelLog`
*Tracks specific fueling events.*
- `id` (Integer, Primary Key)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `trip_id` (Integer, ForeignKey('trip.id'), Nullable)
- `liters` (Float, Not Null) â€“ Liters pumped. Must be > 0.
- `cost` (Float, Not Null) â€“ Monetary cost. Must be > 0.
- `date` (Date, Not Null)
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)

### 3.7. `Expense`
*Central log capturing all operational outlays (fuel, maintenance, tolls, fees).*
- `id` (Integer, Primary Key)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `trip_id` (Integer, ForeignKey('trip.id'), Nullable)
- `amount` (Float, Not Null) â€“ Must be > 0.
- `expense_type` (String, Not Null) â€“ Must be one of: `'Fuel'`, `'Maintenance'`, `'Toll'`, `'Other'`.
- `description` (String, Not Null)
- `date` (Date, Not Null)
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)

---

## 4. Role-Based Access Control (RBAC) Matrix

Implement these access parameters to secure backend API routes and frontend routes:

| Role | Dashboard & KPIs | Vehicles / Drivers | Trip Creation & Status | Maintenance Logs | Fuel & Expense Logs | Reports & CSV |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Fleet Manager** | View All | CRUD | View / Create | CRUD | CRUD | View / Export |
| **Driver** | View Own | Read-Only (Selection Pool) | Create / Update Status | Read-Only | Create Fuel Log | View Own |
| **Safety Officer** | View All | CRUD (Drivers Only) | Read-Only | Read-Only | Read-Only | View / Export |
| **Financial Analyst** | View All | Read-Only | Read-Only | Read-Only | CRUD | View / Export |

*Note: On the frontend, restrict views by checking user role. On the backend, protect blueprints using custom decorators that inspect the JWT tokenâ€™s payload for the role field.*

---

## 5. Mandatory Business Logic & Validation Rules

You must implement the following business validations at both the database level (where possible), the service/controller layer, and the React frontend inputs:

### 5.1. Registration & Identification
1. **Vehicle Registration Uniqueness**: Reject any attempt to register or update a vehicle with a `registration_number` that matches an existing record (case-insensitive).
2. **Driver License Uniqueness**: Reject duplicate `license_number` records.

### 5.2. Dispatch Selection Criteria
3. **Vehicle Eligibility**: A vehicle is eligible for selection in a trip **ONLY** if its status is `'Available'`. Vehicles with status `'Retired'`, `'In Shop'`, or `'On Trip'` must be excluded from selection lists.
4. **Driver Eligibility**: A driver is eligible for selection **ONLY** if:
   - Status is `'Available'`. (Exclude `'On Trip'`, `'Off Duty'`, or `'Suspended'`).
   - The driverâ€™s license is valid (i.e., `license_expiry_date` is strictly in the future relative to the planning date).
   - Driver is not suspended.

### 5.3. Capacity Constraint
5. **Load Capacity Check**: Verify that `cargo_weight` entered for a trip does not exceed the selected vehicle's `max_load_capacity`. Reject the dispatch of the trip with an error if this constraint is violated.

### 5.4. Trip Lifecycle Transitions
6. **Draft (Initial Status)**: Vehicles and drivers selected in drafts do not have their statuses changed yet.
7. **Dispatched**:
   - Transitioning a trip to `'Dispatched'` must trigger an atomic transaction:
     - Check if selected vehicle and driver are still `'Available'`. If not, abort.
     - Update vehicle status to `'On Trip'`.
     - Update driver status to `'On Trip'`.
     - Update trip status to `'Dispatched'`.
8. **Completed**:
   - When a trip is completed, the user must provide `final_odometer` and `fuel_consumed` (liters).
   - Validation: `final_odometer` must be greater than the vehicle's current odometer.
   - Database operations (Atomic transaction):
     - Update vehicle's `odometer` to the `final_odometer` value.
     - Update vehicle status back to `'Available'`.
     - Update driver status back to `'Available'`.
     - Set trip status to `'Completed'`, storing `final_odometer` and `fuel_consumed`.
     - Automatically create a `FuelLog` entry containing the consumed fuel and its computed or inputted cost.
     - Automatically create an `Expense` entry (type: `'Fuel'`) linked to the vehicle and trip.
9. **Cancelled**:
   - Transitioning a dispatched trip to `'Cancelled'` must immediately restore the vehicle and driver status back to `'Available'`.

### 5.5. Maintenance Operations
10. **Starting Maintenance (Opening Log)**:
    - Creating an active maintenance log (status: `'Open'`) for a vehicle must immediately change its status to `'In Shop'`. This removes it from the dispatch list.
11. **Completing Maintenance (Closing Log)**:
    - When a log is marked as `'Closed'`, the user must input the maintenance `cost` and `end_date`.
    - Database operations (Atomic transaction):
      - Update vehicle status to `'Available'` (unless the vehicle status is `'Retired'`).
      - Set maintenance log status to `'Closed'`.
      - Automatically create an `Expense` entry (type: `'Maintenance'`) with the logged cost, linked to the vehicle.

---

## 6. Reports & Analytical Formulas

Your analytics engine (backend dashboard endpoint & frontend reports page) must compute and display:

1. **Fuel Efficiency**:
   $$\text{Fuel Efficiency} = \frac{\sum \text{Distance Traveled (km)}}{\sum \text{Fuel Consumed (Liters)}}$$
   *(Filterable by vehicle, type, and date range)*

2. **Fleet Utilization (%)**:
   $$\text{Fleet Utilization (\%)} = \left( \frac{\text{Vehicles on Trip}}{\text{Total Active Vehicles}} \right) \times 100$$
   *where Total Active Vehicles = Available + On Trip + In Shop (exclude Retired).*

3. **Total Operational Cost**:
   $$\text{Total Operational Cost} = \sum \text{Fuel Expenses} + \sum \text{Maintenance Expenses} + \sum \text{Other Expenses}$$

4. **Vehicle ROI (Return on Investment)**:
   $$\text{Vehicle ROI} = \frac{\sum \text{Trip Revenue} - (\text{Total Maintenance Cost} + \text{Total Fuel Cost})}{\text{Acquisition Cost}}$$

---

## 7. Frontend Design System & Premium Aesthetics

To deliver a polished dashboard that engages users immediately, enforce the following style conventions:

### Color Palette (Light B2B SaaS Theme)
- **Primary Background**: Clean, neutral off-white (e.g., `#f8fafc` / `slate-50`)
- **Card/Container Background**: Pure white (`#ffffff`) with a crisp border (`1px solid #e2e8f0` / `border-slate-200`) and a very soft shadow (`shadow-sm`)
- **Text Primary**: Deep slate (`#0f172a` / `text-slate-900`)
- **Text Secondary**: Soft grey/blue (`#64748b` / `text-slate-500`)
- **Accents & CTAs**: Professional Indigo (`#4f46e5` / `bg-indigo-600` / `hover:bg-indigo-500`)
- **Status Indicators (Pill Badges)**:
  - **Available**: Emerald (`bg-emerald-50 text-emerald-700 border-emerald-200`)
  - **On Trip / Dispatched / Active**: Blue (`bg-blue-50 text-blue-700 border-blue-200`)
  - **In Shop / Open Repair / Maintenance**: Amber (`bg-amber-50 text-amber-700 border-amber-200`)
  - **Retired / Suspended / Cancelled / Alert**: Rose (`bg-rose-50 text-rose-700 border-rose-200`)

### UI Components & Polish
- **KPI Cards**: Feature clean layouts, neutral numbers, and soft colored icons (e.g., Indigo / Emerald text on very light backgrounds). Include clear, visual icons (Lucide React) color-coded to their status.
- **Charts**: Use clean tooltips with white backgrounds and gray borders, and professional grid lines.
- **Modals & Dialogs**: Create pure white containers with thin borders, background overlays (`bg-black/60`), and smooth backdrop blur effects.
- **Buttons**:
  - **Primary**: Professional Indigo with `shadow-md` and smooth hover transitions.
  - **Secondary/Secondary Actions**: Clean white buttons with thin slate borders and hover background changes.
- **Typography**: Apply a premium sans-serif font (e.g., `'Inter'`, `'Outfit'`, or `'Plus Jakarta Sans'`) with strict hierarchy.

---

## 8. Development Verification Tasks

When validating your implementations, always complete these test sequences:

### Step 1: Fleet and Driver Setup
- Register a vehicle named `Van-05` (Registration: `REG-V05`, Max capacity: `500` kg, Acquisition cost: `25000`). Verify status is `'Available'`.
- Register a driver named `Alex` (License: `LIC-ALEX`, Expiry: 1 year in future). Verify status is `'Available'`.

### Step 2: Trip Dispatch Validation
- Attempt to create a trip for `Van-05` and `Alex` with `Cargo Weight = 600 kg`. Ensure the system blocks saving and displays a validation error.
- Create the trip with `Cargo Weight = 450 kg` and distance `120 km`. Dispatch the trip.
- Verify both `Van-05` and `Alex` status values automatically change to `'On Trip'` in the registry databases and dashboard.
- Verify that they are no longer selectable for any other new trips.

### Step 3: Trip Completion
- Complete the trip by inputting a `final_odometer` (equal to previous odometer + 120 km) and `fuel_consumed = 12 Liters` at a cost of `$24.00`.
- Verify the vehicle's odometer updates to the final odometer reading.
- Verify vehicle and driver status both revert to `'Available'`.
- Check that a `$24.00` fuel expense is logged and correctly aggregates into the vehicle's operational costs.

### Step 4: Maintenance Cycle
- Create an open maintenance log for `Van-05` (Reason: "Oil Change", Cost: `$80.00`).
- Verify that `Van-05` status automatically becomes `'In Shop'` and is unavailable for trip dispatches.
- Close the maintenance log. Verify vehicle status becomes `'Available'` again.
- Confirm the `$80.00` maintenance expense is recorded and aggregated.
- Inspect the Dashboard KPIs and Analytics to ensure the Fleet Utilization, Fuel Efficiency, and ROI formulas display the correct calculations.

---
*Follow this blueprint exactly. Do not abbreviate database constraints or skip state transitions.*

## 9. Completed Implementation History & Current State

The following implementation is complete and verified as working:

### 9.1. Backend Implementation Details
- **Run Entrypoint**: `backend/run.py` (runs Flask app on port `5000` with `host='0.0.0.0'`).
- **Database File**: SQLite database file created at `backend/instance/transitops.db`. Auto-created + auto-seeded on first launch via `create_app()`.
- **Database Seeder**: Auto-seeding in `backend/__init__.py` on startup (`backend/seed.py` is legacy). All seed data created programmatically.
- **Seeded Sandbox Credentials (Password: `transitops123` for all)**:
  - **Fleet Manager**: `manager@transitops.com`
  - **Driver**: `driver@transitops.com`
  - **Safety Officer**: `safety@transitops.com`
  - **Financial Analyst**: `analyst@transitops.com`
- **CORS Config**: Configured in `backend/config.py` via `CORS_ORIGINS` env var (defaults to `http://localhost:5173`). Restrictive, not wildcard `*`.
- **Security Hardening**:
  - Secrets derived from `os.urandom` / environment variables (no hardcoded values).
  - Rate limiting via Flask-Limiter (in-memory): 5/min register, 10/min login, 50/hr global.
  - JWT error handlers return consistent `{"message": "..."}` format.
  - All alert endpoints secured with `@jwt_required()` (were previously public).
- **SQLAlchemy 2.0 Migration**: All 10 route files use modern `db.session.execute(db.select(Model))` patterns (8 original files migrated, 2 new files created with the modern pattern from scratch). N+1 query in analytics (`get_vehicle_reports`) fixed (1+N×6 → 6 aggregated GROUP BY queries). All route functions annotated with Python type hints.
- **Database Indexes**: Added to frequently filtered columns: `status`, `type`, `vehicle_id`, `driver_id`, `expense_type`.
- **New Models**: `TripTemplate` (saved routes for recurring use), `Booking` (trip bookings).
- **New Route Files**: `backend/routes/trip_templates.py` (CRUD), `backend/routes/bookings.py` (POST).
- **Analytics Extension**: `GET /api/analytics/driver-performance` endpoint added.
- **Bug Fix — Notifications Tab**: Alerts list route changed from `@bp.route('/')` to `@bp.route('')` (removed trailing slash). Frontend calls `GET /api/alerts`; the 308 redirect from `/api/alerts/` was stripping the JWT `Authorization` header.
- **Data Shape Fixes**:
  - `Trip.to_dict()`: now returns flat `route_name`, `driver_name`, `vehicle_reg`, `date` fields.
  - `Alert.to_dict()`: now includes `title`, `alert_type`, `level` aliases for frontend compatibility.
- **Relational Integrity**: Relational constraints enforce cascading operations safely based on active trip mappings.

### 9.2. Frontend Implementation Details
- **Vite 8 Dev Server**: Runs on port `5173`.
- **Tailwind CSS v4 Integration**: Uses `@tailwindcss/postcss` and `postcss.config.js` to compile custom imports and variables.
- **Authentication**: `AuthContext.tsx` manages login hooks, JWT storage/refresh, and intercepts Axios requests to inject tokens.
- **Theme Support**: `ThemeContext.tsx` manages light/dark mode toggle; Dark Reader is locked out to prevent double-inversion.
- **Code Cleanup**:
  - `App.css`: emptied entirely (all classes unused).
  - `index.css`: trimmed to only `animate-fade-in` keyframes.
  - 7 unused packages removed from `package.json`: `@radix-ui/*`, `class-variance-authority`, `clsx`, `tailwind-merge`, `tailwindcss-animate`.
  - 3 orphaned assets deleted.
  - Redundant `__init__` constructors removed from all SQLAlchemy model classes.
- **Window Reload Removal**: 11 `window.location.reload()` calls across 4 pages (Trips, Maintenance, Expenses, Calendar) replaced with API refetch via extracted `fetchData()`.
- **Dark Reader Compatibility**: Added `<meta name="darkreader-lock" content="no-darkreader">` in `index.html` and `html { darkreader-skip: true }` in `index.css` to prevent double-inversion on the already-dark UI.
- **Documentation**: `README.md` updated with Getting Started instructions and sandbox credentials table.
- **All 5 backend tests pass** using isolated TestConfig with in-memory SQLite.
- **Custom Pages**:
  - `Login.tsx`: Login page with sandbox credential cards for quick profile switches.
  - `Register.tsx`: User self-registration form.
  - `Dashboard.tsx`: Features real-time fleet utilization charts, trip counts, and status breakdowns.
  - `Vehicles.tsx`: Full vehicle assets database, CRUD, and status details.
  - `Drivers.tsx`: Operator roster and license tracking highlighting expired entries.
  - `Trips.tsx`: Workspace with weight validation (cargo weight vs vehicle capacity) and status flow timelines (Draft → Dispatched → Completed).
  - `TripTemplates.tsx`: Saved route templates with "Use" button that fills trip form; field mapping fixed (`route_name` → `source`/`destination`).
  - `Calendar.tsx`: Schedule view with trip/maintenance events.
  - `Maintenance.tsx`: Tickets board to request repairs, put vehicles "In Shop", and close orders to generate invoices.
  - `Expenses.tsx`: Aggregated ledger separating fuel receipts, repair costs, and general outlays.
  - `Notifications.tsx`: Alerts list with read/unread status and delete capability.
  - `DriverPerformance.tsx`: Driver safety scores, efficiency trends, and comparison charts.
  - `Analytics.tsx`: Fleet performance matrices calculating ROI, fuel efficiency (km/L), with an exporter for CSV data.

## Feature suggestions (ordered by impact/effort)
| Priority | Feature | Status | Why |
| :--- | :--- | :--- | :--- |
| High | Pagination + Search + Filters | Pending | List pages become unusable with >50 records |
| High | Notifications / Alerts | Done | In-app alerts via `/api/alerts` with read/unread, auto-polling in Layout |
| Medium | Calendar / Schedule View | Done | Calendar.tsx with trip & maintenance events |
| Medium | Document Upload | Pending | Attach invoices, repair receipts, license PDFs to expenses/maintenance/drivers |
| Medium | Driver Performance Dashboard | Done | `GET /api/analytics/driver-performance` endpoint |
| Medium | Recurring Trips / Templates | Done | TripTemplate model + CRUD routes + TripTemplates.tsx page |
| Low | Swagger / OpenAPI Docs | Pending | Auto-generated API docs for frontend and third-party integration |


