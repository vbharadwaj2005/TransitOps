
# TransitOps — Odoo Hackathon'26

**TransitOps** is a premium, full-stack **Smart Transport Operations Platform** designed to manage vehicle fleets, monitor driver rosters, schedule shipping dispatches, log maintenance orders, track operational expenditures, and display real-time performance analytics. 

Built with a robust **Flask (Python) backend** and a high-performance **React + Vite (TypeScript) frontend** styled with Tailwind CSS, the platform ensures seamless tracking and atomic transaction execution across the transit lifecycle.

---

## 🚀 Getting Started

### Prerequisites
- Python 3.12+
- Node.js 20+

### Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
python app.py
```
The server starts at **http://localhost:5000**. The database and seed data are auto-created on first launch.

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The dev server starts at **http://localhost:5173**.

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