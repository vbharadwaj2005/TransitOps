from extensions import db

class Vehicle(db.Model):
    __tablename__ = 'vehicles'
    
    id = db.Column(db.Integer, primary_key=True)
    registration_number = db.Column(db.String(50), unique=True, nullable=False, index=True)
    model = db.Column(db.String(100), nullable=False)
    type = db.Column(db.String(50), nullable=False) # 'Truck', 'Van', 'Box Truck', 'Sedan'
    max_load_capacity = db.Column(db.Float, nullable=False) # kg
    odometer = db.Column(db.Float, nullable=False, default=0.0) # km
    acquisition_cost = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), nullable=False, default='Available') # 'Available', 'On Trip', 'In Shop', 'Retired'

    def to_dict(self):
        return {
            'id': self.id,
            'registration_number': self.registration_number,
            'model': self.model,
            'type': self.type,
            'max_load_capacity': self.max_load_capacity,
            'odometer': self.odometer,
            'acquisition_cost': self.acquisition_cost,
            'status': self.status
        }
