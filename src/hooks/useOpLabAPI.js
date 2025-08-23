import { useCallback, useEffect, useState, useRef } from 'react'

// Base URL for OpLab API (can be overridden via environment variable)
const API_BASE_URL =
  import.meta.env.VITE_OPLAB_API_URL || 'https://api.oplab.com.br/v3'

// Basic in-memory users for simple authentication
const VALID_USERS = {
  admin: 'admin',
  user: 'user'
}

// Default refresh intervals in milliseconds for each endpoint
const DEFAULT_REFRESH_INTERVALS = {
  instruments: 5 * 60 * 1000, // 5 minutes
  quotes: 30 * 1000, // 30 seconds
  fundamentals: 10 * 60 * 1000, // 10 minutes
  options: 2 * 60 * 1000, // 2 minutes
  screening: 2 * 60 * 1000 // 2 minutes
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
  isOnline: navigator.onLine,
  refreshIntervals: { ...DEFAULT_REFRESH_INTERVALS }
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
    const normalizedUsername = username.trim().toLowerCase()
    const pass = password.trim()
    const validPassword = VALID_USERS[normalizedUsername]
    if (validPassword && validPassword === pass) {
      const role = normalizedUsername === 'admin' ? 'admin' : 'user'
      updateState({
        isAuthenticated: true,
        user: { username: normalizedUsername, role },
        lastError: null
      })
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

  const setRefreshInterval = useCallback((endpoint, value) => {
    const newIntervals = {
      ...globalState.refreshIntervals,
      [endpoint]: value
    }
    updateState({ refreshIntervals: newIntervals })
    localStorage.setItem('oplab_refresh_intervals', JSON.stringify(newIntervals))
  }, [updateState])

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

  // Load refresh intervals from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('oplab_refresh_intervals')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        updateState({
          refreshIntervals: { ...DEFAULT_REFRESH_INTERVALS, ...parsed }
        })
      } catch {
        updateState({ refreshIntervals: { ...DEFAULT_REFRESH_INTERVALS } })
      }
    } else {
      updateState({ refreshIntervals: { ...DEFAULT_REFRESH_INTERVALS } })
    }
  }, [updateState])

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
    setRefreshInterval,
    updateState
  }
}

// Internal utility for tests to reset global state
export function __resetOpLabState() {
  globalState = { ...OPLAB_STATE }
  listeners.forEach((l) => l(globalState))
  localStorage.removeItem('oplab_token')
  localStorage.removeItem('oplab_refresh_intervals')
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
          'x-oplab-token': opLabState.token,
          'Content-Type': 'application/json',
          ...options.headers
        },
        signal: abortControllerRef.current.signal
      })

      // Update rate limit info and token from headers
      const remaining = response.headers.get('x-ratelimit-remaining')
      const limit = response.headers.get('x-ratelimit-limit')
      const reset = response.headers.get('x-ratelimit-reset')
      const newToken = response.headers.get('x-oplab-token')

      if (newToken) {
        opLabState.setToken(newToken)
      }

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
      setProgress(50)
      const { results: screeningResults } = await api.makeRequest('/screening', {
        method: 'POST',
        body: JSON.stringify(filters)
      })

      setProgress(100)
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
    let intervalId
    if (api.isAuthenticated) {
      fetchInstruments()
      const interval = api.refreshIntervals?.instruments
      if (interval && interval > 0) {
        intervalId = setInterval(fetchInstruments, interval)
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchInstruments, api.isAuthenticated, api.refreshIntervals?.instruments])

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
    let intervalId
    if (api.isAuthenticated && symbols.length > 0) {
      fetchQuotes()
      const interval = api.refreshIntervals?.quotes
      if (interval && interval > 0) {
        intervalId = setInterval(fetchQuotes, interval)
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchQuotes, api.isAuthenticated, symbols, api.refreshIntervals?.quotes])

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
    let intervalId
    if (api.isAuthenticated && symbol) {
      fetchFundamentals()
      const interval = api.refreshIntervals?.fundamentals
      if (interval && interval > 0) {
        intervalId = setInterval(fetchFundamentals, interval)
      }
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchFundamentals, api.isAuthenticated, symbol, api.refreshIntervals?.fundamentals])

  return {
    fundamentals,
    isLoading,
    error,
    refetch: fetchFundamentals
  }
}