from datetime import datetime
from . import db


class Quote(db.Model):
    """Stores quote information for an instrument."""
    id = db.Column(db.Integer, primary_key=True)
    instrument_id = db.Column(db.Integer, db.ForeignKey('instrument.id'), nullable=False)
    price = db.Column(db.Float, nullable=False)
    volume = db.Column(db.Integer)
    change = db.Column(db.Float)
    change_percent = db.Column(db.Float)
    bid = db.Column(db.Float)
    ask = db.Column(db.Float)
    high_52w = db.Column(db.Float)
    low_52w = db.Column(db.Float)
    historical_prices = db.Column(db.JSON)
    data_source = db.Column(db.String(50))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'symbol': self.instrument.symbol if self.instrument else None,
            'price': self.price,
            'volume': self.volume,
            'change': self.change,
            'changePercent': self.change_percent,
            'bid': self.bid,
            'ask': self.ask,
            'high52w': self.high_52w,
            'low52w': self.low_52w,
            'historicalPrices': self.historical_prices,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'dataSource': self.data_source,
        }
