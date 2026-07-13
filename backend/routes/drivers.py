from typing import Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models.driver import Driver
from ..extensions import db
from ..utils.auth_helpers import role_required
from datetime import datetime

drivers_bp = Blueprint('drivers', __name__)

@drivers_bp.route('', methods=['GET'])
@jwt_required()
def get_drivers() -> tuple[Any, int]:
    status = request.args.get('status')
    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)

    query = db.select(Driver)
    if search:
        query = query.where(db.or_(Driver.name.ilike(f'%{search}%'), Driver.license_number.ilike(f'%{search}%')))
    if status:
        query = query.where(Driver.status == status)

    pagination = db.paginate(query, page=page, per_page=per_page, error_out=False)

    return jsonify({
        'data': [d.to_dict() for d in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    }), 200

@drivers_bp.route('/<int:driver_id>', methods=['GET'])
@jwt_required()
def get_driver(driver_id: int) -> tuple[Any, int]:
    driver = db.get_or_404(Driver, driver_id)
    return jsonify(driver.to_dict()), 200

@drivers_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager', 'Safety Officer'])
def create_driver() -> tuple[Any, int]:
    data = request.get_json() or {}
    name = data.get('name')
    license_num = data.get('license_number')
    license_cat = data.get('license_category')
    license_expiry = data.get('license_expiry_date')
    contact_num = data.get('contact_number')
    safety_score = data.get('safety_score', 100.0)
    status = data.get('status', 'Available')

    if not name or not license_num or not license_cat or not license_expiry or not contact_num:
        return jsonify({'message': 'Missing required fields'}), 400

    license_num = license_num.strip().upper()
    existing = db.session.execute(db.select(Driver).where(Driver.license_number == license_num)).scalar()
    if existing:
        return jsonify({'message': f'Driver with license number {license_num} already exists.'}), 400

    try:
        expiry_date = datetime.strptime(license_expiry, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    try:
        safety_score = float(safety_score)
        if not (0 <= safety_score <= 100):
            raise ValueError
    except ValueError:
        return jsonify({'message': 'safety_score must be a number between 0 and 100.'}), 400

    valid_statuses = ['Available', 'On Trip', 'Off Duty', 'Suspended']
    if status not in valid_statuses:
        return jsonify({'message': f'Invalid status. Must be one of {valid_statuses}'}), 400

    new_driver = Driver(
        name=name,
        license_number=license_num,
        license_category=license_cat,
        license_expiry_date=expiry_date,
        contact_number=contact_num,
        safety_score=safety_score,
        status=status
    )
    db.session.add(new_driver)
    db.session.commit()
    return jsonify(new_driver.to_dict()), 201

@drivers_bp.route('/<int:driver_id>', methods=['PUT'])
@jwt_required()
@role_required(['Fleet Manager', 'Safety Officer'])
def update_driver(driver_id: int) -> tuple[Any, int]:
    driver = db.get_or_404(Driver, driver_id)
    data = request.get_json() or {}

    name = data.get('name')
    license_num = data.get('license_number')
    license_cat = data.get('license_category')
    license_expiry = data.get('license_expiry_date')
    contact_num = data.get('contact_number')
    safety_score = data.get('safety_score')
    status = data.get('status')

    if name:
        driver.name = name

    if license_num:
        license_num = license_num.strip().upper()
        existing = db.session.execute(db.select(Driver).where(Driver.license_number == license_num, Driver.id != driver_id)).scalar()
        if existing:
            return jsonify({'message': f'Another driver with license number {license_num} already exists.'}), 400
        driver.license_number = license_num

    if license_cat:
        driver.license_category = license_cat

    if license_expiry:
        try:
            driver.license_expiry_date = datetime.strptime(license_expiry, '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'message': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    if contact_num:
        driver.contact_number = contact_num

    if safety_score is not None:
        try:
            val = float(safety_score)
            if not (0 <= val <= 100): raise ValueError
            driver.safety_score = val
        except ValueError:
            return jsonify({'message': 'safety_score must be a number between 0 and 100.'}), 400

    if status:
        valid_statuses = ['Available', 'On Trip', 'Off Duty', 'Suspended']
        if status not in valid_statuses:
            return jsonify({'message': f'Invalid status. Must be one of {valid_statuses}'}), 400
        driver.status = status

    db.session.commit()
    return jsonify(driver.to_dict()), 200

@drivers_bp.route('/<int:driver_id>', methods=['DELETE'])
@jwt_required()
@role_required(['Fleet Manager', 'Safety Officer'])
def delete_driver(driver_id: int) -> tuple[Any, int]:
    driver = db.get_or_404(Driver, driver_id)
    db.session.delete(driver)
    db.session.commit()
    return jsonify({'message': 'Driver profile deleted successfully'}), 200
