# Multi-stage Dockerfile for React 19 Application
# Production-ready with security best practices and performance optimization

# ===========================
# Stage 1: Base Node.js image
# ===========================
FROM node:20-alpine AS base

# Install security updates and essential packages
RUN apk update && apk upgrade && \
    apk add --no-cache \
    dumb-init \
    curl \
    ca-certificates \
    && rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# ===========================
# Stage 2: Development dependencies
# ===========================
FROM base AS deps

# Install all dependencies (including dev dependencies for building)
RUN npm ci --include=dev --prefer-offline --no-audit

# ===========================
# Stage 3: Build stage
# ===========================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments for metadata
ARG BUILD_DATE
ARG VCS_REF
ARG VERSION=1.0.0

# Set build environment
ENV NODE_ENV=production
ENV VITE_APP_VERSION=${VERSION}
ENV VITE_BUILD_DATE=${BUILD_DATE}
ENV VITE_VCS_REF=${VCS_REF}

# Run build with optimizations
RUN npm run build && \
    npm run test:run && \
    npm prune --production

# ===========================
# Stage 4: Production runtime
# ===========================
FROM nginx:1.25-alpine AS production

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache curl dumb-init && \
    rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nginx-group && \
    adduser -S nginx-user -u 1001 -G nginx-group

# Copy built application
COPY --from=builder --chown=nginx-user:nginx-group /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY --chown=nginx-user:nginx-group nginx.conf /etc/nginx/nginx.conf

# Create necessary directories with proper permissions
RUN mkdir -p /var/cache/nginx /var/log/nginx /var/run && \
    chown -R nginx-user:nginx-group /var/cache/nginx /var/log/nginx /var/run /etc/nginx

# Switch to non-root user
USER nginx-user

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Labels for metadata (OCI standard)
LABEL org.opencontainers.image.title="React 19 User Management App" \
      org.opencontainers.image.description="Production-ready React 19 application with user management and RBAC" \
      org.opencontainers.image.version=${VERSION} \
      org.opencontainers.image.created=${BUILD_DATE} \
      org.opencontainers.image.revision=${VCS_REF} \
      org.opencontainers.image.vendor="Your Company" \
      org.opencontainers.image.source="https://gitlab.com/your-project/react-app" \
      org.opencontainers.image.documentation="https://gitlab.com/your-project/react-app/-/blob/main/README.md" \
      org.opencontainers.image.licenses="MIT"

# Start nginx with dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]

# ===========================
# Stage 5: Development stage
# ===========================
FROM base AS development

# Install all dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY --chown=nextjs:nodejs . .

# Switch to non-root user
USER nextjs

# Expose development port
EXPOSE 5173

# Health check for development
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:5173/ || exit 1

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# ===========================
# Stage 6: Testing stage
# ===========================
FROM base AS test

# Install all dependencies including dev dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Switch to non-root user
USER nextjs

# Set test environment
ENV NODE_ENV=test
ENV CI=true

# Run all tests
CMD ["npm", "run", "test:coverage"]