import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, TrendingDown, Clock, Activity } from 'lucide-react';
import { 
  calculateCompleteMetrics, 
  BRAZILIAN_STOCKS,
  formatCurrency,
  formatNumber,
  formatPercent
} from '@/lib/options';

const GreeksCalculator = () => {
  const [params, setParams] = useState({
    underlying: 28.50,
    strike: 28.00,
    premium: 0.80,
    daysToExpiry: 30,
    volatility: 0.35,
    riskFreeRate: 0.13,
    type: 'put',
    selectedStock: 'PETR4'
  });

  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const calculatedMetrics = calculateCompleteMetrics(params);
    setMetrics(calculatedMetrics);
  }, [params]);

  const handleStockChange = (stockCode) => {
    const stock = BRAZILIAN_STOCKS[stockCode];
    if (stock) {
      setParams(prev => ({
        ...prev,
        selectedStock: stockCode,
        underlying: stock.avgPrice,
        volatility: stock.avgVolatility,
        strike: stock.avgPrice * 0.98 // Strike 2% OTM
      }));
    }
  };

  const handleParamChange = (field, value) => {
    setParams(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const getGreekInterpretation = (greek, value) => {
    const interpretations = {
      delta: {
        description: "Sensibilidade ao preço do subjacente",
        interpretation: Math.abs(value) > 0.5 ? "Alta sensibilidade" : "Baixa sensibilidade",
        color: Math.abs(value) > 0.5 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
      },
      gamma: {
        description: "Aceleração do Delta",
        interpretation: value > 0.05 ? "Alta aceleração" : "Baixa aceleração",
        color: value > 0.05 ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"
      },
      theta: {
        description: "Decay temporal diário",
        interpretation: Math.abs(value) > 0.05 ? "Decay rápido" : "Decay lento",
        color: Math.abs(value) > 0.05 ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"
      },
      vega: {
        description: "Sensibilidade à volatilidade",
        interpretation: Math.abs(value) > 0.1 ? "Alta sensibilidade" : "Baixa sensibilidade",
        color: Math.abs(value) > 0.1 ? "bg-yellow-100 text-yellow-800" : "bg-indigo-100 text-indigo-800"
      }
    };
    return interpretations[greek] || {};
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Calculadora de Greeks - Mercado Brasileiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Seleção de Ação */}
            <div className="space-y-2">
              <Label>Ação Brasileira</Label>
              <Select value={params.selectedStock} onValueChange={handleStockChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(BRAZILIAN_STOCKS).map(([code, stock]) => (
                    <SelectItem key={code} value={code}>
                      {code} - {stock.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-xs text-gray-500">
                Setor: {BRAZILIAN_STOCKS[params.selectedStock]?.sector}
              </div>
            </div>

            {/* Tipo de Opção */}
            <div className="space-y-2">
              <Label>Tipo de Opção</Label>
              <Select value={params.type} onValueChange={(value) => setParams(prev => ({...prev, type: value}))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="put">Put (Venda)</SelectItem>
                  <SelectItem value="call">Call (Venda)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preço do Subjacente */}
            <div className="space-y-2">
              <Label>Preço Atual (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={params.underlying}
                onChange={(e) => handleParamChange('underlying', e.target.value)}
              />
            </div>

            {/* Strike */}
            <div className="space-y-2">
              <Label>Strike (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={params.strike}
                onChange={(e) => handleParamChange('strike', e.target.value)}
              />
            </div>

            {/* Prêmio */}
            <div className="space-y-2">
              <Label>Prêmio por Ação (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={params.premium}
                onChange={(e) => handleParamChange('premium', e.target.value)}
              />
            </div>

            {/* Dias até Vencimento */}
            <div className="space-y-2">
              <Label>Dias até Vencimento</Label>
              <Input
                type="number"
                value={params.daysToExpiry}
                onChange={(e) => handleParamChange('daysToExpiry', e.target.value)}
              />
            </div>

            {/* Volatilidade */}
            <div className="space-y-2">
              <Label>Volatilidade Implícita (%)</Label>
              <Input
                type="number"
                step="0.01"
                value={params.volatility * 100}
                onChange={(e) => handleParamChange('volatility', e.target.value / 100)}
              />
            </div>

            {/* Taxa Livre de Risco */}
            <div className="space-y-2">
              <Label>SELIC (% a.a.)</Label>
              <Input
                type="number"
                step="0.01"
                value={params.riskFreeRate * 100}
                onChange={(e) => handleParamChange('riskFreeRate', e.target.value / 100)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resultados dos Greeks */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Delta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-500" />
                Delta (Δ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {metrics.delta}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sensibilidade ao preço
              </div>
              <Badge className={`mt-2 text-xs ${getGreekInterpretation('delta', parseFloat(metrics.delta)).color}`}>
                {getGreekInterpretation('delta', parseFloat(metrics.delta)).interpretation}
              </Badge>
            </CardContent>
          </Card>

          {/* Gamma */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4 text-orange-500" />
                Gamma (Γ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {metrics.gamma}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Aceleração do Delta
              </div>
              <Badge className={`mt-2 text-xs ${getGreekInterpretation('gamma', parseFloat(metrics.gamma)).color}`}>
                {getGreekInterpretation('gamma', parseFloat(metrics.gamma)).interpretation}
              </Badge>
            </CardContent>
          </Card>

          {/* Theta */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-purple-500" />
                Theta (Θ)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metrics.theta}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Decay diário (R$)
              </div>
              <Badge className={`mt-2 text-xs ${getGreekInterpretation('theta', parseFloat(metrics.theta)).color}`}>
                {getGreekInterpretation('theta', parseFloat(metrics.theta)).interpretation}
              </Badge>
            </CardContent>
          </Card>

          {/* Vega */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-green-500" />
                Vega (ν)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {metrics.vega}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Sensibilidade à volatilidade
              </div>
              <Badge className={`mt-2 text-xs ${getGreekInterpretation('vega', parseFloat(metrics.vega)).color}`}>
                {getGreekInterpretation('vega', parseFloat(metrics.vega)).interpretation}
              </Badge>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Métricas Adicionais */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Métricas da Estratégia The Wheel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600">Probabilidade de Exercício</div>
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.exerciseProbability}%
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Baseada no Delta
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600">Break-even</div>
                <div className="text-2xl font-bold text-green-600">
                  {metrics.breakEven}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {params.type === 'put' ? 'Strike - Prêmio' : 'Strike + Prêmio'}
                </div>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600">Moneyness</div>
                <div className="text-2xl font-bold text-purple-600">
                  {params.type === 'put' 
                    ? (params.underlying > params.strike ? 'OTM' : 'ITM')
                    : (params.underlying < params.strike ? 'OTM' : 'ITM')
                  }
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {params.type === 'put' ? 'Ação vs Strike' : 'Strike vs Ação'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explicações Educacionais */}
      <Card>
        <CardHeader>
          <CardTitle>Interpretação dos Greeks (Mercado Brasileiro)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Delta (Δ)</h4>
              <p className="text-sm text-blue-700">
                Para cada R$ 1,00 de variação na ação, a opção varia ~{Math.abs(parseFloat(metrics?.delta || 0)).toFixed(2)} centavos.
                {params.type === 'put' ? ' Puts têm delta negativo.' : ' Calls têm delta positivo.'}
              </p>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg">
              <h4 className="font-semibold text-orange-800 mb-2">Gamma (Γ)</h4>
              <p className="text-sm text-orange-700">
                Mede como o Delta muda. Gamma alto significa que movimentos bruscos da ação 
                afetam muito o Delta - risco para vendedores de opções.
              </p>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Theta (Θ)</h4>
              <p className="text-sm text-purple-700">
                Decay diário: R$ {Math.abs(parseFloat(metrics?.theta || 0)).toFixed(4)} por dia.
                Positivo para vendedores - você ganha com a passagem do tempo.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Vega (ν)</h4>
              <p className="text-sm text-green-700">
                Para cada 1% de aumento na volatilidade implícita, a opção varia R$ {Math.abs(parseFloat(metrics?.vega || 0)).toFixed(4)}.
                Vendedores preferem volatilidade baixa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GreeksCalculator;

