from flask import Blueprint, jsonify, request
from app.models.alert import Alert
from app.extensions import db

bp = Blueprint('alerts', __name__, url_prefix='/api/alerts')

@bp.route('/', methods=['GET'])
def get_alerts():
    alerts = Alert.query.order_by(Alert.created_at.desc()).limit(20).all()
    return jsonify([a.to_dict() for a in alerts]), 200

@bp.route('/<int:id>/read', methods=['PUT'])
def mark_as_read(id):
    alert = Alert.query.get(id)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    alert.is_read = True
    db.session.commit()
    
    return jsonify({'message': 'Alert marked as read'}), 200

@bp.route('/read-all', methods=['PUT'])
def mark_all_as_read():
    Alert.query.filter_by(is_read=False).update({'is_read': True})
    db.session.commit()
    return jsonify({'message': 'All alerts marked as read'}), 200
