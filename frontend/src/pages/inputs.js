import { addPrediction } from '../store.js';

// Last prediction result (session state)
let lastResult = null;

export function renderInputs() {
  const sohVal = lastResult ? lastResult.inputSoh : 85;

  // Build result HTML
  let resultHTML = '';
  if (lastResult) {
    const r = lastResult;
    const statusColor = r.status === 'Normal' ? 'green' : r.status === 'Warning' ? 'orange' : 'red';
    const statusIcon = r.status === 'Normal' ? 'check_circle' : r.status === 'Warning' ? 'warning' : 'error';
    const recTitle = r.status === 'Normal' ? 'Battery is in good condition'
      : r.status === 'Warning' ? 'Prepare for replacement'
      : 'Replace immediately';
    const recDesc = r.status === 'Normal'
      ? 'The current telemetry indicates optimal performance. No immediate maintenance or replacement is required.'
      : r.status === 'Warning'
        ? 'Battery is showing signs of wear. Consider budgeting for a replacement soon and avoid deep discharges.'
        : 'Critical degradation level. The battery is unreliable and should be replaced immediately.';

    const greenW = r.status === 'Normal' ? 75 : r.status === 'Warning' ? 40 : 10;
    const orangeW = r.status === 'Normal' ? 15 : r.status === 'Warning' ? 35 : 20;
    const redW = 100 - greenW - orangeW;
    const confidence = r.status === 'Normal' ? '94.2' : r.status === 'Warning' ? '87.5' : '79.1';

    resultHTML = `
      <!-- Prediction Analysis -->
      <div class="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_-5px_rgba(15,23,42,0.08)] border border-outline-variant/30 relative overflow-hidden page-enter">
        <div class="absolute top-0 right-0 p-lg opacity-10">
          <span class="material-symbols-outlined text-[120px]">battery_charging_80</span>
        </div>
        <h2 class="font-h2 text-h2 text-on-surface mb-lg">Prediction Analysis</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-lg relative z-10">
          <div class="flex flex-col">
            <span class="font-label-caps text-label-caps text-outline mb-xs">PREDICTED RUL</span>
            <div class="flex items-baseline gap-2">
              <span id="rul-animated" class="font-mono-data text-[48px] font-bold text-primary">0</span>
              <span class="font-h3 text-h3 text-outline">Cycles</span>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="font-label-caps text-label-caps text-outline mb-xs">BATTERY STATUS</span>
            <div class="mt-2">
              <div class="inline-flex items-center gap-2 px-md py-sm bg-${statusColor}-50 text-${statusColor}-700 border border-${statusColor}-200 rounded-full">
                <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1;">${statusIcon}</span>
                <span class="font-h3 text-h3">${r.status}</span>
              </div>
            </div>
            <div class="mt-6 w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div class="bg-green-500 h-full" style="width:${greenW}%"></div>
              <div class="bg-orange-400 h-full" style="width:${orangeW}%"></div>
              <div class="bg-red-500 h-full" style="width:${redW}%"></div>
            </div>
            <span class="text-[10px] mt-2 text-outline text-right">Confidence Level: ${confidence}%</span>
          </div>
        </div>
      </div>

      <!-- Recommendation -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-md page-enter" style="animation-delay:0.1s">
        <div class="bg-white p-lg rounded-xl shadow-sm border-l-4 border-primary">
          <div class="flex items-start justify-between mb-md">
            <span class="font-label-caps text-label-caps text-primary">RECOMMENDATION</span>
            <span class="material-symbols-outlined text-primary/40">assignment_turned_in</span>
          </div>
          <h3 class="font-h3 text-h3 text-on-surface mb-sm">${recTitle}</h3>
          <p class="font-body-md text-on-surface-variant text-sm">${recDesc}</p>
        </div>
        <div class="bg-surface-container-high/50 p-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <span class="font-label-caps text-label-caps text-on-surface-variant">INPUT PARAMETERS</span>
            <div class="mt-sm space-y-xs text-sm">
              <p>Capacity: <span class="font-mono-data font-bold">${r.inputCapacity} Ah</span></p>
              <p>SOH: <span class="font-mono-data font-bold">${r.inputSoh}%</span></p>
              <p>V-Drop: <span class="font-mono-data font-bold">${r.inputVd} V</span></p>
              <p>Min-V: <span class="font-mono-data font-bold">${r.inputMinV} V</span></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats bar -->
      <div class="bg-surface-container-low p-md rounded-xl border border-outline-variant/20 flex flex-wrap gap-lg justify-around page-enter" style="animation-delay:0.15s">
        <div class="text-center">
          <span class="block font-label-caps text-[10px] text-outline">DEGRADATION RATE</span>
          <span class="font-mono-data text-body-lg text-on-surface">${(((4.51 - r.inputCapacity) / 4.51) * 100).toFixed(2)}%</span>
        </div>
        <div class="w-px h-10 bg-outline-variant/30 hidden sm:block"></div>
        <div class="text-center">
          <span class="block font-label-caps text-[10px] text-outline">STATE OF HEALTH</span>
          <span class="font-mono-data text-body-lg text-on-surface">${r.inputSoh}%</span>
        </div>
        <div class="w-px h-10 bg-outline-variant/30 hidden sm:block"></div>
        <div class="text-center">
          <span class="block font-label-caps text-[10px] text-outline">PREDICTED RUL</span>
          <span class="font-mono-data text-body-lg text-on-surface">${r.rul} cycles</span>
        </div>
      </div>`;
  } else {
    resultHTML = `
      <div class="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_-5px_rgba(15,23,42,0.08)] border border-outline-variant/30 relative overflow-hidden flex items-center justify-center min-h-[300px]">
        <div class="text-center text-outline space-y-md">
          <span class="material-symbols-outlined text-[64px] opacity-30">battery_unknown</span>
          <p class="text-body-lg">Enter parameters and click <strong>Predict</strong> to see results</p>
        </div>
      </div>`;
  }

  return `
  <div class="page-enter">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-lg">
      <!-- Left: Form -->
      <section class="lg:col-span-5 flex flex-col gap-lg">
        <div class="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_-5px_rgba(15,23,42,0.08)] border border-outline-variant/30">
          <div class="mb-lg">
            <h2 class="font-h2 text-h2 text-on-surface mb-xs">Predictive Input</h2>
            <p class="font-body-md text-on-surface-variant">Configure battery telemetry data for RUL calculation.</p>
          </div>
          <form id="prediction-form" class="space-y-md">
            <div class="space-y-xs">
              <label class="font-label-caps text-label-caps text-outline">CAPACITY (Ah)</label>
              <input id="inp-capacity" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none" placeholder="e.g. 4.50" step="0.01" type="number" required />
            </div>
            <div class="space-y-xs">
              <label class="font-label-caps text-label-caps text-outline">STATE OF HEALTH (%)</label>
              <div class="relative">
                <input id="inp-soh" class="w-full" max="100" min="0" step="0.1" type="range" value="${sohVal}" />
                <div class="flex justify-between mt-1 text-[10px] font-mono-data text-outline">
                  <span>0%</span>
                  <span id="soh-display">${sohVal}%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
            <div class="grid grid-cols-2 gap-md">
              <div class="space-y-xs">
                <label class="font-label-caps text-label-caps text-outline">VOLTAGE DROP (V)</label>
                <input id="inp-vdrop" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none" placeholder="0.49" step="0.01" type="number" required />
              </div>
              <div class="space-y-xs">
                <label class="font-label-caps text-label-caps text-outline">MIN VOLTAGE (V)</label>
                <input id="inp-minv" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none" placeholder="12.9" step="0.01" type="number" required />
              </div>
            </div>
            <div id="form-error" class="hidden p-sm rounded-lg bg-error-container text-on-error-container text-sm flex items-center gap-sm">
              <span class="material-symbols-outlined text-[16px]">error</span>
              <span id="form-error-text"></span>
            </div>
            <button id="predict-btn" class="w-full spectrum-gradient text-white font-h3 text-h3 py-md rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all duration-200 mt-md flex items-center justify-center gap-2" type="submit">
              <span class="material-symbols-outlined">analytics</span>
              <span id="predict-btn-text">Predict</span>
            </button>
          </form>
        </div>
        <div class="bg-surface-variant/30 p-md rounded-xl border border-primary-fixed flex items-center gap-md">
          <div class="p-sm bg-primary-container/10 rounded-lg">
            <span class="material-symbols-outlined text-primary">info</span>
          </div>
          <p class="font-body-md text-on-surface-variant text-sm">
            Model trained on <span class="font-semibold">481 cycles</span> of GTZ 5S battery data using Random Forest regression.
          </p>
        </div>
      </section>

      <!-- Right: Results -->
      <section class="lg:col-span-7 flex flex-col gap-lg">
        ${resultHTML}
      </section>
    </div>
  </div>`;
}

