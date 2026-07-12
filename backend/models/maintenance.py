from extensions import db

class MaintenanceLog(db.Model):
    __tablename__ = 'maintenance_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False)
    issue_description = db.Column(db.Text, nullable=False)
    cost = db.Column(db.Float, nullable=False, default=0.0)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Open') # 'Open', 'Closed'
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    # Relationship
    vehicle = db.relationship('Vehicle', backref=db.backref('maintenance_logs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'issue_description': self.issue_description,
            'cost': self.cost,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'vehicle': self.vehicle.to_dict() if self.vehicle else None
        }
