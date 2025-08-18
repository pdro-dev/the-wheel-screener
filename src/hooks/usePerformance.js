import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// Hook for debouncing values
export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Hook for throttling function calls
export function useThrottle(callback, delay) {
  const lastRun = useRef(Date.now())

  return useCallback((...args) => {
    if (Date.now() - lastRun.current >= delay) {
      callback(...args)
      lastRun.current = Date.now()
    }
  }, [callback, delay])
}

// Hook for expensive calculations with memoization
export function useExpensiveCalculation(computeFn, dependencies) {
  return useMemo(() => {
    const start = performance.now()
    const result = computeFn()
    const end = performance.now()
    
    if (end - start > 100) {
      console.warn(`Expensive calculation took ${end - start}ms`)
    }
    
    return result
  }, dependencies)
}

// Hook for virtual scrolling implementation
export function useVirtualScrolling({ 
  items, 
  itemHeight = 50, 
  containerHeight = 400,
  overscan = 5 
}) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleRange = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const endIndex = Math.min(
      items.length,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    )
    
    return { startIndex, endIndex }
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index,
      top: (visibleRange.startIndex + index) * itemHeight
    }))
  }, [items, visibleRange, itemHeight])

  const totalHeight = items.length * itemHeight

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    handleScroll,
    startIndex: visibleRange.startIndex,
    endIndex: visibleRange.endIndex
  }
}

// Hook for lazy loading with intersection observer
export function useLazyLoading(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasLoaded, setHasLoaded] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsIntersecting(true)
          setHasLoaded(true)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px',
        ...options
      }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [hasLoaded, options])

  return { ref, isIntersecting, hasLoaded }
}

// Hook for optimized filters with debouncing
export function useOptimizedFilters(initialFilters, delay = 300) {
  const [filters, setFilters] = useState(initialFilters)
  const debouncedFilters = useDebounce(filters, delay)

  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
  }, [initialFilters])

  return {
    filters,
    debouncedFilters,
    updateFilter,
    resetFilters,
    setFilters
  }
}

// Hook for monitoring performance metrics
export function usePerformanceMonitor() {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    renderTime: 0,
    lastRender: null
  })

  const markRenderStart = useRef()

  useEffect(() => {
    markRenderStart.current = performance.now()
  })

  useEffect(() => {
    const renderTime = performance.now() - markRenderStart.current
    setMetrics(prev => ({
      renderCount: prev.renderCount + 1,
      renderTime,
      lastRender: new Date().toISOString()
    }))
  })

  return metrics
}

// Hook for caching results with TTL
export function useResultCache(key, ttlMs = 5 * 60 * 1000) {
  const cache = useRef(new Map())

  const get = useCallback((cacheKey) => {
    const fullKey = `${key}_${cacheKey}`
    const cached = cache.current.get(fullKey)
    
    if (cached && Date.now() - cached.timestamp < ttlMs) {
      return cached.data
    }
    
    return null
  }, [key, ttlMs])

  const set = useCallback((cacheKey, data) => {
    const fullKey = `${key}_${cacheKey}`
    cache.current.set(fullKey, {
      data,
      timestamp: Date.now()
    })
  }, [key])

  const clear = useCallback(() => {
    cache.current.clear()
  }, [])

  const remove = useCallback((cacheKey) => {
    const fullKey = `${key}_${cacheKey}`
    cache.current.delete(fullKey)
  }, [key])

  return { get, set, clear, remove }
}

// Hook for stable callback reference
export function useStableCallback(callback) {
  const callbackRef = useRef(callback)
  
  useEffect(() => {
    callbackRef.current = callback
  })

  return useCallback((...args) => {
    return callbackRef.current(...args)
  }, [])
}

// Hook for stable value reference
export function useStableValue(value) {
  const ref = useRef(value)
  
  useEffect(() => {
    ref.current = value
  })

  return ref.current
}

// Hook for batching multiple state updates
export function useBatchUpdates() {
  const timeoutRef = useRef()
  const updatesRef = useRef([])

  const batchUpdate = useCallback((updateFn) => {
    updatesRef.current.push(updateFn)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    timeoutRef.current = setTimeout(() => {
      const updates = updatesRef.current
      updatesRef.current = []
      
      updates.forEach(update => update())
    }, 0)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return batchUpdate
}