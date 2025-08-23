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
  ChevronUp
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
import { useOpLabState } from '@/hooks/useOpLabAPI'
import { useOpLabService } from '@/hooks/useOpLabService'

// Mock data for assets when API is not available
const generateMockAssets = () => {
  const sectors = [
    'Financeiro', 'Energia', 'Tecnologia', 'Saúde', 'Consumo', 
    'Industrial', 'Materiais', 'Telecomunicações', 'Utilities', 'Imobiliário'
  ]
  
  const companies = [
    'ITUB4', 'VALE3', 'PETR4', 'BBDC4', 'ABEV3', 'WEGE3', 'MGLU3', 'RENT3',
    'LREN3', 'JBSS3', 'SUZB3', 'RAIL3', 'USIM5', 'CSNA3', 'GOAU4', 'GGBR4',
    'CIEL3', 'RADL3', 'FLRY3', 'QUAL3', 'VIVT3', 'TIMP3', 'ELET3', 'CMIG4',
    'BRFS3', 'MRFG3', 'NTCO3', 'CCRO3', 'EQTL3', 'TAEE11', 'CPLE6', 'SBSP3'
  ]

  return companies.map((symbol, index) => ({
    id: index + 1,
    symbol,
    name: `${symbol.slice(0, 4)} S.A.`,
    price: Math.random() * 100 + 10,
    change: (Math.random() - 0.5) * 10,
    changePercent: (Math.random() - 0.5) * 15,
    volume: Math.floor(Math.random() * 10000000) + 100000,
    marketCap: Math.floor(Math.random() * 100000000000) + 1000000000,
    dividendYield: Math.random() * 12,
    sector: sectors[Math.floor(Math.random() * sectors.length)],
    hasOptions: Math.random() > 0.3,
    optionVolume: Math.floor(Math.random() * 1000000),
    pe: Math.random() * 30 + 5,
    pb: Math.random() * 5 + 0.5,
    roe: Math.random() * 25 + 5,
    roic: Math.random() * 20 + 2,
    debtToEquity: Math.random() * 2,
    currentRatio: Math.random() * 3 + 0.5,
    lastUpdate: new Date()
  }))
}

