import { useState, useCallback, useMemo, useEffect } from 'react'
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
  PieChart,
  BookOpen,
  Home,
  Briefcase
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
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui/dropdown-menu'

// Import custom hooks
import { useOptimizedFilters, useDebounce, useResultCache } from '@/hooks/usePerformance'
import { useIsMobile, useOrientation } from '@/hooks/useMobile'
import { useWheelScreening } from '@/hooks/useWheelScreening'
import { useOpLabState } from '@/hooks/useOpLabAPI'
import { useAsyncState, useRetry } from '@/hooks/useAsyncState'

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
  ProgressIndicator
} from '@/components/LoadingStates'
import Dashboard from '@/components/Dashboard'
import TutorialPage from '@/components/tutorial/TutorialPageExpanded'
import {
  TokenConfiguration,
  InlineAPIStatus
} from '@/components/APIIntegration'

// Import Analytics Components
import { APIMetricsDashboard } from '@/components/analytics/APIMetricsDashboard'
import { PerformanceMonitor } from '@/components/analytics/PerformanceMonitor'
import { RateLimitingDashboard } from '@/components/analytics/RateLimitingDashboard'
import { UserActivityTracker } from '@/components/analytics/UserActivityTracker'

// Import utilities
import { applyFilters, calculatePortfolioMetrics } from '@/utils/screening'
import { ScreeningUtils } from '@/services/opLabAPI'
import { AssetGrid } from '@/components/AssetGrid'
import { OptionsGrid } from '@/components/OptionsGrid'
import { Login } from '@/components/Login'

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
  const [activeTab, setActiveTab] = useState('dashboard')
  const [filters, setFilters] = useState({
    search: '',
    minPrice: 0,
    maxPrice: 1000,
    minVolume: 0,
    minROIC: 0,
    minScore: 0,
    sector: 'all',
    sortBy: 'score',
    sortOrder: 'desc'
  })

  const { sanitizeInput, validateFilter } = useFormValidation()
  const isMobile = useIsMobile()
  const orientation = useOrientation()
  
  // OpLab API state
  const { 
    isAuthenticated, 
    user, 
    logout, 
    apiStatus, 
    isLoading: apiLoading 
  } = useOpLabState()

  // Screening state
  const {
    results,
    isLoading: screeningLoading,
    error: screeningError,
    executeScreening,
    clearResults
  } = useWheelScreening()

  // Performance hooks
  const optimizedFilters = useOptimizedFilters(filters)
  const debouncedSearch = useDebounce(filters.search, 300)
  const { cachedResults, setCachedResults } = useResultCache()

  // Main navigation tabs - different for user vs admin
  const getMainTabs = () => {
    const baseTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'screening', label: 'Screening', icon: Search },
      { id: 'ativos', label: 'Ativos', icon: BarChart3 },
      { id: 'opcoes', label: 'Opções', icon: DollarSign },
      { id: 'tutorial', label: 'Tutorial', icon: BookOpen },
      { id: 'gestao', label: 'Gestão', icon: Briefcase, disabled: true }
    ]
    
    return baseTabs
  }

  // Admin dropdown items
  const getAdminDropdownItems = () => {
    if (user?.role !== 'admin') return []
    
    return [
      { id: 'config-api', label: 'Config API', icon: Settings },
      { id: 'api-metrics', label: 'API Metrics', icon: Activity },
      { id: 'performance', label: 'Performance', icon: TrendingUp },
      { id: 'rate-limiting', label: 'Rate Limiting', icon: AlertCircle },
      { id: 'user-activity', label: 'User Activity', icon: PieChart }
    ]
  }

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
  }

  const handleFilterChange = useCallback((key, value) => {
    const sanitizedValue = sanitizeInput(value, key.includes('Price') || key.includes('Volume') || key.includes('ROIC') || key.includes('Score') ? 'number' : 'text')
    
    if (key.includes('min') || key.includes('max') || key.includes('ROIC') || key.includes('Score')) {
      const numValue = parseFloat(sanitizedValue) || 0
      if (!validateFilter(key, numValue)) return
    }
    
    setFilters(prev => ({
      ...prev,
      [key]: sanitizedValue
    }))
  }, [sanitizeInput, validateFilter])

  const handleExecuteScreening = useCallback(async () => {
    try {
      await executeScreening(optimizedFilters)
    } catch (error) {
      console.error('Screening failed:', error)
    }
  }, [executeScreening, optimizedFilters])

  const handleClearFilters = useCallback(() => {
    setFilters({
      search: '',
      minPrice: 0,
      maxPrice: 1000,
      minVolume: 0,
      minROIC: 0,
      minScore: 0,
      sector: 'all',
      sortBy: 'score',
      sortOrder: 'desc'
    })
    clearResults()
  }, [clearResults])

  const exportToCSV = useCallback(() => {
    if (!results || results.length === 0) return
    
    const headers = ['Symbol', 'Company', 'Price', 'Score', 'ROI', 'Strategy', 'Strike', 'Volume', 'ROIC']
    const csvContent = [
      headers.join(','),
      ...results.map(row => [
        row.symbol,
        `"${row.company}"`,
        row.price,
        row.score,
        row.roi,
        row.strategy,
        row.strike,
        row.volume,
        row.roic
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `wheel-screening-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [results])

  const mainTabs = getMainTabs()
  const adminDropdownItems = getAdminDropdownItems()

  // Check authentication after all hooks to maintain consistent hook order per React rules
  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">The Wheel Screener</h1>
                <p className="text-sm text-muted-foreground">
                  Identifique as melhores oportunidades para a estratégia "The Wheel" • 
                  Usuário: <span className="font-medium">{user?.username}</span>
                  {user?.role === 'admin' && <span className="text-blue-600"> (Administrador)</span>}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <InlineAPIStatus />
                <Button onClick={logout} variant="outline" size="sm">
                  Sair
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <div className="border-b">
          <div className="container mx-auto px-4">
            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <div className="flex items-center justify-between">
                <TabsList className="grid w-auto grid-cols-6 gap-1">
                  {mainTabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <TabsTrigger 
                        key={tab.id} 
                        value={tab.id}
                        disabled={tab.disabled}
                        className="flex items-center space-x-2"
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{tab.label}</span>
                      </TabsTrigger>
                    )
                  })}
                </TabsList>

                {/* Admin Dropdown */}
                {adminDropdownItems.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Configurações
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {adminDropdownItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <DropdownMenuItem
                            key={item.id}
                            onClick={() => handleTabChange(item.id)}
                          >
                            <Icon className="h-4 w-4 mr-2" />
                            {item.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>

              {/* Tab Contents */}
              <div className="py-6">
                <TabsContent value="dashboard">
                  <Dashboard />
                </TabsContent>

                <TabsContent value="screening">
                  <div className="space-y-6">
                    {/* Screening content here */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Screening de Oportunidades</h2>
                      <div className="flex space-x-2">
                        <Button onClick={exportToCSV} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Exportar CSV
                        </Button>
                      </div>
                    </div>
                    {/* Add screening filters and results here */}
                  </div>
                </TabsContent>

                <TabsContent value="ativos">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Explorador de Ativos</h2>
                      <Button onClick={exportToCSV} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                    <AssetGrid />
                  </div>
                </TabsContent>

                <TabsContent value="opcoes">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold">Cadeia de Opções</h2>
                      <Button onClick={exportToCSV} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                    <OptionsGrid />
                  </div>
                </TabsContent>

                <TabsContent value="tutorial">
                  <TutorialPage />
                </TabsContent>

                <TabsContent value="gestao">
                  <div className="text-center py-12">
                    <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Gestão de Portfolio</h3>
                    <p className="text-muted-foreground">
                      Funcionalidade em desenvolvimento. Em breve você poderá gerenciar suas posições ativas.
                    </p>
                  </div>
                </TabsContent>

                {/* Admin-only tabs */}
                {user?.role === 'admin' && (
                  <>
                    <TabsContent value="config-api">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Configuração da API</h2>
                        <TokenConfiguration />
                      </div>
                    </TabsContent>

                    <TabsContent value="api-metrics">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Métricas da API</h2>
                        <APIMetricsDashboard />
                      </div>
                    </TabsContent>

                    <TabsContent value="performance">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Performance</h2>
                        <PerformanceMonitor />
                      </div>
                    </TabsContent>

                    <TabsContent value="rate-limiting">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Rate Limiting</h2>
                        <RateLimitingDashboard />
                      </div>
                    </TabsContent>

                    <TabsContent value="user-activity">
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold">Atividade de Usuários</h2>
                        <UserActivityTracker />
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default App
