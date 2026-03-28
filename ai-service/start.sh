#!/usr/bin/env bash
set -e

ollama serve &
sleep 10

ollama pull ${OLLAMA_MODEL_NAME:-gemma3}

uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
