import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Activity, 
  Zap, 
  Eye, 
  Clock, 
  Cpu, 
  HardDrive,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend
} from 'recharts'
import { MetricCard } from './MetricCard'

export function PerformanceMonitor() {
  const [webVitals, setWebVitals] = useState({
    cls: 0.1,
    fid: 100,
    fcp: 1800,
    lcp: 2500,
    ttfb: 200
  })
  
  const [performanceData, setPerformanceData] = useState([])
  const [systemMetrics, setSystemMetrics] = useState({
    memoryUsage: 0,
    cpuUsage: 0,
    cacheHitRate: 0,
    errorCount: 0,
    activeUsers: 0
  })

  // Generate mock performance data
  useEffect(() => {
    const generateData = () => {
      const now = new Date()
      const data = []
      
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000)
        data.push({
          time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          pageLoad: Math.floor(Math.random() * 1000) + 500,
          apiResponse: Math.floor(Math.random() * 300) + 100,
          renderTime: Math.floor(Math.random() * 200) + 50,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          cpuUsage: Math.floor(Math.random() * 40) + 20
        })
      }
      
      setPerformanceData(data)
    }

    generateData()
    const interval = setInterval(generateData, 30000) // Update every 30s
    
    return () => clearInterval(interval)
  }, [])

  // Update system metrics
  useEffect(() => {
    const updateMetrics = () => {
      setSystemMetrics({
        memoryUsage: Math.floor(Math.random() * 30) + 50,
        cpuUsage: Math.floor(Math.random() * 40) + 25,
        cacheHitRate: Math.floor(Math.random() * 20) + 75,
        errorCount: Math.floor(Math.random() * 5),
        activeUsers: Math.floor(Math.random() * 50) + 100
      })
    }

    updateMetrics()
    const interval = setInterval(updateMetrics, 10000) // Update every 10s
    
    return () => clearInterval(interval)
  }, [])

  const getVitalStatus = (metric, value) => {
    const thresholds = {
      cls: { good: 0.1, poor: 0.25 },
      fid: { good: 100, poor: 300 },
      fcp: { good: 1800, poor: 3000 },
      lcp: { good: 2500, poor: 4000 },
      ttfb: { good: 800, poor: 1800 }
    }
    
    if (!value || !thresholds[metric]) return 'unknown'
    
    const threshold = thresholds[metric]
    if (value <= threshold.good) return 'good'
    if (value <= threshold.poor) return 'needs-improvement'
    return 'poor'
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return 'green'
      case 'needs-improvement': return 'yellow'
      case 'poor': return 'red'
      default: return 'gray'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good': return <CheckCircle className="h-4 w-4" />
      case 'needs-improvement': return <AlertTriangle className="h-4 w-4" />
      case 'poor': return <AlertTriangle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const webVitalsData = [
    {
      name: 'CLS',
      value: webVitals.cls || 0,
      fullName: 'Cumulative Layout Shift',
      description: 'Estabilidade visual da página',
      unit: '',
      status: getVitalStatus('cls', webVitals.cls)
    },
    {
      name: 'FID',
      value: webVitals.fid || 0,
      fullName: 'First Input Delay',
      description: 'Tempo de resposta à primeira interação',
      unit: 'ms',
      status: getVitalStatus('fid', webVitals.fid)
    },
    {
      name: 'FCP',
      value: webVitals.fcp || 0,
      fullName: 'First Contentful Paint',
      description: 'Tempo para primeiro conteúdo aparecer',
      unit: 'ms',
      status: getVitalStatus('fcp', webVitals.fcp)
    },
    {
      name: 'LCP',
      value: webVitals.lcp || 0,
      fullName: 'Largest Contentful Paint',
      description: 'Tempo para maior elemento aparecer',
      unit: 'ms',
      status: getVitalStatus('lcp', webVitals.lcp)
    },
    {
      name: 'TTFB',
      value: webVitals.ttfb || 0,
      fullName: 'Time to First Byte',
      description: 'Tempo para primeiro byte do servidor',
      unit: 'ms',
      status: getVitalStatus('ttfb', webVitals.ttfb)
    }
  ]

  const systemData = [
    { name: 'Memória', value: systemMetrics.memoryUsage, fill: '#3B82F6' },
    { name: 'CPU', value: systemMetrics.cpuUsage, fill: '#10B981' },
    { name: 'Cache Hit', value: systemMetrics.cacheHitRate, fill: '#F59E0B' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Monitor de Performance</h2>
          <p className="text-muted-foreground">
            Web Vitals e métricas de sistema em tempo real
          </p>
        </div>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Usuários Ativos"
          value={systemMetrics.activeUsers}
          trend="+8%"
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Uso de Memória"
          value={`${systemMetrics.memoryUsage}%`}
          trend="+2%"
          icon={HardDrive}
          color={systemMetrics.memoryUsage > 80 ? "red" : "green"}
        />
        <MetricCard
          title="Cache Hit Rate"
          value={`${systemMetrics.cacheHitRate}%`}
          trend="+5%"
          icon={Zap}
          color="green"
        />
        <MetricCard
          title="Erros (24h)"
          value={systemMetrics.errorCount}
          trend="-50%"
          icon={AlertTriangle}
          color={systemMetrics.errorCount > 0 ? "red" : "green"}
        />
      </div>

      <Tabs defaultValue="vitals" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="vitals" className="space-y-4">
          {/* Web Vitals Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {webVitalsData.map((vital) => (
              <Card key={vital.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">
                      {vital.name}
                    </CardTitle>
                    <Badge 
                      variant={vital.status === 'good' ? 'default' : 'destructive'}
                      className={`${
                        vital.status === 'good' ? 'bg-green-100 text-green-800' :
                        vital.status === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {getStatusIcon(vital.status)}
                      <span className="ml-1">
                        {vital.status === 'good' ? 'Bom' :
                         vital.status === 'needs-improvement' ? 'Precisa melhorar' : 'Ruim'}
                      </span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {vital.value ? vital.value.toFixed(vital.name === 'CLS' ? 3 : 0) : '—'}
                    <span className="text-sm font-normal text-muted-foreground ml-1">
                      {vital.unit}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {vital.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Web Vitals Explanation */}
          <Card>
            <CardHeader>
              <CardTitle>Sobre Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Métricas de Carregamento</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>FCP:</strong> Primeiro conteúdo visível</li>
                    <li>• <strong>LCP:</strong> Maior elemento carregado</li>
                    <li>• <strong>TTFB:</strong> Resposta do servidor</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Métricas de Interação</h4>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• <strong>FID:</strong> Responsividade à interação</li>
                    <li>• <strong>CLS:</strong> Estabilidade do layout</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Tempos de Carregamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="pageLoad" 
                      stroke="#3B82F6" 
                      name="Carregamento da Página (ms)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="apiResponse" 
                      stroke="#10B981" 
                      name="Resposta da API (ms)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Tempo de Renderização
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="renderTime" 
                      stroke="#F59E0B" 
                      fill="#F59E0B" 
                      fillOpacity={0.1}
                      name="Tempo de Render (ms)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Uso de Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RadialBarChart data={systemData}>
                    <RadialBar dataKey="value" cornerRadius={10} fill="#8884d8" />
                    <Legend />
                    <Tooltip />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Uso de CPU e Memória
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="cpuUsage" 
                      stackId="1"
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                      name="CPU (%)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="memoryUsage" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                      name="Memória (%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">99.9%</div>
                  <div className="text-sm text-muted-foreground">Uptime</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">1.2s</div>
                  <div className="text-sm text-muted-foreground">Tempo médio de resposta</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">85%</div>
                  <div className="text-sm text-muted-foreground">Performance Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
