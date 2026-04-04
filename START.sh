#!/usr/bin/env bash
# EcoSenitel — one-click startup for Mac/Linux
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo ""
echo "  ============================================="
echo "   ECOSenitel - Starting up..."
echo "  ============================================="
echo ""

# Install Python deps
echo "[1/4] Installing Python dependencies..."
pip install -r "$ROOT/requirements.txt" -q

# Install Node deps
echo "[2/4] Installing Node dependencies..."
cd "$ROOT/frontend"
if [ ! -d "node_modules" ]; then
    echo "      Running npm install..."
    npm install
else
    echo "      node_modules already installed, skipping."
fi
cd "$ROOT"

# Start Flask
echo "[3/4] Starting Flask backend on port 5000..."
python "$ROOT/app.py" &
FLASK_PID=$!

# Start Vite
echo "[4/4] Starting React frontend on port 8080..."
cd "$ROOT/frontend"
npm run dev &
VITE_PID=$!

sleep 4

# Open browser
echo ""
echo "  Opening http://localhost:8080 ..."
if command -v open &>/dev/null; then
    open http://localhost:8080
elif command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:8080
fi

echo ""
echo "  ============================================="
echo "   Frontend: http://localhost:8080"
echo "   Backend:  http://127.0.0.1:5000"
echo "   Press Ctrl+C to stop both servers."
echo "  ============================================="
echo ""

trap "echo 'Stopping...'; kill $FLASK_PID $VITE_PID 2>/dev/null" INT TERM
wait
