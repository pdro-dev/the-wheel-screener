# 🎓 Tutorial / Educacional – Estratégia The Wheel

## 🔹 1. Introdução ao The Wheel {#introducao-ao-the-wheel}

### Conceito Fundamental
A estratégia **The Wheel** é um ciclo contínuo de operações com opções que busca gerar renda recorrente através de prêmios. O ciclo funciona da seguinte forma:

**Puts → Ações → Calls → Repeat**

### Como Funciona

#### 1. **Puts Cash-Secured**
- Vende-se uma opção de **put** com caixa reservado para eventual exercício
- Recebe-se o **prêmio** pela venda da put
- Se exercido, compra-se o ativo pelo **strike** da put
- O custo efetivo é: `Strike - Prêmio recebido`

#### 2. **Covered Calls**
- Com as ações em carteira, vende-se **calls cobertas**
- Gera-se renda adicional através dos prêmios das calls
- Se exercido, entrega-se as ações pelo strike da call
- Reinicia-se o ciclo vendendo puts novamente

### Benefícios
- ✅ **Geração de renda** por prêmios de forma recorrente
- ✅ **Disciplina operacional** com regras claras de entrada/saída
- ✅ **Abordagem sistemática** e replicável
- ✅ **Redução do custo médio** através dos prêmios recebidos

### Riscos
- ⚠️ **Exercício em mercados em queda** (drawdowns significativos)
- ⚠️ **Concentração em poucos ativos/setores**
- ⚠️ **Spreads largos** em opções com baixa liquidez
- ⚠️ **Gaps de mercado** que podem impactar severamente a posição

---

## 🔹 2. Fundamentos de Trading Quantitativo {#fundamentos-de-trading-quantitativo}

### Geração de Ideias
- **Fatores técnicos**: padrões de preço, momentum, reversão à média
- **Anomalias de mercado**: ineficiências temporárias ou estruturais
- **Filtros de qualidade**: liquidez, volatilidade, fundamentals

### Bases de Dados Confiáveis
- **Preços**: histórico de cotações com ajustes por proventos
- **Cadeia de opções**: IV, delta, gamma, theta, vega, OI, volume
- **Eventos corporativos**: dividendos, splits, fusões
- **Calendário macro**: reuniões do COPOM, divulgação de indicadores

### Backtesting Rigoroso
- **Regras objetivas**: critérios claros de entrada, saída e rolagem
- **Custos realistas**: slippage, comissões, imposto de renda
- **Métricas robustas**: 
  - **CAGR** (Compound Annual Growth Rate)
  - **MaxDD** (Maximum Drawdown)
  - **Sharpe Ratio** (retorno ajustado ao risco)
  - **Calmar Ratio** (CAGR / MaxDD)
  - **SQN** (System Quality Number)

### Regras de Entrada/Saída
- **Sinais claros**: condições objetivas e mensuráveis
- **Stops e take profits**: limites de perda e ganho
- **Critérios de rolagem**: 
  - **DTE** (Days to Expiration): rolar com X dias restantes
  - **Delta-alvo**: manter delta dentro de faixa específica
  - **IV Rank**: operar apenas com IV acima de percentil Y

### Otimização e Overfitting
- **Validação fora da amostra**: testar em períodos não utilizados na otimização
- **Walk-forward analysis**: otimizar periodicamente com janela deslizante
- **Robustez de parâmetros**: evitar valores muito específicos
- **Teste em múltiplos regimes**: alta/baixa volatilidade, bull/bear markets

---

## 🔹 3. Indicadores de Sentimento e Opções {#indicadores-de-sentimento-e-opcoes}

### Put/Call Ratio
- **Definição**: razão entre volume/OI de puts e calls
- **Interpretação**: 
  - Ratio alto → sentimento pessimista (potencial contrarian)
  - Ratio baixo → sentimento otimista (potencial contrarian)
- **Uso prático**: extremos podem sinalizar reversões de curto prazo

### VIX e Volatilidade Implícita
- **VIX**: "índice do medo" baseado na IV das opções do S&P 500
- **IV Rank/Percentil**: posição da IV atual vs. histórico do ativo
- **Impacto nos prêmios**: 
  - IV alta → prêmios maiores → mais atrativo para vendedores
  - IV baixa → prêmios menores → menos atrativo para vendedores
- **Relação risco/retorno**: IV alta também implica maior risco

### Open Interest e Volume
- **Open Interest (OI)**: contratos em aberto por strike/vencimento
- **Volume**: contratos negociados no dia
- **"Paredes" de OI**: strikes com muito OI podem atuar como suporte/resistência
- **Fluxo por strikes**: identificar onde há maior interesse dos players

