import { describe, it, beforeEach, expect } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { useEffect } from 'react'
import { useOpLabState, __resetOpLabState } from '../hooks/useOpLabAPI'

function TestLogin({ username, password }) {
  const { login, user } = useOpLabState()
  useEffect(() => {
    login(username, password)
  }, [login, username, password])
  return (
    <>
      <div data-testid="user">{user?.username || ''}</div>
      <div data-testid="role">{user?.role || ''}</div>
    </>
  )
}

describe('login', () => {
  beforeEach(() => {
    __resetOpLabState()
  })

  it('accepts default admin credentials', async () => {
    render(<TestLogin username="admin" password="admin" />)
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('admin')
      expect(screen.getByTestId('role').textContent).toBe('admin')
    })
  })

  it('ignores username case and trims spaces', async () => {
    render(<TestLogin username=" Admin " password="admin" />)
    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('admin')
      expect(screen.getByTestId('role').textContent).toBe('admin')
    })
  })

  it('renders admin UI elements and clears on logout', async () => {
    function AdminComponent() {
      const { login, logout, user } = useOpLabState()
      useEffect(() => {
        login('admin', 'admin')
      }, [login])
      return (
        <div>
          {user?.role === 'admin' && <span data-testid="admin-ui">Admin Panel</span>}
          <button data-testid="logout" onClick={logout}>
            Logout
          </button>
        </div>
      )
    }

    render(<AdminComponent />)

    await waitFor(() => expect(screen.getByTestId('admin-ui')).toBeInTheDocument())

    fireEvent.click(screen.getByTestId('logout'))

    await waitFor(() => expect(screen.queryByTestId('admin-ui')).toBeNull())
  })
})
