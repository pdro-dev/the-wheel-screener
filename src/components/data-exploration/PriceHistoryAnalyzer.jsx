import React, { useState, useEffect, useMemo } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3,
  LineChart,
  CandlestickChart,
  Volume2,
  Target,
  Settings,
  Download,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LineChart as RechartsLineChart, 
  AreaChart,
  BarChart,
  Line, 
  Area,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ComposedChart
} from 'recharts'

// Generate mock price history data
const generatePriceHistory = (symbol = 'PETR4', days = 365) => {
  const data = []
  const startPrice = 25 + Math.random() * 10
  let currentPrice = startPrice
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate)
    date.setDate(date.getDate() + i)
    
    // Generate OHLCV data
    const change = (Math.random() - 0.5) * 0.1 * currentPrice
    const open = currentPrice
    const close = Math.max(0.1, currentPrice + change)
    const high = Math.max(open, close) * (1 + Math.random() * 0.05)
    const low = Math.min(open, close) * (1 - Math.random() * 0.05)
    const volume = 1000000 + Math.random() * 5000000

    // Technical indicators
    const sma20 = i >= 19 ? data.slice(Math.max(0, i - 19), i + 1).reduce((sum, d) => sum + d.close, 0) / Math.min(20, i + 1) : close
    const sma50 = i >= 49 ? data.slice(Math.max(0, i - 49), i + 1).reduce((sum, d) => sum + d.close, 0) / Math.min(50, i + 1) : close
    
    // RSI calculation (simplified)
    let rsi = 50
    if (i >= 14) {
      const gains = []
      const losses = []
      for (let j = Math.max(0, i - 13); j <= i; j++) {
        const change = j > 0 ? data[j - 1].close - (j > 1 ? data[j - 2].close : startPrice) : 0
        if (change > 0) gains.push(change)
        else losses.push(Math.abs(change))
      }
      const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / gains.length : 0
      const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / losses.length : 0
      rsi = avgLoss === 0 ? 100 : 100 - (100 / (1 + (avgGain / avgLoss)))
    }

    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      open,
      high,
      low,
      close,
      volume,
      sma20,
      sma50,
      rsi,
      change: close - open,
      changePercent: ((close - open) / open) * 100
    })

    currentPrice = close
  }

  return data
}

