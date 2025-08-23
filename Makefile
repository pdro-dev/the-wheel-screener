# Makefile para The Wheel Screener
.PHONY: help dev prod build clean logs test

# Variáveis
COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
COMPOSE_PROD = docker-compose

# Comando padrão
help: ## Mostra esta ajuda
	@echo "The Wheel Screener - Comandos Docker"
	@echo ""
	@echo "Comandos disponíveis:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Desenvolvimento
dev: ## Inicia ambiente de desenvolvimento
	$(COMPOSE_DEV) up --build

dev-bg: ## Inicia desenvolvimento em background
	$(COMPOSE_DEV) up --build -d

dev-stop: ## Para ambiente de desenvolvimento
	$(COMPOSE_DEV) down

dev-logs: ## Mostra logs do desenvolvimento
	$(COMPOSE_DEV) logs -f

# Produção
prod: ## Inicia ambiente de produção
	$(COMPOSE_PROD) up --build -d

prod-stop: ## Para ambiente de produção
	$(COMPOSE_PROD) down

prod-logs: ## Mostra logs da produção
	$(COMPOSE_PROD) logs -f

# Build
build: ## Build das imagens
	$(COMPOSE_PROD) build

build-dev: ## Build das imagens de desenvolvimento
	$(COMPOSE_DEV) build

build-no-cache: ## Build sem cache
	$(COMPOSE_PROD) build --no-cache

# Logs
logs-backend: ## Logs do backend
	$(COMPOSE_DEV) logs -f backend-dev

logs-frontend: ## Logs do frontend
	$(COMPOSE_DEV) logs -f frontend-dev

logs-redis: ## Logs do Redis
	$(COMPOSE_PROD) logs -f redis

# Teste e Debug
test: ## Executa testes
	$(COMPOSE_DEV) exec backend-dev python -m pytest

shell-backend: ## Shell no container do backend
	$(COMPOSE_DEV) exec backend-dev bash

shell-frontend: ## Shell no container do frontend
	$(COMPOSE_DEV) exec frontend-dev sh

# Limpeza
clean: ## Remove containers, volumes e imagens
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-all: ## Limpeza completa (cuidado!)
	docker-compose down -v --remove-orphans
	docker-compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -a -f

# Status
status: ## Mostra status dos containers
	$(COMPOSE_DEV) ps

health: ## Verifica saúde dos serviços
	@echo "=== Backend Health ==="
	@curl -s http://localhost:5000/api/metrics | head -5 || echo "Backend não disponível"
	@echo ""
	@echo "=== Frontend Health ==="
	@curl -s -I http://localhost:5173 | head -1 || echo "Frontend não disponível"

# Setup inicial
setup: ## Setup inicial do projeto
	@echo "Configurando The Wheel Screener..."
	@cp .env.example .env || echo "Arquivo .env já existe"
	@echo "Arquivo .env criado. Edite conforme necessário."
	@echo "Execute 'make dev' para iniciar o desenvolvimento."

# Backup
backup: ## Backup dos dados do Redis
	docker-compose exec redis redis-cli BGSAVE
	docker cp $$(docker-compose ps -q redis):/data/dump.rdb ./backup-redis-$$(date +%Y%m%d-%H%M%S).rdb

# Atualização
update: ## Atualiza dependências
	$(COMPOSE_DEV) exec frontend-dev npm update
	$(COMPOSE_DEV) exec backend-dev pip install --upgrade -r requirements.txt

