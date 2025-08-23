import React, { useState, useEffect, useCallback } from 'react'
import { Search, Filter, RefreshCw, Download, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useWheelScreening } from '@/hooks/useWheelScreening'
import { LoadingSpinner } from '@/components/LoadingStates'

const ScreeningComponent = () => {
  const [filters, setFilters] = useState({
    minPrice: 20,
    maxPrice: 100,
    minVolume: 1000000,
    minROIC: 8,
    minScore: 60,
    sector: 'all'
  })

  const [isFiltersExpanded, setIsFiltersExpanded] = useState(true)
  
  const {
    results,
    isScreening,
    progress,
    error,
    runScreening,
    exportResults,
    clearResults
  } = useWheelScreening()

  // Execute screening automatically on component mount
  useEffect(() => {
    handleRunScreening()
  }, [])

  const handleRunScreening = useCallback(async () => {
    try {
      await runScreening(filters)
    } catch (err) {
      console.error('Erro ao executar screening:', err)
    }
  }, [filters, runScreening])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExport = () => {
    try {
      exportResults('csv')
    } catch (err) {
      console.error('Erro ao exportar:', err)
    }
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case 'BUY': return 'bg-green-100 text-green-800'
      case 'HOLD': return 'bg-yellow-100 text-yellow-800'
      case 'SELL': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Screening de Oportunidades</h2>
          <p className="text-muted-foreground">
            {results.length > 0 
              ? `${results.length} oportunidades encontradas`
              : 'Execute o screening para encontrar oportunidades'
            }
          </p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)} 
            variant="outline" 
            size="sm"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button 
            onClick={handleRunScreening} 
            disabled={isScreening}
            size="sm"
          >
            {isScreening ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Search className="h-4 w-4 mr-2" />
            )}
            {isScreening ? 'Executando...' : 'Executar Screening'}
          </Button>
          {results.length > 0 && (
            <Button onClick={handleExport} variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {isScreening && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Filters */}
      {isFiltersExpanded && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filtros de Screening</CardTitle>
            <CardDescription>
              Configure os critérios para encontrar as melhores oportunidades
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price Range */}
              <div className="space-y-2">
                <Label>Faixa de Preço (R$)</Label>
                <div className="flex space-x-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', parseFloat(e.target.value) || 0)}
                    className="w-20"
                  />
                  <span className="self-center">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', parseFloat(e.target.value) || 1000)}
                    className="w-20"
                  />
                </div>
              </div>

              {/* Volume */}
              <div className="space-y-2">
                <Label>Volume Mínimo</Label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={filters.minVolume}
                  onChange={(e) => handleFilterChange('minVolume', parseFloat(e.target.value) || 0)}
                />
              </div>

              {/* Sector */}
              <div className="space-y-2">
                <Label>Setor</Label>
                <Select value={filters.sector} onValueChange={(value) => handleFilterChange('sector', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os setores</SelectItem>
                    <SelectItem value="Financial Services">Serviços Financeiros</SelectItem>
                    <SelectItem value="Basic Materials">Materiais Básicos</SelectItem>
                    <SelectItem value="Energy">Energia</SelectItem>
                    <SelectItem value="Technology">Tecnologia</SelectItem>
                    <SelectItem value="Consumer Defensive">Consumo Defensivo</SelectItem>
                    <SelectItem value="Industrials">Industrial</SelectItem>
                    <SelectItem value="Consumer Cyclical">Consumo Cíclico</SelectItem>
                    <SelectItem value="Healthcare">Saúde</SelectItem>
                    <SelectItem value="Utilities">Utilidades</SelectItem>
                    <SelectItem value="Communication Services">Comunicações</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* ROIC */}
              <div className="space-y-2">
                <Label>ROIC Mínimo (%)</Label>
                <div className="px-2">
                  <Slider
                    value={[filters.minROIC]}
                    onValueChange={(value) => handleFilterChange('minROIC', value[0])}
                    max={30}
                    min={0}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>{filters.minROIC}%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="space-y-2">
                <Label>Score Mínimo</Label>
                <div className="px-2">
                  <Slider
                    value={[filters.minScore]}
                    onValueChange={(value) => handleFilterChange('minScore', value[0])}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>0</span>
                    <span>{filters.minScore}</span>
                    <span>100</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao executar screening: {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {isScreening && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-muted-foreground">
              Analisando oportunidades... {progress}%
            </p>
          </div>
        </div>
      )}

      {/* Results */}
      {!isScreening && results.length > 0 && (
        <div className="space-y-4">
          <div className="grid gap-4">
            {results.map((result, index) => (
              <Card key={result.symbol} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-blue-600">
                          {index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold">{result.symbol}</h3>
                          <p className="text-sm text-muted-foreground">{result.name}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getScoreColor(result.score)}>
                        Score {result.score}
                      </Badge>
                      <Badge className={getRecommendationColor(result.recommendation)}>
                        {result.recommendation}
                      </Badge>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Preço</p>
                      <p className="font-semibold">R$ {result.price.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volume</p>
                      <p className="font-semibold">{(result.volume / 1000000).toFixed(1)}M</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">ROIC</p>
                      <p className="font-semibold">{result.roic.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Setor</p>
                      <p className="font-semibold">{result.sector}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Volatilidade</p>
                      <p className="font-semibold">{(result.volatility * 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Fonte</p>
                      <Badge variant="outline" className="text-xs">
                        {result.source === 'api' ? 'Real' : 'Mock'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isScreening && results.length === 0 && !error && (
        <div className="text-center py-12">
          <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma oportunidade encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros ou executar o screening novamente
          </p>
          <Button onClick={handleRunScreening}>
            <Search className="h-4 w-4 mr-2" />
            Executar Screening
          </Button>
        </div>
      )}
    </div>
  )
}

export default ScreeningComponent

