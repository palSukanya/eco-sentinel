#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# EcoSenitel — production build
# Builds the React frontend into frontend/dist/, then Flask serves everything.
# After running this, just do: python app.py
# ──────────────────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "[EcoSenitel] Installing Node dependencies…"
cd "$ROOT/frontend"
npm install

echo "[EcoSenitel] Building React frontend…"
npm run build

echo ""
echo "  ✓ Build complete → frontend/dist/"
echo "  Start with: python app.py"
echo "  Then open:  http://127.0.0.1:5000"
