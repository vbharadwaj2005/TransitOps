from typing import Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from ..models.user import User
from ..extensions import db, limiter

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
@limiter.limit("5 per minute")
def register() -> tuple[Any, int]:
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not email or not password or not role:
        return jsonify({'message': 'Missing email, password, or role'}), 400

    valid_roles = ['Fleet Manager', 'Driver', 'Safety Officer', 'Financial Analyst']
    if role not in valid_roles:
        return jsonify({'message': f'Invalid role. Must be one of {valid_roles}'}), 400

    if db.session.execute(db.select(User).filter_by(email=email)).scalar():
        return jsonify({'message': 'User with this email already exists'}), 400

    new_user = User(email=email, role=role)
    new_user.set_password(password)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully', 'user': new_user.to_dict()}), 201

@auth_bp.route('/login', methods=['POST'])
@limiter.limit("10 per minute")
def login() -> tuple[Any, int]:
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Missing email or password'}), 400

    user = db.session.execute(db.select(User).filter_by(email=email)).scalar()
    if not user or not user.check_password(password):
        return jsonify({'message': 'Invalid email or password'}), 401

    access_token = create_access_token(identity=str(user.id), additional_claims={'role': user.role, 'email': user.email})
    return jsonify({
        'token': access_token,
        'user': user.to_dict()
    }), 200

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile() -> tuple[Any, int]:
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    return jsonify(user.to_dict()), 200
