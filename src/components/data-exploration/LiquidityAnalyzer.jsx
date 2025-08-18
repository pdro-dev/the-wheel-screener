import React, { useState, useEffect, useMemo } from 'react'
import { 
  Droplets, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Volume2,
  Target,
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts'

// Generate mock liquidity data
const generateLiquidityData = () => {
  const assets = [
    'PETR4', 'VALE3', 'ITUB4', 'BBDC4', 'ABEV3', 'MGLU3', 'WEGE3', 'RENT3', 'LREN3', 'JBSS3',
    'SUZB3', 'RAIL3', 'USIM5', 'CSNA3', 'GOAU4', 'GGBR4', 'CMIN3', 'KLBN11', 'EMBR3', 'AZUL4'
  ]

  return assets.map((symbol, index) => {
    const price = 15 + Math.random() * 100
    const volume = 1000000 + Math.random() * 10000000
    const marketCap = price * (100000000 + Math.random() * 1000000000)
    const avgVolume30d = volume * (0.8 + Math.random() * 0.4)
    const bidAskSpread = 0.01 + Math.random() * 0.05
    const turnover = volume / (marketCap / price)
    
    // Liquidity metrics
    const liquidityScore = Math.min(100, (volume / 1000000) * 10 + (1 / bidAskSpread) * 20 + turnover * 100)
    const impactCost = bidAskSpread * 0.5 + (1 / Math.sqrt(volume / 1000000)) * 0.1
    const marketDepth = volume * price * (0.1 + Math.random() * 0.3)
    
    // Time-based metrics
    const timeToTrade1M = Math.max(0.1, 60 / (volume / 1000000)) // minutes to trade 1M
    const timeToTrade5M = Math.max(0.5, 300 / (volume / 1000000)) // minutes to trade 5M
    
    // Risk metrics
    const volatility = 0.15 + Math.random() * 0.35
    const beta = 0.5 + Math.random() * 1.5
    const sharpe = (Math.random() - 0.3) * 2

    return {
      symbol,
      price,
      volume,
      avgVolume30d,
      marketCap,
      bidAskSpread,
      turnover,
      liquidityScore,
      impactCost,
      marketDepth,
      timeToTrade1M,
      timeToTrade5M,
      volatility,
      beta,
      sharpe,
      sector: ['Petróleo', 'Mineração', 'Bancos', 'Tecnologia', 'Varejo'][Math.floor(Math.random() * 5)],
      liquidityRating: liquidityScore > 80 ? 'Excelente' : 
                      liquidityScore > 60 ? 'Boa' : 
                      liquidityScore > 40 ? 'Regular' : 'Baixa'
    }
  })
}

// Generate intraday liquidity data
const generateIntradayData = () => {
  const hours = []
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) break
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
      const volume = 1000000 + Math.random() * 5000000
      const spread = 0.01 + Math.random() * 0.03
      const liquidity = Math.max(20, 100 - spread * 1000 + (volume / 100000))
      
      hours.push({
        time,
        hour: h + m/60,
        volume,
        spread,
        liquidity,
        trades: Math.floor(100 + Math.random() * 500)
      })
    }
  }
  return hours
}

