# Use Node 20 Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --production

# Copy backend code
COPY server/ ./server

# Copy pre-built Vue frontend
COPY client/dist/ /app/client-dist

# Expose ports
EXPOSE 8080  # Vue frontend
EXPOSE 1111  # Backend API

# Start both frontend and backend
# Using a simple Node script to run both
WORKDIR /app
COPY start.js ./start.js
CMD ["node", "start.js"]