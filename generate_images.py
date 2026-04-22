import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
import xgboost as xgb
import os

# Set output dir
out_dir = r"C:\Users\Lenovo\.gemini\antigravity\brain\739c677f-ffbc-4a3e-8d8b-7baa3bd2ff48"

df = pd.read_csv('backend/dataset_final_battery.csv')
features = ['capacity', 'soh', 'voltage_drop', 'min_voltage']
X = df[features]
y = df['rul']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
model = xgb.XGBRegressor(n_estimators=200, learning_rate=0.05, max_depth=5, random_state=42)
model.fit(X_train, y_train)
y_pred = model.predict(X_test)

# 1. Boxplot
plt.figure(figsize=(10, 5))
sns.boxplot(data=df[features], palette='Set2')
plt.title('Box Plot Deteksi Outlier pada Fitur Baterai')
plt.savefig(os.path.join(out_dir, 'boxplot.png'), bbox_inches='tight')
plt.close()

# 2. Histogram
fig, axes = plt.subplots(2, 2, figsize=(12, 8))
axes = axes.flatten()
for i, col in enumerate(features):
    sns.histplot(df[col], kde=True, ax=axes[i], color='skyblue')
    axes[i].set_title(f'Distribusi {col}')
plt.tight_layout()
plt.savefig(os.path.join(out_dir, 'histogram.png'), bbox_inches='tight')
plt.close()

# 3. Line chart Actual vs Predict
plt.figure(figsize=(12, 5))
plt.plot(np.array(y_test), label='Actual RUL', marker='o', color='blue', markersize=4)
plt.plot(y_pred, label='Predicted RUL', marker='x', linestyle='--', color='red', markersize=4)
plt.title('Actual vs Predicted RUL')
plt.legend()
plt.grid(True, alpha=0.5)
plt.savefig(os.path.join(out_dir, 'linechart_rul.png'), bbox_inches='tight')
plt.close()

# 4. Feature Importance
importance = model.feature_importances_
plt.figure(figsize=(10, 5))
plt.plot(features, importance, marker='s', color='green', linewidth=2)
plt.fill_between(features, importance, alpha=0.2, color='green')
plt.title('Feature Importance')
plt.grid(True, alpha=0.5)
plt.savefig(os.path.join(out_dir, 'feature_importance.png'), bbox_inches='tight')
plt.close()

print("Images generated!")
