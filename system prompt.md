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

Ensure the codebase conforms exactly to the following directory layout:

```text
TransitOps/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory, extension initialization, blueprint registration
│   │   ├── config.py            # Development, testing, and production configuration classes
│   │   ├── models/              # SQLAlchemy Database Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── vehicle.py
│   │   │   ├── driver.py
│   │   │   ├── trip.py
│   │   │   ├── maintenance.py
│   │   │   └── expense.py
│   │   ├── routes/              # Flask Blueprints (API endpoints)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── vehicles.py
│   │   │   ├── drivers.py
│   │   │   ├── trips.py
│   │   │   ├── maintenance.py
│   │   │   ├── expenses.py
│   │   │   └── analytics.py
│   │   ├── services/            # Business logic separation layer (calculating metrics, ROI, validation)
│   │   └── utils/
│   │       ├── auth_helpers.py  # Decorators for RBAC
│   │       └── validators.py    # Custom validators (odometer, cargo limits, license expiry)
│   ├── tests/
│   ├── run.py                   # Main entry point to launch the Flask server
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/          # Button, Input, Table, Card, Navbar, Sidebar, Modal, Badge
│   │   │   ├── dashboard/       # KPI Cards, Analytics Summary, Charts
│   │   │   ├── vehicles/        # Vehicle Form, Vehicle Detail, Vehicle Table
│   │   │   ├── drivers/         # Driver Form, Driver Card, Driver Table
│   │   │   ├── trips/           # Trip Planner Form, Trip Status Transition Timeline
│   │   │   └── maintenance/     # Maintenance Log Form, Service History List
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Handles logins, logouts, JWT storage, and current user role state
│   │   │   └── ThemeContext.jsx # Light/Dark mode state management
│   │   ├── hooks/               # Custom hooks (e.g., useFetch, useForm)
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Vehicles.jsx
│   │   │   ├── Drivers.jsx
│   │   │   ├── Trips.jsx
│   │   │   ├── Maintenance.jsx
│   │   │   ├── Expenses.jsx
│   │   │   └── Analytics.jsx
│   │   ├── services/
│   │   │   └── api.js           # Axios instance, interceptors, and API client request methods
│   │   ├── App.jsx              # Routing configurations and ProtectedRoute wrappers
│   │   ├── main.jsx
│   │   └── index.css            # Base styles, variables (CSS custom properties), and utility classes
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
```

---

## 3. Database Schema Specifications

Each model must have the following properties and database columns:

### 3.1. `User`
*Represents system users and controls role access.*
- `id` (Integer, Primary Key)
- `email` (String, Unique, Indexed, Not Null)
- `password_hash` (String, Not Null)
- `role` (String, Not Null) – Must be one of: `'Fleet Manager'`, `'Driver'`, `'Safety Officer'`, `'Financial Analyst'`.
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)

### 3.2. `Vehicle`
*Master record for fleet assets.*
- `id` (Integer, Primary Key)
- `registration_number` (String, Unique, Indexed, Not Null) – Must validate as unique and alphanumeric.
- `model` (String, Not Null)
- `type` (String, Not Null) – E.g., `'Truck'`, `'Van'`, `'Box Truck'`, `'Sedan'`.
- `max_load_capacity` (Float, Not Null) – Measured in kg. Must be > 0.
- `odometer` (Float, Not Null, Default: 0.0) – Measured in km. Must be >= 0.
- `acquisition_cost` (Float, Not Null) – Original purchase cost. Must be >= 0.
- `status` (String, Not Null, Default: `'Available'`) – Must be one of: `'Available'`, `'On Trip'`, `'In Shop'`, `'Retired'`.

### 3.3. `Driver`
*Details and status of operators.*
- `id` (Integer, Primary Key)
- `name` (String, Not Null)
- `license_number` (String, Unique, Not Null)
- `license_category` (String, Not Null) – E.g., `'Class A'`, `'Class B'`, `'Commercial'`.
- `license_expiry_date` (Date, Not Null)
- `contact_number` (String, Not Null)
- `safety_score` (Float, Default: 100.0) – Out of 100. Range: [0.0, 100.0].
- `status` (String, Not Null, Default: `'Available'`) – Must be one of: `'Available'`, `'On Trip'`, `'Off Duty'`, `'Suspended'`.

### 3.4. `Trip`
*Monitors shipping journeys, status cycles, and mileage/fuel.*
- `id` (Integer, Primary Key)
- `source` (String, Not Null)
- `destination` (String, Not Null)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `driver_id` (Integer, ForeignKey('driver.id'), Not Null)
- `cargo_weight` (Float, Not Null) – Measured in kg. Must be > 0.
- `planned_distance` (Float, Not Null) – Measured in km. Must be > 0.
- `revenue` (Float, Not Null, Default: 0.0) – Earned income from the trip. Used for ROI calculations.
- `final_odometer` (Float, Nullable) – Set upon trip completion. Must be > vehicle's current odometer.
- `fuel_consumed` (Float, Nullable) – Measured in liters. Set upon trip completion. Must be >= 0.
- `status` (String, Not Null, Default: `'Draft'`) – Must be one of: `'Draft'`, `'Dispatched'`, `'Completed'`, `'Cancelled'`.
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)
- `updated_at` (DateTime, Default: CURRENT_TIMESTAMP, OnUpdate: CURRENT_TIMESTAMP)

