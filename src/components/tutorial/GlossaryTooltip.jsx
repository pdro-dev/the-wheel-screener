import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Componente de tooltip para termos do glossário
 * @param {Object} props
 * @param {string} props.term - Termo do glossário
 * @param {Object} [props.glossary] - Objeto com definições do glossário
 * @param {string} [props.className] - Classes CSS adicionais
 */
export default function GlossaryTooltip({ term, glossary, className = '' }) {
  const [isVisible, setIsVisible] = useState(false);
  
  // Glossário padrão (pode ser sobrescrito via props)
  const defaultGlossary = {
    "IV Rank": "Percentil da volatilidade implícita em relação ao histórico do ativo.",
    "Delta": "Sensibilidade do preço da opção ao preço do subjacente; aproxima a probabilidade de expirar ITM.",
    "DTE": "Dias até o vencimento da opção.",
    "Open Interest (OI)": "Número de contratos de opções em aberto.",
    "Breakeven": "Preço de equilíbrio: put (strike - prêmio), call coberta (custo - prêmio).",
    "ROIC": "Retorno sobre capital investido (neste contexto, sobre o colateral líquido).",
    "Slippage": "Diferença entre preço esperado e executado, normalmente por spreads/liquidez."
  };

  const definitions = glossary || defaultGlossary;
  const definition = definitions[term];

  if (!definition) {
    return <span className={className}>{term}</span>;
  }

  return (
    <div className="relative inline-block">
      <span
        className={`inline-flex items-center cursor-help border-b border-dotted border-blue-500 ${className}`}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {term}
        <HelpCircle className="w-3 h-3 ml-1 text-blue-500" />
      </span>
      
      {isVisible && (
        <div className="absolute z-50 w-64 p-3 mt-1 text-sm bg-white border border-gray-200 rounded-lg shadow-lg -left-32">
          <div className="font-semibold text-gray-900 mb-1">{term}</div>
          <div className="text-gray-700">{definition}</div>
          {/* Seta do tooltip */}
          <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45"></div>
        </div>
      )}
    </div>
  );
}

