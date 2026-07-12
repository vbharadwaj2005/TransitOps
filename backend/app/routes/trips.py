from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.trip import Trip
from app.models.vehicle import Vehicle
from app.models.driver import Driver
from app.models.expense import FuelLog, Expense
from app.extensions import db
from app.utils.auth_helpers import role_required
from datetime import datetime, date

trips_bp = Blueprint('trips', __name__)

@trips_bp.route('', methods=['GET'])
@jwt_required()
def get_trips():
    trips = Trip.query.all()
    return jsonify([t.to_dict() for t in trips]), 200

@trips_bp.route('/<int:trip_id>', methods=['GET'])
@jwt_required()
def get_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    return jsonify(trip.to_dict()), 200

@trips_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager', 'Driver'])
def create_trip():
    data = request.get_json() or {}
    source = data.get('source')
    destination = data.get('destination')
    vehicle_id = data.get('vehicle_id')
    driver_id = data.get('driver_id')
    cargo_weight = data.get('cargo_weight')
    planned_distance = data.get('planned_distance')
    revenue = data.get('revenue', 0.0)

    if not source or not destination or vehicle_id is None or driver_id is None or cargo_weight is None or planned_distance is None:
        return jsonify({'message': 'Missing required fields'}), 400

    vehicle = Vehicle.query.get(vehicle_id)
    driver = Driver.query.get(driver_id)

    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404
    if not driver:
        return jsonify({'message': 'Driver not found'}), 404

    try:
        cargo_weight = float(cargo_weight)
        planned_distance = float(planned_distance)
        revenue = float(revenue)
        if cargo_weight <= 0 or planned_distance <= 0 or revenue < 0:
            raise ValueError
    except ValueError:
        return jsonify({'message': 'Cargo weight, planned distance must be > 0 and revenue must be >= 0.'}), 400

    if cargo_weight > vehicle.max_load_capacity:
        return jsonify({'message': f'Cargo weight ({cargo_weight} kg) exceeds vehicle max load capacity ({vehicle.max_load_capacity} kg).'}), 400

    new_trip = Trip(
        source=source,
        destination=destination,
        vehicle_id=vehicle_id,
        driver_id=driver_id,
        cargo_weight=cargo_weight,
        planned_distance=planned_distance,
        revenue=revenue,
        status='Draft'
    )
    db.session.add(new_trip)
    db.session.commit()
    return jsonify(new_trip.to_dict()), 201

@trips_bp.route('/<int:trip_id>/dispatch', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager', 'Driver'])
def dispatch_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    if trip.status != 'Draft':
        return jsonify({'message': 'Only Draft trips can be dispatched.'}), 400

    vehicle = Vehicle.query.get(trip.vehicle_id)
    driver = Driver.query.get(trip.driver_id)

    if vehicle.status != 'Available':
        return jsonify({'message': f'Vehicle {vehicle.registration_number} is not available (Status: {vehicle.status}).'}), 400

    if driver.status != 'Available':
        return jsonify({'message': f'Driver {driver.name} is not available (Status: {driver.status}).'}), 400

    if driver.license_expiry_date < date.today():
        return jsonify({'message': f'Driver {driver.name} has an expired license (Expiry: {driver.license_expiry_date}).'}), 400

    if driver.status == 'Suspended':
        return jsonify({'message': f'Driver {driver.name} is suspended.'}), 400

    if trip.cargo_weight > vehicle.max_load_capacity:
        return jsonify({'message': 'Cargo weight exceeds vehicle capacity.'}), 400

    try:
        trip.status = 'Dispatched'
        vehicle.status = 'On Trip'
        driver.status = 'On Trip'
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error during dispatch: {str(e)}'}), 500

    return jsonify(trip.to_dict()), 200

@trips_bp.route('/<int:trip_id>/complete', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager', 'Driver'])
def complete_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    if trip.status != 'Dispatched':
        return jsonify({'message': 'Only Dispatched trips can be completed.'}), 400

    data = request.get_json() or {}
    final_odometer = data.get('final_odometer')
    fuel_consumed = data.get('fuel_consumed')
    fuel_cost = data.get('fuel_cost')

    if final_odometer is None or fuel_consumed is None or fuel_cost is None:
        return jsonify({'message': 'Missing required fields: final_odometer, fuel_consumed, fuel_cost'}), 400

    vehicle = Vehicle.query.get(trip.vehicle_id)
    driver = Driver.query.get(trip.driver_id)

    try:
        final_odometer = float(final_odometer)
        fuel_consumed = float(fuel_consumed)
        fuel_cost = float(fuel_cost)
        if final_odometer <= vehicle.odometer:
            return jsonify({'message': f'Final odometer ({final_odometer} km) must be greater than current vehicle odometer ({vehicle.odometer} km).'}), 400
        if fuel_consumed < 0 or fuel_cost < 0:
            raise ValueError
    except ValueError:
        return jsonify({'message': 'Odometer, fuel consumed, and fuel cost must be positive numbers.'}), 400

    try:
        trip.status = 'Completed'
        trip.final_odometer = final_odometer
        trip.fuel_consumed = fuel_consumed

        vehicle.odometer = final_odometer
        vehicle.status = 'Available'
        driver.status = 'Available'

        fuel_log = FuelLog(
            vehicle_id=vehicle.id,
            trip_id=trip.id,
            liters=fuel_consumed,
            cost=fuel_cost,
            date=date.today()
        )
        db.session.add(fuel_log)

        expense = Expense(
            vehicle_id=vehicle.id,
            trip_id=trip.id,
            amount=fuel_cost,
            expense_type='Fuel',
            description=f'Fuel consumption for trip {trip.id} ({trip.source} to {trip.destination})',
            date=date.today()
        )
        db.session.add(expense)

        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error during completion: {str(e)}'}), 500

    return jsonify(trip.to_dict()), 200

@trips_bp.route('/<int:trip_id>/cancel', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager', 'Driver'])
def cancel_trip(trip_id):
    trip = Trip.query.get_or_404(trip_id)
    if trip.status not in ['Draft', 'Dispatched']:
        return jsonify({'message': 'Only Draft or Dispatched trips can be cancelled.'}), 400

    vehicle = Vehicle.query.get(trip.vehicle_id)
    driver = Driver.query.get(trip.driver_id)

    try:
        if trip.status == 'Dispatched':
            vehicle.status = 'Available'
            driver.status = 'Available'
        
        trip.status = 'Cancelled'
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error during cancellation: {str(e)}'}), 500

    return jsonify(trip.to_dict()), 200
