from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import numpy as np
import os
import json

app = Flask(__name__)
CORS(app)

# Load Model V2 (XGBoost Pipeline)
base_dir = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(base_dir, 'model_battery_v2.pkl')
meta_path = os.path.join(base_dir, 'model_metadata.json')

model = joblib.load(model_path)
with open(meta_path, 'r') as f:
    meta = json.load(f)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        
        # Input Features (Industry Standards: Voltage, IRT, CCA)
        voltage = float(data['voltage'])
        irt = float(data['irt'])
        cca = float(data['cca'])
        
        # Prepare for model (must match training features)
        input_df = pd.DataFrame([[voltage, irt, cca]], 
                                columns=['voltage', 'irt', 'cca'])
        
        # Prediction (Multi-output: [RUL, SOH])
        prediction = model.predict(input_df)[0]
        rul_cycles = float(prediction[0])
        predicted_soh = float(prediction[1])
        
        rul_cycles = max(0, rul_cycles) # Prevent negative
        
        # Physical constraint: If Voltage is critically low, RUL cannot be high
        if voltage < 11.0:
            rul_cycles = 0
            
        # Synchronization Logic for consistency
        # If RUL is 0, the battery is effectively at 0% health for the user
        if rul_cycles == 0:
            predicted_soh = 0.0 # Force to 0% if RUL is 0
            
        # Physical constraint: Aggressive drop below 11.5V
        if voltage < 11.5:
            # 10.5V is typically the dead voltage for a 12V Lead-Acid battery
            voltage_factor = max(0, (voltage - 10.5) / 1.0) # 0 at 10.5V, 1 at 11.5V
            predicted_soh = min(predicted_soh, voltage_factor * 50.0)

        predicted_soh = np.clip(predicted_soh, 0, 100) # Clamp 0-100%
        
        # Estimation of days/weeks (Asumsi aki baru tahan ~2 tahun atau 730 hari)
        total_max_cycles = 14268.0
        expected_life_days = 730.0 # 2 tahun
        cycles_per_day = total_max_cycles / expected_life_days
        cycles_per_week = cycles_per_day * 7
        
        rul_weeks = float(rul_cycles / cycles_per_week)
        rul_days = float(rul_cycles / cycles_per_day)
        
        # Status Classification (Based on PREDICTED SOH)
        status = "Normal"
        soh_critical = meta.get('soh_critical', 70.0)
        soh_warning = meta.get('soh_warning', 85.0)

        if predicted_soh <= soh_critical:
            status = "Kritis"
        elif predicted_soh <= soh_warning:
            status = "Peringatan"
            
        return jsonify({
            'rul_cycle': round(rul_cycles, 1),
            'rul_days': int(round(rul_days)),
            'rul_weeks': int(round(rul_weeks)),
            'predicted_soh': round(predicted_soh, 2),
            'status': status,
            'metrics': {
                'mae_rul': meta.get('mae_rul', 0),
                'mae_soh': meta.get('mae_soh', 0),
                'r2_rul': meta.get('r2_rul', 0)
            }
        })
        
    except Exception as e:
        import traceback
        print(f"Error during prediction: {str(e)}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 400

@app.route('/stats', methods=['GET'])
def get_stats():
    return jsonify(meta)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
