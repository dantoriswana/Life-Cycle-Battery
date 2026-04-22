import nbformat as nbf

def create_notebook():
    nb = nbf.v4.new_notebook()
    
    # Cell 1: Imports
    imports = """import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import xgboost as xgb
import pickle
import os

# Ensure backend directory exists
os.makedirs('../backend', exist_ok=True)"""
    
    # Cell 2: Load Data
    load_data = """# 1. Membaca Data Aki Asli
# Data ini diambil dari dataset_final_battery.csv yang telah diproses dari file Excel mentahan
df = pd.read_csv('../backend/dataset_final_battery.csv')
df.head()"""

    # Cell 3: Data Cleaning
    clean_data = """# 2. Data Cleaning & Feature Selection
df = df.dropna()

features = ['capacity', 'soh', 'voltage_drop', 'min_voltage']
target = 'rul'

X = df[features]
y = df[target]

print("Features shape:", X.shape)
print("Target shape:", y.shape)"""

    # Cell 4: Train Test Split
    split_data = """# 3. Train-Test Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print("Training data:", X_train.shape)
print("Testing data:", X_test.shape)"""

    # Cell 5: Train Model
    train_model = """# 4. Train XGBoost Model
# XGBoost sangat bagus untuk memodelkan data non-linear seperti siklus baterai
model = xgb.XGBRegressor(
    n_estimators=200,
    learning_rate=0.05,
    max_depth=5,
    random_state=42
)

model.fit(X_train, y_train)
print("Model training completed!")"""

    # Cell 6: Evaluate Model
    evaluate = """# 5. Model Evaluation
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
rmse = np.sqrt(mean_squared_error(y_test, y_pred))
r2 = r2_score(y_test, y_pred)

print(f"Mean Absolute Error (MAE): {mae:.2f} cycles")
print(f"Root Mean Squared Error (RMSE): {rmse:.2f} cycles")
print(f"R-squared Score (R2): {r2:.4f}")

# Plotting Predictions vs Actual
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, alpha=0.5, color='blue')
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'r--', lw=2)
plt.xlabel("Actual RUL (Cycles)")
plt.ylabel("Predicted RUL (Cycles)")
plt.title("Actual vs Predicted Remaining Useful Life")
plt.grid(True)
plt.show()"""

    # Cell 7: Save Model
    save_model = """# 6. Save Model
# Simpan model untuk digunakan oleh Backend Flask (API)
model_path = '../backend/model_battery.pkl'
with open(model_path, 'wb') as f:
    pickle.dump(model, f)
    
print(f"Model successfully saved to {model_path}")"""

    # Add cells to notebook
    nb['cells'] = [
        nbf.v4.new_markdown_cell("# Battery Lifecycle RUL Prediction\nNotebook ini menggunakan algoritma Machine Learning (XGBoost) untuk memprediksi sisa siklus pemakaian baterai (RUL) berdasarkan data sensor riil."),
        nbf.v4.new_code_cell(imports),
        nbf.v4.new_markdown_cell("## 1. Load Data Asli (Dari CSV)"),
        nbf.v4.new_code_cell(load_data),
        nbf.v4.new_code_cell(clean_data),
        nbf.v4.new_code_cell(split_data),
        nbf.v4.new_markdown_cell("## 2. Train XGBoost Regressor Model"),
        nbf.v4.new_code_cell(train_model),
        nbf.v4.new_markdown_cell("## 3. Evaluation"),
        nbf.v4.new_code_cell(evaluate),
        nbf.v4.new_markdown_cell("## 4. Export Model for Web App"),
        nbf.v4.new_code_cell(save_model)
    ]
    
    # Write to file
    notebook_dir = 'notebook'
    os.makedirs(notebook_dir, exist_ok=True)
    with open(f'{notebook_dir}/battery_prediction.ipynb', 'w') as f:
        nbf.write(nb, f)
        
    print("Berhasil membuat ulang notebook/battery_prediction.ipynb")

if __name__ == '__main__':
    create_notebook()
