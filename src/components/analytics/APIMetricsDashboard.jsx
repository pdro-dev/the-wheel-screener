import React, { useState } from 'react'
import { BarChart3, TrendingUp, AlertCircle, Gauge } from 'lucide-react'
import { MetricCard } from './MetricCard'

export function APIMetricsDashboard() {
  const [metrics] = useState({
    requestsToday: 0,
    averageResponseTime: 0,
    errorRate: 0,
    quotaRemaining: 100
  })

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Requests Hoje"
        value={metrics.requestsToday}
        trend="+0%"
        icon={BarChart3}
      />
      <MetricCard
        title="Tempo Resposta"
        value={`${metrics.averageResponseTime}ms`}
        trend="0%"
        icon={TrendingUp}
      />
      <MetricCard
        title="Taxa de Erro"
        value={`${metrics.errorRate}%`}
        trend="0%"
        icon={AlertCircle}
      />
      <MetricCard
        title="Quota Restante"
        value={`${metrics.quotaRemaining}%`}
        trend="stable"
        icon={Gauge}
      />
    </div>
  )
}
