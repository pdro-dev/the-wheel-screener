import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  OpLabAPIService,
  OpLabAPIError,
  API_CONFIG,
  API_ENDPOINTS,
  updateRefreshInterval,
  getOpLabService,
  __resetOpLabService,
  ScreeningUtils
} from '../opLabAPI'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

const createMockResponse = (data, overrides = {}) => ({
  ok: true,
  json: () => Promise.resolve(data),
  headers: { get: vi.fn().mockReturnValue(null) },
  ...overrides
})

describe('OpLabAPIService', () => {
  let service

  beforeEach(() => {
    API_CONFIG.baseURL = 'https://api.oplab.com.br/v3'
    API_CONFIG.retryAttempts = 1
    API_CONFIG.retryDelay = 0
    service = new OpLabAPIService('test-token')
    mockFetch.mockClear()
    vi.clearAllTimers()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  describe('Constructor and Configuration', () => {
    it('should initialize with token', () => {
      const service = new OpLabAPIService('my-token')
      expect(service.token).toBe('my-token')
      expect(service.cache).toBeInstanceOf(Map)
      expect(service.requestQueue).toEqual([])
      expect(service.isProcessingQueue).toBe(false)
    })

    it('should initialize without token', () => {
      const service = new OpLabAPIService()
      expect(service.token).toBeNull()
    })
  })

  describe('Token Management', () => {
    it('should set token', () => {
      service.setToken('new-token')
      expect(service.token).toBe('new-token')
    })

    it('should clear token and cache', () => {
      service.cache.set('test', 'data')
      service.clearToken()
      expect(service.token).toBeNull()
      expect(service.cache.size).toBe(0)
    })
  })

  describe('Cache Management', () => {
    it('should get cache key correctly', () => {
      const key = service.getCacheKey('/test', { method: 'POST', body: { test: true } })
      expect(key).toBe('/test_{"test":true}_POST')
    })

    it('should set and get cached data', () => {
      const key = 'test-key'
      const data = { result: 'test' }
      
      service.setCache(key, data, API_ENDPOINTS.instruments)
      const cached = service.getFromCache(key)
      
      expect(cached).toEqual(data)
    })

    it('should return null for expired cache', () => {
      const key = 'test-key'
      const data = { result: 'test' }
      
      service.setCache(key, data, API_ENDPOINTS.instruments)
      
      // Fast forward time beyond cache TTL
      vi.advanceTimersByTime(API_CONFIG.refreshIntervals.instruments + 1000)
      
      const cached = service.getFromCache(key)
      expect(cached).toBeNull()
    })

    it('should not cache endpoints with zero TTL', () => {
      const key = 'test-key'
      const data = { result: 'test' }
      
      service.setCache(key, data, '/unknown-endpoint')
      
      expect(service.cache.size).toBe(0)
    })

    it('should clear all cache', () => {
      service.cache.set('key1', 'data1')
      service.cache.set('key2', 'data2')

      service.clearCache()

      expect(service.cache.size).toBe(0)
    })

    it('should update refresh interval at runtime', () => {
      const original = API_CONFIG.refreshIntervals.instruments
      updateRefreshInterval('instruments', 1000)

      const key = 'dynamic-key'
      const data = { result: 'dynamic' }

      service.setCache(key, data, API_ENDPOINTS.instruments)
      vi.advanceTimersByTime(1000 + 10)

      expect(service.getFromCache(key)).toBeNull()

      updateRefreshInterval('instruments', original)
    })
  })

  describe('Request Execution', () => {
    it('should make successful API request', async () => {
      const responseData = { data: 'test' }
      mockFetch.mockResolvedValueOnce(createMockResponse(responseData))

      const result = await service.executeRequest({
        endpoint: '/test',
        options: { method: 'GET' }
      })

      expect(result).toEqual(responseData)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.oplab.com.br/v3/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'x-oplab-token': 'test-token'
          })
        })
      )
    })

    it('should update token from response header', async () => {
      const headers = {
        get: vi.fn().mockImplementation((name) =>
          name === 'x-oplab-token' ? 'new-token' : null
        )
      }
      mockFetch.mockResolvedValueOnce(createMockResponse({}, { headers }))

      await service.executeRequest({
        endpoint: '/test',
        options: { method: 'GET' }
      })

      expect(service.token).toBe('new-token')
      expect(headers.get).toHaveBeenCalledWith('x-oplab-token')
    })

    it('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'Invalid token' },
          { ok: false, status: 401, statusText: 'Unauthorized' }
        )
      )

      await expect(service.executeRequest({
        endpoint: '/test',
        options: { method: 'GET' }
      })).rejects.toThrow(OpLabAPIError)
    })

    it('should retry on server errors', async () => {
      vi.useRealTimers()
      API_CONFIG.retryAttempts = 2
      mockFetch
        .mockResolvedValueOnce(
          createMockResponse(
            { message: 'Server error' },
            { ok: false, status: 500, statusText: 'Internal Server Error' }
          )
        )
        .mockResolvedValueOnce(
          createMockResponse({ data: 'success' })
        )

      const result = await service.executeRequest({
        endpoint: '/test',
        options: { method: 'GET' }
      })

      expect(result).toEqual({ data: 'success' })
      expect(mockFetch).toHaveBeenCalledTimes(2)
      vi.useFakeTimers()
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      await expect(service.executeRequest({
        endpoint: '/test',
        options: { method: 'GET' }
      })).rejects.toThrow()
      vi.useFakeTimers()
    })

    it('should handle timeout', async () => {
      mockFetch.mockImplementation((_, options) =>
        new Promise((resolve, reject) => {
          options.signal.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          )
          setTimeout(() => resolve({
            ok: true,
            json: () => Promise.resolve({ data: 'late' }),
            headers: { get: vi.fn().mockReturnValue(null) }
          }), API_CONFIG.timeout + 1000)
        })
      )

      const promise = service.executeRequest({
        endpoint: '/test',
        options: { method: 'GET' }
      })

      vi.advanceTimersByTime(API_CONFIG.timeout + 1000)

      await expect(promise).rejects.toThrow()
    })
  })

  describe('API Methods', () => {
    it('should get instruments', async () => {
      const mockData = [{ symbol: 'PETR4', name: 'Petrobras' }]
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

      const result = await service.getInstruments({ sector: 'Oil' })

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.oplab.com.br/v3/market/instruments',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ sector: 'Oil' })
        })
      )
    })

    it('should get quotes', async () => {
      const mockData = [{ symbol: 'PETR4', price: 32.45 }]
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

      const result = await service.getQuotes(['PETR4', 'VALE3'])

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.oplab.com.br/v3/market/quote',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ symbols: ['PETR4', 'VALE3'] })
        })
      )
    })

    it('should get fundamentals', async () => {
      const mockData = { symbol: 'PETR4', roic: 8.2 }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

      const result = await service.getFundamentals('PETR4')

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith('https://api.oplab.com.br/v3/market/fundamentals/PETR4', expect.any(Object))
    })

    it('should check health', async () => {
      const mockData = { status: 'ok' }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

      const result = await service.checkHealth()

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith('https://api.oplab.com.br/v3/health', expect.any(Object))
    })

    it('should get user info', async () => {
      const mockData = { id: 1, name: 'Test User' }
      mockFetch.mockResolvedValueOnce(createMockResponse(mockData))

      const result = await service.getUserInfo()

      expect(result).toEqual(mockData)
      expect(mockFetch).toHaveBeenCalledWith('https://api.oplab.com.br/v3/user', expect.any(Object))
    })
  })

  describe('Wheel Screening', () => {
    it('should perform wheel screening successfully', async () => {
      vi.useRealTimers()
      const mockInstruments = [
        { symbol: 'PETR4', name: 'Petrobras', sector: 'Oil' }
      ]
      const mockQuotes = [
        { symbol: 'PETR4', price: 32.45, volume: 1000000 }
      ]
      const mockFundamentals = {
        symbol: 'PETR4', roic: 8.2, roe: 12, debtToEquity: 0.4
      }

      mockFetch
        .mockResolvedValueOnce(createMockResponse(mockInstruments))
        .mockResolvedValueOnce(createMockResponse(mockQuotes))
        .mockResolvedValueOnce(createMockResponse(mockFundamentals))

      const filters = {
        minPrice: 20,
        maxPrice: 50,
        minVolume: 500000,
        sectors: ['Oil']
      }

      const result = await service.performWheelScreening(filters)

      expect(result).toHaveLength(1)
      expect(result[0]).toHaveProperty('symbol', 'PETR4')
      expect(result[0]).toHaveProperty('score')
      expect(typeof result[0].score).toBe('number')
      vi.useFakeTimers()
    })

    it('should return empty array when no instruments found', async () => {
      vi.useRealTimers()
      mockFetch.mockResolvedValueOnce(createMockResponse([]))

      const result = await service.performWheelScreening({})

      expect(result).toEqual([])
      vi.useFakeTimers()
    })

    it('should handle API errors in screening', async () => {
      vi.useRealTimers()
      mockFetch.mockResolvedValueOnce(
        createMockResponse(
          { message: 'Server error' },
          { ok: false, status: 500 }
        )
      )

      await expect(service.performWheelScreening({})).rejects.toThrow()
      vi.useFakeTimers()
    })
  })

  describe('Scoring Algorithm', () => {
    it('should calculate wheel score correctly', () => {
      const stock = {
        instrument: { symbol: 'TEST', sector: 'Technology' },
        quote: { price: 50, volume: 1000000, historicalPrices: [45, 47, 50, 52, 50] },
        fundamental: { roic: 15, roe: 18, debtToEquity: 0.3, revenueGrowth: 0.15 }
      }

      const score = service.calculateWheelScore({
        ...stock,
        filters: { minVolume: 100000 }
      })

      expect(score).toBeGreaterThan(50)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle missing data in scoring', () => {
      const stock = {
        instrument: { symbol: 'TEST' },
        quote: { price: 50, volume: 100000 },
        fundamental: {}
      }

      const score = service.calculateWheelScore({
        ...stock,
        filters: { minVolume: 100000 }
      })

      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should calculate volatility correctly', () => {
      const prices = [100, 105, 98, 102, 97]
      const volatility = service.calculateVolatility(prices)

      expect(volatility).toBeGreaterThan(0)
      expect(volatility).toBeLessThan(1)
    })

    it('should handle empty price array in volatility calculation', () => {
      const volatility = service.calculateVolatility([])
      expect(volatility).toBe(0.5) // Default high volatility
    })

    it('should calculate trend correctly', () => {
      const upwardPrices = [10, 12, 14, 16, 18]
      const upwardTrend = service.calculateTrend(upwardPrices)
      expect(upwardTrend).toBeGreaterThan(0)

      const downwardPrices = [18, 16, 14, 12, 10]
      const downwardTrend = service.calculateTrend(downwardPrices)
      expect(downwardTrend).toBeLessThan(0)
    })

    it('should calculate support level', () => {
      const prices = [50, 45, 48, 42, 46, 44, 47]
      const support = service.calculateSupport(prices)
      
      expect(support).toBe(42) // Minimum price
    })
  })

  describe('Wheel Metrics', () => {
    it('should get wheel metrics', () => {
      const instrument = { sector: 'Technology' }
      const quote = { price: 50, volume: 1000000 }
      const fundamental = { dividendYield: 0.03 }

      const metrics = service.getWheelMetrics(instrument, quote, fundamental)

      expect(metrics).toHaveProperty('optionLiquidity')
      expect(metrics).toHaveProperty('impliedVolatility')
      expect(metrics).toHaveProperty('dividendYield', 0.03)
      expect(metrics).toHaveProperty('putCallRatio')
      expect(metrics).toHaveProperty('wheelSuitability')
    })

    it('should estimate option liquidity based on volume', () => {
      expect(service.estimateOptionLiquidity({ volume: 2000000 })).toBe('High')
      expect(service.estimateOptionLiquidity({ volume: 750000 })).toBe('Medium')
      expect(service.estimateOptionLiquidity({ volume: 200000 })).toBe('Low')
      expect(service.estimateOptionLiquidity({ volume: 50000 })).toBe('Very Low')
    })

    it('should calculate wheel suitability', () => {
      const instrument = { sector: 'Technology' }
      const quote = { price: 50, volume: 1000000 }
      const fundamental = { debtToEquity: 0.3, dividendYield: 0.025 }

      const suitability = service.calculateWheelSuitability(instrument, quote, fundamental)

      expect(suitability).toBeGreaterThan(0)
      expect(suitability).toBeLessThanOrEqual(100)
    })
  })
})

