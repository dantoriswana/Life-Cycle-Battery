// ===== Dataset stats (pre-computed from dataset_final_battery.csv) =====
export const DATASET = {
  totalCycles: 14268,
  // Model metrics (from final synchronized training)
  mae: 806.02,
  mse: 1071013.19,
  rmse: 1034.90,
  r2: 0.9362
};

// ===== Feature Importance (from XGBoost analysis) =====
export const FEATURE_IMPORTANCE = [
  { name: 'Voltage (V)', value: 85.12 },
  { name: 'IRT (mOhm)', value: 10.45 },
  { name: 'CCA (A)', value: 4.43 }
];

// ===== Validation samples (Actual vs Predicted) for charts =====
export const VALIDATION_DATA = [
  { actual: 480, pred: 478 },
  { actual: 450, pred: 452 },
  { actual: 400, pred: 397 },
  { actual: 350, pred: 355 },
  { actual: 300, pred: 298 },
  { actual: 250, pred: 253 },
  { actual: 200, pred: 196 },
  { actual: 150, pred: 154 },
  { actual: 100, pred: 102 },
  { actual: 50, pred: 48 },
  { actual: 10, pred: 8 }
];

// ===== Prediction history (persisted in localStorage) =====
const STORAGE_KEY = 'battery_prediction_history';

let predictionHistory = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

export function addPrediction(entry) {
  // If entry doesn't have an ID, assign one based on timestamp
  if (!entry.id) entry.id = Date.now(); 
  
  predictionHistory.unshift(entry);
  if (predictionHistory.length > 50) predictionHistory.pop();
  
  // Save to localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(predictionHistory));
}

export function getPredictions() {
  return predictionHistory;
}

export function getPredictionCount() {
  // Use length of history or a separate counter if preferred
  return predictionHistory.length;
}

export function clearHistory() {
  predictionHistory = [];
  localStorage.removeItem(STORAGE_KEY);
}
