import { useCallback, useEffect, useState, useRef } from 'react'

// Base URL for OpLab API (can be overridden via environment variable)
const API_BASE_URL = import.meta.env.VITE_OPLAB_API_URL || 'https://api.oplab.com.br/v3'

// Basic in-memory users for simple authentication
const VALID_USERS = {
  admin: 'admin',
  user: 'user'
}

// OpLab API state context
const OPLAB_STATE = {
  token: null,
  isAuthenticated: false,
  user: null,
  limits: {
    requests: 0,
    maxRequests: 1000,
    resetTime: null
  },
  lastError: null,
  isOnline: navigator.onLine
}

let globalState = { ...OPLAB_STATE }
const listeners = new Set()

const setGlobalState = (updates) => {
  globalState = { ...globalState, ...updates }
  listeners.forEach((l) => l(globalState))
}

// Hook for managing OpLab API state
export function useOpLabState() {
  const [state, setState] = useState(globalState)

  useEffect(() => {
    const listener = (newState) => setState(newState)
    listeners.add(listener)
    return () => listeners.delete(listener)
  }, [])

  const updateState = useCallback((updates) => {
    setGlobalState(updates)
  }, [])

  const setToken = useCallback((token) => {
    updateState({
      token,
      lastError: null
    })

    if (token) {
      localStorage.setItem('oplab_token', token)
    } else {
      localStorage.removeItem('oplab_token')
    }
  }, [updateState])

  const login = useCallback((username, password) => {
    const validPassword = VALID_USERS[username]
    if (validPassword && validPassword === password) {
      updateState({ isAuthenticated: true, user: { name: username }, lastError: null })
      return true
    }
    updateState({ isAuthenticated: false, user: null, lastError: 'Credenciais inválidas' })
    return false
  }, [updateState])

  const logout = useCallback(() => {
    updateState({
      token: null,
      isAuthenticated: false,
      user: null,
      lastError: null
    })
    localStorage.removeItem('oplab_token')
  }, [updateState])

  const setError = useCallback((error) => {
    setGlobalState({ lastError: error })
  }, [])

  const updateLimits = useCallback((limits) => {
    setGlobalState({ limits: { ...globalState.limits, ...limits } })
  }, [])

  // Load token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('oplab_token')
    if (savedToken) {
      setToken(savedToken)
    }
  }, [setToken])

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => updateState({ isOnline: true })
    const handleOffline = () => updateState({ isOnline: false })

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [updateState])

  return {
    ...state,
    setToken,
    login,
    logout,
    setError,
    updateLimits,
    updateState
  }
}

// Hook for basic OpLab API calls
export function useOpLabAPI() {
  const opLabState = useOpLabState()
  const [isLoading, setIsLoading] = useState(false)
  const abortControllerRef = useRef()

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    if (!opLabState.isOnline) {
      throw new Error('Sem conexão com a internet')
    }

    if (!opLabState.token) {
      throw new Error('Token OpLab não configurado')
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setIsLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Access-Token': opLabState.token,
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: abortControllerRef.current.signal
      })

      // Update rate limit info from headers
      const remaining = response.headers.get('x-ratelimit-remaining')
      const limit = response.headers.get('x-ratelimit-limit')
      const reset = response.headers.get('x-ratelimit-reset')

      if (remaining && limit) {
        opLabState.updateLimits({
          requests: limit - remaining,
          maxRequests: limit,
          resetTime: reset ? new Date(reset * 1000) : null
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      opLabState.setError(null)
      return data

    } catch (error) {
      if (error.name !== 'AbortError') {
        opLabState.setError(error.message)
        throw error
      }
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [opLabState])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    makeRequest,
    isLoading,
    cancel,
    ...opLabState
  }
}

// Hook for OpLab service integration
export function useOpLabService() {
  const api = useOpLabAPI()

  const getInstruments = useCallback(async (filters = {}) => {
    return api.makeRequest('/instruments', {
      method: 'POST',
      body: JSON.stringify(filters)
    })
  }, [api])

  const getQuotes = useCallback(async (symbols) => {
    return api.makeRequest('/quotes', {
      method: 'POST',
      body: JSON.stringify({ symbols })
    })
  }, [api])

  const getFundamentals = useCallback(async (symbol) => {
    return api.makeRequest(`/fundamentals/${symbol}`)
  }, [api])

  const getOptions = useCallback(async (symbol, filters = {}) => {
    return api.makeRequest('/options', {
      method: 'POST',
      body: JSON.stringify({ symbol, ...filters })
    })
  }, [api])

  const testConnection = useCallback(async () => {
    try {
      await api.makeRequest('/health')
      return true
    } catch (error) {
      return false
    }
  }, [api])

  return {
    getInstruments,
    getQuotes,
    getFundamentals,
    getOptions,
    testConnection,
    ...api
  }
}

