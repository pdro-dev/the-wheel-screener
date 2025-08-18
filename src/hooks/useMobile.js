import { useEffect, useState, useCallback, useRef } from 'react'

// Hook to detect if device is mobile
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)

    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [breakpoint])

  return isMobile
}

// Hook to detect device orientation
export function useOrientation() {
  const [orientation, setOrientation] = useState({
    isLandscape: window.innerWidth > window.innerHeight,
    isPortrait: window.innerWidth <= window.innerHeight,
    angle: window.screen?.orientation?.angle || 0
  })

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation({
        isLandscape: window.innerWidth > window.innerHeight,
        isPortrait: window.innerWidth <= window.innerHeight,
        angle: window.screen?.orientation?.angle || 0
      })
    }

    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

// Hook for touch gestures
export function useTouchGestures(element) {
  const [gesture, setGesture] = useState(null)
  const touchStart = useRef(null)
  const touchEnd = useRef(null)

  const minSwipeDistance = 50

  const onTouchStart = useCallback((e) => {
    touchStart.current = e.targetTouches[0]
    touchEnd.current = null
  }, [])

  const onTouchMove = useCallback((e) => {
    touchEnd.current = e.targetTouches[0]
  }, [])

  const onTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return

    const distanceX = touchStart.current.clientX - touchEnd.current.clientX
    const distanceY = touchStart.current.clientY - touchEnd.current.clientY
    
    const isLeftSwipe = distanceX > minSwipeDistance
    const isRightSwipe = distanceX < -minSwipeDistance
    const isUpSwipe = distanceY > minSwipeDistance
    const isDownSwipe = distanceY < -minSwipeDistance

    if (isLeftSwipe) {
      setGesture({ type: 'swipe', direction: 'left', distanceX, distanceY })
    } else if (isRightSwipe) {
      setGesture({ type: 'swipe', direction: 'right', distanceX, distanceY })
    } else if (isUpSwipe) {
      setGesture({ type: 'swipe', direction: 'up', distanceX, distanceY })
    } else if (isDownSwipe) {
      setGesture({ type: 'swipe', direction: 'down', distanceX, distanceY })
    } else {
      setGesture({ type: 'tap', x: touchStart.current.clientX, y: touchStart.current.clientY })
    }

    // Clear gesture after a short delay
    setTimeout(() => setGesture(null), 100)
  }, [])

  useEffect(() => {
    const el = element?.current || element
    if (!el) return

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('touchend', onTouchEnd)
    }
  }, [element, onTouchStart, onTouchMove, onTouchEnd])

  return gesture
}

// Hook for viewport dimensions
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isLandscape: window.innerWidth > window.innerHeight
  })

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
        isLandscape: window.innerWidth > window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

// Hook for infinite scroll on mobile
export function useInfiniteScroll(loadMore, threshold = 100) {
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef()

  const handleScroll = useCallback(async () => {
    const container = containerRef.current
    if (!container || isLoading) return

    const { scrollTop, scrollHeight, clientHeight } = container
    
    if (scrollHeight - scrollTop <= clientHeight + threshold) {
      setIsLoading(true)
      try {
        await loadMore()
      } finally {
        setIsLoading(false)
      }
    }
  }, [loadMore, threshold, isLoading])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  return { containerRef, isLoading }
}

// Hook for pull to refresh
export function usePullToRefresh(onRefresh, threshold = 100) {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const containerRef = useRef()
  const startY = useRef(0)

  const onTouchStart = useCallback((e) => {
    startY.current = e.touches[0].clientY
  }, [])

  const onTouchMove = useCallback((e) => {
    const container = containerRef.current
    if (!container || container.scrollTop > 0) return

    const currentY = e.touches[0].clientY
    const distance = currentY - startY.current

    if (distance > 0) {
      setIsPulling(true)
      setPullDistance(Math.min(distance, threshold * 2))
    }
  }, [threshold])

  const onTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true)
      try {
        await onRefresh()
      } finally {
        setIsRefreshing(false)
      }
    }
    
    setIsPulling(false)
    setPullDistance(0)
  }, [pullDistance, threshold, onRefresh, isRefreshing])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener('touchstart', onTouchStart, { passive: true })
    container.addEventListener('touchmove', onTouchMove, { passive: false })
    container.addEventListener('touchend', onTouchEnd, { passive: true })

    return () => {
      container.removeEventListener('touchstart', onTouchStart)
      container.removeEventListener('touchmove', onTouchMove)
      container.removeEventListener('touchend', onTouchEnd)
    }
  }, [onTouchStart, onTouchMove, onTouchEnd])

  return {
    containerRef,
    isPulling,
    pullDistance,
    isRefreshing
  }
}

// Hook for virtual keyboard handling
export function useKeyboard() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const initialViewport = useRef(window.visualViewport?.height || window.innerHeight)

  useEffect(() => {
    const handleViewportChange = () => {
      const currentHeight = window.visualViewport?.height || window.innerHeight
      const heightDiff = initialViewport.current - currentHeight
      
      setKeyboardHeight(Math.max(0, heightDiff))
      setIsKeyboardOpen(heightDiff > 100) // Assume keyboard if height diff > 100px
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange)
      return () => window.visualViewport.removeEventListener('resize', handleViewportChange)
    } else {
      window.addEventListener('resize', handleViewportChange)
      return () => window.removeEventListener('resize', handleViewportChange)
    }
  }, [])

  return { keyboardHeight, isKeyboardOpen }
}

// Hook for mobile performance optimization
export function useMobilePerformance() {
  const [isLowEndDevice, setIsLowEndDevice] = useState(false)
  const [networkInfo, setNetworkInfo] = useState({
    effectiveType: '4g',
    downlink: 10,
    rtt: 100
  })

  useEffect(() => {
    // Detect low-end device
    const navigator = window.navigator
    const hardwareConcurrency = navigator.hardwareConcurrency || 4
    const deviceMemory = navigator.deviceMemory || 4

    setIsLowEndDevice(hardwareConcurrency < 4 || deviceMemory < 4)

    // Get network information
    if ('connection' in navigator) {
      const connection = navigator.connection
      setNetworkInfo({
        effectiveType: connection.effectiveType || '4g',
        downlink: connection.downlink || 10,
        rtt: connection.rtt || 100
      })

      const updateNetworkInfo = () => {
        setNetworkInfo({
          effectiveType: connection.effectiveType || '4g',
          downlink: connection.downlink || 10,
          rtt: connection.rtt || 100
        })
      }

      connection.addEventListener('change', updateNetworkInfo)
      return () => connection.removeEventListener('change', updateNetworkInfo)
    }
  }, [])

  const shouldReduceAnimations = isLowEndDevice || networkInfo.effectiveType === 'slow-2g'
  const shouldLazyLoad = isLowEndDevice || ['slow-2g', '2g', '3g'].includes(networkInfo.effectiveType)

  return {
    isLowEndDevice,
    networkInfo,
    shouldReduceAnimations,
    shouldLazyLoad
  }
}