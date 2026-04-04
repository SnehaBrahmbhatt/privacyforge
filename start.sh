#!/bin/bash
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# Step 1: Install Python dependencies
echo "=== Installing Python dependencies ==="
pip install -r "$ROOT/backend/requirements.txt"

# Step 2: Build frontend
echo "=== Building frontend ==="
cd "$ROOT/frontend"
npm install --legacy-peer-deps
npm run build 2>&1  # Show full error output

# Step 3: Start backend
echo "=== Starting backend ==="
cd "$ROOT/backend"
export PYTHONPATH="$ROOT/backend"
exec uvicorn main:app --host 0.0.0.0 --port 8000