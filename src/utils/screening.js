// Screening utility functions for The Wheel Screener

// Filter functions
export function filterByPrice(stocks, minPrice = 0, maxPrice = Infinity) {
  return stocks.filter(stock => 
    stock.price >= minPrice && stock.price <= maxPrice
  )
}

export function filterByVolume(stocks, minVolume = 0) {
  return stocks.filter(stock => stock.volume >= minVolume)
}

export function filterByROIC(stocks, minROIC = 0) {
  return stocks.filter(stock => (stock.roic || 0) >= minROIC)
}

export function filterBySector(stocks, sectors = []) {
  if (!sectors || sectors.length === 0) return stocks
  return stocks.filter(stock => sectors.includes(stock.sector))
}

export function filterByScore(stocks, minScore = 0) {
  return stocks.filter(stock => (stock.score || 0) >= minScore)
}

export function filterBySearch(stocks, searchTerm = '') {
  if (!searchTerm.trim()) return stocks
  
  const term = searchTerm.toLowerCase()
  return stocks.filter(stock => 
    stock.symbol?.toLowerCase().includes(term) ||
    stock.name?.toLowerCase().includes(term) ||
    stock.sector?.toLowerCase().includes(term)
  )
}

// Comprehensive filter function
export function applyFilters(stocks, filters = {}) {
  let result = stocks

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    result = filterByPrice(result, filters.minPrice, filters.maxPrice)
  }

  if (filters.minVolume !== undefined) {
    result = filterByVolume(result, filters.minVolume)
  }

  if (filters.minROIC !== undefined) {
    result = filterByROIC(result, filters.minROIC)
  }

  if (filters.sectors && filters.sectors.length > 0) {
    result = filterBySector(result, filters.sectors)
  }

  if (filters.minScore !== undefined) {
    result = filterByScore(result, filters.minScore)
  }

  if (filters.search) {
    result = filterBySearch(result, filters.search)
  }

  return result
}

// Scoring functions
export function calculateWheelScore(stock, weights = {}) {
  const defaultWeights = {
    roic: 0.25,
    volume: 0.20,
    volatility: 0.15,
    fundamentals: 0.25,
    technicals: 0.15,
    ...weights
  }

  let score = 0

  // ROIC Score (0-25 points)
  const roic = stock.roic || 0
  if (roic >= 15) score += 25
  else if (roic >= 10) score += 20
  else if (roic >= 8) score += 15
  else if (roic >= 5) score += 10
  else score += 5

  // Volume Score (0-20 points)
  const volume = stock.volume || 0
  const minVolume = 100000
  const volumeRatio = volume / minVolume
  if (volumeRatio >= 10) score += 20
  else if (volumeRatio >= 5) score += 16
  else if (volumeRatio >= 2) score += 12
  else if (volumeRatio >= 1) score += 8
  else score += 4

  // Volatility Score (0-15 points) - Lower is better
  const volatility = stock.volatility || 0.3
  if (volatility <= 0.15) score += 15
  else if (volatility <= 0.25) score += 12
  else if (volatility <= 0.35) score += 9
  else if (volatility <= 0.45) score += 6
  else score += 3

  // Fundamentals Score (0-25 points)
  let fundamentalScore = 0
  
  // Debt to Equity
  const debtToEquity = stock.debtToEquity || 0
  if (debtToEquity <= 0.3) fundamentalScore += 8
  else if (debtToEquity <= 0.6) fundamentalScore += 6
  else if (debtToEquity <= 1.0) fundamentalScore += 4
  else fundamentalScore += 2

  // ROE
  const roe = stock.roe || 0
  if (roe >= 15) fundamentalScore += 8
  else if (roe >= 10) fundamentalScore += 6
  else if (roe >= 5) fundamentalScore += 4
  else fundamentalScore += 2

  // Revenue Growth
  const revenueGrowth = stock.revenueGrowth || 0
  if (revenueGrowth >= 0.15) fundamentalScore += 9
  else if (revenueGrowth >= 0.1) fundamentalScore += 7
  else if (revenueGrowth >= 0.05) fundamentalScore += 5
  else if (revenueGrowth >= 0) fundamentalScore += 3
  else fundamentalScore += 1

  score += fundamentalScore

  // Technical Score (0-15 points)
  let technicalScore = 0
  
  // Price trend
  const trend = stock.trend || 0
  if (trend > 0.05) technicalScore += 8
  else if (trend > 0) technicalScore += 6
  else if (trend > -0.05) technicalScore += 4
  else technicalScore += 2

  // Support level proximity
  const supportLevel = stock.supportLevel || stock.price * 0.9
  const distanceFromSupport = (stock.price - supportLevel) / supportLevel
  
  if (distanceFromSupport >= 0.05 && distanceFromSupport <= 0.15) {
    technicalScore += 7 // Good entry point
  } else if (distanceFromSupport >= 0 && distanceFromSupport <= 0.25) {
    technicalScore += 5
  } else {
    technicalScore += 2
  }

  score += technicalScore

  return Math.min(100, Math.max(0, score))
}

