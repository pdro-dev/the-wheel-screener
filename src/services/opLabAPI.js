// OpLab API Service for The Wheel Screener

// API Configuration
export const API_CONFIG = {
  // Base URL now defaults to local proxy but can be overridden for production
  baseURL: import.meta?.env?.VITE_OPLAB_API_URL || '/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  refreshIntervals: {
    instruments: 15 * 60 * 1000,
    quotes: 15 * 60 * 1000,
    fundamentals: 15 * 60 * 1000,
    options: 15 * 60 * 1000,
    screening: 15 * 60 * 1000,
    user: 15 * 60 * 1000,
    health: 15 * 60 * 1000
  }
}

export const API_ENDPOINTS = {
  instruments: '/instruments',
  quotes: '/quotes',
  fundamentals: '/fundamentals',
  options: '/options',
  screening: '/screening',
  user: '/user',
  health: '/health'
}

export function setRefreshInterval(endpoint, ms) {
  if (typeof ms === 'number' && ms >= 0) {
    API_CONFIG.refreshIntervals[endpoint] = ms
  }
}

// Custom error class for OpLab API
export class OpLabAPIError extends Error {
  constructor(message, status, code, details = {}) {
    super(message)
    this.name = 'OpLabAPIError'
    this.status = status
    this.code = code
    this.details = details
  }

  static fromResponse(response, data) {
    const message = data?.message || `HTTP ${response.status}: ${response.statusText}`
    const code = data?.code || 'API_ERROR'
    const details = data?.details || {}
    
    return new OpLabAPIError(message, response.status, code, details)
  }

  static networkError(message = 'Erro de rede') {
    return new OpLabAPIError(message, 0, 'NETWORK_ERROR')
  }

  static timeoutError() {
    return new OpLabAPIError('Tempo limite excedido', 0, 'TIMEOUT_ERROR')
  }

  static authError() {
    return new OpLabAPIError('Token inválido ou expirado', 401, 'AUTH_ERROR')
  }
}

// OpLab API Service Class
export class OpLabAPIService {
  constructor(token = null) {
    this.token = token
    this.cache = new Map()
    this.requestQueue = []
    this.isProcessingQueue = false
  }

  setToken(token) {
    this.token = token
  }

  clearToken() {
    this.token = null
    this.cache.clear()
  }

