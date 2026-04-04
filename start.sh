#!/bin/bash
set -e

# Get the root directory of the repo
ROOT="$(cd "$(dirname "$0")" && pwd)"

# Step 1: Install Python dependencies
echo "Installing Python dependencies..."
pip install -r "$ROOT/backend/requirements.txt"

# Step 2: Build frontend
echo "Building frontend..."
cd "$ROOT/frontend"
npm install
npm run build

# Step 3: Start backend (with PYTHONPATH set to backend folder)
echo "Starting backend..."
cd "$ROOT/backend"
export PYTHONPATH="$ROOT/backend"
uvicorn main:app --host 0.0.0.0 --port 8000