import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Download, 
  TrendingUp, 
  DollarSign, 
  BarChart3, 
  Filter,
  RefreshCw,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LoadingSpinner } from '@/components/LoadingStates'
import { useOpLabState, useOpLabService } from '@/hooks/useOpLabAPI'

// Mock data for options when API is not available
const generateMockOptions = (underlyingSymbol = 'ITUB4') => {
  const expirations = [
    '2025-09-15', '2025-10-20', '2025-11-17', '2025-12-15',
    '2026-01-19', '2026-02-16', '2026-03-20'
  ]
  
  const underlyingPrice = 25.50
  const strikes = []
  
  // Generate strikes around underlying price
  for (let i = -10; i <= 10; i++) {
    const strike = Math.round((underlyingPrice + i * 2.5) * 4) / 4 // Round to nearest 0.25
    if (strike > 0) strikes.push(strike)
  }
  
  const options = []
  let id = 1
  
  expirations.forEach(expiration => {
    strikes.forEach(strike => {
      const daysToExpiry = Math.ceil((new Date(expiration) - new Date()) / (1000 * 60 * 60 * 24))
      const moneyness = strike / underlyingPrice
      const isITM = strike < underlyingPrice
      
      // Call option
      const callPrice = Math.max(0.05, isITM ? 
        (underlyingPrice - strike) + Math.random() * 2 : 
        Math.random() * 3)
      
      const callVolume = Math.floor(Math.random() * 10000) + 100
      const callOI = Math.floor(Math.random() * 50000) + 500
      const callIV = 0.15 + Math.random() * 0.4 // 15% to 55%
      
      options.push({
        id: id++,
        symbol: `${underlyingSymbol}${expiration.replace(/-/g, '')}C${strike.toFixed(2).replace('.', '')}`,
        underlying: underlyingSymbol,
        type: 'CALL',
        strike,
        expiration,
        daysToExpiry,
        price: callPrice,
        bid: callPrice - 0.05,
        ask: callPrice + 0.05,
        volume: callVolume,
        openInterest: callOI,
        impliedVolatility: callIV,
        delta: isITM ? 0.6 + Math.random() * 0.3 : Math.random() * 0.4,
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.05,
        vega: Math.random() * 0.3,
        rho: Math.random() * 0.1,
        moneyness,
        isITM,
        lastUpdate: new Date()
      })
      
      // Put option
      const putPrice = Math.max(0.05, !isITM ? 
        (strike - underlyingPrice) + Math.random() * 2 : 
        Math.random() * 3)
      
      const putVolume = Math.floor(Math.random() * 8000) + 50
      const putOI = Math.floor(Math.random() * 40000) + 300
      const putIV = 0.18 + Math.random() * 0.35 // 18% to 53%
      
      options.push({
        id: id++,
        symbol: `${underlyingSymbol}${expiration.replace(/-/g, '')}P${strike.toFixed(2).replace('.', '')}`,
        underlying: underlyingSymbol,
        type: 'PUT',
        strike,
        expiration,
        daysToExpiry,
        price: putPrice,
        bid: putPrice - 0.05,
        ask: putPrice + 0.05,
        volume: putVolume,
        openInterest: putOI,
        impliedVolatility: putIV,
        delta: isITM ? -(0.6 + Math.random() * 0.3) : -Math.random() * 0.4,
        gamma: Math.random() * 0.1,
        theta: -Math.random() * 0.05,
        vega: Math.random() * 0.3,
        rho: -Math.random() * 0.1,
        moneyness,
        isITM: !isITM,
        lastUpdate: new Date()
      })
    })
  })
  
  return options
}