  // Rate limiting and queue management
  async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return
    }

    this.isProcessingQueue = true
    
    while (this.requestQueue.length > 0) {
      const { request, resolve, reject } = this.requestQueue.shift()
      
      try {
        const result = await this.executeRequest(request)
        resolve(result)
      } catch (error) {
        reject(error)
      }
      
      // Add delay between requests to respect rate limits
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    this.isProcessingQueue = false
  }

  // Core request method with retry logic
  async makeRequest(endpoint, options = {}) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({
        request: { endpoint, options },
        resolve,
        reject
      })
      
      this.processQueue()
    })
  }

  async executeRequest({ endpoint, options }) {
    const url = `${API_CONFIG.baseURL}${endpoint}`
    const requestId = `${options.method || 'GET'}_${endpoint}_${JSON.stringify(options.body || {})}`
    
    // Check cache first
    const cacheKey = this.getCacheKey(endpoint, options)
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      return cached
    }

    let lastError
    
    for (let attempt = 1; attempt <= API_CONFIG.retryAttempts; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(this.token && { 'Access-Token': this.token }),
            ...options.headers
          },
          signal: controller.signal
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw OpLabAPIError.fromResponse(response, errorData)
        }

        const data = await response.json()
        
        // Cache successful responses
        this.setCache(cacheKey, data, endpoint)
        
        return data

      } catch (error) {
        lastError = error
        
        if (error.name === 'AbortError') {
          throw OpLabAPIError.timeoutError()
        }
        
        if (error.status === 401) {
          throw OpLabAPIError.authError()
        }
        
        if (error.status >= 500 && attempt < API_CONFIG.retryAttempts) {
          await new Promise(resolve => 
            setTimeout(resolve, API_CONFIG.retryDelay * attempt)
          )
          continue
        }
        
        break
      }
    }
    
    throw lastError || OpLabAPIError.networkError()
  }

  // Cache management
  getCacheKey(endpoint, options = {}) {
    return `${endpoint}_${JSON.stringify(options.body || {})}_${options.method || 'GET'}`
  }

  getFromCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  setCache(key, data, endpoint) {
    const ttl = this.getCacheTTL(endpoint)
    if (ttl > 0) {
      this.cache.set(key, {
        data,
        expires: Date.now() + ttl
      })
    }
  }

  getCacheTTL(endpoint) {
    for (const [key, path] of Object.entries(API_ENDPOINTS)) {
      if (endpoint.includes(path)) {
        return API_CONFIG.refreshIntervals[key] ?? 0
      }
    }
    return 0
  }

  clearCache() {
    this.cache.clear()
  }

  // API Methods
  async getInstruments(filters = {}) {
    const data = await this.makeRequest(API_ENDPOINTS.instruments, {
      method: 'POST',
      body: JSON.stringify(filters)
    })
    return data?.instruments ?? data
  }

  async getQuotes(symbols) {
    const data = await this.makeRequest(API_ENDPOINTS.quotes, {
      method: 'POST',
      body: JSON.stringify({ symbols })
    })
    return data?.quotes ?? data
  }

  async getFundamentals(symbol) {
    const data = await this.makeRequest(`${API_ENDPOINTS.fundamentals}/${symbol}`)
    return data?.fundamentals ?? data
  }

  async getOptions(symbol, filters = {}) {
    return this.makeRequest(API_ENDPOINTS.options, {
      method: 'POST',
      body: JSON.stringify({ symbol, ...filters })
    })
  }

  async getUserInfo() {
    return this.makeRequest(API_ENDPOINTS.user)
  }

  async checkHealth() {
    return this.makeRequest(API_ENDPOINTS.health)
  }

  // Wheel Screening specific methods
  async performWheelScreening(filters) {
    try {
      // Step 1: Get instruments matching basic criteria
      const instruments = await this.getInstruments({
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sectors: filters.sectors,
        liquidity: filters.minVolume
      })

      if (instruments.length === 0) {
        return []
      }

      // Step 2: Get current quotes
      const symbols = instruments.map(i => i.symbol)
      const quotes = await this.getQuotes(symbols)

      // Step 3: Filter by volume and get fundamentals for remaining
      const volumeFiltered = quotes.filter(q => q.volume >= filters.minVolume)
      
      if (volumeFiltered.length === 0) {
        return []
      }

      // Step 4: Get fundamentals for volume-filtered instruments
      const fundamentalsPromises = volumeFiltered.map(q => 
        this.getFundamentals(q.symbol).catch(() => null)
      )
      const fundamentals = await Promise.all(fundamentalsPromises)

      // Step 5: Combine data and calculate wheel scores
      const results = this.calculateWheelScores(
        instruments,
        quotes,
        fundamentals.filter(f => f !== null),
        filters
      )

      return results.filter(r => r.score >= (filters.minScore || 0))

    } catch (error) {
      console.error('Wheel screening error:', error)
      throw error
    }
  }

  // Wheel score calculation algorithm
  calculateWheelScores(instruments, quotes, fundamentals, filters) {
    const results = []

    for (const instrument of instruments) {
      const quote = quotes.find(q => q.symbol === instrument.symbol)
      const fundamental = fundamentals.find(f => f.symbol === instrument.symbol)
      
      if (!quote || !fundamental) continue

      const score = this.calculateWheelScore({
        instrument,
        quote,
        fundamental,
        filters
      })

      results.push({
        symbol: instrument.symbol,
        name: instrument.name,
        sector: instrument.sector,
        price: quote.price,
        volume: quote.volume,
        roic: fundamental.roic || 0,
        roe: fundamental.roe || 0,
        debt: fundamental.debtToEquity || 0,
        revenue: fundamental.revenue || 0,
        volatility: this.calculateVolatility(quote.historicalPrices || []),
        score,
        wheelMetrics: this.getWheelMetrics(instrument, quote, fundamental)
      })
    }

    return results.sort((a, b) => b.score - a.score)
  }

  calculateWheelScore({ instrument, quote, fundamental, filters }) {
    let score = 0
    const weights = {
      roic: 0.25,      // Return on Invested Capital
      volume: 0.20,    // Liquidity
      volatility: 0.15, // Price stability
      fundamentals: 0.25, // Overall financial health
      technicals: 0.15  // Technical indicators
    }

    // ROIC Score (0-25 points)
    const roic = fundamental.roic || 0
    if (roic >= 15) score += 25
    else if (roic >= 10) score += 20
    else if (roic >= 8) score += 15
    else if (roic >= 5) score += 10
    else score += 5

    // Volume Score (0-20 points)
    const volumeRatio = quote.volume / filters.minVolume
    if (volumeRatio >= 10) score += 20
    else if (volumeRatio >= 5) score += 16
    else if (volumeRatio >= 2) score += 12
    else if (volumeRatio >= 1) score += 8
    else score += 4

    // Volatility Score (0-15 points) - Lower volatility is better
    const volatility = this.calculateVolatility(quote.historicalPrices || [])
    if (volatility <= 0.15) score += 15
    else if (volatility <= 0.25) score += 12
    else if (volatility <= 0.35) score += 9
    else if (volatility <= 0.45) score += 6
    else score += 3

    // Fundamentals Score (0-25 points)
    let fundamentalScore = 0
    
    // Debt to Equity
    const debtToEquity = fundamental.debtToEquity || 0
    if (debtToEquity <= 0.3) fundamentalScore += 8
    else if (debtToEquity <= 0.6) fundamentalScore += 6
    else if (debtToEquity <= 1.0) fundamentalScore += 4
    else fundamentalScore += 2

    // ROE
    const roe = fundamental.roe || 0
    if (roe >= 15) fundamentalScore += 8
    else if (roe >= 10) fundamentalScore += 6
    else if (roe >= 5) fundamentalScore += 4
    else fundamentalScore += 2

    // Revenue Growth
    const revenueGrowth = fundamental.revenueGrowth || 0
    if (revenueGrowth >= 0.15) fundamentalScore += 9
    else if (revenueGrowth >= 0.1) fundamentalScore += 7
    else if (revenueGrowth >= 0.05) fundamentalScore += 5
    else if (revenueGrowth >= 0) fundamentalScore += 3
    else fundamentalScore += 1

    score += fundamentalScore

    // Technical Score (0-15 points)
    let technicalScore = 0
    
    // Price trend
    const prices = quote.historicalPrices || []
    if (prices.length >= 20) {
      const recent = prices.slice(-20)
      const trend = this.calculateTrend(recent)
      
      if (trend > 0.05) technicalScore += 5
      else if (trend > 0) technicalScore += 4
      else if (trend > -0.05) technicalScore += 3
      else technicalScore += 1
    }

    // Support/Resistance levels
    const supportLevel = this.calculateSupport(prices)
    const currentPrice = quote.price
    const distanceFromSupport = (currentPrice - supportLevel) / supportLevel
    
    if (distanceFromSupport >= 0.05 && distanceFromSupport <= 0.15) {
      technicalScore += 10 // Good entry point
    } else if (distanceFromSupport >= 0 && distanceFromSupport <= 0.25) {
      technicalScore += 7
    } else {
      technicalScore += 3
    }

    score += technicalScore

    return Math.min(100, Math.max(0, score))
  }

  calculateVolatility(prices) {
    if (prices.length < 2) return 0.5 // Default high volatility

    const returns = []
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1])
    }

    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length
    
    return Math.sqrt(variance * 252) // Annualized volatility
  }

  calculateTrend(prices) {
    if (prices.length < 2) return 0

    const n = prices.length
    const x = Array.from({length: n}, (_, i) => i)
    const y = prices

    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    
    return slope / (sumY / n) // Normalized slope
  }

  calculateSupport(prices) {
    if (prices.length < 10) return Math.min(...prices)

    // Simple support calculation - lowest low in recent period
    const recentPrices = prices.slice(-20)
    return Math.min(...recentPrices)
  }

  getWheelMetrics(instrument, quote, fundamental) {
    return {
      optionLiquidity: this.estimateOptionLiquidity(quote),
      impliedVolatility: this.estimateImpliedVolatility(quote),
      dividendYield: fundamental.dividendYield || 0,
      putCallRatio: this.estimatePutCallRatio(quote),
      wheelSuitability: this.calculateWheelSuitability(instrument, quote, fundamental)
    }
  }

  estimateOptionLiquidity(quote) {
    // Estimate based on stock volume
    const volume = quote.volume
    if (volume >= 1000000) return 'High'
    if (volume >= 500000) return 'Medium'
    if (volume >= 100000) return 'Low'
    return 'Very Low'
  }

  estimateImpliedVolatility(quote) {
    // Rough estimate based on recent price volatility
    const volatility = this.calculateVolatility(quote.historicalPrices || [])
    return Math.min(1.0, volatility * 1.2) // IV typically higher than HV
  }

  estimatePutCallRatio(quote) {
    // Placeholder - would need real options data
    return 0.8 + (Math.random() * 0.4) // Random between 0.8-1.2
  }

  calculateWheelSuitability(instrument, quote, fundamental) {
    let score = 0
    
    // Sector suitability
    const goodSectors = ['Technology', 'Healthcare', 'Consumer Staples', 'Utilities']
    if (goodSectors.includes(instrument.sector)) score += 20
    
    // Price range suitability
    if (quote.price >= 20 && quote.price <= 100) score += 20
    else if (quote.price >= 10 && quote.price <= 200) score += 15
    else score += 10
    
    // Financial stability
    const debtToEquity = fundamental.debtToEquity || 0
    if (debtToEquity <= 0.5) score += 20
    else if (debtToEquity <= 1.0) score += 15
    else score += 10
    
    // Dividend consideration
    if (fundamental.dividendYield && fundamental.dividendYield > 0.02) score += 10
    
    // Volume consistency
    if (quote.volume >= 500000) score += 20
    else if (quote.volume >= 100000) score += 15
    else score += 10
    
    return Math.min(100, score)
  }
}

