from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import db, bcrypt, jwt, migrate

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/api/*": {
        "origins": "*",
        "allow_headers": ["Content-Type", "Authorization"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }})
    db.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.vehicles import vehicles_bp
    from app.routes.drivers import drivers_bp
    from app.routes.trips import trips_bp
    from app.routes.maintenance import maintenance_bp
    from app.routes.expenses import expenses_bp
    from app.routes.analytics import analytics_bp
    from app.routes.alerts import bp as alerts_bp
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vehicles_bp, url_prefix='/api/vehicles')
    app.register_blueprint(drivers_bp, url_prefix='/api/drivers')
    app.register_blueprint(trips_bp, url_prefix='/api/trips')
    app.register_blueprint(maintenance_bp, url_prefix='/api/maintenance')
    app.register_blueprint(expenses_bp, url_prefix='/api/expenses')
    app.register_blueprint(analytics_bp, url_prefix='/api/analytics')
    app.register_blueprint(alerts_bp)
    return app
