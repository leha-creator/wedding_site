# --- Makefile for pavel-maria-wedding ---
# Usage: make [target]

SHELL := bash
.ONESHELL:
.SHELLFLAGS := -eu -o pipefail -c
.DELETE_ON_ERROR:
MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

# --- Project ---
PROJECT  ?= pavel-maria-wedding
NODE_ENV ?= development
PORT     ?= 3000

# --- Git ---
VERSION    ?= $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
COMMIT     ?= $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BUILD_TIME := $(shell date -u '+%Y-%m-%dT%H:%M:%SZ')

# --- Docker ---
DOCKER_COMPOSE ?= docker compose

# ============================================================================
.DEFAULT_GOAL := help

##@ Development

.PHONY: install
install: ## Install dependencies (npm ci for reproducible CI)
	npm ci

.PHONY: install-dev
install-dev: ## Install dependencies (npm install for dev)
	npm install

.PHONY: dev
dev: ## Start development server with hot reload
	npm run dev

.PHONY: start
start: ## Start production server
	NODE_ENV=production npm run start

.PHONY: smoke
smoke: install ## Smoke test: verify modules load
	node -e "require('./src/db').initDb(); require('./src/db').getDb(); require('./src/services/submissions'); require('./src/routes/submit'); console.log('OK');"

##@ Testing & Quality

.PHONY: audit
audit: ## Run npm security audit
	npm audit --audit-level=high

.PHONY: ci
ci: install smoke audit ## Run full CI pipeline (install, smoke test, audit)

##@ Docker

.PHONY: docker-build
docker-build: ## Build Docker image
	$(DOCKER_COMPOSE) build

.PHONY: docker-up
docker-up: ## Start containers (detached)
	$(DOCKER_COMPOSE) up -d

.PHONY: docker-down
docker-down: ## Stop and remove containers
	$(DOCKER_COMPOSE) down

.PHONY: docker-logs
docker-logs: ## Tail container logs
	$(DOCKER_COMPOSE) logs -f

.PHONY: docker-ps
docker-ps: ## Show running containers
	$(DOCKER_COMPOSE) ps

##@ Cleanup

.PHONY: clean
clean: ## Remove build artifacts and caches
	rm -rf node_modules/.cache

.PHONY: clean-data
clean-data: ## Remove SQLite database (requires confirmation)
	@echo "This will delete ./data/ (submissions.db)"
	@read -p "Continue? [yN] " c; [ "$$c" = "y" ] || [ "$$c" = "Y" ] || exit 1
	rm -rf data/

##@ Help

.PHONY: help
help: ## Show this help
	@awk 'BEGIN {FS = ":.*##"; printf "Usage:\n  make \033[36m<target>\033[0m\n"} \
		/^[a-zA-Z_-]+:.*?## / {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2} \
		/^##@/ {printf "\n\033[1m%s\033[0m\n", substr($$0, 5)}' $(MAKEFILE_LIST)
