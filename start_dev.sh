#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# EcoSenitel — dev startup script
# Starts Flask backend (port 5000) and Vite frontend (port 8080) in parallel.
# Vite proxies /api/* to Flask automatically via vite.config.ts.
# ──────────────────────────────────────────────────────────────────────────────
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"

# ── 1. Install Python deps (once) ─────────────────────────────────────────────
echo "[EcoSenitel] Checking Python dependencies…"
pip install -q -r "$ROOT/requirements.txt"

# ── 2. Install Node deps (once) ───────────────────────────────────────────────
echo "[EcoSenitel] Checking Node dependencies…"
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
  npm install
fi
cd "$ROOT"

# ── 3. Launch Flask in background ─────────────────────────────────────────────
echo "[EcoSenitel] Starting Flask on http://127.0.0.1:5000 …"
python "$ROOT/app.py" &
FLASK_PID=$!

# ── 4. Launch Vite dev server ─────────────────────────────────────────────────
echo "[EcoSenitel] Starting Vite on http://localhost:8080 …"
cd "$ROOT/frontend"
npm run dev &
VITE_PID=$!

echo ""
echo "  ✓ Backend  → http://127.0.0.1:5000"
echo "  ✓ Frontend → http://localhost:8080"
echo "  (Ctrl+C to stop both)"
echo ""

# ── 5. Cleanup on exit ────────────────────────────────────────────────────────
trap "echo 'Stopping…'; kill $FLASK_PID $VITE_PID 2>/dev/null; exit" INT TERM
wait
