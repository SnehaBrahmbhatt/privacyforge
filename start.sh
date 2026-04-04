#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Step 1: Install Python dependencies
echo "Installing Python dependencies..."
pip install -r "$ROOT/backend/requirements.txt"

# Step 2: Build frontend
echo "Building frontend..."
cd "$ROOT/frontend"
npm install
npm install autoprefixer tailwindcss postcss --save-dev
npm run build

# Step 3: Start backend
echo "Starting backend..."
cd "$ROOT/backend"
export PYTHONPATH="$ROOT/backend"
uvicorn main:app --host 0.0.0.0 --port 8000