import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from '@testing-library/react'
import {
  SkeletonCard,
  SkeletonMetrics,
  SkeletonTable,
  LoadingSpinner,
  LoadingOverlay,
  InlineLoading,
  ErrorState,
  NetworkError,
  APIError,
  ErrorBoundary,
  ConnectionStatus,
  ProgressIndicator,
  useAsyncState,
  useRetry,
  useOnlineStatus
} from '../LoadingStates'

// Mock React component for testing ErrorBoundary
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('LoadingStates Components', () => {
  describe('Skeleton Components', () => {
    it('should render SkeletonCard with animation', () => {
      render(<SkeletonCard />)
      
      const skeleton = screen.getByRole('generic')
      expect(skeleton).toHaveClass('animate-pulse')
    })

    it('should render SkeletonMetrics with 4 cards', () => {
      render(<SkeletonMetrics />)
      
      const skeletonCards = screen.getAllByRole('generic')
      // Should have grid container + 4 cards
      expect(skeletonCards.length).toBeGreaterThanOrEqual(4)
    })

    it('should render SkeletonTable with custom dimensions', () => {
      render(<SkeletonTable rows={3} cols={4} />)
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })

    it('should render SkeletonTable with default dimensions', () => {
      render(<SkeletonTable />)
      
      const table = screen.getByRole('table')
      expect(table).toBeInTheDocument()
    })
  })

  describe('Loading Components', () => {
    it('should render LoadingSpinner with correct size', () => {
      render(<LoadingSpinner size="lg" />)
      
      const spinner = document.querySelector('.h-12.w-12')
      expect(spinner).toBeInTheDocument()
    })

    it('should render LoadingSpinner with default size', () => {
      render(<LoadingSpinner />)
      
      const spinner = document.querySelector('.h-8.w-8')
      expect(spinner).toBeInTheDocument()
    })

    it('should render LoadingOverlay when visible', () => {
      render(<LoadingOverlay isVisible={true} message="Loading..." />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(document.querySelector('.fixed.inset-0')).toBeInTheDocument()
    })

    it('should not render LoadingOverlay when not visible', () => {
      render(<LoadingOverlay isVisible={false} />)
      
      expect(document.querySelector('.fixed.inset-0')).not.toBeInTheDocument()
    })

    it('should render InlineLoading with custom message', () => {
      render(<InlineLoading message="Processing..." />)
      
      expect(screen.getByText('Processing...')).toBeInTheDocument()
    })
  })

  describe('Error Components', () => {
    it('should render ErrorState with custom content', () => {
      const mockRetry = vi.fn()
      
      render(
        <ErrorState
          title="Custom Error"
          message="Something went wrong"
          onRetry={mockRetry}
          retryLabel="Try Again"
        />
      )
      
      expect(screen.getByText('Custom Error')).toBeInTheDocument()
      expect(screen.getByText('Something went wrong')).toBeInTheDocument()
      expect(screen.getByText('Try Again')).toBeInTheDocument()
    })

    it('should call onRetry when retry button is clicked', async () => {
      const mockRetry = vi.fn()
      
      render(<ErrorState onRetry={mockRetry} />)
      
      const retryButton = screen.getByRole('button')
      fireEvent.click(retryButton)
      
      expect(mockRetry).toHaveBeenCalledOnce()
    })

    it('should not render retry button when onRetry is not provided', () => {
      render(<ErrorState />)
      
      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    it('should render NetworkError with offline icon', () => {
      render(<NetworkError />)
      
      expect(screen.getByText('Sem conexão')).toBeInTheDocument()
      expect(screen.getByText(/Verifique sua conexão/)).toBeInTheDocument()
    })

    it('should render APIError with appropriate message for 401', () => {
      const error = { status: 401 }
      render(<APIError error={error} />)
      
      expect(screen.getByText(/Token inválido/)).toBeInTheDocument()
    })

    it('should render APIError with appropriate message for 429', () => {
      const error = { status: 429 }
      render(<APIError error={error} />)
      
      expect(screen.getByText(/Muitas requisições/)).toBeInTheDocument()
    })

    it('should render APIError with appropriate message for 500', () => {
      const error = { status: 500 }
      render(<APIError error={error} />)
      
      expect(screen.getByText(/Erro interno do servidor/)).toBeInTheDocument()
    })

    it('should render APIError with custom error message', () => {
      const error = { message: 'Custom API error' }
      render(<APIError error={error} />)
      
      expect(screen.getByText(/Custom API error/)).toBeInTheDocument()
    })
  })

  describe('ErrorBoundary', () => {
    beforeEach(() => {
      // Suppress console errors for these tests
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      console.error.mockRestore()
    })

    it('should render children when no error', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={false} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('No error')).toBeInTheDocument()
    })

    it('should render error state when error occurs', () => {
      render(
        <ErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Erro inesperado')).toBeInTheDocument()
      expect(screen.getByText(/Algo deu errado na aplicação/)).toBeInTheDocument()
    })

    it('should render custom fallback when provided', () => {
      const customFallback = <div>Custom Error Fallback</div>
      
      render(
        <ErrorBoundary fallback={customFallback}>
          <ThrowError shouldThrow={true} />
        </ErrorBoundary>
      )
      
      expect(screen.getByText('Custom Error Fallback')).toBeInTheDocument()
    })
  })

  describe('ConnectionStatus', () => {
    beforeEach(() => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })
    })

    it('should not render when online and never was offline', () => {
      const { container } = render(<ConnectionStatus />)
      expect(container.firstChild).toBeNull()
    })
  })

  describe('ProgressIndicator', () => {
    it('should render with progress value', () => {
      render(<ProgressIndicator progress={50} />)
      
      expect(screen.getByText('50% concluído')).toBeInTheDocument()
    })

    it('should render with custom message', () => {
      render(<ProgressIndicator progress={75} message="Custom process..." />)
      
      expect(screen.getByText('Custom process...')).toBeInTheDocument()
      expect(screen.getByText('75% concluído')).toBeInTheDocument()
    })

    it('should render current stage when stages provided', () => {
      const stages = ['Stage 1', 'Stage 2', 'Stage 3']
      
      render(
        <ProgressIndicator
          progress={50}
          stages={stages}
          currentStage={1}
        />
      )
      
      expect(screen.getByText('Stage 2')).toBeInTheDocument()
    })

    it('should handle out-of-bounds stage index', () => {
      const stages = ['Stage 1', 'Stage 2']
      
      render(
        <ProgressIndicator
          progress={50}
          stages={stages}
          currentStage={5}
        />
      )
      
      expect(screen.getByText('Processando...')).toBeInTheDocument()
    })
  })
})

