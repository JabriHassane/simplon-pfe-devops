# Multi-stage build for Frontend
# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY shared/package*.json ./shared/

# Install dependencies
WORKDIR /app/shared
RUN npm install

WORKDIR /app/client
RUN npm install

# Copy source code
WORKDIR /app
COPY client ./client
COPY shared ./shared

# Build the application
WORKDIR /app/client
RUN npm run build

# Stage 2: Production with Nginx
FROM nginx:alpine

# Copy custom nginx config for SPA
COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/client/dist /usr/share/nginx/html

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
