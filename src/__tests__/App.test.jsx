import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'

// Mock all the custom hooks and components
vi.mock('@/hooks/usePerformance', () => ({
  useOptimizedFilters: vi.fn(() => ({
    filters: {
      minPrice: 15,
      maxPrice: 100,
      minVolume: 100000,
      minROIC: 5,
      minScore: 60,
      sectors: [],
      search: '',
      sortBy: 'score',
      sortDirection: 'desc'
    },
    debouncedFilters: {
      minPrice: 15,
      maxPrice: 100,
      minVolume: 100000,
      minROIC: 5,
      minScore: 60,
      sectors: [],
      search: '',
      sortBy: 'score',
      sortDirection: 'desc'
    },
    updateFilter: vi.fn(),
    resetFilters: vi.fn(),
    setFilters: vi.fn()
  })),
  useDebounce: vi.fn((value) => value),
  useResultCache: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    clear: vi.fn(),
    remove: vi.fn()
  }))
}))

vi.mock('@/hooks/useMobile', () => ({
  useIsMobile: vi.fn(() => false),
  useOrientation: vi.fn(() => ({ isLandscape: true }))
}))

vi.mock('@/hooks/useOpLabAPI', () => ({
  useWheelScreening: vi.fn(() => ({
    results: [],
    isScreening: false,
    progress: 0,
    runScreening: vi.fn(),
    exportResults: vi.fn(),
    hasResults: false
  })),
  useOpLabState: vi.fn(() => ({
    isAuthenticated: false,
    isOnline: true,
    token: null,
    lastError: null,
    setToken: vi.fn()
  }))
}))

vi.mock('@/components/OptimizedTable', () => ({
  OptimizedTable: vi.fn(({ data, title }) => (
    <div data-testid="optimized-table">
      <h2>{title}</h2>
      <div>{data.length} items</div>
    </div>
  )),
  FilterableTable: vi.fn(() => <div data-testid="filterable-table" />)
}))

vi.mock('@/components/MobileOptimized', () => ({
  MobileHeader: vi.fn(() => <div data-testid="mobile-header" />),
  MobileMetrics: vi.fn(() => <div data-testid="mobile-metrics" />),
  MobileFilters: vi.fn(() => <div data-testid="mobile-filters" />),
  MobileTable: vi.fn(() => <div data-testid="mobile-table" />),
  MobileActions: vi.fn(() => <div data-testid="mobile-actions" />),
  MobileEmptyState: vi.fn(() => <div data-testid="mobile-empty-state" />)
}))

vi.mock('@/components/LoadingStates', () => ({
  LoadingSpinner: vi.fn(({ size, className }) => (
    <div data-testid="loading-spinner" className={`spinner-${size} ${className}`} />
  )),
  ErrorBoundary: vi.fn(({ children }) => <div data-testid="error-boundary">{children}</div>),
  ConnectionStatus: vi.fn(() => <div data-testid="connection-status" />),
  ProgressIndicator: vi.fn(({ progress, message }) => (
    <div data-testid="progress-indicator">
      <div>{message}</div>
      <div>{progress}%</div>
    </div>
  )),
  useAsyncState: vi.fn(() => ({
    data: null,
    loading: false,
    execute: vi.fn()
  })),
  useRetry: vi.fn(() => ({
    retry: vi.fn(),
    attempts: 0,
    isRetrying: false,
    canRetry: true,
    reset: vi.fn()
  }))
}))

vi.mock('@/components/APIIntegration', () => ({
  TokenConfiguration: vi.fn(({ onTokenSave }) => (
    <div data-testid="token-configuration">
      <button onClick={() => onTokenSave('test-token')}>Save Token</button>
    </div>
  )),
  APIDashboard: vi.fn(() => <div data-testid="api-dashboard" />),
  InlineAPIStatus: vi.fn(() => <div data-testid="inline-api-status" />)
}))

