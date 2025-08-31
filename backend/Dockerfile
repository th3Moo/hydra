# Backend Dockerfile
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package.json ./
RUN npm install

# Bundle app source
COPY . .

# Expose port
EXPOSE 5000

# Run the server
CMD ["node", "server.js"]
