from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from app.models.maintenance import MaintenanceLog
from app.models.vehicle import Vehicle
from app.models.expense import Expense
from app.extensions import db
from app.utils.auth_helpers import role_required
from datetime import datetime, date

maintenance_bp = Blueprint('maintenance', __name__)

@maintenance_bp.route('', methods=['GET'])
@jwt_required()
def get_logs():
    logs = MaintenanceLog.query.all()
    return jsonify([l.to_dict() for l in logs]), 200

@maintenance_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager'])
def create_log():
    data = request.get_json() or {}
    vehicle_id = data.get('vehicle_id')
    issue_description = data.get('issue_description')
    start_date_str = data.get('start_date')

    if vehicle_id is None or not issue_description:
        return jsonify({'message': 'Missing required fields: vehicle_id, issue_description'}), 400

    vehicle = Vehicle.query.get(vehicle_id)
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    if vehicle.status == 'Retired':
        return jsonify({'message': 'Cannot place a retired vehicle in maintenance.'}), 400

    try:
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = date.today()
    except ValueError:
        return jsonify({'message': 'Invalid start_date format. Expected YYYY-MM-DD.'}), 400

    try:
        new_log = MaintenanceLog(
            vehicle_id=vehicle_id,
            issue_description=issue_description,
            start_date=start_date,
            status='Open'
        )
        vehicle.status = 'In Shop'
        db.session.add(new_log)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

    return jsonify(new_log.to_dict()), 201

@maintenance_bp.route('/<int:log_id>/close', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager'])
def close_log(log_id):
    log = MaintenanceLog.query.get_or_404(log_id)
    if log.status != 'Open':
        return jsonify({'message': 'This maintenance log is already closed.'}), 400

    data = request.get_json() or {}
    cost = data.get('cost')
    end_date_str = data.get('end_date')

    if cost is None:
        return jsonify({'message': 'Missing required field: cost'}), 400

    try:
        cost = float(cost)
        if cost < 0:
            raise ValueError
    except ValueError:
        return jsonify({'message': 'Cost must be a non-negative number.'}), 400

    try:
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = date.today()
        if end_date < log.start_date:
            return jsonify({'message': f'End date ({end_date}) cannot be before start date ({log.start_date}).'}), 400
    except ValueError:
        return jsonify({'message': 'Invalid end_date format. Expected YYYY-MM-DD.'}), 400

    vehicle = Vehicle.query.get(log.vehicle_id)

    try:
        log.status = 'Closed'
        log.cost = cost
        log.end_date = end_date

        if vehicle and vehicle.status != 'Retired':
            vehicle.status = 'Available'

        expense = Expense(
            vehicle_id=log.vehicle_id,
            amount=cost,
            expense_type='Maintenance',
            description=f'Maintenance Closeout: {log.issue_description}',
            date=end_date
        )
        db.session.add(expense)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error during closure: {str(e)}'}), 500

    return jsonify(log.to_dict()), 200
