FROM node:18-alpine

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    jpeg-dev \
    cairo-dev \
    giflib-dev \
    pango-dev \
    libtool \
    autoconf \
    automake \
    curl

WORKDIR /app

# Create directories for volumes
RUN mkdir -p /app/data

# Copy package files first for better caching
COPY package*.json ./
COPY client/package*.json ./client/

# Install dependencies
RUN npm install
RUN cd client && npm install

# Copy entire project
COPY . .

# Build the React client
RUN cd client && npm run build

# Add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/ || exit 1

# Create volume for persistent data
VOLUME ["/app/data"]

# Expose the port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]