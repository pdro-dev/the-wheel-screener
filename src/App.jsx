import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { 
  Search, 
  Download, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Settings, 
  AlertCircle,
  Menu,
  RefreshCw,
  Filter,
  Activity,
  PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Import custom hooks
import { useOptimizedFilters, useDebounce, useResultCache } from '@/hooks/usePerformance'
import { useIsMobile, useOrientation } from '@/hooks/useMobile'
import { useWheelScreening, useOpLabState } from '@/hooks/useOpLabAPI'

// Import components
import { OptimizedTable, FilterableTable } from '@/components/OptimizedTable'
import { 
  MobileHeader, 
  MobileMetrics, 
  MobileFilters, 
  MobileTable, 
  MobileActions,
  MobileEmptyState
} from '@/components/MobileOptimized'
import { 
  LoadingSpinner, 
  ErrorBoundary, 
  ConnectionStatus,
  ProgressIndicator,
  useAsyncState,
  useRetry
} from '@/components/LoadingStates'
import { 
  TokenConfiguration, 
  APIDashboard, 
  InlineAPIStatus 
} from '@/components/APIIntegration'

// Import Analytics Components
import { APIMetricsDashboard } from '@/components/analytics/APIMetricsDashboard'
import { PerformanceMonitor } from '@/components/analytics/PerformanceMonitor'
import { RateLimitingDashboard } from '@/components/analytics/RateLimitingDashboard'
import { UserActivityTracker } from '@/components/analytics/UserActivityTracker'

// Import utilities
import { generateMockStocks, applyFilters, exportToCSV, calculatePortfolioMetrics } from '@/utils/screening'
import { ScreeningUtils } from '@/services/opLabAPI'

import './App.css'

// Form validation helpers
const useFormValidation = () => {
  const sanitizeInput = useCallback((value, type = 'text') => {
    if (typeof value !== 'string') return value
    
    switch (type) {
      case 'number':
        return value.replace(/[^\d.-]/g, '')
      case 'search':
        return value.replace(/[<>'"]/g, '').trim()
      default:
        return value.replace(/[<>]/g, '').trim()
    }
  }, [])

  const validationRules = {
    minPrice: (value) => value >= 0 && value <= 1000,
    maxPrice: (value) => value >= 0 && value <= 1000,
    minVolume: (value) => value >= 0,
    minROIC: (value) => value >= 0 && value <= 100,
    minScore: (value) => value >= 0 && value <= 100
  }

  const validateFilter = useCallback((key, value) => {
    const rule = validationRules[key]
    return rule ? rule(value) : true
  }, [])

  return { sanitizeInput, validateFilter }
}

function App() {
  // Mobile detection
  const isMobile = useIsMobile()
  const { isLandscape } = useOrientation()

  // Form validation
  const { sanitizeInput, validateFilter } = useFormValidation()

  // Token and API state
  const { 
    isAuthenticated, 
    isOnline, 
    token,
    lastError,
    setToken 
  } = useOpLabState()

  // Filter state with optimization
  const {
    filters,
    debouncedFilters,
    updateFilter,
    resetFilters,
    setFilters
  } = useOptimizedFilters({
    minPrice: 15,
    maxPrice: 100,
    minVolume: 100000,
    minROIC: 5,
    minScore: 60,
    sectors: [],
    search: '',
    sortBy: 'score',
    sortDirection: 'desc'
  }, 300)

  // App state
  const [showTokenConfig, setShowTokenConfig] = useState(!token && !isAuthenticated)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [selectedStocks, setSelectedStocks] = useState([])
  const [viewMode, setViewMode] = useState(isMobile ? 'mobile' : 'desktop')
  const [activeTab, setActiveTab] = useState('screening')

  // Wheel screening hook
  const {
    results: apiResults,
    isScreening,
    progress,
    runScreening,
    exportResults,
    hasResults
  } = useWheelScreening()

  // Cache for results
  const resultCache = useResultCache('screening-results', 2 * 60 * 1000) // 2 minutes

  // Retry functionality
  const { retry, attempts, isRetrying, canRetry, reset: resetRetry } = useRetry(3, 2000)

  // Mock data fallback
  const mockData = useMemo(() => {
    return generateMockStocks(50, {
      minPrice: 10,
      maxPrice: 150,
      minVolume: 50000
    })
  }, [])

  // Current results (API or mock)
  const currentResults = useMemo(() => {
    if (hasResults && apiResults.length > 0) {
      return apiResults
    }
    return mockData
  }, [apiResults, hasResults, mockData])

  // Filtered and sorted results
  const processedResults = useMemo(() => {
    const filtered = applyFilters(currentResults, debouncedFilters)
    
    if (debouncedFilters.sortBy) {
      return filtered.sort((a, b) => {
        const aVal = a[debouncedFilters.sortBy] || 0
        const bVal = b[debouncedFilters.sortBy] || 0
        
        if (debouncedFilters.sortDirection === 'asc') {
          return aVal - bVal
        }
        return bVal - aVal
      })
    }
    
    return filtered
  }, [currentResults, debouncedFilters])

  // Portfolio metrics
  const portfolioMetrics = useMemo(() => {
    return calculatePortfolioMetrics(processedResults)
  }, [processedResults])

  // Async screening function
  const { data: screeningData, loading: screeningLoading, execute: executeScreening } = useAsyncState(
    async (filters) => {
      // Try API first if authenticated
      if (isAuthenticated && isOnline) {
        const cacheKey = JSON.stringify(filters)
        const cached = resultCache.get(cacheKey)
        if (cached) return cached

        try {
          const results = await runScreening(filters)
          resultCache.set(cacheKey, results)
          return results
        } catch (error) {
          console.warn('API screening failed, using mock data:', error)
          return mockData
        }
      }
      
      // Use mock data
      return applyFilters(mockData, filters)
    },
    [isAuthenticated, isOnline, runScreening, mockData, resultCache]
  )

  // Handle screening
  const handleScreening = useCallback(async () => {
    try {
      await executeScreening(debouncedFilters)
      resetRetry()
    } catch (error) {
      console.error('Screening failed:', error)
      if (canRetry) {
        try {
          await retry(() => executeScreening(debouncedFilters))
        } catch (retryError) {
          console.error('Retry failed:', retryError)
        }
      }
    }
  }, [executeScreening, debouncedFilters, retry, canRetry, resetRetry])

  // Handle filter updates with validation
  const handleFilterUpdate = useCallback((key, value) => {
    const sanitizedValue = sanitizeInput(value, typeof value === 'number' ? 'number' : 'text')
    
    if (validateFilter(key, sanitizedValue)) {
      updateFilter(key, sanitizedValue)
    }
  }, [updateFilter, sanitizeInput, validateFilter])

  // Handle export
  const handleExport = useCallback(() => {
    try {
      if (hasResults && isAuthenticated) {
        exportResults('csv')
      } else {
        exportToCSV(processedResults, 'wheel-screening-mock')
      }
    } catch (error) {
      console.error('Export failed:', error)
    }
  }, [hasResults, isAuthenticated, exportResults, processedResults])

  // Handle stock selection
  const handleStockSelect = useCallback((stock, isSelected) => {
    if (isSelected) {
      setSelectedStocks(prev => [...prev, stock.symbol])
    } else {
      setSelectedStocks(prev => prev.filter(symbol => symbol !== stock.symbol))
    }
  }, [])

  // Token configuration
  const handleTokenSave = useCallback((newToken) => {
    setToken(newToken)
    setShowTokenConfig(false)
    // Trigger a new screening with the configured token
    setTimeout(() => handleScreening(), 1000)
  }, [setToken, handleScreening])

  // Auto-screening when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isAuthenticated && isOnline) {
        handleScreening()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [debouncedFilters, isAuthenticated, isOnline, handleScreening])

  // Metrics for mobile display
  const mobileMetrics = useMemo(() => [
    {
      label: 'Resultados',
      value: processedResults.length,
      icon: TrendingUp,
      formatter: (val) => val.toString()
    },
    {
      label: 'Score Médio',
      value: portfolioMetrics.avgScore,
      icon: BarChart3,
      formatter: (val) => val.toFixed(0)
    },
    {
      label: 'ROIC Médio',
      value: portfolioMetrics.avgROIC,
      icon: DollarSign,
      formatter: (val) => `${val.toFixed(1)}%`
    },
    {
      label: 'Setores',
      value: Object.keys(portfolioMetrics.sectorDistribution).length,
      icon: Settings,
      formatter: (val) => val.toString()
    }
  ], [processedResults.length, portfolioMetrics])

  // Mobile actions
  const mobileActions = useMemo(() => [
    {
      icon: Download,
      label: 'Exportar',
      onClick: handleExport,
      disabled: processedResults.length === 0
    },
    {
      icon: RefreshCw,
      label: 'Atualizar',
      onClick: handleScreening,
      disabled: screeningLoading || isScreening
    }
  ], [handleExport, handleScreening, processedResults.length, screeningLoading, isScreening])

  // Table columns for desktop
  const tableColumns = useMemo(() => [
    { key: 'symbol', title: 'Símbolo', sortable: true },
    { key: 'name', title: 'Nome', sortable: true },
    { 
      key: 'price', 
      title: 'Preço', 
      sortable: true,
      render: (value) => ScreeningUtils.formatCurrency(value)
    },
    { 
      key: 'volume', 
      title: 'Volume', 
      sortable: true,
      render: (value) => ScreeningUtils.formatVolume(value)
    },
    { 
      key: 'roic', 
      title: 'ROIC', 
      sortable: true,
      render: (value) => `${ScreeningUtils.formatNumber(value, 1)}%`
    },
    { 
      key: 'score', 
      title: 'Score', 
      sortable: true,
      render: (value) => (
        <Badge variant={value >= 80 ? 'default' : value >= 60 ? 'secondary' : 'outline'}>
          {ScreeningUtils.formatNumber(value, 0)}
        </Badge>
      )
    },
    { key: 'sector', title: 'Setor', sortable: true }
  ], [])

  // Render mobile version
  if (isMobile) {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <MobileHeader
            title="The Wheel Screener"
            subtitle={isAuthenticated ? 'API Conectada' : 'Dados Simulados'}
            actions={[
              {
                icon: Filter,
                onClick: () => setShowMobileFilters(true),
                iconOnly: true
              }
            ]}
          />

          <ConnectionStatus compact />
          
          {showTokenConfig && (
            <div className="p-4">
              <TokenConfiguration onTokenSave={handleTokenSave} />
            </div>
          )}

          <MobileMetrics metrics={mobileMetrics} />

          <MobileFilters
            filters={filters}
            onFilterChange={setFilters}
            onReset={resetFilters}
            isOpen={showMobileFilters}
            onOpenChange={setShowMobileFilters}
          />

          {(screeningLoading || isScreening) && (
            <div className="p-4">
              <ProgressIndicator
                progress={progress}
                message="Analisando oportunidades..."
                stages={[
                  'Buscando instrumentos...',
                  'Obtendo cotações...',
                  'Analisando fundamentos...',
                  'Calculando scores...'
                ]}
                currentStage={Math.floor(progress / 25)}
              />
            </div>
          )}

          {processedResults.length > 0 ? (
            <MobileTable
              data={processedResults}
              onItemSelect={handleStockSelect}
              emptyMessage="Nenhuma oportunidade encontrada"
            />
          ) : !screeningLoading && !isScreening && (
            <MobileEmptyState
              title="Nenhum resultado"
              message="Ajuste os filtros e tente novamente"
              action={{
                label: 'Limpar Filtros',
                onClick: resetFilters,
                icon: RefreshCw
              }}
            />
          )}

          <MobileActions 
            actions={mobileActions}
            isVisible={processedResults.length > 0}
          />
        </div>
      </ErrorBoundary>
    )
  }

  // Render desktop version
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Navigation */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">The Wheel Screener</h1>
              <p className="text-muted-foreground">
                Identifique as melhores oportunidades para a estratégia "The Wheel"
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <InlineAPIStatus />
              <Button 
                onClick={handleExport}
                disabled={processedResults.length === 0}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="screening" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                Screening
              </TabsTrigger>
              <TabsTrigger value="api-metrics" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                API Metrics
              </TabsTrigger>
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="rate-limiting" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Rate Limiting
              </TabsTrigger>
              <TabsTrigger value="user-activity" className="flex items-center gap-2">
                <PieChart className="h-4 w-4" />
                User Activity
              </TabsTrigger>
            </TabsList>

            {/* Screening Tab */}
            <TabsContent value="screening" className="space-y-6">
              <ConnectionStatus />

          {/* Token Configuration */}
          {showTokenConfig && (
            <TokenConfiguration onTokenSave={handleTokenSave} />
          )}

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Resultados</p>
                    <p className="text-2xl font-bold">{processedResults.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Score Médio</p>
                    <p className="text-2xl font-bold">{portfolioMetrics.avgScore.toFixed(0)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">ROIC Médio</p>
                    <p className="text-2xl font-bold">{portfolioMetrics.avgROIC.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Settings className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Setores</p>
                    <p className="text-2xl font-bold">
                      {Object.keys(portfolioMetrics.sectorDistribution).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Filtros de Screening
              </CardTitle>
              <CardDescription>
                Configure os critérios para identificar oportunidades da estratégia "The Wheel"
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Search */}
                <div>
                  <Label htmlFor="search">Buscar</Label>
                  <Input
                    id="search"
                    value={filters.search || ''}
                    onChange={(e) => handleFilterUpdate('search', e.target.value)}
                    placeholder="Símbolo, nome ou setor..."
                  />
                </div>

                {/* Price Range */}
                <div className="md:col-span-2">
                  <Label>Faixa de Preço (R$)</Label>
                  <div className="space-y-3 mt-2">
                    <Slider
                      value={[filters.minPrice || 15, filters.maxPrice || 100]}
                      onValueChange={([min, max]) => {
                        handleFilterUpdate('minPrice', min)
                        handleFilterUpdate('maxPrice', max)
                      }}
                      min={1}
                      max={200}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>R$ {filters.minPrice || 15}</span>
                      <span>R$ {filters.maxPrice || 100}</span>
                    </div>
                  </div>
                </div>

                {/* Volume */}
                <div>
                  <Label>Volume Mínimo</Label>
                  <div className="space-y-2 mt-2">
                    <Slider
                      value={[filters.minVolume || 100000]}
                      onValueChange={([value]) => handleFilterUpdate('minVolume', value)}
                      min={50000}
                      max={10000000}
                      step={50000}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      {ScreeningUtils.formatVolume(filters.minVolume || 100000)}
                    </p>
                  </div>
                </div>

                {/* ROIC */}
                <div>
                  <Label>ROIC Mínimo (%)</Label>
                  <div className="space-y-2 mt-2">
                    <Slider
                      value={[filters.minROIC || 5]}
                      onValueChange={([value]) => handleFilterUpdate('minROIC', value)}
                      min={0}
                      max={30}
                      step={0.5}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      {(filters.minROIC || 5).toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Score */}
                <div>
                  <Label>Score Mínimo</Label>
                  <div className="space-y-2 mt-2">
                    <Slider
                      value={[filters.minScore || 60]}
                      onValueChange={([value]) => handleFilterUpdate('minScore', value)}
                      min={0}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                    <p className="text-sm text-muted-foreground">
                      {filters.minScore || 60}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button 
                  onClick={handleScreening}
                  disabled={screeningLoading || isScreening}
                >
                  {screeningLoading || isScreening ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Executar Screening
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                  Limpar Filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Indicator */}
          {(screeningLoading || isScreening) && (
            <ProgressIndicator
              progress={progress}
              message="Analisando oportunidades..."
              stages={[
                'Buscando instrumentos...',
                'Obtendo cotações...',
                'Analisando fundamentos...',
                'Calculando scores...'
              ]}
              currentStage={Math.floor(progress / 25)}
            />
          )}

          {/* Results Table */}
          {processedResults.length > 0 ? (
            <OptimizedTable
              data={processedResults}
              columns={tableColumns}
              title="Resultados do Screening"
              onRowSelect={handleStockSelect}
              selectedRows={selectedStocks}
              exportable={true}
              virtualScrolling={processedResults.length > 100}
              emptyMessage="Nenhuma oportunidade encontrada"
            />
          ) : !screeningLoading && !isScreening && (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Nenhuma oportunidade encontrada</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Ajuste os filtros e execute o screening novamente
                </p>
                <Button onClick={resetFilters} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </CardContent>
            </Card>
          )}
            </TabsContent>

            {/* API Metrics Tab */}
            <TabsContent value="api-metrics">
              <APIMetricsDashboard />
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance">
              <PerformanceMonitor />
            </TabsContent>

            {/* Rate Limiting Tab */}
            <TabsContent value="rate-limiting">
              <RateLimitingDashboard />
            </TabsContent>

            {/* User Activity Tab */}
            <TabsContent value="user-activity">
              <UserActivityTracker />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              {isAuthenticated && isOnline ? (
                <>Dados em tempo real via API OpLab • </>
              ) : (
                <>Dados simulados para demonstração • </>
              )}
              Desenvolvido com ❤️ para a comunidade de investidores brasileiros
            </p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App