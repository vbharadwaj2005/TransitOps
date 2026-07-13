from ..extensions import db

class TripTemplate(db.Model):
    __tablename__ = 'trip_templates'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    route_name = db.Column(db.String(200), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=True, index=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=True, index=True)
    departure_time = db.Column(db.String(10), nullable=False)
    estimated_duration = db.Column(db.Float, nullable=True)
    estimated_distance = db.Column(db.Float, nullable=True)
    estimated_cost = db.Column(db.Float, nullable=True)
    estimated_revenue = db.Column(db.Float, nullable=True)
    passenger_capacity = db.Column(db.Integer, nullable=True)
    recurring = db.Column(db.String(20), nullable=False, default='daily')
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    driver = db.relationship('Driver', backref=db.backref('trip_templates', lazy=True))
    vehicle = db.relationship('Vehicle', backref=db.backref('trip_templates', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'route_name': self.route_name,
            'driver_id': self.driver_id,
            'driver_name': self.driver.name if self.driver else None,
            'vehicle_id': self.vehicle_id,
            'vehicle_reg': self.vehicle.registration_number if self.vehicle else None,
            'departure_time': self.departure_time,
            'estimated_duration': self.estimated_duration,
            'estimated_distance': self.estimated_distance,
            'estimated_cost': self.estimated_cost,
            'estimated_revenue': self.estimated_revenue,
            'passenger_capacity': self.passenger_capacity,
            'recurring': self.recurring,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
