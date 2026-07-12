from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from models.vehicle import Vehicle
from extensions import db
from utils.auth_helpers import role_required

vehicles_bp = Blueprint('vehicles', __name__)

@vehicles_bp.route('', methods=['GET'])
@jwt_required()
def get_vehicles():
    v_type = request.args.get('type')
    status = request.args.get('status')
    
    query = Vehicle.query
    if v_type:
        query = query.filter(Vehicle.type == v_type)
    if status:
        query = query.filter(Vehicle.status == status)
        
    vehicles = query.all()
    return jsonify([v.to_dict() for v in vehicles]), 200

@vehicles_bp.route('/<int:vehicle_id>', methods=['GET'])
@jwt_required()
def get_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    return jsonify(vehicle.to_dict()), 200

@vehicles_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager'])
def create_vehicle():
    data = request.get_json() or {}
    reg_num = data.get('registration_number')
    model = data.get('model')
    v_type = data.get('type')
    max_load = data.get('max_load_capacity')
    odometer = data.get('odometer', 0.0)
    acq_cost = data.get('acquisition_cost')
    status = data.get('status', 'Available')

    if not reg_num or not model or not v_type or max_load is None or acq_cost is None:
        return jsonify({'message': 'Missing required fields'}), 400

    reg_num = reg_num.strip().upper()
    existing = Vehicle.query.filter(Vehicle.registration_number == reg_num).first()
    if existing:
        return jsonify({'message': f'Vehicle with registration number {reg_num} already exists.'}), 400

    try:
        max_load = float(max_load)
        odometer = float(odometer)
        acq_cost = float(acq_cost)
        if max_load <= 0 or odometer < 0 or acq_cost < 0:
            raise ValueError
    except ValueError:
        return jsonify({'message': 'Invalid numeric parameters. max_load_capacity must be > 0, odometer and acquisition_cost must be >= 0.'}), 400

    valid_statuses = ['Available', 'On Trip', 'In Shop', 'Retired']
    if status not in valid_statuses:
        return jsonify({'message': f'Invalid status. Must be one of {valid_statuses}'}), 400

    new_vehicle = Vehicle(
        registration_number=reg_num,
        model=model,
        type=v_type,
        max_load_capacity=max_load,
        odometer=odometer,
        acquisition_cost=acq_cost,
        status=status
    )
    db.session.add(new_vehicle)
    db.session.commit()
    return jsonify(new_vehicle.to_dict()), 201

@vehicles_bp.route('/<int:vehicle_id>', methods=['PUT'])
@jwt_required()
@role_required(['Fleet Manager'])
def update_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    data = request.get_json() or {}
    
    reg_num = data.get('registration_number')
    model = data.get('model')
    v_type = data.get('type')
    max_load = data.get('max_load_capacity')
    odometer = data.get('odometer')
    acq_cost = data.get('acquisition_cost')
    status = data.get('status')

    if reg_num:
        reg_num = reg_num.strip().upper()
        existing = Vehicle.query.filter(Vehicle.registration_number == reg_num, Vehicle.id != vehicle_id).first()
        if existing:
            return jsonify({'message': f'Another vehicle with registration number {reg_num} already exists.'}), 400
        vehicle.registration_number = reg_num

    if model:
        vehicle.model = model
    if v_type:
        vehicle.type = v_type
    
    if max_load is not None:
        try:
            val = float(max_load)
            if val <= 0: raise ValueError
            vehicle.max_load_capacity = val
        except ValueError:
            return jsonify({'message': 'max_load_capacity must be a positive number'}), 400

    if odometer is not None:
        try:
            val = float(odometer)
            if val < 0: raise ValueError
            vehicle.odometer = val
        except ValueError:
            return jsonify({'message': 'odometer must be a non-negative number'}), 400

    if acq_cost is not None:
        try:
            val = float(acq_cost)
            if val < 0: raise ValueError
            vehicle.acquisition_cost = val
        except ValueError:
            return jsonify({'message': 'acquisition_cost must be a non-negative number'}), 400

    if status:
        valid_statuses = ['Available', 'On Trip', 'In Shop', 'Retired']
        if status not in valid_statuses:
            return jsonify({'message': f'Invalid status. Must be one of {valid_statuses}'}), 400
        vehicle.status = status

    db.session.commit()
    return jsonify(vehicle.to_dict()), 200

@vehicles_bp.route('/<int:vehicle_id>', methods=['DELETE'])
@jwt_required()
@role_required(['Fleet Manager'])
def delete_vehicle(vehicle_id):
    vehicle = Vehicle.query.get_or_404(vehicle_id)
    db.session.delete(vehicle)
    db.session.commit()
    return jsonify({'message': 'Vehicle deleted successfully'}), 200
