import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Clock,
  Ban,
  Activity,
  RefreshCw,
  Zap,
  Users
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

export function RateLimitingDashboard() {
  const [rateLimitConfig, setRateLimitConfig] = useState({
    enabled: true,
    requestsPerMinute: 100,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 150,
    blockDuration: 300, // seconds
    whitelistEnabled: true,
    autoBlock: true
  })

  const [rateLimitData, setRateLimitData] = useState({
    currentRequests: 0,
    blockedRequests: 0,
    allowedRequests: 0,
    activeBlocks: 0,
    topBlockedIPs: [],
    requestsOverTime: [],
    blockingHistory: []
  })

  const [blockedIPs, setBlockedIPs] = useState([])
  const [whitelist, setWhitelist] = useState([])

  // Generate mock data
  useEffect(() => {
    const generateData = () => {
      const now = new Date()
      const requestsData = []
      const blockingData = []
      
      for (let i = 23; i >= 0; i--) {
        const time = new Date(now.getTime() - i * 60 * 60 * 1000)
        requestsData.push({
          time: time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          allowed: Math.floor(Math.random() * 80) + 20,
          blocked: Math.floor(Math.random() * 20) + 5,
          total: 0
        })
      }
      
      requestsData.forEach(item => {
        item.total = item.allowed + item.blocked
      })

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        blockingData.push({
          date: date.toLocaleDateString('pt-BR', { weekday: 'short' }),
          blocks: Math.floor(Math.random() * 50) + 10,
          unblocks: Math.floor(Math.random() * 40) + 5
        })
      }

      const topIPs = [
        { ip: '192.168.1.100', requests: 1250, blocked: 45, country: 'BR' },
        { ip: '10.0.0.50', requests: 890, blocked: 23, country: 'US' },
        { ip: '172.16.0.25', requests: 650, blocked: 12, country: 'BR' },
        { ip: '203.0.113.10', requests: 420, blocked: 8, country: 'UK' },
        { ip: '198.51.100.5', requests: 280, blocked: 5, country: 'CA' }
      ]

      setRateLimitData({
        currentRequests: Math.floor(Math.random() * 80) + 20,
        blockedRequests: Math.floor(Math.random() * 15) + 5,
        allowedRequests: Math.floor(Math.random() * 200) + 100,
        activeBlocks: Math.floor(Math.random() * 10) + 2,
        topBlockedIPs: topIPs,
        requestsOverTime: requestsData,
        blockingHistory: blockingData
      })

      // Mock blocked IPs
      setBlockedIPs([
        { ip: '192.168.1.200', reason: 'Excesso de requests', blockedAt: new Date(now.getTime() - 30000), expiresAt: new Date(now.getTime() + 270000) },
        { ip: '10.0.0.75', reason: 'Comportamento suspeito', blockedAt: new Date(now.getTime() - 120000), expiresAt: new Date(now.getTime() + 180000) },
        { ip: '172.16.0.100', reason: 'Rate limit excedido', blockedAt: new Date(now.getTime() - 60000), expiresAt: new Date(now.getTime() + 240000) }
      ])

      // Mock whitelist
      setWhitelist([
        { ip: '192.168.1.1', description: 'Gateway principal', addedAt: new Date(now.getTime() - 86400000) },
        { ip: '10.0.0.1', description: 'Servidor de monitoramento', addedAt: new Date(now.getTime() - 172800000) },
        { ip: '172.16.0.1', description: 'Load balancer', addedAt: new Date(now.getTime() - 259200000) }
      ])
    }

    generateData()
    const interval = setInterval(generateData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const handleConfigChange = (key, value) => {
    setRateLimitConfig(prev => ({ ...prev, [key]: value }))
  }

  const handleUnblockIP = (ip) => {
    setBlockedIPs(prev => prev.filter(item => item.ip !== ip))
  }

  const handleAddToWhitelist = (ip) => {
    const newEntry = {
      ip,
      description: 'Adicionado manualmente',
      addedAt: new Date()
    }
    setWhitelist(prev => [...prev, newEntry])
    handleUnblockIP(ip)
  }

  const handleRemoveFromWhitelist = (ip) => {
    setWhitelist(prev => prev.filter(item => item.ip !== ip))
  }

  const utilizationPercentage = Math.round((rateLimitData.currentRequests / rateLimitConfig.requestsPerMinute) * 100)

  const statusData = [
    { name: 'Permitidos', value: rateLimitData.allowedRequests, fill: '#10B981' },
    { name: 'Bloqueados', value: rateLimitData.blockedRequests, fill: '#EF4444' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Rate Limiting</h2>
          <p className="text-muted-foreground">
            Controle e monitoramento de limites de requisições
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={rateLimitConfig.enabled ? "default" : "secondary"}
            className={rateLimitConfig.enabled ? "bg-green-100 text-green-800" : ""}
          >
            <Shield className="h-4 w-4 mr-1" />
            {rateLimitConfig.enabled ? 'Ativo' : 'Inativo'}
          </Badge>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Status Alert */}
      {utilizationPercentage > 80 && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Atenção:</strong> Utilização do rate limit em {utilizationPercentage}%. 
            Considere ajustar os limites se necessário.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Requests/min Atual"
          value={rateLimitData.currentRequests}
          subtitle={`Limite: ${rateLimitConfig.requestsPerMinute}`}
          trend={utilizationPercentage > 50 ? "+15%" : "stable"}
          icon={Activity}
          color={utilizationPercentage > 80 ? "red" : "blue"}
        />
        <MetricCard
          title="Requests Bloqueados"
          value={rateLimitData.blockedRequests}
          trend="-8%"
          icon={Ban}
          color="red"
        />
        <MetricCard
          title="IPs Bloqueados"
          value={rateLimitData.activeBlocks}
          trend="stable"
          icon={Shield}
          color="yellow"
        />
        <MetricCard
          title="Taxa de Sucesso"
          value={`${Math.round((rateLimitData.allowedRequests / (rateLimitData.allowedRequests + rateLimitData.blockedRequests)) * 100)}%`}
          trend="+2%"
          icon={CheckCircle}
          color="green"
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="blocked">IPs Bloqueados</TabsTrigger>
          <TabsTrigger value="whitelist">Whitelist</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Requests ao Longo do Tempo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={rateLimitData.requestsOverTime}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Area 
                      type="monotone" 
                      dataKey="allowed" 
                      stackId="1"
                      stroke="#10B981" 
                      fill="#10B981" 
                      fillOpacity={0.6}
                      name="Permitidos"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="blocked" 
                      stackId="1"
                      stroke="#EF4444" 
                      fill="#EF4444" 
                      fillOpacity={0.6}
                      name="Bloqueados"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ban className="h-5 w-5" />
                  Histórico de Bloqueios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={rateLimitData.blockingHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="blocks" fill="#EF4444" name="Bloqueios" />
                    <Bar dataKey="unblocks" fill="#10B981" name="Desbloqueios" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Status</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-4">
                  {statusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.fill }}
                      />
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top IPs com Mais Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rateLimitData.topBlockedIPs?.slice(0, 5).map((item, index) => (
                    <div key={item.ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-mono">{item.ip}</div>
                        <Badge variant="outline" className="text-xs">
                          {item.country}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{item.requests} requests</div>
                        <div className="text-xs text-red-600">{item.blocked} bloqueados</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blocked" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ban className="h-5 w-5" />
                IPs Atualmente Bloqueados ({blockedIPs.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {blockedIPs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  Nenhum IP bloqueado no momento
                </div>
              ) : (
                <div className="space-y-3">
                  {blockedIPs.map((item) => (
                    <div key={item.ip} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-mono text-sm font-medium">{item.ip}</div>
                        <div className="text-xs text-muted-foreground">{item.reason}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Bloqueado: {item.blockedAt.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right text-xs">
                          <div>Expira em:</div>
                          <div className="font-medium">
                            {Math.round((item.expiresAt.getTime() - Date.now()) / 60000)}min
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUnblockIP(item.ip)}
                        >
                          Desbloquear
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddToWhitelist(item.ip)}
                        >
                          + Whitelist
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whitelist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                IPs na Whitelist ({whitelist.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Add IP Form */}
                <div className="flex gap-2">
                  <Input placeholder="192.168.1.100" className="flex-1" />
                  <Input placeholder="Descrição (opcional)" className="flex-1" />
                  <Button>Adicionar</Button>
                </div>

                {/* Whitelist Items */}
                <div className="space-y-3">
                  {whitelist.map((item) => (
                    <div key={item.ip} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-mono text-sm font-medium">{item.ip}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                        <div className="text-xs text-muted-foreground">
                          Adicionado: {item.addedAt.toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveFromWhitelist(item.ip)}
                      >
                        Remover
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurações de Rate Limiting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable */}
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-medium">Rate Limiting Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar ou desativar o sistema de rate limiting
                  </p>
                </div>
                <Switch
                  checked={rateLimitConfig.enabled}
                  onCheckedChange={(checked) => handleConfigChange('enabled', checked)}
                />
              </div>

              {/* Limits Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Requests por Minuto</Label>
                  <Input
                    type="number"
                    value={rateLimitConfig.requestsPerMinute}
                    onChange={(e) => handleConfigChange('requestsPerMinute', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requests por Hora</Label>
                  <Input
                    type="number"
                    value={rateLimitConfig.requestsPerHour}
                    onChange={(e) => handleConfigChange('requestsPerHour', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requests por Dia</Label>
                  <Input
                    type="number"
                    value={rateLimitConfig.requestsPerDay}
                    onChange={(e) => handleConfigChange('requestsPerDay', parseInt(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Limite de Burst</Label>
                  <Input
                    type="number"
                    value={rateLimitConfig.burstLimit}
                    onChange={(e) => handleConfigChange('burstLimit', parseInt(e.target.value))}
                  />
                </div>
              </div>

              {/* Block Duration */}
              <div className="space-y-2">
                <Label>Duração do Bloqueio (segundos)</Label>
                <Input
                  type="number"
                  value={rateLimitConfig.blockDuration}
                  onChange={(e) => handleConfigChange('blockDuration', parseInt(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Tempo que um IP permanece bloqueado após exceder o limite
                </p>
              </div>

              {/* Additional Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Whitelist Ativa</Label>
                    <p className="text-sm text-muted-foreground">
                      IPs na whitelist não são afetados pelo rate limiting
                    </p>
                  </div>
                  <Switch
                    checked={rateLimitConfig.whitelistEnabled}
                    onCheckedChange={(checked) => handleConfigChange('whitelistEnabled', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Bloqueio Automático</Label>
                    <p className="text-sm text-muted-foreground">
                      Bloquear automaticamente IPs que excedem os limites
                    </p>
                  </div>
                  <Switch
                    checked={rateLimitConfig.autoBlock}
                    onCheckedChange={(checked) => handleConfigChange('autoBlock', checked)}
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4">
                <Button className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Salvar Configurações
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
