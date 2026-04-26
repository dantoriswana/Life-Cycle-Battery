import { addPrediction } from '../store.js';

// Last prediction result (session state)
let lastResult = null;

export function renderInputs() {

    // Build result HTML
  let resultHTML = '';
  if (lastResult) {
    const r = lastResult;
    const statusColor = r.status === 'Normal' ? 'green' : r.status === 'Peringatan' ? 'orange' : 'red';
    const statusIcon = r.status === 'Normal' ? 'check_circle' : r.status === 'Peringatan' ? 'warning' : 'error';
    const statusIndo = r.status;
    
    const recTitle = r.status === 'Normal' ? 'Baterai dalam kondisi baik'
      : r.status === 'Peringatan' ? 'Persiapkan penggantian'
      : 'Ganti segera';
      
    const recDesc = r.status === 'Normal'
      ? 'Telemetri saat ini menunjukkan performa optimal. SOH di atas ambang batas normal.'
      : r.status === 'Peringatan'
        ? 'Baterai mulai menunjukkan tanda-tanda aus (SOH menurun). Pertimbangkan untuk menyiapkan anggaran penggantian.'
        : 'Tingkat degradasi kritis (SOH rendah). Baterai sudah tidak handal dan harus segera diganti.';


    resultHTML = `
      <div class="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_-5px_rgba(15,23,42,0.08)] border border-outline-variant/30 relative overflow-hidden page-enter">
        <div class="absolute top-0 right-0 p-lg opacity-10">
          <span class="material-symbols-outlined text-[120px]">battery_charging_80</span>
        </div>
        <h2 class="font-h2 text-h2 text-on-surface mb-lg">Analisis Kesehatan & RUL</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-lg relative z-10">
          <div class="flex flex-col">
            <span class="font-label-caps text-label-caps text-outline mb-xs">ESTIMASI SOH (HEALTH)</span>
            <div class="flex items-baseline gap-2">
                <span id="soh-animated" class="font-mono-data text-[48px] font-bold text-primary">0</span>
                <span class="font-h3 text-h3 text-outline">%</span>
            </div>
            <div class="mt-2 w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
              <div class="${r.predictedSoh > 85 ? 'bg-green-500' : r.predictedSoh > 70 ? 'bg-orange-400' : 'bg-red-500'} h-full" style="width:${r.predictedSoh}%"></div>
            </div>
          </div>
          <div class="flex flex-col">
            <span class="font-label-caps text-label-caps text-outline mb-xs">PREDIKSI RUL (UMUR)</span>
            <div class="flex flex-col gap-2">
              <div class="flex items-baseline gap-2">
                <span id="rul-animated" class="font-mono-data text-[48px] font-bold text-secondary">0</span>
                <span class="font-h3 text-h3 text-outline">Siklus</span>
              </div>
              <div class="flex gap-4 text-sm font-semibold">
                <div class="bg-primary/10 text-primary px-3 py-1 rounded-lg"><span id="rul-days">0</span> Hari</div>
                <div class="bg-secondary/10 text-secondary px-3 py-1 rounded-lg"><span id="rul-weeks">0</span> Minggu</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-md page-enter" style="animation-delay:0.1s">
        <div class="bg-white p-lg rounded-xl shadow-sm border-l-4 border-primary">
          <div class="flex items-start justify-between mb-md">
            <span class="font-label-caps text-label-caps text-primary">REKOMENDASI & STATUS</span>
            <span class="material-symbols-outlined text-${statusColor}-600">${statusIcon}</span>
          </div>
          <h3 class="font-h3 text-h3 text-on-surface mb-sm">${statusIndo}: ${recTitle}</h3>
          <p class="font-body-md text-on-surface-variant text-sm">${recDesc}</p>
        </div>
        <div class="bg-surface-container-high/50 p-lg rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <span class="font-label-caps text-label-caps text-on-surface-variant">SENSOR INPUT</span>
            <div class="mt-sm space-y-xs text-sm">
              <p>Kapasitas: <span class="font-mono-data font-bold">${r.inputCapacity} Ah</span></p>
              <p>V-Drop: <span class="font-mono-data font-bold">${r.inputVd} V</span></p>
              <p>Min-V: <span class="font-mono-data font-bold">${r.inputMinV} V</span></p>
            </div>
          </div>
        </div>
      </div>`;
  } else {
    resultHTML = `
      <div class="bg-surface-container-lowest p-lg rounded-xl shadow-[0_4px_20px_-5px_rgba(15,23,42,0.08)] border border-outline-variant/30 relative overflow-hidden flex items-center justify-center min-h-[350px]">
        <div class="text-center text-outline space-y-md">
          <span class="material-symbols-outlined text-[64px] opacity-30">analytics</span>
          <p class="text-body-lg">Masukkan parameter sensor dan klik <strong>Prediksi</strong> untuk estimasi SOH & RUL</p>
        </div>
      </div>`;
  }

  return `
  <div class="page-enter">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-lg">
      <section class="lg:col-span-5 flex flex-col gap-lg">
        <div class="bg-white p-lg rounded-xl shadow-sm border border-outline-variant/30">
          <div class="mb-lg">
            <h2 class="font-h2 text-h2 text-on-surface mb-xs">Input Data Sensor</h2>
            <p class="font-body-md text-on-surface-variant text-sm">AI akan mengestimasi SOH dan RUL dari data sensor berikut.</p>
          </div>
          <form id="prediction-form" class="space-y-md">
            <div class="space-y-xs">
              <label class="font-label-caps text-label-caps text-outline">KAPASITAS TERUKUR (Ah)</label>
              <input id="inp-capacity" class="w-full bg-surface-container-low border border-outline-variant rounded-lg px-md py-sm focus:ring-2 focus:ring-primary outline-none" placeholder="misal: 4.50" step="0.01" type="number" required />
            </div>
            <div class="grid grid-cols-2 gap-md">
              <div class="space-y-xs">
                <label class="font-label-caps text-label-caps text-outline">V-DROP (V)</label>
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
              <span class="material-symbols-outlined">psychology</span>
              <span id="predict-btn-text">Analisis dengan AI</span>
            </button>
          </form>
        </div>
      </section>

      <section class="lg:col-span-7 flex flex-col gap-lg">
        ${resultHTML}
      </section>
    </div>
  </div>`;
}

