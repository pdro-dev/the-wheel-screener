# Integração com API OpLab - The Wheel Screener

## Visão Geral

Este documento descreve a integração completa com a API OpLab para fornecer dados de mercado em tempo real ao The Wheel Screener. A implementação inclui autenticação segura, cache inteligente, tratamento de erros robusto e otimizações de performance.

## Estrutura da Integração

### 1. Camada de Serviço (`src/services/opLabAPI.js`)

A camada principal que gerencia todas as comunicações com a API OpLab.

#### Configuração
```javascript
export const API_CONFIG = {
  baseURL: '/api',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
  cache: {
    instruments: 5 * 60 * 1000,    // 5 minutos
    quotes: 30 * 1000,             // 30 segundos  
    fundamentals: 10 * 60 * 1000,  // 10 minutos
    screening: 2 * 60 * 1000       // 2 minutos
  }
}
```

#### Endpoints Disponíveis
- `/instruments` - Lista de instrumentos financeiros
- `/quotes` - Cotações em tempo real
- `/fundamentals/{symbol}` - Dados fundamentalistas
- `/screening` - Screening personalizado
- `/user` - Informações do usuário
- `/health` - Status da API

### 2. Hooks de Integração (`src/hooks/useOpLabAPI.js`)

Hooks React para gerenciar estado e operações da API de forma reativa.

#### `useOpLabState()`
Gerencia o estado global da API:
```javascript
const { 
  isAuthenticated, 
  isOnline, 
  token, 
  lastError, 
  setToken 
} = useOpLabState()
```

#### `useWheelScreening()`
Hook especializado para screening da estratégia Wheel:
```javascript
const {
  results,
  isScreening,
  progress,
  runScreening,
  exportResults,
  hasResults
} = useWheelScreening()
```

#### `useOpLabService()`
Hook para operações gerais da API:
```javascript
const {
  getInstruments,
  getQuotes,
  getFundamentals,
  testConnection,
  isLoading,
  error
} = useOpLabService()
```

### 3. Componentes de Integração (`src/components/APIIntegration.jsx`)

Componentes React para exibir status e configurar a integração.

#### `TokenConfiguration`
Interface para configuração segura do token:
```jsx
<TokenConfiguration onTokenSave={handleTokenSave} />
```

#### `ConnectionStatus`
Indicador visual do status da conexão:
```jsx
<ConnectionStatus compact={false} />
```

#### `APIDashboard`
Dashboard completo com métricas da API:
```jsx
<APIDashboard stats={usageStats} />
```

## Autenticação e Segurança

### Token Management
```javascript
// Configurar token (armazenado localmente)
setToken('seu-token-oplab')

// Token é automaticamente incluído nas requisições
headers: {
  'x-oplab-token': token,
  'Content-Type': 'application/json'
}
```

### Medidas de Segurança
- ✅ Token nunca exposto no código-fonte
- ✅ Armazenamento local seguro
- ✅ Comunicação via proxy em produção
- ✅ Validação de entrada rigorosa
- ✅ Tratamento de erros 401/403

