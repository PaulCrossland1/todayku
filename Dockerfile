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
    automake

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

# Create volume for persistent data
VOLUME ["/app/data"]

# Expose the port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]