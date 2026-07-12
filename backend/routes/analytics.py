from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from models.vehicle import Vehicle
from models.driver import Driver
from models.trip import Trip
from models.expense import FuelLog, Expense
from models.maintenance import MaintenanceLog
from extensions import db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_kpis():
    active_vehicles = Vehicle.query.filter(Vehicle.status == 'On Trip').count()
    available_vehicles = Vehicle.query.filter(Vehicle.status == 'Available').count()
    in_shop_vehicles = Vehicle.query.filter(Vehicle.status == 'In Shop').count()
    retired_vehicles = Vehicle.query.filter(Vehicle.status == 'Retired').count()

    active_trips = Trip.query.filter(Trip.status == 'Dispatched').count()
    pending_trips = Trip.query.filter(Trip.status == 'Draft').count()

    drivers_on_duty = Driver.query.filter(Driver.status == 'On Trip').count()

    total_active_vehicles = active_vehicles + available_vehicles + in_shop_vehicles
    
    fleet_utilization = 0.0
    if total_active_vehicles > 0:
        fleet_utilization = (active_vehicles / total_active_vehicles) * 100

    return jsonify({
        'active_vehicles': active_vehicles,
        'available_vehicles': available_vehicles,
        'in_shop_vehicles': in_shop_vehicles,
        'retired_vehicles': retired_vehicles,
        'active_trips': active_trips,
        'pending_trips': pending_trips,
        'drivers_on_duty': drivers_on_duty,
        'fleet_utilization': round(fleet_utilization, 2)
    }), 200

@analytics_bp.route('/reports', methods=['GET'])
@jwt_required()
def get_vehicle_reports():
    vehicles = Vehicle.query.all()
    reports = []

    for v in vehicles:
        completed_distance = db.session.query(db.func.sum(Trip.planned_distance))\
            .filter(Trip.vehicle_id == v.id, Trip.status == 'Completed').scalar() or 0.0
            
        total_fuel_liters = db.session.query(db.func.sum(FuelLog.liters))\
            .filter(FuelLog.vehicle_id == v.id).scalar() or 0.0
            
        total_fuel_cost = db.session.query(db.func.sum(FuelLog.cost))\
            .filter(FuelLog.vehicle_id == v.id).scalar() or 0.0
            
        total_maint_cost = db.session.query(db.func.sum(MaintenanceLog.cost))\
            .filter(MaintenanceLog.vehicle_id == v.id, MaintenanceLog.status == 'Closed').scalar() or 0.0

        total_op_cost = db.session.query(db.func.sum(Expense.amount))\
            .filter(Expense.vehicle_id == v.id).scalar() or 0.0

        total_revenue = db.session.query(db.func.sum(Trip.revenue))\
            .filter(Trip.vehicle_id == v.id, Trip.status == 'Completed').scalar() or 0.0

        fuel_efficiency = 0.0
        if total_fuel_liters > 0:
            fuel_efficiency = completed_distance / total_fuel_liters

        roi = 0.0
        if v.acquisition_cost > 0:
            roi = (total_revenue - (total_maint_cost + total_fuel_cost)) / v.acquisition_cost

        reports.append({
            'vehicle_id': v.id,
            'registration_number': v.registration_number,
            'model': v.model,
            'type': v.type,
            'status': v.status,
            'distance_traveled': round(completed_distance, 2),
            'fuel_consumed': round(total_fuel_liters, 2),
            'fuel_cost': round(total_fuel_cost, 2),
            'maintenance_cost': round(total_maint_cost, 2),
            'operational_cost': round(total_op_cost, 2),
            'revenue': round(total_revenue, 2),
            'fuel_efficiency': round(fuel_efficiency, 2),
            'roi': round(roi, 4),
            'acquisition_cost': v.acquisition_cost
        })

    return jsonify(reports), 200