describe('LoadingStates Hooks', () => {
  describe('useAsyncState', () => {
    it('should handle async function execution', async () => {
      const mockAsyncFn = vi.fn().mockResolvedValue('success')
      
      let hookResult
      function TestComponent() {
        hookResult = useAsyncState(mockAsyncFn, [])
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      expect(hookResult.data).toBeNull()
      expect(hookResult.loading).toBe(false)
      expect(hookResult.error).toBeNull()
      
      await act(async () => {
        await hookResult.execute()
      })
      
      expect(mockAsyncFn).toHaveBeenCalledOnce()
      expect(hookResult.data).toBe('success')
      expect(hookResult.loading).toBe(false)
      expect(hookResult.error).toBeNull()
    })

    it('should handle async function errors', async () => {
      const mockError = new Error('Test error')
      const mockAsyncFn = vi.fn().mockRejectedValue(mockError)
      
      let hookResult
      function TestComponent() {
        hookResult = useAsyncState(mockAsyncFn, [])
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      await act(async () => {
        try {
          await hookResult.execute()
        } catch (error) {
          // Expected to throw
        }
      })
      
      expect(hookResult.data).toBeNull()
      expect(hookResult.loading).toBe(false)
      expect(hookResult.error).toBe(mockError)
    })

    it('should set loading state during execution', async () => {
      let resolvePromise
      const mockAsyncFn = vi.fn().mockImplementation(() => 
        new Promise(resolve => {
          resolvePromise = resolve
        })
      )
      
      let hookResult
      function TestComponent() {
        hookResult = useAsyncState(mockAsyncFn, [])
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      const executePromise = act(async () => {
        return hookResult.execute()
      })
      
      // Should be loading
      expect(hookResult.loading).toBe(true)
      
      // Resolve the promise
      resolvePromise('success')
      await executePromise
      
      expect(hookResult.loading).toBe(false)
      expect(hookResult.data).toBe('success')
    })
  })

  describe('useRetry', () => {
    it('should retry failed function calls', async () => {
      let hookResult
      function TestComponent() {
        hookResult = useRetry(3, 100)
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      const mockFn = vi.fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockRejectedValueOnce(new Error('Second failure'))
        .mockResolvedValueOnce('success')
      
      let result
      await act(async () => {
        result = await hookResult.retry(mockFn)
      })
      
      expect(mockFn).toHaveBeenCalledTimes(3)
      expect(result).toBe('success')
      expect(hookResult.attempts).toBe(0) // Reset after success
    })

    it('should stop retrying after max attempts', async () => {
      let hookResult
      function TestComponent() {
        hookResult = useRetry(2, 100)
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      const mockFn = vi.fn().mockRejectedValue(new Error('Always fails'))
      
      await act(async () => {
        try {
          await hookResult.retry(mockFn)
        } catch (error) {
          // Expected to fail
        }
      })
      
      expect(mockFn).toHaveBeenCalledTimes(1)
      expect(hookResult.attempts).toBe(2)
    })

    it('should reset attempts', async () => {
      let hookResult
      function TestComponent() {
        hookResult = useRetry(3, 100)
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      // Simulate some failed attempts
      hookResult.attempts = 2
      
      act(() => {
        hookResult.reset()
      })
      
      expect(hookResult.attempts).toBe(0)
      expect(hookResult.isRetrying).toBe(false)
    })
  })

  describe('useOnlineStatus', () => {
    beforeEach(() => {
      // Reset navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      })
    })

    it('should return current online status', () => {
      let hookResult
      function TestComponent() {
        hookResult = useOnlineStatus()
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      expect(hookResult.isOnline).toBe(true)
      expect(hookResult.wasOffline).toBe(false)
    })

    it('should update when going offline', () => {
      let hookResult
      function TestComponent() {
        hookResult = useOnlineStatus()
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: false })
        window.dispatchEvent(new Event('offline'))
      })
      
      expect(hookResult.isOnline).toBe(false)
      expect(hookResult.wasOffline).toBe(true)
    })

    it('should update when coming back online', () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', { value: false })
      
      let hookResult
      function TestComponent() {
        hookResult = useOnlineStatus()
        return <div>Test</div>
      }
      
      render(<TestComponent />)
      
      // Go offline first
      act(() => {
        window.dispatchEvent(new Event('offline'))
      })
      
      expect(hookResult.wasOffline).toBe(true)
      
      // Come back online
      act(() => {
        Object.defineProperty(navigator, 'onLine', { value: true })
        window.dispatchEvent(new Event('online'))
      })
      
      expect(hookResult.isOnline).toBe(true)
      expect(hookResult.wasOffline).toBe(false)
    })
  })
})