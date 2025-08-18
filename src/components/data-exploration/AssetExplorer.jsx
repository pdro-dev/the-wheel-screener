import React, { useState, useEffect, useMemo } from 'react'
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  TrendingUp, 
  TrendingDown,
  BarChart3,
  DollarSign,
  Volume2,
  Calendar,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

// Mock data generator for assets
const generateAssetData = (count = 100) => {
  const sectors = ['Tecnologia', 'Bancos', 'Petróleo', 'Mineração', 'Varejo', 'Telecomunicações', 'Energia', 'Saúde']
  const assets = []
  
  for (let i = 0; i < count; i++) {
    const symbol = `ASSET${i.toString().padStart(2, '0')}`
    const sector = sectors[Math.floor(Math.random() * sectors.length)]
    const price = 15 + Math.random() * 200
    const change = (Math.random() - 0.5) * 10
    const volume = 100000 + Math.random() * 5000000
    const marketCap = price * (1000000 + Math.random() * 10000000)
    
    assets.push({
      id: i + 1,
      symbol,
      name: `${symbol} S.A.`,
      sector,
      price,
      change,
      changePercent: (change / price) * 100,
      volume,
      marketCap,
      pe: 5 + Math.random() * 30,
      dividend: Math.random() * 8,
      beta: 0.5 + Math.random() * 1.5,
      roe: Math.random() * 25,
      roic: Math.random() * 20,
      debtToEquity: Math.random() * 2,
      currentRatio: 0.5 + Math.random() * 3,
      grossMargin: 10 + Math.random() * 40,
      netMargin: Math.random() * 15,
      revenueGrowth: (Math.random() - 0.3) * 30,
      earningsGrowth: (Math.random() - 0.3) * 40
    })
  }
  
  return assets
}

