FROM node:18-alpine

# Install build dependencies for node-canvas
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