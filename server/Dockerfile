FROM node:20-alpine

WORKDIR /app

# Copy server package files and install deps
COPY package*.json ./
WORKDIR /app
RUN npm ci --production

# Copy server code
COPY . ./

# Expose backend port
EXPOSE 1111

# Start backend
CMD ["npm", "run", "start:prod"]
