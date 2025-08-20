# Conteúdo Educacional Expandido - The Wheel Screener
## Baseado no PDF "Estratégia The Wheel com Opções no Mercado Brasileiro"

## Seção 1: Introdução ao The Wheel (Expandida)

### O que é a Estratégia The Wheel?

A estratégia "The Wheel" (A Roda) é uma abordagem sistemática de investimento com opções que visa gerar renda recorrente através da venda de opções de venda (puts) e opções de compra (calls) de forma cíclica. No mercado brasileiro, essa estratégia se adapta perfeitamente às características da B3, especialmente com ações de alta liquidez como PETR4, VALE3, ITUB4 e ETFs como BOVA11.

### Objetivos e Perfil do Investidor

O principal objetivo do The Wheel é gerar renda periódica por meio dos prêmios das opções, complementando ou até substituindo dividendos tradicionais. Cada opção vendida gera um prêmio imediato em dinheiro, criando um fluxo de caixa positivo mesmo se a ação não pagar dividendos.

**Perfil Ideal:**
- Investidor que busca rendimentos regulares
- Visão de longo prazo
- Disposto a ser "acionista temporário"
- Confortável em comprar ações se o mercado cair
- Acompanha o mercado ativamente
- Possui capital disponível (R$ 3.000-6.000 por contrato)

### Como Funciona o Ciclo Completo

1. **Venda de Put Cash-Secured**: Vende-se uma opção de venda garantida por caixa
   - **Exemplo PETR4**: Ação a R$ 30, vende put strike R$ 28 por R$ 0,80
   - **Capital necessário**: R$ 2.800 (28 × 100 ações)
   - **Prêmio recebido**: R$ 80 (0,80 × 100)
   - **Break-even**: R$ 27,20 (28 - 0,80)

2. **Cenário 2A - Put não exercida**: Ação permanece acima de R$ 28
   - Opção expira sem valor
   - Lucro: R$ 80 (2,86% sobre R$ 2.800)
   - Pode repetir no próximo mês

3. **Cenário 2B - Put exercida**: Ação cai abaixo de R$ 28
   - Compra 100 ações a R$ 28 cada
   - Custo líquido: R$ 27,20 por ação (já descontado o prêmio)

4. **Venda de Covered Call**: Com as ações, vende calls cobertas
   - **Exemplo**: Vende call strike R$ 30 por R$ 0,80
   - **Prêmio adicional**: R$ 80
   - **Upside limitado**: R$ 30 por ação

5. **Cenário 3A - Call não exercida**: Ação fica abaixo de R$ 30
   - Call expira sem valor
   - Continua com as ações + prêmio de R$ 80
   - Pode vender nova call no próximo mês

6. **Cenário 3B - Call exercida**: Ação sobe acima de R$ 30
   - Vende ações a R$ 30
   - **Resultado total**: R$ 280 (ganho capital) + R$ 160 (prêmios) = R$ 440
   - **ROI**: 15,7% em ~2 meses sobre R$ 2.800

### Panorama no Mercado Brasileiro

Nos últimos anos, a B3 trouxe avanços como opções semanais e maior participação de market makers, aumentando a viabilidade de estratégias de renda com opções. A liquidez ainda se concentra em ações de grande porte:

**Ativos Recomendados (Alta Liquidez):**
- **PETR4**: Petrobras PN
- **VALE3**: Vale ON  
- **ITUB4**: Itaú Unibanco PN
- **BBAS3**: Banco do Brasil ON
- **BOVA11**: ETF Bovespa

## Seção 2: Fundamentos de Opções na B3 (Expandida)

### Conceitos Essenciais

#### Estrutura dos Contratos
- **Lote padrão**: 100 ações por contrato (igual aos EUA)
- **Vencimento mensal**: Terceira sexta-feira do mês
- **Opções semanais**: W1, W2, W4, W5 (desde 2023)
- **Exercício**: Europeu (maioria das calls) e Americano (maioria das puts)

#### Códigos de Ticker na B3
**Estrutura**: [4 LETRAS ATIVO][LETRA MÊS/TIPO][CÓDIGO NUMÉRICO]

**Meses para Calls**: A=Jan, B=Fev, C=Mar, ..., L=Dez
**Meses para Puts**: M=Jan, N=Fev, O=Mar, ..., X=Dez

**Exemplos:**
- **PETRA50**: Call de Petrobras, Janeiro, código 50
- **VALEW250**: Put de Vale, Novembro, código 250

#### Margem de Garantia
- **Put cash-secured**: 100% do valor do strike bloqueado
- **Call coberta**: Ações próprias como garantia
- **Títulos públicos**: Aceitos por algumas corretoras
- **Regra de ouro**: Nunca operar descoberto (naked)

### Liquidez e Seleção de Ativos

