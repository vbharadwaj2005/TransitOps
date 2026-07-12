from app import create_app
from extensions import db
from models.user import User
from models.vehicle import Vehicle
from models.driver import Driver
from datetime import date, timedelta

app = create_app()

with app.app_context():
    print("Initializing Database...")
    db.create_all()

    roles_info = [
        ('manager@transitops.com', 'Fleet Manager'),
        ('driver@transitops.com', 'Driver'),
        ('safety@transitops.com', 'Safety Officer'),
        ('analyst@transitops.com', 'Financial Analyst'),
    ]

    for email, role in roles_info:
        existing = User.query.filter_by(email=email).first()
        if not existing:
            u = User(email=email, role=role)
            u.set_password('transitops123')
            db.session.add(u)
            print(f"Seeded User: {email} ({role})")
        else:
            print(f"User {email} already exists.")

    if Vehicle.query.count() == 0:
        v1 = Vehicle(registration_number='REG-V01', model='Ford Transit', type='Van', max_load_capacity=800, odometer=15000, acquisition_cost=32000, status='Available')
        v2 = Vehicle(registration_number='REG-T01', model='Volvo FH16', type='Truck', max_load_capacity=15000, odometer=85000, acquisition_cost=120000, status='Available')
        v3 = Vehicle(registration_number='REG-S01', model='Toyota HiAce', type='Van', max_load_capacity=1000, odometer=54000, acquisition_cost=28000, status='In Shop')
        db.session.add_all([v1, v2, v3])
        print("Seeded sample vehicles.")

    if Driver.query.count() == 0:
        d1 = Driver(name='John Doe', license_number='LIC-JOHN123', license_category='Class A', license_expiry_date=date.today() + timedelta(days=365), contact_number='+123456789', safety_score=95.0, status='Available')
        d2 = Driver(name='Jane Smith', license_number='LIC-JANE456', license_category='Class B', license_expiry_date=date.today() + timedelta(days=200), contact_number='+987654321', safety_score=98.0, status='Available')
        d3 = Driver(name='Suspended Sam', license_number='LIC-SAM789', license_category='Commercial', license_expiry_date=date.today() - timedelta(days=10), contact_number='+111222333', safety_score=60.0, status='Suspended')
        db.session.add_all([d1, d2, d3])
        print("Seeded sample drivers.")

    db.session.commit()
    print("Database seeding completed successfully.")
