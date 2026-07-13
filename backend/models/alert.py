from ..extensions import db

class Alert(db.Model):
    __tablename__ = 'alerts'

    id = db.Column(db.Integer, primary_key=True)
    message = db.Column(db.String(255), nullable=False)
    type = db.Column(db.String(50), nullable=False, default='info')
    is_read = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.message.split('.')[0] if '.' in self.message else self.message[:60],
            'message': self.message,
            'type': self.type,
            'alert_type': self.type,
            'level': self.type,
            'is_read': self.is_read,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
