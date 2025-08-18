import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  BarChart3, 
  TrendingUp, 
  AlertCircle, 
  Gauge, 
  Activity, 
  Clock, 
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { MetricCard } from './MetricCard'

// Mock data generator for demonstration
const generateMockData = () => {
  const now = new Date()
  const data = []
  
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000)
    data.push({
      time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      requests: Math.floor(Math.random() * 100) + 20,
      responseTime: Math.floor(Math.random() * 200) + 100,
      errors: Math.floor(Math.random() * 5),
      quota: Math.max(0, 100 - (i * 2) - Math.floor(Math.random() * 10))
    })
  }
  
  return data
}

const endpointData = [
  { name: '/api/screening', requests: 1250, avgTime: 180, errors: 2 },
  { name: '/api/options', requests: 890, avgTime: 220, errors: 1 },
  { name: '/api/assets', requests: 650, avgTime: 150, errors: 0 },
  { name: '/api/quotes', requests: 420, avgTime: 95, errors: 3 },
  { name: '/api/history', requests: 280, avgTime: 340, errors: 1 }
]

const statusColors = {
  connected: '#10B981',
  degraded: '#F59E0B', 
  disconnected: '#EF4444'
}

export function APIMetricsDashboard() {
  const [timeRange, setTimeRange] = useState('24h')
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
  // Simulate API data fetching
  const { data: metrics, isLoading, refetch } = useQuery({
    queryKey: ['api-metrics', timeRange],
    queryFn: async () => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const chartData = generateMockData()
      const latest = chartData[chartData.length - 1]
      
      return {
        requestsToday: 3420,
        requestsThisMonth: 89650,
        averageResponseTime: 185,
        minResponseTime: 95,
        maxResponseTime: 450,
        errorRate: 1.2,
        quotaUsed: 65,
        quotaRemaining: 35,
        quotaTotal: 10000,
        connectionStatus: Math.random() > 0.1 ? 'connected' : 'degraded',
        peakUsageHour: '14:00',
        chartData,
        endpoints: endpointData,
        lastUpdated: new Date()
      }
    },
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 25000
  })

  const handleExport = () => {
    if (!metrics) return
    
    const exportData = {
      timestamp: new Date().toISOString(),
      timeRange,
      summary: {
        requestsToday: metrics.requestsToday,
        requestsThisMonth: metrics.requestsThisMonth,
        averageResponseTime: metrics.averageResponseTime,
        errorRate: metrics.errorRate,
        quotaUsage: `${metrics.quotaUsed}%`
      },
      chartData: metrics.chartData,
      endpoints: metrics.endpoints
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `api-metrics-${timeRange}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Dashboard de Métricas API</h2>
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Métricas API</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real da API OpLab
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Última Hora</SelectItem>
              <SelectItem value="24h">Últimas 24h</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                {metrics?.connectionStatus === 'connected' ? (
                  <Wifi className="h-5 w-5 text-green-600" />
                ) : metrics?.connectionStatus === 'degraded' ? (
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                ) : (
                  <WifiOff className="h-5 w-5 text-red-600" />
                )}
                <Badge 
                  variant={metrics?.connectionStatus === 'connected' ? 'default' : 'destructive'}
                  className={
                    metrics?.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                    metrics?.connectionStatus === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }
                >
                  {metrics?.connectionStatus === 'connected' ? 'Conectado' :
                   metrics?.connectionStatus === 'degraded' ? 'Degradado' : 'Desconectado'}
                </Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Última atualização: {metrics?.lastUpdated?.toLocaleTimeString('pt-BR')}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Auto-refresh:</span>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? 'Ativo' : 'Inativo'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Requests Hoje"
          value={metrics?.requestsToday?.toLocaleString() || '0'}
          trend="+12%"
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          title="Tempo Médio"
          value={`${metrics?.averageResponseTime || 0}ms`}
          trend="-5%"
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="Taxa de Erro"
          value={`${metrics?.errorRate || 0}%`}
          trend="-2%"
          icon={AlertCircle}
          color={metrics?.errorRate > 5 ? "red" : "green"}
        />
        <MetricCard
          title="Quota Restante"
          value={`${metrics?.quotaRemaining || 0}%`}
          trend="stable"
          icon={Gauge}
          color={metrics?.quotaRemaining < 20 ? "red" : "blue"}
        />
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Uso da API</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
          <TabsTrigger value="quota">Quota</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Requests por Hora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={metrics?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="requests" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.1}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tempo de Resposta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics?.chartData || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="responseTime" 
                    stroke="#10B981" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Endpoints Mais Utilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics?.endpoints?.map((endpoint, index) => (
                  <div key={endpoint.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{endpoint.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {endpoint.requests} requests • {endpoint.avgTime}ms avg
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {endpoint.errors > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {endpoint.errors} erros
                        </Badge>
                      )}
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${(endpoint.requests / 1250) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quota" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uso da Quota</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Usado</span>
                    <span>{metrics?.quotaUsed}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full ${
                        metrics?.quotaUsed > 80 ? 'bg-red-600' :
                        metrics?.quotaUsed > 60 ? 'bg-yellow-600' : 'bg-green-600'
                      }`}
                      style={{ width: `${metrics?.quotaUsed}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>0</span>
                    <span>{metrics?.quotaTotal} requests/mês</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Estatísticas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Requests este mês</span>
                    <span className="font-medium">{metrics?.requestsThisMonth?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Horário de pico</span>
                    <span className="font-medium">{metrics?.peakUsageHour}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo min/max</span>
                    <span className="font-medium">{metrics?.minResponseTime}ms / {metrics?.maxResponseTime}ms</span>
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