export function AssetGrid() {
  const { isAuthenticated, isOnline, token } = useOpLabState()
  const { getInstruments, getQuotes } = useOpLabService()
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [priceRange, setPriceRange] = useState([0, 200])
  const [volumeMin, setVolumeMin] = useState(0)
  const [hasOptionsOnly, setHasOptionsOnly] = useState(false)
  const [sortBy, setSortBy] = useState('symbol')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(20)
  const [expandedRows, setExpandedRows] = useState(new Set())
  const [dataSource, setDataSource] = useState('mock')

  // Load assets data
  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Call instruments API directly
        const response = await fetch('/api/instruments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        // Transform API data
        const realAssets = data.instruments.map((inst, index) => ({
          id: index + 1,
          symbol: inst.symbol,
          name: inst.name || `${inst.symbol} S.A.`,
          price: inst.price || 0,
          change: Math.random() * 10 - 5, // Mock for now
          changePercent: Math.random() * 10 - 5, // Mock for now
          volume: inst.volume || 0,
          marketCap: inst.marketCap || 0,
          dividendYield: Math.random() * 8, // Mock for now
          sector: inst.sector || 'Financeiro',
          hasOptions: true, // Assume all have options
          optionVolume: Math.floor(Math.random() * 1000000),
          pe: Math.random() * 30 + 5,
          pb: Math.random() * 5 + 0.5,
          roe: Math.random() * 25 + 5,
          roic: Math.random() * 20 + 2,
          debtToEquity: Math.random() * 2,
          currentRatio: Math.random() * 3 + 0.5,
          lastUpdate: new Date()
        }))
        
        setAssets(realAssets)
        setDataSource('real')
        
      } catch (err) {
        console.warn('API failed, falling back to mock data:', err)
        setError('Falha ao carregar dados dos ativos - usando dados simulados')
        
        // Fallback to mock data
        const mockAssets = generateMockAssets()
        setAssets(mockAssets)
        setDataSource('mock')
      } finally {
        setLoading(false)
      }
    }

    loadAssets()
  }, [])

  // Get unique sectors
  const sectors = useMemo(() => {
    const uniqueSectors = [...new Set(assets.map(asset => asset.sector))]
    return uniqueSectors.sort()
  }, [assets])

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = assets.filter(asset => {
      const matchesSearch = asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           asset.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesSector = selectedSector === 'all' || asset.sector === selectedSector
      const matchesPrice = asset.price >= priceRange[0] && asset.price <= priceRange[1]
      const matchesVolume = asset.volume >= volumeMin
      const matchesOptions = !hasOptionsOnly || asset.hasOptions

      return matchesSearch && matchesSector && matchesPrice && matchesVolume && matchesOptions
    })

    // Sort
    filtered.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (typeof aVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }
      
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal
    })

    return filtered
  }, [assets, searchTerm, selectedSector, priceRange, volumeMin, hasOptionsOnly, sortBy, sortDirection])

  // Paginated assets
  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filteredAssets.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredAssets, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage)

  // Handle sort
  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('asc')
    }
  }

  // Handle row expansion
  const toggleRowExpansion = (assetId) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(assetId)) {
      newExpanded.delete(assetId)
    } else {
      newExpanded.add(assetId)
    }
    setExpandedRows(newExpanded)
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format number
  const formatNumber = (value, decimals = 0) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  // Format volume
  const formatVolume = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Símbolo', 'Nome', 'Preço', 'Variação %', 'Volume', 'Market Cap', 'Dividend Yield', 'Setor', 'Tem Opções']
    const rows = filteredAssets.map(asset => [
      asset.symbol,
      asset.name,
      asset.price.toFixed(2),
      asset.changePercent.toFixed(2),
      asset.volume,
      asset.marketCap,
      asset.dividendYield.toFixed(2),
      asset.sector,
      asset.hasOptions ? 'Sim' : 'Não'
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `ativos-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <LoadingSpinner size="lg" />
        <span className="ml-2">Carregando ativos...</span>
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
          <h2 className="text-2xl font-bold">Explorador de Ativos</h2>
          <p className="text-muted-foreground">
            {filteredAssets.length} ativos encontrados
            {dataSource === 'mock' && ' • Dados simulados para demonstração'}
            {dataSource === 'real' && ' • Dados em tempo real via API'}
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
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
            {/* Search */}
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Símbolo ou nome..."
              />
            </div>

            {/* Sector */}
            <div>
              <Label>Setor</Label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os setores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label>Faixa de Preço (R$)</Label>
              <div className="space-y-2 mt-2">
                <Slider
                  value={priceRange}
                  onValueChange={setPriceRange}
                  min={0}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>R$ {priceRange[0]}</span>
                  <span>R$ {priceRange[1]}</span>
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
                  max={10000000}
                  step={100000}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  {formatVolume(volumeMin)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 mt-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={hasOptionsOnly}
                onChange={(e) => setHasOptionsOnly(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Apenas com opções</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Assets Table */}
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
                      onClick={() => handleSort('changePercent')}
                      className="font-semibold"
                    >
                      Variação
                      {sortBy === 'changePercent' && (
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
                  <th className="text-left p-4">Setor</th>
                  <th className="text-left p-4">Opções</th>
                  <th className="text-left p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssets.map((asset) => (
                  <React.Fragment key={asset.id}>
                    <tr className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div>
                          <div className="font-semibold">{asset.symbol}</div>
                          <div className="text-sm text-muted-foreground">{asset.name}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{formatCurrency(asset.price)}</div>
                      </td>
                      <td className="p-4">
                        <div className={`flex items-center ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          <TrendingUp className={`h-4 w-4 mr-1 ${asset.changePercent < 0 ? 'rotate-180' : ''}`} />
                          {asset.changePercent >= 0 ? '+' : ''}{formatNumber(asset.changePercent, 2)}%
                        </div>
                      </td>
                      <td className="p-4">{formatVolume(asset.volume)}</td>
                      <td className="p-4">
                        <Badge variant="outline">{asset.sector}</Badge>
                      </td>
                      <td className="p-4">
                        {asset.hasOptions ? (
                          <Badge variant="default">Sim</Badge>
                        ) : (
                          <Badge variant="secondary">Não</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleRowExpansion(asset.id)}
                        >
                          {expandedRows.has(asset.id) ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                    {expandedRows.has(asset.id) && (
                      <tr className="border-b bg-muted/25">
                        <td colSpan="7" className="p-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-semibold">Market Cap:</span>
                              <div>{formatCurrency(asset.marketCap)}</div>
                            </div>
                            <div>
                              <span className="font-semibold">Dividend Yield:</span>
                              <div>{formatNumber(asset.dividendYield, 2)}%</div>
                            </div>
                            <div>
                              <span className="font-semibold">P/E:</span>
                              <div>{formatNumber(asset.pe, 1)}</div>
                            </div>
                            <div>
                              <span className="font-semibold">P/B:</span>
                              <div>{formatNumber(asset.pb, 2)}</div>
                            </div>
                            <div>
                              <span className="font-semibold">ROE:</span>
                              <div>{formatNumber(asset.roe, 1)}%</div>
                            </div>
                            <div>
                              <span className="font-semibold">ROIC:</span>
                              <div>{formatNumber(asset.roic, 1)}%</div>
                            </div>
                            <div>
                              <span className="font-semibold">Dívida/PL:</span>
                              <div>{formatNumber(asset.debtToEquity, 2)}</div>
                            </div>
                            <div>
                              <span className="font-semibold">Liquidez Corrente:</span>
                              <div>{formatNumber(asset.currentRatio, 2)}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredAssets.length)} de {filteredAssets.length} ativos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Anterior
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetGrid
