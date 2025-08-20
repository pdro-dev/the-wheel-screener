import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Target, 
  Activity, 
  AlertCircle,
  BarChart3,
  PieChart,
  Calendar,
  Clock
} from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/options';

const Dashboard = () => {
  const [kpis, setKpis] = useState({
    totalOpportunities: 7,
    avgWheelScore: 82,
    avgROI: 17.7,
    highVolatilityCount: 3,
    optimalStrikes: 12,
    marketSentiment: 'Neutro'
  });

  const [topOpportunities, setTopOpportunities] = useState([
    {
      symbol: 'VALE3',
      name: 'Vale ON',
      price: 65.42,
      wheelScore: 97,
      projectedROI: 24.5,
      volatility: 32.1,
      strategy: 'Put Cash-Secured',
      strike: 62.00,
      premium: 1.80,
      daysToExpiry: 28
    },
    {
      symbol: 'MGLU3',
      name: 'Magazine Luiza ON',
      price: 45.20,
      wheelScore: 94,
      projectedROI: 22.8,
      volatility: 38.5,
      strategy: 'Put Cash-Secured',
      strike: 43.00,
      premium: 1.50,
      daysToExpiry: 35
    },
    {
      symbol: 'WEGE3',
      name: 'WEG ON',
      price: 52.80,
      wheelScore: 87,
      projectedROI: 19.2,
      volatility: 28.7,
      strategy: 'Covered Call',
      strike: 55.00,
      premium: 1.20,
      daysToExpiry: 21
    }
  ]);

  const [marketStatus, setMarketStatus] = useState({
    isOpen: true,
    lastUpdate: new Date().toLocaleTimeString('pt-BR'),
    volatilityIndex: 28.5,
    putCallRatio: 1.15
  });

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-50';
    if (score >= 70) return 'text-blue-600 bg-blue-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getROIColor = (roi) => {
    if (roi >= 20) return 'text-green-600';
    if (roi >= 15) return 'text-blue-600';
    if (roi >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header com Status do Mercado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral das oportunidades The Wheel</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${marketStatus.isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {marketStatus.isOpen ? 'Mercado Aberto' : 'Mercado Fechado'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            Última atualização: {marketStatus.lastUpdate}
          </div>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oportunidades Ativas</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{kpis.totalOpportunities}</div>
            <p className="text-xs text-gray-500">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Médio</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{kpis.avgWheelScore}</div>
            <p className="text-xs text-gray-500">
              Qualidade das oportunidades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ROI Médio Projetado</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{kpis.avgROI}%</div>
            <p className="text-xs text-gray-500">
              Anualizado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volatilidade Média</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{marketStatus.volatilityIndex}%</div>
            <p className="text-xs text-gray-500">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores de Mercado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Oportunidades The Wheel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topOpportunities.map((opportunity, index) => (
                <div key={opportunity.symbol} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-semibold">{opportunity.symbol}</div>
                      <div className="text-sm text-gray-500">{opportunity.name}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Preço</div>
                      <div className="font-semibold">{formatCurrency(opportunity.price)}</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Score</div>
                      <Badge className={`${getScoreColor(opportunity.wheelScore)}`}>
                        {opportunity.wheelScore}
                      </Badge>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">ROI Proj.</div>
                      <div className={`font-semibold ${getROIColor(opportunity.projectedROI)}`}>
                        {opportunity.projectedROI}%
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Estratégia</div>
                      <div className="text-sm font-medium">
                        {opportunity.strategy === 'Put Cash-Secured' ? 'Put CS' : 'Call Cob'}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Strike</div>
                      <div className="font-semibold">{formatCurrency(opportunity.strike)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                Ver Todas as Oportunidades
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Indicadores de Mercado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Put/Call Ratio</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{marketStatus.putCallRatio}</span>
                <Badge variant="secondary">Neutro</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">VIX Brasileiro</span>
              <div className="flex items-center gap-2">
                <span className="font-semibold">{marketStatus.volatilityIndex}%</span>
                <Badge className="bg-yellow-100 text-yellow-800">Moderado</Badge>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Sentimento</span>
              <Badge className="bg-blue-100 text-blue-800">{kpis.marketSentiment}</Badge>
            </div>
            
            <div className="pt-4 border-t">
              <div className="text-sm text-gray-600 mb-2">Distribuição por Estratégia</div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Put Cash-Secured</span>
                  <span className="text-sm font-semibold">57%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Covered Call</span>
                  <span className="text-sm font-semibold">43%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alertas e Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Alertas e Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-yellow-800">
                  3 opções vencem em 7 dias
                </div>
                <div className="text-xs text-yellow-600">
                  VALE3, MGLU3, WEGE3 - Considere rolagem ou fechamento
                </div>
              </div>
              <Button size="sm" variant="outline">
                Ver Detalhes
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-green-800">
                  Nova oportunidade identificada
                </div>
                <div className="text-xs text-green-600">
                  PETR4 - Score 89, ROI projetado 21.5%
                </div>
              </div>
              <Button size="sm" variant="outline">
                Analisar
              </Button>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Activity className="h-4 w-4 text-blue-600" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-800">
                  Volatilidade aumentou 15%
                </div>
                <div className="text-xs text-blue-600">
                  Bom momento para vender opções - Prêmios mais altos
                </div>
              </div>
              <Button size="sm" variant="outline">
                Ver Oportunidades
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button className="h-20 flex flex-col items-center justify-center gap-2">
              <Target className="h-6 w-6" />
              <span>Novo Screening</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <BarChart3 className="h-6 w-6" />
              <span>Analisar Ativo</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <PieChart className="h-6 w-6" />
              <span>Ver Opções</span>
            </Button>
            
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center gap-2">
              <Calendar className="h-6 w-6" />
              <span>Tutorial</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

