import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.multioutput import MultiOutputRegressor
import xgboost as xgb
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import json
import os

def train_model():
    print("Memulai proses pelatihan model XGBoost (Multi-Output: RUL & SOH)...")
    
    # 1. Load Data
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_path = os.path.join(base_dir, 'dataset_final_battery.csv')
    df = pd.read_csv(data_path)
    
    # 2. Persiapan Fitur dan Target
    # Fitur SEKARANG: hanya parameter sensor mentah
    X = df[['capacity', 'voltage_drop', 'min_voltage']]
    # Target SEKARANG: RUL dan SOH
    y = df[['rul', 'soh']]
    
    # 3. Split Data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # 4. Build Pipeline dengan MultiOutputRegressor
    pipeline = Pipeline([
        ('scaler', MinMaxScaler()),
        ('model', MultiOutputRegressor(xgb.XGBRegressor(
            n_estimators=150,
            learning_rate=0.08,
            max_depth=7,
            random_state=42,
            objective='reg:squarederror'
        )))
    ])
    
    # 5. Training
    print("Training multi-output model...")
    pipeline.fit(X_train, y_train)
    
    # 6. Evaluasi
    y_pred = pipeline.predict(X_test)
    
    # Metrics for RUL (index 0)
    mae_rul = mean_absolute_error(y_test['rul'], y_pred[:, 0])
    mse_rul = mean_squared_error(y_test['rul'], y_pred[:, 0])
    rmse_rul = np.sqrt(mse_rul)
    r2_rul = r2_score(y_test['rul'], y_pred[:, 0])
    
    # Metrics for SOH (index 1)
    mae_soh = mean_absolute_error(y_test['soh'], y_pred[:, 1])
    r2_soh = r2_score(y_test['soh'], y_pred[:, 1])
    
    print("\n--- HASIL EVALUASI ---")
    print(f"RUL -> MAE: {mae_rul:.2f}, MSE: {mse_rul:.2f}, RMSE: {rmse_rul:.2f}, R2: {r2_rul:.4f}")
    
    # 7. Hitung Threshold Status
    thresholds = {
        'soh_warning': float(np.percentile(df['soh'], 20)),
        'soh_critical': float(np.percentile(df['soh'], 5)),
        'mae_rul': float(mae_rul),
        'mse_rul': float(mse_rul),
        'rmse_rul': float(rmse_rul),
        'r2_rul': float(r2_rul),
        'total_cycles': int(len(df)),
        'capacity_start': float(df['capacity'].max()),
        'capacity_end': float(df['capacity'].min())
    }
    
    with open(os.path.join(base_dir, 'model_metadata.json'), 'w') as f:
        json.dump(thresholds, f, indent=4)
    
    # 8. Simpan Model
    joblib.dump(pipeline, os.path.join(base_dir, 'model_battery_v2.pkl'))
    print("\nModel multi-output berhasil disimpan!")

    # 9. Visualisasi (Simpan Gambar untuk Skripsi)
    plt.figure(figsize=(10, 6))
    plt.scatter(y_test['rul'], y_pred[:, 0], alpha=0.3, color='blue', label='Data Points')
    plt.plot([y_test['rul'].min(), y_test['rul'].max()], [y_test['rul'].min(), y_test['rul'].max()], 'r--', lw=2, label='Ideal')
    plt.xlabel('Actual RUL (Cycles)')
    plt.ylabel('Predicted RUL (Cycles)')
    plt.title('Actual vs Predicted RUL (XGBoost Multi-Output)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.savefig(os.path.join(base_dir, 'actual_vs_predicted.png'))
    plt.close()
    print("Plot evaluasi disimpan di actual_vs_predicted.png")

if __name__ == '__main__':
    train_model()