### Proxy de Desenvolvimento
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'https://api.oplab.com.br/v3',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      configure: (proxy) => {
        proxy.on('proxyReq', (proxyReq, req) => {
          const token = req.headers['x-oplab-token'];
          if (token) {
            proxyReq.setHeader('Access-Token', token);
          }
        })
      }
    }
  }
}
```

## Cache e Performance

### Sistema de Cache Inteligente
```javascript
// Cache automático baseado no endpoint
const cacheTTL = {
  '/instruments': 5 * 60 * 1000,      // Dados mais estáveis
  '/quotes': 30 * 1000,               // Dados voláteis  
  '/fundamentals': 10 * 60 * 1000,    // Dados periódicos
  '/screening': 2 * 60 * 1000         // Resultados temporários
}
```

### Otimizações de Performance
- **Rate Limiting**: Fila de requisições com delays
- **Retry Logic**: Tentativas automáticas em falhas temporárias
- **Request Deduplication**: Evita requisições duplicadas
- **Memory Management**: Limpeza automática de cache expirado

### Monitoramento de Performance
```javascript
// Métricas automáticas
const metrics = {
  totalRequests: 0,
  successRate: 98.5,
  avgResponseTime: 245,
  cacheHitRate: 67.8
}
```

## Algoritmo de Screening

### Cálculo do Score The Wheel
O algoritmo proprietário avalia ações com base em:

```javascript
const scoreWeights = {
  roic: 0.25,         // Return on Invested Capital
  volume: 0.20,       // Liquidez
  volatility: 0.15,   // Estabilidade de preços
  fundamentals: 0.25, // Saúde financeira
  technicals: 0.15    // Indicadores técnicos
}
```

#### Critérios de Avaliação

**ROIC (0-25 pontos)**
- ≥15%: 25 pontos
- ≥10%: 20 pontos  
- ≥8%: 15 pontos
- ≥5%: 10 pontos
- <5%: 5 pontos

**Volume (0-20 pontos)**
- ≥10x mínimo: 20 pontos
- ≥5x mínimo: 16 pontos
- ≥2x mínimo: 12 pontos
- ≥1x mínimo: 8 pontos

**Volatilidade (0-15 pontos)**
- ≤15%: 15 pontos (melhor)
- ≤25%: 12 pontos
- ≤35%: 9 pontos
- ≤45%: 6 pontos

**Fundamentos (0-25 pontos)**
- Debt/Equity ratio
- ROE (Return on Equity)  
- Crescimento de receita

**Técnicos (0-15 pontos)**
- Tendência de preços
- Proximidade de suporte/resistência

### Filtros de Screening
```javascript
const screeningFilters = {
  priceRange: { min: 15, max: 100 },
  minVolume: 100000,
  minROIC: 5,
  minScore: 60,
  sectors: ['Technology', 'Finance'],
  maxVolatility: 0.4
}
```

## Tratamento de Erros

### Hierarchy de Erros
```javascript
class OpLabAPIError extends Error {
  constructor(message, status, code, details) {
    super(message)
    this.name = 'OpLabAPIError'
    this.status = status      // HTTP status
    this.code = code         // Código específico
    this.details = details   // Detalhes adicionais
  }
}
```

### Tipos de Erro

#### Erros de Autenticação (401)
```javascript
// Token inválido ou expirado
if (error.status === 401) {
  setToken(null)
  showTokenConfiguration()
}
```

#### Erros de Rate Limit (429)
```javascript
// Muitas requisições
if (error.status === 429) {
  await delay(retryAfter * 1000)
  retryRequest()
}
```

#### Erros de Servidor (5xx)
```javascript
// Retry automático com backoff
for (let attempt = 1; attempt <= maxRetries; attempt++) {
  try {
    return await makeRequest()
  } catch (error) {
    if (attempt === maxRetries) throw error
    await delay(retryDelay * attempt)
  }
}
```

#### Erros de Rede
```javascript
// Fallback para dados simulados
try {
  return await fetchRealData()
} catch (networkError) {
  console.warn('Using mock data:', networkError)
  return generateMockData()
}
```

## Monitoramento e Logs

### Métricas de Uso
```javascript
const apiMetrics = {
  totalRequests: 1247,
  successfulRequests: 1225,
  failedRequests: 22,
  avgResponseTime: 234,
  cacheHitRate: 0.678,
  lastError: null,
  uptime: '99.2%'
}
```

### Logs Estruturados
```javascript
// Log de requisições
logger.info('API Request', {
  endpoint: '/screening',
  method: 'POST',
  duration: 245,
  status: 200,
  cacheHit: false
})

