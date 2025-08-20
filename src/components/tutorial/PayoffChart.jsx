import React from 'react';

/**
 * Gráfico de payoff (SVG) simples e independente de bibliotecas externas.
 * Espera pontos (x: preço, y: lucro/prejuízo total) já calculados.
 */
export default function PayoffChart({
  points,
  width = 560,
  height = 260,
  xLabel = "Preço no vencimento",
  yLabel = "P/L por contrato",
  title = "Gráfico de Payoff"
}) {
  if (!points || points.length < 2) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-gray-500">Dados insuficientes para gráfico</div>
      </div>
    );
  }

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const pad = 40;

  const scaleX = (x) => pad + ((x - minX) / (maxX - minX)) * (width - 2 * pad);
  const scaleY = (y) => height - pad - ((y - minY) / (maxY - minY)) * (height - 2 * pad);

  // Linha do zero (breakeven)
  const zeroY = scaleY(0);
  const showZeroLine = minY <= 0 && maxY >= 0;

  // Gerar path da curva
  const pathData = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(p.x)} ${scaleY(p.y)}`)
    .join(' ');

  // Formatação de valores
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Ticks para os eixos
  const xTicks = [];
  const yTicks = [];
  const numTicks = 5;

  for (let i = 0; i <= numTicks; i++) {
    const xVal = minX + (i * (maxX - minX)) / numTicks;
    const yVal = minY + (i * (maxY - minY)) / numTicks;
    xTicks.push({ value: xVal, pos: scaleX(xVal) });
    yTicks.push({ value: yVal, pos: scaleY(yVal) });
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      
      <svg width={width} height={height} className="border border-gray-100">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Eixos */}
        <line
          x1={pad}
          y1={height - pad}
          x2={width - pad}
          y2={height - pad}
          stroke="#374151"
          strokeWidth="2"
        />
        <line
          x1={pad}
          y1={pad}
          x2={pad}
          y2={height - pad}
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Linha do zero */}
        {showZeroLine && (
          <line
            x1={pad}
            y1={zeroY}
            x2={width - pad}
            y2={zeroY}
            stroke="#ef4444"
            strokeWidth="1"
            strokeDasharray="5,5"
          />
        )}

        {/* Ticks do eixo X */}
        {xTicks.map((tick, i) => (
          <g key={`x-tick-${i}`}>
            <line
              x1={tick.pos}
              y1={height - pad}
              x2={tick.pos}
              y2={height - pad + 5}
              stroke="#374151"
              strokeWidth="1"
            />
            <text
              x={tick.pos}
              y={height - pad + 18}
              textAnchor="middle"
              fontSize="12"
              fill="#6b7280"
            >
              R$ {formatPrice(tick.value)}
            </text>
          </g>
        ))}

        {/* Ticks do eixo Y */}
        {yTicks.map((tick, i) => (
          <g key={`y-tick-${i}`}>
            <line
              x1={pad - 5}
              y1={tick.pos}
              x2={pad}
              y2={tick.pos}
              stroke="#374151"
              strokeWidth="1"
            />
            <text
              x={pad - 8}
              y={tick.pos + 4}
              textAnchor="end"
              fontSize="12"
              fill="#6b7280"
            >
              {formatCurrency(tick.value)}
            </text>
          </g>
        ))}

        {/* Curva de payoff */}
        <path
          d={pathData}
          fill="none"
          stroke="#2563eb"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Área de lucro (acima do zero) */}
        {showZeroLine && (
          <defs>
            <linearGradient id="profitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1"/>
            </linearGradient>
            <linearGradient id="lossGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.1"/>
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3"/>
            </linearGradient>
          </defs>
        )}

        {/* Labels dos eixos */}
        <text
          x={width / 2}
          y={height - 5}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          fontWeight="500"
        >
          {xLabel}
        </text>
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          fontSize="14"
          fill="#374151"
          fontWeight="500"
          transform={`rotate(-90, 15, ${height / 2})`}
        >
          {yLabel}
        </text>
      </svg>

      {/* Legenda */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 bg-blue-600"></div>
          <span className="text-gray-700">Payoff da Estratégia</span>
        </div>
        {showZeroLine && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t border-red-500 border-dashed"></div>
            <span className="text-gray-700">Breakeven (Zero)</span>
          </div>
        )}
      </div>
    </div>
  );
}