**Critérios de Liquidez:**
1. **Volume diário**: Mínimo 1.000 contratos
2. **Spread bid-ask**: Máximo 5% do preço médio
3. **Open interest**: Mínimo 500 contratos
4. **Book de ofertas**: Boa quantidade de ofertas

**Verificação de Liquidez:**
- Observar spread pequeno (poucos centavos)
- Volume consistente nas séries próximas
- Evitar strikes muito OTM ou vencimentos longos

## Seção 3: Greeks - Sensibilidades das Opções

### Delta (Δ) - Sensibilidade ao Preço

**Definição**: Variação do prêmio da opção para cada R$ 1 de variação na ação.

**Características:**
- **Calls**: Delta positivo (0 a +1)
- **Puts**: Delta negativo (0 a -1)
- **Exemplo**: Call com delta +0,15 → ação sobe 1%, call sobe ~0,15

**Importância para The Wheel:**
- **Vender puts**: Delta positivo líquido (ganha se ação subir)
- **Vender calls cobertas**: Delta reduzido (~+0,5)
- **Proxy de probabilidade**: Delta 0,30 ≈ 30% chance de exercício

### Gamma (Γ) - Aceleração do Delta

**Definição**: Variação do delta conforme o preço do ativo muda.

**Características:**
- **Vendedores**: Gamma negativo (ruim)
- **Movimentos bruscos**: Prejudicam vendedores
- **Exemplo**: Delta 0,15 + Gamma 0,05 → após alta de 1%, delta vira 0,20

**Risco para The Wheel:**
- Movimentos abruptos são desfavoráveis
- Exige monitoramento e possíveis rolagens
- Maior risco próximo ao vencimento

### Theta (Θ) - Decay Temporal

**Definição**: Perda de valor da opção por dia (mantidas outras variáveis).

**Características:**
- **Vendedores**: Theta positivo (bom)
- **Exemplo**: Theta -0,05 → opção perde R$ 0,05/dia
- **Aceleração**: Decay acelera próximo ao vencimento

**Vantagem do The Wheel:**
- Tempo é aliado do vendedor
- Estratégia se beneficia da passagem do tempo
- Ideal para mercados laterais

### Vega (ν) - Sensibilidade à Volatilidade

**Definição**: Variação do prêmio para cada 1% de mudança na volatilidade.

**Características:**
- **Vendedores**: Vega negativo
- **Alta volatilidade**: Ruim para vendedores
- **Baixa volatilidade**: Boa para vendedores

**Estratégia:**
- Vender opções quando volatilidade está alta
- Evitar vender em volatilidade muito baixa
- Monitorar VIX brasileiro

### Resumo das Sensibilidades

**Posição típica do The Wheel:**
- **Delta**: Moderado (~+0,5 com ações)
- **Gamma**: Negativo (gerenciar movimentos bruscos)
- **Theta**: Positivo (tempo é aliado)
- **Vega**: Negativo (preferir volatilidade baixa)

## Seção 4: Táticas de Rolagem

### Rolagem de Put

**Quando rolar:**
- Put está ITM próximo ao vencimento
- Ação caiu mas você acredita em recuperação
- Quer evitar ser exercido naquele momento

**Como rolar:**
1. Recomprar a put atual (débito)
2. Vender nova put com vencimento posterior (crédito)
3. Buscar crédito líquido na operação
4. Pode ajustar strike para baixo

**Exemplo:**
- Put PETR4 strike 28 está ITM
- Recompra por R$ 2,50
- Vende put strike 27 próximo mês por R$ 2,80
- Crédito líquido: R$ 0,30

### Rolagem de Call

**Quando rolar:**
- Call está ITM mas você quer manter as ações
- Ação disparou e você quer capturar mais alta
- Acredita que pode conseguir strike maior

**Como rolar:**
1. Recomprar a call atual (débito)
2. Vender nova call com vencimento posterior e strike maior (crédito)
3. Buscar crédito líquido ou neutro

**Exemplo:**
- Call PETR4 strike 30 está ITM (ação a R$ 32)
- Recompra por R$ 2,50
- Vende call strike 34 próximo mês por R$ 2,80
- Crédito líquido: R$ 0,30

### Disciplina de Rolagem

**Regra geral**: "Rolar enquanto der crédito"
- Se conseguir crédito, continue rolando
- Se virar débito, considere aceitar exercício
- Não rolar indefinidamente se fundamentals pioraram

## Seção 5: Exemplos Práticos com Ações Brasileiras

### Exemplo 1: PETR4 (Petrobras)

**Características:**
- Setor: Petróleo e Gás
- Volatilidade média: 35%
- Liquidez: Muito alta
- Sensibilidade: Preço do petróleo, câmbio

