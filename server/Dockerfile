FROM node:20-alpine

WORKDIR /app

# Copy server package files and install deps
COPY package*.json ./
WORKDIR /app
RUN npm ci --production

# Copy server code
COPY . ./
#TODO: use a docker container to store the database
COPY .manifest ./manifest

# Expose backend port
EXPOSE 80

# Start backend
CMD ["npm", "run", "start:prod"]
