import React, { useState, useEffect } from 'react'
import { 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  User,
  BarChart3,
  Activity,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useOpLabState } from '@/hooks/useOpLabAPI'

// Connection Status Component
export function ConnectionStatus({ compact = false }) {
  const { isOnline, isAuthenticated, lastError, token } = useOpLabState()

  const getStatus = () => {
    if (!isOnline) return { type: 'offline', label: 'Offline', icon: WifiOff }
    if (!token) return { type: 'no-token', label: 'Token não configurado', icon: AlertCircle }
    if (lastError) return { type: 'error', label: 'Erro na API', icon: AlertCircle }
    if (isAuthenticated) return { type: 'connected', label: 'Conectado', icon: CheckCircle }
    return { type: 'connecting', label: 'Conectando...', icon: Clock }
  }

  const status = getStatus()
  const StatusIcon = status.icon

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <StatusIcon className={`h-4 w-4 ${
          status.type === 'connected' ? 'text-green-500' :
          status.type === 'offline' || status.type === 'error' ? 'text-red-500' :
          'text-yellow-500'
        }`} />
        <span className={`text-sm ${
          status.type === 'connected' ? 'text-green-600' :
          status.type === 'offline' || status.type === 'error' ? 'text-red-600' :
          'text-yellow-600'
        }`}>
          {status.label}
        </span>
      </div>
    )
  }

  return (
    <Alert className={`mb-4 ${
      status.type === 'connected' ? 'border-green-500 bg-green-50' :
      status.type === 'offline' || status.type === 'error' ? 'border-red-500 bg-red-50' :
      'border-yellow-500 bg-yellow-50'
    }`}>
      <StatusIcon className={`h-4 w-4 ${
        status.type === 'connected' ? 'text-green-600' :
        status.type === 'offline' || status.type === 'error' ? 'text-red-600' :
        'text-yellow-600'
      }`} />
      <AlertDescription className={`${
        status.type === 'connected' ? 'text-green-700' :
        status.type === 'offline' || status.type === 'error' ? 'text-red-700' :
        'text-yellow-700'
      }`}>
        {status.label}
        {lastError && ` - ${lastError}`}
      </AlertDescription>
    </Alert>
  )
}

