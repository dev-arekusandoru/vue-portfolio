# Use Node 20 Alpine for smaller image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --production

# Copy backend code (fix: copy to current directory, not nested)
COPY server/ ./

# Copy pre-built Vue frontend (fix: copy to current app directory)
COPY client/dist/ ./client-dist

# Expose ports
EXPOSE 8080
EXPOSE 1111

# Start both frontend and backend
# Using a simple Node script to run both
WORKDIR /app
COPY start.js ./start.js
CMD ["node", "start.js"]