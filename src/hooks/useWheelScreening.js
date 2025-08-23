import { useState, useCallback, useRef } from 'react'
import { useOpLabService } from './useOpLabService'

// Hook for Wheel Screening functionality
export function useWheelScreening() {
  const [results, setResults] = useState([])
  const [isScreening, setIsScreening] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState(null)
  
  const opLabService = useOpLabService()
  const abortControllerRef = useRef()

  const runScreening = useCallback(async (filters = {}) => {
    // Cancel previous screening if running
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsScreening(true)
    setProgress(0)
    setError(null)

    try {
      // Call the screening endpoint directly
      setProgress(50)
      const response = await fetch('/api/screening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
        signal: abortControllerRef.current.signal
      })
      
      if (abortControllerRef.current.signal.aborted) return []

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setProgress(100)
      
      const formattedResults = data.results.map(result => ({
        ...result,
        timestamp: new Date().toISOString(),
        source: 'api'
      }))

      setResults(formattedResults)
      return formattedResults

    } catch (err) {
      if (err.name === 'AbortError') {
        return []
      }

      console.error('Screening failed:', err)
      setError(err.message)
      
      // Fallback to mock data
      const mockResults = generateMockScreeningResults(filters)
      setResults(mockResults)
      return mockResults

    } finally {
      setIsScreening(false)
      setProgress(0)
    }
  }, [])

  const exportResults = useCallback((format = 'csv') => {
    if (results.length === 0) {
      throw new Error('Nenhum resultado para exportar')
    }

    if (format === 'csv') {
      const headers = ['Symbol', 'Name', 'Score', 'Price', 'Volume', 'Sector', 'Recommendation']
      const csvContent = [
        headers.join(','),
        ...results.map(result => [
          result.symbol,
          `"${result.name}"`,
          result.score,
          result.price,
          result.volume,
          `"${result.sector}"`,
          result.recommendation
        ].join(','))
      ].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `wheel-screening-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      URL.revokeObjectURL(url)
    }
  }, [results])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return {
    results,
    isScreening,
    progress,
    error,
    runScreening,
    exportResults,
    clearResults
  }
}

// Generate mock screening results for fallback
function generateMockScreeningResults(filters = {}) {
  const mockStocks = [
    { symbol: 'ITUB4', name: 'Itaú Unibanco', sector: 'Financial Services', price: 37.76 },
    { symbol: 'VALE3', name: 'Vale', sector: 'Basic Materials', price: 65.42 },
    { symbol: 'PETR4', name: 'Petrobras', sector: 'Energy', price: 28.91 },
    { symbol: 'MGLU3', name: 'Magazine Luiza', sector: 'Technology', price: 45.20 },
    { symbol: 'BBDC4', name: 'Bradesco', sector: 'Financial Services', price: 22.15 },
    { symbol: 'ABEV3', name: 'Ambev', sector: 'Consumer Defensive', price: 12.85 },
    { symbol: 'WEGE3', name: 'WEG', sector: 'Industrials', price: 89.30 },
    { symbol: 'RENT3', name: 'Localiza', sector: 'Consumer Cyclical', price: 67.45 }
  ]

  return mockStocks.map(stock => {
    // Calculate mock wheel score (0-100)
    const baseScore = Math.random() * 40 + 40 // 40-80 base
    const priceBonus = stock.price > 50 ? 10 : 5
    const sectorBonus = stock.sector === 'Financial Services' ? 15 : 10
    const score = Math.min(100, Math.round(baseScore + priceBonus + sectorBonus))

    // Determine recommendation based on score
    let recommendation = 'HOLD'
    if (score >= 80) recommendation = 'BUY'
    else if (score <= 50) recommendation = 'SELL'

    return {
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      price: stock.price,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      score,
      recommendation,
      roic: Math.random() * 20 + 5,
      volatility: Math.random() * 0.3 + 0.1,
      liquidity: Math.random() * 100 + 50,
      timestamp: new Date().toISOString(),
      source: 'mock'
    }
  }).filter(stock => {
    // Apply filters
    if (filters.minPrice && stock.price < filters.minPrice) return false
    if (filters.maxPrice && stock.price > filters.maxPrice) return false
    if (filters.minScore && stock.score < filters.minScore) return false
    if (filters.sectors && filters.sectors.length > 0 && !filters.sectors.includes(stock.sector)) return false
    return true
  }).sort((a, b) => b.score - a.score) // Sort by score descending
}

export default useWheelScreening

