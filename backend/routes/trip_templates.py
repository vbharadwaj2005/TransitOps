from typing import Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models.trip_template import TripTemplate
from ..extensions import db
from ..utils.auth_helpers import role_required

trip_templates_bp = Blueprint('trip_templates', __name__)

@trip_templates_bp.route('', methods=['GET'])
@jwt_required()
def get_templates() -> tuple[Any, int]:
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 15, type=int)

    pagination = db.paginate(
        db.select(TripTemplate).order_by(TripTemplate.created_at.desc()),
        page=page, per_page=per_page, error_out=False
    )

    return jsonify({
        'data': [t.to_dict() for t in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page
    }), 200

@trip_templates_bp.route('', methods=['POST'])
@jwt_required()
@role_required(['Fleet Manager'])
def create_template() -> tuple[Any, int]:
    data = request.get_json() or {}
    name = data.get('name')
    route_name = data.get('route_name')
    if not name or not route_name:
        return jsonify({'message': 'Name and route_name are required'}), 400

    template = TripTemplate(
        name=name,
        route_name=route_name,
        driver_id=data.get('driver_id'),
        vehicle_id=data.get('vehicle_id'),
        departure_time=data.get('departure_time', '08:00'),
        estimated_duration=data.get('estimated_duration'),
        estimated_distance=data.get('estimated_distance'),
        estimated_cost=data.get('estimated_cost'),
        estimated_revenue=data.get('estimated_revenue'),
        passenger_capacity=data.get('passenger_capacity'),
        recurring=data.get('recurring', 'daily'),
        notes=data.get('notes'),
    )
    db.session.add(template)
    db.session.commit()
    return jsonify(template.to_dict()), 201

@trip_templates_bp.route('/<int:template_id>', methods=['PUT'])
@jwt_required()
@role_required(['Fleet Manager'])
def update_template(template_id: int) -> tuple[Any, int]:
    template = db.get_or_404(TripTemplate, template_id)
    data = request.get_json() or {}

    for field in ['name', 'route_name', 'driver_id', 'vehicle_id', 'departure_time',
                  'estimated_duration', 'estimated_distance', 'estimated_cost',
                  'estimated_revenue', 'passenger_capacity', 'recurring', 'notes']:
        if field in data:
            setattr(template, field, data[field])

    db.session.commit()
    return jsonify(template.to_dict()), 200
