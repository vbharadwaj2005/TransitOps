from typing import Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models.expense import FuelLog, Expense
from ..models.vehicle import Vehicle
from ..extensions import db
from ..utils.auth_helpers import role_required
from datetime import datetime, date

expenses_bp = Blueprint('expenses', __name__)

@expenses_bp.route('', methods=['GET'])
@jwt_required()
@role_required(['Financial Analyst', 'Fleet Manager'])
def get_expenses() -> tuple[Any, int]:
    v_id = request.args.get('vehicle_id')
    exp_type = request.args.get('expense_type')

    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = db.select(Expense)
    if search:
        query = query.where(Expense.description.ilike(f'%{search}%'))
    if v_id:
        query = query.where(Expense.vehicle_id == v_id)
    if exp_type:
        query = query.where(Expense.expense_type == exp_type)

    pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)

    return jsonify({
        'data': [e.to_dict() for e in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    }), 200

@expenses_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['Financial Analyst', 'Fleet Manager'])
def create_expense() -> tuple[Any, int]:
    data = request.get_json() or {}
    vehicle_id = data.get('vehicle_id')
    amount = data.get('amount')
    expense_type = data.get('expense_type')
    description = data.get('description')
    date_str = data.get('date')

    if vehicle_id is None or amount is None or not expense_type or not description:
        return jsonify({'message': 'Missing required fields'}), 400

    vehicle = db.session.get(Vehicle, vehicle_id)
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    try:
        amount = float(amount)
        if amount <= 0:
            raise ValueError
    except ValueError:
        return jsonify({'message': 'amount must be a positive number.'}), 400

    try:
        if date_str:
            exp_date = datetime.strptime(date_str, '%Y-%m-%d').date()
        else:
            exp_date = date.today()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    valid_types = ['Fuel', 'Maintenance', 'Toll', 'Other']
    if expense_type not in valid_types:
        return jsonify({'message': f'Invalid expense_type. Must be one of {valid_types}'}), 400

    new_expense = Expense(
        vehicle_id=vehicle_id,
        amount=amount,
        expense_type=expense_type,
        description=description,
        date=exp_date
    )
    db.session.add(new_expense)
    db.session.commit()
    return jsonify(new_expense.to_dict()), 201

@expenses_bp.route('/fuel', methods=['GET'])
@jwt_required()
@role_required(['Financial Analyst', 'Fleet Manager', 'Driver'])
def get_fuel_logs() -> tuple[Any, int]:
    v_id = request.args.get('vehicle_id')
    query = db.select(FuelLog)
    if v_id:
        query = query.where(FuelLog.vehicle_id == v_id)
    logs = db.session.execute(query).scalars().all()
    return jsonify([l.to_dict() for l in logs]), 200

@expenses_bp.route('/fuel', methods=['POST'])
@jwt_required()
@role_required(['Financial Analyst', 'Fleet Manager', 'Driver'])
def create_fuel_log() -> tuple[Any, int]:
    data = request.get_json() or {}
    vehicle_id = data.get('vehicle_id')
    liters = data.get('liters')
    cost = data.get('cost')
    date_str = data.get('date')

    if vehicle_id is None or liters is None or cost is None:
        return jsonify({'message': 'Missing required fields: vehicle_id, liters, cost'}), 400

    vehicle = db.session.get(Vehicle, vehicle_id)
    if not vehicle:
        return jsonify({'message': 'Vehicle not found'}), 404

    try:
        liters = float(liters)
        cost = float(cost)
        if liters <= 0 or cost <= 0:
            raise ValueError
    except ValueError:
        return jsonify({'message': 'liters and cost must be positive numbers.'}), 400

    try:
        log_date = datetime.strptime(date_str, '%Y-%m-%d').date() if date_str else date.today()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    try:
        fuel_log = FuelLog(
            vehicle_id=vehicle_id,
            liters=liters,
            cost=cost,
            date=log_date
        )
        db.session.add(fuel_log)

        expense = Expense(
            vehicle_id=vehicle_id,
            amount=cost,
            expense_type='Fuel',
            description=f'Manual fuel log of {liters} L',
            date=log_date
        )
        db.session.add(expense)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': f'Database error: {str(e)}'}), 500

    return jsonify(fuel_log.to_dict()), 201
