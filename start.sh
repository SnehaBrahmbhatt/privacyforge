#!/bin/bash
cd "$(dirname "$0")"
cd frontend && npm install && npm run build
cd ../backend
export PYTHONPATH=$(pwd)
uvicorn main:app --host 0.0.0.0 --port 8000