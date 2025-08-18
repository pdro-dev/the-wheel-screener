import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export function RateLimitingDashboard() {
  const [rate] = useState({ current: 0, max: 100 })
  const percentage = rate.max ? (rate.current / rate.max) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Limiting</CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="w-full" />
        <div className="text-sm mt-2">
          {rate.current} / {rate.max} reqs
        </div>
      </CardContent>
    </Card>
  )
}
