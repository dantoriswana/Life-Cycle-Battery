// ===== Dataset stats (pre-computed from dataset_final_battery.csv) =====
export const DATASET = {
  totalCycles: 481,
  capacityStart: 4.5099,
  capacityEnd: 2.5,
  sohStart: 100.0,
  sohEnd: 55.43,
  // Model metrics (from training notebook)
  mae: 0.042,
  mse: 0.0018,
  rmse: 0.0424,
  r2: 0.984
};

// ===== Prediction history (session storage) =====
let predictionHistory = [];
let predictionCounter = 0;

export function addPrediction(entry) {
  predictionCounter++;
  entry.id = predictionCounter;
  predictionHistory.unshift(entry);
  if (predictionHistory.length > 50) predictionHistory.pop();
}

export function getPredictions() {
  return predictionHistory;
}

export function getPredictionCount() {
  return predictionCounter;
}
