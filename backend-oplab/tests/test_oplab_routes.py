import os
import sys
from unittest.mock import patch

import pandas as pd
import pytest

# Ensure src package is importable
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'src')))

from main import app  # noqa: E402
from routes.oplab import MockDataGenerator  # noqa: E402


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_endpoint(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert '/api/quotes' in data['endpoints']


def test_instruments_endpoint(client):
    response = client.post('/api/instruments', json={})
    assert response.status_code == 200
    data = response.get_json()
    assert 'instruments' in data
    assert data['total'] == len(data['instruments'])
    assert len(data['instruments']) > 0


def test_quotes_endpoint(client):
    symbol = 'ITUB4.SA'
    response = client.post('/api/quotes', json={'symbols': [symbol]})
    assert response.status_code == 200
    data = response.get_json()
    assert len(data['quotes']) == 1
    assert data['quotes'][0]['symbol'] == symbol


def test_fundamentals_endpoint(client):
    symbol = 'ITUB4.SA'
    response = client.get(f'/api/fundamentals/{symbol}')
    assert response.status_code == 200
    data = response.get_json()
    assert data['fundamentals']['symbol'] == symbol


@patch('yfinance.Ticker')
def test_get_real_stock_data_real(MockTicker):
    mock_hist = pd.DataFrame({'Close': [10.0, 11.0], 'Volume': [1000, 2000]})
    instance = MockTicker.return_value
    instance.history.return_value = mock_hist

    gen = MockDataGenerator()
    result = gen.get_real_stock_data('ITUB4.SA')

    assert result['dataSource'] == 'real'
    assert result['price'] == 11.0
    assert result['volume'] == 2000
    assert result['historicalPrices'] == [10.0, 11.0]


@patch('yfinance.Ticker')
def test_get_real_stock_data_mock(MockTicker):
    instance = MockTicker.return_value
    instance.history.side_effect = Exception('fail')

    gen = MockDataGenerator()
    result = gen.get_real_stock_data('ITUB4.SA')

    assert result['dataSource'] == 'mock'
    assert 'price' in result and 'volume' in result
    assert len(result['historicalPrices']) == 252