export function initInputsPage() {
  const form = document.getElementById('prediction-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = document.getElementById('predict-btn');
    const btnText = document.getElementById('predict-btn-text');
    const errorDiv = document.getElementById('form-error');
    const errorText = document.getElementById('form-error-text');

    const capacity = parseFloat(document.getElementById('inp-capacity').value);
    const vd = parseFloat(document.getElementById('inp-vdrop').value);
    const minV = parseFloat(document.getElementById('inp-minv').value);

    if (isNaN(capacity) || isNaN(vd) || isNaN(minV)) {
      errorDiv.classList.remove('hidden');
      errorText.textContent = 'Mohon isi semua kolom yang diperlukan.';
      return;
    }

    btn.disabled = true;
    btnText.innerHTML = 'AI Sedang Berpikir...';
    errorDiv.classList.add('hidden');

    try {
      const res = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ capacity, voltage_drop: vd, min_voltage: minV })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Prediksi gagal');

      lastResult = {
        rul: data.rul_cycle,
        rul_days: data.rul_days,
        rul_weeks: data.rul_weeks,
        predictedSoh: data.predicted_soh,
        status: data.status,
        inputCapacity: capacity,
        inputVd: vd,
        inputMinV: minV
      };

      addPrediction({ id: Date.now(), rul: data.rul_cycle, soh: data.predicted_soh, status: data.status });
      window.navigateTo('inputs');

      setTimeout(() => {
        const rulEl = document.getElementById('rul-animated');
        const sohEl = document.getElementById('soh-animated');
        const daysEl = document.getElementById('rul-days');
        const weeksEl = document.getElementById('rul-weeks');
        if (sohEl) animateValue(sohEl, 0, data.predicted_soh, 800, 1);
        if (rulEl) animateValue(rulEl, 0, data.rul_cycle, 800, 0);
        if (daysEl) animateValue(daysEl, 0, data.rul_days, 800, 0);
        if (weeksEl) animateValue(weeksEl, 0, data.rul_weeks, 800, 0);
      }, 100);

    } catch (err) {
      errorDiv.classList.remove('hidden');
      errorText.textContent = err.message.includes('Failed to fetch') 
        ? 'Gagal terhubung ke server. Pastikan Flask aktif.'
        : 'Error: ' + err.message;
      console.error(err);
    } finally {
      btn.disabled = false;
      btnText.textContent = 'Analisis dengan AI';
    }
  });

  if (lastResult) {
    setTimeout(() => {
      const rulEl = document.getElementById('rul-animated');
      const sohEl = document.getElementById('soh-animated');
      const daysEl = document.getElementById('rul-days');
      const weeksEl = document.getElementById('rul-weeks');
      if (sohEl) animateValue(sohEl, 0, lastResult.predictedSoh, 800, 1);
      if (rulEl) animateValue(rulEl, 0, lastResult.rul, 800, 0);
      if (daysEl) animateValue(daysEl, 0, lastResult.rul_days, 800, 0);
      if (weeksEl) animateValue(weeksEl, 0, lastResult.rul_weeks, 800, 0);
    }, 200);
  }
}

function animateValue(el, start, end, duration, decimals = 0) {
  let startTime = null;
  const step = (ts) => {
    if (!startTime) startTime = ts;
    const progress = Math.min((ts - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = (start + eased * (end - start)).toFixed(decimals);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = end.toFixed(decimals);
  };
  requestAnimationFrame(step);
}
