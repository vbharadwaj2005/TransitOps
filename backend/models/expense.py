from ..extensions import db

class FuelLog(db.Model):
    __tablename__ = 'fuel_logs'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False, index=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=True)
    liters = db.Column(db.Float, nullable=False)
    cost = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    vehicle = db.relationship('Vehicle', backref=db.backref('fuel_logs', lazy=True))
    trip = db.relationship('Trip', backref=db.backref('fuel_logs', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'trip_id': self.trip_id,
            'liters': self.liters,
            'cost': self.cost,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Expense(db.Model):
    __tablename__ = 'expenses'

    id = db.Column(db.Integer, primary_key=True)
    vehicle_id = db.Column(db.Integer, db.ForeignKey('vehicles.id'), nullable=False, index=True)
    trip_id = db.Column(db.Integer, db.ForeignKey('trips.id'), nullable=True)
    amount = db.Column(db.Float, nullable=False)
    expense_type = db.Column(db.String(50), nullable=False, index=True)
    description = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    vehicle = db.relationship('Vehicle', backref=db.backref('expenses', lazy=True))
    trip = db.relationship('Trip', backref=db.backref('expenses', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'vehicle_id': self.vehicle_id,
            'trip_id': self.trip_id,
            'amount': self.amount,
            'expense_type': self.expense_type,
            'description': self.description,
            'date': self.date.isoformat() if self.date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
