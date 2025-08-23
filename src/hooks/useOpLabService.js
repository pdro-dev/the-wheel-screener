import { useState, useCallback } from 'react'
import { useOpLabState } from './useOpLabAPI'

// Hook for OpLab service operations
export function useOpLabService() {
  const { token, isOnline } = useOpLabState()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const makeRequest = useCallback(async (endpoint, options = {}) => {
    if (!isOnline) {
      throw new Error('Sem conexão com a internet')
    }

    setIsLoading(true)
    setError(null)

    try {
      const { headers: extraHeaders, ...rest } = options

      const response = await fetch(`/api${endpoint}`, {
        ...rest, // pode incluir signal, method, body
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Access-Token': token }),
          ...extraHeaders,
        },
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

  const getInstruments = useCallback(async (filters = {}, opts = {}) => {
    const data = await makeRequest('/market/instruments', {
      method: 'POST',
      body: JSON.stringify(filters),
      ...opts,
    })
    return data?.instruments ?? data
  }, [makeRequest])

  const getQuotes = useCallback(async (symbols, opts = {}) => {
    const data = await makeRequest('/market/quote', {
      method: 'POST',
      body: JSON.stringify({ symbols }),
      ...opts,
    })
    return data?.quotes ?? data
  }, [makeRequest])

  const getFundamentals = useCallback(async (symbol, opts = {}) => {
    const data = await makeRequest(`/market/fundamentals/${symbol}`, { ...opts })
    return data?.fundamentals ?? data
  }, [makeRequest])

  const getOptions = useCallback(async (symbol, opts = {}) => {
    const data = await makeRequest(`/market/options/${symbol}`, { ...opts })
    return data?.options ?? data
  }, [makeRequest])

  const performScreening = useCallback(async (filters, opts = {}) => {
    const data = await makeRequest('/screening', {
      method: 'POST',
      body: JSON.stringify(filters),
      ...opts,
    })
    return data?.results ?? data
  }, [makeRequest])

  const checkHealth = useCallback(async (opts = {}) => {
    return makeRequest('/health', { ...opts })
  }, [makeRequest])

  const getUserInfo = useCallback(async (opts = {}) => {
    return makeRequest('/user', { ...opts })
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
    makeRequest,
  }
}

export default useOpLabService

