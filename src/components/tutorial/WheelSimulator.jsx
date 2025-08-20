import React, { useState, useMemo } from 'react';
import { Calculator, TrendingUp, TrendingDown, Info } from 'lucide-react';
import PayoffChart from './PayoffChart';
import GlossaryTooltip from './GlossaryTooltip';
import {
  cashSecuredPutMetrics,
  coveredCallMetrics,
  payoffPointsPut,
  payoffPointsCoveredCall,
  formatCurrency,
  formatPercent,
  formatNumber
} from '../../lib/options';

/**
 * Simulador interativo da estratégia The Wheel
 * @param {Object} props
 * @param {'put' | 'coveredCall'} props.mode - Modo do simulador
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function WheelSimulator({ mode = 'put', className = '' }) {
  // Estados para Put Cash-Secured
  const [putParams, setPutParams] = useState({
    underlying: 50.00,
    strike: 48.00,
    premium: 2.50,
    daysToExpiry: 30,
    deltaAbsApprox: 0.30
  });

  // Estados para Covered Call
  const [ccParams, setCcParams] = useState({
    shares: 100,
    costBasis: 48.00,
    callStrike: 52.00,
    premium: 1.80,
    daysToExpiry: 30
  });

  // Cálculos para Put
  const putMetrics = useMemo(() => {
    try {
      return cashSecuredPutMetrics(putParams);
    } catch (error) {
      console.error('Erro no cálculo de put:', error);
      return null;
    }
  }, [putParams]);

  // Cálculos para Covered Call
  const ccMetrics = useMemo(() => {
    try {
      return coveredCallMetrics(ccParams);
    } catch (error) {
      console.error('Erro no cálculo de covered call:', error);
      return null;
    }
  }, [ccParams]);

  // Pontos para gráfico
  const payoffPoints = useMemo(() => {
    if (mode === 'put' && putMetrics) {
      return payoffPointsPut(putParams);
    } else if (mode === 'coveredCall' && ccMetrics) {
      return payoffPointsCoveredCall(ccParams);
    }
    return [];
  }, [mode, putParams, ccParams, putMetrics, ccMetrics]);

  const handlePutChange = (field, value) => {
    setPutParams(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleCcChange = (field, value) => {
    setCcParams(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const isPutMode = mode === 'put';
  const currentMetrics = isPutMode ? putMetrics : ccMetrics;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="w-6 h-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">
          {isPutMode ? 'Simulador: Put Cash-Secured' : 'Simulador: Covered Call'}
        </h3>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Parâmetros</h4>
          
          {isPutMode ? (
            // Inputs para Put Cash-Secured
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Atual do Ativo
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={putParams.underlying}
                  onChange={(e) => handlePutChange('underlying', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <GlossaryTooltip term="Strike" /> da Put
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={putParams.strike}
                  onChange={(e) => handlePutChange('strike', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prêmio por Ação (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={putParams.premium}
                  onChange={(e) => handlePutChange('premium', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <GlossaryTooltip term="DTE" /> (Dias)
                </label>
                <input
                  type="number"
                  value={putParams.daysToExpiry}
                  onChange={(e) => handlePutChange('daysToExpiry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <GlossaryTooltip term="Delta" /> (0-1)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={putParams.deltaAbsApprox}
                  onChange={(e) => handlePutChange('deltaAbsApprox', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            // Inputs para Covered Call
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ações em Carteira
                </label>
                <input
                  type="number"
                  value={ccParams.shares}
                  onChange={(e) => handleCcChange('shares', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Médio por Ação
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ccParams.costBasis}
                  onChange={(e) => handleCcChange('costBasis', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <GlossaryTooltip term="Strike" /> da Call
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ccParams.callStrike}
                  onChange={(e) => handleCcChange('callStrike', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prêmio por Ação (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ccParams.premium}
                  onChange={(e) => handleCcChange('premium', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <GlossaryTooltip term="DTE" /> (Dias)
                </label>
                <input
                  type="number"
                  value={ccParams.daysToExpiry}
                  onChange={(e) => handleCcChange('daysToExpiry', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Resultados</h4>
          
          {currentMetrics ? (
            <div className="grid grid-cols-2 gap-4">
              {isPutMode ? (
                // Métricas para Put
                <>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Colateral Bruto</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {formatCurrency(putMetrics.grossCollateral)}
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Crédito Recebido</div>
                    <div className="text-lg font-semibold text-green-900">
                      {formatCurrency(putMetrics.credit)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">
                      <GlossaryTooltip term="Breakeven" />
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      R$ {formatNumber(putMetrics.breakeven)}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">ROI Anualizado</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {formatPercent(putMetrics.annualizedROI)}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">Prob. Exercício</div>
                    <div className="text-lg font-semibold text-yellow-900">
                      {putMetrics.assignmentProb ? formatPercent(putMetrics.assignmentProb) : 'N/A'}
                    </div>
                  </div>

                  <div className="bg-red-50 p-3 rounded-lg">
                    <div className="text-sm text-red-600 font-medium">Lucro Máximo</div>
                    <div className="text-lg font-semibold text-red-900">
                      {formatCurrency(putMetrics.maxProfit)}
                    </div>
                  </div>
                </>
              ) : (
                // Métricas para Covered Call
                <>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm text-blue-600 font-medium">Contratos</div>
                    <div className="text-lg font-semibold text-blue-900">
                      {ccMetrics.contracts}
                    </div>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm text-green-600 font-medium">Crédito Recebido</div>
                    <div className="text-lg font-semibold text-green-900">
                      {formatCurrency(ccMetrics.credit)}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <div className="text-sm text-purple-600 font-medium">Upside Cap</div>
                    <div className="text-lg font-semibold text-purple-900">
                      {formatCurrency(ccMetrics.upsideCap)}
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded-lg">
                    <div className="text-sm text-yellow-600 font-medium">ROI se Exercido</div>
                    <div className="text-lg font-semibold text-yellow-900">
                      {formatPercent(ccMetrics.roiAtCall)}
                    </div>
                  </div>

                  <div className="bg-indigo-50 p-3 rounded-lg">
                    <div className="text-sm text-indigo-600 font-medium">ROI Anualizado</div>
                    <div className="text-lg font-semibold text-indigo-900">
                      {formatPercent(ccMetrics.annualizedROI)}
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm text-gray-600 font-medium">
                      <GlossaryTooltip term="Breakeven" /> Downside
                    </div>
                    <div className="text-lg font-semibold text-gray-900">
                      R$ {formatNumber(ccMetrics.breakevenDownside)}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
              <div className="text-gray-500">Erro no cálculo das métricas</div>
            </div>
          )}

          {/* Alertas e dicas */}
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <div className="font-medium mb-1">Dica:</div>
                {isPutMode ? (
                  <div>
                    Se exercido, você comprará {putParams.underlying > putParams.strike ? 'acima' : 'abaixo'} do preço atual.
                    Considere vender covered calls na sequência para continuar o ciclo.
                  </div>
                ) : (
                  <div>
                    Se exercido, suas ações serão vendidas pelo strike. 
                    Considere reiniciar o ciclo vendendo puts novamente.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Payoff */}
      <div className="mt-8">
        <PayoffChart
          points={payoffPoints}
          title={isPutMode ? 'Payoff: Put Cash-Secured' : 'Payoff: Covered Call'}
          xLabel="Preço do Ativo no Vencimento (R$)"
          yLabel="Lucro/Prejuízo Total (R$)"
        />
      </div>

      {/* Explicação da estratégia */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">
          {isPutMode ? 'Como funciona a Put Cash-Secured:' : 'Como funciona a Covered Call:'}
        </h5>
        <div className="text-sm text-blue-800 space-y-2">
          {isPutMode ? (
            <>
              <p>• Você vende uma put e recebe o prêmio imediatamente</p>
              <p>• Mantém colateral em caixa para eventual exercício</p>
              <p>• Se a ação ficar acima do strike, fica com o prêmio</p>
              <p>• Se exercido, compra ações pelo strike (custo efetivo = strike - prêmio)</p>
            </>
          ) : (
            <>
              <p>• Você possui ações e vende calls sobre elas</p>
              <p>• Recebe prêmio imediatamente</p>
              <p>• Se a ação ficar abaixo do strike, fica com ações + prêmio</p>
              <p>• Se exercido, vende ações pelo strike + mantém o prêmio</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

