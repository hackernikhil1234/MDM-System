# Use specific LTS version for stability
FROM node:18-alpine

# Set to production
ENV NODE_ENV=production

WORKDIR /app

# Create logs directory and set permissions for non-root user
RUN mkdir -p logs && chown -R node:node /app

# Copy package files first (better caching)
COPY --chown=node:node package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy source code with correct ownership
COPY --chown=node:node . .

# Use non-root user
USER node

# Expose port
EXPOSE 5000

# Health check for orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:5000/health').then(r => r.ok ? process.exit(0) : process.exit(1))"

# Start the application
CMD ["node", "server.js"]