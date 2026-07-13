from typing import Any
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from ..models.booking import Booking
from ..extensions import db
from datetime import datetime

bookings_bp = Blueprint('bookings', __name__)

@bookings_bp.route('', methods=['POST'])
@jwt_required()
def create_booking() -> tuple[Any, int]:
    data = request.get_json() or {}
    route_name = data.get('route_name')
    date_str = data.get('date')

    if not route_name or not date_str:
        return jsonify({'message': 'route_name and date are required'}), 400

    try:
        booking_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': 'Invalid date format. Expected YYYY-MM-DD.'}), 400

    booking = Booking(
        route_name=route_name,
        date=booking_date,
        description=data.get('description'),
    )
    db.session.add(booking)
    db.session.commit()
    return jsonify(booking.to_dict()), 201
