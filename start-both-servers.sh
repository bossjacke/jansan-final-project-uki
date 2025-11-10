#!/bin/bash

echo "🚀 Starting Jansan Bio-Gas Project..."

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if backend is already running
if check_port 3003; then
    echo "✅ Backend server is already running on port 3003"
else
    echo "🔧 Starting backend server..."
    cd backend
    # Add products to database first
    echo "📦 Adding sample products to database..."
    node add-products.js
    
    # Start backend server
    echo "🖥️  Starting backend on port 3003..."
    npm run dev &
    BACKEND_PID=$!
    cd ..
    
    # Wait a bit for backend to start
    sleep 3
fi

# Check if frontend is already running
if check_port 5173; then
    echo "✅ Frontend server is already running on port 5173"
else
    echo "🎨 Starting frontend server..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    # Wait a bit for frontend to start
    sleep 3
fi

echo ""
echo "🎉 Project is ready!"
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend:  http://localhost:3003"
echo "📦 Products: http://localhost:5173/products"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap 'echo "🛑 Stopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT
wait
