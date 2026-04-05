
#!/bin/bash
set -e
export PYTHONPATH=/opt/render/project/src/backend
cd /opt/render/project/src/backend
exec uvicorn main:app --host 0.0.0.0 --port 8000