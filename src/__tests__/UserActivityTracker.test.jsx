import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { UserActivityTracker } from '../components/analytics/UserActivityTracker'

describe('UserActivityTracker', () => {
  it('renders basic activity info', () => {
    render(<UserActivityTracker />)
    expect(screen.getByText('Atividade do Usuário')).toBeTruthy()
    expect(screen.getByText(/Sessões hoje/)).toBeTruthy()
  })
})