export function OptionsGrid({ symbol = 'ITUB4' }) {
  const { isAuthenticated, isOnline, token } = useOpLabState()
  const { getOptions } = useOpLabService()
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [underlyingSymbol, setUnderlyingSymbol] = useState(symbol)
  const [selectedExpiration, setSelectedExpiration] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [moneyness, setMoneyness] = useState([0.8, 1.2])
  const [volumeMin, setVolumeMin] = useState(0)
  const [sortBy, setSortBy] = useState('strike')
  const [sortDirection, setSortDirection] = useState('asc')
  const [viewMode, setViewMode] = useState('chain')
  const [dataSource, setDataSource] = useState('mock')

  // Load options data
  useEffect(() => {
    const loadOptions = async () => {
      setLoading(true)
      setError(null)
      
      try {
        if (isAuthenticated && token && isOnline) {
          // Try to load real data from API
          try {
            const realOptions = await getOptions(underlyingSymbol)
            
            // Transform API data to match our format
            const transformedOptions = realOptions.map((opt, index) => ({
              id: index + 1,
              symbol: opt.symbol,
              underlying: underlyingSymbol,
              type: opt.type || 'CALL',
              strike: opt.strikePrice || opt.strike || 0,
              expiration: opt.expiration || '2025-12-15',
              daysToExpiry: opt.daysToExpiry || 30,
              price: opt.lastPrice || opt.price || 0,
              bid: opt.bid || (opt.lastPrice || opt.price || 0) - 0.05,
              ask: opt.ask || (opt.lastPrice || opt.price || 0) + 0.05,
              volume: opt.volume || 0,
              openInterest: opt.openInterest || 0,
              impliedVolatility: opt.impliedVolatility || 0.25,
              delta: opt.delta || 0.5,
              gamma: opt.gamma || 0.05,
              theta: opt.theta || -0.02,
              vega: opt.vega || 0.15,
              rho: opt.rho || 0.05,
              moneyness: (opt.strikePrice || opt.strike || 0) / 25.50, // Assuming underlying price
              isITM: opt.type === 'CALL' ? (opt.strikePrice || opt.strike || 0) < 25.50 : (opt.strikePrice || opt.strike || 0) > 25.50,
              lastUpdate: new Date()
            }))
            
            setOptions(transformedOptions)
            setDataSource('real')
          } catch (apiError) {
            console.warn('API failed, falling back to mock data:', apiError)
            // Fallback to mock data
            const mockOptions = generateMockOptions(underlyingSymbol)
            setOptions(mockOptions)
            setDataSource('mock')
          }
        } else {
          // Use mock data when not authenticated
          const mockOptions = generateMockOptions(underlyingSymbol)
          setOptions(mockOptions)
          setDataSource('mock')
        }
      } catch (err) {
        setError('Falha ao carregar dados das opções')
        console.error('Error loading options:', err)
      } finally {
        setLoading(false)
      }
    }

    if (underlyingSymbol) {
      loadOptions()
    }
  }, [underlyingSymbol, isAuthenticated, token, isOnline, getOptions])

  // Get unique expirations
  const expirations = useMemo(() => {
    const uniqueExpirations = [...new Set(options.map(option => option.expiration))]
    return uniqueExpirations.sort()
  }, [options])

  // Filter and sort options
  const filteredOptions = useMemo(() => {
    let filtered = options.filter(option => {
      const matchesExpiration = selectedExpiration === 'all' || option.expiration === selectedExpiration
      const matchesType = selectedType === 'all' || option.type === selectedType
      const matchesMoneyness = option.moneyness >= moneyness[0] && option.moneyness <= moneyness[1]
      const matchesVolume = option.volume >= volumeMin

      return matchesExpiration && matchesType && matchesMoneyness && matchesVolume
    })

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [options, selectedExpiration, selectedType, moneyness, volumeMin, sortBy, sortDirection])

  // Group options by strike for chain view
  const optionsChain = useMemo(() => {
    if (viewMode !== 'chain') return []
    
    const strikes = [...new Set(filteredOptions.map(opt => opt.strike))].sort((a, b) => a - b)
    
    return strikes.map(strike => {
      const call = filteredOptions.find(opt => opt.strike === strike && opt.type === 'CALL')
      const put = filteredOptions.find(opt => opt.strike === strike && opt.type === 'PUT')
      
      return {
        strike,
        call,
        put
      }
    })
  }, [filteredOptions, viewMode])

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format number
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined) return '-'
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  // Format percentage
  const formatPercentage = (value) => {
    if (value === null || value === undefined) return '-'
    return `${(value * 100).toFixed(1)}%`
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Símbolo', 'Tipo', 'Strike', 'Vencimento', 'Preço', 'Volume', 'OI', 'IV', 'Delta', 'Gamma', 'Theta', 'Vega']
    const rows = filteredOptions.map(option => [
      option.symbol,
      option.type,
      option.strike,
      option.expiration,
      option.price.toFixed(2),
      option.volume,
      option.openInterest,
      (option.impliedVolatility * 100).toFixed(1),
      option.delta.toFixed(3),
      option.gamma.toFixed(3),
      option.theta.toFixed(3),
      option.vega.toFixed(3)
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `opcoes-${underlyingSymbol}-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Carregando opções...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cadeia de Opções</h2>
          <p className="text-muted-foreground">
            {filteredOptions.length} opções encontradas para {underlyingSymbol}
            {dataSource === 'mock' && ' • Dados simulados para demonstração'}
            {dataSource === 'real' && ' • Dados em tempo real via API'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={exportToCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Underlying Symbol */}
            <div>
              <Label htmlFor="underlying">Ativo Subjacente</Label>
              <Input
                id="underlying"
                value={underlyingSymbol}
                onChange={(e) => setUnderlyingSymbol(e.target.value.toUpperCase())}
                placeholder="Ex: ITUB4"
              />
            </div>

            {/* Expiration */}
            <div>
              <Label>Vencimento</Label>
              <Select value={selectedExpiration} onValueChange={setSelectedExpiration}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os vencimentos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os vencimentos</SelectItem>
                  {expirations.map(exp => (
                    <SelectItem key={exp} value={exp}>
                      {new Date(exp).toLocaleDateString('pt-BR')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Option Type */}
            <div>
              <Label>Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="CALL">Calls</SelectItem>
                  <SelectItem value="PUT">Puts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Mode */}
            <div>
              <Label>Visualização</Label>
              <Select value={viewMode} onValueChange={setViewMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chain">Cadeia</SelectItem>
                  <SelectItem value="list">Lista</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Moneyness Range */}
            <div className="md:col-span-2">
              <Label>Moneyness</Label>
              <div className="space-y-2 mt-2">
                <Slider
                  value={moneyness}
                  onValueChange={setMoneyness}
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{moneyness[0].toFixed(2)}</span>
                  <span>{moneyness[1].toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div>
              <Label>Volume Mínimo</Label>
              <div className="space-y-2 mt-2">
                <Slider
                  value={[volumeMin]}
                  onValueChange={([value]) => setVolumeMin(value)}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  {volumeMin.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Options Display */}
      {viewMode === 'chain' ? (
        /* Chain View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th colSpan="6" className="text-center p-4 bg-green-50 text-green-800 font-semibold">CALLS</th>
                    <th className="text-center p-4 font-semibold">STRIKE</th>
                    <th colSpan="6" className="text-center p-4 bg-red-50 text-red-800 font-semibold">PUTS</th>
                  </tr>
                  <tr className="text-sm">
                    <th className="text-left p-2">Volume</th>
                    <th className="text-left p-2">OI</th>
                    <th className="text-left p-2">IV</th>
                    <th className="text-left p-2">Delta</th>
                    <th className="text-left p-2">Bid</th>
                    <th className="text-left p-2">Ask</th>
                    <th className="text-center p-2 font-semibold">Strike</th>
                    <th className="text-right p-2">Bid</th>
                    <th className="text-right p-2">Ask</th>
                    <th className="text-right p-2">Delta</th>
                    <th className="text-right p-2">IV</th>
                    <th className="text-right p-2">OI</th>
                    <th className="text-right p-2">Volume</th>
                  </tr>
                </thead>
                <tbody>
                  {optionsChain.map(({ strike, call, put }) => (
                    <tr key={strike} className="border-b hover:bg-muted/50">
                      {/* Call data */}
                      <td className="p-2 text-sm">{call?.volume?.toLocaleString() || '-'}</td>
                      <td className="p-2 text-sm">{call?.openInterest?.toLocaleString() || '-'}</td>
                      <td className="p-2 text-sm">{call ? formatPercentage(call.impliedVolatility) : '-'}</td>
                      <td className="p-2 text-sm">{call ? formatNumber(call.delta, 3) : '-'}</td>
                      <td className="p-2 text-sm font-semibold">{call ? formatCurrency(call.bid) : '-'}</td>
                      <td className="p-2 text-sm font-semibold">{call ? formatCurrency(call.ask) : '-'}</td>
                      
                      {/* Strike */}
                      <td className="p-2 text-center font-bold">{formatCurrency(strike)}</td>
                      
                      {/* Put data */}
                      <td className="p-2 text-sm font-semibold text-right">{put ? formatCurrency(put.bid) : '-'}</td>
                      <td className="p-2 text-sm font-semibold text-right">{put ? formatCurrency(put.ask) : '-'}</td>
                      <td className="p-2 text-sm text-right">{put ? formatNumber(put.delta, 3) : '-'}</td>
                      <td className="p-2 text-sm text-right">{put ? formatPercentage(put.impliedVolatility) : '-'}</td>
                      <td className="p-2 text-sm text-right">{put?.openInterest?.toLocaleString() || '-'}</td>
                      <td className="p-2 text-sm text-right">{put?.volume?.toLocaleString() || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('symbol')}
                        className="font-semibold"
                      >
                        Símbolo
                        {sortBy === 'symbol' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </th>
                    <th className="text-left p-4">Tipo</th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('strike')}
                        className="font-semibold"
                      >
                        Strike
                        {sortBy === 'strike' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </th>
                    <th className="text-left p-4">Vencimento</th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('price')}
                        className="font-semibold"
                      >
                        Preço
                        {sortBy === 'price' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </th>
                    <th className="text-left p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSort('volume')}
                        className="font-semibold"
                      >
                        Volume
                        {sortBy === 'volume' && (
                          sortDirection === 'asc' ? <ChevronUp className="h-4 w-4 ml-1" /> : <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </Button>
                    </th>
                    <th className="text-left p-4">OI</th>
                    <th className="text-left p-4">IV</th>
                    <th className="text-left p-4">Delta</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOptions.map((option) => (
                    <tr key={option.id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="font-mono text-sm">{option.symbol}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant={option.type === 'CALL' ? 'default' : 'secondary'}>
                          {option.type}
                        </Badge>
                      </td>
                      <td className="p-4 font-semibold">{formatCurrency(option.strike)}</td>
                      <td className="p-4">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(option.expiration).toLocaleDateString('pt-BR')}
                        </div>
                      </td>
                      <td className="p-4 font-semibold">{formatCurrency(option.price)}</td>
                      <td className="p-4">{option.volume.toLocaleString()}</td>
                      <td className="p-4">{option.openInterest.toLocaleString()}</td>
                      <td className="p-4">{formatPercentage(option.impliedVolatility)}</td>
                      <td className="p-4">
                        <span className={option.delta >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {formatNumber(option.delta, 3)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {filteredOptions.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">Nenhuma opção encontrada</p>
            <p className="text-sm text-muted-foreground mb-4">
              Ajuste os filtros ou tente outro ativo subjacente
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default OptionsGrid
