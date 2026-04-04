# EcoSenitel — Ecosystem Stability Monitor

## Quick Start (Windows)
Double-click **`START.bat`** — installs everything and opens the app.

## Quick Start (Mac / Linux)
```bash
bash START.sh
```

## Manual Start in VS Code (2 terminals)

**Terminal 1 — Backend:**
```bash
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
python app.py
```
Backend → http://127.0.0.1:5000

**Terminal 2 — Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Open → **http://localhost:8080**

## Production Build (single server)
```bash
cd frontend && npm run build && cd ..
python app.py
```
Everything at → http://127.0.0.1:5000
