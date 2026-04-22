import json

file_path = 'notebook/battery_prediction.ipynb'

with open(file_path, 'r', encoding='utf-8') as f:
    nb = json.load(f)

# Cell 1: Box Plot
markdown_1 = {"cell_type": "markdown", "metadata": {}, "source": ["## 5. Visualisasi Outlier (Box Plot)"]}
code_1 = {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [
    "import seaborn as sns\n",
    "plt.figure(figsize=(12, 6))\n",
    "sns.boxplot(data=df[features], palette='Set2')\n",
    "plt.title('Box Plot Deteksi Outlier pada Fitur Baterai')\n",
    "plt.ylabel('Nilai Sensor')\n",
    "plt.grid(True, linestyle='--', alpha=0.7)\n",
    "plt.show()"
]}

# Cell 2: Histogram
markdown_2 = {"cell_type": "markdown", "metadata": {}, "source": ["## 6. Distribusi Data (Histogram)"]}
code_2 = {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [
    "fig, axes = plt.subplots(2, 2, figsize=(14, 10))\n",
    "axes = axes.flatten()\n",
    "for i, col in enumerate(features):\n",
    "    sns.histplot(df[col], kde=True, ax=axes[i], color='skyblue')\n",
    "    axes[i].set_title(f'Distribusi Data {col}')\n",
    "    axes[i].set_ylabel('Frekuensi')\n",
    "plt.tight_layout()\n",
    "plt.show()"
]}

# Cell 3: Line Chart Real vs Predict
markdown_3 = {"cell_type": "markdown", "metadata": {}, "source": ["## 7. Hasil Prediksi: Actual vs Predicted (Line Chart)"]}
code_3 = {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [
    "plt.figure(figsize=(14, 6))\n",
    "plt.plot(np.array(y_test), label='Actual RUL', marker='o', linestyle='-', color='blue', markersize=4)\n",
    "plt.plot(y_pred, label='Predicted RUL', marker='x', linestyle='--', color='red', markersize=4)\n",
    "plt.title('Line Chart: Actual vs Predicted RUL pada Data Uji')\n",
    "plt.xlabel('Indeks Sampel Data Uji')\n",
    "plt.ylabel('RUL (Siklus)')\n",
    "plt.legend()\n",
    "plt.grid(True, linestyle='--', alpha=0.6)\n",
    "plt.show()"
]}

# Cell 4: Feature Importance
markdown_4 = {"cell_type": "markdown", "metadata": {}, "source": ["## 8. Feature Importance (Tingkat Kepentingan Fitur)"]}
code_4 = {"cell_type": "code", "execution_count": None, "metadata": {}, "outputs": [], "source": [
    "importance = model.feature_importances_\n",
    "plt.figure(figsize=(10, 6))\n",
    "# Membuat Line Chart sesuai request\n",
    "plt.plot(features, importance, marker='s', linestyle='-', color='green', linewidth=2, markersize=8)\n",
    "plt.fill_between(features, importance, alpha=0.2, color='green') # Menambahkan efek fill di bawah garis\n",
    "plt.title('Line Chart: Feature Importance (Pengaruh Fitur Terhadap Prediksi)')\n",
    "plt.xlabel('Fitur Sensor')\n",
    "plt.ylabel('Skor Kepentingan (Importance Score)')\n",
    "plt.grid(True, linestyle='--', alpha=0.7)\n",
    "plt.show()"
]}

# Gabungkan ke notebook
nb['cells'].extend([markdown_1, code_1, markdown_2, code_2, markdown_3, code_3, markdown_4, code_4])

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(nb, f, indent=1)

print("4 Grafik berhasil ditambahkan ke Jupyter Notebook!")
