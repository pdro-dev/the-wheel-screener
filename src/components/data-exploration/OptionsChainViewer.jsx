import React, { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign,
  Volume2,
  Activity,
  Target,
  Zap,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Slider } from '@/components/ui/slider'

// Generate mock options chain data
const generateOptionsChain = (underlyingPrice = 100, symbol = 'PETR4') => {
  const expirations = [
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 1 month
    new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 2 months
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months
  ]

  const strikes = []
  for (let i = -10; i <= 10; i++) {
    strikes.push(underlyingPrice + (i * 5))
  }

  const options = []
  
  expirations.forEach((expiration, expIndex) => {
    const daysToExpiry = Math.ceil((expiration - new Date()) / (1000 * 60 * 60 * 24))
    
    strikes.forEach((strike, strikeIndex) => {
      const isITM = strike < underlyingPrice
      const moneyness = Math.abs(strike - underlyingPrice) / underlyingPrice
      
      // Call option
      const callPrice = Math.max(0.1, (underlyingPrice - strike) + (5 * Math.exp(-moneyness * 2)) * Math.sqrt(daysToExpiry / 365))
      const callVolume = Math.floor(Math.random() * 10000) + 100
      const callOI = Math.floor(Math.random() * 50000) + 500
      const callIV = 0.15 + Math.random() * 0.3 + (moneyness * 0.2)
      
      // Put option
      const putPrice = Math.max(0.1, (strike - underlyingPrice) + (5 * Math.exp(-moneyness * 2)) * Math.sqrt(daysToExpiry / 365))
      const putVolume = Math.floor(Math.random() * 8000) + 100
      const putOI = Math.floor(Math.random() * 40000) + 500
      const putIV = 0.15 + Math.random() * 0.3 + (moneyness * 0.2)

      options.push({
        id: `${symbol}_${expIndex}_${strikeIndex}_C`,
        symbol,
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
        delta: isITM ? 0.6 + Math.random() * 0.3 : 0.1 + Math.random() * 0.4,
        gamma: 0.01 + Math.random() * 0.05,
        theta: -(0.01 + Math.random() * 0.05),
        vega: 0.1 + Math.random() * 0.3,
        rho: 0.01 + Math.random() * 0.05,
        isITM,
        moneyness
      })

      options.push({
        id: `${symbol}_${expIndex}_${strikeIndex}_P`,
        symbol,
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
        delta: isITM ? -(0.6 + Math.random() * 0.3) : -(0.1 + Math.random() * 0.4),
        gamma: 0.01 + Math.random() * 0.05,
        theta: -(0.01 + Math.random() * 0.05),
        vega: 0.1 + Math.random() * 0.3,
        rho: -(0.01 + Math.random() * 0.05),
        isITM: !isITM,
        moneyness
      })
    })
  })

  return options
}