export function initInputsPage() {
  // SOH slider live display
  const sohSlider = document.getElementById('inp-soh');
  const sohDisplay = document.getElementById('soh-display');
  if (sohSlider && sohDisplay) {
    sohSlider.addEventListener('input', () => {
      sohDisplay.textContent = sohSlider.value + '%';
    });
  }

  // Form submission
  const form = document.getElementById('prediction-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('predict-btn');
    const btnText = document.getElementById('predict-btn-text');
    const errorDiv = document.getElementById('form-error');
    const errorText = document.getElementById('form-error-text');

    const capacity = parseFloat(document.getElementById('inp-capacity').value);
    const soh = parseFloat(document.getElementById('inp-soh').value);
    const vd = parseFloat(document.getElementById('inp-vdrop').value);
    const minV = parseFloat(document.getElementById('inp-minv').value);

    if (isNaN(capacity) || isNaN(vd) || isNaN(minV)) {
      errorDiv.classList.remove('hidden');
      errorText.textContent = 'Please fill in all required fields.';
      return;
    }

    // Loading state
    btn.disabled = true;
    btnText.innerHTML = '<span class="predict-spinner"></span> Analyzing...';
    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity, soh, voltage_drop: vd, min_voltage: minV })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediction failed');

      lastResult = {
        rul: data.rul,
        status: data.status,
        inputCapacity: capacity,
        inputSoh: soh,
        inputVd: vd,
        inputMinV: minV
      };

      addPrediction({ rul: data.rul, status: data.status });

      // Re-render
      window.navigateTo('inputs');

      // Animate RUL value after re-render
      setTimeout(() => {
        const rulEl = document.getElementById('rul-animated');
        if (rulEl) animateValue(rulEl, 0, data.rul, 800);
      }, 100);

    } catch (err) {
      errorDiv.classList.remove('hidden');
      errorText.textContent = err.message || 'Cannot connect to backend. Make sure Flask is running on port 5000.';
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Predict';
    }
  });

  // Animate RUL if result exists
  if (lastResult) {
    setTimeout(() => {
      const rulEl = document.getElementById('rul-animated');
      if (rulEl) animateValue(rulEl, 0, lastResult.rul, 800);
    }, 200);
  }
}

function animateValue(el, start, end, duration) {
  let startTime = null;
  const step = (ts) => {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = (start + eased * (end - start)).toFixed(1);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      el.textContent = end;
    }
  };
  requestAnimationFrame(step);
}
