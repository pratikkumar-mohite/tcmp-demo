# Multi-stage Dockerfile for building frontend and backend

# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Build Backend
FROM golang:1.21-alpine AS backend-builder

WORKDIR /app/backend

# Install git (needed for some Go dependencies)
RUN apk add --no-cache git

# Copy go mod files
COPY backend/go.mod backend/go.sum ./

# Download dependencies
RUN go mod download

# Copy backend source
COPY backend/ ./

# Build backend binary
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o server .

# Stage 3: Final Runtime Image
FROM alpine:latest

WORKDIR /app

# Install ca-certificates and wget for HTTPS requests and healthcheck
RUN apk --no-cache add ca-certificates wget

# Copy backend binary from builder
COPY --from=backend-builder /app/backend/server .

# Copy frontend build from builder
COPY --from=frontend-builder /app/frontend/dist ./static

# Create credentials directory (will be mounted as volume in docker-compose)
RUN mkdir -p /app/credentials

# Expose port
EXPOSE 8080

# Set default environment variables (should be overridden via docker-compose or runtime)
ENV PORT=8080
# Note: ADMIN_PASSWORD and FIRESTORE_CREDENTIALS_PATH should be set via environment variables
# or docker-compose.yml, never hardcoded in production

# Run the server
CMD ["./server"]