### Profecias Auto-Realizáveis
- **Padrões amplamente seguidos**: quando muitos traders seguem a mesma lógica
- **Impacto no preço**: o próprio padrão pode influenciar o movimento
- **Exemplo**: strikes com muito OI podem "atrair" o preço próximo ao vencimento

---

## 🔹 4. Indicadores Macroeconômicos {#indicadores-macroeconomicos}

### Taxa de Juros (SELIC)
- **Impacto direto**: afeta a precificação de opções (modelo Black-Scholes)
- **Desconto de fluxo de caixa**: juros altos reduzem valor presente de dividendos futuros
- **Sensibilidade setorial**: bancos se beneficiam, utilities sofrem com juros altos

### PIB e Produção Industrial
- **Indicadores de crescimento**: sinalizam atividade econômica
- **Demanda por ativos de risco**: crescimento → maior apetite por ações
- **Antecedência**: mercado tende a antecipar mudanças no PIB

### Inflação (IPCA)
- **Pressão sobre juros**: inflação alta pressiona SELIC para cima
- **Impacto em margens**: empresas podem ter dificuldade para repassar custos
- **Setores defensivos**: alguns setores se beneficiam de inflação (commodities)

### Desemprego e Confiança
- **ICC/ICE**: Índices de Confiança do Consumidor/Empresário
- **PMI**: Purchasing Managers Index (atividade industrial)
- **Antecipação de ciclos**: confiança tende a antecipar mudanças econômicas
- **Amplitude setorial**: alguns setores são mais sensíveis ao emprego

### Câmbio e Balança Comercial
- **Exportadoras**: se beneficiam de real desvalorizado
- **Importadoras**: sofrem com real desvalorizado
- **Hedge natural**: empresas com receita em dólar têm proteção cambial
- **Fluxo de capital**: câmbio reflete entrada/saída de investimento estrangeiro

---

## 🔹 5. Modelos Quantitativos de Apoio {#modelos-quantitativos-de-apoio}

### Modelos de Tendência
- **LT (Long Term)**: identifica tendências de longo prazo
- **Sibilla**: modelo proprietário de análise técnica
- **Distortions**: identifica distorções de preço vs. valor justo
- **Aplicação no The Wheel**: operar em regimes favoráveis ao sell-vol

### Modelos de Reversão à Média
- **MR Tech**: identifica momentos de reversão técnica
- **Bandas de Bollinger**: preço vs. média móvel e desvio padrão
- **RSI**: Relative Strength Index para identificar sobrecompra/sobrevenda
- **Aplicação**: entrar com puts em pullbacks de ações fortes

### Screening de Minervini
- **Critérios técnicos**: 
  - Preço acima de MM de 150 e 200 dias
  - MM de 150 dias acima de MM de 200 dias
  - MM de 200 dias com inclinação positiva há pelo menos 1 mês
  - Preço pelo menos 30% acima da mínima de 52 semanas
  - Preço no máximo 25% abaixo da máxima de 52 semanas
- **Critérios fundamentais**: crescimento de vendas e lucros
- **Aplicação**: selecionar ações fortes para aplicar The Wheel

---

## 🔹 6. Dados Disponíveis na Aplicação {#dados-disponiveis-na-aplicacao}

### Critérios de Elegibilidade
- **Liquidez mínima**: volume diário e OI mínimos para opções
- **Faixa de preço**: evitar penny stocks e ações muito caras
- **IV Rank/Percentil**: preferir ações com IV em percentis altos
- **Spread bid-ask**: evitar opções com spreads muito largos

### Métricas de Opções
- **Delta**: sensibilidade ao preço do subjacente (aprox. probabilidade ITM)
- **Prêmio**: valor absoluto e percentual do prêmio
- **ROIC**: retorno sobre capital investido (colateral)
- **Slippage estimado**: impacto esperado do spread bid-ask
- **DTE**: dias até o vencimento da opção

### Indicadores Técnicos
- **RSI**: Relative Strength Index (14 períodos)
- **MACD**: Moving Average Convergence Divergence
- **Médias móveis**: 20, 50, 150 e 200 períodos
- **Volatilidade histórica**: desvio padrão dos retornos
- **Volatilidade realizada**: volatilidade efetivamente observada

### Contexto Macroeconômico
- **Taxa SELIC**: taxa básica de juros
- **IPCA**: inflação oficial
- **PIB**: crescimento econômico trimestral
- **Índices de confiança**: ICC, ICE, PMI

### Sentimento de Mercado
- **Put/Call Ratio**: do mercado brasileiro e global
- **VIX**: volatilidade implícita do S&P 500
- **Fluxo por strike**: onde está concentrado o interesse
- **Mapa de calor**: visualização de OI por strike/vencimento

---

## 🔹 7. Interatividade {#interatividade}

### Simulações Guiadas

