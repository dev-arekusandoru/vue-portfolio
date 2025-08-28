# Use Node 20 Alpine for smaller image
FROM node:20-alpine

WORKDIR /app

# Copy Vue project and install dependencies
# COPY package*.json ./
# RUN npm ci

# Copy rest of client code and build
# COPY . ./
# RUN npm run build

# Serve the built app using serve
# FROM node:20-alpine

# WORKDIR /app

# Install serve
RUN npm install -g serve

# Copy pre-built Vue frontend
COPY dist/ ./client-dist

# Expose port 80
EXPOSE 80

# Start frontend
CMD ["serve", "-s", "client-dist", "-l", "80"]