// Ranking functions
export function rankStocks(stocks, criteria = 'score') {
  return [...stocks].sort((a, b) => {
    const aValue = a[criteria] || 0
    const bValue = b[criteria] || 0
    return bValue - aValue // Descending order
  })
}

export function rankByMultipleCriteria(stocks, criteria = []) {
  const defaultCriteria = [
    { field: 'score', weight: 0.4, direction: 'desc' },
    { field: 'roic', weight: 0.3, direction: 'desc' },
    { field: 'volume', weight: 0.2, direction: 'desc' },
    { field: 'volatility', weight: 0.1, direction: 'asc' }
  ]

  const activeCriteria = criteria.length > 0 ? criteria : defaultCriteria

  return [...stocks].sort((a, b) => {
    let scoreA = 0
    let scoreB = 0

    for (const criterion of activeCriteria) {
      const aValue = a[criterion.field] || 0
      const bValue = b[criterion.field] || 0
      
      const comparison = criterion.direction === 'desc' 
        ? bValue - aValue 
        : aValue - bValue

      scoreA += comparison * criterion.weight
      scoreB -= comparison * criterion.weight
    }

    return scoreB - scoreA
  })
}

// Formatting functions
export function formatCurrency(value, currency = 'BRL') {
  if (value === null || value === undefined) return '-'
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(value)
}

export function formatNumber(value, decimals = 2) {
  if (value === null || value === undefined) return '-'
  
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}