// Default service instance
let defaultService = null

export function getOpLabService(token = null) {
  if (!defaultService) {
    defaultService = new OpLabAPIService(token)
  } else if (token) {
    defaultService.setToken(token)
  }
  
  return defaultService
}

// Utility functions for screening filters
export const ScreeningUtils = {
  filterByPrice: (instruments, minPrice, maxPrice) => {
    return instruments.filter(i => i.price >= minPrice && i.price <= maxPrice)
  },

  filterByVolume: (instruments, minVolume) => {
    return instruments.filter(i => i.volume >= minVolume)
  },

  filterByROIC: (instruments, minROIC) => {
    return instruments.filter(i => (i.roic || 0) >= minROIC)
  },

  filterBySector: (instruments, sectors) => {
    if (!sectors || sectors.length === 0) return instruments
    return instruments.filter(i => sectors.includes(i.sector))
  },

  sortByScore: (instruments, direction = 'desc') => {
    return [...instruments].sort((a, b) => {
      return direction === 'desc' ? b.score - a.score : a.score - b.score
    })
  },

  formatCurrency: (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  },

  formatNumber: (value, decimals = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  },

  formatVolume: (volume) => {
    if (volume >= 1000000) {
      return `${(volume / 1000000).toFixed(1)}M`
    } else if (volume >= 1000) {
      return `${(volume / 1000).toFixed(0)}K`
    }
    return volume.toString()
  }
}

export default OpLabAPIService