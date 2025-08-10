import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Loader2, Search, Download, TrendingUp, DollarSign, BarChart3, AlertCircle } from 'lucide-react'
import './App.css'

// Dados mock para demonstração (simulando resposta da API OpLab)
const MOCK_INSTRUMENTS = [
  {
    symbol: 'PETR4',
    name: 'PETROBRAS PN',
    market: {
      close: 38.45,
      variation: 0.0234,
      vol: 45678900,
      fin_volume: 1756789000,
      bid: 38.40,
      ask: 38.50
    },
    info: { has_options: true }
  },
  {
    symbol: 'VALE3',
    name: 'VALE ON',
    market: {
      close: 56.78,
      variation: -0.0156,
      vol: 23456789,
      fin_volume: 1332456789,
      bid: 56.70,
      ask: 56.85
    },
    info: { has_options: true }
  },
  {
    symbol: 'ITUB4',
    name: 'ITAUUNIBANCO PN',
    market: {
      close: 32.15,
      variation: 0.0089,
      vol: 34567890,
      fin_volume: 1111234567,
      bid: 32.10,
      ask: 32.20
    },
    info: { has_options: true }
  },
  {
    symbol: 'BBDC4',
    name: 'BRADESCO PN',
    market: {
      close: 28.90,
      variation: 0.0145,
      vol: 28901234,
      fin_volume: 835456789,
      bid: 28.85,
      ask: 28.95
    },
    info: { has_options: true }
  },
  {
    symbol: 'ABEV3',
    name: 'AMBEV S/A ON',
    market: {
      close: 16.78,
      variation: -0.0067,
      vol: 56789012,
      fin_volume: 952345678,
      bid: 16.75,
      ask: 16.80
    },
    info: { has_options: true }
  },
  {
    symbol: 'WEGE3',
    name: 'WEG ON',
    market: {
      close: 45.23,
      variation: 0.0198,
      vol: 12345678,
      fin_volume: 558234567,
      bid: 45.15,
      ask: 45.30
    },
    info: { has_options: true }
  },
  {
    symbol: 'MGLU3',
    name: 'MAGAZ LUIZA ON',
    market: {
      close: 22.34,
      variation: -0.0234,
      vol: 67890123,
      fin_volume: 1516789012,
      bid: 22.30,
      ask: 22.38
    },
    info: { has_options: true }
  },
  {
    symbol: 'SUZB3',
    name: 'SUZANO S.A. ON',
    market: {
      close: 51.67,
      variation: 0.0123,
      vol: 8901234,
      fin_volume: 459876543,
      bid: 51.60,
      ask: 51.75
    },
    info: { has_options: true }
  }
]

// Critérios da estratégia "The Wheel"
const WHEEL_CRITERIA = {
  minPrice: 15,
  maxPrice: 60,
  minVolume: 100000,
  hasOptions: true,
  categories: ['ACAO_ORDINARIA', 'ACAO_PREFERENCIAL']
}

