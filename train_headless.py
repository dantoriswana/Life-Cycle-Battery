import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import pickle
import os

print("Memulai training model XGBoost dengan data asli...")

# 1. Load Data
df = pd.read_csv('backend/dataset_final_battery.csv')
df = df.dropna()

features = ['capacity', 'soh', 'voltage_drop', 'min_voltage']
target = 'rul'

X = df[features]
y = df[target]

# 2. Train Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3. Train Model
model = xgb.XGBRegressor(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    random_state=42
)

model.fit(X_train, y_train)

# 4. Evaluate Model
y_pred = model.predict(X_test)
mae = mean_absolute_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"Evaluasi Model -> MAE: {mae:.2f} siklus, R2 Score: {r2:.4f}")

# 5. Save Model
model_path = 'backend/model_battery.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f)
    
print(f"Selesai! Model sukses diupdate dan disimpan ke {model_path}")
