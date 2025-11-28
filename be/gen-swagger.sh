#!/bin/bash
# Regenerate Swagger API docs for the backend
set -e

if ! command -v swag &> /dev/null; then
  echo "swag CLI not found. Installing..."
  go install github.com/swaggo/swag/cmd/swag@latest
  export PATH=$HOME/go/bin:$PATH
fi

swag init -g cmd/weatherd/main.go

echo "Swagger docs regenerated in ./docs/"
