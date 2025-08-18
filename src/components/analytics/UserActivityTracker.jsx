import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export function UserActivityTracker() {
  const [activity] = useState({
    sessionsToday: 0,
    deviceBreakdown: { desktop: 0, mobile: 0 }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Atividade do Usuário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm">Sessões hoje: {activity.sessionsToday}</div>
      </CardContent>
    </Card>
  )
}
