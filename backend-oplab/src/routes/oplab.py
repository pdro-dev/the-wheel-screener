from flask import Blueprint, request, jsonify
import requests
import json
import time
import random
import os
from datetime import datetime, timedelta
import yfinance as yf
import pandas as pd
import numpy as np
import logging

from src.models import db
from src.models.instrument import Instrument
from src.models.quote import Quote
from src.models.fundamental import Fundamental

oplab_bp = Blueprint('oplab', __name__, url_prefix='/api')

logger = logging.getLogger("oplab")

metrics = {
    'requests': 0,
    'cache_hits': 0,
    'cache_misses': 0,
    'yfinance_failures': 0,
    'oplab_failures': 0,

    'total_response_time': 0.0
}

# OpLab API Client for real integration
class OpLabAPIClient:
    def __init__(self):
        self.base_url = "https://api.oplab.com.br/v3"
        self.token = os.getenv('OPLAB_API_TOKEN')
        self.session = requests.Session()
        

        if self.token:
            self.session.headers.update({
                'Access-Token': self.token,
                'Content-Type': 'application/json',
                'User-Agent': 'TheWheelScreener/1.0'
            })
            logger.info("OpLab API client initialized with token")
        else:

            logger.warning("OPLAB_API_TOKEN not found in environment variables")
    
    def is_available(self):
        """Check if OpLab API is available and token is configured"""
        return self.token is not None
    

    def get_instruments(self, filters=None):
        """Get instruments from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            # Use the instruments endpoint as per documentation
            endpoint = f"{self.base_url}/market/instruments"
            
            # Add query parameters if filters provided
            params = {}
            if filters:
                if 'limit' in filters:
                    params['limit'] = filters['limit']
                if 'type' in filters:
                    params['type'] = filters['type']
                if 'has_options' in filters:
                    params['has_options'] = filters['has_options']
                if 'category' in filters:
                    params['category'] = filters['category']
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved {len(data.get('instruments', []))} instruments")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API request failed: {str(e)}")
            raise Exception(f"OpLab API request failed: {str(e)}")

    def get_quotes(self, symbols):
        """Get quotes from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            # Use the quote endpoint as per documentation (GET method with query params)
            endpoint = f"{self.base_url}/market/quote"
            params = {'tickers': ','.join(symbols)}
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved quotes for {len(data)} symbols")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API quotes request failed: {str(e)}")
            raise Exception(f"OpLab API quotes request failed: {str(e)}")

    def get_stock_data(self, symbol):
        """Get individual stock data from OpLab API (as tested in Postman)"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            endpoint = f"{self.base_url}/market/stocks/{symbol}"
            
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved stock data for {symbol}")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API stock data request failed for {symbol}: {str(e)}")
            raise Exception(f"OpLab API stock data request failed: {str(e)}")

    def get_stocks(self, filters=None):
        """Get stocks with options from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            endpoint = f"{self.base_url}/market/stocks"
            
            # Add query parameters if filters provided
            params = {}
            if filters:
                if 'rank_by' in filters:
                    params['rank_by'] = filters['rank_by']
                if 'sort' in filters:
                    params['sort'] = filters['sort']
                if 'limit' in filters:
                    params['limit'] = filters['limit']
                if 'financial_volume_start' in filters:
                    params['financial_volume_start'] = filters['financial_volume_start']
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved {len(data.get('stocks', []))} stocks")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API stocks request failed: {str(e)}")
            raise Exception(f"OpLab API stocks request failed: {str(e)}")

    def get_options(self, symbol):
        """Get options for a specific stock from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            endpoint = f"{self.base_url}/market/options/{symbol}"
            
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved options for {symbol}")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API options request failed for {symbol}: {str(e)}")
            raise Exception(f"OpLab API options request failed: {str(e)}")

    def get_market_status(self):
        """Get current market status from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            endpoint = f"{self.base_url}/market/status"
            
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved market status")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API market status request failed: {str(e)}")
            raise Exception(f"OpLab API market status request failed: {str(e)}")

    def get_fundamentals(self, symbol):
        """Get fundamental data from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            endpoint = f"{self.base_url}/market/fundamentals/{symbol}"
            
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved fundamentals for {symbol}")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API fundamentals request failed for {symbol}: {str(e)}")
            raise Exception(f"OpLab API fundamentals request failed: {str(e)}")

    def get_user_info(self):
        """Get user information from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        
        try:
            endpoint = f"{self.base_url}/user"
            
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved user information")
            return data
            

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API user info request failed: {str(e)}")
            raise Exception(f"OpLab API user info request failed: {str(e)}")

    # ===== TAXAS DE JUROS =====
    def get_interest_rates(self):
        """Get interest rates from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/interest_rates"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved interest rates")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API interest rates request failed: {str(e)}")
            raise Exception(f"OpLab API interest rates request failed: {str(e)}")

    def get_interest_rate(self, rate_id):
        """Get specific interest rate from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/interest_rates/{rate_id}"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved interest rate {rate_id}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API interest rate request failed for {rate_id}: {str(e)}")
            raise Exception(f"OpLab API interest rate request failed: {str(e)}")

    # ===== BOLSAS DE VALORES =====
    def get_exchanges(self):
        """Get exchanges from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/exchanges"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved exchanges")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API exchanges request failed: {str(e)}")
            raise Exception(f"OpLab API exchanges request failed: {str(e)}")

    def get_exchange(self, exchange_uid):
        """Get specific exchange from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/exchanges/{exchange_uid}"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved exchange {exchange_uid}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API exchange request failed for {exchange_uid}: {str(e)}")
            raise Exception(f"OpLab API exchange request failed: {str(e)}")

    # ===== AÇÕES =====
    def get_stocks_all(self, filters=None):
        """Get all stocks from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/stocks/all"
            params = filters or {}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved all stocks")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API all stocks request failed: {str(e)}")
            raise Exception(f"OpLab API all stocks request failed: {str(e)}")

    # ===== OPÇÕES =====
    def get_option_details(self, option_symbol):
        """Get option details from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/options/details/{option_symbol}"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved option details for {option_symbol}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API option details request failed for {option_symbol}: {str(e)}")
            raise Exception(f"OpLab API option details request failed: {str(e)}")

    def get_covered_options(self, underlying_symbols):
        """Get covered options strategies from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/options/strategies/covered"
            params = {'underlying': underlying_symbols}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved covered options strategies")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API covered options request failed: {str(e)}")
            raise Exception(f"OpLab API covered options request failed: {str(e)}")

    def get_black_scholes(self, symbol, irate, option_type, **kwargs):
        """Get Black-Scholes parameters from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/options/bs"
            params = {
                'symbol': symbol,
                'irate': irate,
                'type': option_type,
                **kwargs
            }
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved Black-Scholes for {symbol}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API Black-Scholes request failed for {symbol}: {str(e)}")
            raise Exception(f"OpLab API Black-Scholes request failed: {str(e)}")

    def get_options_powders(self):
        """Get options powders from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/options/powders"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved options powders")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API options powders request failed: {str(e)}")
            raise Exception(f"OpLab API options powders request failed: {str(e)}")

    # ===== INSTRUMENTOS =====
    def get_instrument_series(self, symbol, **kwargs):
        """Get instrument options series from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/instruments/series/{symbol}"
            params = kwargs
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved instrument series for {symbol}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API instrument series request failed for {symbol}: {str(e)}")
            raise Exception(f"OpLab API instrument series request failed: {str(e)}")

    def get_instrument_details(self, symbol):
        """Get specific instrument details from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/instruments/{symbol}"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved instrument details for {symbol}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API instrument details request failed for {symbol}: {str(e)}")
            raise Exception(f"OpLab API instrument details request failed: {str(e)}")

    # ===== MERCADO =====
    def get_companies(self, symbols=None, includes=None):
        """Get companies from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/companies"
            params = {}
            if symbols:
                params['symbols'] = symbols
            if includes:
                params['includes'] = includes
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved companies")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API companies request failed: {str(e)}")
            raise Exception(f"OpLab API companies request failed: {str(e)}")

    # ===== RANKINGS =====
    def get_highest_options_volume(self, order_by='total', limit=20):
        """Get highest options volume ranking from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/statistics/realtime/highest_options_volume"
            params = {'order_by': order_by, 'limit': limit}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved highest options volume ranking")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API highest options volume request failed: {str(e)}")
            raise Exception(f"OpLab API highest options volume request failed: {str(e)}")

    def get_best_covered_options_rates(self, option_type, limit=20):
        """Get best covered options rates from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/statistics/realtime/best_covered_options_rates/{option_type}"
            params = {'limit': limit}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved best covered options rates for {option_type}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API best covered options rates request failed: {str(e)}")
            raise Exception(f"OpLab API best covered options rates request failed: {str(e)}")

    def get_highest_options_variation(self, option_type, limit=20):
        """Get highest options variation from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/statistics/realtime/highest_options_variation/{option_type}"
            params = {'limit': limit}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved highest options variation for {option_type}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API highest options variation request failed: {str(e)}")
            raise Exception(f"OpLab API highest options variation request failed: {str(e)}")

    def get_ranking_m9m21(self, limit=20):
        """Get M9M21 ranking from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/statistics/ranking/m9m21"
            params = {'limit': limit}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved M9M21 ranking")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API M9M21 ranking request failed: {str(e)}")
            raise Exception(f"OpLab API M9M21 ranking request failed: {str(e)}")

    def get_ranking_correl_ibov(self, limit=20):
        """Get IBOV correlation ranking from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/statistics/ranking/correl_ibov"
            params = {'limit': limit}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved IBOV correlation ranking")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API IBOV correlation ranking request failed: {str(e)}")
            raise Exception(f"OpLab API IBOV correlation ranking request failed: {str(e)}")

    def get_ranking_by_attribute(self, attribute, limit=20):
        """Get ranking by fundamental attribute from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/statistics/ranking/{attribute}"
            params = {'limit': limit}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved ranking by {attribute}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API ranking by {attribute} request failed: {str(e)}")
            raise Exception(f"OpLab API ranking by {attribute} request failed: {str(e)}")

    def get_ranking_oplab_score(self, limit=20):
        """Get OpLab Score ranking from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/statistics/ranking/oplab_score"
            params = {'limit': limit}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved OpLab Score ranking")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API OpLab Score ranking request failed: {str(e)}")
            raise Exception(f"OpLab API OpLab Score ranking request failed: {str(e)}")

    # ===== DADOS HISTÓRICOS =====
    def get_historical_data(self, symbol, resolution, **kwargs):
        """Get historical data from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/historical/{symbol}/{resolution}"
            params = kwargs
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved historical data for {symbol}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API historical data request failed for {symbol}: {str(e)}")
            raise Exception(f"OpLab API historical data request failed: {str(e)}")

    def get_historical_options(self, spot, from_date, to_date, symbol=None):
        """Get historical options data from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/historical/options/{spot}/{from_date}/{to_date}"
            params = {}
            if symbol:
                params['symbol'] = symbol
            
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved historical options for {spot}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API historical options request failed for {spot}: {str(e)}")
            raise Exception(f"OpLab API historical options request failed: {str(e)}")

    def get_historical_instruments(self, tickers, date):
        """Get historical instruments data from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/market/historical/instruments"
            params = {'tickers': tickers, 'date': date}
            response = self.session.get(endpoint, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info("OpLab API: Retrieved historical instruments data")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API historical instruments request failed: {str(e)}")
            raise Exception(f"OpLab API historical instruments request failed: {str(e)}")

    # ===== OUTROS =====
    def get_business_days_until(self, until_date):
        """Get business days until a specific date from OpLab API"""
        if not self.is_available():
            raise Exception("OpLab API token not configured")

        try:
            endpoint = f"{self.base_url}/domain/trading/business_days/{until_date}"
            response = self.session.get(endpoint, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            logger.info(f"OpLab API: Retrieved business days until {until_date}")
            return data

        except requests.exceptions.RequestException as e:
            metrics['oplab_failures'] += 1
            logger.error(f"OpLab API business days request failed: {str(e)}")
            raise Exception(f"OpLab API business days request failed: {str(e)}")


# Mock data generators for realistic financial data
class MockDataGenerator:
    def __init__(self):
        self.cache = {}
        self.cache_ttl = timedelta(minutes=5)  # 5 minutes cache

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
            {'symbol': 'RDOR3.SA', 'name': "Rede D'Or", 'sector': 'Healthcare'},
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

        for _ in range(days - 1):
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

        now = datetime.utcnow()

        cached = self.cache.get(symbol)
        if cached and now - cached['timestamp'] < self.cache_ttl:
            metrics['cache_hits'] += 1
            logger.info(json.dumps({'event': 'cache_hit', 'symbol': symbol}))
            return cached['data']

        metrics['cache_misses'] += 1
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="1y")

            if len(hist) > 0:
                current_price = float(hist['Close'].iloc[-1])
                volume = int(hist['Volume'].iloc[-1])
                prices = hist['Close'].tolist()

                data = {
                    'price': current_price,
                    'volume': volume,
                    'historicalPrices': prices[-252:],  # Last year
                    'dataSource': 'real'
                }
                self.cache[symbol] = {'data': data, 'timestamp': now}
                return data
        except Exception as e:
            metrics['yfinance_failures'] += 1
            logger.error(json.dumps({'event': 'yfinance_failure', 'symbol': symbol, 'error': str(e)}))

        # Fallback to mock data
        prices = self.generate_realistic_price_data(symbol)
        data = {
            'price': prices[-1],
            'volume': random.randint(50000, 5000000),
            'historicalPrices': prices,
            'dataSource': 'mock'
        }
        self.cache[symbol] = {'data': data, 'timestamp': now}
        return data

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


# Initialize clients
oplab_client = OpLabAPIClient()

mock_generator = MockDataGenerator()


def sync_market_data():
    for stock in mock_generator.brazilian_stocks:
        symbol = stock["symbol"]

        instrument = Instrument.query.filter_by(symbol=symbol).first()
        if not instrument:
            instrument = Instrument(
                symbol=symbol,
                name=stock["name"],
                sector=stock["sector"],
                currency="BRL",
                exchange="B3",
                last_updated=datetime.now(),
            )
            db.session.add(instrument)
            db.session.flush()

        price_data = mock_generator.get_real_stock_data(symbol)

        historical_prices = price_data['historicalPrices']
        if historical_prices:
            high_52w = max(historical_prices)
            low_52w = min(historical_prices)
        else:
            high_52w = low_52w = price_data['price']

        quote = Quote(
            instrument_id=instrument.id,
            price=price_data["price"],
            volume=price_data["volume"],
            change=0.0,
            change_percent=0.0,

            bid=price_data["price"] * 0.999,
            ask=price_data["price"] * 1.001,
            high_52w=max(price_data["historicalPrices"]) if price_data["historicalPrices"] else price_data["price"],
            low_52w=min(price_data["historicalPrices"]) if price_data["historicalPrices"] else price_data["price"],
            historical_prices=price_data["historicalPrices"],
            data_source=price_data["dataSource"],

            timestamp=datetime.now(),
        )
        db.session.add(quote)

        fundamentals_data = mock_generator.generate_fundamentals(symbol, stock["sector"])
        fundamental = Fundamental.query.filter_by(instrument_id=instrument.id).first()
        if fundamental:
            fundamental.roic = fundamentals_data["roic"]
            fundamental.roe = fundamentals_data["roe"]
            fundamental.debt_to_equity = fundamentals_data["debtToEquity"]
            fundamental.revenue = fundamentals_data["revenue"]
            fundamental.dividend_yield = fundamentals_data["dividendYield"]
            fundamental.last_updated = datetime.now()
        else:
            fundamental = Fundamental(
                instrument_id=instrument.id,
                roic=fundamentals_data["roic"],
                roe=fundamentals_data["roe"],
                debt_to_equity=fundamentals_data["debtToEquity"],
                revenue=fundamentals_data["revenue"],
                dividend_yield=fundamentals_data["dividendYield"],
                last_updated=datetime.now(),
            )
            db.session.add(fundamental)

    db.session.commit()



@oplab_bp.route('/metrics', methods=['GET'])
def get_metrics():
    avg_response = metrics['total_response_time'] / metrics['requests'] if metrics['requests'] else 0
    return jsonify({
        'requests': metrics['requests'],
        'cache_hits': metrics['cache_hits'],
        'cache_misses': metrics['cache_misses'],
        'yfinance_failures': metrics['yfinance_failures'],
        'oplab_failures': metrics['oplab_failures'],
        'avg_response_time': avg_response,
        'cache_size': len(mock_generator.cache),
        'cached_symbols': list(mock_generator.cache.keys()),

        'oplab_available': oplab_client.is_available(),
        'data_sources': {
            'oplab': 'available' if oplab_client.is_available() else 'unavailable',

            'yahoo_finance': 'available',
            'mock_data': 'available'
        }
    })


@oplab_bp.route('/health', methods=['GET'])
def get_health_check():
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
    start = time.time()
    metrics['requests'] += 1

    token = get_token()
    if not token:
        return jsonify({'error': 'Token required'}), 401

    
    # Try to get real user info from OpLab API first
    if oplab_client.is_available():
        try:
            user_data = oplab_client.get_user_info()
            user_data['dataSource'] = 'oplab'
            return jsonify(user_data)
        except Exception as e:
            logger.warning(f"Failed to get real user info, falling back to mock: {str(e)}")
    
    # Fallback to mock user data
    return jsonify({

        'id': 'user_123',
        'name': 'Pedro Developer',
        'email': 'pdro.dev@example.com',
        'plan': 'premium',
        'apiQuota': {
            'daily': 10000,
            'used': used,
            'remaining': 10000 - used
        },
        'permissions': ['read', 'screening', 'fundamentals'],
        'lastLogin': datetime.now().isoformat(),
        'accountCreated': '2024-01-15T10:00:00Z',
        'dataSource': 'mock'

    })


# New /market endpoints (PR #38 compliance)
@oplab_bp.route('/market/instruments', methods=['POST'])
def get_market_instruments():
    """Get instruments with filtering - New /market endpoint"""
    return get_instruments()


@oplab_bp.route('/market/quote', methods=['POST'])
def get_market_quotes():
    """Get current quotes for symbols - New /market endpoint"""
    return get_quotes()


@oplab_bp.route('/market/fundamentals/<symbol>', methods=['GET'])
def get_market_fundamentals(symbol):
    """Get fundamental data for a symbol - New /market endpoint"""
    return get_fundamentals(symbol)


@oplab_bp.route('/market/options/<symbol>', methods=['GET'])
def get_market_options(symbol):
    """Get options data for a symbol - New /market endpoint"""
    try:
        # Mock options data
        options_data = {
            'symbol': symbol,
            'chains': generate_options_chain(symbol),
            'timestamp': datetime.now().isoformat()
        }

        return jsonify(options_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@oplab_bp.route('/market/status', methods=['GET'])
def get_market_status():
    """Get market status from OpLab API"""
    try:
        # Try OpLab API first
        if oplab_client.is_available():
            try:
                status_data = oplab_client.get_market_status()
                status_data['dataSource'] = 'oplab'
                logger.info("Successfully retrieved market status from OpLab API")
                return jsonify(status_data)
            except Exception as e:
                logger.warning(f"OpLab API market status failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_status = {
            'status': 'open',  # or 'closed' based on time
            'lastUpdate': datetime.now().isoformat(),
            'dataSource': 'mock'
        }

        return jsonify(mock_status)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@oplab_bp.route('/market/stocks/<symbol>', methods=['GET'])
def get_market_stock(symbol):
    """Get individual stock data from OpLab API - New /market endpoint"""
    try:
        # Try OpLab API first
        if oplab_client.is_available():
            try:
                stock_data = oplab_client.get_stock_data(symbol)
                stock_data['dataSource'] = 'oplab'
                logger.info(f"Successfully retrieved stock data for {symbol} from OpLab API")
                return jsonify(stock_data)
            except Exception as e:
                logger.warning(f"OpLab API stock data failed for {symbol}, falling back to mock: {str(e)}")

        # Fallback to mock data
        stock_info = next((s for s in mock_generator.brazilian_stocks if s['symbol'] == symbol), None)
        if not stock_info:
            return jsonify({'error': 'Symbol not found'}), 404

        price_data = mock_generator.get_real_stock_data(symbol)
        
        mock_stock_data = {
            'symbol': symbol,
            'name': stock_info['name'],
            'sector': stock_info['sector'],
            'price': price_data['price'],
            'volume': price_data['volume'],
            'dataSource': price_data['dataSource'],
            'timestamp': datetime.now().isoformat()
        }

        return jsonify(mock_stock_data)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@oplab_bp.route('/market/stocks', methods=['GET'])
def get_market_stocks():
    """Get stocks with options from OpLab API"""
    try:
        filters = request.args.to_dict()
        
        # Try OpLab API first
        if oplab_client.is_available():
            try:
                stocks_data = oplab_client.get_stocks(filters)
                stocks_data['dataSource'] = 'oplab'
                logger.info(f"Successfully retrieved stocks from OpLab API")
                return jsonify(stocks_data)
            except Exception as e:
                logger.warning(f"OpLab API stocks failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_stocks = []
        for stock in mock_generator.brazilian_stocks:
            price_data = mock_generator.get_real_stock_data(stock['symbol'])
            mock_stocks.append({
                'symbol': stock['symbol'],
                'name': stock['name'],
                'sector': stock['sector'],
                'price': price_data['price'],
                'volume': price_data['volume'],
                'dataSource': price_data['dataSource']
            })

        return jsonify({
            'stocks': mock_stocks,
            'total': len(mock_stocks),
            'dataSource': 'mock',
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== TAXAS DE JUROS =====
@oplab_bp.route('/market/interest_rates', methods=['GET'])
def get_interest_rates():
    """Get interest rates from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_interest_rates()
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API interest rates failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_rates = [
            {'uid': 'SELIC', 'name': 'Taxa Selic', 'value': 13.75, 'updated_at': datetime.now().isoformat()},
            {'uid': 'CDI', 'name': 'CDI', 'value': 13.65, 'updated_at': datetime.now().isoformat()},
            {'uid': 'IPCA', 'name': 'IPCA', 'value': 4.18, 'updated_at': datetime.now().isoformat()}
        ]
        return jsonify({'rates': mock_rates, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/interest_rates/<rate_id>', methods=['GET'])
def get_interest_rate(rate_id):
    """Get specific interest rate from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_interest_rate(rate_id)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API interest rate failed for {rate_id}, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_rate = {
            'uid': rate_id,
            'name': f'Taxa {rate_id}',
            'value': 13.75 if rate_id == 'SELIC' else 13.65,
            'updated_at': datetime.now().isoformat(),
            'dataSource': 'mock'
        }
        return jsonify(mock_rate)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== BOLSAS DE VALORES =====
@oplab_bp.route('/market/exchanges', methods=['GET'])
def get_exchanges():
    """Get exchanges from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_exchanges()
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API exchanges failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_exchanges = [
            {'uid': 'B3', 'name': 'B3 S.A.', 'country': 'Brasil', 'timezone': 'America/Sao_Paulo'},
            {'uid': 'NYSE', 'name': 'New York Stock Exchange', 'country': 'Estados Unidos', 'timezone': 'America/New_York'}
        ]
        return jsonify({'exchanges': mock_exchanges, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/exchanges/<exchange_uid>', methods=['GET'])
def get_exchange(exchange_uid):
    """Get specific exchange from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_exchange(exchange_uid)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API exchange failed for {exchange_uid}, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_exchange = {
            'uid': exchange_uid,
            'name': f'Exchange {exchange_uid}',
            'country': 'Brasil',
            'timezone': 'America/Sao_Paulo',
            'dataSource': 'mock'
        }
        return jsonify(mock_exchange)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== AÇÕES =====
@oplab_bp.route('/market/stocks/all', methods=['GET'])
def get_stocks_all():
    """Get all stocks from OpLab API"""
    try:
        filters = request.args.to_dict()
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_stocks_all(filters)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API all stocks failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_stocks = []
        for stock in mock_generator.brazilian_stocks:
            price_data = mock_generator.get_real_stock_data(stock['symbol'])
            mock_stocks.append({
                'symbol': stock['symbol'],
                'name': stock['name'],
                'sector': stock['sector'],
                'price': price_data['price'],
                'volume': price_data['volume'],
                'dataSource': price_data['dataSource']
            })

        return jsonify({
            'stocks': mock_stocks,
            'total': len(mock_stocks),
            'dataSource': 'mock',
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== OPÇÕES =====
@oplab_bp.route('/market/options/details/<option_symbol>', methods=['GET'])
def get_option_details(option_symbol):
    """Get option details from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_option_details(option_symbol)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API option details failed for {option_symbol}, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_option = {
            'symbol': option_symbol,
            'strike': 50.0,
            'expiry': '2024-12-20',
            'type': 'CALL',
            'underlying': 'PETR4',
            'dataSource': 'mock'
        }
        return jsonify(mock_option)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/options/strategies/covered', methods=['GET'])
def get_covered_options():
    """Get covered options strategies from OpLab API"""
    try:
        underlying = request.args.get('underlying', '')
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_covered_options(underlying)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API covered options failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_strategies = [
            {
                'underlying': 'PETR4',
                'strike': 45.0,
                'premium': 2.50,
                'return_rate': 5.56,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'strategies': mock_strategies, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/options/bs', methods=['GET'])
def get_black_scholes():
    """Get Black-Scholes parameters from OpLab API"""
    try:
        symbol = request.args.get('symbol')
        irate = request.args.get('irate')
        option_type = request.args.get('type')
        
        if not all([symbol, irate, option_type]):
            return jsonify({'error': 'symbol, irate, and type are required'}), 400
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_black_scholes(symbol, irate, option_type, **request.args.to_dict())
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API Black-Scholes failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_bs = {
            'symbol': symbol,
            'theoretical_price': 2.50,
            'delta': 0.65,
            'gamma': 0.02,
            'theta': -0.05,
            'vega': 0.15,
            'rho': 0.03,
            'dataSource': 'mock'
        }
        return jsonify(mock_bs)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/options/powders', methods=['GET'])
def get_options_powders():
    """Get options powders from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_options_powders()
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API options powders failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_powders = [
            {
                'symbol': 'PETR4',
                'strike': 45.0,
                'premium': 2.50,
                'return_rate': 5.56,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'powders': mock_powders, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== INSTRUMENTOS =====
@oplab_bp.route('/market/instruments/series/<symbol>', methods=['GET'])
def get_instrument_series(symbol):
    """Get instrument options series from OpLab API"""
    try:
        params = request.args.to_dict()
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_instrument_series(symbol, **params)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API instrument series failed for {symbol}, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_series = [
            {
                'strike': 45.0,
                'expiry': '2024-12-20',
                'call_symbol': f'{symbol}C45',
                'put_symbol': f'{symbol}P45',
                'dataSource': 'mock'
            }
        ]
        return jsonify({'series': mock_series, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/instruments/<symbol>', methods=['GET'])
def get_instrument_details(symbol):
    """Get specific instrument details from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_instrument_details(symbol)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API instrument details failed for {symbol}, falling back to mock: {str(e)}")

        # Fallback to mock data
        price_data = mock_generator.get_real_stock_data(symbol)
        mock_instrument = {
            'symbol': symbol,
            'name': f'Instrument {symbol}',
            'price': price_data['price'],
            'volume': price_data['volume'],
            'dataSource': price_data['dataSource']
        }
        return jsonify(mock_instrument)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== MERCADO =====
@oplab_bp.route('/market/companies', methods=['GET'])
def get_companies():
    """Get companies from OpLab API"""
    try:
        symbols = request.args.get('symbols')
        includes = request.args.get('includes')
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_companies(symbols, includes)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API companies failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_companies = [
            {
                'symbol': 'PETR4',
                'name': 'Petrobras',
                'sector': 'Energy',
                'dataSource': 'mock'
            }
        ]
        return jsonify({'companies': mock_companies, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== RANKINGS =====
@oplab_bp.route('/market/statistics/realtime/highest_options_volume', methods=['GET'])
def get_highest_options_volume():
    """Get highest options volume ranking from OpLab API"""
    try:
        order_by = request.args.get('order_by', 'total')
        limit = int(request.args.get('limit', 20))
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_highest_options_volume(order_by, limit)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API highest options volume failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_ranking = [
            {
                'symbol': 'PETR4',
                'volume': 15000,
                'order_by': order_by,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'ranking': mock_ranking, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/statistics/realtime/best_covered_options_rates/<option_type>', methods=['GET'])
def get_best_covered_options_rates(option_type):
    """Get best covered options rates from OpLab API"""
    try:
        limit = int(request.args.get('limit', 20))
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_best_covered_options_rates(option_type, limit)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API best covered options rates failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_rates = [
            {
                'symbol': 'PETR4',
                'strike': 45.0,
                'return_rate': 5.56,
                'type': option_type,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'rates': mock_rates, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/statistics/realtime/highest_options_variation/<option_type>', methods=['GET'])
def get_highest_options_variation(option_type):
    """Get highest options variation from OpLab API"""
    try:
        limit = int(request.args.get('limit', 20))
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_highest_options_variation(option_type, limit)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API highest options variation failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_variations = [
            {
                'symbol': 'PETR4',
                'variation': 15.5,
                'type': option_type,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'variations': mock_variations, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/statistics/ranking/m9m21', methods=['GET'])
def get_ranking_m9m21():
    """Get M9M21 ranking from OpLab API"""
    try:
        limit = int(request.args.get('limit', 20))
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_ranking_m9m21(limit)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API M9M21 ranking failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_ranking = [
            {
                'symbol': 'PETR4',
                'm9': 45.0,
                'm21': 42.0,
                'signal': 'BUY',
                'dataSource': 'mock'
            }
        ]
        return jsonify({'ranking': mock_ranking, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/statistics/ranking/correl_ibov', methods=['GET'])
def get_ranking_correl_ibov():
    """Get IBOV correlation ranking from OpLab API"""
    try:
        limit = int(request.args.get('limit', 20))
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_ranking_correl_ibov(limit)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API IBOV correlation ranking failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_ranking = [
            {
                'symbol': 'PETR4',
                'correlation': 0.85,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'ranking': mock_ranking, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/statistics/ranking/<attribute>', methods=['GET'])
def get_ranking_by_attribute(attribute):
    """Get ranking by fundamental attribute from OpLab API"""
    try:
        limit = int(request.args.get('limit', 20))
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_ranking_by_attribute(attribute, limit)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API ranking by {attribute} failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_ranking = [
            {
                'symbol': 'PETR4',
                'attribute': attribute,
                'value': 15.5,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'ranking': mock_ranking, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/statistics/ranking/oplab_score', methods=['GET'])
def get_ranking_oplab_score():
    """Get OpLab Score ranking from OpLab API"""
    try:
        limit = int(request.args.get('limit', 20))
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_ranking_oplab_score(limit)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API OpLab Score ranking failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_ranking = [
            {
                'symbol': 'PETR4',
                'score': 85,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'ranking': mock_ranking, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== DADOS HISTÓRICOS =====
@oplab_bp.route('/market/historical/<symbol>/<resolution>', methods=['GET'])
def get_historical_data(symbol, resolution):
    """Get historical data from OpLab API"""
    try:
        params = request.args.to_dict()
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_historical_data(symbol, resolution, **params)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API historical data failed for {symbol}, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_historical = [
            {
                'date': '2024-01-01',
                'open': 45.0,
                'high': 46.0,
                'low': 44.0,
                'close': 45.5,
                'volume': 1000000,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'data': mock_historical, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/historical/options/<spot>/<from_date>/<to_date>', methods=['GET'])
def get_historical_options(spot, from_date, to_date):
    """Get historical options data from OpLab API"""
    try:
        symbol = request.args.get('symbol')
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_historical_options(spot, from_date, to_date, symbol)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API historical options failed for {spot}, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_historical = [
            {
                'date': '2024-01-01',
                'symbol': 'PETRC45',
                'strike': 45.0,
                'premium': 2.50,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'data': mock_historical, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@oplab_bp.route('/market/historical/instruments', methods=['GET'])
def get_historical_instruments():
    """Get historical instruments data from OpLab API"""
    try:
        tickers = request.args.get('tickers')
        date = request.args.get('date')
        
        if not tickers or not date:
            return jsonify({'error': 'tickers and date are required'}), 400
        
        if oplab_client.is_available():
            try:
                data = oplab_client.get_historical_instruments(tickers, date)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API historical instruments failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_historical = [
            {
                'symbol': 'PETR4',
                'date': date,
                'open': 45.0,
                'high': 46.0,
                'low': 44.0,
                'close': 45.5,
                'volume': 1000000,
                'dataSource': 'mock'
            }
        ]
        return jsonify({'data': mock_historical, 'dataSource': 'mock'})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ===== OUTROS =====
@oplab_bp.route('/domain/trading/business_days/<until_date>', methods=['GET'])
def get_business_days_until(until_date):
    """Get business days until a specific date from OpLab API"""
    try:
        if oplab_client.is_available():
            try:
                data = oplab_client.get_business_days_until(until_date)
                data['dataSource'] = 'oplab'
                return jsonify(data)
            except Exception as e:
                logger.warning(f"OpLab API business days failed, falling back to mock: {str(e)}")

        # Fallback to mock data
        mock_business_days = {
            'business_days': 26,
            'until_date': until_date,
            'dataSource': 'mock'
        }
        return jsonify(mock_business_days)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


def generate_options_chain(symbol):
    """Generate realistic options chain data"""
    base_price = random.uniform(20, 100)
    chains = []

    # Generate options for next 3 months
    for months in [1, 2, 3]:

        expiry_date = (datetime.now() + timedelta(days=30*months)).strftime('%Y-%m-%d')


        for strike_offset in [-20, -10, -5, 0, 5, 10, 20]:
            strike = base_price + strike_offset

            chains.append({
                'strike': round(strike, 2),
                'expiry': expiry_date,
                'call': {
                    'bid': round(max(0.1, base_price - strike + random.uniform(-2, 2)), 2),
                    'bid': round(max(0.1, max(0, base_price - strike) + random.uniform(-2, 2)), 2),
                    'ask': round(max(0.2, max(0, base_price - strike) + random.uniform(-1, 3)), 2),
                    'volume': random.randint(0, 1000),
                    'openInterest': random.randint(0, 5000),
                    'impliedVolatility': round(random.uniform(0.15, 0.45), 3)
                },
                'put': {
                    'bid': round(max(0.1, strike - base_price + random.uniform(-2, 2)), 2),
                    'bid': round(max(0.1, max(0, strike - base_price) + random.uniform(-2, 2)), 2),
                    'ask': round(max(0.2, max(0, strike - base_price) + random.uniform(-1, 3)), 2),
                    'volume': random.randint(0, 1000),
                    'openInterest': random.randint(0, 5000),
                    'impliedVolatility': round(random.uniform(0.15, 0.45), 3)
                }
            })

    return chains


@oplab_bp.route('/instruments', methods=['POST'])

def get_instruments():
    """Get instruments with filtering - Enhanced with OpLab API integration"""
    start = time.time()
    metrics['requests'] += 1
    try:
        filters = request.get_json() or {}
        
        # Try OpLab API first
        if oplab_client.is_available():
            try:
                oplab_data = oplab_client.get_instruments(filters)
                oplab_data['dataSource'] = 'oplab'
                logger.info(f"Successfully retrieved {len(oplab_data.get('instruments', []))} instruments from OpLab API")
                return jsonify(oplab_data)
            except Exception as e:
                logger.warning(f"OpLab API failed, falling back to Yahoo Finance: {str(e)}")
        

        # Fallback to Yahoo Finance + Mock data
        instruments = []

        for stock in mock_generator.brazilian_stocks:
            # Get realistic price data (tries Yahoo Finance first, then mock)
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

        resp = {
            'instruments': instruments,
            'total': len(instruments),
            'filters_applied': filters,
            'timestamp': datetime.now().isoformat(),
            'dataSource': 'yahoo_finance_mock'
        }

        return jsonify(resp)


    except Exception as e:
        metrics['total_response_time'] += (time.time() - start)
        return jsonify({'error': str(e)}), 500


@oplab_bp.route('/quotes', methods=['POST'])

def get_quotes(symbols=None):
    """Get current quotes for symbols - Enhanced with OpLab API integration"""

    start = time.time()

    try:
        data = request.get_json() or {}
        symbols = data.get('symbols', [])

        if not symbols:
            metrics['total_response_time'] += (time.time() - start)
            return jsonify({'error': 'Symbols required'}), 400

        
        # Try OpLab API first
        if oplab_client.is_available():
            try:
                oplab_data = oplab_client.get_quotes(symbols)
                oplab_data['dataSource'] = 'oplab'
                logger.info(f"Successfully retrieved quotes for {len(oplab_data.get('quotes', []))} symbols from OpLab API")
                return jsonify(oplab_data)
            except Exception as e:
                logger.warning(f"OpLab API quotes failed, falling back to Yahoo Finance: {str(e)}")
        

        # Fallback to Yahoo Finance + Mock data
        quotes = []
        for symbol in symbols:
            # Find stock info
            stock_info = next((s for s in mock_generator.brazilian_stocks if s['symbol'] == symbol), None)
            if not stock_info:

                continue


            # Get realistic price data (tries Yahoo Finance first, then mock)
            price_data = mock_generator.get_real_stock_data(symbol)


            quote = {
                'symbol': symbol,
                'price': price_data['price'],
                'volume': price_data['volume'],
                'change': round(random.uniform(-5, 5), 2),
                'changePercent': round(random.uniform(-0.08, 0.08), 4),
                'bid': price_data['price'] * 0.999,
                'ask': price_data['price'] * 1.001,
                'high52w': max(price_data['historicalPrices']) if price_data['historicalPrices'] else price_data['price'],
                'low52w': min(price_data['historicalPrices']) if price_data['historicalPrices'] else price_data['price'],
                'historicalPrices': price_data['historicalPrices'],
                'timestamp': datetime.now().isoformat(),
                'dataSource': price_data['dataSource']
            }

            quotes.append(quote)

        resp = {
            'quotes': quotes,
            'requested': len(symbols),
            'found': len(quotes),
            'timestamp': datetime.now().isoformat(),
            'dataSource': 'yahoo_finance_mock'
        }


        metrics['total_response_time'] += (time.time() - start)
        return jsonify(resp)



    except Exception as e:
        metrics['total_response_time'] += (time.time() - start)
        return jsonify({'error': str(e)}), 500


@oplab_bp.route('/fundamentals/<symbol>', methods=['GET'])
def get_fundamentals(symbol):
    """Get fundamental data for a symbol - Enhanced with OpLab API integration"""
    start = time.time()

    try:
        # Try OpLab API first
        if oplab_client.is_available():
            try:
                oplab_data = oplab_client.get_fundamentals(symbol)
                oplab_data['dataSource'] = 'oplab'
                logger.info(f"Successfully retrieved fundamentals for {symbol} from OpLab API")
                metrics['total_response_time'] += (time.time() - start)
                return jsonify(oplab_data)
            except Exception as e:
                logger.warning(f"OpLab API fundamentals failed for {symbol}, falling back to mock: {str(e)}")


        # Fallback to mock data
        stock_info = next((s for s in mock_generator.brazilian_stocks if s['symbol'] == symbol), None)
        if not stock_info:
            metrics['total_response_time'] += (time.time() - start)
            return jsonify({'error': 'Symbol not found'}), 404

        fundamentals = mock_generator.generate_fundamentals(symbol, stock_info['sector'])
        fundamentals['dataSource'] = 'mock'


        resp = {

            'fundamentals': fundamentals,
            'timestamp': datetime.now().isoformat(),
            'dataSource': 'mock'
        }
        metrics['total_response_time'] += (time.time() - start)
        return jsonify(resp)
    except Exception as e:
        metrics['total_response_time'] += (time.time() - start)
        return jsonify({'error': str(e)}), 500


@oplab_bp.route('/screening', methods=['POST'])
def perform_screening():
    """Perform wheel screening with filters"""
    start = time.time()
    metrics['requests'] += 1

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

        # Get instruments directly from mock data with filters applied
        instruments = []
        for stock in mock_generator.brazilian_stocks:
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
            if screening_filters.get('minPrice') and instrument['price'] < screening_filters['minPrice']:
                continue
            if screening_filters.get('maxPrice') and instrument['price'] > screening_filters['maxPrice']:
                continue
            if screening_filters.get('minVolume') and instrument['volume'] < screening_filters['minVolume']:
                continue
            if screening_filters.get('sectors') and screening_filters['sectors'] and instrument['sector'] not in screening_filters['sectors']:
                continue

            instruments.append(instrument)

        # Get fundamentals for all instruments
        results = []
        for instrument in instruments:
            symbol = instrument['symbol']
            
            # Get stock info for fundamentals
            stock_info = next((s for s in mock_generator.brazilian_stocks if s['symbol'] == symbol), None)
            if not stock_info:
                continue
                
            # Get price data (already have from instruments)
            price_data = mock_generator.get_real_stock_data(symbol)
            
            # Create quote object
            quote = {
                'symbol': symbol,
                'price': price_data['price'],
                'volume': price_data['volume'],
                'change': round(random.uniform(-5, 5), 2),
                'changePercent': round(random.uniform(-0.08, 0.08), 4),
                'bid': price_data['price'] * 0.999,
                'ask': price_data['price'] * 1.001,
                'high52w': max(price_data['historicalPrices']) if price_data['historicalPrices'] else price_data['price'],
                'low52w': min(price_data['historicalPrices']) if price_data['historicalPrices'] else price_data['price'],
                'historicalPrices': price_data['historicalPrices'],
                'timestamp': datetime.now().isoformat(),
                'dataSource': price_data['dataSource']
            }

            # Generate fundamentals
            fundamental = mock_generator.generate_fundamentals(symbol, stock_info['sector'])

            # Apply ROIC filter
            if screening_filters.get('minROIC') and fundamental['roic'] < screening_filters['minROIC']:
                continue

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

        resp = {
            'results': results,
            'total': len(results),
            'filters': screening_filters,
            'timestamp': datetime.now().isoformat(),
            'executionTime': f"{(time.time() - start):.2f}s"
        }
        metrics['total_response_time'] += (time.time() - start)
        return jsonify(resp)

    except Exception as e:
        metrics['total_response_time'] += (time.time() - start)
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
    min_vol = max(1, filters.get('minVolume', 100000))
    volume_ratio = quote['volume'] / min_vol
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

    support_level = min(prices[-20:]) if len(prices) >= 20 else (min(prices) if prices else quote['price'])

    current_price = quote['price']
    base = support_level if support_level > 0 else current_price
    distance_from_support = (current_price - base) / base if base else 0

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

    epsilon = 1e-8
    returns = []
    for i in range(1, len(prices)):
        denom = max(abs(prices[i-1]), epsilon)
        returns.append((prices[i] - prices[i-1]) / denom)

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

    denom = n * sum_xx - sum_x * sum_x
    if denom == 0:

        return 0

    slope = (n * sum_xy - sum_x * sum_y) / denom

    avg_y = (sum_y / n) if n else 1
    if avg_y == 0:
        return 0


    return slope / avg_y  # Normalized slope


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
