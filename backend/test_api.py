import json
import unittest
from datetime import date, timedelta
from app import create_app
from extensions import db
from models.user import User
from models.vehicle import Vehicle
from models.driver import Driver
from models.trip import Trip
from models.maintenance import MaintenanceLog
from models.expense import FuelLog, Expense

class TransitOpsBackendTestCase(unittest.TestCase):
    def setUp(self):
        # Configure app to use testing config / in-memory database
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.client = self.app.test_client()

        with self.app.app_context():
            db.create_all()
            # Create user accounts
            self.manager = User(email='manager@test.com', role='Fleet Manager')
            self.manager.set_password('testpass')
            
            self.driver_user = User(email='driver@test.com', role='Driver')
            self.driver_user.set_password('testpass')
            
            self.safety = User(email='safety@test.com', role='Safety Officer')
            self.safety.set_password('testpass')

            self.analyst = User(email='analyst@test.com', role='Financial Analyst')
            self.analyst.set_password('testpass')

            db.session.add_all([self.manager, self.driver_user, self.safety, self.analyst])
            db.session.commit()

        # Login manager
        res = self.client.post('/api/auth/login', json={
            'email': 'manager@test.com',
            'password': 'testpass'
        })
        self.manager_token = json.loads(res.data)['token']
        self.manager_headers = {'Authorization': f'Bearer {self.manager_token}'}

        # Login driver
        res = self.client.post('/api/auth/login', json={
            'email': 'driver@test.com',
            'password': 'testpass'
        })
        self.driver_token = json.loads(res.data)['token']
        self.driver_headers = {'Authorization': f'Bearer {self.driver_token}'}

    def tearDown(self):
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_auth_and_profile(self):
        # Profile check
        res = self.client.get('/api/auth/profile', headers=self.manager_headers)
        self.assertEqual(res.status_code, 200)
        data = json.loads(res.data)
        self.assertEqual(data['role'], 'Fleet Manager')

    def test_vehicle_crud(self):
        # Create Vehicle
        res = self.client.post('/api/vehicles', json={
            'registration_number': 'REG-V05',
            'model': 'Van-05',
            'type': 'Van',
            'max_load_capacity': 500.0,
            'odometer': 1000.0,
            'acquisition_cost': 25000.0
        }, headers=self.manager_headers)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['registration_number'], 'REG-V05')
        self.assertEqual(data['status'], 'Available')

        # Test duplicate registration_number
        res = self.client.post('/api/vehicles', json={
            'registration_number': 'REG-V05',
            'model': 'Van-Another',
            'type': 'Van',
            'max_load_capacity': 600.0,
            'acquisition_cost': 20000.0
        }, headers=self.manager_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn('already exists', json.loads(res.data)['message'])

    def test_driver_crud(self):
        # Create Driver
        expiry = (date.today() + timedelta(days=365)).isoformat()
        res = self.client.post('/api/drivers', json={
            'name': 'Alex',
            'license_number': 'LIC-ALEX',
            'license_category': 'Class B',
            'license_expiry_date': expiry,
            'contact_number': '123456789'
        }, headers=self.manager_headers)
        self.assertEqual(res.status_code, 201)
        data = json.loads(res.data)
        self.assertEqual(data['name'], 'Alex')
        self.assertEqual(data['status'], 'Available')

    def test_trip_validations_and_lifecycle(self):
        # 1. Setup Vehicle and Driver
        expiry = (date.today() + timedelta(days=365)).isoformat()
        self.client.post('/api/vehicles', json={
            'registration_number': 'REG-V05',
            'model': 'Van-05',
            'type': 'Van',
            'max_load_capacity': 500.0,
            'odometer': 1000.0,
            'acquisition_cost': 25000.0
        }, headers=self.manager_headers)

        self.client.post('/api/drivers', json={
            'name': 'Alex',
            'license_number': 'LIC-ALEX',
            'license_category': 'Class B',
            'license_expiry_date': expiry,
            'contact_number': '123456789'
        }, headers=self.manager_headers)

        # 2. Test Cargo Weight Constraint
        res = self.client.post('/api/trips', json={
            'source': 'Warehouse A',
            'destination': 'Client B',
            'vehicle_id': 1,
            'driver_id': 1,
            'cargo_weight': 600.0, # Exceeds 500.0 limit
            'planned_distance': 120.0
        }, headers=self.manager_headers)
        self.assertEqual(res.status_code, 400)
        self.assertIn('exceeds vehicle max load capacity', json.loads(res.data)['message'])

        # 3. Create Valid Trip in Draft
        res = self.client.post('/api/trips', json={
            'source': 'Warehouse A',
            'destination': 'Client B',
            'vehicle_id': 1,
            'driver_id': 1,
            'cargo_weight': 450.0,
            'planned_distance': 120.0,
            'revenue': 300.0
        }, headers=self.manager_headers)
        self.assertEqual(res.status_code, 201)
        trip_data = json.loads(res.data)
        self.assertEqual(trip_data['status'], 'Draft')

        # 4. Dispatch the trip
        res = self.client.post(f"/api/trips/{trip_data['id']}/dispatch", headers=self.manager_headers)
        self.assertEqual(res.status_code, 200)
        
        # Verify status transitions to 'On Trip'
        res_vehicle = self.client.get('/api/vehicles/1', headers=self.manager_headers)
        self.assertEqual(json.loads(res_vehicle.data)['status'], 'On Trip')

        res_driver = self.client.get('/api/drivers/1', headers=self.manager_headers)
        self.assertEqual(json.loads(res_driver.data)['status'], 'On Trip')

        # Try to dispatch again or double assign
        res_double_trip = self.client.post('/api/trips', json={
            'source': 'Warehouse X',
            'destination': 'Client Y',
            'vehicle_id': 1,
            'driver_id': 1,
            'cargo_weight': 200.0,
            'planned_distance': 50.0
        }, headers=self.manager_headers)
        self.assertEqual(res_double_trip.status_code, 201)
        double_trip_id = json.loads(res_double_trip.data)['id']

        res_double_disp = self.client.post(f"/api/trips/{double_trip_id}/dispatch", headers=self.manager_headers)
        self.assertEqual(res_double_disp.status_code, 400)
        self.assertIn('is not available', json.loads(res_double_disp.data)['message'])

        # 5. Complete the Trip
        res_complete = self.client.post(f"/api/trips/{trip_data['id']}/complete", json={
            'final_odometer': 1120.0,
            'fuel_consumed': 12.0,
            'fuel_cost': 24.0
        }, headers=self.manager_headers)
        self.assertEqual(res_complete.status_code, 200)

        # Verify statuses revert to Available, and odometer updates
        res_v_after = self.client.get('/api/vehicles/1', headers=self.manager_headers)
        self.assertEqual(json.loads(res_v_after.data)['status'], 'Available')
        self.assertEqual(json.loads(res_v_after.data)['odometer'], 1120.0)

        res_d_after = self.client.get('/api/drivers/1', headers=self.manager_headers)
        self.assertEqual(json.loads(res_d_after.data)['status'], 'Available')

        # Verify FuelLog and Expense created
        res_exp = self.client.get('/api/expenses', headers=self.manager_headers)
        expenses = json.loads(res_exp.data)
        self.assertEqual(len(expenses), 1)
        self.assertEqual(expenses[0]['expense_type'], 'Fuel')
        self.assertEqual(expenses[0]['amount'], 24.0)

    def test_maintenance_flow(self):
        # Create Vehicle
        self.client.post('/api/vehicles', json={
            'registration_number': 'REG-V05',
            'model': 'Van-05',
            'type': 'Van',
            'max_load_capacity': 500.0,
            'odometer': 1000.0,
            'acquisition_cost': 25000.0
        }, headers=self.manager_headers)

        # Start maintenance
        res_log = self.client.post('/api/maintenance', json={
            'vehicle_id': 1,
            'issue_description': 'Oil Change',
            'start_date': date.today().isoformat()
        }, headers=self.manager_headers)
        self.assertEqual(res_log.status_code, 201)
        log_id = json.loads(res_log.data)['id']

        # Vehicle status should become 'In Shop'
        res_v = self.client.get('/api/vehicles/1', headers=self.manager_headers)
        self.assertEqual(json.loads(res_v.data)['status'], 'In Shop')

        # Close maintenance
        res_close = self.client.post(f'/api/maintenance/{log_id}/close', json={
            'cost': 80.0,
            'end_date': date.today().isoformat()
        }, headers=self.manager_headers)
        self.assertEqual(res_close.status_code, 200)

        # Vehicle status should become 'Available'
        res_v_after = self.client.get('/api/vehicles/1', headers=self.manager_headers)
        self.assertEqual(json.loads(res_v_after.data)['status'], 'Available')

        # Check expense logged
        res_exp = self.client.get('/api/expenses', headers=self.manager_headers)
        expenses = json.loads(res_exp.data)
        # Expense check
        self.assertEqual(expenses[0]['expense_type'], 'Maintenance')
        self.assertEqual(expenses[0]['amount'], 80.0)

if __name__ == '__main__':
    unittest.main()
