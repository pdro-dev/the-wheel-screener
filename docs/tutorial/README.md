# Módulo Tutorial/Educacional – Guia de Implantação

## Objetivo
- Ensinar conceitos financeiros e demonstrar a estratégia The Wheel de forma prática e visual, integrando dados OpLab + Yahoo Finance.
- Entregar experiência progressiva (básico → avançado), com simulações, quizzes e estudos de caso.

## Estrutura entregue
- `docs/tutorial/conteudo-base.md`: conteúdo educacional em 8 seções (alinhado ao prompt).
- `data/tutorial/lessons.json`: navegação, quizzes, glossário e referência a componentes.
- `src/lib/options.ts`: utilitários para métricas e geração de payoff de puts e covered calls.
- `src/components/tutorial/`:
  - `WheelSimulator.jsx`: simulador de Put cash-secured e Covered Call com métricas e payoff.
  - `PayoffChart.jsx`: gráfico de payoff (SVG) sem dependências externas.
  - `Quiz.jsx`: componente de quiz com feedback imediato.
  - `GlossaryTooltip.jsx`: tooltip simples conectado ao glossário.
  - `FeedbackWidget.jsx`: widget "Este conteúdo te ajudou?" com callbacks.

## Integração sugerida

### 1) Menu lateral
- Adicione item "Tutorial / Educacional" no menu global.
- A rota/Tela deve renderizar:
  - O conteúdo Markdown (`docs/tutorial/conteudo-base.md`).
  - O menu lateral com base em `data/tutorial/lessons.json.nav` (anchors).
  - Componentes interativos embutidos na seção "Interatividade".

### 2) Renderização de Markdown
- Utilize o renderizador de sua preferência e converta headings em IDs (anchors) compatíveis com lessons.json (ex.: "Introdução ao The Wheel" → introducao-ao-the-wheel).
- Alternativamente, você pode inserir âncoras manualmente no Markdown.

### 3) Interatividade
- **Simulador**: importe e posicione `<WheelSimulator mode="put" />` e `<WheelSimulator mode="coveredCall" />` na seção "Interatividade".
- **Quiz**: carregue perguntas de `data/tutorial/lessons.json.quizzes["wheel-basics"]` e passe para `<Quiz />`.
- **Glossário**: use `<GlossaryTooltip term="IV Rank" />` em labels/chips/legendas no app.
- **Feedback**: posicione `<FeedbackWidget onSubmit={...} />` no rodapé da página do tutorial.

### 4) Integração de dados (OpLab + Yahoo Finance)
- No primeiro momento, use valores manuais no simulador (inputs).
- Próximo passo: preencher os inputs via busca de cadeia de opções (IV Rank, Delta, OI, Volume) e do yfinance para preço/volatilidade histórica.
- Salve "snapshots" de estudos de caso (data de referência e dados usados) para reprodutibilidade.

### 5) Estilo/Design
- Os componentes usam CSS inline simples. Substitua por seu design system (tokens, tipografia, cores).
- Mantenha visual uniforme com o restante da aplicação.

### 6) Telemetria/Feedback
- Conecte `<FeedbackWidget />` ao seu endpoint (ex.: `/api/feedback`).
- Capture eventos (visualização de seções, conclusão de quizzes) via seu analytics.

## Roadmap sugerido
- **Fase 1**: Publicar conteúdo + Simulador + Quiz + Feedback.
- **Fase 2**: Conectar dados reais (OpLab/yfinance), tooltips contextuais em telas-chave.
- **Fase 3**: Visualizações avançadas (curva de IV, evolução por ciclos) e estudos de caso com B3.

## Aviso
- O material é educacional. Não constitui recomendação. Considere custos, impostos e liquidez.

