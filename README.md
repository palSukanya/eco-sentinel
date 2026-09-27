# 🌍 Eco-Sentinel — Ecosystem Stability Monitor


📊 AI-powered ecosystem stability & collapse risk monitoring system

---

## 🧠 Overview

Eco-Sentinel monitors aquatic and terrestrial ecosystem health using monthly environmental time-series data (2013–2020). It computes a weighted **Stability Index** from indicators like dissolved oxygen, vegetation cover, CO₂ levels, and deforestation pressure — then trains a **Random Forest model** to predict that index and surface collapse risk scores, resilience trends, and early warning signals through an interactive dashboard.

---

## ✨ Features

- 🌊 **Aquatic Analysis** — 8 indicators including dissolved oxygen, pH, chlorophyll-a, turbidity, and fish capture volume
- 🌱 **Terrestrial Analysis** — 10 indicators including wildlife population index, vegetation cover, soil moisture, CO₂ levels, and habitat fragmentation score
- 📉 **Collapse Risk Prediction** — Random Forest Regressor trained on engineered features (Bioflux Index, Resilience Score, rolling variance)
- ⚠️ **Early Warning System** — flags declining trend slopes and rising volatility before scores reach critical thresholds
- 🧪 **Simulation Lab** — adjust temperature, CO₂, deforestation pressure, or fish capture levels and observe predicted stability impact in real time
- 📊 **Interactive Visualization** — monthly trend charts, status distributions, and feature importance breakdowns
- 🧠 **Explainability Module** — per-feature importance scores from the Random Forest revealing what's driving ecosystem risk

---

## 🛠️ Tech Stack

**Frontend**
- React (Vite) + TypeScript
- Tailwind CSS
- Framer Motion
- Recharts

**Backend**
- Flask (Python)
- Pandas, NumPy, scikit-learn
- Random Forest Regressor (custom pipeline)

**Deployment**
- Render (full-stack)

---

## ⚙️ Installation & Setup

### Clone Repository
```bash
git clone https://github.com/palSukanya/eco-sentinel.git
cd eco-sentinel
```

### Quick Start (Windows)
Double-click **`START.bat`** — installs everything and opens the app.

### Quick Start (Mac / Linux)
```bash
bash START.sh
```

### Manual Start in VS Code (2 terminals)

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

### Production Build (single server)
```bash
cd frontend && npm run build && cd ..
python app.py
```
Everything at → http://127.0.0.1:5000

---

## 📂 Project Structure

```
eco-sentinel/
├── app.py                  # Flask backend & API routes
├── requirements.txt        # Python dependencies
├── frontend/               # React/Vite frontend app
├── model/                  # ML pipelines (aquatic, terrestrial, combined)
├── data/                   # Environmental time-series datasets (CSV)
└── render.yaml             # Render deployment config
```

---

## 🤖 How the Model Works

Each ecosystem module follows the same pipeline:

1. **Normalize** all raw indicators using MinMaxScaler
2. **Invert** negative indicators (e.g. turbidity, CO₂, deforestation) so higher always means healthier
3. **Compute** a weighted Stability Index from ecologically-motivated weights (e.g. dissolved oxygen = 20%, fish capture = 5%)
4. **Engineer** derived features: Bioflux Index (rate of change), Resilience Score (stability ÷ rolling variance), rolling mean & STD
5. **Train** a Random Forest Regressor (100 trees) to predict the Stability Index
6. **Derive** collapse risk as `100 − stability_score`

The combined model weights aquatic stability at 60% and terrestrial at 40% for an overall ecosystem risk score.

---

## 🎯 Use Cases

- Environmental monitoring & reporting
- Climate risk assessment
- Policy decision support
- Academic & research analysis
