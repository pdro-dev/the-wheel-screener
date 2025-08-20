import os
import sys
from unittest.mock import patch

import pandas as pd
import pytest

# Ensure src package is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'src')))

from main import app  # noqa: E402


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@patch('yfinance.Ticker')
def test_market_instruments_endpoint(MockTicker, client):
    instance = MockTicker.return_value
    instance.history.side_effect = Exception('fail')

    response = client.post('/api/market/instruments', json={})
    assert response.status_code == 200
    data = response.get_json()
    assert 'instruments' in data
    assert data['total'] == len(data['instruments'])


@patch('yfinance.Ticker')
def test_market_quote_endpoint(MockTicker, client):
    instance = MockTicker.return_value
    instance.history.side_effect = Exception('fail')

    symbol = 'ITUB4.SA'
    response = client.post('/api/market/quote', json={'symbols': [symbol]})
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['quotes']) == 1
    assert data['quotes'][0]['symbol'] == symbol


def test_market_options_endpoint(client):
    symbol = 'ITUB4.SA'
    response = client.get(f'/api/market/options/{symbol}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['symbol'] == symbol
    assert 'chains' in data and len(data['chains']) > 0


@patch('src.routes.oplab.OpLabAPIClient.get_user_info', return_value={
    'id': 'abc',
    'name': 'Tester',
    'apiQuota': {'daily': 100, 'used': 10, 'remaining': 90}
})
def test_user_endpoint_with_token(mock_user_info, client):
    response = client.get('/api/user', headers={'x-oplab-token': 'dummy'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['id'] == 'abc'
    assert data['dataSource'] == 'oplab'