export function OptionsChainViewer() {
  const [underlyingSymbol, setUnderlyingSymbol] = useState('PETR4')
  const [underlyingPrice] = useState(28.50)
  const [options] = useState(() => generateOptionsChain(28.50, 'PETR4'))
  const [selectedExpiration, setSelectedExpiration] = useState('all')
  const [minVolume, setMinVolume] = useState([0])
  const [maxStrike, setMaxStrike] = useState([50])
  const [viewMode, setViewMode] = useState('chain') // chain, heatmap, analytics
  const [optionType, setOptionType] = useState('all') // all, calls, puts

  // Get unique expiration dates
  const expirations = useMemo(() => {
    const unique = [...new Set(options.map(opt => opt.expiration.toISOString().split('T')[0]))]
    return unique.sort()
  }, [options])

  // Filter options
  const filteredOptions = useMemo(() => {
    let filtered = options

    if (selectedExpiration !== 'all') {
      filtered = filtered.filter(opt => 
        opt.expiration.toISOString().split('T')[0] === selectedExpiration
      )
    }

    if (optionType !== 'all') {
      filtered = filtered.filter(opt => 
        optionType === 'calls' ? opt.type === 'CALL' : opt.type === 'PUT'
      )
    }

    filtered = filtered.filter(opt => 
      opt.volume >= minVolume[0] && opt.strike <= maxStrike[0]
    )

    return filtered
  }, [options, selectedExpiration, optionType, minVolume, maxStrike])

  // Group options by strike for chain view
  const optionsChain = useMemo(() => {
    const grouped = {}
    
    filteredOptions.forEach(option => {
      if (!grouped[option.strike]) {
        grouped[option.strike] = { strike: option.strike, call: null, put: null }
      }
      
      if (option.type === 'CALL') {
        grouped[option.strike].call = option
      } else {
        grouped[option.strike].put = option
      }
    })

    return Object.values(grouped).sort((a, b) => a.strike - b.strike)
  }, [filteredOptions])

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
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`
    }
    return value.toString()
  }

  // Get color for moneyness
  const getMoneynessColor = (option, isCall = true) => {
    if (!option) return 'bg-gray-50'
    
    if (option.isITM) {
      return isCall ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
    } else {
      return isCall ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
    }
  }

  // Export data
  const handleExport = () => {
    const csvContent = [
      ['Tipo', 'Strike', 'Vencimento', 'Preço', 'Bid', 'Ask', 'Volume', 'OI', 'IV', 'Delta', 'Gamma', 'Theta'].join(','),
      ...filteredOptions.map(opt => [
        opt.type,
        opt.strike,
        opt.expiration.toISOString().split('T')[0],
        opt.price.toFixed(2),
        opt.bid.toFixed(2),
        opt.ask.toFixed(2),
        opt.volume,
        opt.openInterest,
        opt.impliedVolatility.toFixed(4),
        opt.delta.toFixed(4),
        opt.gamma.toFixed(4),
        opt.theta.toFixed(4)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `options-chain-${underlyingSymbol}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Options Chain Viewer</h2>
          <p className="text-muted-foreground">
            Analise cadeias de opções com dados em tempo real
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

      {/* Underlying Info */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h3 className="text-2xl font-bold">{underlyingSymbol}</h3>
                <p className="text-muted-foreground">Ativo Subjacente</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-600">{formatCurrency(underlyingPrice)}</p>
                <p className="text-sm text-green-600 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  +2.15% (+R$ 0,60)
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Volume</p>
                <p className="text-lg font-semibold">2.5M</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">IV Média</p>
                <p className="text-lg font-semibold">28.5%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Opções</p>
                <p className="text-lg font-semibold">{filteredOptions.length}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div>
              <label className="text-sm font-medium mb-2 block">Vencimento</label>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo</label>
              <Select value={optionType} onValueChange={setOptionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Calls e Puts</SelectItem>
                  <SelectItem value="calls">Apenas Calls</SelectItem>
                  <SelectItem value="puts">Apenas Puts</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Volume Mínimo</label>
              <div className="space-y-2">
                <Slider
                  value={minVolume}
                  onValueChange={setMinVolume}
                  min={0}
                  max={10000}
                  step={100}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">{formatVolume(minVolume[0])}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Strike Máximo</label>
              <div className="space-y-2">
                <Slider
                  value={maxStrike}
                  onValueChange={setMaxStrike}
                  min={20}
                  max={60}
                  step={5}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">{formatCurrency(maxStrike[0])}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* View Mode Tabs */}
      <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chain" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Cadeia
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Heatmap
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Chain View */}
        <TabsContent value="chain">
          <Card>
            <CardHeader>
              <CardTitle>Cadeia de Opções</CardTitle>
              <CardDescription>
                {filteredOptions.length} opções • Preço atual: {formatCurrency(underlyingPrice)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-center" colSpan={6}>CALLS</TableHead>
                      <TableHead className="text-center">STRIKE</TableHead>
                      <TableHead className="text-center" colSpan={6}>PUTS</TableHead>
                    </TableRow>
                    <TableRow>
                      <TableHead>Bid</TableHead>
                      <TableHead>Ask</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>OI</TableHead>
                      <TableHead>IV</TableHead>
                      <TableHead className="text-center font-bold">Strike</TableHead>
                      <TableHead>IV</TableHead>
                      <TableHead>OI</TableHead>
                      <TableHead>Volume</TableHead>
                      <TableHead>Preço</TableHead>
                      <TableHead>Ask</TableHead>
                      <TableHead>Bid</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {optionsChain.map((row) => (
                      <TableRow key={row.strike}>
                        {/* CALLS */}
                        <TableCell className={row.call ? getMoneynessColor(row.call, true) : ''}>
                          {row.call ? formatCurrency(row.call.bid) : '-'}
                        </TableCell>
                        <TableCell className={row.call ? getMoneynessColor(row.call, true) : ''}>
                          {row.call ? formatCurrency(row.call.ask) : '-'}
                        </TableCell>
                        <TableCell className={row.call ? getMoneynessColor(row.call, true) : ''}>
                          {row.call ? (
                            <span className="font-semibold">{formatCurrency(row.call.price)}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className={row.call ? getMoneynessColor(row.call, true) : ''}>
                          {row.call ? formatVolume(row.call.volume) : '-'}
                        </TableCell>
                        <TableCell className={row.call ? getMoneynessColor(row.call, true) : ''}>
                          {row.call ? formatVolume(row.call.openInterest) : '-'}
                        </TableCell>
                        <TableCell className={row.call ? getMoneynessColor(row.call, true) : ''}>
                          {row.call ? formatPercent(row.call.impliedVolatility) : '-'}
                        </TableCell>

                        {/* STRIKE */}
                        <TableCell className="text-center font-bold bg-gray-100">
                          {formatCurrency(row.strike)}
                        </TableCell>

                        {/* PUTS */}
                        <TableCell className={row.put ? getMoneynessColor(row.put, false) : ''}>
                          {row.put ? formatPercent(row.put.impliedVolatility) : '-'}
                        </TableCell>
                        <TableCell className={row.put ? getMoneynessColor(row.put, false) : ''}>
                          {row.put ? formatVolume(row.put.openInterest) : '-'}
                        </TableCell>
                        <TableCell className={row.put ? getMoneynessColor(row.put, false) : ''}>
                          {row.put ? formatVolume(row.put.volume) : '-'}
                        </TableCell>
                        <TableCell className={row.put ? getMoneynessColor(row.put, false) : ''}>
                          {row.put ? (
                            <span className="font-semibold">{formatCurrency(row.put.price)}</span>
                          ) : '-'}
                        </TableCell>
                        <TableCell className={row.put ? getMoneynessColor(row.put, false) : ''}>
                          {row.put ? formatCurrency(row.put.ask) : '-'}
                        </TableCell>
                        <TableCell className={row.put ? getMoneynessColor(row.put, false) : ''}>
                          {row.put ? formatCurrency(row.put.bid) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Heatmap View */}
        <TabsContent value="heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Heatmap de Volatilidade Implícita</CardTitle>
              <CardDescription>
                Visualização da volatilidade implícita por strike e vencimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Heatmap em desenvolvimento</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Esta funcionalidade será implementada na próxima versão
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics View */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Calls Volume:</span>
                    <span className="font-semibold">
                      {formatVolume(filteredOptions.filter(o => o.type === 'CALL').reduce((sum, o) => sum + o.volume, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Puts Volume:</span>
                    <span className="font-semibold">
                      {formatVolume(filteredOptions.filter(o => o.type === 'PUT').reduce((sum, o) => sum + o.volume, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Put/Call Ratio:</span>
                    <span className="font-semibold">
                      {(filteredOptions.filter(o => o.type === 'PUT').reduce((sum, o) => sum + o.volume, 0) /
                        filteredOptions.filter(o => o.type === 'CALL').reduce((sum, o) => sum + o.volume, 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Open Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Calls OI:</span>
                    <span className="font-semibold">
                      {formatVolume(filteredOptions.filter(o => o.type === 'CALL').reduce((sum, o) => sum + o.openInterest, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Puts OI:</span>
                    <span className="font-semibold">
                      {formatVolume(filteredOptions.filter(o => o.type === 'PUT').reduce((sum, o) => sum + o.openInterest, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Max Pain:</span>
                    <span className="font-semibold">{formatCurrency(underlyingPrice)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Greeks Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Portfolio Delta:</span>
                    <span className="font-semibold">
                      {(filteredOptions.reduce((sum, o) => sum + o.delta, 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Portfolio Gamma:</span>
                    <span className="font-semibold">
                      {(filteredOptions.reduce((sum, o) => sum + o.gamma, 0)).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Portfolio Theta:</span>
                    <span className="font-semibold">
                      {(filteredOptions.reduce((sum, o) => sum + o.theta, 0)).toFixed(4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Volatilidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>IV Média:</span>
                    <span className="font-semibold">
                      {formatPercent(filteredOptions.reduce((sum, o) => sum + o.impliedVolatility, 0) / filteredOptions.length)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>IV Mínima:</span>
                    <span className="font-semibold">
                      {formatPercent(Math.min(...filteredOptions.map(o => o.impliedVolatility)))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>IV Máxima:</span>
                    <span className="font-semibold">
                      {formatPercent(Math.max(...filteredOptions.map(o => o.impliedVolatility)))}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

