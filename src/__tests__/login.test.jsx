import { describe, it, beforeEach, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { useEffect } from 'react'
import { useOpLabState, __resetOpLabState } from '../hooks/useOpLabAPI'

function TestLogin({ username, password }) {
  const { login, user } = useOpLabState()
  useEffect(() => {
    login(username, password)
  }, [login, username, password])
  return <div data-testid="user">{user?.name || ''}</div>
}

describe('login', () => {
  beforeEach(() => {
    __resetOpLabState()
  })

  it('accepts default admin credentials', async () => {
    render(<TestLogin username="admin" password="admin" />)
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('admin'))
  })

  it('ignores username case and trims spaces', async () => {
    render(<TestLogin username=" Admin " password="admin" />)
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('admin'))
  })
})
