from app.extensions import db

class Trip(db.Model):
    __tablename__ = 'trips'
    
    id = db.Column(db.Integer, primary_key=True)
    source = db.Column(db.String(100), nullable=False)
    destination = db.Column(db.String(100), nullable=False)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    driver_id = db.Column(db.Integer, db.ForeignKey('drivers.id'), nullable=False)
    cargo_weight = db.Column(db.Float, nullable=False) # kg
    planned_distance = db.Column(db.Float, nullable=False) # km
    revenue = db.Column(db.Float, nullable=False, default=0.0)
    final_odometer = db.Column(db.Float, nullable=True)
    fuel_consumed = db.Column(db.Float, nullable=True) # liters
    status = db.Column(db.String(50), nullable=False, default='Draft') # 'Draft', 'Dispatched', 'Completed', 'Cancelled'
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
    updated_at = db.Column(db.DateTime, default=db.func.current_timestamp(), onupdate=db.func.current_timestamp())

    # Relationships
    vehicle = db.relationship('Vehicle', backref=db.backref('trips', lazy=True))
    driver = db.relationship('Driver', backref=db.backref('trips', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'source': self.source,
            'destination': self.destination,
            'vehicle_id': self.vehicle_id,
            'driver_id': self.driver_id,
            'cargo_weight': self.cargo_weight,
            'planned_distance': self.planned_distance,
            'revenue': self.revenue,
            'final_odometer': self.final_odometer,
            'fuel_consumed': self.fuel_consumed,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'vehicle': self.vehicle.to_dict() if self.vehicle else None,
            'driver': self.driver.to_dict() if self.driver else None
        }
