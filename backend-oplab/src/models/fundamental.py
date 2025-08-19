from datetime import datetime
from . import db


class Fundamental(db.Model):
    """Stores fundamental indicators for an instrument."""
    id = db.Column(db.Integer, primary_key=True)
    instrument_id = db.Column(db.Integer, db.ForeignKey('instrument.id'), nullable=False)
    roic = db.Column(db.Float)
    roe = db.Column(db.Float)
    debt_to_equity = db.Column(db.Float)
    revenue = db.Column(db.Float)
    dividend_yield = db.Column(db.Float)
    last_updated = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'symbol': self.instrument.symbol if getattr(self, 'instrument', None) else None,
            'roic': self.roic,
            'roe': self.roe,
            'debtToEquity': self.debt_to_equity,
            'revenue': self.revenue,
            'dividendYield': self.dividend_yield,
            'lastUpdated': self.last_updated.isoformat() if self.last_updated else None,
        }
