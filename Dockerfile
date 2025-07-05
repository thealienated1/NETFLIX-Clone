# Multi-stage build for Netflix Clone
# Stage 1: Dependencies
FROM node:18-alpine AS deps
WORKDIR /app

# Install dependencies for native modules
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Install build dependencies
RUN apk add --no-cache libc6-compat

# Copy package files
COPY package.json package-lock.json ./

# Install all dependencies (including dev dependencies)
RUN npm ci

# Copy source code and environment file
COPY . .

# Build arguments for environment variables
ARG VITE_APP_API_ENDPOINT_URL
ARG VITE_APP_TMDB_V3_API_KEY
ARG NODE_ENV=production

# Set environment variables for build time
ENV VITE_APP_API_ENDPOINT_URL=${VITE_APP_API_ENDPOINT_URL}
ENV VITE_APP_TMDB_V3_API_KEY=${VITE_APP_TMDB_V3_API_KEY}
ENV NODE_ENV=${NODE_ENV}

# Build the application
RUN npm run build

# Stage 3: Production
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy built application
WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder --chown=nextjs:nodejs /app/dist .

# Create health check endpoint
RUN echo '{"status":"healthy","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"}' > health.json

# Fix permissions for nginx directories
RUN mkdir -p /var/cache/nginx /var/run /var/log/nginx && \
    chown -R nextjs:nodejs /var/cache/nginx /var/run /var/log/nginx

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/health.json || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]