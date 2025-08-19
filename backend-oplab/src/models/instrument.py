from datetime import datetime
from . import db


class Instrument(db.Model):
    """Represents a tradeable instrument such as a stock."""
    id = db.Column(db.Integer, primary_key=True)
    symbol = db.Column(db.String(20), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    sector = db.Column(db.String(120))
    currency = db.Column(db.String(10))
    exchange = db.Column(db.String(20))
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    quotes = db.relationship('Quote', backref='instrument', lazy=True)
    fundamentals = db.relationship('Fundamental', backref='instrument', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'symbol': self.symbol,
            'name': self.name,
            'sector': self.sector,
            'currency': self.currency,
            'exchange': self.exchange,
            'lastUpdated': self.last_updated.isoformat() if self.last_updated else None,
        }
