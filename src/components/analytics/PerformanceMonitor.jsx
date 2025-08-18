import React, { useEffect, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function PerformanceMonitor() {
  const [performance, setPerformance] = useState({
    cls: 0,
    fid: 0,
    lcp: 0
  })

  useEffect(() => {
    // Placeholder metrics capture
    setPerformance({ cls: 0, fid: 0, lcp: 0 })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance em Tempo Real</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-1 text-sm">
          <li>CLS: {performance.cls}</li>
          <li>FID: {performance.fid}ms</li>
          <li>LCP: {performance.lcp}ms</li>
        </ul>
      </CardContent>
    </Card>
  )
}
