import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MetricCard({ 
  title, 
  value, 
  trend, 
  icon: Icon, 
  color = 'blue',
  subtitle,
  onClick 
}) {
  const getTrendIcon = () => {
    if (trend?.includes('+')) return <TrendingUp className="h-4 w-4 text-green-600" />
    if (trend?.includes('-')) return <TrendingDown className="h-4 w-4 text-red-600" />
    return <Minus className="h-4 w-4 text-gray-400" />
  }

  const getColorClasses = () => {
    const colors = {
      blue: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50',
      green: 'border-green-200 bg-green-50/50 hover:bg-green-50',
      red: 'border-red-200 bg-red-50/50 hover:bg-red-50',
      yellow: 'border-yellow-200 bg-yellow-50/50 hover:bg-yellow-50',
      gray: 'border-gray-200 bg-gray-50/50 hover:bg-gray-50'
    }
    return colors[color] || colors.blue
  }

  const getIconColor = () => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600', 
      red: 'text-red-600',
      yellow: 'text-yellow-600',
      gray: 'text-gray-600'
    }
    return colors[color] || colors.blue
  }

  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        getColorClasses(),
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-700">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className={cn("h-5 w-5", getIconColor())} />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center space-x-1 mt-2">
            {getTrendIcon()}
            <span className="text-xs text-muted-foreground">
              {trend} vs período anterior
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

