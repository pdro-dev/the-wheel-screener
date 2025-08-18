import { describe, it, expect, beforeEach } from 'vitest'
import {
  filterByPrice,
  filterByVolume,
  filterByROIC,
  filterBySector,
  filterByScore,
  filterBySearch,
  applyFilters,
  calculateWheelScore,
  rankStocks,
  formatCurrency,
  formatNumber,
  formatVolume,
  validateStock,
  validateFilters,
  generateMockStock,
  generateMockStocks,
  calculatePortfolioMetrics,
  exportToCSV
} from '../screening'

describe('Screening Utilities', () => {
  let mockStocks

  beforeEach(() => {
    mockStocks = [
      {
        symbol: 'PETR4',
        name: 'Petrobras PN',
        price: 32.45,
        volume: 15420000,
        roic: 8.2,
        score: 95,
        sector: 'Petróleo e Gás'
      },
      {
        symbol: 'VALE3',
        name: 'Vale ON',
        price: 58.90,
        volume: 8750000,
        roic: 7.8,
        score: 92,
        sector: 'Mineração'
      },
      {
        symbol: 'ITUB4',
        name: 'Itaú Unibanco PN',
        price: 28.15,
        volume: 12300000,
        roic: 9.1,
        score: 89,
        sector: 'Financeiro'
      }
    ]
  })

  describe('Filter Functions', () => {
    it('should filter stocks by price range', () => {
      const result = filterByPrice(mockStocks, 30, 50)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('PETR4')
    })

    it('should filter stocks by minimum volume', () => {
      const result = filterByVolume(mockStocks, 10000000)
      expect(result).toHaveLength(2)
      expect(result.map(s => s.symbol)).toEqual(['PETR4', 'ITUB4'])
    })

    it('should filter stocks by minimum ROIC', () => {
      const result = filterByROIC(mockStocks, 8.5)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('ITUB4')
    })

    it('should filter stocks by sector', () => {
      const result = filterBySector(mockStocks, ['Financeiro'])
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('ITUB4')
    })

    it('should filter stocks by minimum score', () => {
      const result = filterByScore(mockStocks, 93)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('PETR4')
    })

    it('should filter stocks by search term', () => {
      const result = filterBySearch(mockStocks, 'vale')
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('VALE3')
    })

    it('should return all stocks when no sectors specified', () => {
      const result = filterBySector(mockStocks, [])
      expect(result).toHaveLength(3)
    })

    it('should return all stocks when search term is empty', () => {
      const result = filterBySearch(mockStocks, '')
      expect(result).toHaveLength(3)
    })
  })

  describe('Apply Filters', () => {
    it('should apply multiple filters correctly', () => {
      const filters = {
        minPrice: 25,
        maxPrice: 60,
        minVolume: 10000000,
        minROIC: 8
      }
      
      const result = applyFilters(mockStocks, filters)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('ITUB4')
    })

    it('should handle empty filters', () => {
      const result = applyFilters(mockStocks, {})
      expect(result).toHaveLength(3)
    })

    it('should handle search filter', () => {
      const filters = { search: 'petrobras' }
      const result = applyFilters(mockStocks, filters)
      expect(result).toHaveLength(1)
      expect(result[0].symbol).toBe('PETR4')
    })
  })

  describe('Scoring Functions', () => {
    it('should calculate wheel score correctly', () => {
      const stock = {
        symbol: 'TEST',
        price: 50,
        volume: 1000000,
        roic: 15,
        volatility: 0.2,
        debtToEquity: 0.4,
        roe: 12,
        revenueGrowth: 0.1,
        trend: 0.03
      }

      const score = calculateWheelScore(stock)
      expect(score).toBeGreaterThan(70)
      expect(score).toBeLessThanOrEqual(100)
    })

    it('should handle stocks with missing data', () => {
      const stock = {
        symbol: 'TEST',
        price: 50,
        volume: 1000000
      }

      const score = calculateWheelScore(stock)
      expect(score).toBeGreaterThan(0)
      expect(score).toBeLessThanOrEqual(100)
    })
  })

  describe('Ranking Functions', () => {
    it('should rank stocks by score in descending order', () => {
      const result = rankStocks(mockStocks, 'score')
      expect(result[0].symbol).toBe('PETR4')
      expect(result[1].symbol).toBe('VALE3')
      expect(result[2].symbol).toBe('ITUB4')
    })

    it('should not mutate original array', () => {
      const original = [...mockStocks]
      rankStocks(mockStocks, 'score')
      expect(mockStocks).toEqual(original)
    })
  })

  describe('Formatting Functions', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(32.45)).toBe('R$ 32,45')
      expect(formatCurrency(1000)).toBe('R$ 1.000,00')
    })

    it('should format numbers correctly', () => {
      expect(formatNumber(8.234, 2)).toBe('8,23')
      expect(formatNumber(1000.5, 1)).toBe('1.000,5')
    })

    it('should format volume correctly', () => {
      expect(formatVolume(1500000)).toBe('1.5M')
      expect(formatVolume(50000)).toBe('50K')
      expect(formatVolume(500)).toBe('500')
    })

    it('should handle null/undefined values in formatters', () => {
      expect(formatCurrency(null)).toBe('-')
      expect(formatNumber(undefined)).toBe('-')
      expect(formatVolume(null)).toBe('-')
    })
  })

  describe('Validation Functions', () => {
    it('should validate valid stock', () => {
      const stock = {
        symbol: 'TEST',
        name: 'Test Stock',
        price: 50,
        volume: 1000000,
        roic: 10
      }

      const result = validateStock(stock)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid stock', () => {
      const stock = {
        symbol: '',
        name: 'Test Stock',
        price: -10,
        volume: -1000
      }

      const result = validateStock(stock)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should validate valid filters', () => {
      const filters = {
        minPrice: 10,
        maxPrice: 100,
        minVolume: 50000,
        minROIC: 5,
        sectors: ['Technology']
      }

      const result = validateFilters(filters)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid filters', () => {
      const filters = {
        minPrice: -10,
        maxPrice: -5,
        minVolume: -1000,
        sectors: 'not an array'
      }

      const result = validateFilters(filters)
      expect(result.isValid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(0)
    })

    it('should detect price range inconsistency', () => {
      const filters = {
        minPrice: 100,
        maxPrice: 50
      }

      const result = validateFilters(filters)
      expect(result.isValid).toBe(false)
      expect(result.errors.some(e => e.includes('Min price cannot be greater than max price'))).toBe(true)
    })
  })

  describe('Mock Data Generation', () => {
    it('should generate mock stock with default values', () => {
      const stock = generateMockStock()
      
      expect(stock).toHaveProperty('symbol')
      expect(stock).toHaveProperty('name')
      expect(stock).toHaveProperty('sector')
      expect(stock).toHaveProperty('price')
      expect(stock).toHaveProperty('volume')
      expect(stock).toHaveProperty('score')
      
      expect(typeof stock.symbol).toBe('string')
      expect(typeof stock.name).toBe('string')
      expect(typeof stock.price).toBe('number')
      expect(stock.price).toBeGreaterThan(0)
    })

    it('should generate mock stock with overrides', () => {
      const overrides = {
        symbol: 'CUSTOM',
        price: 100
      }
      
      const stock = generateMockStock(overrides)
      
      expect(stock.symbol).toBe('CUSTOM')
      expect(stock.price).toBe(100)
    })

    it('should generate multiple mock stocks', () => {
      const stocks = generateMockStocks(5)
      
      expect(stocks).toHaveLength(5)
      stocks.forEach(stock => {
        expect(stock).toHaveProperty('symbol')
        expect(stock).toHaveProperty('score')
      })
    })

    it('should generate filtered mock stocks', () => {
      const filters = {
        minPrice: 50,
        minVolume: 1000000
      }
      
      const stocks = generateMockStocks(10, filters)
      
      stocks.forEach(stock => {
        expect(stock.price).toBeGreaterThanOrEqual(50)
        expect(stock.volume).toBeGreaterThanOrEqual(1000000)
      })
    })
  })

  describe('Portfolio Metrics', () => {
    it('should calculate portfolio metrics correctly', () => {
      const metrics = calculatePortfolioMetrics(mockStocks)
      
      expect(metrics).toHaveProperty('totalValue')
      expect(metrics).toHaveProperty('avgROIC')
      expect(metrics).toHaveProperty('avgScore')
      expect(metrics).toHaveProperty('sectorDistribution')
      expect(metrics).toHaveProperty('riskLevel')
      
      expect(metrics.avgROIC).toBeCloseTo(8.37, 1)
      expect(metrics.avgScore).toBeCloseTo(92, 0)
      expect(Object.keys(metrics.sectorDistribution)).toHaveLength(3)
    })

    it('should handle empty portfolio', () => {
      const metrics = calculatePortfolioMetrics([])
      
      expect(metrics.totalValue).toBe(0)
      expect(metrics.avgROIC).toBe(0)
      expect(metrics.avgScore).toBe(0)
      expect(Object.keys(metrics.sectorDistribution)).toHaveLength(0)
      expect(metrics.riskLevel).toBe('unknown')
    })

    it('should calculate sector distribution correctly', () => {
      const metrics = calculatePortfolioMetrics(mockStocks)
      
      expect(metrics.sectorDistribution['Petróleo e Gás']).toBe(1)
      expect(metrics.sectorDistribution['Mineração']).toBe(1)
      expect(metrics.sectorDistribution['Financeiro']).toBe(1)
    })
  })

  describe('Export Functions', () => {
    it('should generate CSV content correctly', () => {
      // Mock DOM elements for testing
      const mockLink = {
        click: vi.fn(),
        setAttribute: vi.fn(),
        style: {}
      }
      
      const mockURL = {
        createObjectURL: vi.fn().mockReturnValue('blob:url'),
        revokeObjectURL: vi.fn()
      }
      
      global.document = {
        createElement: vi.fn().mockReturnValue(mockLink),
        body: {
          appendChild: vi.fn(),
          removeChild: vi.fn()
        }
      }
      
      global.URL = mockURL
      global.Blob = vi.fn()

      const result = exportToCSV(mockStocks, 'test')
      
      expect(result).toBe(true)
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('should throw error for empty data', () => {
      expect(() => exportToCSV([])).toThrow('No data to export')
      expect(() => exportToCSV(null)).toThrow('No data to export')
    })
  })

  describe('Edge Cases', () => {
    it('should handle stocks with missing optional fields', () => {
      const incompleteStock = {
        symbol: 'TEST',
        name: 'Test',
        price: 50,
        volume: 1000000
        // Missing roic, score, sector
      }

      expect(() => filterByROIC([incompleteStock], 5)).not.toThrow()
      expect(() => filterByScore([incompleteStock], 80)).not.toThrow()
      expect(() => calculateWheelScore(incompleteStock)).not.toThrow()
    })

    it('should handle extreme filter values', () => {
      const filters = {
        minPrice: 0,
        maxPrice: Infinity,
        minVolume: 0,
        minROIC: -100,
        minScore: -50
      }

      expect(() => applyFilters(mockStocks, filters)).not.toThrow()
      const result = applyFilters(mockStocks, filters)
      expect(result).toHaveLength(3)
    })

    it('should handle non-numeric values gracefully', () => {
      const badStock = {
        symbol: 'BAD',
        name: 'Bad Stock',
        price: 'not a number',
        volume: null,
        roic: undefined,
        score: NaN
      }

      expect(() => calculateWheelScore(badStock)).not.toThrow()
      expect(() => rankStocks([badStock], 'score')).not.toThrow()
    })
  })
})