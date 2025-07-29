# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./
COPY vite.config.js ./

# Build the application
RUN npm run build

# Production stage
  FROM nginx:alpine

  # Create non-root user
  RUN addgroup -S nonroot \
      && adduser -S nonroot -G nonroot

  # Copy built application from build stage
  COPY --from=build /app/dist /usr/share/nginx/html

  # Change ownership to non-root user
  RUN chown -R nonroot:nonroot /usr/share/nginx/html

  # Switch to non-root user
  USER nonroot

  # Expose port 80
  EXPOSE 80

  # Start nginx
  CMD ["nginx", "-g", "daemon off;"]