#### Montagem de uma "Roda" com Ativos da B3
1. **Escolha do ativo**: critérios de liquidez e IV Rank
2. **Seleção de strikes**: delta-alvo e distância do preço atual
3. **Definição de DTE**: prazo até vencimento
4. **Cálculo de prêmio alvo**: ROIC mínimo desejado

#### Outputs do Simulador
- **Prêmio esperado**: valor absoluto e percentual
- **Breakeven**: preço de equilíbrio da operação
- **ROI**: retorno sobre investimento no período
- **ROI anualizado**: extrapolação para base anual
- **Max profit/loss**: cenários extremos
- **Payoff**: gráfico de lucro/prejuízo vs. preço do ativo

### Quizzes Rápidos
- **Conceitos básicos**: The Wheel, puts, calls, prêmios
- **Métricas**: delta, IV, OI, volume
- **Gestão de risco**: diversificação, tamanho de posição
- **Feedback imediato**: explicação das respostas corretas

### Estudos de Caso
- **Exemplos com dados reais**: OpLab + Yahoo Finance
- **Documentação**: data de referência e premissas utilizadas
- **Análise de resultados**: o que deu certo e o que deu errado
- **Lições aprendidas**: insights para futuras operações

### Visualizações Interativas
- **Gráfico de payoff**: put, call coberta, ciclo completo
- **Curva de IV**: volatilidade implícita por strike
- **Evolução de resultados**: performance por ciclo da Wheel
- **Mapa de calor**: OI e volume por strike/vencimento

---

## 🔹 8. Boas Práticas {#boas-praticas}

### Diversificação
- **Múltiplos ativos**: não concentrar em uma única ação
- **Setores diferentes**: reduzir correlação entre posições
- **Vencimentos escalonados**: não ter todas as opções vencendo no mesmo dia
- **Tamanhos de posição**: limitar exposição por ativo (ex: máximo 10% da carteira)

### Gestão de Risco e Posição
- **Colateral adequado**: sempre manter caixa suficiente para exercício
- **Limites de perda**: definir stop loss para a estratégia
- **Rolagem criteriosa**: quando rolar e quando aceitar exercício
- **Monitoramento constante**: acompanhar delta, IV e tempo

### Filtros Macro e Sentimento
- **Regime de mercado**: operar preferencialmente em mercados laterais/alta
- **IV Rank alto**: priorizar ações com volatilidade implícita elevada
- **Evitar eventos**: não operar próximo a earnings ou eventos macro importantes
- **Sentimento extremo**: usar indicadores contrarian como filtro adicional

### Liquidez e Execução
- **Spread bid-ask**: evitar opções com spreads muito largos (>5% do prêmio)
- **Open Interest**: preferir strikes com OI significativo
- **Volume**: verificar se há volume suficiente para entrada/saída
- **Horário de negociação**: operar preferencialmente no horário de maior liquidez

### Revisão e Melhoria Contínua
- **Relatórios periódicos**: analisar performance mensalmente
- **Backtests atualizados**: incluir novos dados e ajustar parâmetros
- **Registro de operações**: manter log detalhado de todas as operações
- **Aprendizado constante**: estudar casos de sucesso e fracasso

---

## ℹ️ Como usar o Tutorial na Plataforma

### Navegação
- Acesse **"Tutorial / Educacional"** no menu lateral
- Use o menu de navegação para pular entre seções
- Marque seções como concluídas conforme avança

### Integração com a Aplicação
- Em cada tela da aplicação (screener, cadeia de opções, gráficos), use **"Explique este conceito"** para abrir resumos contextuais
- Clique em termos técnicos para ver definições no glossário
- Use os simuladores para praticar antes de operar com dinheiro real

### Simuladores
- **Put Cash-Secured**: simule a venda de puts com diferentes parâmetros
- **Covered Call**: simule a venda de calls sobre ações em carteira
- **Payoff**: visualize graficamente o resultado da operação

### Feedback
- Avalie o conteúdo usando os botões de feedback
- Sugira novos tópicos ou melhorias
- Compartilhe suas experiências com a comunidade

---

## ⚠️ Avisos Importantes

### Natureza Educacional
- Este conteúdo tem **finalidade exclusivamente educacional**
- **Não constitui recomendação** de investimento
- **Resultados passados não garantem resultados futuros**

### Considerações Práticas
- Sempre considere **custos operacionais** (corretagem, emolumentos)
- Leve em conta **impostos** sobre ganhos de capital
- Verifique **liquidez** antes de operar
- **Diversifique** adequadamente sua carteira

### Responsabilidade
- **Você é responsável** por suas decisões de investimento
- **Consulte um assessor** qualificado se necessário
- **Invista apenas** o que pode perder
- **Estude continuamente** e mantenha-se atualizado