export function formatVolume(volume) {
  if (volume === null || volume === undefined) return '-'
  
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(0)}K`
  }
  return volume.toString()
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '-'
  
  return `${formatNumber(value * 100, decimals)}%`
}

// Validation functions
export function validateStock(stock) {
  const errors = []

  if (!stock.symbol || typeof stock.symbol !== 'string') {
    errors.push('Symbol is required and must be a string')
  }

  if (!stock.name || typeof stock.name !== 'string') {
    errors.push('Name is required and must be a string')
  }

  if (typeof stock.price !== 'number' || stock.price <= 0) {
    errors.push('Price must be a positive number')
  }

  if (typeof stock.volume !== 'number' || stock.volume < 0) {
    errors.push('Volume must be a non-negative number')
  }

  if (stock.roic !== undefined && (typeof stock.roic !== 'number' || stock.roic < 0)) {
    errors.push('ROIC must be a non-negative number if provided')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateFilters(filters) {
  const errors = []

  if (filters.minPrice !== undefined) {
    if (typeof filters.minPrice !== 'number' || filters.minPrice < 0) {
      errors.push('Min price must be a non-negative number')
    }
  }

  if (filters.maxPrice !== undefined) {
    if (typeof filters.maxPrice !== 'number' || filters.maxPrice < 0) {
      errors.push('Max price must be a non-negative number')
    }
  }

  if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
    if (filters.minPrice > filters.maxPrice) {
      errors.push('Min price cannot be greater than max price')
    }
  }

  if (filters.minVolume !== undefined) {
    if (typeof filters.minVolume !== 'number' || filters.minVolume < 0) {
      errors.push('Min volume must be a non-negative number')
    }
  }

  if (filters.minROIC !== undefined) {
    if (typeof filters.minROIC !== 'number') {
      errors.push('Min ROIC must be a number')
    }
  }

  if (filters.sectors !== undefined) {
    if (!Array.isArray(filters.sectors)) {
      errors.push('Sectors must be an array')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// Mock data generation
export function generateMockStock(overrides = {}) {
  const sectors = [
    'Tecnologia',
    'Financeiro',
    'Petróleo e Gás',
    'Mineração',
    'Saúde',
    'Consumo',
    'Utilities',
    'Telecomunicações'
  ]

  const symbols = [
    'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'WEGE3', 'LREN3', 'MGLU3',
    'VIIA3', 'FLRY3', 'GGBR4', 'USIM5', 'CCRO3', 'CSAN3', 'CMIG4', 'EMBR3'
  ]

  const names = [
    'Petrobras PN', 'Vale ON', 'Itaú Unibanco PN', 'Bradesco PN', 'Ambev ON',
    'WEG ON', 'Lojas Renner ON', 'Magazine Luiza ON', 'Via ON', 'Fleury ON',
    'Gerdau PN', 'Usiminas PNA', 'CCR ON', 'Cosan ON', 'CEMIG PN', 'Embraer ON'
  ]

  const index = Math.floor(Math.random() * symbols.length)

  const baseStock = {
    symbol: symbols[index],
    name: names[index],
    sector: sectors[Math.floor(Math.random() * sectors.length)],
    price: 15 + Math.random() * 85, // 15-100
    volume: 100000 + Math.random() * 10000000, // 100K-10M
    roic: Math.random() * 25, // 0-25%
    roe: Math.random() * 30, // 0-30%
    debtToEquity: Math.random() * 2, // 0-2
    revenueGrowth: -0.1 + Math.random() * 0.4, // -10% to 30%
    volatility: 0.1 + Math.random() * 0.4, // 10-50%
    trend: -0.1 + Math.random() * 0.2, // -10% to 10%
    supportLevel: null, // Will be calculated
    score: 0 // Will be calculated
  }

  const stock = { ...baseStock, ...overrides }
  
  // Calculate derived fields
  stock.supportLevel = stock.supportLevel || stock.price * (0.85 + Math.random() * 0.1)
  stock.score = calculateWheelScore(stock)

  return stock
}

export function generateMockStocks(count = 10, filters = {}) {
  const stocks = []
  
  for (let i = 0; i < count; i++) {
    stocks.push(generateMockStock())
  }

  return applyFilters(stocks, filters)
}

// Portfolio analysis functions
export function calculatePortfolioMetrics(stocks, weights = {}) {
  if (!stocks || stocks.length === 0) {
    return {
      totalValue: 0,
      avgROIC: 0,
      avgScore: 0,
      totalVolume: 0,
      sectorDistribution: {},
      riskLevel: 'unknown'
    }
  }

  const totalValue = stocks.reduce((sum, stock) => sum + (stock.price * (weights[stock.symbol] || 1)), 0)
  const avgROIC = stocks.reduce((sum, stock) => sum + (stock.roic || 0), 0) / stocks.length
  const avgScore = stocks.reduce((sum, stock) => sum + (stock.score || 0), 0) / stocks.length
  const totalVolume = stocks.reduce((sum, stock) => sum + (stock.volume || 0), 0)
  
  // Sector distribution
  const sectorDistribution = {}
  stocks.forEach(stock => {
    if (stock.sector) {
      sectorDistribution[stock.sector] = (sectorDistribution[stock.sector] || 0) + 1
    }
  })

  // Risk level based on average volatility
  const avgVolatility = stocks.reduce((sum, stock) => sum + (stock.volatility || 0.3), 0) / stocks.length
  let riskLevel = 'low'
  if (avgVolatility > 0.35) riskLevel = 'high'
  else if (avgVolatility > 0.25) riskLevel = 'medium'

  return {
    totalValue,
    avgROIC,
    avgScore,
    totalVolume,
    sectorDistribution,
    riskLevel,
    avgVolatility
  }
}

// Export utilities
export function exportToCSV(stocks, filename = 'wheel-screening') {
  if (!stocks || stocks.length === 0) {
    throw new Error('No data to export')
  }

  const headers = ['Symbol', 'Name', 'Sector', 'Price', 'Volume', 'ROIC', 'Score']
  const rows = stocks.map(stock => [
    stock.symbol,
    stock.name,
    stock.sector,
    stock.price?.toFixed(2),
    stock.volume,
    stock.roic?.toFixed(2),
    stock.score?.toFixed(0)
  ])

  const csvContent = [headers, ...rows]
    .map(row => row.map(field => `"${field || ''}"`).join(','))
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    return true
  }
  
  return false
}

export default {
  // Filters
  filterByPrice,
  filterByVolume,
  filterByROIC,
  filterBySector,
  filterByScore,
  filterBySearch,
  applyFilters,
  
  // Scoring
  calculateWheelScore,
  
  // Ranking
  rankStocks,
  rankByMultipleCriteria,
  
  // Formatting
  formatCurrency,
  formatNumber,
  formatVolume,
  formatPercentage,
  
  // Validation
  validateStock,
  validateFilters,
  
  // Mock data
  generateMockStock,
  generateMockStocks,
  
  // Portfolio
  calculatePortfolioMetrics,
  
  // Export
  exportToCSV
}