// User Info Component
export function UserInfo() {
  const { user, isAuthenticated } = useOpLabState()

  if (!isAuthenticated || !user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <User className="h-5 w-5" />
          <span>Informações do Usuário</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div>
            <Label className="text-sm font-medium">Nome</Label>
            <p className="text-sm text-muted-foreground">{user.username || 'Não informado'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Email</Label>
            <p className="text-sm text-muted-foreground">{user.email || 'Não informado'}</p>
          </div>
          <div>
            <Label className="text-sm font-medium">Plano</Label>
            <Badge variant="outline">{user.plan || 'Gratuito'}</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// API Limits Display
export function APILimits() {
  const { limits, isAuthenticated } = useOpLabState()

  if (!isAuthenticated) return null

  const usagePercentage = limits.maxRequests > 0 
    ? (limits.requests / limits.maxRequests) * 100 
    : 0

  const getUsageColor = (percentage) => {
    if (percentage < 50) return 'text-green-600'
    if (percentage < 80) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>Limites da API</span>
        </CardTitle>
        <CardDescription>
          Uso atual dos recursos da API OpLab
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label className="text-sm font-medium">Requisições</Label>
              <span className={`text-sm font-medium ${getUsageColor(usagePercentage)}`}>
                {limits.requests} / {limits.maxRequests}
              </span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>
          
          {limits.resetTime && (
            <div>
              <Label className="text-sm font-medium">Reset em</Label>
              <p className="text-sm text-muted-foreground">
                {new Date(limits.resetTime).toLocaleString('pt-BR')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Usage Stats Component
export function UsageStats({ stats = {} }) {
  const defaultStats = {
    totalScreenings: 0,
    avgResponseTime: 0,
    successRate: 100,
    lastScreening: null,
    ...stats
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Estatísticas de Uso</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-sm font-medium">Total de Screenings</Label>
            <p className="text-2xl font-bold">{defaultStats.totalScreenings}</p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Taxa de Sucesso</Label>
            <p className="text-2xl font-bold text-green-600">
              {defaultStats.successRate.toFixed(1)}%
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Tempo Médio</Label>
            <p className="text-2xl font-bold">
              {defaultStats.avgResponseTime.toFixed(0)}ms
            </p>
          </div>
          
          <div>
            <Label className="text-sm font-medium">Último Screening</Label>
            <p className="text-sm text-muted-foreground">
              {defaultStats.lastScreening 
                ? new Date(defaultStats.lastScreening).toLocaleString('pt-BR')
                : 'Nunca'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// API Dashboard Component
export function APIDashboard({ stats = {} }) {
  const { isAuthenticated } = useOpLabState()

  if (!isAuthenticated) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">API não configurada</h3>
          <p className="text-muted-foreground mb-4">
            Configure seu token OpLab para acessar o dashboard da API.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <ConnectionStatus />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UserInfo />
        <APILimits />
      </div>
      
      <UsageStats stats={stats} />
    </div>
  )
}

// Inline API Status (for headers/footers)
export function InlineAPIStatus() {
  const { isAuthenticated, isOnline, lastError } = useOpLabState()

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        color: 'text-red-500',
        bg: 'bg-red-100',
        text: 'Offline'
      }
    }
    
    if (!isAuthenticated) {
      return {
        color: 'text-yellow-500',
        bg: 'bg-yellow-100',
        text: 'API não configurada'
      }
    }

    if (lastError) {
      return {
        color: 'text-red-500',
        bg: 'bg-red-100',
        text: 'Erro na API'
      }
    }

    return {
      color: 'text-green-500',
      bg: 'bg-green-100',
      text: 'API conectada'
    }
  }

  const config = getStatusConfig()

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${config.bg}`}>
        <div className={`w-2 h-2 rounded-full ${config.color.replace('text-', 'bg-')} animate-pulse`} />
      </div>
      <span className={`text-xs ${config.color}`}>
        {config.text}
      </span>
    </div>
  )
}

// API Error Fallback Component
export function APIErrorFallback({ 
  error, 
  onRetry, 
  onConfigureToken,
  showTokenConfig = true 
}) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const { setToken: saveToken } = useOpLabState()

  const handleSaveToken = () => {
    if (token.trim()) {
      saveToken(token.trim())
      onConfigureToken?.(token.trim())
    }
  }

  const isTokenError = error?.status === 401 || error?.code === 'AUTH_ERROR'
  const isNetworkError = error?.code === 'NETWORK_ERROR' || error?.status === 0

  return (
    <Card>
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        
        <h3 className="text-lg font-semibold mb-2">
          {isTokenError ? 'Erro de Autenticação' :
           isNetworkError ? 'Erro de Conexão' :
           'Erro na API'}
        </h3>
        
        <p className="text-muted-foreground mb-4">
          {isTokenError ? 'Token inválido ou expirado. Configure um novo token.' :
           isNetworkError ? 'Verifique sua conexão com a internet.' :
           error?.message || 'Ocorreu um erro na comunicação com a API.'}
        </p>

        {isTokenError && showTokenConfig && (
          <div className="space-y-4 mb-4">
            <div className="text-left max-w-md mx-auto">
              <Label htmlFor="api-token">Token OpLab</Label>
              <div className="flex space-x-2 mt-2">
                <div className="relative flex-1">
                  <Input
                    id="api-token"
                    type={showToken ? 'text' : 'password'}
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="Insira seu token OpLab"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <Button onClick={handleSaveToken} disabled={!token.trim()}>
                  Salvar
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-x-2">
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              Tentar Novamente
            </Button>
          )}
          
          {!isTokenError && (
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Recarregar Página
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Token Configuration Component
export function TokenConfiguration({ onTokenSave }) {
  const [token, setToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { setToken: saveToken, isAuthenticated, token: currentToken } = useOpLabState()

  const handleSave = async () => {
    if (!token.trim()) return

    setIsLoading(true)
    try {
      saveToken(token.trim())
      onTokenSave?.(token.trim())
    } finally {
      setIsLoading(false)
    }
  }

  // Check if API is properly configured (has token and is authenticated)
  const isAPIConfigured = currentToken && currentToken.length > 0

  if (isAPIConfigured) {
    return (
      <div className="space-y-4">
        <Alert className="border-green-500 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">
            Token OpLab configurado com sucesso! 
            {isAuthenticated ? ' A API está conectada e pronta para uso.' : ' Testando conexão...'}
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Configuração da API</span>
            </CardTitle>
            <CardDescription>
              Gerencie seu token OpLab para acesso aos dados do mercado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Token Atual</Label>
              <div className="flex space-x-2 mt-2">
                <Input
                  type="password"
                  value={currentToken}
                  disabled
                  placeholder="Token configurado"
                />
                <Button 
                  onClick={() => {
                    saveToken('')
                    setToken('')
                  }}
                  variant="outline"
                >
                  Remover
                </Button>
              </div>
            </div>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Token configurado e ativo. Para alterar, remova o token atual e configure um novo.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Configuração da API</span>
        </CardTitle>
        <CardDescription>
          Configure seu token OpLab para acessar dados reais do mercado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="token-input">Token OpLab</Label>
          <div className="flex space-x-2 mt-2">
            <div className="relative flex-1">
              <Input
                id="token-input"
                type={showToken ? 'text' : 'password'}
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Cole seu token OpLab aqui"
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowToken(!showToken)}
                disabled={isLoading}
              >
                {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!token.trim() || isLoading}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </div>
        
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Seu token será armazenado localmente e usado apenas para autenticação com a API OpLab.
            Nunca compartilhe seu token com terceiros.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}

// Refresh interval settings component
export function APIRefreshSettings() {
  const { refreshIntervals, setRefreshInterval } = useOpLabState()
  const endpoints = [
    { key: 'instruments', label: 'Instruments' },
    { key: 'quotes', label: 'Quotes' },
    { key: 'fundamentals', label: 'Fundamentals' },
    { key: 'options', label: 'Options' },
    { key: 'screening', label: 'Screening' }
  ]

  const handleChange = (key, value) => {
    const ms = Math.max(Number(value) || 0, 0) * 1000
    setRefreshInterval(key, ms)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Intervalos de Atualização</span>
        </CardTitle>
        <CardDescription>
          Defina os intervalos (em segundos) para atualização automática de cada endpoint
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {endpoints.map(ep => (
            <div key={ep.key} className="flex items-center space-x-2">
              <Label htmlFor={`refresh-${ep.key}`} className="w-32">
                {ep.label}
              </Label>
              <Input
                id={`refresh-${ep.key}`}
                type="number"
                min="0"
                value={Math.floor((refreshIntervals[ep.key] || 0) / 1000)}
                onChange={(e) => handleChange(ep.key, e.target.value)}
              />
              <span className="text-sm text-muted-foreground">s</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default {
  ConnectionStatus,
  UserInfo,
  APILimits,
  UsageStats,
  APIDashboard,
  InlineAPIStatus,
  APIErrorFallback,
  TokenConfiguration,
  APIRefreshSettings
}