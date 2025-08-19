import { useState, useCallback, useRef } from 'react'

// Hook for managing async operations with loading states
export function useAsyncState(asyncFunction, dependencies = []) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)
  
  const abortControllerRef = useRef()

  const execute = useCallback(async (...args) => {
    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    abortControllerRef.current = new AbortController()
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction(...args)
      
      // Check if request was aborted
      if (abortControllerRef.current.signal.aborted) {
        return null
      }

      setData(result)
      return result
    } catch (err) {
      if (err.name === 'AbortError') {
        return null
      }
      
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [asyncFunction, ...dependencies])

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }, [])

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setLoading(false)
  }, [])

  return {
    loading,
    error,
    data,
    execute,
    reset,
    cancel
  }
}

// Hook for retry functionality
export function useRetry(maxAttempts = 3, delay = 1000) {
  const [attempts, setAttempts] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const retry = useCallback(async (asyncFunction) => {
    setIsRetrying(true)
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setAttempts(attempt)
        const result = await asyncFunction()
        setIsRetrying(false)
        setAttempts(0)
        return result
      } catch (error) {
        if (attempt === maxAttempts) {
          setIsRetrying(false)
          throw error
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }, [maxAttempts, delay])

  const reset = useCallback(() => {
    setAttempts(0)
    setIsRetrying(false)
  }, [])

  const canRetry = attempts < maxAttempts

  return {
    retry,
    attempts,
    isRetrying,
    canRetry,
    reset
  }
}

export default useAsyncState

