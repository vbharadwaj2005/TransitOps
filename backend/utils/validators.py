from datetime import date


def validate_odometer(final_odometer, current_odometer):
    if final_odometer <= current_odometer:
        return False, f'Final odometer ({final_odometer} km) must be greater than current odometer ({current_odometer} km).'
    return True, None


def validate_cargo_weight(cargo_weight, max_load_capacity):
    if cargo_weight > max_load_capacity:
        return False, f'Cargo weight ({cargo_weight} kg) exceeds vehicle capacity ({max_load_capacity} kg).'
    return True, None


def validate_license_expiry(expiry_date):
    if expiry_date < date.today():
        return False, f'License expired on {expiry_date}.'
    return True, None
