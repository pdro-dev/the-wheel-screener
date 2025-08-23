# 🐳 Docker Setup - The Wheel Screener

Este guia explica como executar o The Wheel Screener usando Docker para desenvolvimento local e produção.

## 📋 Pré-requisitos

- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

## 🚀 Execução Rápida

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/pdro-dev/the-wheel-screener.git
cd the-wheel-screener

# 2. Copie o arquivo de ambiente
cp .env.example .env

# 3. Execute em modo desenvolvimento
docker-compose -f docker-compose.dev.yml up --build
```

**Acesse:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Produção

```bash
# 1. Execute em modo produção
docker-compose up --build -d

# 2. Verifique os logs
docker-compose logs -f
```

**Acesse:**
- Aplicação: http://localhost
- Backend API: http://localhost:5000

## 🔧 Configuração

### Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```env
# Token da API OpLab (opcional)
OPLAB_API_TOKEN=seu_token_aqui

# Configurações do Flask
FLASK_ENV=development
FLASK_DEBUG=1

# URL da API para o frontend
VITE_API_URL=http://localhost:5000
```

### Estrutura dos Serviços

#### 🔹 Backend (Flask)
- **Porta:** 5000
- **Healthcheck:** `/api/metrics`
- **Logs:** `./backend-oplab/logs/`
- **Tecnologias:** Python 3.11, Flask, Yahoo Finance

#### 🔹 Frontend (React)
- **Porta:** 80 (produção) / 5173 (desenvolvimento)
- **Proxy API:** `/api/*` → `backend:5000`
- **Tecnologias:** React, Vite, Tailwind CSS

#### 🔹 Redis (Cache)
- **Porta:** 6379
- **Uso:** Cache de dados da API
- **Persistência:** Volume `redis_data`

## 📝 Comandos Úteis

### Desenvolvimento

```bash
# Iniciar serviços de desenvolvimento
docker-compose -f docker-compose.dev.yml up

# Rebuild apenas o backend
docker-compose -f docker-compose.dev.yml up --build backend-dev

# Ver logs do backend
docker-compose -f docker-compose.dev.yml logs -f backend-dev

# Executar comandos no container
docker-compose -f docker-compose.dev.yml exec backend-dev bash
```

### Produção

```bash
# Iniciar em background
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Rebuild completo
docker-compose up --build --force-recreate

# Ver status dos serviços
docker-compose ps

# Ver logs
docker-compose logs -f [service_name]
```

### Manutenção

```bash
# Limpar containers parados
docker container prune

# Limpar imagens não utilizadas
docker image prune

# Limpar volumes não utilizados
docker volume prune

# Limpar tudo (cuidado!)
docker system prune -a
```

## 🔍 Troubleshooting

### Problemas Comuns

#### 1. **Porta já em uso**
```bash
# Verificar processos usando a porta
lsof -i :5000
lsof -i :80

# Parar serviços conflitantes
docker-compose down
```

#### 2. **Erro de build do frontend**
```bash
# Limpar cache do npm
docker-compose exec frontend-dev npm cache clean --force

# Rebuild sem cache
docker-compose build --no-cache frontend
```

#### 3. **Backend não conecta com APIs**
```bash
# Verificar logs do backend
docker-compose logs backend

# Testar conectividade
docker-compose exec backend curl -I https://finance.yahoo.com
```

#### 4. **Problemas de CORS**
- Verifique se `VITE_API_URL` está correto no `.env`
- Confirme que o nginx está fazendo proxy corretamente

### Logs e Debugging

```bash
# Ver logs de todos os serviços
docker-compose logs

# Logs específicos com timestamp
docker-compose logs -f -t backend

# Entrar no container para debug
docker-compose exec backend bash
docker-compose exec frontend sh
```

## 🏗️ Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │     Redis       │
│   (React)       │    │    (Flask)      │    │    (Cache)      │
│   Port: 80/5173 │◄──►│   Port: 5000    │◄──►│   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Yahoo Finance  │
                    │      API        │
                    └─────────────────┘
```

## 📊 Monitoramento

### Health Checks

Os serviços incluem health checks automáticos:

```bash
# Verificar status de saúde
docker-compose ps

# Testar endpoints manualmente
curl http://localhost:5000/api/metrics
curl http://localhost/
```

### Métricas

- **Backend:** `/api/metrics` - Métricas da API
- **Frontend:** Logs do nginx em `/var/log/nginx/`
- **Redis:** `redis-cli info` para estatísticas

## 🔒 Segurança

### Produção

- Altere credenciais padrão
- Configure HTTPS com certificados SSL
- Use secrets do Docker para tokens sensíveis
- Configure firewall adequadamente

### Desenvolvimento

- Nunca commite arquivos `.env` com tokens reais
- Use `.env.local` para configurações pessoais
- Mantenha dependências atualizadas

## 📚 Recursos Adicionais

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Reference](https://docs.docker.com/compose/)
- [Flask in Docker](https://flask.palletsprojects.com/en/2.3.x/deploying/docker/)
- [React Docker Best Practices](https://create-react-app.dev/docs/deployment/#docker)

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs: `docker-compose logs`
2. Confirme as variáveis de ambiente
3. Teste conectividade de rede
4. Abra uma issue no GitHub com logs detalhados

