#!/bin/bash
set -e

echo "Starting deployment of todayku..."

# Build and start the containers
docker-compose down
docker-compose build
docker-compose up -d

echo "Waiting for services to initialize..."
sleep 20

# Check if the application is running properly
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/ || echo "Error")

if [ "$response" = "200" ]; then
  echo "Deployment successful! Application is running correctly."
else
  echo "Warning: Application may not be running correctly. HTTP response: $response"
  echo "Check the logs with: docker-compose logs"
fi

echo "Deployment completed."