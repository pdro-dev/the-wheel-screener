import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { APIMetricsDashboard } from '../components/analytics/APIMetricsDashboard'

describe('APIMetricsDashboard', () => {
  it('renders metrics cards', () => {
    render(<APIMetricsDashboard />)
    expect(screen.getByText('Requests Hoje')).toBeTruthy()
    expect(screen.getByText('Tempo Resposta')).toBeTruthy()
    expect(screen.getByText('Taxa de Erro')).toBeTruthy()
    expect(screen.getByText('Quota Restante')).toBeTruthy()
  })
})
