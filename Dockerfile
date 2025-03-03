FROM node:18-alpine

WORKDIR /app

# Install dependencies for both server and client
COPY package*.json ./
COPY client/package*.json ./client/
RUN npm install
RUN cd client && npm install

# Copy source code
COPY . .

# Build the React client
RUN cd client && npm run build

# Expose the port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]