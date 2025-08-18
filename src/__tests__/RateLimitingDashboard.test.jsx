import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { RateLimitingDashboard } from '../components/analytics/RateLimitingDashboard'

describe('RateLimitingDashboard', () => {
  it('renders gauge with rate info', () => {
    render(<RateLimitingDashboard />)
    expect(screen.getByText('Rate Limiting')).toBeTruthy()
    expect(screen.getByText(/reqs/)).toBeTruthy()
  })
})