**Ciclo típico:**
1. PETR4 a R$ 30,00
2. Vende put strike R$ 28 por R$ 0,80 (30 dias)
3. Se exercido: compra a R$ 27,20 líquido
4. Vende call strike R$ 30 por R$ 0,80
5. Se exercido: vende a R$ 30, lucro total R$ 440

### Exemplo 2: VALE3 (Vale)

**Características:**
- Setor: Mineração
- Volatilidade média: 32%
- Liquidez: Muito alta
- Sensibilidade: Minério de ferro, China

**Ciclo típico:**
1. VALE3 a R$ 65,00
2. Vende put strike R$ 62 por R$ 1,50 (30 dias)
3. Capital necessário: R$ 6.200
4. ROI potencial: 2,4% ao mês

### Exemplo 3: BOVA11 (ETF Bovespa)

**Características:**
- Diversificação: Índice Bovespa
- Volatilidade média: 25%
- Liquidez: Muito alta
- Vantagem: Menor risco específico

**Ciclo típico:**
1. BOVA11 a R$ 118,00
2. Vende put strike R$ 115 por R$ 2,00 (30 dias)
3. Capital necessário: R$ 11.500
4. ROI potencial: 1,7% ao mês

## Seção 6: Gestão de Risco e Boas Práticas

### Diversificação

**Regras:**
- Máximo 20% do capital por ativo
- Diversificar entre setores
- Não concentrar todos os vencimentos no mesmo mês
- Considerar correlação entre ativos

### Seleção de Strikes

**Puts (Cash-Secured):**
- 2-5% OTM (fora do dinheiro)
- Delta entre 0,20-0,30
- Buscar 1-3% de prêmio mensal

**Calls (Cobertas):**
- 2-5% OTM
- Strike acima do preço de aquisição
- Delta entre 0,20-0,30

### Timing de Entrada

**Melhores momentos:**
- Volatilidade implícita alta (>30%)
- Mercado lateral ou em leve correção
- Após quedas bruscas (volatilidade elevada)

**Evitar:**
- Volatilidade muito baixa (<15%)
- Tendências muito fortes
- Véspera de eventos importantes

### Gestão de Capital

**Estrutura recomendada:**
- 60% em operações ativas
- 20% reserva para oportunidades
- 20% em renda fixa (CDI/Tesouro)

**Reinvestimento:**
- Prêmios em renda fixa até próximo ciclo
- Compound effect dos prêmios
- Escalonamento gradual das posições

### Stop Loss e Saída

**Critérios de saída:**
- Perda > 50% do prêmio recebido
- Deterioração dos fundamentals
- Mudança de cenário macroeconômico
- Necessidade de liquidez

**Rolagem vs. Exercício:**
- Rolar se ainda acredita no ativo
- Aceitar exercício se fundamentals pioraram
- Considerar custo de oportunidade

## Seção 7: Ferramentas e Recursos

### Plataformas Recomendadas

**Corretoras com boas opções:**
- XP Investimentos
- Rico
- Clear
- Modal
- BTG Pactual

**Funcionalidades importantes:**
- Book de opções completo
- Gráficos de payoff
- Calculadora de Greeks
- Histórico de volatilidade

### Indicadores a Acompanhar

**Técnicos:**
- Volatilidade implícita vs. histórica
- Put/Call ratio
- Open interest
- Volume de negociação

**Fundamentalistas:**
- P/L, P/VPA das ações
- ROE, ROIC
- Endividamento
- Perspectivas setoriais

### Recursos Educacionais

**Sites e Blogs:**
- B3 (educação em derivativos)
- Investidor Sardinha
- Suno Research
- InfoMoney

**Livros Recomendados:**
- "Options as a Strategic Investment" - McMillan
- "The Wheel Strategy" - diversos autores
- "Opções - Teoria e Prática" - Luiz Gastão

## Seção 8: Considerações Fiscais

### Tributação de Opções

**Pessoa Física:**
- Ganhos até R$ 20.000/mês: isentos
- Acima: 15% sobre o ganho líquido
- Apuração mensal obrigatória
- DARF até último dia útil do mês seguinte

**Day Trade:**
- 20% sobre ganhos líquidos
- Sem isenção
- Apuração diária

### Estratégias Fiscais

**Otimização:**
- Realizar perdas para compensar ganhos
- Distribuir operações ao longo do ano
- Considerar holding para PJ
- Planejamento sucessório

**Controles necessários:**
- Planilha de operações
- Cálculo mensal de IR
- Backup de notas de corretagem
- Acompanhamento de prejuízos acumulados

---

*Este conteúdo expandido incorpora as melhores práticas do PDF "Estratégia The Wheel com Opções no Mercado Brasileiro" e adapta os conceitos para a realidade dos investidores brasileiros.*

