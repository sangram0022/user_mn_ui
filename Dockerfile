# Multi-stage build for optimized production image
# User Management System - React 19 Enterprise Application

# ============================================
# Stage 1: Build
# ============================================
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies (production only for smaller image)
RUN npm ci --only=production && \
    npm cache clean --force

# Copy source code
COPY . .

# Build arguments for environment variables
ARG VITE_BACKEND_URL
ARG VITE_API_BASE_URL
ARG VITE_APP_ENV=production
ARG VITE_APP_NAME="User Management System"
ARG VITE_SENTRY_DSN
ARG VITE_ANALYTICS_ID
ARG VITE_ENCRYPTION_KEY

# Set environment variables
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_APP_ENV=$VITE_APP_ENV
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_SENTRY_DSN=$VITE_SENTRY_DSN
ENV VITE_ANALYTICS_ID=$VITE_ANALYTICS_ID
ENV VITE_ENCRYPTION_KEY=$VITE_ENCRYPTION_KEY
ENV NODE_ENV=production

# Build application
RUN npm run build:production

# List build output for verification
RUN ls -la dist/

# ============================================
# Stage 2: Production
# ============================================
FROM nginx:alpine

# Add metadata
LABEL maintainer="your-email@example.com"
LABEL version="1.0.0"
LABEL description="User Management System - Production Ready"

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy additional nginx config (if exists)
COPY nginx.conf /etc/nginx/nginx.conf

# Create nginx user and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Security: Run as non-root user
USER nginx

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/health.json || exit 1

# Expose port 80
EXPOSE 80

# Start nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
