Here is the complete, formatted `README.md` content for your repository:

```markdown
# TransitOps 🚀

**TransitOps** is a premium, full-stack **Smart Transport Operations Platform** designed to manage vehicle fleets, monitor driver rosters, schedule shipping dispatches, log maintenance orders, track operational expenditures, and display real-time performance analytics. 

Built with a robust **Flask (Python) backend** and a high-performance **React + Vite (JavaScript) frontend** styled with Tailwind CSS, the platform ensures seamless tracking and atomic transaction execution across the transit lifecycle.

---

## 🌟 Key Features

* **🎛️ Real-Time KPI Dashboard**: High-impact metrics monitoring fleet utilization, open maintenance cases, active trips, and operational costs using **Recharts** visualizations.
* **🚚 Fleet Registry**: Complete database showing vehicle registration, models, types, odometers, and active statuses (Available, On Trip, In Shop, Retired).
* **👤 Driver Roster & License Tracker**: Tracks operator details, safety scores, and commercial license expirations with visual warnings for expired credentials.
* **🗺️ Shipping Dispatch Scheduler**: Custom trip planner with built-in cargo capacity checks preventing dispatch of overloaded vehicles. Supports status transitions (Draft ➔ Dispatched ➔ Completed/Cancelled).
* **🔧 Interactive Maintenance Board**: Logs active repairs, automatically routes vehicles "In Shop", and creates aggregated maintenance expense items upon closure.
* **💳 Financial Ledger**: Compiles fuel purchases, toll records, service bills, and miscellaneous expenses with automatic cost calculations.
* **📊 Performance Analytics**: Computes complex fleet performance indicators including Vehicle Return on Investment (ROI), Fuel Efficiency (km/L), and Fleet Utilization. Supports CSV data exports.

---

## 🛠️ Tech Stack & Core Libraries

### Backend
* **Core Framework**: Python Flask (3.10+)
* **Database & ORM**: Flask-SQLAlchemy (SQLite for local development, PostgreSQL ready)
* **Migrations**: Flask-Migrate (Alembic)
* **Authentication**: Flask-JWT-Extended (JWT-based stateful/stateless auth)
* **Security & Cryptography**: Flask-Bcrypt (password hashing), Flask-CORS (CORS resource sharing)

### Frontend
* **Runtime & Bundler**: Vite (v8) + React (v19)
* **Styling & Theme**: Tailwind CSS v4 (Glassmorphism, custom CSS variables, responsive B2B SaaS theme layout)
* **Routing**: React Router DOM (v7)
* **State Management**: React Context API (Auth and Theme contexts)
* **HTTP Client**: Axios (with custom request/response interceptors for JWT insertion)
* **Data Visualization**: Recharts
* **Icons**: Lucide React

---

## 📁 Directory Structure

```text
TransitOps/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # Flask app factory, extension init, blueprint registration
│   │   ├── config.py            # Development, testing, and production config classes
│   │   ├── models/              # SQLAlchemy Database Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py          # RBAC Users
│   │   │   ├── vehicle.py       # Fleet assets
│   │   │   ├── driver.py        # Operator logs
│   │   │   ├── trip.py          # Shipping journeys
│   │   │   ├── maintenance.py   # Service tickets
│   │   │   └── expense.py       # Fuel logs and ledger outlays
│   │   ├── routes/              # Flask Blueprints (API Blueprints)
│   │   │   ├── __init__.py
│   │   │   ├── auth.py
│   │   │   ├── vehicles.py
│   │   │   ├── drivers.py
│   │   │   ├── trips.py
│   │   │   ├── maintenance.py
│   │   │   ├── expenses.py
│   │   │   └── analytics.py
│   │   ├── services/            # Calculations and ROI metrics layer
│   │   └── utils/
│   │       ├── auth_helpers.py  # RBAC check decorators
│   │       └── validators.py    # Custom validators
│   ├── tests/
│   │   └── test_api.py          # Backend unit test suite
│   ├── run.py                   # Main entry point to launch Flask server
│   ├── requirements.txt
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/          # Layout, badges, buttons, inputs, tables, modals
│   │   │   └── ...              # Domain-specific components (vehicles, drivers, etc.)
│   │   ├── context/
│   │   │   ├── AuthContext.jsx  # Handles logins, logouts, and user session storage
│   │   │   └── ThemeContext.jsx # Light/Dark mode state management
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
│   │   │   └── api.js           # Custom Axios instances and interceptors
│   │   ├── App.jsx              # Client routing and ProtectedRoute wrappers
│   │   ├── main.jsx
│   │   └── index.css            # Base styles and utility classes
│   ├── package.json
│   ├── vite.config.js
│   └── README.md
```

---

## 🔐 Role-Based Access Control (RBAC)

The platform enforces strict role-based access parameters:

| Role | Dashboard & KPIs | Vehicles / Drivers | Trip Planning | Maintenance Logs | Fuel & Expense Logs | Reports & Exports |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Fleet Manager** | View All | CRUD | View / Create | CRUD | CRUD | View / Export |
| **Driver** | View Own | Read-Only | Update Status | Read-Only | Create Fuel Log | View Own |
| **Safety Officer** | View All | CRUD (Drivers Only) | Read-Only | Read-Only | Read-Only | View / Export |
| **Financial Analyst** | View All | Read-Only | Read-Only | Read-Only | CRUD | View / Export |

---

## ⚙️ Mandatory Business Rules

1. **Unique Identification**: Reject duplicate alphanumeric vehicle `registration_number` keys and driver `license_number` strings.
2. **Dispatch Eligibility**: 
   * Vehicles must be `Available` (not `Retired`, `In Shop`, or `On Trip`).
   * Drivers must be `Available` and hold a valid license (`license_expiry_date` in the future).
3. **Capacity Constraints**: Trip cargo weight cannot exceed the selected vehicle's `max_load_capacity`.
4. **Atomic Trip Transitions**:
   * **Dispatched**: Atomically locks the vehicle and driver status to `On Trip`.
   * **Completed**: Reverts statuses to `Available`, updates vehicle mileage, and automatically records a corresponding fuel expense and fuel log.
   * **Cancelled**: Restores vehicle and driver statuses to `Available`.
5. **Maintenance Cycles**: Opening a maintenance ticket routes a vehicle to `In Shop`. Closing the log records the expense and returns the vehicle to `Available`.

---

## 📈 Key Formulas Used

* **Fuel Efficiency**:
  $$\text{Fuel Efficiency} = \frac{\sum \text{Distance Traveled (km)}}{\sum \text{Fuel Consumed (Liters)}}$$
* **Fleet Utilization**:
  $$\text{Fleet Utilization (\%)} = \left( \frac{\text{Vehicles on Trip}}{\text{Available} + \text{On Trip} + \text{In Shop}} \right) \times 100$$
* **Total Operational Cost**:
  $$\text{Total Operational Cost} = \sum \text{Fuel Expenses} + \sum \text{Maintenance Expenses} + \sum \text{Other Expenses}$$
* **Vehicle Return on Investment (ROI)**:
  $$\text{Vehicle ROI} = \frac{\sum \text{Trip Revenue} - \left(\text{Total Maintenance Cost} + \text{Total Fuel Cost}\right)}{\text{Acquisition Cost}}$$

---

## 🚀 Running the Project Locally

### Backend Setup (Flask API)
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   * **PowerShell**:
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   * **Linux/macOS**:
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Seed the database (creates tables & local SQLite database file `transitops.db` with sandbox accounts):
   ```bash
   python seed.py
   ```
5. Run the Flask development server:
   ```bash
   python run.py
   ```
   The backend API will run on **http://localhost:5000/api**.

### Frontend Setup (React + Vite)
1. Navigate to the `frontend` directory:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
   The application will launch on **http://localhost:5173**.

---

## 🔑 Sandbox Credentials
Use the password `transitops123` to log in under any of the default testing accounts:
* **Fleet Manager**: `manager@transitops.com`
* **Driver**: `driver@transitops.com`
* **Safety Officer**: `safety@transitops.com`
* **Financial Analyst**: `analyst@transitops.com`
```
