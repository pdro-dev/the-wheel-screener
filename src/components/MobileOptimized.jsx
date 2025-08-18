import React, { useState, useCallback, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  Menu, 
  X, 
  Plus, 
  Download, 
  TrendingUp,
  DollarSign,
  BarChart3,
  Activity,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useIsMobile, useInfiniteScroll, usePullToRefresh } from '@/hooks/useMobile'
import { useDebounce } from '@/hooks/usePerformance'
import { ScreeningUtils } from '@/services/opLabAPI'

// Mobile Header Component
export function MobileHeader({ 
  title = 'The Wheel Screener',
  subtitle,
  onMenuClick,
  actions = []
}) {
  return (
    <header className="sticky top-0 z-40 bg-background border-b">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onMenuClick}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'ghost'}
              size="sm"
              onClick={action.onClick}
              disabled={action.disabled}
            >
              {action.icon && <action.icon className="h-4 w-4" />}
              {action.label && !action.iconOnly && (
                <span className="ml-1">{action.label}</span>
              )}
            </Button>
          ))}
        </div>
      </div>
    </header>
  )
}

// Mobile Metrics Display
export function MobileMetrics({ metrics = [] }) {
  if (metrics.length === 0) return null

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Resumo</h3>
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => (
          <Card key={index} className="p-3">
            <div className="flex items-center space-x-2">
              {metric.icon && (
                <metric.icon className="h-5 w-5 text-primary" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground truncate">
                  {metric.label}
                </p>
                <p className="text-lg font-semibold">
                  {metric.formatter ? metric.formatter(metric.value) : metric.value}
                </p>
                {metric.change && (
                  <div className="flex items-center space-x-1">
                    {metric.change > 0 ? (
                      <ArrowUp className="h-3 w-3 text-green-500" />
                    ) : (
                      <ArrowDown className="h-3 w-3 text-red-500" />
                    )}
                    <span className={`text-xs ${metric.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {Math.abs(metric.change)}%
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Mobile Filters Drawer
export function MobileFilters({ 
  filters = {}, 
  onFilterChange, 
  onReset,
  isOpen,
  onOpenChange 
}) {
  const [localFilters, setLocalFilters] = useState(filters)
  const debouncedFilters = useDebounce(localFilters, 300)

  useEffect(() => {
    onFilterChange?.(debouncedFilters)
  }, [debouncedFilters, onFilterChange])

  const updateFilter = useCallback((key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      minPrice: 15,
      maxPrice: 100,
      minVolume: 100000,
      minROIC: 5,
      minScore: 60,
      sectors: [],
      search: ''
    }
    setLocalFilters(defaultFilters)
    onReset?.(defaultFilters)
  }, [onReset])

  const sectors = [
    'Tecnologia',
    'Financeiro',
    'Petróleo e Gás',
    'Mineração',
    'Saúde',
    'Consumo',
    'Utilities',
    'Telecomunicações'
  ]

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh]">
        <SheetHeader>
          <SheetTitle>Filtros de Screening</SheetTitle>
          <SheetDescription>
            Configure os critérios para a estratégia The Wheel
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-full mt-6">
          <div className="space-y-6 pb-6">
            {/* Search */}
            <div>
              <Label htmlFor="search">Buscar</Label>
              <Input
                id="search"
                placeholder="Símbolo, nome ou setor..."
                value={localFilters.search || ''}
                onChange={(e) => updateFilter('search', e.target.value)}
              />
            </div>

            {/* Price Range */}
            <div>
              <Label>Faixa de Preço (R$)</Label>
              <div className="space-y-3 mt-2">
                <div className="px-2">
                  <Slider
                    value={[localFilters.minPrice || 15, localFilters.maxPrice || 100]}
                    onValueChange={([min, max]) => {
                      updateFilter('minPrice', min)
                      updateFilter('maxPrice', max)
                    }}
                    min={1}
                    max={200}
                    step={1}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>R$ {localFilters.minPrice || 15}</span>
                  <span>R$ {localFilters.maxPrice || 100}</span>
                </div>
              </div>
            </div>

            {/* Volume */}
            <div>
              <Label>Volume Mínimo</Label>
              <div className="space-y-3 mt-2">
                <div className="px-2">
                  <Slider
                    value={[localFilters.minVolume || 100000]}
                    onValueChange={([value]) => updateFilter('minVolume', value)}
                    min={50000}
                    max={10000000}
                    step={50000}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {ScreeningUtils.formatVolume(localFilters.minVolume || 100000)}
                </div>
              </div>
            </div>

            {/* ROIC */}
            <div>
              <Label>ROIC Mínimo (%)</Label>
              <div className="space-y-3 mt-2">
                <div className="px-2">
                  <Slider
                    value={[localFilters.minROIC || 5]}
                    onValueChange={([value]) => updateFilter('minROIC', value)}
                    min={0}
                    max={30}
                    step={0.5}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {(localFilters.minROIC || 5).toFixed(1)}%
                </div>
              </div>
            </div>

            {/* Score */}
            <div>
              <Label>Score Mínimo</Label>
              <div className="space-y-3 mt-2">
                <div className="px-2">
                  <Slider
                    value={[localFilters.minScore || 60]}
                    onValueChange={([value]) => updateFilter('minScore', value)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {localFilters.minScore || 60}
                </div>
              </div>
            </div>

            {/* Sectors */}
            <div>
              <Label>Setores</Label>
              <Select
                value={localFilters.sectors?.[0] || ''}
                onValueChange={(value) => updateFilter('sectors', value ? [value] : [])}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Todos os setores" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os setores</SelectItem>
                  {sectors.map(sector => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <Button 
                variant="outline" 
                onClick={resetFilters}
                className="flex-1"
              >
                Limpar
              </Button>
              <Button 
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Aplicar
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

// Mobile Table (Card List)
export function MobileTable({ 
  data = [], 
  onItemSelect,
  onLoadMore,
  hasMore = false,
  isLoading = false,
  emptyMessage = 'Nenhum resultado encontrado'
}) {
  const { containerRef, isLoading: isLoadingMore } = useInfiniteScroll(
    onLoadMore, 
    100
  )

  if (data.length === 0 && !isLoading) {
    return (
      <div className="p-8 text-center">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="space-y-3 p-4">
      {data.map((item, index) => (
        <MobileTableCard
          key={item.symbol || index}
          item={item}
          onClick={() => onItemSelect?.(item)}
        />
      ))}
      
      {(isLoadingMore || isLoading) && (
        <Card className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        </Card>
      )}
    </div>
  )
}

// Individual mobile table card
function MobileTableCard({ item, onClick }) {
  const getScoreBadgeVariant = (score) => {
    if (score >= 80) return 'default'
    if (score >= 60) return 'secondary'
    return 'outline'
  }

  return (
    <Card className="cursor-pointer hover:bg-muted/50" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-base">{item.symbol}</h3>
            <p className="text-sm text-muted-foreground truncate max-w-[200px]">
              {item.name}
            </p>
          </div>
          <Badge variant={getScoreBadgeVariant(item.score)}>
            {Math.round(item.score || 0)}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground">Preço</p>
            <p className="font-medium">
              {ScreeningUtils.formatCurrency(item.price)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Volume</p>
            <p className="font-medium">
              {ScreeningUtils.formatVolume(item.volume)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">ROIC</p>
            <p className="font-medium">
              {ScreeningUtils.formatNumber(item.roic || 0, 1)}%
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Setor</p>
            <p className="font-medium truncate">{item.sector}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Mobile Actions FAB
export function MobileActions({ 
  actions = [],
  isVisible = true 
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!isVisible || actions.length === 0) return null

  const primaryAction = actions[0]
  const secondaryActions = actions.slice(1)

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Secondary actions */}
      {isExpanded && secondaryActions.length > 0 && (
        <div className="mb-3 space-y-2">
          {secondaryActions.map((action, index) => (
            <Button
              key={index}
              variant="secondary"
              size="sm"
              onClick={() => {
                action.onClick?.()
                setIsExpanded(false)
              }}
              className="shadow-lg"
            >
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Primary action button */}
      <Button
        size="lg"
        onClick={() => {
          if (secondaryActions.length > 0) {
            setIsExpanded(!isExpanded)
          } else {
            primaryAction.onClick?.()
          }
        }}
        disabled={primaryAction.disabled}
        className="rounded-full shadow-lg h-14 w-14"
      >
        {isExpanded && secondaryActions.length > 0 ? (
          <X className="h-6 w-6" />
        ) : (
          primaryAction.icon ? (
            <primaryAction.icon className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )
        )}
      </Button>
    </div>
  )
}

// Mobile Search Component
export function MobileSearch({ 
  value = '', 
  onChange, 
  placeholder = 'Buscar...',
  onClear 
}) {
  return (
    <div className="relative p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {value && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// Mobile Navigation
export function MobileNavigation({ 
  items = [], 
  currentPath,
  onNavigate 
}) {
  return (
    <nav className="bg-background border-t">
      <div className="flex">
        {items.map((item, index) => (
          <button
            key={index}
            onClick={() => onNavigate?.(item.path)}
            className={`flex-1 p-3 text-center ${
              currentPath === item.path 
                ? 'text-primary border-t-2 border-primary' 
                : 'text-muted-foreground'
            }`}
          >
            {item.icon && <item.icon className="h-5 w-5 mx-auto mb-1" />}
            <span className="text-xs">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

// Mobile Loading State
export function MobileLoading({ message = 'Carregando...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <RefreshCw className="h-8 w-8 animate-spin text-primary mb-4" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}

// Mobile Empty State
export function MobileEmptyState({ 
  icon: Icon = BarChart3,
  title = 'Nenhum resultado',
  message = 'Nenhum item encontrado.',
  action
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{message}</p>
      {action && (
        <Button onClick={action.onClick} variant={action.variant || 'default'}>
          {action.icon && <action.icon className="h-4 w-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  )
}

export default {
  MobileHeader,
  MobileMetrics,
  MobileFilters,
  MobileTable,
  MobileActions,
  MobileSearch,
  MobileNavigation,
  MobileLoading,
  MobileEmptyState
}