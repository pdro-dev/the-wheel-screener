import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PerformanceMonitor } from '../components/analytics/PerformanceMonitor'

describe('PerformanceMonitor', () => {
  it('shows performance metrics', () => {
    render(<PerformanceMonitor />)
    expect(screen.getByText('Performance em Tempo Real')).toBeTruthy()
    expect(screen.getByText(/CLS/)).toBeTruthy()
  })
})
