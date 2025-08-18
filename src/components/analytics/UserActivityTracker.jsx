import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Users, 
  Clock, 
  MousePointer, 
  Eye, 
  Smartphone,
  Monitor,
  Tablet,
  Globe,
  TrendingUp,
  Activity,
  RefreshCw,
  Calendar,
  MapPin
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
  Cell,
  Treemap
} from 'recharts'
import { MetricCard } from './MetricCard'

export function UserActivityTracker() {
  const [timeRange, setTimeRange] = useState('24h')
  const [activityData, setActivityData] = useState({
    activeUsers: 0,
    totalSessions: 0,
    avgSessionDuration: 0,
    bounceRate: 0,
    pageViews: 0,
    uniqueVisitors: 0
  })

  const [heatmapData, setHeatmapData] = useState([])
  const [deviceData, setDeviceData] = useState([])
  const [locationData, setLocationData] = useState([])
  const [popularPages, setPopularPages] = useState([])
  const [userJourney, setUserJourney] = useState([])
  const [realTimeUsers, setRealTimeUsers] = useState([])

  // Generate mock data
  useEffect(() => {
    const generateData = () => {
      // Activity metrics
      setActivityData({
        activeUsers: Math.floor(Math.random() * 50) + 100,
        totalSessions: Math.floor(Math.random() * 200) + 500,
        avgSessionDuration: Math.floor(Math.random() * 300) + 180, // seconds
        bounceRate: Math.floor(Math.random() * 30) + 25, // percentage
        pageViews: Math.floor(Math.random() * 1000) + 2000,
        uniqueVisitors: Math.floor(Math.random() * 100) + 300
      })

      // Heatmap data (hours of the day)
      const heatmap = []
      for (let hour = 0; hour < 24; hour++) {
        const activity = hour >= 8 && hour <= 22 ? 
          Math.floor(Math.random() * 80) + 20 : 
          Math.floor(Math.random() * 20) + 5
        
        heatmap.push({
          hour: `${hour.toString().padStart(2, '0')}:00`,
          activity,
          users: Math.floor(activity * 0.7)
        })
      }
      setHeatmapData(heatmap)

      // Device data
      setDeviceData([
        { name: 'Desktop', value: 45, fill: '#3B82F6', icon: Monitor },
        { name: 'Mobile', value: 35, fill: '#10B981', icon: Smartphone },
        { name: 'Tablet', value: 20, fill: '#F59E0B', icon: Tablet }
      ])

      // Location data
      setLocationData([
        { country: 'Brasil', users: 450, sessions: 680, flag: '🇧🇷' },
        { country: 'Estados Unidos', users: 120, sessions: 180, flag: '🇺🇸' },
        { country: 'Argentina', users: 80, sessions: 110, flag: '🇦🇷' },
        { country: 'Portugal', users: 60, sessions: 85, flag: '🇵🇹' },
        { country: 'México', users: 40, sessions: 55, flag: '🇲🇽' }
      ])

      // Popular pages
      setPopularPages([
        { path: '/', title: 'Home', views: 1250, uniqueViews: 890, avgTime: '2:45' },
        { path: '/screening', title: 'Screening', views: 980, uniqueViews: 720, avgTime: '4:20' },
        { path: '/analytics', title: 'Analytics', views: 650, uniqueViews: 480, avgTime: '3:15' },
        { path: '/settings', title: 'Configurações', views: 420, uniqueViews: 350, avgTime: '1:30' },
        { path: '/help', title: 'Ajuda', views: 280, uniqueViews: 240, avgTime: '2:10' }
      ])

      // User journey
      const journey = []
      const now = new Date()
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        journey.push({
          time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          newUsers: Math.floor(Math.random() * 20) + 5,
          returningUsers: Math.floor(Math.random() * 40) + 15,
          sessions: Math.floor(Math.random() * 60) + 20
        })
      }
      setUserJourney(journey)

      // Real-time users
      const realTime = []
      for (let i = 29; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 1000)
        realTime.push({
          time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          users: Math.floor(Math.random() * 30) + 10
        })
      }
      setRealTimeUsers(realTime)
    }

    generateData()
    const interval = setInterval(generateData, 30000)
    
    return () => clearInterval(interval)
  }, [timeRange])

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getDeviceIcon = (deviceName) => {
    const device = deviceData.find(d => d.name === deviceName)
    return device ? device.icon : Monitor
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Rastreamento de Atividade</h2>
          <p className="text-muted-foreground">
            Análise comportamental e engajamento dos usuários
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
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Real-time indicator */}
      <Card className="border-green-200 bg-green-50/50">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">Usuários Online Agora</span>
              </div>
              <Badge className="bg-green-100 text-green-800">
                {activityData.activeUsers} ativos
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              Atualizado em tempo real
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Usuários Únicos"
          value={activityData.uniqueVisitors}
          trend="+12%"
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Sessões Totais"
          value={activityData.totalSessions}
          trend="+8%"
          icon={Activity}
          color="green"
        />
        <MetricCard
          title="Duração Média"
          value={formatDuration(activityData.avgSessionDuration)}
          trend="+15%"
          icon={Clock}
          color="yellow"
        />
        <MetricCard
          title="Taxa de Rejeição"
          value={`${activityData.bounceRate}%`}
          trend="-5%"
          icon={TrendingUp}
          color={activityData.bounceRate > 50 ? "red" : "green"}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
          <TabsTrigger value="geography">Geografia</TabsTrigger>
          <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Usuários ao Longo do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={userJourney}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="newUsers" 
                      stackId="1"
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.6}
                      name="Novos Usuários"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="returningUsers" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Usuários Recorrentes"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Heatmap de Atividade (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={heatmapData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="activity" 
                      fill="#3B82F6"
                      name="Atividade"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Popular Pages */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Páginas Mais Visitadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {popularPages.map((page, index) => (
                  <div key={page.path} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{page.title}</div>
                        <div className="text-sm text-muted-foreground">{page.path}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{page.views.toLocaleString()} views</div>
                      <div className="text-sm text-muted-foreground">
                        {page.uniqueViews.toLocaleString()} únicos • {page.avgTime}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fluxo de Sessões</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={userJourney}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="sessions" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      name="Sessões"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métricas de Engajamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Páginas por Sessão</span>
                    <span className="text-2xl font-bold">3.2</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{width: '64%'}} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tempo na Página (avg)</span>
                    <span className="text-2xl font-bold">2:45</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{width: '55%'}} />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Taxa de Conversão</span>
                    <span className="text-2xl font-bold">12.5%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{width: '25%'}} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Journey Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Jornada do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Entrada</div>
                    <div className="text-sm text-muted-foreground">Landing Page</div>
                  </div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium">Engajamento</div>
                    <div className="text-sm text-muted-foreground">Screening</div>
                  </div>
                </div>
                <div className="text-2xl text-gray-400">→</div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium">Conversão</div>
                    <div className="text-sm text-muted-foreground">Analytics</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {deviceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {deviceData.map((entry, index) => {
                    const IconComponent = entry.icon
                    return (
                      <div key={index} className="flex items-center gap-2">
                        <IconComponent className="h-4 w-4" style={{ color: entry.fill }} />
                        <span className="text-sm">{entry.name}: {entry.value}%</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalhes por Dispositivo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {deviceData.map((device, index) => {
                    const IconComponent = device.icon
                    return (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <IconComponent className="h-5 w-5" style={{ color: device.fill }} />
                          <div>
                            <div className="font-medium">{device.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {Math.round(activityData.uniqueVisitors * device.value / 100)} usuários
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold">{device.value}%</div>
                          <div className="text-sm text-muted-foreground">do tráfego</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="geography" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Usuários por Localização
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {locationData.map((location, index) => (
                  <div key={location.country} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{location.flag}</span>
                      <div>
                        <div className="font-medium">{location.country}</div>
                        <div className="text-sm text-muted-foreground">
                          {location.sessions} sessões
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{location.users}</div>
                      <div className="text-sm text-muted-foreground">usuários</div>
                    </div>
                    <div className="w-20 bg-gray-200 rounded-full h-2 ml-4">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(location.users / locationData[0].users) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Usuários em Tempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={realTimeUsers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Usuários Ativos"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Live Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Feed de Atividade ao Vivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[...Array(10)].map((_, index) => (
                  <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <div className="flex-1">
                      <span className="text-sm">
                        Usuário de <strong>São Paulo</strong> visitou <strong>/screening</strong>
                      </span>
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(Math.random() * 60)} segundos atrás
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
