FROM node:20-alpine

WORKDIR /app

# Copy server package files and install deps
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm ci --production

# Copy server code
COPY server/ ./

# Expose backend port
EXPOSE 80

# Start backend
CMD ["npm", "run", "start:prod"]
