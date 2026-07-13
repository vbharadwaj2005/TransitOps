import os
from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, bcrypt, jwt, migrate, limiter
from datetime import date, timedelta

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    origins = os.environ.get('CORS_ORIGINS', 'http://localhost:5173')
    CORS(app, resources={r"/api/*": {
        "origins": origins.split(','),
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)
    limiter.init_app(app)

    from flask import jsonify

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'message': 'Token has expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'message': 'Invalid token'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'message': 'Authorization header is missing'}), 401

    from .routes.auth import auth_bp
    from .routes.vehicles import vehicles_bp
    from .routes.drivers import drivers_bp
    from .routes.trips import trips_bp
    from .routes.maintenance import maintenance_bp
    from .routes.expenses import expenses_bp
    from .routes.analytics import analytics_bp
    from .routes.alerts import bp as alerts_bp
    from .routes.trip_templates import trip_templates_bp
    from .routes.bookings import bookings_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vehicles_bp, url_prefix='/api/vehicles')
    app.register_blueprint(drivers_bp, url_prefix='/api/drivers')
    app.register_blueprint(trips_bp, url_prefix='/api/trips')
    app.register_blueprint(maintenance_bp, url_prefix='/api/maintenance')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(alerts_bp)
    app.register_blueprint(trip_templates_bp, url_prefix='/api/trip-templates')
    app.register_blueprint(bookings_bp, url_prefix='/api/bookings')

    with app.app_context():
        db.create_all()

        if app.config.get('TESTING'):
            return app

        from .models.user import User
        from .models.vehicle import Vehicle
        from .models.driver import Driver

        if db.session.execute(db.select(db.func.count()).select_from(User)).scalar() == 0:
            roles = [
                ('manager@transitops.com', 'Fleet Manager'),
                ('driver@transitops.com', 'Driver'),
                ('safety@transitops.com', 'Safety Officer'),
                ('analyst@transitops.com', 'Financial Analyst'),
            ]
            for email, role in roles:
                u = User(email=email, role=role)
                u.set_password('transitops123')
                db.session.add(u)

        if db.session.execute(db.select(db.func.count()).select_from(Vehicle)).scalar() == 0:
            db.session.add_all([
                Vehicle(registration_number='REG-V01', model='Ford Transit', type='Van', max_load_capacity=800, odometer=15000, acquisition_cost=32000, status='Available'),
                Vehicle(registration_number='REG-T01', model='Volvo FH16', type='Truck', max_load_capacity=15000, odometer=85000, acquisition_cost=120000, status='Available'),
                Vehicle(registration_number='REG-S01', model='Toyota HiAce', type='Van', max_load_capacity=1000, odometer=54000, acquisition_cost=28000, status='In Shop'),
            ])

        if db.session.execute(db.select(db.func.count()).select_from(Driver)).scalar() == 0:
            db.session.add_all([
                Driver(name='John Doe', license_number='LIC-JOHN123', license_category='Class A', license_expiry_date=date.today() + timedelta(days=365), contact_number='+123456789', safety_score=95.0, status='Available'),
                Driver(name='Jane Smith', license_number='LIC-JANE456', license_category='Class B', license_expiry_date=date.today() + timedelta(days=200), contact_number='+987654321', safety_score=98.0, status='Available'),
                Driver(name='Suspended Sam', license_number='LIC-SAM789', license_category='Commercial', license_expiry_date=date.today() - timedelta(days=10), contact_number='+111222333', safety_score=60.0, status='Suspended'),
            ])

        db.session.commit()

    return app