export function LiquidityAnalyzer() {
  const [assets] = useState(() => generateLiquidityData())
  const [intradayData] = useState(() => generateIntradayData())
  const [selectedAsset, setSelectedAsset] = useState('PETR4')
  const [sortBy, setSortBy] = useState('liquidityScore')
  const [filterSector, setFilterSector] = useState('all')
  const [minLiquidity, setMinLiquidity] = useState(0)

  // Get unique sectors
  const sectors = useMemo(() => {
    const unique = [...new Set(assets.map(asset => asset.sector))]
    return unique.sort()
  }, [assets])

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let filtered = assets

    if (filterSector !== 'all') {
      filtered = filtered.filter(asset => asset.sector === filterSector)
    }

    filtered = filtered.filter(asset => asset.liquidityScore >= minLiquidity)

    return filtered.sort((a, b) => {
      if (sortBy === 'symbol') {
        return a.symbol.localeCompare(b.symbol)
      }
      return b[sortBy] - a[sortBy]
    })
  }, [assets, filterSector, minLiquidity, sortBy])

  // Selected asset data
  const assetData = useMemo(() => {
    return assets.find(asset => asset.symbol === selectedAsset) || assets[0]
  }, [assets, selectedAsset])

  // Liquidity distribution
  const liquidityDistribution = useMemo(() => {
    const ranges = [
      { range: '0-20', min: 0, max: 20, count: 0, color: '#ef4444' },
      { range: '20-40', min: 20, max: 40, count: 0, color: '#f97316' },
      { range: '40-60', min: 40, max: 60, count: 0, color: '#eab308' },
      { range: '60-80', min: 60, max: 80, count: 0, color: '#22c55e' },
      { range: '80-100', min: 80, max: 100, count: 0, color: '#16a34a' }
    ]

    assets.forEach(asset => {
      const range = ranges.find(r => asset.liquidityScore >= r.min && asset.liquidityScore < r.max)
      if (range) range.count++
    })

    return ranges
  }, [assets])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format percentage
  const formatPercent = (value) => {
    return `${(value * 100).toFixed(2)}%`
  }

  // Format volume
  const formatVolume = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    }
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // Get liquidity color
  const getLiquidityColor = (score) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    if (score >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  // Get liquidity icon
  const getLiquidityIcon = (score) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (score >= 40) return <AlertTriangle className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  // Export data
  const handleExport = () => {
    const csvContent = [
      ['Símbolo', 'Setor', 'Preço', 'Volume', 'Score Liquidez', 'Spread', 'Turnover', 'Impacto', 'Rating'].join(','),
      ...filteredAssets.map(asset => [
        asset.symbol,
        asset.sector,
        asset.price.toFixed(2),
        asset.volume,
        asset.liquidityScore.toFixed(1),
        asset.bidAskSpread.toFixed(4),
        asset.turnover.toFixed(4),
        asset.impactCost.toFixed(4),
        asset.liquidityRating
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'liquidity-analysis.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Liquidity Analyzer</h2>
          <p className="text-muted-foreground">
            Análise avançada de liquidez e custos de transação
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Droplets className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Alta Liquidez</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assets.filter(a => a.liquidityScore >= 80).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Volume2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Volume Médio</p>
                <p className="text-2xl font-bold">
                  {formatVolume(assets.reduce((sum, a) => sum + a.volume, 0) / assets.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Spread Médio</p>
                <p className="text-2xl font-bold">
                  {formatPercent(assets.reduce((sum, a) => sum + a.bidAskSpread, 0) / assets.length)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Tempo Médio 1M</p>
                <p className="text-2xl font-bold">
                  {(assets.reduce((sum, a) => sum + a.timeToTrade1M, 0) / assets.length).toFixed(1)}min
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
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ativo Selecionado</label>
              <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assets.map(asset => (
                    <SelectItem key={asset.symbol} value={asset.symbol}>
                      {asset.symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Setor</label>
              <Select value={filterSector} onValueChange={setFilterSector}>
                <SelectTrigger>
                  <SelectValue />
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
                  <SelectItem value="liquidityScore">Score de Liquidez</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                  <SelectItem value="bidAskSpread">Spread</SelectItem>
                  <SelectItem value="impactCost">Custo de Impacto</SelectItem>
                  <SelectItem value="symbol">Símbolo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Liquidez Mínima</label>
              <Select value={minLiquidity.toString()} onValueChange={(value) => setMinLiquidity(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas</SelectItem>
                  <SelectItem value="40">Regular+</SelectItem>
                  <SelectItem value="60">Boa+</SelectItem>
                  <SelectItem value="80">Excelente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="detailed">Análise Detalhada</TabsTrigger>
          <TabsTrigger value="intraday">Intraday</TabsTrigger>
          <TabsTrigger value="comparison">Comparação</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liquidity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Liquidez</CardTitle>
                <CardDescription>
                  Classificação dos ativos por score de liquidez
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liquidityDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="count" name="Ativos">
                        {liquidityDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Top Liquid Assets */}
            <Card>
              <CardHeader>
                <CardTitle>Ativos Mais Líquidos</CardTitle>
                <CardDescription>
                  Top 10 por score de liquidez
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {assets
                    .sort((a, b) => b.liquidityScore - a.liquidityScore)
                    .slice(0, 10)
                    .map((asset, index) => (
                      <div key={asset.symbol} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium w-6">#{index + 1}</span>
                          <span className="font-semibold">{asset.symbol}</span>
                          <Badge variant="outline" className="text-xs">
                            {asset.sector}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getLiquidityIcon(asset.liquidityScore)}
                          <span className={`font-semibold ${getLiquidityColor(asset.liquidityScore)}`}>
                            {asset.liquidityScore.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assets Table */}
          <Card>
            <CardHeader>
              <CardTitle>Análise de Liquidez - Todos os Ativos</CardTitle>
              <CardDescription>
                {filteredAssets.length} ativos • Ordenado por {sortBy}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Símbolo</TableHead>
                      <TableHead>Setor</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Score Liquidez</TableHead>
                      <TableHead>Spread B/A</TableHead>
                      <TableHead>Turnover</TableHead>
                      <TableHead>Custo Impacto</TableHead>
                      <TableHead>Rating</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssets.slice(0, 20).map((asset) => (
                      <TableRow key={asset.symbol}>
                        <TableCell className="font-medium">{asset.symbol}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{asset.sector}</Badge>
                        </TableCell>
                        <TableCell>{formatCurrency(asset.price)}</TableCell>
                        <TableCell>{formatVolume(asset.volume)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getLiquidityIcon(asset.liquidityScore)}
                            <span className={getLiquidityColor(asset.liquidityScore)}>
                              {asset.liquidityScore.toFixed(1)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{formatPercent(asset.bidAskSpread)}</TableCell>
                        <TableCell>{formatPercent(asset.turnover)}</TableCell>
                        <TableCell>{formatPercent(asset.impactCost)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            asset.liquidityRating === 'Excelente' ? 'default' :
                            asset.liquidityRating === 'Boa' ? 'secondary' :
                            asset.liquidityRating === 'Regular' ? 'outline' : 'destructive'
                          }>
                            {asset.liquidityRating}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Analysis Tab */}
        <TabsContent value="detailed" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise Detalhada - {assetData.symbol}</CardTitle>
              <CardDescription>
                Métricas avançadas de liquidez e custos de transação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Métricas Básicas</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preço Atual:</span>
                      <span className="font-semibold">{formatCurrency(assetData.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume Diário:</span>
                      <span className="font-semibold">{formatVolume(assetData.volume)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Volume Médio 30d:</span>
                      <span className="font-semibold">{formatVolume(assetData.avgVolume30d)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Market Cap:</span>
                      <span className="font-semibold">{formatVolume(assetData.marketCap)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Liquidez</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score de Liquidez:</span>
                      <div className="flex items-center space-x-2">
                        {getLiquidityIcon(assetData.liquidityScore)}
                        <span className={`font-semibold ${getLiquidityColor(assetData.liquidityScore)}`}>
                          {assetData.liquidityScore.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spread Bid/Ask:</span>
                      <span className="font-semibold">{formatPercent(assetData.bidAskSpread)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Turnover:</span>
                      <span className="font-semibold">{formatPercent(assetData.turnover)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Profundidade:</span>
                      <span className="font-semibold">{formatVolume(assetData.marketDepth)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Custos de Transação</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Custo de Impacto:</span>
                      <span className="font-semibold">{formatPercent(assetData.impactCost)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo p/ 1M:</span>
                      <span className="font-semibold">{assetData.timeToTrade1M.toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo p/ 5M:</span>
                      <span className="font-semibold">{assetData.timeToTrade5M.toFixed(1)} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Rating:</span>
                      <Badge variant={
                        assetData.liquidityRating === 'Excelente' ? 'default' :
                        assetData.liquidityRating === 'Boa' ? 'secondary' :
                        assetData.liquidityRating === 'Regular' ? 'outline' : 'destructive'
                      }>
                        {assetData.liquidityRating}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Liquidity Score Breakdown */}
              <div className="mt-8">
                <h4 className="font-semibold text-lg mb-4">Composição do Score de Liquidez</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Volume (40%)</span>
                      <span className="text-sm">{Math.min(40, (assetData.volume / 1000000) * 4).toFixed(1)}/40</span>
                    </div>
                    <Progress value={Math.min(100, (assetData.volume / 1000000) * 10)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Spread (30%)</span>
                      <span className="text-sm">{Math.min(30, (1 / assetData.bidAskSpread) * 0.6).toFixed(1)}/30</span>
                    </div>
                    <Progress value={Math.min(100, (1 / assetData.bidAskSpread) * 2)} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Turnover (30%)</span>
                      <span className="text-sm">{Math.min(30, assetData.turnover * 3000).toFixed(1)}/30</span>
                    </div>
                    <Progress value={Math.min(100, assetData.turnover * 10000)} className="h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Intraday Tab */}
        <TabsContent value="intraday" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Liquidez Intraday - {selectedAsset}</CardTitle>
              <CardDescription>
                Padrões de liquidez ao longo do dia de negociação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={intradayData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis yAxisId="liquidity" />
                    <YAxis yAxisId="volume" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="liquidity"
                      type="monotone" 
                      dataKey="liquidity" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Score Liquidez"
                      dot={false}
                    />
                    <Line 
                      yAxisId="volume"
                      type="monotone" 
                      dataKey="volume" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      name="Volume"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Spread Intraday</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={intradayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatPercent(value), 'Spread']} />
                      <Line 
                        type="monotone" 
                        dataKey="spread" 
                        stroke="#f59e0b" 
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Número de Negócios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={intradayData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="trades" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Comparison Tab */}
        <TabsContent value="comparison" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Liquidez por Setor</CardTitle>
              <CardDescription>
                Análise comparativa entre diferentes setores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={assets}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="volume" 
                      name="Volume"
                      tickFormatter={(value) => formatVolume(value)}
                    />
                    <YAxis 
                      dataKey="liquidityScore" 
                      name="Score Liquidez"
                    />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'Volume' ? formatVolume(value) : value.toFixed(1),
                        name
                      ]}
                      labelFormatter={(label) => `${label}`}
                    />
                    <Legend />
                    <Scatter 
                      name="Ativos" 
                      data={assets} 
                      fill="#2563eb"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

