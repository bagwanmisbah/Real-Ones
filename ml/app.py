from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import math

app = Flask(__name__)
CORS(app)  # This allows your React Frontend to talk to this Python Backend

# 1. LOAD THE BRAIN
print("Loading Model...")
model = joblib.load('model.pkl')
print("Model Loaded Successfully!")

# 2. THE MATH ENGINE (Must be IDENTICAL to data_generator.py)
def extract_features(data):
    # Data expected format:
    # {
    #   "mouse_path": [[x, y, t], [x, y, t]...],
    #   "click_timestamps": [down_time, up_time],
    #   "keystroke_timestamps": [t1, t2, t3...]
    # }
    
    mouse_path = np.array(data.get('mouse_path', []))
    click_timestamps = data.get('click_timestamps', [0, 0])
    keystroke_timestamps = data.get('keystroke_timestamps', [])

    # --- A. Mouse Features ---
    if len(mouse_path) < 2:
        # If no movement recorded, assume worst-case BOT values
        movement_time = 0
        speed_variance = 0
        path_efficiency = 1.0
        curvature_sum = 0
    else:
        points = mouse_path[:, :2] # X, Y
        timestamps = mouse_path[:, 2] # Time
        
        # 1. Movement Time
        movement_time = timestamps[-1] - timestamps[0]
        
        # 2. Speed Variance
        diffs = np.diff(points, axis=0)
        segment_dists = np.sqrt((diffs ** 2).sum(axis=1))
        time_diffs = np.diff(timestamps) + 0.001 # Avoid divide by zero
        speeds = segment_dists / time_diffs
        speed_variance = np.std(speeds)
        
        # 3. Path Efficiency
        total_dist = segment_dists.sum()
        straight_dist = np.linalg.norm(points[-1] - points[0])
        path_efficiency = straight_dist / total_dist if total_dist > 0 else 1
        
        # 4. Curvature (Angles)
        curvature_sum = 0
        if len(points) > 2:
            v1 = diffs[:-1]
            v2 = diffs[1:]
            norm_v1 = np.linalg.norm(v1, axis=1, keepdims=True)
            norm_v2 = np.linalg.norm(v2, axis=1, keepdims=True)
            dot = (v1 * v2).sum(axis=1)
            valid_norms = (norm_v1 * norm_v2).flatten()
            cosine_angles = np.clip(dot / (valid_norms + 1e-10), -1.0, 1.0)
            curvature_sum = np.sum(np.arccos(cosine_angles))

    # --- B. Click Features ---
    # click_dwell = time_up - time_down
    if len(click_timestamps) >= 2:
        click_dwell = click_timestamps[1] - click_timestamps[0]
    else:
        click_dwell = 0 # Suspiciously fast

    # --- C. Typing Features ---
    # Flight time = avg time between keys
    if len(keystroke_timestamps) > 1:
        flight_times = np.diff(keystroke_timestamps)
        typing_flight_avg = np.mean(flight_times)
    else:
        typing_flight_avg = 0 # Suspiciously fast (Paste or Script)

    # Return exactly the 6 columns the model expects
    # Columns: ['movement_time', 'speed_variance', 'path_efficiency', 'curvature_sum', 'click_dwell', 'typing_flight_avg']
    return [movement_time, speed_variance, path_efficiency, curvature_sum, click_dwell, typing_flight_avg]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        # 1. Get Raw Data from React
        raw_data = request.json
        print("Received Data Payload...")
        
        # 2. Calculate Features (The 6 Golden Numbers)
        features = extract_features(raw_data)
        print(f"Calculated Features: {features}")
        
        # 3. Ask the Brain
        prediction = model.predict([features])[0] # 0 or 1
        probability = model.predict_proba([features])[0][1] # Confidence it is a Bot
        
        # 4. Form Verdict
        result = {
            "is_bot": bool(prediction == 1),
            "confidence_score": float(probability * 100),
            "verdict": "BOT" if prediction == 1 else "HUMAN",
            "features_calculated": {
                "efficiency": features[2],
                "curvature": features[3],
                "dwell_time": features[4]
            }
        }
        
        print(f"Verdict: {result['verdict']} ({result['confidence_score']:.2f}%)")
        return jsonify(result)

    except Exception as e:
        print(f"ERROR: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)