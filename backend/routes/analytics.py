from typing import Any
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from ..models.vehicle import Vehicle
from ..models.driver import Driver
from ..models.trip import Trip
from ..models.expense import FuelLog, Expense
from ..models.maintenance import MaintenanceLog
from ..extensions import db

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_dashboard_kpis() -> tuple[Any, int]:
    active_vehicles = db.session.execute(db.select(db.func.count()).select_from(Vehicle).where(Vehicle.status == 'On Trip')).scalar() or 0
    available_vehicles = db.session.execute(db.select(db.func.count()).select_from(Vehicle).where(Vehicle.status == 'Available')).scalar() or 0
    in_shop_vehicles = db.session.execute(db.select(db.func.count()).select_from(Vehicle).where(Vehicle.status == 'In Shop')).scalar() or 0
    retired_vehicles = db.session.execute(db.select(db.func.count()).select_from(Vehicle).where(Vehicle.status == 'Retired')).scalar() or 0

    active_trips = db.session.execute(db.select(db.func.count()).select_from(Trip).where(Trip.status == 'Dispatched')).scalar() or 0
    pending_trips = db.session.execute(db.select(db.func.count()).select_from(Trip).where(Trip.status == 'Draft')).scalar() or 0

    drivers_on_duty = db.session.execute(db.select(db.func.count()).select_from(Driver).where(Driver.status == 'On Trip')).scalar() or 0

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
def get_vehicle_reports() -> tuple[Any, int]:
    vehicles = db.session.execute(db.select(Vehicle)).scalars().all()
    if not vehicles:
        return jsonify([]), 200

    vehicle_ids = [v.id for v in vehicles]

    completed_distances: dict[int, float] = dict(
        db.session.execute(
            db.select(Trip.vehicle_id, db.func.coalesce(db.func.sum(Trip.planned_distance), 0))
            .where(Trip.vehicle_id.in_(vehicle_ids), Trip.status == 'Completed')
            .group_by(Trip.vehicle_id)
        ).all()
    )

    total_fuel_liters: dict[int, float] = dict(
        db.session.execute(
            db.select(FuelLog.vehicle_id, db.func.coalesce(db.func.sum(FuelLog.liters), 0))
            .where(FuelLog.vehicle_id.in_(vehicle_ids))
            .group_by(FuelLog.vehicle_id)
        ).all()
    )

    total_fuel_cost: dict[int, float] = dict(
        db.session.execute(
            db.select(FuelLog.vehicle_id, db.func.coalesce(db.func.sum(FuelLog.cost), 0))
            .where(FuelLog.vehicle_id.in_(vehicle_ids))
            .group_by(FuelLog.vehicle_id)
        ).all()
    )

    total_maint_cost: dict[int, float] = dict(
        db.session.execute(
            db.select(MaintenanceLog.vehicle_id, db.func.coalesce(db.func.sum(MaintenanceLog.cost), 0))
            .where(MaintenanceLog.vehicle_id.in_(vehicle_ids), MaintenanceLog.status == 'Closed')
            .group_by(MaintenanceLog.vehicle_id)
        ).all()
    )

    total_op_cost: dict[int, float] = dict(
        db.session.execute(
            db.select(Expense.vehicle_id, db.func.coalesce(db.func.sum(Expense.amount), 0))
            .where(Expense.vehicle_id.in_(vehicle_ids))
            .group_by(Expense.vehicle_id)
        ).all()
    )

    total_revenue: dict[int, float] = dict(
        db.session.execute(
            db.select(Trip.vehicle_id, db.func.coalesce(db.func.sum(Trip.revenue), 0))
            .where(Trip.vehicle_id.in_(vehicle_ids), Trip.status == 'Completed')
            .group_by(Trip.vehicle_id)
        ).all()
    )

    reports = []
    for v in vehicles:
        dist = float(completed_distances.get(v.id, 0.0))
        fuel_l = float(total_fuel_liters.get(v.id, 0.0))
        fuel_c = float(total_fuel_cost.get(v.id, 0.0))
        maint_c = float(total_maint_cost.get(v.id, 0.0))
        op_c = float(total_op_cost.get(v.id, 0.0))
        rev = float(total_revenue.get(v.id, 0.0))

        fuel_efficiency = dist / fuel_l if fuel_l > 0 else 0.0
        roi = (rev - (maint_c + fuel_c)) / v.acquisition_cost if v.acquisition_cost > 0 else 0.0

        reports.append({
            'vehicle_id': v.id,
            'registration_number': v.registration_number,
            'model': v.model,
            'type': v.type,
            'status': v.status,
            'distance_traveled': round(dist, 2),
            'fuel_consumed': round(fuel_l, 2),
            'fuel_cost': round(fuel_c, 2),
            'maintenance_cost': round(maint_c, 2),
            'operational_cost': round(op_c, 2),
            'revenue': round(rev, 2),
            'fuel_efficiency': round(fuel_efficiency, 2),
            'roi': round(roi, 4),
            'acquisition_cost': v.acquisition_cost
        })

    return jsonify(reports), 200


@analytics_bp.route('/driver-performance', methods=['GET'])
@jwt_required()
def get_driver_performance() -> tuple[Any, int]:
    drivers = db.session.execute(db.select(Driver)).scalars().all()
    performances = []
    for d in drivers:
        total = db.session.execute(
            db.select(db.func.count()).select_from(Trip).where(Trip.driver_id == d.id)
        ).scalar() or 0
        completed = db.session.execute(
            db.select(db.func.count()).select_from(Trip).where(Trip.driver_id == d.id, Trip.status == 'Completed')
        ).scalar() or 0
        cancelled = db.session.execute(
            db.select(db.func.count()).select_from(Trip).where(Trip.driver_id == d.id, Trip.status == 'Cancelled')
        ).scalar() or 0
        distance = db.session.execute(
            db.select(db.func.coalesce(db.func.sum(Trip.planned_distance), 0))
            .where(Trip.driver_id == d.id, Trip.status == 'Completed')
        ).scalar() or 0.0

        efficiency = (completed / total * 100) if total > 0 else 0.0

        performances.append({
            'driver_id': d.id,
            'name': d.name,
            'email': f'{d.name.lower().replace(" ", ".")}@transitops.com',
            'total_trips': total,
            'completed_trips': completed,
            'cancelled_trips': cancelled,
            'total_distance': round(float(distance), 2),
            'total_hours': round(float(distance) / 60, 2) if distance else 0,
            'avg_rating': round(d.safety_score / 20, 1),
            'safety_score': d.safety_score,
            'efficiency_score': round(efficiency, 1),
            'on_time_percentage': round(efficiency, 1),
        })

    return jsonify(performances), 200
