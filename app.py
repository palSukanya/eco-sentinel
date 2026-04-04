"""
Ecosystem Stability & Collapse Risk Assessment System
Flask API backend — serves React frontend from frontend/dist (production)
or redirects to Vite dev server on port 8080 (development).
"""
from flask import Flask, jsonify, request, send_from_directory, redirect
import traceback, os, numpy as np, pandas as pd

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
_DIST_DIR = os.path.join(_BASE_DIR, "frontend", "dist")
_HAS_DIST = os.path.isdir(_DIST_DIR) and os.path.isfile(os.path.join(_DIST_DIR, "index.html"))

app = Flask(__name__, static_folder="frontend/dist", static_url_path="/")

# ── Manual CORS ───────────────────────────────────────────────────────────────
@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

@app.route("/api/<path:path>", methods=["OPTIONS"])
def options_handler(path):
    return "", 204

# ── helpers ───────────────────────────────────────────────────────────────────
def _err(msg: str, code: int = 500):
    return jsonify({"error": msg}), code

# ── Auto-generate sample CSVs if missing ──────────────────────────────────────
def _ensure_data():
    data_dir = os.path.join(_BASE_DIR, "data")
    os.makedirs(data_dir, exist_ok=True)
    years, months = [], []
    for y in range(2013, 2021):
        for m in range(1, 13):
            years.append(y); months.append(m)
    n   = len(years)
    rng = np.random.default_rng(42)

    aq_path = os.path.join(data_dir, "Ecosystem Stability.csv")
    if not os.path.exists(aq_path):
        base = np.linspace(7.5, 6.8, n)
        pd.DataFrame({
            "Year": years, "Month": months,
            "DO":           base + rng.normal(0, 0.3, n),
            "Temp":         np.linspace(18, 22, n) + rng.normal(0, 1, n),
            "pH":           7.2 + rng.normal(0, 0.2, n),
            "Turbidity":    np.linspace(10, 18, n) + rng.normal(0, 2, n),
            "Conductivity": 450 + rng.normal(0, 30, n),
            "CHLA":         np.linspace(5, 9, n) + rng.normal(0, 1, n),
            "SST":          np.linspace(20, 24, n) + rng.normal(0, 0.8, n),
            "Capture":      np.linspace(120, 160, n) + rng.normal(0, 10, n),
        }).to_csv(aq_path, index=False)
        print(f"[EcoSenitel] Generated {aq_path}")

    te_path = os.path.join(data_dir, "Ecosystem Stability Terrestrial.csv")
    if not os.path.exists(te_path):
        pd.DataFrame({
            "Year": years, "Month": months,
            "Average of Wildlife Population Index":    np.linspace(65, 55, n) + rng.normal(0, 3, n),
            "Average of Vegetation Index":             np.linspace(0.55, 0.45, n) + rng.normal(0, 0.03, n),
            "Average of Soil Moisture":                np.linspace(35, 30, n) + rng.normal(0, 2, n),
            "Average Temperature":                     np.linspace(22, 25, n) + rng.normal(0, 1, n),
            "Average of CO2 Level":                    np.linspace(395, 415, n) + rng.normal(0, 2, n),
            "Count of Extreme Weather Event":          rng.poisson(2, n).astype(float),
            "Sum of Economic Impact":                  np.linspace(1e6, 3e6, n) + rng.normal(0, 1e5, n),
            "Sum of Population Affected":              np.linspace(5000, 12000, n) + rng.normal(0, 500, n),
            "Average of Habitat Fragmentation Score":  np.linspace(0.3, 0.5, n) + rng.normal(0, 0.03, n),
            "Average of Deforestation Pressure Index": np.linspace(0.2, 0.4, n) + rng.normal(0, 0.02, n),
        }).to_csv(te_path, index=False)
        print(f"[EcoSenitel] Generated {te_path}")
try:
    _ensure_data()
except Exception as e:
    print(f"[EcoSenitel] Data init failed: {e}")
# ── Serve React (production build) OR dev instructions ────────────────────────

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    full_path = os.path.join(app.static_folder, path)

    if path != "" and os.path.exists(full_path):
        return send_from_directory(app.static_folder, path)

    return send_from_directory(app.static_folder, "index.html")
    

# ── API: analysis ─────────────────────────────────────────────────────────────
@app.route("/api/aquatic", methods=["GET"])
def api_aquatic():
    try:
        from model.aquatic import run_aquatic_model
        return jsonify(run_aquatic_model())
    except FileNotFoundError as e:
        return _err(f"Data file not found: {e}", 404)
    except Exception:
        return _err(traceback.format_exc())

@app.route("/api/terrestrial", methods=["GET"])
def api_terrestrial():
    try:
        from model.terrestrial import run_terrestrial_model
        return jsonify(run_terrestrial_model())
    except FileNotFoundError as e:
        return _err(f"Data file not found: {e}", 404)
    except Exception:
        return _err(traceback.format_exc())

@app.route("/api/combined", methods=["GET"])
def api_combined():
    try:
        from model.combined import run_combined_model
        return jsonify(run_combined_model())
    except FileNotFoundError as e:
        return _err(f"Data file not found: {e}", 404)
    except Exception:
        return _err(traceback.format_exc())

# ── API: simulations ──────────────────────────────────────────────────────────
@app.route("/api/simulate/aquatic", methods=["POST"])
def api_simulate_aquatic():
    try:
        body = request.get_json(force=True) or {}
        from model.aquatic import run_aquatic_simulation
        return jsonify(run_aquatic_simulation(
            capture_change=float(body.get("capture_change", 0)),
            temp_change=float(body.get("temp_change", 0)),
            turbidity_change=float(body.get("turbidity_change", 0)),
        ))
    except Exception:
        return _err(traceback.format_exc())

@app.route("/api/simulate/terrestrial", methods=["POST"])
def api_simulate_terrestrial():
    try:
        body = request.get_json(force=True) or {}
        from model.terrestrial import run_terrestrial_simulation
        return jsonify(run_terrestrial_simulation(
            temp_change=float(body.get("temp_change", 0)),
            co2_change=float(body.get("co2_change", 0)),
            deforestation_change=float(body.get("deforestation_change", 0)),
            soil_change=float(body.get("soil_change", 0)),
        ))
    except Exception:
        return _err(traceback.format_exc())

# ── API: generate sample data ─────────────────────────────────────────────────
@app.route("/api/generate-sample-data", methods=["POST"])
def generate_sample_data():
    data_dir = os.path.join(_BASE_DIR, "data")
    for fname in ["Ecosystem Stability.csv", "Ecosystem Stability Terrestrial.csv"]:
        p = os.path.join(data_dir, fname)
        if os.path.exists(p):
            os.remove(p)
    _ensure_data()
    return jsonify({"status": "ok", "message": "Sample data files (re)created."})

# ── BOOT ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    _ensure_data()
    print(f"[EcoSenitel] React dist found: {_HAS_DIST}")
    if _HAS_DIST:
        print("[EcoSenitel] Serving full app at http://127.0.0.1:5000")
    else:
        print("[EcoSenitel] API only mode. Open http://localhost:8080 after running: cd frontend && npm run dev")
    app.run(debug=True, port=5000)
