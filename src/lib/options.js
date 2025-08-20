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


/**
 * FUNÇÕES AVANÇADAS BASEADAS NO CONTEÚDO DO PDF
 * Implementação de Greeks e cálculos específicos para o mercado brasileiro
 */

// Função auxiliar para distribuição normal padrão
function normalCDF(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

// Função auxiliar para densidade de probabilidade normal
function normalPDF(x) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

// Função auxiliar para erro (aproximação)
function erf(x) {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}

// Cálculo de d1 para Black-Scholes
function calculateD1(S, K, T, r, sigma) {
  return (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * Math.sqrt(T));
}

/**
 * Cálculo de Delta - sensibilidade ao preço do subjacente
 * @param {number} S - Preço atual do subjacente
 * @param {number} K - Strike da opção
 * @param {number} T - Tempo até vencimento (em anos)
 * @param {number} r - Taxa livre de risco (SELIC/CDI)
 * @param {number} sigma - Volatilidade implícita
 * @param {string} type - 'call' ou 'put'
 * @returns {number} Delta da opção
 */
export function calculateDelta(S, K, T, r, sigma, type) {
  if (T <= 0) return type === 'call' ? (S > K ? 1 : 0) : (S < K ? -1 : 0);
  
  const d1 = calculateD1(S, K, T, r, sigma);
  
  if (type === 'call') {
    return normalCDF(d1);
  } else {
    return normalCDF(d1) - 1;
  }
}

/**
 * Cálculo de Gamma - aceleração do Delta
 * @param {number} S - Preço atual do subjacente
 * @param {number} K - Strike da opção
 * @param {number} T - Tempo até vencimento (em anos)
 * @param {number} r - Taxa livre de risco
 * @param {number} sigma - Volatilidade implícita
 * @returns {number} Gamma da opção
 */
export function calculateGamma(S, K, T, r, sigma) {
  if (T <= 0) return 0;
  
  const d1 = calculateD1(S, K, T, r, sigma);
  return normalPDF(d1) / (S * sigma * Math.sqrt(T));
}

/**
 * Cálculo de Theta - decay temporal (adaptado para mercado brasileiro)
 * @param {number} S - Preço atual do subjacente
 * @param {number} K - Strike da opção
 * @param {number} T - Tempo até vencimento (em anos)
 * @param {number} r - Taxa livre de risco (SELIC ~13% aa)
 * @param {number} sigma - Volatilidade implícita
 * @param {string} type - 'call' ou 'put'
 * @returns {number} Theta da opção (decay diário)
 */
export function calculateTheta(S, K, T, r, sigma, type) {
  if (T <= 0) return 0;
  
  const d1 = calculateD1(S, K, T, r, sigma);
  const d2 = d1 - sigma * Math.sqrt(T);
  
  const term1 = -(S * normalPDF(d1) * sigma) / (2 * Math.sqrt(T));
  
  if (type === 'call') {
    const term2 = r * K * Math.exp(-r * T) * normalCDF(d2);
    return (term1 - term2) / 365; // Convertido para decay diário
  } else {
    const term2 = r * K * Math.exp(-r * T) * normalCDF(-d2);
    return (term1 + term2) / 365; // Convertido para decay diário
  }
}

/**
 * Cálculo de Vega - sensibilidade à volatilidade
 * @param {number} S - Preço atual do subjacente
 * @param {number} K - Strike da opção
 * @param {number} T - Tempo até vencimento (em anos)
 * @param {number} r - Taxa livre de risco
 * @param {number} sigma - Volatilidade implícita
 * @returns {number} Vega da opção
 */
export function calculateVega(S, K, T, r, sigma) {
  if (T <= 0) return 0;
  
  const d1 = calculateD1(S, K, T, r, sigma);
  return S * normalPDF(d1) * Math.sqrt(T) / 100; // Dividido por 100 para % de volatilidade
}

/**
 * Calcula probabilidade de exercício baseada no Delta
 * @param {number} delta - Delta da opção
 * @param {string} type - 'call' ou 'put'
 * @returns {number} Probabilidade em percentual (0-100)
 */
export function calculateExerciseProbability(delta, type) {
  if (type === 'put') {
    return Math.abs(delta) * 100; // Delta negativo para puts
  } else {
    return delta * 100; // Delta positivo para calls
  }
}

/**
 * Cálculo de Break-even para estratégias The Wheel
 * @param {number} strike - Strike da opção
 * @param {number} premium - Prêmio recebido por ação
 * @param {string} type - 'put' ou 'call'
 * @returns {number} Preço de break-even
 */
export function calculateBreakEven(strike, premium, type) {
  if (type === 'put') {
    return strike - premium; // Put: Strike - Prêmio recebido
  } else {
    return strike + premium; // Call: Strike + Prêmio recebido
  }
}

/**
 * Cálculo de ROI anualizado específico para mercado brasileiro
 * @param {number} premium - Prêmio recebido
 * @param {number} capital - Capital empregado
 * @param {number} days - Dias da operação
 * @returns {number} ROI anualizado em percentual
 */
export function calculateAnnualizedROI(premium, capital, days) {
  if (capital <= 0 || days <= 0) return 0;
  
  const periodReturn = premium / capital;
  const periodsPerYear = 365 / days;
  return ((1 + periodReturn) ** periodsPerYear - 1) * 100;
}

/**
 * Simulação de rolagem de opções
 * @param {number} currentPrice - Preço atual da opção
 * @param {number} newPrice - Preço da nova opção
 * @param {number} contracts - Número de contratos
 * @returns {Object} Resultado da rolagem
 */
export function calculateRollCost(currentPrice, newPrice, contracts = 1) {
  const rollCost = (newPrice - currentPrice) * contracts * 100;
  return {
    cost: rollCost,
    isCredit: rollCost < 0,
    netCredit: Math.abs(rollCost),
    description: rollCost < 0 ? 'Crédito recebido' : 'Débito pago'
  };
}

/**
 * Dados de exemplo de ações brasileiras líquidas (baseado no PDF)
 */
export const BRAZILIAN_STOCKS = {
  PETR4: {
    name: 'Petrobras PN',
    sector: 'Petróleo e Gás',
    avgVolatility: 0.35,
    avgPrice: 28.50,
    liquidityRating: 'Alta'
  },
  VALE3: {
    name: 'Vale ON',
    sector: 'Mineração',
    avgVolatility: 0.32,
    avgPrice: 65.40,
    liquidityRating: 'Alta'
  },
  ITUB4: {
    name: 'Itaú Unibanco PN',
    sector: 'Bancos',
    avgVolatility: 0.28,
    avgPrice: 37.80,
    liquidityRating: 'Alta'
  },
  BBAS3: {
    name: 'Banco do Brasil ON',
    sector: 'Bancos',
    avgVolatility: 0.30,
    avgPrice: 45.20,
    liquidityRating: 'Alta'
  },
  BOVA11: {
    name: 'ETF Bovespa',
    sector: 'ETF',
    avgVolatility: 0.25,
    avgPrice: 118.50,
    liquidityRating: 'Muito Alta'
  }
};

/**
 * Calcula métricas completas de uma opção (Greeks + métricas básicas)
 * @param {Object} params - Parâmetros da opção
 * @returns {Object} Métricas completas
 */
export function calculateCompleteMetrics(params) {
  const {
    underlying,
    strike,
    premium,
    daysToExpiry,
    volatility = 0.30,
    riskFreeRate = 0.13, // SELIC ~13%
    type = 'put'
  } = params;

  const T = daysToExpiry / 365;
  
  const delta = calculateDelta(underlying, strike, T, riskFreeRate, volatility, type);
  const gamma = calculateGamma(underlying, strike, T, riskFreeRate, volatility);
  const theta = calculateTheta(underlying, strike, T, riskFreeRate, volatility, type);
  const vega = calculateVega(underlying, strike, T, riskFreeRate, volatility);
  
  const exerciseProbability = calculateExerciseProbability(delta, type);
  const breakEven = calculateBreakEven(strike, premium, type);
  
  return {
    delta: formatNumber(delta, 4),
    gamma: formatNumber(gamma, 4),
    theta: formatNumber(theta, 4),
    vega: formatNumber(vega, 4),
    exerciseProbability: formatNumber(exerciseProbability, 1),
    breakEven: formatCurrency(breakEven)
  };
}