// Hook for wheel screening with OpLab API
export function useWheelScreening() {
  const api = useOpLabAPI()
  const [results, setResults] = useState([])
  const [isScreening, setIsScreening] = useState(false)
  const [progress, setProgress] = useState(0)

  const runScreening = useCallback(async (filters) => {
    setIsScreening(true)
    setProgress(0)
    setResults([])

    try {
      // Step 1: Get instruments (25% progress)
      setProgress(25)
      const instruments = await api.makeRequest('/screening/instruments', {
        method: 'POST',
        body: JSON.stringify(filters)
      })

      // Step 2: Get quotes for filtered instruments (50% progress)
      setProgress(50)
      const quotes = await api.makeRequest('/screening/quotes', {
        method: 'POST',
        body: JSON.stringify({ 
          symbols: instruments.map(i => i.symbol)
        })
      })

      // Step 3: Get fundamentals for candidates (75% progress)
      setProgress(75)
      const fundamentals = await api.makeRequest('/screening/fundamentals', {
        method: 'POST',
        body: JSON.stringify({ 
          symbols: quotes.filter(q => q.volume >= filters.minVolume).map(q => q.symbol)
        })
      })

      // Step 4: Calculate wheel scores (100% progress)
      setProgress(100)
      const screeningResults = await api.makeRequest('/screening/wheel', {
        method: 'POST',
        body: JSON.stringify({
          instruments,
          quotes,
          fundamentals,
          filters
        })
      })

      setResults(screeningResults)
      return screeningResults

    } catch (error) {
      setResults([])
      throw error
    } finally {
      setIsScreening(false)
      setProgress(0)
    }
  }, [api])

  const exportResults = useCallback((format = 'csv') => {
    if (results.length === 0) return null

    if (format === 'csv') {
      const headers = ['Symbol', 'Name', 'Price', 'Volume', 'ROIC', 'Score', 'Sector']
      const rows = results.map(r => [
        r.symbol,
        r.name,
        r.price,
        r.volume,
        r.roic,
        r.score,
        r.sector
      ])

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `wheel-screening-${new Date().toISOString().split('T')[0]}.csv`
      link.click()
      
      URL.revokeObjectURL(url)
      return true
    }

    return false
  }, [results])

  return {
    results,
    isScreening,
    progress,
    runScreening,
    exportResults,
    hasResults: results.length > 0
  }
}

// Hook for OpLab instruments data
export function useInstruments(filters = {}) {
  const api = useOpLabAPI()
  const [instruments, setInstruments] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchInstruments = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await api.makeRequest('/instruments', {
        method: 'POST',
        body: JSON.stringify(filters)
      })
      setInstruments(data)
    } catch (err) {
      setError(err.message)
      setInstruments([])
    } finally {
      setIsLoading(false)
    }
  }, [api, filters])

  useEffect(() => {
    if (api.isAuthenticated) {
      fetchInstruments()
    }
  }, [fetchInstruments, api.isAuthenticated])

  return {
    instruments,
    isLoading,
    error,
    refetch: fetchInstruments
  }
}

// Hook for OpLab quotes data
export function useQuotes(symbols = []) {
  const api = useOpLabAPI()
  const [quotes, setQuotes] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await api.makeRequest('/quotes', {
        method: 'POST',
        body: JSON.stringify({ symbols })
      })
      setQuotes(data)
    } catch (err) {
      setError(err.message)
      setQuotes([])
    } finally {
      setIsLoading(false)
    }
  }, [api, symbols])

  useEffect(() => {
    if (api.isAuthenticated && symbols.length > 0) {
      fetchQuotes()
    }
  }, [fetchQuotes, api.isAuthenticated, symbols])

  return {
    quotes,
    isLoading,
    error,
    refetch: fetchQuotes
  }
}

// Hook for OpLab fundamentals data
export function useFundamentals(symbol) {
  const api = useOpLabAPI()
  const [fundamentals, setFundamentals] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchFundamentals = useCallback(async () => {
    if (!symbol) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await api.makeRequest(`/fundamentals/${symbol}`)
      setFundamentals(data)
    } catch (err) {
      setError(err.message)
      setFundamentals(null)
    } finally {
      setIsLoading(false)
    }
  }, [api, symbol])

  useEffect(() => {
    if (api.isAuthenticated && symbol) {
      fetchFundamentals()
    }
  }, [fetchFundamentals, api.isAuthenticated, symbol])

  return {
    fundamentals,
    isLoading,
    error,
    refetch: fetchFundamentals
  }
}