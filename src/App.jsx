import React, { useState, useEffect } from 'react'
import { Search, Download, TrendingUp, DollarSign, BarChart3, Settings, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import './App.css'

function App() {
  const [filters, setFilters] = useState({
    minPrice: 15,
    maxPrice: 60,
    minVolume: 100000
  })
  
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [showToken, setShowToken] = useState(false)
  const [tokenConfigured, setTokenConfigured] = useState(false)

  // Dados simulados para demonstração
  const mockData = [
    {
      symbol: 'PETR4',
      name: 'Petrobras PN',
      price: 32.45,
      volume: 15420000,
      roic: 8.2,
      score: 95,
      sector: 'Petróleo e Gás'
    },
    {
      symbol: 'VALE3',
      name: 'Vale ON',
      price: 58.90,
      volume: 8750000,
      roic: 7.8,
      score: 92,
      sector: 'Mineração'
    },
    {
      symbol: 'ITUB4',
      name: 'Itaú Unibanco PN',
      price: 28.15,
      volume: 12300000,
      roic: 9.1,
      score: 89,
      sector: 'Bancos'
    },
    {
      symbol: 'BBDC4',
      name: 'Bradesco PN',
      price: 24.80,
      volume: 9850000,
      roic: 8.7,
      score: 87,
      sector: 'Bancos'
    },
    {
      symbol: 'ABEV3',
      name: 'Ambev ON',
      price: 16.25,
      volume: 18200000,
      roic: 6.9,
      score: 84,
      sector: 'Bebidas'
    },
    {
      symbol: 'WEGE3',
      name: 'WEG ON',
      price: 45.30,
      volume: 3200000,
      roic: 12.4,
      score: 91,
      sector: 'Máquinas'
    }
  ]

  const handleSearch = async () => {
    setLoading(true)
    setError('')
    
    try {
      if (apiToken && tokenConfigured) {
        // Tentativa de usar API real (com token fornecido pelo usuário)
        const response = await fetch('/api/instruments', {
          headers: {
            'X-OpLab-Token': apiToken,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error('Erro na API OpLab. Usando dados simulados.')
        }
        
        const data = await response.json()
        // Processar dados reais da API aqui
        setResults(data)
      } else {
        // Usar dados simulados
        await new Promise(resolve => setTimeout(resolve, 1500)) // Simular delay da API
        
        const filtered = mockData.filter(stock => 
          stock.price >= filters.minPrice && 
          stock.price <= filters.maxPrice &&
          stock.volume >= filters.minVolume
        )
        
        setResults(filtered.sort((a, b) => b.score - a.score))
      }
    } catch (err) {
      console.warn('Usando dados simulados:', err.message)
      // Fallback para dados simulados
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const filtered = mockData.filter(stock => 
        stock.price >= filters.minPrice && 
        stock.price <= filters.maxPrice &&
        stock.volume >= filters.minVolume
      )
      
      setResults(filtered.sort((a, b) => b.score - a.score))
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    if (results.length === 0) return
    
    const headers = ['Símbolo', 'Nome', 'Preço', 'Volume', 'ROIC (%)', 'Score', 'Setor']
    const csvContent = [
      headers.join(','),
      ...results.map(stock => [
        stock.symbol,
        `"${stock.name}"`,
        stock.price.toFixed(2),
        stock.volume,
        stock.roic.toFixed(1),
        stock.score,
        `"${stock.sector}"`
      ].join(','))
    ].join('\\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `the-wheel-screening-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleTokenSave = () => {
    if (apiToken.trim()) {
      setTokenConfigured(true)
      setError('')
    } else {
      setError('Por favor, insira um token válido da API OpLab')
    }
  }

  const formatNumber = (num) => {
    return new Intl.NumberFormat('pt-BR').format(num)
  }

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            The Wheel Screener
          </h1>
          <p className="text-lg text-gray-600">
            Screening automatizado para estratégia "The Wheel" no mercado brasileiro
          </p>
        </div>

        {/* Configuração da API */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração da API OpLab
            </CardTitle>
            <CardDescription>
              Configure seu token da API OpLab para dados reais. Sem token, serão usados dados simulados para demonstração.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="api-token">Token da API OpLab</Label>
                <div className="relative">
                  <Input
                    id="api-token"
                    type={showToken ? "text" : "password"}
                    placeholder="Cole seu token da API OpLab aqui..."
                    value={apiToken}
                    onChange={(e) => setApiToken(e.target.value)}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button onClick={handleTokenSave} disabled={!apiToken.trim()}>
                Configurar
              </Button>
            </div>
            {tokenConfigured && (
              <Alert className="mt-3">
                <AlertDescription>
                  ✅ Token configurado! A aplicação tentará usar dados reais da API OpLab.
                </AlertDescription>
              </Alert>
            )}
            {!tokenConfigured && (
              <Alert className="mt-3">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  🔒 Versão segura: Token não exposto no código. Configure seu token para usar dados reais.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Filtros */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros de Screening
            </CardTitle>
            <CardDescription>
              Configure os critérios para identificar oportunidades da estratégia "The Wheel"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="min-price">Preço Mínimo (R$)</Label>
                <Input
                  id="min-price"
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({...filters, minPrice: Number(e.target.value)})}
                  min="1"
                  max="100"
                />
              </div>
              <div>
                <Label htmlFor="max-price">Preço Máximo (R$)</Label>
                <Input
                  id="max-price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})}
                  min="1"
                  max="200"
                />
              </div>
              <div>
                <Label htmlFor="min-volume">Volume Mínimo</Label>
                <Input
                  id="min-volume"
                  type="number"
                  value={filters.minVolume}
                  onChange={(e) => setFilters({...filters, minVolume: Number(e.target.value)})}
                  min="10000"
                  step="10000"
                />
              </div>
            </div>
            <Button onClick={handleSearch} disabled={loading} className="w-full">
              {loading ? 'Buscando...' : 'Buscar Oportunidades'}
            </Button>
          </CardContent>
        </Card>

        {/* Erro */}
        {error && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertDescription className="text-yellow-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Métricas */}
        {results.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Oportunidades</p>
                    <p className="text-2xl font-bold">{results.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">ROIC Médio</p>
                    <p className="text-2xl font-bold">
                      {(results.reduce((acc, stock) => acc + stock.roic, 0) / results.length).toFixed(1)}%
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Score Médio</p>
                    <p className="text-2xl font-bold">
                      {Math.round(results.reduce((acc, stock) => acc + stock.score, 0) / results.length)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Volume Total</p>
                    <p className="text-xl font-bold">
                      {formatNumber(results.reduce((acc, stock) => acc + stock.volume, 0))}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resultados */}
        {results.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Oportunidades Identificadas</CardTitle>
                  <CardDescription>
                    Ações ranqueadas por atratividade para estratégia "The Wheel"
                  </CardDescription>
                </div>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Ranking</th>
                      <th className="text-left p-2">Símbolo</th>
                      <th className="text-left p-2">Nome</th>
                      <th className="text-right p-2">Preço</th>
                      <th className="text-right p-2">Volume</th>
                      <th className="text-right p-2">ROIC</th>
                      <th className="text-right p-2">Score</th>
                      <th className="text-left p-2">Setor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((stock, index) => (
                      <tr key={stock.symbol} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <Badge variant={index < 3 ? "default" : "secondary"}>
                            #{index + 1}
                          </Badge>
                        </td>
                        <td className="p-2 font-mono font-bold">{stock.symbol}</td>
                        <td className="p-2">{stock.name}</td>
                        <td className="p-2 text-right font-semibold">
                          {formatCurrency(stock.price)}
                        </td>
                        <td className="p-2 text-right">
                          {formatNumber(stock.volume)}
                        </td>
                        <td className="p-2 text-right">
                          <Badge variant="outline" className="text-green-700">
                            {stock.roic.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="p-2 text-right">
                          <Badge 
                            variant={stock.score >= 90 ? "default" : "secondary"}
                            className={stock.score >= 90 ? "bg-green-600" : ""}
                          >
                            {stock.score}
                          </Badge>
                        </td>
                        <td className="p-2 text-sm text-gray-600">{stock.sector}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Analisando oportunidades...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!loading && results.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Nenhuma oportunidade encontrada</p>
              <p className="text-sm text-gray-500">
                Ajuste os filtros e tente novamente
              </p>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>
            The Wheel Screener - Projeto Aplicado de Pós-graduação em Ciência de Dados e Mercado Financeiro
          </p>
          <p className="mt-1">
            {!tokenConfigured && "Demonstração com dados simulados - "}
            <a 
              href="https://github.com/pdro-dev/the-wheel-screener" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Código fonte no GitHub
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

