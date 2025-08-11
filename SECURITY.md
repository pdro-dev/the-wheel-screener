# Política de Segurança

## Versões Suportadas

Atualmente, oferecemos suporte de segurança para as seguintes versões:

| Versão | Suportada          |
| ------ | ------------------ |
| 1.x.x  | :white_check_mark: |
| < 1.0  | :x:                |

## Relatando Vulnerabilidades

Para relatar uma vulnerabilidade de segurança de forma responsável:

### 🚨 NÃO abra uma issue pública

Vulnerabilidades de segurança devem ser relatadas de forma privada para evitar exposição desnecessária.

### 📧 Como Relatar

1. **Envie um email para**: [Inserir email de segurança]
2. **Assunto**: `[SECURITY] Vulnerabilidade em The Wheel Screener`
3. **Inclua as seguintes informações**:
   - Descrição detalhada da vulnerabilidade
   - Passos para reproduzir o problema
   - Impacto potencial da vulnerabilidade
   - Versão afetada do software
   - Sugestões de correção (se houver)
   - Seu nome/handle para crédito (opcional)

### 📋 Template de Relatório

```
**Tipo de Vulnerabilidade**: [XSS, Injeção, Exposição de Dados, etc.]

**Severidade Estimada**: [Crítica/Alta/Média/Baixa]

**Descrição**:
[Descrição detalhada do problema]

**Passos para Reproduzir**:
1. [Passo 1]
2. [Passo 2]
3. [Resultado observado]

**Impacto**:
[Qual o impacto potencial desta vulnerabilidade]

**Evidências**:
[Screenshots, logs, ou outros evidências - remova dados sensíveis]

**Ambiente**:
- Navegador: [Chrome/Firefox/Safari/etc.]
- Versão: [Versão do navegador]
- Sistema Operacional: [Windows/Mac/Linux]
- URL afetada: [URL específica se aplicável]

**Sugestões de Correção**:
[Se você tem ideias de como corrigir]
```

## Processo de Resposta

### ⏱️ Tempos de Resposta

- **Confirmação de recebimento**: 48 horas
- **Avaliação inicial**: 72 horas
- **Correção para vulnerabilidades críticas**: 7 dias
- **Correção para vulnerabilidades médias/baixas**: 30 dias

### 🔄 Fluxo de Tratamento

1. **Recebimento**: Confirmamos o recebimento do relatório
2. **Triagem**: Avaliamos a severidade e impacto
3. **Investigação**: Reproduzimos e analisamos a vulnerabilidade
4. **Desenvolvimento**: Criamos e testamos a correção
5. **Deploy**: Implementamos a correção em produção
6. **Divulgação**: Comunicamos a resolução (se apropriado)

### 📊 Classificação de Severidade

**🔴 CRÍTICA**
- Execução remota de código
- Exposição de credenciais ou dados sensíveis
- Bypass completo de autenticação
- Acesso não autorizado a dados de usuários

**🟡 ALTA**
- XSS que pode comprometer sessões
- Injeção SQL ou NoSQL
- Bypass parcial de autenticação
- Exposição de informações internas

**🟠 MÉDIA**
- XSS refletido sem impacto crítico
- Divulgação de informações não sensíveis
- Problemas de configuração de segurança
- Vulnerabilidades de força bruta

**🟢 BAIXA**
- Problemas de configuração menores
- Divulgação de informações públicas
- Problemas de usabilidade relacionados à segurança

## Divulgação Responsável

Seguimos os princípios de **divulgação responsável**:

### 📅 Timeline de Divulgação

- **Correção primeiro**: Vulnerabilidades são corrigidas antes da divulgação pública
- **Coordenação**: Timeline de divulgação é coordenado com o descobridor
- **Crédito**: Crédito é dado ao descobridor (se desejado e apropriado)
- **Transparência**: Comunicamos correções importantes aos usuários

### 🏆 Reconhecimento

Reconhecemos e agradecemos pesquisadores de segurança que:
- Relatam vulnerabilidades de forma responsável
- Fornecem informações detalhadas e úteis
- Seguem nosso processo de divulgação
- Ajudam a melhorar a segurança do projeto

## Medidas de Segurança Implementadas

### 🛡️ Proteções Ativas

- **Sanitização de Inputs**: Validação rigorosa de todos os dados de entrada
- **Proteção XSS**: Remoção de `dangerouslySetInnerHTML` e sanitização de conteúdo
- **Proteção de Credenciais**: Tokens nunca expostos no código cliente
- **HTTPS Obrigatório**: Todas as comunicações criptografadas
- **CORS Restritivo**: Apenas origens autorizadas podem acessar APIs
- **Headers de Segurança**: CSP, X-Frame-Options, e outros headers implementados

### 🔍 Monitoramento

- **Auditoria de Dependências**: Verificação regular de vulnerabilidades conhecidas
- **Análise Estática**: CodeQL para detecção automática de problemas
- **Atualizações Automáticas**: Dependabot para manter dependências atualizadas
- **Logs de Segurança**: Monitoramento de tentativas de acesso suspeitas

## Configurações de Segurança Recomendadas

### Para Desenvolvedores

```bash
# Sempre use variáveis de ambiente para credenciais
echo "VITE_OPLAB_TOKEN=seu_token" > .env.local

# Verifique se .env.local está no .gitignore
grep -q ".env.local" .gitignore || echo ".env.local" >> .gitignore

# Execute auditoria de segurança regularmente
npm audit
pnpm audit
```

### Para Deploy

```bash
# Configure variáveis de ambiente no servidor
export OPLAB_TOKEN="seu_token_aqui"

# Use HTTPS obrigatório
# Configure headers de segurança
# Implemente rate limiting se necessário
```

## Contato de Segurança

Para questões relacionadas à segurança:

- **Email**: [Inserir email de segurança]
- **Resposta esperada**: 48 horas
- **Idiomas**: Português, Inglês

## Atualizações desta Política

Esta política de segurança é revisada e atualizada regularmente. Última atualização: **Agosto 2025**

---

**Obrigado por ajudar a manter The Wheel Screener seguro! 🔒**

