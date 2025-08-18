import React, { useCallback, useEffect, useState } from 'react'
import { AlertCircle, RefreshCw, Wifi, WifiOff, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'

// Skeleton components for loading states
export function SkeletonCard() {
  return (
    <Card className="animate-pulse">
      <CardHeader>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded"></div>
          <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          <div className="h-3 bg-gray-200 rounded w-4/6"></div>
        </div>
      </CardContent>
    </Card>
  )
}

export function SkeletonMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 6 }) {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                {[...Array(cols)].map((_, i) => (
                  <th key={i} className="p-4 text-left">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex} className="border-b">
                  {[...Array(cols)].map((_, colIndex) => (
                    <td key={colIndex} className="p-4">
                      <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading spinner components
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  return (
    <div className={`animate-spin rounded-full border-2 border-primary border-t-transparent ${sizeClasses[size]} ${className}`} />
  )
}

export function LoadingOverlay({ isVisible, message = 'Carregando...' }) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="max-w-sm mx-4">
        <CardContent className="p-6 text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-foreground">{message}</p>
        </CardContent>
      </Card>
    </div>
  )
}

export function InlineLoading({ message = 'Carregando...', className = '' }) {
  return (
    <div className={`flex items-center justify-center space-x-2 p-4 ${className}`}>
      <LoadingSpinner size="sm" />
      <span className="text-muted-foreground">{message}</span>
    </div>
  )
}

// Error state components
export function ErrorState({ 
  title = 'Algo deu errado',
  message = 'Ocorreu um erro inesperado. Tente novamente.',
  onRetry,
  retryLabel = 'Tentar novamente',
  icon: Icon = AlertCircle
}) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Icon className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {retryLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function NetworkError({ onRetry }) {
  return (
    <ErrorState
      title="Sem conexão"
      message="Verifique sua conexão com a internet e tente novamente."
      onRetry={onRetry}
      icon={WifiOff}
    />
  )
}

export function APIError({ error, onRetry }) {
  const getErrorMessage = (error) => {
    if (error?.status === 401) {
      return 'Token inválido ou expirado. Verifique suas credenciais.'
    }
    if (error?.status === 429) {
      return 'Muitas requisições. Aguarde um momento antes de tentar novamente.'
    }
    if (error?.status >= 500) {
      return 'Erro interno do servidor. Tente novamente em alguns minutos.'
    }
    return error?.message || 'Erro na comunicação com a API.'
  }

  return (
    <ErrorState
      title="Erro na API"
      message={getErrorMessage(error)}
      onRetry={onRetry}
    />
  )
}

// Error boundary component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error boundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <ErrorState
          title="Erro inesperado"
          message="Algo deu errado na aplicação. Recarregue a página para tentar novamente."
          onRetry={() => window.location.reload()}
          retryLabel="Recarregar página"
        />
      )
    }

    return this.props.children
  }
}

// Custom hooks for async states
export function useAsyncState(asyncFunction, dependencies = []) {
  const [state, setState] = useState({
    data: null,
    loading: false,
    error: null
  })

  const execute = useCallback(async (...args) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const data = await asyncFunction(...args)
      setState({ data, loading: false, error: null })
      return data
    } catch (error) {
      setState(prev => ({ ...prev, loading: false, error }))
      throw error
    }
  }, dependencies)

  return { ...state, execute }
}

export function useRetry(maxAttempts = 3, delay = 1000) {
  const [attempts, setAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = useCallback(async (fn) => {
    if (attempts >= maxAttempts) {
      throw new Error(`Max retry attempts (${maxAttempts}) exceeded`)
    }

    setIsRetrying(true)
    setAttempts(prev => prev + 1)

    try {
      const result = await fn()
      setAttempts(0)
      setIsRetrying(false)
      return result
    } catch (error) {
      if (attempts < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, delay))
        setIsRetrying(false)
        throw error
      } else {
        setIsRetrying(false)
        throw error
      }
    }
  }, [attempts, maxAttempts, delay])

  const reset = useCallback(() => {
    setAttempts(0)
    setIsRetrying(false)
  }, [])

  return {
    retry,
    attempts,
    isRetrying,
    canRetry: attempts < maxAttempts,
    reset
  }
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

// Connection status component
export function ConnectionStatus() {
  const { isOnline, wasOffline } = useOnlineStatus()

  if (isOnline && !wasOffline) return null

  return (
    <Alert className={`mb-4 ${isOnline ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <div className="flex items-center">
        {isOnline ? (
          <Wifi className="h-4 w-4 text-green-600" />
        ) : (
          <WifiOff className="h-4 w-4 text-red-600" />
        )}
        <AlertDescription className={`ml-2 ${isOnline ? 'text-green-700' : 'text-red-700'}`}>
          {isOnline ? 'Conexão restabelecida' : 'Sem conexão com a internet'}
        </AlertDescription>
      </div>
    </Alert>
  )
}

// Progress indicator for long operations
export function ProgressIndicator({ 
  progress, 
  message = 'Processando...', 
  stages = [],
  currentStage = 0 
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center mb-4">
          <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
          <h3 className="font-medium">{message}</h3>
          {stages.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              {stages[currentStage] || 'Processando...'}
            </p>
          )}
        </div>
        
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          {Math.round(progress)}% concluído
        </p>
      </CardContent>
    </Card>
  )
}

export default {
  SkeletonCard,
  SkeletonMetrics,
  SkeletonTable,
  LoadingSpinner,
  LoadingOverlay,
  InlineLoading,
  ErrorState,
  NetworkError,
  APIError,
  ErrorBoundary,
  ConnectionStatus,
  ProgressIndicator,
  useAsyncState,
  useRetry,
  useOnlineStatus
}