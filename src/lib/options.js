/**
 * Utilitários de opções para o módulo Tutorial/Simulador (educacional).
 * Fórmulas simplificadas, sem considerar impostos, comissões ou ajustes corporativos.
 */

/**
 * Calcula métricas para venda de put cash-secured
 * @param {Object} params - Parâmetros da put
 * @param {number} params.underlying - Preço atual do subjacente
 * @param {number} params.strike - Strike da put
 * @param {number} params.premium - Prêmio por ação
 * @param {number} params.daysToExpiry - Dias até vencimento
 * @param {number} [params.contractSize=100] - Tamanho do contrato
 * @param {number} [params.deltaAbsApprox] - Delta aproximado (0-1)
 * @returns {Object} Métricas calculadas
 */
export function cashSecuredPutMetrics(params) {
  const {
    underlying,
    strike,
    premium,
    daysToExpiry,
    contractSize = 100,
    deltaAbsApprox
  } = params;

  const grossCollateral = strike * contractSize;
  const credit = premium * contractSize;
  const netCashRequired = Math.max(grossCollateral - credit, 0);

  const breakeven = strike - premium;
  const maxProfit = credit;              // se expirar OTM
  const maxLoss = breakeven * contractSize; // cenário extremo: subjacente → 0
  const roi = netCashRequired > 0 ? maxProfit / netCashRequired : 0;
  const annualizedROI = daysToExpiry > 0 ? roi * (365 / daysToExpiry) : 0;

  const assignmentProb = deltaAbsApprox !== undefined
    ? Math.max(0, Math.min(1, deltaAbsApprox))
    : undefined;

  return {
    grossCollateral,
    credit,
    netCashRequired,
    breakeven,
    maxProfit,
    maxLoss,
    roi,
    annualizedROI,
    assignmentProb
  };
}

/**
 * Calcula métricas para covered call
 * @param {Object} params - Parâmetros da covered call
 * @param {number} params.shares - Número de ações em carteira
 * @param {number} params.costBasis - Preço médio por ação
 * @param {number} params.callStrike - Strike da call
 * @param {number} params.premium - Prêmio por ação
 * @param {number} params.daysToExpiry - Dias até vencimento
 * @param {number} [params.contractSize=100] - Tamanho do contrato
 * @returns {Object} Métricas calculadas
 */
export function coveredCallMetrics(params) {
  const {
    shares,
    costBasis,
    callStrike,
    premium,
    daysToExpiry,
    contractSize = 100
  } = params;

  const contracts = Math.floor(shares / contractSize);
  const effectiveShares = contracts * contractSize;

  const credit = premium * effectiveShares;
  const upsidePerShare = Math.max(0, callStrike - costBasis);
  const upsideCap = upsidePerShare * effectiveShares + credit;

  const positionCost = costBasis * effectiveShares;
  const roiAtCall = positionCost > 0 ? upsideCap / positionCost : 0;

  const breakevenDownside = costBasis - premium;
  const maxLossIfZero = Math.max(0, costBasis) * effectiveShares - credit;

  const annualizedROI = daysToExpiry > 0 ? roiAtCall * (365 / daysToExpiry) : 0;

  return {
    contracts,
    credit,
    upsideCap,
    roiAtCall,
    annualizedROI,
    breakevenDownside,
    maxLossIfZero
  };
}

/**
 * Gera pontos para gráfico de payoff de put vendida
 * @param {Object} params - Parâmetros da put
 * @param {number} [xMin] - Preço mínimo para o gráfico
 * @param {number} [xMax] - Preço máximo para o gráfico
 * @param {number} [steps=40] - Número de pontos
 * @returns {Array} Array de pontos {x, y}
 */
export function payoffPointsPut(params, xMin, xMax, steps = 40) {
  const { strike, premium, contractSize = 100 } = params;
  const xmin = xMin ?? Math.max(0, strike * 0.5);
  const xmax = xMax ?? strike * 1.5;
  
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const S = xmin + (i * (xmax - xmin)) / steps;
    const intrinsic = Math.max(0, strike - S);
    const payoffPerShare = premium - intrinsic; // vendido: recebe prêmio, perde se ITM
    const y = payoffPerShare * contractSize;
    points.push({ x: S, y });
  }
  return points;
}

/**
 * Gera pontos para gráfico de payoff de covered call
 * @param {Object} params - Parâmetros da covered call
 * @param {number} [xMin] - Preço mínimo para o gráfico
 * @param {number} [xMax] - Preço máximo para o gráfico
 * @param {number} [steps=40] - Número de pontos
 * @returns {Array} Array de pontos {x, y}
 */
export function payoffPointsCoveredCall(params, xMin, xMax, steps = 40) {
  const { shares, costBasis, callStrike, premium, contractSize = 100 } = params;
  const contracts = Math.floor(shares / contractSize);
  const N = contracts * contractSize;

  const xmin = xMin ?? Math.max(0, costBasis * 0.5);
  const xmax = xMax ?? callStrike * 1.6;
  
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const S = xmin + (i * (xmax - xmin)) / steps;
    // Lucro nas ações (limitado pelo strike) + prêmio recebido
    const stockPnLPerShare = Math.min(S, callStrike) - costBasis;
    const y = stockPnLPerShare * N + premium * N;
    points.push({ x: S, y });
  }
  return points;
}

/**
 * Formata valor monetário
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
export function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Formata percentual
 * @param {number} value - Valor a ser formatado (0.1 = 10%)
 * @returns {string} Percentual formatado
 */
export function formatPercent(value) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Formata número
 * @param {number} value - Valor a ser formatado
 * @param {number} [decimals=2] - Número de casas decimais
 * @returns {string} Número formatado
 */
export function formatNumber(value, decimals = 2) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