vi.mock('@/utils/screening', () => ({
  generateMockStocks: vi.fn(() => [
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
    }
  ]),
  applyFilters: vi.fn((data) => data),
  exportToCSV: vi.fn(),
  calculatePortfolioMetrics: vi.fn(() => ({
    totalValue: 1000,
    avgROIC: 8.0,
    avgScore: 93.5,
    totalVolume: 24170000,
    sectorDistribution: {
      'Petróleo e Gás': 1,
      'Mineração': 1
    },
    riskLevel: 'medium',
    avgVolatility: 0.25
  }))
}))

vi.mock('@/services/opLabAPI', () => ({
  ScreeningUtils: {
    formatCurrency: vi.fn((value) => `R$ ${value.toFixed(2)}`),
    formatVolume: vi.fn((value) => `${Math.round(value / 1000000)}M`),
    formatNumber: vi.fn((value, decimals) => value.toFixed(decimals))
  }
}))

describe('App Component', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Desktop Rendering', () => {
    it('should render main app structure', () => {
      render(<App />)
      
      expect(screen.getByText('The Wheel Screener')).toBeInTheDocument()
      expect(screen.getByText(/Identifique as melhores oportunidades/)).toBeInTheDocument()
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })

    it('should render header with export button', () => {
      render(<App />)
      
      expect(screen.getByText('Exportar CSV')).toBeInTheDocument()
      expect(screen.getByTestId('inline-api-status')).toBeInTheDocument()
    })

    it('should render connection status', () => {
      render(<App />)
      
      expect(screen.getByTestId('connection-status')).toBeInTheDocument()
    })

    it('should render metrics cards', () => {
      render(<App />)
      
      expect(screen.getByText('Resultados')).toBeInTheDocument()
      expect(screen.getByText('Score Médio')).toBeInTheDocument()
      expect(screen.getByText('ROIC Médio')).toBeInTheDocument()
      expect(screen.getByText('Setores')).toBeInTheDocument()
    })

    it('should render filters section', () => {
      render(<App />)
      
      expect(screen.getByText('Filtros de Screening')).toBeInTheDocument()
      expect(screen.getByLabelText('Buscar')).toBeInTheDocument()
      expect(screen.getByText('Faixa de Preço (R$)')).toBeInTheDocument()
      expect(screen.getByText('Volume Mínimo')).toBeInTheDocument()
      expect(screen.getByText('ROIC Mínimo (%)')).toBeInTheDocument()
      expect(screen.getByText('Score Mínimo')).toBeInTheDocument()
    })

    it('should render action buttons', () => {
      render(<App />)
      
      expect(screen.getByText('Executar Screening')).toBeInTheDocument()
      expect(screen.getByText('Limpar Filtros')).toBeInTheDocument()
    })

    it('should render results table when data available', () => {
      render(<App />)
      
      expect(screen.getByTestId('optimized-table')).toBeInTheDocument()
    })

    it('should render footer', () => {
      render(<App />)
      
      expect(screen.getByText(/Dados simulados para demonstração/)).toBeInTheDocument()
      expect(screen.getByText(/Desenvolvido com ❤️/)).toBeInTheDocument()
    })
  })

  describe('Mobile Rendering', () => {
    beforeEach(() => {
      const { useIsMobile } = require('@/hooks/useMobile')
      useIsMobile.mockReturnValue(true)
    })

    it('should render mobile components when on mobile', () => {
      render(<App />)
      
      expect(screen.getByTestId('mobile-header')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-metrics')).toBeInTheDocument()
      expect(screen.getByTestId('mobile-filters')).toBeInTheDocument()
    })

    it('should render mobile table when data available', () => {
      render(<App />)
      
      expect(screen.getByTestId('mobile-table')).toBeInTheDocument()
    })

    it('should render mobile actions', () => {
      render(<App />)
      
      expect(screen.getByTestId('mobile-actions')).toBeInTheDocument()
    })
  })

  describe('Token Configuration', () => {
    it('should show token configuration when not authenticated', () => {
      const { useOpLabState } = require('@/hooks/useOpLabAPI')
      useOpLabState.mockReturnValue({
        isAuthenticated: false,
        isOnline: true,
        token: null,
        lastError: null,
        setToken: vi.fn()
      })

      render(<App />)
      
      expect(screen.getByTestId('token-configuration')).toBeInTheDocument()
    })

    it('should not show token configuration when authenticated', () => {
      const { useOpLabState } = require('@/hooks/useOpLabAPI')
      useOpLabState.mockReturnValue({
        isAuthenticated: true,
        isOnline: true,
        token: 'test-token',
        lastError: null,
        setToken: vi.fn()
      })

      render(<App />)
      
      expect(screen.queryByTestId('token-configuration')).not.toBeInTheDocument()
    })

    it('should handle token save', async () => {
      const mockSetToken = vi.fn()
      const { useOpLabState } = require('@/hooks/useOpLabAPI')
      useOpLabState.mockReturnValue({
        isAuthenticated: false,
        isOnline: true,
        token: null,
        lastError: null,
        setToken: mockSetToken
      })

      render(<App />)
      
      const saveButton = screen.getByText('Save Token')
      await user.click(saveButton)
      
      expect(mockSetToken).toHaveBeenCalledWith('test-token')
    })
  })

  describe('Filters Interaction', () => {
    it('should handle search input', async () => {
      const { useOptimizedFilters } = require('@/hooks/usePerformance')
      const mockUpdateFilter = vi.fn()
      useOptimizedFilters.mockReturnValue({
        filters: { search: '' },
        debouncedFilters: { search: '' },
        updateFilter: mockUpdateFilter,
        resetFilters: vi.fn(),
        setFilters: vi.fn()
      })

      render(<App />)
      
      const searchInput = screen.getByLabelText('Buscar')
      await user.type(searchInput, 'PETR4')
      
      expect(mockUpdateFilter).toHaveBeenCalledWith('search', 'P')
    })

    it('should handle filter reset', async () => {
      const { useOptimizedFilters } = require('@/hooks/usePerformance')
      const mockResetFilters = vi.fn()
      useOptimizedFilters.mockReturnValue({
        filters: {},
        debouncedFilters: {},
        updateFilter: vi.fn(),
        resetFilters: mockResetFilters,
        setFilters: vi.fn()
      })

      render(<App />)
      
      const resetButton = screen.getByText('Limpar Filtros')
      await user.click(resetButton)
      
      expect(mockResetFilters).toHaveBeenCalled()
    })
  })

  describe('Screening Execution', () => {
    it('should show screening button in normal state', () => {
      render(<App />)
      
      const screeningButton = screen.getByText('Executar Screening')
      expect(screeningButton).toBeInTheDocument()
      expect(screeningButton).not.toBeDisabled()
    })

    it('should show loading state during screening', () => {
      const { useWheelScreening } = require('@/hooks/useOpLabAPI')
      useWheelScreening.mockReturnValue({
        results: [],
        isScreening: true,
        progress: 50,
        runScreening: vi.fn(),
        exportResults: vi.fn(),
        hasResults: false
      })

      render(<App />)
      
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
      expect(screen.getByText('Analisando...')).toBeInTheDocument()
    })

    it('should show progress indicator during screening', () => {
      const { useWheelScreening } = require('@/hooks/useOpLabAPI')
      useWheelScreening.mockReturnValue({
        results: [],
        isScreening: true,
        progress: 75,
        runScreening: vi.fn(),
        exportResults: vi.fn(),
        hasResults: false
      })

      render(<App />)
      
      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })
  })

  describe('Export Functionality', () => {
    it('should handle CSV export when authenticated', async () => {
      const mockExportResults = vi.fn()
      const { useWheelScreening } = require('@/hooks/useOpLabAPI')
      const { useOpLabState } = require('@/hooks/useOpLabAPI')
      
      useWheelScreening.mockReturnValue({
        results: [],
        isScreening: false,
        progress: 0,
        runScreening: vi.fn(),
        exportResults: mockExportResults,
        hasResults: true
      })
      
      useOpLabState.mockReturnValue({
        isAuthenticated: true,
        isOnline: true,
        token: 'test-token',
        lastError: null,
        setToken: vi.fn()
      })

      render(<App />)
      
      const exportButton = screen.getByText('Exportar CSV')
      await user.click(exportButton)
      
      expect(mockExportResults).toHaveBeenCalledWith('csv')
    })

    it('should handle CSV export when not authenticated', async () => {
      const { exportToCSV } = require('@/utils/screening')
      const mockExportToCSV = vi.fn()
      exportToCSV.mockImplementation(mockExportToCSV)

      render(<App />)
      
      const exportButton = screen.getByText('Exportar CSV')
      await user.click(exportButton)
      
      expect(mockExportToCSV).toHaveBeenCalled()
    })

    it('should disable export button when no results', () => {
      const { generateMockStocks } = require('@/utils/screening')
      generateMockStocks.mockReturnValue([])

      render(<App />)
      
      const exportButton = screen.getByText('Exportar CSV')
      expect(exportButton).toBeDisabled()
    })
  })

  describe('Empty States', () => {
    it('should show empty state when no results', () => {
      const { generateMockStocks } = require('@/utils/screening')
      generateMockStocks.mockReturnValue([])

      render(<App />)
      
      expect(screen.getByText('Nenhuma oportunidade encontrada')).toBeInTheDocument()
      expect(screen.getByText(/Ajuste os filtros/)).toBeInTheDocument()
    })

    it('should show mobile empty state on mobile', () => {
      const { useIsMobile } = require('@/hooks/useMobile')
      const { generateMockStocks } = require('@/utils/screening')
      
      useIsMobile.mockReturnValue(true)
      generateMockStocks.mockReturnValue([])

      render(<App />)
      
      expect(screen.getByTestId('mobile-empty-state')).toBeInTheDocument()
    })
  })

  describe('API Integration Status', () => {
    it('should show authenticated status when API connected', () => {
      const { useOpLabState } = require('@/hooks/useOpLabAPI')
      useOpLabState.mockReturnValue({
        isAuthenticated: true,
        isOnline: true,
        token: 'test-token',
        lastError: null,
        setToken: vi.fn()
      })

      render(<App />)
      
      expect(screen.getByText(/Dados em tempo real via API OpLab/)).toBeInTheDocument()
    })

    it('should show simulation status when not authenticated', () => {
      render(<App />)
      
      expect(screen.getByText(/Dados simulados para demonstração/)).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should wrap content in error boundary', () => {
      render(<App />)
      
      expect(screen.getByTestId('error-boundary')).toBeInTheDocument()
    })

    it('should handle API errors gracefully', () => {
      const { useOpLabState } = require('@/hooks/useOpLabAPI')
      useOpLabState.mockReturnValue({
        isAuthenticated: false,
        isOnline: true,
        token: null,
        lastError: 'API Error occurred',
        setToken: vi.fn()
      })

      // Should not crash when there's an API error
      expect(() => render(<App />)).not.toThrow()
    })
  })

  describe('Performance Optimizations', () => {
    it('should use optimized filters hook', () => {
      const { useOptimizedFilters } = require('@/hooks/usePerformance')
      
      render(<App />)
      
      expect(useOptimizedFilters).toHaveBeenCalledWith(
        expect.objectContaining({
          minPrice: 15,
          maxPrice: 100,
          minVolume: 100000,
          minROIC: 5,
          minScore: 60
        }),
        300
      )
    })

    it('should use result cache for screening', () => {
      const { useResultCache } = require('@/hooks/usePerformance')
      
      render(<App />)
      
      expect(useResultCache).toHaveBeenCalledWith('screening-results', 120000)
    })

    it('should use debounced filters', () => {
      const { useDebounce } = require('@/hooks/usePerformance')
      
      render(<App />)
      
      // useDebounce is called in the useOptimizedFilters mock
      expect(useDebounce).toHaveBeenCalled()
    })
  })
})