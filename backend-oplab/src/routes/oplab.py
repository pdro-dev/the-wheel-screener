from flask import Blueprint, request, jsonify
import requests
import json
import time
import random
from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd
import numpy as np

oplab_bp = Blueprint('oplab', __name__, url_prefix='/api')

# Mock data generators for realistic financial data
class MockDataGenerator:
    def __init__(self):
        self.sectors = [
            'Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical',
            'Communication Services', 'Industrials', 'Consumer Defensive',
            'Energy', 'Utilities', 'Real Estate', 'Basic Materials'
        ]
        
        self.brazilian_stocks = [
            # Technology
            {'symbol': 'MGLU3.SA', 'name': 'Magazine Luiza', 'sector': 'Technology'},
            {'symbol': 'PETZ3.SA', 'name': 'Petz', 'sector': 'Technology'},
            {'symbol': 'LWSA3.SA', 'name': 'Locaweb', 'sector': 'Technology'},
            
            # Financial Services
            {'symbol': 'ITUB4.SA', 'name': 'Itaú Unibanco', 'sector': 'Financial Services'},
            {'symbol': 'BBDC4.SA', 'name': 'Bradesco', 'sector': 'Financial Services'},
            {'symbol': 'BBAS3.SA', 'name': 'Banco do Brasil', 'sector': 'Financial Services'},
            {'symbol': 'SANB11.SA', 'name': 'Santander Brasil', 'sector': 'Financial Services'},
            
            # Consumer Cyclical
            {'symbol': 'VVAR3.SA', 'name': 'Via Varejo', 'sector': 'Consumer Cyclical'},
            {'symbol': 'LREN3.SA', 'name': 'Lojas Renner', 'sector': 'Consumer Cyclical'},
            {'symbol': 'AMER3.SA', 'name': 'Americanas', 'sector': 'Consumer Cyclical'},
            
            # Healthcare
            {'symbol': 'RDOR3.SA', 'name': 'Rede D\'Or', 'sector': 'Healthcare'},
            {'symbol': 'HAPV3.SA', 'name': 'Hapvida', 'sector': 'Healthcare'},
            {'symbol': 'QUAL3.SA', 'name': 'Qualicorp', 'sector': 'Healthcare'},
            
            # Energy
            {'symbol': 'PETR4.SA', 'name': 'Petrobras', 'sector': 'Energy'},
            {'symbol': 'PETR3.SA', 'name': 'Petrobras', 'sector': 'Energy'},
            {'symbol': 'PRIO3.SA', 'name': 'PetroRio', 'sector': 'Energy'},
            
            # Basic Materials
            {'symbol': 'VALE3.SA', 'name': 'Vale', 'sector': 'Basic Materials'},
            {'symbol': 'CSNA3.SA', 'name': 'CSN', 'sector': 'Basic Materials'},
            {'symbol': 'USIM5.SA', 'name': 'Usiminas', 'sector': 'Basic Materials'},
            
            # Consumer Defensive
            {'symbol': 'ABEV3.SA', 'name': 'Ambev', 'sector': 'Consumer Defensive'},
            {'symbol': 'JBSS3.SA', 'name': 'JBS', 'sector': 'Consumer Defensive'},
            {'symbol': 'BRFS3.SA', 'name': 'BRF', 'sector': 'Consumer Defensive'},
            
            # Utilities
            {'symbol': 'ELET3.SA', 'name': 'Eletrobras', 'sector': 'Utilities'},
            {'symbol': 'CPFE3.SA', 'name': 'CPFL Energia', 'sector': 'Utilities'},
            {'symbol': 'EGIE3.SA', 'name': 'Engie Brasil', 'sector': 'Utilities'},
            
            # Communication Services
            {'symbol': 'TIMS3.SA', 'name': 'TIM', 'sector': 'Communication Services'},
            {'symbol': 'VIVT3.SA', 'name': 'Vivo', 'sector': 'Communication Services'},
            
            # Real Estate
            {'symbol': 'MULT3.SA', 'name': 'Multiplan', 'sector': 'Real Estate'},
            {'symbol': 'BRML3.SA', 'name': 'BR Malls', 'sector': 'Real Estate'},
            
            # Industrials
            {'symbol': 'AZUL4.SA', 'name': 'Azul', 'sector': 'Industrials'},
            {'symbol': 'GOLL4.SA', 'name': 'Gol', 'sector': 'Industrials'},
            {'symbol': 'RAIL3.SA', 'name': 'Rumo', 'sector': 'Industrials'}
        ]

    def generate_realistic_price_data(self, symbol, days=252):
        """Generate realistic price data using random walk with drift"""
        base_price = random.uniform(10, 200)
        prices = [base_price]
        
        # Parameters for realistic Brazilian stock behavior
        daily_return_mean = 0.0005  # Slight positive drift
        daily_volatility = random.uniform(0.015, 0.045)  # 1.5% to 4.5% daily vol
        
        for i in range(days - 1):
            # Random walk with mean reversion
            random_shock = np.random.normal(daily_return_mean, daily_volatility)
            
            # Add some mean reversion
            mean_reversion = -0.001 * (prices[-1] - base_price) / base_price
            
            # Calculate next price
            next_price = prices[-1] * (1 + random_shock + mean_reversion)
            next_price = max(next_price, 1.0)  # Minimum price of R$1
            prices.append(next_price)
        
        return prices

    def get_real_stock_data(self, symbol):
        """Try to get real data from Yahoo Finance, fallback to mock"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1y")
            
            if len(hist) > 0:
                current_price = float(hist['Close'].iloc[-1])
                volume = int(hist['Volume'].iloc[-1])
                prices = hist['Close'].tolist()
                
                return {
                    'price': current_price,
                    'volume': volume,
                    'historicalPrices': prices[-252:],  # Last year
                    'dataSource': 'real'
                }
        except Exception as e:
            print(f"Failed to get real data for {symbol}: {e}")
        
        # Fallback to mock data
        prices = self.generate_realistic_price_data(symbol)
        return {
            'price': prices[-1],
            'volume': random.randint(50000, 5000000),
            'historicalPrices': prices,
            'dataSource': 'mock'
        }

    def generate_fundamentals(self, symbol, sector):
        """Generate realistic fundamental data"""
        # Sector-specific ranges for more realism
        sector_params = {
            'Technology': {'roic_range': (8, 25), 'roe_range': (10, 30), 'debt_range': (0.1, 0.8)},
            'Financial Services': {'roic_range': (5, 15), 'roe_range': (8, 20), 'debt_range': (0.2, 1.5)},
            'Healthcare': {'roic_range': (10, 20), 'roe_range': (12, 25), 'debt_range': (0.2, 0.9)},
            'Energy': {'roic_range': (3, 12), 'roe_range': (5, 18), 'debt_range': (0.3, 1.2)},
            'Consumer Cyclical': {'roic_range': (6, 18), 'roe_range': (8, 22), 'debt_range': (0.2, 1.0)},
            'Consumer Defensive': {'roic_range': (8, 16), 'roe_range': (10, 20), 'debt_range': (0.3, 0.8)},
            'Utilities': {'roic_range': (4, 10), 'roe_range': (6, 15), 'debt_range': (0.5, 1.5)},
            'Basic Materials': {'roic_range': (5, 15), 'roe_range': (8, 20), 'debt_range': (0.4, 1.1)},
            'Industrials': {'roic_range': (6, 16), 'roe_range': (9, 22), 'debt_range': (0.3, 1.0)},
            'Real Estate': {'roic_range': (3, 8), 'roe_range': (5, 12), 'debt_range': (0.6, 2.0)},
            'Communication Services': {'roic_range': (7, 18), 'roe_range': (10, 25), 'debt_range': (0.4, 1.2)}
        }
        
        params = sector_params.get(sector, sector_params['Technology'])
        
        return {
            'symbol': symbol,
            'roic': round(random.uniform(*params['roic_range']), 2),
            'roe': round(random.uniform(*params['roe_range']), 2),
            'debtToEquity': round(random.uniform(*params['debt_range']), 2),
            'revenue': random.randint(500000000, 50000000000),  # R$ 500M to R$ 50B
            'revenueGrowth': round(random.uniform(-0.15, 0.30), 3),  # -15% to +30%
            'dividendYield': round(random.uniform(0, 0.08), 3),  # 0% to 8%
            'marketCap': random.randint(1000000000, 500000000000),  # R$ 1B to R$ 500B
            'peRatio': round(random.uniform(5, 35), 2),
            'pbRatio': round(random.uniform(0.5, 5), 2),
            'sector': sector,
            'lastUpdated': datetime.now().isoformat()
        }

# Initialize mock data generator
mock_generator = MockDataGenerator()

@oplab_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'OpLab API Backend',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'endpoints': [
            '/api/health',
            '/api/instruments',
            '/api/quotes',
            '/api/fundamentals/<symbol>',
            '/api/screening',
            '/api/user'
        ]
    })

@oplab_bp.route('/user', methods=['GET'])
def get_user_info():
    """Get user information"""
    token = request.headers.get('x-oplab-token')
    
    if not token:
        return jsonify({'error': 'Token required'}), 401
    
    # Mock user data based on token
    return jsonify({
        'id': 'user_123',
        'name': 'Pedro Developer',
        'email': 'pdro.dev@example.com',
        'plan': 'premium',
        'apiQuota': {
            'daily': 10000,
            'used': random.randint(100, 5000),
            'remaining': lambda used: 10000 - used
        },
        'permissions': ['read', 'screening', 'fundamentals'],
        'lastLogin': datetime.now().isoformat(),
        'accountCreated': '2024-01-15T10:00:00Z'
    })

@oplab_bp.route('/instruments', methods=['POST'])
def get_instruments():
    """Get instruments with filtering"""
    try:
        filters = request.get_json() or {}
        
        # Start with all Brazilian stocks
        instruments = []
        
        for stock in mock_generator.brazilian_stocks:
            # Get realistic price data
            price_data = mock_generator.get_real_stock_data(stock['symbol'])
            
            instrument = {
                'symbol': stock['symbol'],
                'name': stock['name'],
                'sector': stock['sector'],
                'price': price_data['price'],
                'volume': price_data['volume'],
                'currency': 'BRL',
                'exchange': 'B3',
                'dataSource': price_data['dataSource']
            }
            
            # Apply filters
            if 'minPrice' in filters and instrument['price'] < filters['minPrice']:
                continue
            if 'maxPrice' in filters and instrument['price'] > filters['maxPrice']:
                continue
            if 'minVolume' in filters and instrument['volume'] < filters['minVolume']:
                continue
            if 'sectors' in filters and filters['sectors'] and instrument['sector'] not in filters['sectors']:
                continue
                
            instruments.append(instrument)
        
        return jsonify({
            'instruments': instruments,
            'total': len(instruments),
            'filters_applied': filters,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/quotes', methods=['POST'])
def get_quotes():
    """Get current quotes for symbols"""
    try:
        data = request.get_json()
        symbols = data.get('symbols', [])
        
        if not symbols:
            return jsonify({'error': 'Symbols required'}), 400
        
        quotes = []
        for symbol in symbols:
            # Find stock info
            stock_info = next((s for s in mock_generator.brazilian_stocks if s['symbol'] == symbol), None)
            if not stock_info:
                continue
                
            # Get realistic price data
            price_data = mock_generator.get_real_stock_data(symbol)
            
            quote = {
                'symbol': symbol,
                'price': price_data['price'],
                'volume': price_data['volume'],
                'change': round(random.uniform(-5, 5), 2),
                'changePercent': round(random.uniform(-0.08, 0.08), 4),
                'bid': price_data['price'] * 0.999,
                'ask': price_data['price'] * 1.001,
                'high52w': max(price_data['historicalPrices']),
                'low52w': min(price_data['historicalPrices']),
                'historicalPrices': price_data['historicalPrices'],
                'timestamp': datetime.now().isoformat(),
                'dataSource': price_data['dataSource']
            }
            
            quotes.append(quote)
        
        return jsonify({
            'quotes': quotes,
            'requested': len(symbols),
            'returned': len(quotes),
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/fundamentals/<symbol>', methods=['GET'])
def get_fundamentals(symbol):
    """Get fundamental data for a symbol"""
    try:
        # Find stock info
        stock_info = next((s for s in mock_generator.brazilian_stocks if s['symbol'] == symbol), None)
        if not stock_info:
            return jsonify({'error': 'Symbol not found'}), 404
        
        fundamentals = mock_generator.generate_fundamentals(symbol, stock_info['sector'])
        
        return jsonify({
            'fundamentals': fundamentals,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/screening', methods=['POST'])
def perform_screening():
    """Perform wheel screening with filters"""
    try:
        filters = request.get_json() or {}
        
        # Default filters
        default_filters = {
            'minPrice': 10,
            'maxPrice': 200,
            'minVolume': 100000,
            'minROIC': 5,
            'sectors': [],
            'minScore': 50
        }
        
        # Merge with provided filters
        screening_filters = {**default_filters, **filters}
        
        # Get instruments
        instruments_response = get_instruments()
        instruments_data = instruments_response.get_json()
        instruments = instruments_data['instruments']
        
        # Get quotes for all instruments
        symbols = [i['symbol'] for i in instruments]
        quotes_response = get_quotes()
        quotes_data = quotes_response.get_json()
        quotes = quotes_data['quotes']
        
        # Get fundamentals for all instruments
        results = []
        for instrument in instruments:
            symbol = instrument['symbol']
            
            # Find corresponding quote
            quote = next((q for q in quotes if q['symbol'] == symbol), None)
            if not quote:
                continue
            
            # Get fundamentals
            fundamentals_response = get_fundamentals(symbol)
            fundamentals_data = fundamentals_response.get_json()
            fundamental = fundamentals_data['fundamentals']
            
            # Calculate wheel score using the same algorithm as the frontend
            score = calculate_wheel_score(instrument, quote, fundamental, screening_filters)
            
            if score >= screening_filters['minScore']:
                result = {
                    'symbol': symbol,
                    'name': instrument['name'],
                    'sector': instrument['sector'],
                    'price': quote['price'],
                    'volume': quote['volume'],
                    'roic': fundamental['roic'],
                    'roe': fundamental['roe'],
                    'debt': fundamental['debtToEquity'],
                    'revenue': fundamental['revenue'],
                    'volatility': calculate_volatility(quote['historicalPrices']),
                    'score': score,
                    'wheelMetrics': {
                        'optionLiquidity': estimate_option_liquidity(quote['volume']),
                        'impliedVolatility': round(calculate_volatility(quote['historicalPrices']) * 1.2, 3),
                        'dividendYield': fundamental['dividendYield'],
                        'putCallRatio': round(0.8 + random.random() * 0.4, 2),
                        'wheelSuitability': calculate_wheel_suitability(instrument, quote, fundamental)
                    },
                    'dataSource': quote['dataSource']
                }
                results.append(result)
        
        # Sort by score
        results.sort(key=lambda x: x['score'], reverse=True)
        
        return jsonify({
            'results': results,
            'total': len(results),
            'filters': screening_filters,
            'timestamp': datetime.now().isoformat(),
            'executionTime': f"{random.uniform(0.5, 2.0):.2f}s"
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_wheel_score(instrument, quote, fundamental, filters):
    """Calculate wheel screening score"""
    score = 0
    
    # ROIC Score (0-25 points)
    roic = fundamental['roic']
    if roic >= 15:
        score += 25
    elif roic >= 10:
        score += 20
    elif roic >= 8:
        score += 15
    elif roic >= 5:
        score += 10
    else:
        score += 5
    
    # Volume Score (0-20 points)
    volume_ratio = quote['volume'] / filters['minVolume']
    if volume_ratio >= 10:
        score += 20
    elif volume_ratio >= 5:
        score += 16
    elif volume_ratio >= 2:
        score += 12
    elif volume_ratio >= 1:
        score += 8
    else:
        score += 4
    
    # Volatility Score (0-15 points) - Lower volatility is better
    volatility = calculate_volatility(quote['historicalPrices'])
    if volatility <= 0.15:
        score += 15
    elif volatility <= 0.25:
        score += 12
    elif volatility <= 0.35:
        score += 9
    elif volatility <= 0.45:
        score += 6
    else:
        score += 3
    
    # Fundamentals Score (0-25 points)
    fundamental_score = 0
    
    # Debt to Equity
    debt_to_equity = fundamental['debtToEquity']
    if debt_to_equity <= 0.3:
        fundamental_score += 8
    elif debt_to_equity <= 0.6:
        fundamental_score += 6
    elif debt_to_equity <= 1.0:
        fundamental_score += 4
    else:
        fundamental_score += 2
    
    # ROE
    roe = fundamental['roe']
    if roe >= 15:
        fundamental_score += 8
    elif roe >= 10:
        fundamental_score += 6
    elif roe >= 5:
        fundamental_score += 4
    else:
        fundamental_score += 2
    
    # Revenue Growth
    revenue_growth = fundamental['revenueGrowth']
    if revenue_growth >= 0.15:
        fundamental_score += 9
    elif revenue_growth >= 0.1:
        fundamental_score += 7
    elif revenue_growth >= 0.05:
        fundamental_score += 5
    elif revenue_growth >= 0:
        fundamental_score += 3
    else:
        fundamental_score += 1
    
    score += fundamental_score
    
    # Technical Score (0-15 points)
    technical_score = 0
    
    # Price trend
    prices = quote['historicalPrices']
    if len(prices) >= 20:
        recent = prices[-20:]
        trend = calculate_trend(recent)
        
        if trend > 0.05:
            technical_score += 5
        elif trend > 0:
            technical_score += 4
        elif trend > -0.05:
            technical_score += 3
        else:
            technical_score += 1
    
    # Support level analysis
    support_level = min(prices[-20:]) if len(prices) >= 20 else min(prices)
    current_price = quote['price']
    distance_from_support = (current_price - support_level) / support_level
    
    if 0.05 <= distance_from_support <= 0.15:
        technical_score += 10  # Good entry point
    elif 0 <= distance_from_support <= 0.25:
        technical_score += 7
    else:
        technical_score += 3
    
    score += technical_score
    
    return min(100, max(0, score))

def calculate_volatility(prices):
    """Calculate annualized volatility"""
    if len(prices) < 2:
        return 0.5
    
    returns = []
    for i in range(1, len(prices)):
        returns.append((prices[i] - prices[i-1]) / prices[i-1])
    
    if not returns:
        return 0.5
    
    mean_return = sum(returns) / len(returns)
    variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
    
    return (variance ** 0.5) * (252 ** 0.5)  # Annualized

def calculate_trend(prices):
    """Calculate price trend"""
    if len(prices) < 2:
        return 0
    
    n = len(prices)
    x = list(range(n))
    y = prices
    
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum(xi * yi for xi, yi in zip(x, y))
    sum_xx = sum(xi * xi for xi in x)
    
    if n * sum_xx - sum_x * sum_x == 0:
        return 0
    
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_xx - sum_x * sum_x)
    
    return slope / (sum_y / n)  # Normalized slope

def estimate_option_liquidity(volume):
    """Estimate option liquidity based on stock volume"""
    if volume >= 1000000:
        return 'High'
    elif volume >= 500000:
        return 'Medium'
    elif volume >= 100000:
        return 'Low'
    else:
        return 'Very Low'

def calculate_wheel_suitability(instrument, quote, fundamental):
    """Calculate wheel strategy suitability score"""
    score = 0
    
    # Sector suitability
    good_sectors = ['Technology', 'Healthcare', 'Consumer Defensive', 'Utilities']
    if instrument['sector'] in good_sectors:
        score += 20
    
    # Price range suitability
    price = quote['price']
    if 20 <= price <= 100:
        score += 20
    elif 10 <= price <= 200:
        score += 15
    else:
        score += 10
    
    # Financial stability
    debt_to_equity = fundamental['debtToEquity']
    if debt_to_equity <= 0.5:
        score += 20
    elif debt_to_equity <= 1.0:
        score += 15
    else:
        score += 10
    
    # Dividend consideration
    if fundamental['dividendYield'] > 0.02:
        score += 10
    
    # Volume consistency
    volume = quote['volume']
    if volume >= 500000:
        score += 20
    elif volume >= 100000:
        score += 15
    else:
        score += 10
    
    return min(100, score)

