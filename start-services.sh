#!/bin/bash

# Start MongoDB and RabbitMQ if not already running
brew services start mongodb-community
brew services start rabbitmq

# Function to start a service
start_service() {
    cd "services/$1"
    npm run dev &
    cd ../..
}

# Start all services
start_service "api-gateway"
sleep 2
start_service "auth-service"
sleep 2
start_service "product-service"
sleep 2
start_service "cart-service"
sleep 2
start_service "order-service"
sleep 2
start_service "shop-service"
sleep 2
start_service "notification-service"

echo "All services have been started!"
echo "API Gateway: http://localhost:3000"
echo "Auth Service: http://localhost:3001"
echo "Product Service: http://localhost:3002"
echo "Cart Service: http://localhost:3003"
echo "Order Service: http://localhost:3004"
echo "Shop Service: http://localhost:3005"
echo "Notification Service: http://localhost:3006"
echo "RabbitMQ Management: http://localhost:15672"

# Keep the script running
wait