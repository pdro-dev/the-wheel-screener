import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Calculator, TrendingUp, BarChart3, DollarSign, Target, AlertTriangle, CheckCircle } from 'lucide-react'

const TutorialPageExpanded = () => {
  const [activeSection, setActiveSection] = useState('introducao')

  const sections = [
    { id: 'introducao', title: 'Introdução ao The Wheel', icon: BookOpen, color: 'bg-blue-500' },
    { id: 'fundamentos', title: 'Fundamentos Quantitativos', icon: Calculator, color: 'bg-green-500' },
    { id: 'sentimento', title: 'Indicadores de Sentimento', icon: TrendingUp, color: 'bg-purple-500' },
    { id: 'macro', title: 'Indicadores Macroeconômicos', icon: BarChart3, color: 'bg-orange-500' },
    { id: 'modelos', title: 'Modelos Quantitativos', icon: Target, color: 'bg-red-500' },
    { id: 'dados', title: 'Dados da Aplicação', icon: DollarSign, color: 'bg-cyan-500' },
    { id: 'interatividade', title: 'Simuladores e Calculadoras', icon: Calculator, color: 'bg-pink-500' },
    { id: 'praticas', title: 'Boas Práticas', icon: CheckCircle, color: 'bg-emerald-500' }
  ]

  const sectionContent = {
    introducao: {
      title: "Introdução ao The Wheel",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold mb-4 text-blue-800">Conceito Fundamental</h3>
            <p className="text-gray-700 mb-4">
              A estratégia <strong>The Wheel</strong> é um ciclo contínuo de operações com opções que busca gerar renda recorrente através de prêmios. O ciclo funciona da seguinte forma:
            </p>
            <div className="bg-white p-4 rounded border border-blue-300">
              <div className="text-center text-lg font-semibold text-blue-600 mb-2">
                Puts → Ações → Calls → Repeat
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Como Funciona</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <strong>1. Puts Cash-Secured</strong>
                    <p className="text-sm text-gray-600">Vende-se uma opção de <strong>put</strong> com caixa reservado para eventual exercício</p>
                    <p className="text-sm text-gray-600">Recebe-se o <strong>prêmio</strong> pela venda da put</p>
                    <p className="text-sm text-gray-600">Se exercido, compra-se o ativo pelo Strike da put</p>
                    <p className="text-sm text-gray-600">O custo efetivo é: <code>Strike - Prêmio recebido</code></p>
                  </div>
                  
                  <div>
                    <strong>2. Covered Calls</strong>
                    <p className="text-sm text-gray-600">Com as ações em carteira, vende-se <strong>calls cobertas</strong></p>
                    <p className="text-sm text-gray-600">Gera-se renda adicional através dos prêmios das calls</p>
                    <p className="text-sm text-gray-600">Se exercido, entrega-se as ações pelo strike da call</p>
                    <p className="text-sm text-gray-600">Reinicia-se o ciclo vendendo puts novamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">Benefícios e Riscos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-600 flex items-center">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Benefícios
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-6">
                      <li>✅ <strong>Geração de renda</strong> por prêmios de forma recorrente</li>
                      <li>✅ <strong>Disciplina operacional</strong> com regras claras de entrada/saída</li>
                      <li>✅ <strong>Abordagem sistemática</strong> e replicável</li>
                      <li>✅ <strong>Redução do custo médio</strong> através dos prêmios recebidos</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-red-600 flex items-center">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Riscos
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1 ml-6">
                      <li>⚠️ <strong>Exercício em mercados em queda</strong> (drawdowns significativos)</li>
                      <li>⚠️ <strong>Concentração em poucos ativos/setores</strong></li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h3 className="text-xl font-semibold mb-4 text-yellow-800">Adaptação ao Mercado Brasileiro</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Especificidades da B3:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Códigos de ticker:</strong> PETR4, VALE3, ITUB4</li>
                  <li>• <strong>Lotes padrão:</strong> 100 ações por contrato</li>
                  <li>• <strong>Vencimentos:</strong> Terceira segunda-feira do mês</li>
                  <li>• <strong>Liquidez:</strong> Concentrada em blue chips</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Considerações Importantes:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Taxa SELIC:</strong> ~13% a.a. como taxa livre de risco</li>
                  <li>• <strong>Volatilidade:</strong> Maior que mercados desenvolvidos</li>
                  <li>• <strong>Risco cambial:</strong> Para exportadoras (VALE3, PETR4)</li>
                  <li>• <strong>Liquidez limitada:</strong> Foco em ações de alta liquidez</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )
    },
    
    fundamentos: {
      title: "Fundamentos de Trading Quantitativo",
      content: (
        <div className="space-y-6">
          <div className="bg-green-50 p-6 rounded-lg border border-green-200">
            <h3 className="text-xl font-semibold mb-4 text-green-800">Backtesting e Otimização</h3>
            <p className="text-gray-700 mb-4">
              O backtesting é fundamental para validar estratégias antes da implementação real. Para The Wheel, analisamos:
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold mb-2">Métricas de Performance:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Sharpe Ratio:</strong> Retorno ajustado ao risco</li>
                  <li>• <strong>Maximum Drawdown:</strong> Maior perda consecutiva</li>
                  <li>• <strong>Win Rate:</strong> % de operações lucrativas</li>
                  <li>• <strong>Profit Factor:</strong> Lucros/Prejuízos</li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold mb-2">Parâmetros de Otimização:</h4>
                <ul className="text-sm space-y-1">
                  <li>• <strong>Delta das puts:</strong> 0.15 - 0.30</li>
                  <li>• <strong>DTE (Days to Expiration):</strong> 30-45 dias</li>
                  <li>• <strong>Profit target:</strong> 25-50% do prêmio</li>
                  <li>• <strong>Stop loss:</strong> 200-300% do prêmio</li>
                </ul>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Exemplo Prático: PETR4</CardTitle>
              <CardDescription>Análise quantitativa de uma operação real</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <strong>Dados da Operação:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>Ativo: PETR4</li>
                      <li>Preço atual: R$ 32,50</li>
                      <li>Strike put: R$ 30,00</li>
                      <li>Prêmio: R$ 1,20</li>
                      <li>DTE: 35 dias</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Cálculos:</strong>
                    <ul className="mt-2 space-y-1">
                      <li>Delta: -0.25</li>
                      <li>Prob. exercício: 25%</li>
                      <li>Breakeven: R$ 28,80</li>
                      <li>ROI máximo: 4,17%</li>
                      <li>ROI anualizado: 43,5%</li>
                    </ul>
                  </div>
                  <div>
                    <strong>Cenários:</strong>
                    <ul className="mt-2 space-y-1">
                        <li>PETR4 &gt; R$ 30: Lucro R$ 120</li>
                      <li>PETR4 = R$ 29: Exercício + R$ 20</li>
                      <li>PETR4 = R$ 28: Exercício - R$ 80</li>
                      <li>PETR4 &lt; R$ 28,80: Prejuízo</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },

    sentimento: {
      title: "Indicadores de Sentimento e Opções",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
            <h3 className="text-xl font-semibold mb-4 text-purple-800">Put/Call Ratio</h3>
            <p className="text-gray-700 mb-4">
              O Put/Call Ratio mede o sentimento do mercado através da relação entre volume de puts e calls negociadas.
            </p>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-red-600">Ratio &gt; 1.0</h4>
                <p className="text-sm">Sentimento pessimista</p>
                <p className="text-sm">Mais puts que calls</p>
                <p className="text-sm"><strong>Estratégia:</strong> Vender puts</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-yellow-600">Ratio = 0.7-1.0</h4>
                <p className="text-sm">Sentimento neutro</p>
                <p className="text-sm">Equilíbrio relativo</p>
                <p className="text-sm"><strong>Estratégia:</strong> The Wheel normal</p>
              </div>
              <div className="bg-white p-4 rounded border">
                <h4 className="font-semibold text-green-600">Ratio &lt; 0.7</h4>
                <p className="text-sm">Sentimento otimista</p>
                <p className="text-sm">Mais calls que puts</p>
                <p className="text-sm"><strong>Estratégia:</strong> Covered calls</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>VIX Brasileiro</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Mede a volatilidade implícita das opções do Ibovespa, indicando o "medo" do mercado.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">VIX &lt; 20%:</span>
                      <Badge variant="outline" className="text-green-600">Baixa volatilidade</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">VIX 20-30%:</span>
                      <Badge variant="outline" className="text-yellow-600">Volatilidade moderada</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">VIX &gt; 30%:</span>
                      <Badge variant="outline" className="text-red-600">Alta volatilidade</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    <strong>Dica:</strong> Alta volatilidade = prêmios maiores, mas maior risco
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Open Interest</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Número total de contratos em aberto, indica liquidez e interesse do mercado.
                  </p>
                  <div className="bg-gray-50 p-3 rounded">
                    <h4 className="font-semibold text-sm mb-2">Análise por Strike:</h4>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>Alto OI em puts:</strong> Suporte técnico</li>
                      <li>• <strong>Alto OI em calls:</strong> Resistência técnica</li>
                      <li>• <strong>Concentração de OI:</strong> Pontos de interesse</li>
                      <li>• <strong>Mudanças no OI:</strong> Fluxo de posições</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },

    interatividade: {
      title: "Simuladores e Calculadoras",
      content: (
        <div className="space-y-6">
          <div className="bg-pink-50 p-6 rounded-lg border border-pink-200">
            <h3 className="text-xl font-semibold mb-4 text-pink-800">Calculadora de Greeks Avançada</h3>
            <p className="text-gray-700 mb-4">
              Use nossa calculadora para analisar o comportamento das opções com dados reais do mercado brasileiro.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Calculadora de Greeks - Mercado Brasileiro</CardTitle>
              <CardDescription>Análise completa com dados da B3</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Ativo</label>
                    <select className="w-full p-2 border rounded">
                      <option value="PETR4">PETR4 - Petrobras PN</option>
                      <option value="VALE3">VALE3 - Vale ON</option>
                      <option value="ITUB4">ITUB4 - Itaú Unibanco PN</option>
                      <option value="BBAS3">BBAS3 - Banco do Brasil ON</option>
                      <option value="BOVA11">BOVA11 - ETF Ibovespa</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Preço Atual</label>
                      <input type="number" className="w-full p-2 border rounded" defaultValue="32.50" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Strike</label>
                      <input type="number" className="w-full p-2 border rounded" defaultValue="30.00" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Volatilidade (%)</label>
                      <input type="number" className="w-full p-2 border rounded" defaultValue="35" />
                    </div>
                    <div>
                      <label className="text-sm font-medium">DTE (dias)</label>
                      <input type="number" className="w-full p-2 border rounded" defaultValue="35" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Taxa SELIC (%)</label>
                    <input type="number" className="w-full p-2 border rounded" defaultValue="13.0" />
                  </div>
                  
                  <Button className="w-full">Calcular Greeks</Button>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded">
                    <h4 className="font-semibold mb-3">Resultados:</h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium">Delta:</span>
                        <span className="float-right">-0.25</span>
                      </div>
                      <div>
                        <span className="font-medium">Gamma:</span>
                        <span className="float-right">0.08</span>
                      </div>
                      <div>
                        <span className="font-medium">Theta:</span>
                        <span className="float-right">-0.03</span>
                      </div>
                      <div>
                        <span className="font-medium">Vega:</span>
                        <span className="float-right">0.12</span>
                      </div>
                      <div>
                        <span className="font-medium">Prob. Exercício:</span>
                        <span className="float-right">25%</span>
                      </div>
                      <div>
                        <span className="font-medium">Prêmio Teórico:</span>
                        <span className="float-right">R$ 1,18</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <h4 className="font-semibold mb-2 text-blue-800">Interpretação:</h4>
                    <ul className="text-xs space-y-1">
                      <li>• <strong>Delta -0.25:</strong> Para cada R$ 1 de alta no ativo, a put perde R$ 0,25</li>
                      <li>• <strong>Theta -0.03:</strong> A put perde R$ 0,03 por dia (decay temporal)</li>
                      <li>• <strong>Vega 0.12:</strong> Para cada 1% de aumento na volatilidade, +R$ 0,12</li>
                      <li>• <strong>25% de exercício:</strong> Probabilidade de terminar ITM</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Simulador de Rolagem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Simule estratégias de rolagem quando suas posições estão no prejuízo.
                  </p>
                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <h4 className="font-semibold text-sm mb-2">Cenário de Rolagem:</h4>
                    <ul className="text-xs space-y-1">
                      <li>• Put vendida PETR4 R$ 30 por R$ 1,20</li>
                      <li>• Ativo em R$ 28 (ITM)</li>
                      <li>• Opção vale R$ 2,50 (prejuízo R$ 1,30)</li>
                      <li>• <strong>Estratégia:</strong> Rolar para strike R$ 28 próximo vencimento</li>
                    </ul>
                  </div>
                  <Button variant="outline" className="w-full">Simular Rolagem</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Análise de Risco/Retorno</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Analise diferentes cenários de preço para sua estratégia.
                  </p>
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <h4 className="font-semibold text-sm mb-2">Análise de Cenários:</h4>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>PETR4 R$ 35:</span>
                        <span className="text-green-600">+R$ 120 (4,17%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PETR4 R$ 30:</span>
                        <span className="text-green-600">+R$ 120 (4,17%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>PETR4 R$ 28:</span>
                        <span className="text-red-600">-R$ 80 (-2,78%)</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">Analisar Cenários</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    }
  }

  const currentSection = sectionContent[activeSection] || sectionContent.introducao

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <BookOpen className="mr-3 h-8 w-8" />
            Tutorial / Educacional
          </h1>
          <p className="text-muted-foreground">The Wheel Screener Academy</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center space-x-3 ${
                        activeSection === section.id
                          ? 'bg-red-100 text-red-700 border-l-4 border-red-500'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-3 h-3 rounded-full ${section.color}`} />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{section.title}</span>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{currentSection.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSection.content}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default TutorialPageExpanded