// Log de erros
logger.error('API Error', {
  endpoint: '/quotes',
  error: error.message,
  status: error.status,
  retryAttempt: 2
})
```

### Dashboard de Monitoramento
- **Status em Tempo Real**: Conectado/Desconectado
- **Rate Limits**: Uso atual vs. limite
- **Performance**: Tempo de resposta médio
- **Cache**: Taxa de acerto do cache
- **Erros**: Últimos erros e frequência

## Implementação em Produção

### Configuração de Ambiente
```bash
# Variáveis de ambiente (não commitar)
VITE_OPLAB_TOKEN=seu-token-aqui
VITE_API_BASE_URL=https://api.oplab.com.br/v3
VITE_ENABLE_CACHE=true
VITE_CACHE_TTL=300000
```

### Deploy com Proxy Seguro
```javascript
// servidor de produção (Express.js exemplo)
app.use('/api', (req, res, next) => {
  // Token do servidor, não do cliente
  req.headers['Access-Token'] = process.env.OPLAB_TOKEN
  proxy('https://api.oplab.com.br/v3')(req, res, next)
})
```

### Monitoramento de Produção
- **Health Checks**: Verificação periódica da API
- **Alertas**: Notificação de falhas críticas  
- **Métricas**: Coleta automática via APM
- **Logs**: Centralização via ELK/Splunk

## Testes

### Testes Unitários
```javascript
// src/__tests__/opLabAPI.test.js
describe('OpLabAPIService', () => {
  it('should handle successful requests', async () => {
    const service = new OpLabAPIService('test-token')
    const result = await service.getInstruments()
    expect(result).toBeDefined()
  })
  
  it('should retry on server errors', async () => {
    // Mock 500 error followed by success
    // Verify retry logic
  })
  
  it('should cache responses correctly', async () => {
    // Verify caching behavior
  })
})
```

### Testes de Integração  
```javascript
// src/__tests__/integration/api.test.js
describe('API Integration', () => {
  it('should perform end-to-end screening', async () => {
    const filters = { minPrice: 20, maxPrice: 50 }
    const results = await performWheelScreening(filters)
    expect(results.length).toBeGreaterThan(0)
  })
})
```

### Testes de Carga
```javascript
// stress-test.js
async function loadTest() {
  const promises = Array(100).fill().map(() => 
    service.getQuotes(['PETR4', 'VALE3'])
  )
  
  const results = await Promise.allSettled(promises)
  const successRate = results.filter(r => r.status === 'fulfilled').length / 100
  expect(successRate).toBeGreaterThan(0.95)
}
```

## Próximos Passos

### Melhorias Planejadas

#### v2.0 - Funcionalidades Avançadas
- [ ] WebSocket para dados em tempo real
- [ ] Cache distribuído (Redis)
- [ ] Suporte a múltiplas exchanges
- [ ] Analytics avançados

#### v2.1 - Performance  
- [ ] Service Worker para cache offline
- [ ] GraphQL para queries otimizadas
- [ ] CDN para assets estáticos
- [ ] Compressão gzip/brotli

#### v2.2 - Segurança
- [ ] JWT tokens com refresh
- [ ] Rate limiting por usuário
- [ ] Audit logs completos
- [ ] Criptografia end-to-end

### Migração e Manutenção

#### Atualizações da API
```javascript
// Versionamento de API
const API_VERSIONS = {
  v3: 'https://api.oplab.com.br/v3',
  v4: 'https://api.oplab.com.br/v4' // Futura
}

// Compatibilidade retroativa
function adaptResponse(data, version) {
  return version === 'v3' ? adaptFromV3(data) : data
}
```

#### Backup e Recuperação
- **Cache Persistence**: Backup local dos dados críticos
- **Graceful Degradation**: Fallback para dados simulados
- **Health Monitoring**: Alertas automáticos de falhas

## Conclusão

A integração com a API OpLab fornece uma base sólida e escalável para dados de mercado em tempo real. Com cache inteligente, tratamento robusto de erros e monitoramento abrangente, o sistema está preparado para uso em produção com alta disponibilidade e performance otimizada.

A arquitetura modular permite futuras expansões e a implementação de novas funcionalidades sem comprometer a estabilidade do sistema existente.

---

**Desenvolvimento**: The Wheel Screener Team  
**Última Atualização**: Janeiro 2025  
**Versão**: 2.0.0