from flask import Blueprint, jsonify, request
from sqlalchemy import update
from flask_jwt_extended import jwt_required
from ..models.alert import Alert
from ..extensions import db

bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

@bp.route('', methods=['GET'])
@jwt_required()
def get_alerts():
    alerts = db.session.execute(db.select(Alert).order_by(Alert.created_at.desc()).limit(20)).scalars().all()
    return jsonify([a.to_dict() for a in alerts]), 200

@bp.route('/<int:id>/read', methods=['PUT'])
@jwt_required()
def mark_as_read(id):
    alert = db.session.get(Alert, id)
    if not alert:
        return jsonify({'message': 'Alert not found'}), 404
    alert.is_read = True
    db.session.commit()
    return jsonify({'message': 'Alert marked as read'}), 200

@bp.route('/read-all', methods=['PUT'])
@jwt_required()
def mark_all_as_read():
    db.session.execute(update(Alert).where(Alert.is_read == False).values(is_read=True))
    db.session.commit()
    return jsonify({'message': 'All alerts marked as read'}), 200

@bp.route('/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_alert(id):
    alert = db.session.get(Alert, id)
    if not alert:
        return jsonify({'message': 'Alert not found'}), 404
    db.session.delete(alert)
    db.session.commit()
    return jsonify({'message': 'Alert deleted'}), 200
