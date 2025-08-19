import { useState, useCallback, useEffect } from 'react'
import { useOpLabState } from './useOpLabAPI'

// Hook for OpLab service operations
export function useOpLabService() {
  const { isAuthenticated, token, isOnline } = useOpLabState()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    if (!isOnline) {
      throw new Error('Sem conexão com a internet')
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Access-Token': token }),
          ...options.headers
        }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [token, isOnline])

  const getInstruments = useCallback(async (filters = {}) => {
    return makeRequest('/market/instruments', {
      method: 'POST',
      body: JSON.stringify(filters)
    })
  }, [makeRequest])

  const getQuotes = useCallback(async (symbols) => {
    return makeRequest('/market/quote', {
      method: 'POST',
      body: JSON.stringify({ symbols })
    })
  }, [makeRequest])

  const getFundamentals = useCallback(async (symbol) => {
    return makeRequest(`/market/fundamentals/${symbol}`)
  }, [makeRequest])

  const getOptions = useCallback(async (symbol) => {
    return makeRequest(`/market/options/${symbol}`)
  }, [makeRequest])

  const performScreening = useCallback(async (filters) => {
    return makeRequest('/screening', {
      method: 'POST',
      body: JSON.stringify(filters)
    })
  }, [makeRequest])

  const checkHealth = useCallback(async () => {
    return makeRequest('/health')
  }, [makeRequest])

  const getUserInfo = useCallback(async () => {
    return makeRequest('/user')
  }, [makeRequest])

  return {
    isLoading,
    error,
    getInstruments,
    getQuotes,
    getFundamentals,
    getOptions,
    performScreening,
    checkHealth,
    getUserInfo,
    makeRequest
  }
}

export default useOpLabService

