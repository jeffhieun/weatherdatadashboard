#!/bin/bash
set -e

# Build and run backend
echo "Building and starting backend..."
cd be
go build -o ../bin/weatherd ./cmd/weatherd
../bin/weatherd &
BACK_PID=$!

# Start frontend
echo "Starting frontend..."
cd ../fe
npm install
npm run dev

# When frontend stops, kill backend
kill $BACK_PID
echo "Stopped backend."
