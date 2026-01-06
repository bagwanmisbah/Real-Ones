from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import sqlite3
import json
import sqlite3
import json
from datetime import datetime, timedelta 

app = Flask(__name__)
CORS(app)

# --- DATABASE SETUP ---
DB_NAME = "database.db"

def init_db():
    """Creates the table if it doesn't exist."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS login_attempts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            verdict TEXT,              -- 'BOT', 'HUMAN', 'SUSPICIOUS'
            confidence_score REAL,     -- 0.0 to 100.0
            trigger_source TEXT,       -- 'Honeypot', 'SpeedTrap', 'ML_Model', 'GhostWindow'
            fail_reason TEXT,          -- Details ('Middle Name Filled', 'Efficiency 1.0')
            mouse_path TEXT,           -- JSON string of the raw path (for Replay)
            window_dims TEXT,          -- '1920x1080' (for Ghost Check)
            ip_address TEXT            -- (Optional) for counting unique attackers
        )
    ''')
    conn.commit()
    conn.close()
    print("✅ Database Initialized (login_attempts table ready)")

# Initialize DB immediately on start
init_db()

# --- MODEL LOADING ---
print("Loading Model...")
try:
    model = joblib.load('model.pkl')
    print("✅ Model Loaded Successfully!")
except:
    print("⚠️ WARNING: model.pkl not found. Predictions will fail, but Logging will work.")
    model = None

# --- HELPER: LOGGING FUNCTION ---
def log_attempt(data):
    """Writes a single event to the SQLite Database"""
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        
        # Convert list/dict to JSON string for storage
        mouse_path_str = json.dumps(data.get('features_calculated', {}).get('raw_path', []))
        
        cursor.execute('''
            INSERT INTO login_attempts 
            (verdict, confidence_score, trigger_source, fail_reason, mouse_path, window_dims)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data.get('verdict'),
            data.get('confidence_score'),
            data.get('trigger_source'),
            data.get('features_calculated', {}).get('note', 'Unknown'),
            mouse_path_str,
            data.get('window_dims', 'Unknown')
        ))
        conn.commit()
        conn.close()
        print(f"📝 Logged: {data.get('trigger_source')} -> {data.get('verdict')}")
    except Exception as e:
        print(f"❌ Database Error: {e}")

# --- FEATURE EXTRACTION (The Math) ---
def extract_features(data):
    # (Keeping your existing logic essentially the same)
    mouse_path = np.array(data.get('mouse_path', []))
    click_timestamps = data.get('click_timestamps', [0, 0])
    keystroke_timestamps = data.get('keystroke_timestamps', [])

    if len(mouse_path) < 2:
        return [0, 0, 1.0, 0, 0, 0] # Default Bot values
    
    points = mouse_path[:, :2]
    timestamps = mouse_path[:, 2]
    
    movement_time = timestamps[-1] - timestamps[0]
    
    diffs = np.diff(points, axis=0)
    segment_dists = np.sqrt((diffs ** 2).sum(axis=1))
    time_diffs = np.diff(timestamps) + 0.001
    speeds = segment_dists / time_diffs
    speed_variance = np.std(speeds)
    
    total_dist = segment_dists.sum()
    straight_dist = np.linalg.norm(points[-1] - points[0])
    path_efficiency = straight_dist / total_dist if total_dist > 0 else 1
    
    curvature_sum = 0
    if len(points) > 2:
        v1 = diffs[:-1]; v2 = diffs[1:]
        norm_v1 = np.linalg.norm(v1, axis=1, keepdims=True)
        norm_v2 = np.linalg.norm(v2, axis=1, keepdims=True)
        dot = (v1 * v2).sum(axis=1)
        valid = (norm_v1 * norm_v2).flatten()
        curvature_sum = np.sum(np.arccos(np.clip(dot / (valid + 1e-10), -1.0, 1.0)))

    click_dwell = click_timestamps[1] - click_timestamps[0] if len(click_timestamps) >= 2 else 0
    flight_avg = np.mean(np.diff(keystroke_timestamps)) if len(keystroke_timestamps) > 1 else 0

    return [movement_time, speed_variance, path_efficiency, curvature_sum, click_dwell, flight_avg]

# --- ROUTE 1: LOGGING ONLY (For Client-Side Traps) ---
@app.route('/log', methods=['POST'])
def log_event():
    """Frontend calls this when a trap (Honeypot, Ghost) is triggered locally."""
    data = request.json
    log_attempt(data)
    return jsonify({"status": "logged"}), 200

# --- ROUTE 2: PREDICTION (For Model) ---
@app.route('/predict', methods=['POST'])
def predict():
    try:
        raw_data = request.json
        features = extract_features(raw_data)
        
        # Prediction
        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0][1]
        
        # Prepare Verdict
        is_bot = bool(prediction == 1)
        verdict_text = "BOT" if is_bot else "HUMAN"
        
        result = {
            "verdict": verdict_text,
            "confidence_score": float(probability * 100),
            "trigger_source": "ML_Model",
            "features_calculated": {
                "efficiency": features[2],
                "curvature": features[3],
                "note": f"Model Prediction (Prob: {probability:.2f})",
                "raw_path": raw_data.get('mouse_path', []) # Save raw path for replay
            },
            "window_dims": f"{raw_data.get('screen_width',0)}x{raw_data.get('screen_height',0)}"
        }
        
        # LOG IT!
        log_attempt(result)
        
        return jsonify({
            "is_bot": is_bot,
            "confidence_score": result["confidence_score"],
            "features_calculated": result["features_calculated"]
        })

    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500
    
# --- ROUTE 3: ADMIN DASHBOARD STATS (WITH IST CONVERSION) ---
@app.route('/admin/stats', methods=['GET'])
def get_admin_stats():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    # SQL TRICK: datetime(timestamp, '+5.5 hours') converts UTC to IST
    
    # 1. LIVE FEED (Last 20 events)
    cursor.execute("""
        SELECT id, datetime(timestamp, '+5.5 hours'), verdict, trigger_source, confidence_score 
        FROM login_attempts 
        ORDER BY id DESC LIMIT 20
    """)
    recent_logs = [
        {"id": r[0], "time": r[1], "verdict": r[2], "source": r[3], "score": r[4]} 
        for r in cursor.fetchall()
    ]
    
    # 2. ATTACK FUNNEL (Count by Trigger) - No time change needed here
    cursor.execute("SELECT trigger_source, COUNT(*) FROM login_attempts GROUP BY trigger_source")
    funnel_data = [{"name": r[0], "value": r[1]} for r in cursor.fetchall()]
    
    # 3. THE ZOO (Bot Types) - No time change needed here
    cursor.execute("SELECT fail_reason, COUNT(*) FROM login_attempts WHERE verdict='BOT' GROUP BY fail_reason")
    zoo_data = [{"name": r[0], "value": r[1]} for r in cursor.fetchall()]
    
    # 4. HOURLY HEATMAP (Bots per Hour in IST)
    # We must shift to IST *before* extracting the hour, otherwise 2:00 AM UTC (7:30 AM IST) counts as 2 AM.
    cursor.execute("""
        SELECT strftime('%H', datetime(timestamp, '+5.5 hours')) as hour, 
               COUNT(*) 
        FROM login_attempts 
        WHERE verdict='BOT' 
        GROUP BY hour
    """)
    heatmap_raw = {int(r[0]): r[1] for r in cursor.fetchall()}
    heatmap_data = [{"hour": f"{h:02d}:00", "bots": heatmap_raw.get(h, 0)} for h in range(24)]

    # 5. HUMAN vs MACHINE (Traffic Volume by IST Date)
    # An attack at 1 AM IST should count for Today, not Yesterday.
    cursor.execute("""
        SELECT date(datetime(timestamp, '+5.5 hours')) as day, 
               SUM(CASE WHEN verdict='BOT' THEN 1 ELSE 0 END) as bots,
               SUM(CASE WHEN verdict='HUMAN' THEN 1 ELSE 0 END) as humans
        FROM login_attempts 
        GROUP BY day 
        ORDER BY day DESC LIMIT 7
    """)
    volume_data = [{"date": r[0], "bots": r[1], "humans": r[2]} for r in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        "recent_logs": recent_logs,
        "funnel_data": funnel_data,
        "zoo_data": zoo_data,
        "heatmap_data": heatmap_data,
        "volume_data": volume_data
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)