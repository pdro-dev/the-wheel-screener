import { describe, it, expect } from 'vitest'
import { calculateWheelScore } from '../screening'

describe('calculateWheelScore weights', () => {
  const baseStock = {
    roic: 10,
    volume: 500000,
    volatility: 0.2,
    debtToEquity: 0.5,
    roe: 12,
    revenueGrowth: 0.1,
    trend: 0.01,
    price: 50,
    supportLevel: 45
  }

  it('applies custom weights', () => {
    const defaultScore = calculateWheelScore(baseStock)
    const fundamentalsOnly = calculateWheelScore(baseStock, {
      roic: 0,
      volume: 0,
      volatility: 0,
      fundamentals: 1,
      technicals: 0
    })
    expect(fundamentalsOnly).toBeCloseTo(76)
    expect(defaultScore).not.toBe(fundamentalsOnly)
  })
})