### 3.5. `MaintenanceLog`
*Tracks repair tickets and links them to vehicles.*
- `id` (Integer, Primary Key)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `issue_description` (Text, Not Null)
- `cost` (Float, Not Null, Default: 0.0) – Maintenance cost. Must be >= 0.
- `start_date` (Date, Not Null)
- `end_date` (Date, Nullable) – Populated when maintenance is closed.
- `status` (String, Not Null, Default: `'Open'`) – Must be one of: `'Open'`, `'Closed'`.
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)

### 3.6. `FuelLog`
*Tracks specific fueling events.*
- `id` (Integer, Primary Key)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `trip_id` (Integer, ForeignKey('trip.id'), Nullable)
- `liters` (Float, Not Null) – Liters pumped. Must be > 0.
- `cost` (Float, Not Null) – Monetary cost. Must be > 0.
- `date` (Date, Not Null)
- `created_at` (DateTime, Default: CURRENT_TIMESTAMP)

### 3.7. `Expense`
*Central log capturing all operational outlays (fuel, maintenance, tolls, fees).*
- `id` (Integer, Primary Key)
- `vehicle_id` (Integer, ForeignKey('vehicle.id'), Not Null)
- `trip_id` (Integer, ForeignKey('trip.id'), Nullable)
- `amount` (Float, Not Null) – Must be > 0.
- `expense_type` (String, Not Null) – Must be one of: `'Fuel'`, `'Maintenance'`, `'Toll'`, `'Other'`.
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

*Note: On the frontend, restrict views by checking user role. On the backend, protect blueprints using custom decorators that inspect the JWT token’s payload for the role field.*

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
   - The driver’s license is valid (i.e., `license_expiry_date` is strictly in the future relative to the planning date).
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
- **Database File**: SQLite database file located at `/home/shifan/Learning/Personal-Projs/TransitOps/backend/transitops.db`.
- **Database Seeder**: `backend/seed.py` seeds tables and default operator logins.
- **Seeded Sandbox Credentials (Password: `transitops123` for all)**:
  - **Fleet Manager**: `manager@transitops.com`
  - **Driver**: `driver@transitops.com`
  - **Safety Officer**: `safety@transitops.com`
  - **Financial Analyst**: `analyst@transitops.com`
- **CORS Config**: Configured explicitly in `backend/app/__init__.py` to allow `Content-Type` and `Authorization` headers.
- **Relational Integrity**: Relational constraints enforce cascading operations safely based on active trip mappings.

### 9.2. Frontend Implementation Details
- **Vite 8 Dev Server**: Runs on port `5173`.
- **Vite Native Rolldown Bindings**: Installed `@rolldown/binding-linux-x64-gnu` natively to resolve Vite 8 build steps.
- **Tailwind CSS v4 Integration**: Uses `@tailwindcss/postcss` and `postcss.config.js` to compile custom imports and variables.
- **Authentication**: `AuthContext.jsx` manages login hooks and intercepts Axios requests to inject JWT.
- **Custom Pages**:
  - `Login.jsx`: Login page with sandbox credential cards for quick profile switches.
  - `Dashboard.jsx`: Features real-time fleet utilization charts, trip counts, and status breakdowns.
  - `Vehicles.jsx`: Full vehicle assets database, CRUD, and status details.
  - `Drivers.jsx`: Operator roster and license tracking highlighting expired entries.
  - `Trips.jsx`: Workspace with weight validation (cargo weight vs vehicle capacity) and status flow timelines (Draft -> Dispatched -> Completed).
  - `Maintenance.jsx`: Tickets board to request repairs, put vehicles "In Shop", and close orders to generate invoices.
  - `Expenses.jsx`: Aggregated ledger separating fuel receipts, repair costs, and general outlays.
  - `Analytics.jsx`: Fleet performance matrices calculating ROI, fuel efficiency (km/L), with an exporter for CSV data.

## New feature suggestions (ordered by impact/effort)
| Priority | Feature | Why |
| :--- | :--- | :--- |
| High | Pagination + Search + Filters | List pages become unusable with >50 records |
| High | Notifications / Alerts | In-app alerts for license expiry, maintenance due, trip completion � core ops requirement |
| Medium | Calendar / Schedule View | Drag-drop trip & maintenance scheduling on a calendar |
| Medium | Document Upload | Attach invoices, repair receipts, license PDFs to expenses/maintenance/drivers |
| Medium | Driver Performance Dashboard | Safety score trends, efficiency comparisons, violation tracking |
| Low | Dark Mode | Theme toggle across all pages |
| Low | Recurring Trips / Templates | Save common routes as templates and schedule recurring dispatches |
| Low | Swagger / OpenAPI Docs | Auto-generated API docs for frontend and third-party integration |

## New feature suggestions (ordered by impact/effort)
| Priority | Feature | Why |
| :--- | :--- | :--- |
| High | Pagination + Search + Filters | List pages become unusable with >50 records |
| High | Notifications / Alerts | In-app alerts for license expiry, maintenance due, trip completion � core ops requirement |
| Medium | Calendar / Schedule View | Drag-drop trip & maintenance scheduling on a calendar |
| Medium | Document Upload | Attach invoices, repair receipts, license PDFs to expenses/maintenance/drivers |
| Medium | Driver Performance Dashboard | Safety score trends, efficiency comparisons, violation tracking |
| Low | Dark Mode | Theme toggle across all pages |
| Low | Recurring Trips / Templates | Save common routes as templates and schedule recurring dispatches |
| Low | Swagger / OpenAPI Docs | Auto-generated API docs for frontend and third-party integration |