export function AssetExplorer() {
  const [assets] = useState(() => generateAssetData(150))
  const [filteredAssets, setFilteredAssets] = useState(assets)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSector, setSelectedSector] = useState('all')
  const [sortBy, setSortBy] = useState('symbol')
  const [sortDirection, setSortDirection] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedAsset, setSelectedAsset] = useState(null)

  // Get unique sectors
  const sectors = useMemo(() => {
    const uniqueSectors = [...new Set(assets.map(asset => asset.sector))]
    return uniqueSectors.sort()
  }, [assets])

  // Filter and sort assets
  useEffect(() => {
    let filtered = assets

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.sector.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sector filter
    if (selectedSector !== 'all') {
      filtered = filtered.filter(asset => asset.sector === selectedSector)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (sortDirection === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    setFilteredAssets(filtered)
    setCurrentPage(1)
  }, [assets, searchTerm, selectedSector, sortBy, sortDirection])

  // Pagination
  const totalPages = Math.ceil(filteredAssets.length / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const currentAssets = filteredAssets.slice(startIndex, endIndex)

  // Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format number
  const formatNumber = (value, decimals = 2) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value)
  }

  // Format volume
  const formatVolume = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // Format market cap
  const formatMarketCap = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    return formatCurrency(value)
  }

  // Export data
  const handleExport = () => {
    const csvContent = [
      ['Símbolo', 'Nome', 'Setor', 'Preço', 'Variação %', 'Volume', 'Market Cap', 'P/E', 'Dividend %'].join(','),
      ...filteredAssets.map(asset => [
        asset.symbol,
        asset.name,
        asset.sector,
        asset.price.toFixed(2),
        asset.changePercent.toFixed(2),
        asset.volume,
        asset.marketCap.toFixed(0),
        asset.pe.toFixed(2),
        asset.dividend.toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asset-explorer.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Asset Explorer</h2>
          <p className="text-muted-foreground">
            Explore e analise ativos disponíveis no mercado brasileiro
          </p>
        </div>
        <Button onClick={handleExport} variant="outline">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Buscar</label>
              <Input
                placeholder="Símbolo, nome ou setor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Setor</label>
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
            <div>
              <label className="text-sm font-medium mb-2 block">Ordenar por</label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="symbol">Símbolo</SelectItem>
                  <SelectItem value="price">Preço</SelectItem>
                  <SelectItem value="changePercent">Variação %</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="marketCap">Market Cap</SelectItem>
                  <SelectItem value="pe">P/E</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Total de Ativos</p>
                <p className="text-2xl font-bold">{filteredAssets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Em Alta</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAssets.filter(a => a.changePercent > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium">Em Baixa</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredAssets.filter(a => a.changePercent < 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Volume Médio</p>
                <p className="text-2xl font-bold">
                  {formatVolume(filteredAssets.reduce((sum, a) => sum + a.volume, 0) / filteredAssets.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ativos ({filteredAssets.length})</CardTitle>
          <CardDescription>
            Página {currentPage} de {totalPages} • {filteredAssets.length} ativos encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('symbol')} className="h-auto p-0 font-semibold">
                      Símbolo
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Setor</TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('price')} className="h-auto p-0 font-semibold">
                      Preço
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('changePercent')} className="h-auto p-0 font-semibold">
                      Variação
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('volume')} className="h-auto p-0 font-semibold">
                      Volume
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button variant="ghost" onClick={() => handleSort('marketCap')} className="h-auto p-0 font-semibold">
                      Market Cap
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>P/E</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentAssets.map((asset) => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.symbol}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{asset.sector}</Badge>
                    </TableCell>
                    <TableCell>{formatCurrency(asset.price)}</TableCell>
                    <TableCell>
                      <div className={`flex items-center ${asset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.changePercent >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {formatNumber(asset.changePercent, 2)}%
                      </div>
                    </TableCell>
                    <TableCell>{formatVolume(asset.volume)}</TableCell>
                    <TableCell>{formatMarketCap(asset.marketCap)}</TableCell>
                    <TableCell>{formatNumber(asset.pe, 1)}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedAsset(asset)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>{asset.symbol} - {asset.name}</DialogTitle>
                            <DialogDescription>
                              Análise detalhada do ativo
                            </DialogDescription>
                          </DialogHeader>
                          {selectedAsset && (
                            <Tabs defaultValue="overview" className="w-full">
                              <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                                <TabsTrigger value="fundamentals">Fundamentos</TabsTrigger>
                                <TabsTrigger value="ratios">Indicadores</TabsTrigger>
                              </TabsList>
                              <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Preço Atual</p>
                                    <p className="text-2xl font-bold">{formatCurrency(selectedAsset.price)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Variação</p>
                                    <p className={`text-2xl font-bold ${selectedAsset.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatNumber(selectedAsset.changePercent, 2)}%
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Volume</p>
                                    <p className="text-2xl font-bold">{formatVolume(selectedAsset.volume)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Market Cap</p>
                                    <p className="text-2xl font-bold">{formatMarketCap(selectedAsset.marketCap)}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="fundamentals" className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">P/E Ratio</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.pe, 1)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Dividend Yield</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.dividend, 2)}%</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Beta</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.beta, 2)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">ROE</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.roe, 1)}%</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">ROIC</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.roic, 1)}%</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Debt/Equity</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.debtToEquity, 2)}</p>
                                  </div>
                                </div>
                              </TabsContent>
                              <TabsContent value="ratios" className="space-y-4">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Current Ratio</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.currentRatio, 2)}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Gross Margin</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.grossMargin, 1)}%</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Net Margin</p>
                                    <p className="text-xl font-semibold">{formatNumber(selectedAsset.netMargin, 1)}%</p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Revenue Growth</p>
                                    <p className={`text-xl font-semibold ${selectedAsset.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatNumber(selectedAsset.revenueGrowth, 1)}%
                                    </p>
                                  </div>
                                  <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground">Earnings Growth</p>
                                    <p className={`text-xl font-semibold ${selectedAsset.earningsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                      {formatNumber(selectedAsset.earningsGrowth, 1)}%
                                    </p>
                                  </div>
                                </div>
                              </TabsContent>
                            </Tabs>
                          )}
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredAssets.length)} de {filteredAssets.length} ativos
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Próxima
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

