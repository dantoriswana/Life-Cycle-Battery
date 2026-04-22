from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np
import pandas as pd

app = Flask(__name__)
CORS(app)

import os

# Load model pipeline
try:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "model_battery.pkl")
    model = pickle.load(open(model_path, "rb"))
except:
    model = None
    print("Warning: model_battery.pkl not found. Please run the Jupyter Notebook first.")

def get_status(soh):
    if soh > 80:
        return "Normal"
    elif soh >= 50:
        return "Warning"
    else:
        return "Critical"

@app.route("/")
def home():
    return jsonify({"message": "Battery AI API Running"})

@app.route("/predict", methods=["POST"])
def predict():
    if model is None:
        return jsonify({"error": "Model not loaded. Train the model first."}), 500
        
    try:
        data = request.get_json()

        capacity = float(data["capacity"])
        soh = float(data["soh"])
        vd = float(data["voltage_drop"])
        min_v = float(data["min_voltage"])

        # Create DataFrame to match training data format and avoid warnings
        features = pd.DataFrame([{
            'capacity': capacity,
            'soh': soh,
            'voltage_drop': vd,
            'min_voltage': min_v
        }])
        
        # Pipeline handles scaling and prediction
        result = model.predict(features)[0]

        return jsonify({
            "rul": round(float(result), 2),
            "status": get_status(soh)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == "__main__":
    app.run(debug=True, port=5000)
