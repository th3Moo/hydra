# backend_nomongo/Dockerfile
FROM node:18

# Create app directory
WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy rest of app
COPY . .

EXPOSE 5000
CMD ["node", "server.js"]