describe('OpLabAPIError', () => {
  it('should create error with all properties', () => {
    const error = new OpLabAPIError('Test message', 404, 'NOT_FOUND', { detail: 'test' })

    expect(error.message).toBe('Test message')
    expect(error.status).toBe(404)
    expect(error.code).toBe('NOT_FOUND')
    expect(error.details).toEqual({ detail: 'test' })
    expect(error.name).toBe('OpLabAPIError')
  })

  it('should create error from response', () => {
    const response = { status: 400, statusText: 'Bad Request' }
    const data = { message: 'Invalid input', code: 'BAD_INPUT' }

    const error = OpLabAPIError.fromResponse(response, data)

    expect(error.message).toBe('Invalid input')
    expect(error.status).toBe(400)
    expect(error.code).toBe('BAD_INPUT')
  })

  it('should create network error', () => {
    const error = OpLabAPIError.networkError('Connection failed')

    expect(error.message).toBe('Connection failed')
    expect(error.status).toBe(0)
    expect(error.code).toBe('NETWORK_ERROR')
  })

  it('should create timeout error', () => {
    const error = OpLabAPIError.timeoutError()

    expect(error.message).toBe('Tempo limite excedido')
    expect(error.status).toBe(0)
    expect(error.code).toBe('TIMEOUT_ERROR')
  })

  it('should create auth error', () => {
    const error = OpLabAPIError.authError()

    expect(error.message).toBe('Token inválido ou expirado')
    expect(error.status).toBe(401)
    expect(error.code).toBe('AUTH_ERROR')
  })
})