export function PriceHistoryAnalyzer() {
  const [symbol, setSymbol] = useState('PETR4')
  const [timeframe, setTimeframe] = useState('1D')
  const [period, setPeriod] = useState('1Y')
  const [chartType, setChartType] = useState('line')
  const [indicators, setIndicators] = useState(['sma20', 'sma50'])
  const [data] = useState(() => generatePriceHistory('PETR4', 365))

  // Filter data based on period
  const filteredData = useMemo(() => {
    const now = new Date()
    let startDate = new Date()

    switch (period) {
      case '1M':
        startDate.setMonth(now.getMonth() - 1)
        break
      case '3M':
        startDate.setMonth(now.getMonth() - 3)
        break
      case '6M':
        startDate.setMonth(now.getMonth() - 6)
        break
      case '1Y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      case '2Y':
        startDate.setFullYear(now.getFullYear() - 2)
        break
      default:
        startDate.setFullYear(now.getFullYear() - 1)
    }

    return data.filter(d => new Date(d.date) >= startDate)
  }, [data, period])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!filteredData.length) return {}

    const prices = filteredData.map(d => d.close)
    const volumes = filteredData.map(d => d.volume)
    const changes = filteredData.map(d => d.changePercent)

    const currentPrice = prices[prices.length - 1]
    const firstPrice = prices[0]
    const totalReturn = ((currentPrice - firstPrice) / firstPrice) * 100

    const high52w = Math.max(...prices)
    const low52w = Math.min(...prices)
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length

    // Volatility (standard deviation of returns)
    const avgReturn = changes.reduce((a, b) => a + b, 0) / changes.length
    const variance = changes.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / changes.length
    const volatility = Math.sqrt(variance) * Math.sqrt(252) // Annualized

    return {
      currentPrice,
      totalReturn,
      high52w,
      low52w,
      avgVolume,
      volatility,
      avgReturn
    }
  }, [filteredData])

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  // Format percentage
  const formatPercent = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
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

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold">{new Date(label).toLocaleDateString('pt-BR')}</p>
          <p className="text-sm">
            <span className="text-gray-600">Abertura:</span> {formatCurrency(data.open)}
          </p>
          <p className="text-sm">
            <span className="text-gray-600">Máxima:</span> {formatCurrency(data.high)}
          </p>
          <p className="text-sm">
            <span className="text-gray-600">Mínima:</span> {formatCurrency(data.low)}
          </p>
          <p className="text-sm">
            <span className="text-gray-600">Fechamento:</span> {formatCurrency(data.close)}
          </p>
          <p className="text-sm">
            <span className="text-gray-600">Volume:</span> {formatVolume(data.volume)}
          </p>
          <p className={`text-sm ${data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            <span className="text-gray-600">Variação:</span> {formatPercent(data.changePercent)}
          </p>
        </div>
      )
    }
    return null
  }

  // Export data
  const handleExport = () => {
    const csvContent = [
      ['Data', 'Abertura', 'Máxima', 'Mínima', 'Fechamento', 'Volume', 'SMA20', 'SMA50', 'RSI'].join(','),
      ...filteredData.map(d => [
        d.date,
        d.open.toFixed(2),
        d.high.toFixed(2),
        d.low.toFixed(2),
        d.close.toFixed(2),
        d.volume,
        d.sma20.toFixed(2),
        d.sma50.toFixed(2),
        d.rsi.toFixed(2)
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `price-history-${symbol}-${period}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Price History Analyzer</h2>
          <p className="text-muted-foreground">
            Análise técnica avançada com indicadores e padrões
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

      {/* Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ativo</label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PETR4">PETR4</SelectItem>
                  <SelectItem value="VALE3">VALE3</SelectItem>
                  <SelectItem value="ITUB4">ITUB4</SelectItem>
                  <SelectItem value="BBDC4">BBDC4</SelectItem>
                  <SelectItem value="ABEV3">ABEV3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Período</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1M">1 Mês</SelectItem>
                  <SelectItem value="3M">3 Meses</SelectItem>
                  <SelectItem value="6M">6 Meses</SelectItem>
                  <SelectItem value="1Y">1 Ano</SelectItem>
                  <SelectItem value="2Y">2 Anos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Timeframe</label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1D">1 Dia</SelectItem>
                  <SelectItem value="1W">1 Semana</SelectItem>
                  <SelectItem value="1M">1 Mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Gráfico</label>
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="line">Linha</SelectItem>
                  <SelectItem value="area">Área</SelectItem>
                  <SelectItem value="candlestick">Candlestick</SelectItem>
                  <SelectItem value="volume">Volume</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Indicadores</label>
              <Select value={indicators.join(',')} onValueChange={(value) => setIndicators(value.split(','))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sma20,sma50">SMA 20/50</SelectItem>
                  <SelectItem value="sma20">SMA 20</SelectItem>
                  <SelectItem value="sma50">SMA 50</SelectItem>
                  <SelectItem value="">Nenhum</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Preço Atual</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.currentPrice || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <BarChart3 className={`h-8 w-8 ${(stats.totalReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="text-sm font-medium">Retorno Total</p>
                <p className={`text-2xl font-bold ${(stats.totalReturn || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercent(stats.totalReturn || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm font-medium">Máx/Mín 52s</p>
                <p className="text-lg font-bold">
                  {formatCurrency(stats.high52w || 0)} / {formatCurrency(stats.low52w || 0)}
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
                <p className="text-2xl font-bold">{formatVolume(stats.avgVolume || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Price Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5" />
              {symbol} - {period}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' && (
                  <RechartsLineChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Preço"
                      dot={false}
                    />
                    {indicators.includes('sma20') && (
                      <Line 
                        type="monotone" 
                        dataKey="sma20" 
                        stroke="#f59e0b" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="SMA 20"
                        dot={false}
                      />
                    )}
                    {indicators.includes('sma50') && (
                      <Line 
                        type="monotone" 
                        dataKey="sma50" 
                        stroke="#ef4444" 
                        strokeWidth={1}
                        strokeDasharray="5 5"
                        name="SMA 50"
                        dot={false}
                      />
                    )}
                  </RechartsLineChart>
                )}

                {chartType === 'area' && (
                  <AreaChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    />
                    <YAxis 
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="close" 
                      stroke="#2563eb" 
                      fill="#2563eb"
                      fillOpacity={0.3}
                      name="Preço"
                    />
                  </AreaChart>
                )}

                {chartType === 'volume' && (
                  <ComposedChart data={filteredData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('pt-BR')}
                    />
                    <YAxis 
                      yAxisId="price"
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <YAxis 
                      yAxisId="volume" 
                      orientation="right"
                      tickFormatter={(value) => formatVolume(value)}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      yAxisId="price"
                      type="monotone" 
                      dataKey="close" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Preço"
                      dot={false}
                    />
                    <Bar 
                      yAxisId="volume"
                      dataKey="volume" 
                      fill="#64748b"
                      fillOpacity={0.3}
                      name="Volume"
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Technical Indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Indicadores Técnicos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* RSI */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">RSI (14)</span>
                  <Badge variant={
                    (filteredData[filteredData.length - 1]?.rsi || 50) > 70 ? 'destructive' :
                    (filteredData[filteredData.length - 1]?.rsi || 50) < 30 ? 'default' : 'secondary'
                  }>
                    {(filteredData[filteredData.length - 1]?.rsi || 50).toFixed(1)}
                  </Badge>
                </div>
                <div className="h-20">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={filteredData.slice(-30)}>
                      <YAxis domain={[0, 100]} hide />
                      <Line 
                        type="monotone" 
                        dataKey="rsi" 
                        stroke="#8b5cf6" 
                        strokeWidth={2}
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={() => 70} 
                        stroke="#ef4444" 
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        dot={false}
                      />
                      <Line 
                        type="monotone" 
                        dataKey={() => 30} 
                        stroke="#22c55e" 
                        strokeWidth={1}
                        strokeDasharray="3 3"
                        dot={false}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Volatility */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Volatilidade Anualizada</span>
                  <Badge variant="outline">
                    {formatPercent(stats.volatility || 0)}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Baseada nos últimos {filteredData.length} períodos
                </div>
              </div>

              {/* Support/Resistance */}
              <div>
                <h4 className="text-sm font-medium mb-3">Suporte e Resistência</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Resistência:</span>
                    <span className="font-medium text-red-600">
                      {formatCurrency(stats.high52w || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Suporte:</span>
                    <span className="font-medium text-green-600">
                      {formatCurrency(stats.low52w || 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Moving Averages */}
              <div>
                <h4 className="text-sm font-medium mb-3">Médias Móveis</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SMA 20:</span>
                    <span className="font-medium">
                      {formatCurrency(filteredData[filteredData.length - 1]?.sma20 || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">SMA 50:</span>
                    <span className="font-medium">
                      {formatCurrency(filteredData[filteredData.length - 1]?.sma50 || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

