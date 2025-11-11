.PHONY: help build build-frontend build-backend run run-frontend run-backend test test-frontend test-backend clean docker-build docker-run docker-up docker-down docker-logs

# Variables
DOCKER_IMAGE_NAME := tcmp-demo
DOCKER_TAG := latest
FRONTEND_DIR := frontend
BACKEND_DIR := backend

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# Build targets
build: build-frontend build-backend ## Build both frontend and backend

build-frontend: ## Build frontend
	@echo "Building frontend..."
	cd $(FRONTEND_DIR) && npm install && npm run build

build-backend: ## Build backend
	@echo "Building backend..."
	cd $(BACKEND_DIR) && go mod download && go build -o server .

# Run targets
run: run-backend ## Run backend (frontend served by backend in production)

run-frontend: ## Run frontend dev server
	@echo "Starting frontend dev server..."
	cd $(FRONTEND_DIR) && npm run dev

run-backend: ## Run backend server
	@echo "Starting backend server..."
	cd $(BACKEND_DIR) && go run main.go

# Test targets
test: test-backend ## Run all tests

test-frontend: ## Run frontend tests
	@echo "Running frontend tests..."
	cd $(FRONTEND_DIR) && npm test || echo "No tests configured"

test-backend: ## Run backend tests
	@echo "Running backend tests..."
	cd $(BACKEND_DIR) && go test ./...

# Docker targets
docker-build: ## Build Docker image
	@echo "Building Docker image..."
	docker build -t $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) .

docker-run: ## Run Docker container (requires ADMIN_PASSWORD env var)
	@echo "Running Docker container..."
	@if [ -z "$$ADMIN_PASSWORD" ]; then \
		echo "ERROR: ADMIN_PASSWORD environment variable is required"; \
		echo "Usage: ADMIN_PASSWORD=your-password make docker-run"; \
		exit 1; \
	fi
	docker run -p 8080:8080 \
		-e PORT=$${PORT:-8080} \
		-e ADMIN_PASSWORD=$$ADMIN_PASSWORD \
		-e FIRESTORE_CREDENTIALS_PATH=/app/credentials/india-tech-meetup-2025-4152acea5580.json \
		-v $(PWD)/$(BACKEND_DIR)/credentials:/app/credentials:ro \
		$(DOCKER_IMAGE_NAME):$(DOCKER_TAG)

docker-up: ## Start services with docker-compose
	@echo "Starting services with docker-compose..."
	docker-compose up -d

docker-down: ## Stop services with docker-compose
	@echo "Stopping services with docker-compose..."
	docker-compose down

docker-logs: ## View docker-compose logs
	docker-compose logs -f

docker-clean: ## Remove Docker images and containers
	@echo "Cleaning Docker resources..."
	docker-compose down -v
	docker rmi $(DOCKER_IMAGE_NAME):$(DOCKER_TAG) || true

# Clean targets
clean: ## Clean build artifacts
	@echo "Cleaning build artifacts..."
	rm -rf $(FRONTEND_DIR)/dist
	rm -rf $(FRONTEND_DIR)/node_modules
	rm -f $(BACKEND_DIR)/server
	rm -f $(BACKEND_DIR)/*.log

install: ## Install dependencies
	@echo "Installing dependencies..."
	cd $(FRONTEND_DIR) && npm install
	cd $(BACKEND_DIR) && go mod download