describe('Default Service Instance', () => {
  afterEach(() => {
    __resetOpLabService()
  })

  it('should create default service instance', () => {
    const service1 = getOpLabService('token1')
    const service2 = getOpLabService()

    expect(service1).toBe(service2) // Should return same instance
    expect(service1.token).toBe('token1')
  })

  it('should update token on existing service', () => {
    const service1 = getOpLabService('token1')
    const service2 = getOpLabService('token2')

    expect(service1).toBe(service2)
    expect(service1.token).toBe('token2')
  })
})

describe('ScreeningUtils', () => {
  describe('Filter Functions', () => {
    const mockStocks = [
      { symbol: 'PETR4', price: 32.45, volume: 1000000, roic: 8.2, sector: 'Oil' },
      { symbol: 'VALE3', price: 58.90, volume: 500000, roic: 7.8, sector: 'Mining' }
    ]

    it('should filter by price', () => {
      const result = ScreeningUtils.filterByPrice(mockStocks, 30, 50)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('PETR4')
    })

    it('should filter by volume', () => {
      const result = ScreeningUtils.filterByVolume(mockStocks, 750000)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('PETR4')
    })

    it('should filter by ROIC', () => {
      const result = ScreeningUtils.filterByROIC(mockStocks, 8.0)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('PETR4')
    })

    it('should filter by sector', () => {
      const result = ScreeningUtils.filterBySector(mockStocks, ['Oil'])
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('PETR4')
    })
  })

  describe('Sorting Functions', () => {
    const mockStocks = [
      { symbol: 'PETR4', score: 85 },
      { symbol: 'VALE3', score: 92 }
    ]

    it('should sort by score descending', () => {
      const result = ScreeningUtils.sortByScore(mockStocks, 'desc')
      expect(result[0].symbol).toBe('VALE3')
      expect(result[1].symbol).toBe('PETR4')
    })

    it('should sort by score ascending', () => {
      const result = ScreeningUtils.sortByScore(mockStocks, 'asc')
      expect(result[0].symbol).toBe('PETR4')
      expect(result[1].symbol).toBe('VALE3')
    })
  })

  describe('Formatting Functions', () => {
    it('should format currency', () => {
      expect(ScreeningUtils.formatCurrency(32.45)).toBe('R$ 32,45')
    })

    it('should format numbers', () => {
      expect(ScreeningUtils.formatNumber(8.234, 2)).toBe('8,23')
    })

    it('should format volume', () => {
      expect(ScreeningUtils.formatVolume(1500000)).toBe('1.5M')
      expect(ScreeningUtils.formatVolume(50000)).toBe('50K')
      expect(ScreeningUtils.formatVolume(500)).toBe('500')
    })
  })
})