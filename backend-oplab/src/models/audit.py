from datetime import datetime
from .user import db

class AuditLog(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    endpoint = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    response_time = db.Column(db.Float)
    cache_hits = db.Column(db.Integer)
    status = db.Column(db.Integer)
    error = db.Column(db.String(255))

    def __repr__(self):
        return f"<AuditLog {self.endpoint} {self.timestamp}>"
