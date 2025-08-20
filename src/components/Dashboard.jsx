import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TrendingUp, DollarSign, BarChart3, Activity, AlertCircle, Target } from 'lucide-react'

const Dashboard = () => {
  const kpis = [
    {
      title: "Oportunidades Ativas",
      value: "7",
      change: "+2 desde ontem",
      icon: Target,
      color: "text-blue-600"
    },
    {
      title: "Score Médio",
      value: "82",
      change: "Qualidade das oportunidades",
      icon: BarChart3,
      color: "text-green-600"
    },
    {
      title: "ROI Médio Projetado",
      value: "17.7%",
      change: "Anualizado",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Volatilidade Média",
      value: "28.5%",
      change: "Últimos 30 dias",
      icon: Activity,
      color: "text-orange-600"
    }
  ]

  const topOportunidades = [
    { symbol: "VALE3", company: "Vale ON", price: "R$ 65,42", score: 97, roi: "24.5%", strategy: "Put CS", strike: "R$ 62,00" },
    { symbol: "MGLU3", company: "Magazine Luiza ON", price: "R$ 45,20", score: 94, roi: "22.8%", strategy: "Put CS", strike: "R$ 43,00" },
    { symbol: "WEGE3", company: "WEG ON", price: "R$ 52,80", score: 87, roi: "19.2%", strategy: "Call Cob", strike: "R$ 55,00" }
  ]

  const indicadoresMercado = [
    { label: "Put/Call Ratio", value: "1.15", status: "Neutro" },
    { label: "VIX Brasileiro", value: "28.5%", status: "Moderado" },
    { label: "Sentimento", value: "Neutro", status: "Neutro" }
  ]

  const distribuicaoEstrategia = [
    { strategy: "Put Cash-Secured", percentage: 57 },
    { strategy: "Covered Call", percentage: 43 }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das oportunidades The Wheel</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600">
            Mercado Aberto
          </Badge>
          <span className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <Icon className={`h-4 w-4 ${kpi.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Oportunidades */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" />
              Top Oportunidades The Wheel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOportunidades.map((opp, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{opp.symbol}</div>
                      <div className="text-sm text-muted-foreground">{opp.company}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{opp.price}</span>
                      <Badge variant="secondary" className="text-xs">
                        Score {opp.score}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ROI Proj. {opp.roi} | {opp.strategy} | Strike {opp.strike}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline">
              Ver Todas as Oportunidades
            </Button>
          </CardContent>
        </Card>

        {/* Indicadores de Mercado */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Indicadores de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {indicadoresMercado.map((indicador, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{indicador.label}</span>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{indicador.value}</span>
                    <Badge variant="outline" className="text-xs">
                      {indicador.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Distribuição por Estratégia</h4>
                {distribuicaoEstrategia.map((item, index) => (
                  <div key={index} className="flex items-center justify-between mb-2">
                    <span className="text-sm">{item.strategy}</span>
                    <span className="font-semibold">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="mr-2 h-5 w-5" />
            Alertas e Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-blue-600 mr-3" />
              <div>
                <div className="text-sm font-medium">3 opções vencem esta semana</div>
                <div className="text-xs text-muted-foreground">PETR4, VALE3, ITUB4 - Revisar estratégias de rolagem</div>
              </div>
            </div>
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600 mr-3" />
              <div>
                <div className="text-sm font-medium">2 novas oportunidades identificadas</div>
                <div className="text-xs text-muted-foreground">BBAS3 e ABEV3 atingiram critérios de screening</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
