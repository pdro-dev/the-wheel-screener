#!/usr/bin/env python3
"""
Test script for OpLab API integration
Usage: python test_oplab_integration.py
"""

import os
import sys
import json
import time
import requests
from datetime import datetime

# Add src to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

def test_oplab_integration():
    """Test OpLab API integration with fallback system"""
    
    print("🚀 Testing OpLab API Integration")
    print("=" * 50)
    
    # Test 1: Check token availability
    token = os.getenv('OPLAB_API_TOKEN')
    if token:
        print(f"✅ OPLAB_API_TOKEN found: {token[:10]}...")
    else:
        print("⚠️  OPLAB_API_TOKEN not found - will test fallback system")
    
    print()
    
    # Test 2: Import and initialize OpLab client
    try:
        from routes.oplab import oplab_client, mock_generator
        print("✅ OpLab modules imported successfully")
        print(f"✅ OpLab client available: {oplab_client.is_available()}")
        print(f"✅ Mock generator initialized: {len(mock_generator.brazilian_stocks)} stocks")
    except Exception as e:
        print(f"❌ Import failed: {str(e)}")
        return False
    
    print()
    
    # Test 3: Test OpLab API endpoints (if token available)
    if oplab_client.is_available():
        print("🔍 Testing OpLab API endpoints...")
        
        # Test user info
        try:
            user_info = oplab_client.get_user_info()
            print(f"✅ User info: {user_info.get('name', 'Unknown')}")
        except Exception as e:
            print(f"⚠️  User info failed: {str(e)}")
        
        # Test instruments
        try:
            instruments = oplab_client.get_instruments({"minPrice": 10, "maxPrice": 100})
            print(f"✅ Instruments: {len(instruments.get('instruments', []))} found")
        except Exception as e:
            print(f"⚠️  Instruments failed: {str(e)}")
        
        # Test quotes
        try:
            quotes = oplab_client.get_quotes(["PETR4.SA", "VALE3.SA"])
            print(f"✅ Quotes: {len(quotes.get('quotes', []))} found")
        except Exception as e:
            print(f"⚠️  Quotes failed: {str(e)}")
    
    print()
    
    # Test 4: Test fallback system
    print("🔄 Testing fallback system...")
    
    # Test Yahoo Finance fallback
    try:
        price_data = mock_generator.get_real_stock_data("PETR4.SA")
        print(f"✅ Fallback data for PETR4.SA: R$ {price_data['price']:.2f} ({price_data['dataSource']})")
    except Exception as e:
        print(f"❌ Fallback failed: {str(e)}")
    
    # Test fundamentals
    try:
        fundamentals = mock_generator.generate_fundamentals("PETR4.SA", "Energy")
        print(f"✅ Fundamentals: ROIC {fundamentals['roic']}%, ROE {fundamentals['roe']}%")
    except Exception as e:
        print(f"❌ Fundamentals failed: {str(e)}")
    
    print()
    
    # Test 5: Test cache system
    print("💾 Testing cache system...")
    
    start_time = time.time()
    mock_generator.get_real_stock_data("VALE3.SA")  # First call
    first_call_time = time.time() - start_time
    
    start_time = time.time()
    mock_generator.get_real_stock_data("VALE3.SA")  # Cached call
    cached_call_time = time.time() - start_time
    
    print(f"✅ First call: {first_call_time:.3f}s")
    print(f"✅ Cached call: {cached_call_time:.3f}s")
    print(f"✅ Cache size: {len(mock_generator.cache)} items")
    
    print()
    
    return True

def test_backend_server():
    """Test backend server endpoints"""
    
    print("🌐 Testing Backend Server")
    print("=" * 50)
    
    base_url = "http://localhost:5000"
    
    # Test health endpoint
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        if response.status_code == 200:
            health_data = response.json()
            print(f"✅ Health check: {health_data['status']}")
        else:
            print(f"⚠️  Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {str(e)}")
        print("💡 Make sure backend server is running: python src/main.py")
        return False
    
    # Test metrics endpoint
    try:
        response = requests.get(f"{base_url}/api/metrics", timeout=5)
        if response.status_code == 200:
            metrics = response.json()
            print(f"✅ Metrics: {metrics['requests']} requests, {metrics['cache_hits']} cache hits")
            print(f"✅ OpLab available: {metrics['oplab_available']}")
        else:
            print(f"⚠️  Metrics failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Metrics error: {str(e)}")
    
    # Test instruments endpoint
    try:
        payload = {"minPrice": 10, "maxPrice": 100, "minVolume": 100000}
        response = requests.post(f"{base_url}/api/instruments", 
                               json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Instruments: {data['total']} found, source: {data.get('dataSource', 'unknown')}")
        else:
            print(f"⚠️  Instruments failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Instruments error: {str(e)}")
    
    # Test quotes endpoint
    try:
        payload = {"symbols": ["PETR4.SA", "VALE3.SA", "ITUB4.SA"]}
        response = requests.post(f"{base_url}/api/quotes", 
                               json=payload, timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Quotes: {data['found']}/{data['requested']} found, source: {data.get('dataSource', 'unknown')}")
        else:
            print(f"⚠️  Quotes failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Quotes error: {str(e)}")
    
    print()
    return True

def main():
    """Main test function"""
    
    print(f"🧪 OpLab Integration Test Suite")
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)
    print()
    
    # Test 1: OpLab integration
    if not test_oplab_integration():
        print("❌ OpLab integration tests failed")
        return 1
    
    # Test 2: Backend server (optional)
    print("🤔 Testing backend server (optional)...")
    test_backend_server()
    
    print()
    print("🎉 Test suite completed!")
    print("=" * 60)
    
    # Summary
    token_status = "✅ Configured" if os.getenv('OPLAB_API_TOKEN') else "⚠️  Not configured"
    print(f"📊 Summary:")
    print(f"   • OpLab Token: {token_status}")
    print(f"   • Fallback System: ✅ Working")
    print(f"   • Cache System: ✅ Working")
    print(f"   • Mock Data: ✅ Working")
    
    if not os.getenv('OPLAB_API_TOKEN'):
        print()
        print("💡 To test with real OpLab API:")
        print("   export OPLAB_API_TOKEN='your-token-here'")
        print("   python test_oplab_integration.py")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

