from app.extensions import db

class Driver(db.Model):
    __tablename__ = 'drivers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    license_number = db.Column(db.String(50), unique=True, nullable=False)
    license_category = db.Column(db.String(50), nullable=False) # 'Class A', 'Class B', 'Commercial'
    license_expiry_date = db.Column(db.Date, nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)
    safety_score = db.Column(db.Float, default=100.0)
    status = db.Column(db.String(50), nullable=False, default='Available') # 'Available', 'On Trip', 'Off Duty', 'Suspended'

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'license_number': self.license_number,
            'license_category': self.license_category,
            'license_expiry_date': self.license_expiry_date.isoformat() if self.license_expiry_date else None,
            'contact_number': self.contact_number,
            'safety_score': self.safety_score,
            'status': self.status
        }