function App() {
  const [filters, setFilters] = useState({
    minPrice: WHEEL_CRITERIA.minPrice,
    maxPrice: WHEEL_CRITERIA.maxPrice,
    minVolume: WHEEL_CRITERIA.minVolume
  })
  
  const [instruments, setInstruments] = useState([])
  const [loading, setLoading] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [isDemo, setIsDemo] = useState(true)

  // Função para simular busca de instrumentos elegíveis
  const searchInstruments = async () => {
    setLoading(true)
    
    try {
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Aplicar filtros aos dados mock
      const eligibleInstruments = MOCK_INSTRUMENTS
        .filter(instrument => {
          const price = instrument.market.close || 0
          const volume = instrument.market.fin_volume || 0
          
          return (
            price >= filters.minPrice &&
            price <= filters.maxPrice &&
            volume >= filters.minVolume &&
            instrument.info?.has_options === true
          )
        })
        .sort((a, b) => {
          // Ordenar por volume financeiro (maior para menor)
          const volumeA = a.market.fin_volume || 0
          const volumeB = b.market.fin_volume || 0
          return volumeB - volumeA
        })

      setInstruments(eligibleInstruments)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Erro na busca:', err)
      setInstruments([])
    } finally {
      setLoading(false)
    }
  }

  // Buscar dados ao carregar a página
  useEffect(() => {
    searchInstruments()
  }, [])

  // Função para exportar resultados em CSV
  const exportToCSV = () => {
    if (instruments.length === 0) return

    const headers = ['Símbolo', 'Nome', 'Preço', 'Variação %', 'Volume', 'Volume Financeiro', 'Bid', 'Ask']
    const csvContent = [
      headers.join(','),
      ...instruments.map(inst => [
        inst.symbol,
        `"${inst.name}"`,
        (inst.market.close || 0).toFixed(2),
        ((inst.market.variation || 0) * 100).toFixed(2),
        inst.market.vol || 0,
        (inst.market.fin_volume || 0).toFixed(0),
        (inst.market.bid || 0).toFixed(2),
        (inst.market.ask || 0).toFixed(2)
      ].join(','))
    ].join('\n')

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

  // Função para formatar valores monetários
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0)
  }

  // Função para formatar números grandes
  const formatLargeNumber = (value) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)}B`
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`
    }
    return value?.toString() || '0'
  }

  // Função para calcular ROIC estimado
  const calculateROIC = (instrument) => {
    const price = instrument.market.close || 0
    const bid = instrument.market.bid || 0
    const ask = instrument.market.ask || 0
    
    // Estimativa simples: diferença entre bid/ask como base para premium
    const estimatedPremium = (ask - bid) * 0.5
    const roic = price > 0 ? (estimatedPremium / price) * 100 : 0
    
    return roic
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">The Wheel Screener</h1>
          <p className="text-muted-foreground text-lg">
            Ferramenta de screening automatizado para a estratégia "The Wheel"
          </p>
          {isDemo && (
            <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm font-medium">
                Versão demonstrativa com dados simulados - Integração com API OpLab em desenvolvimento
              </span>
            </div>
          )}
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros de Screening
            </CardTitle>
            <CardDescription>
              Configure os critérios para identificar ativos elegíveis para a estratégia "The Wheel"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Mínimo (R$)</label>
                <Input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: Number(e.target.value) }))}
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Preço Máximo (R$)</label>
                <Input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: Number(e.target.value) }))}
                  min="1"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Volume Mínimo</label>
                <Input
                  type="number"
                  value={filters.minVolume}
                  onChange={(e) => setFilters(prev => ({ ...prev, minVolume: Number(e.target.value) }))}
                  min="0"
                  step="1000"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={searchInstruments} disabled={loading} className="flex items-center gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {loading ? 'Buscando...' : 'Buscar Oportunidades'}
              </Button>
              <Button 
                variant="outline" 
                onClick={exportToCSV} 
                disabled={instruments.length === 0}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas */}
        {instruments.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Oportunidades Encontradas</p>
                    <p className="text-2xl font-bold">{instruments.length}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Faixa de Preços</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(filters.minPrice)} - {formatCurrency(filters.maxPrice)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Última Atualização</p>
                    <p className="text-2xl font-bold">
                      {lastUpdate ? lastUpdate.toLocaleTimeString('pt-BR') : '--:--'}
                    </p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Resultados */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados do Screening</CardTitle>
            <CardDescription>
              Ativos elegíveis para a estratégia "The Wheel" ordenados por volume financeiro
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Carregando dados...</span>
              </div>
            ) : instruments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Símbolo</th>
                      <th className="text-left p-3 font-medium">Nome</th>
                      <th className="text-right p-3 font-medium">Preço</th>
                      <th className="text-right p-3 font-medium">Variação</th>
                      <th className="text-right p-3 font-medium">Vol. Financeiro</th>
                      <th className="text-right p-3 font-medium">Bid/Ask</th>
                      <th className="text-right p-3 font-medium">ROIC Est.</th>
                      <th className="text-center p-3 font-medium">Opções</th>
                    </tr>
                  </thead>
                  <tbody>
                    {instruments.map((instrument, index) => (
                      <tr key={instrument.symbol} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <span className="font-mono font-medium">{instrument.symbol}</span>
                        </td>
                        <td className="p-3">
                          <span className="text-sm">{instrument.name}</span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="font-medium">
                            {formatCurrency(instrument.market.close)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Badge 
                            variant={
                              (instrument.market.variation || 0) >= 0 ? "default" : "destructive"
                            }
                          >
                            {((instrument.market.variation || 0) * 100).toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-sm">
                            {formatCurrency(instrument.market.fin_volume)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(instrument.market.bid)} / {formatCurrency(instrument.market.ask)}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <Badge variant="outline">
                            {calculateROIC(instrument).toFixed(2)}%
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Badge variant="outline">
                            {instrument.info?.has_options ? 'Sim' : 'Não'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhuma oportunidade encontrada com os critérios atuais.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Tente ajustar os filtros e buscar novamente.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Dados {isDemo ? 'simulados para demonstração' : 'fornecidos pela API OpLab'} • Desenvolvido para o Projeto Aplicado de Pós-graduação
          </p>
          <p className="mt-1">
            Estratégia "The Wheel" - Screening automatizado para identificação de oportunidades
          </p>
        </div>
      </div>
    </div>
  )
}

export default App

