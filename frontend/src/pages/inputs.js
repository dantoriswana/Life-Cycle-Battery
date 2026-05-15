import { addPrediction, clearHistory } from '../store.js';

// Session state
let lastResult = null;
let isLivePrediction = true;

export function renderInputs() {
  const r = lastResult;
  const statusColor = !r ? 'slate' : r.status === 'Normal' ? 'emerald' : r.status === 'Peringatan' ? 'orange' : 'red';

  // Build result HTML
  let resultHTML = '';
  if (r) {
    const statusIcon = r.status === 'Normal' ? 'check_circle' : r.status === 'Peringatan' ? 'warning' : 'dangerous';
    const recTitle = r.status === 'Normal' ? 'Baterai Sehat' : r.status === 'Peringatan' ? 'Butuh Perhatian' : 'Ganti Segera';
    const recDesc = r.status === 'Normal'
      ? 'Performa optimal. Terus pantau secara berkala.'
      : r.status === 'Peringatan'
        ? 'Penurunan kapasitas terdeteksi. Siapkan unit cadangan.'
        : 'Sangat kritis. Berisiko kegagalan sistem sewaktu-waktu.';

    resultHTML = `
      <div class="glass-panel p-4 md:p-8 rounded-3xl space-y-8 page-enter relative overflow-hidden">
        <div class="absolute -top-12 -right-12 w-48 h-48 bg-${statusColor}-500/10 rounded-full blur-3xl"></div>
        
        <div class="flex justify-between items-start relative z-10">
          <div>
            <h2 class="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Hasil Analisis</h2>
            <p class="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Status: <span class="text-${statusColor}-600">${r.status}</span></p>
          </div>
          <div class="p-3 bg-${statusColor}-50 rounded-2xl">
            <span class="material-symbols-outlined text-3xl text-${statusColor}-600">${statusIcon}</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
          <!-- SOH Gauge -->
          <div class="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-white/50">
             <div class="relative w-32 h-32 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90">
                  <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent" class="text-slate-200" />
                  <circle id="soh-circle" cx="64" cy="64" r="58" stroke="currentColor" stroke-width="10" stroke-dasharray="364.4" stroke-dashoffset="${364.4 - (364.4 * r.soh / 100)}" fill="transparent" stroke-linecap="round" class="text-${statusColor}-500 transition-all duration-1000" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <span id="soh-val" class="text-3xl font-black text-slate-800">${r.soh}%</span>
                  <span class="text-[10px] font-bold text-slate-400 uppercase">Health</span>
                </div>
             </div>
          </div>

          <!-- RUL Info -->
          <div class="space-y-4">
            <div class="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100">
               <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimasi Sisa Siklus</p>
               <div class="flex items-baseline gap-2">
                 <span id="rul-val" class="text-4xl font-black text-blue-600">${r.rul}</span>
                 <span class="text-sm font-bold text-slate-400">Siklus</span>
               </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
               <div class="p-3 bg-slate-50 rounded-xl">
                 <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Hari</p>
                 <span id="days-val" class="text-lg font-bold text-slate-700">~${r.rul_days}</span>
               </div>
               <div class="p-3 bg-slate-50 rounded-xl">
                 <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Minggu</p>
                 <span id="weeks-val" class="text-lg font-bold text-slate-700">~${r.rul_weeks}</span>
               </div>
            </div>
          </div>
        </div>

        <div class="p-6 bg-${statusColor}-500/5 rounded-2xl border border-${statusColor}-500/20">
          <h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">info</span>
            Rekomendasi
          </h4>
          <p class="text-sm text-slate-600 leading-relaxed">${recDesc}</p>
        </div>
      </div>
    `;
  } else {
    resultHTML = `
      <div class="glass-panel p-12 rounded-3xl flex flex-col items-center justify-center text-center space-y-6 opacity-50">
        <div class="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
          <span class="material-symbols-outlined text-5xl text-slate-300">analytics</span>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-400">Siap Menganalisis</h3>
          <p class="text-slate-400 text-sm">Sesuaikan parameter di sebelah kiri untuk melihat prediksi.</p>
        </div>
      </div>
    `;
  }

  return `
  <div class="space-y-8 page-enter max-w-6xl mx-auto">
    <div class="flex flex-col md:flex-row justify-between items-end gap-4 mb-2">
      <div>
        <h1 class="text-2xl md:text-4xl font-black text-slate-900 tracking-tight">Simulator "What-If"</h1>
        <p class="text-slate-500 font-medium">Uji berbagai skenario parameter untuk melihat dampaknya pada umur baterai.</p>
      </div>
      <div class="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <span class="text-xs font-bold text-slate-400 px-2">LIVE SYNC</span>
        <label class="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" id="live-toggle" class="sr-only peer" ${isLivePrediction ? 'checked' : ''}>
          <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <!-- Input Controls -->
      <section class="lg:col-span-5 space-y-6">
        <div class="glass-panel p-4 md:p-8 rounded-3xl space-y-10 border-t-4 border-blue-600">
          
          <!-- Voltage Slider -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Voltage (V)</label>
              <span id="val-voltage" class="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg font-mono font-bold text-lg">12.50</span>
            </div>
            <input type="range" id="range-voltage" min="10" max="14" step="0.01" value="12.5" class="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600">
            <div class="flex justify-between text-[10px] font-bold text-slate-300">
              <span>MIN: 10V</span>
              <span>NOMINAL: 12.6V</span>
              <span>MAX: 14V</span>
            </div>
          </div>

          <!-- IRT Slider -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Internal Resistance (mΩ)</label>
              <span id="val-irt" class="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg font-mono font-bold text-lg">15.0</span>
            </div>
            <input type="range" id="range-irt" min="5" max="50" step="0.1" value="15" class="w-full h-2 bg-purple-100 rounded-lg appearance-none cursor-pointer accent-purple-600">
            <div class="flex justify-between text-[10px] font-bold text-slate-300">
              <span>RENDAH (BAIK)</span>
              <span>TINGGI (AUS)</span>
            </div>
          </div>

          <!-- CCA Slider -->
          <div class="space-y-4">
            <div class="flex justify-between items-center">
              <label class="text-sm font-black text-slate-700 uppercase tracking-wider">Cold Cranking Amps (CCA)</label>
              <span id="val-cca" class="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-lg font-mono font-bold text-lg">100</span>
            </div>
            <input type="range" id="range-cca" min="20" max="250" step="1" value="100" class="w-full h-2 bg-emerald-100 rounded-lg appearance-none cursor-pointer accent-emerald-600">
            <div class="flex justify-between text-[10px] font-bold text-slate-300">
              <span>LEMAH</span>
              <span>KUAT</span>
            </div>
          </div>

          <button id="manual-predict" class="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 shadow-xl shadow-slate-200 ${isLivePrediction ? 'hidden' : ''}">
             <span class="material-symbols-outlined">bolt</span>
             Jalankan Analisis
          </button>

          <button id="save-btn" class="w-full py-3 border-2 border-slate-200 text-slate-400 rounded-2xl font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
             <span class="material-symbols-outlined">save</span>
             Simpan ke Riwayat
          </button>
        </div>

        <div class="p-6 bg-blue-600 rounded-3xl text-white relative overflow-hidden shadow-2xl shadow-blue-200">
           <div class="relative z-10">
             <h4 class="font-bold mb-2">Tips Riset</h4>
             <p class="text-xs text-blue-100 leading-relaxed">Nilai IRT yang tinggi biasanya mengindikasikan sulfasi pada plat aki, yang secara drastis menurunkan RUL meskipun Voltage terlihat normal.</p>
           </div>
           <span class="material-symbols-outlined absolute -bottom-4 -right-4 text-8xl text-white/10">lightbulb</span>
        </div>
      </section>

      <!-- Results Display -->
      <section class="lg:col-span-7">
        <div id="result-container">
          ${resultHTML}
        </div>
      </section>
    </div>
  </div>`;
}

export function initInputsPage() {
  const voltageRange = document.getElementById('range-voltage');
  const irtRange = document.getElementById('range-irt');
  const ccaRange = document.getElementById('range-cca');
  const liveToggle = document.getElementById('live-toggle');
  const manualBtn = document.getElementById('manual-predict');
  const saveBtn = document.getElementById('save-btn');

  if (!voltageRange) return;

  const updateDisplay = () => {
    document.getElementById('val-voltage').textContent = parseFloat(voltageRange.value).toFixed(2);
    document.getElementById('val-irt').textContent = parseFloat(irtRange.value).toFixed(1);
    document.getElementById('val-cca').textContent = ccaRange.value;
  };

  const runPrediction = async () => {
    const voltage = parseFloat(voltageRange.value);
    const irt = parseFloat(irtRange.value);
    const cca = parseFloat(ccaRange.value);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      const res = await fetch(`${apiUrl}/predict`, {


        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voltage, irt, cca })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      lastResult = {
        rul: data.rul_cycle,
        rul_days: data.rul_days,
        rul_weeks: data.rul_weeks,
        soh: data.predicted_soh,
        status: data.status,
        inputVoltage: voltage,
        inputIrt: irt,
        inputCca: cca
      };

      // Update UI partial or full
      const container = document.getElementById('result-container');
      if (container) {
        container.innerHTML = renderResultOnly(lastResult);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Debounce for live prediction
  let timeout;
  const debouncedPredict = () => {
    updateDisplay();
    if (!isLivePrediction) return;
    clearTimeout(timeout);
    timeout = setTimeout(runPrediction, 300);
  };

  [voltageRange, irtRange, ccaRange].forEach(el => el.addEventListener('input', debouncedPredict));

  liveToggle.addEventListener('change', (e) => {
    isLivePrediction = e.target.checked;
    manualBtn.classList.toggle('hidden', isLivePrediction);
    if (isLivePrediction) runPrediction();
  });

  manualBtn.addEventListener('click', runPrediction);

  saveBtn.addEventListener('click', () => {
    if (lastResult) {
      addPrediction({
        id: Date.now(),
        ...lastResult
      });
      alert('Data prediksi berhasil disimpan ke riwayat!');
    }
  });

  // Initial update
  updateDisplay();
  if (lastResult) runPrediction();
}

function renderResultOnly(r) {
  const statusColor = r.status === 'Normal' ? 'emerald' : r.status === 'Peringatan' ? 'orange' : 'red';
  const statusIcon = r.status === 'Normal' ? 'check_circle' : r.status === 'Peringatan' ? 'warning' : 'dangerous';
  const recTitle = r.status === 'Normal' ? 'Baterai Sehat' : r.status === 'Peringatan' ? 'Butuh Perhatian' : 'Ganti Segera';
  const recDesc = r.status === 'Normal' ? 'Performa optimal.' : r.status === 'Peringatan' ? 'Penurunan kapasitas terdeteksi.' : 'Sangat kritis.';

  return `
    <div class="glass-panel p-4 md:p-8 rounded-3xl space-y-8 page-enter relative overflow-hidden">
      <div class="absolute -top-12 -right-12 w-48 h-48 bg-${statusColor}-500/10 rounded-full blur-3xl"></div>
      <div class="flex justify-between items-start relative z-10">
        <div>
          <h2 class="text-2xl md:text-3xl font-black text-slate-900">Hasil Analisis</h2>
          <p class="text-slate-500 text-sm font-bold uppercase tracking-widest mt-1">Status: <span class="text-${statusColor}-600 font-black">${r.status}</span></p>
        </div>
        <div class="p-3 bg-${statusColor}-50 rounded-2xl">
          <span class="material-symbols-outlined text-3xl text-${statusColor}-600">${statusIcon}</span>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
        <div class="flex flex-col items-center justify-center p-6 bg-slate-50/50 rounded-2xl border border-white/50">
           <div class="relative w-32 h-32 flex items-center justify-center">
              <svg class="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="8" fill="transparent" class="text-slate-200" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" stroke-width="10" stroke-dasharray="364.4" stroke-dashoffset="${364.4 - (364.4 * r.soh / 100)}" fill="transparent" stroke-linecap="round" class="text-${statusColor}-500 transition-all duration-500" />
              </svg>
              <div class="absolute inset-0 flex flex-col items-center justify-center">
                <span class="text-3xl font-black text-slate-800">${r.soh}%</span>
                <span class="text-[10px] font-bold text-slate-400 uppercase">Health</span>
              </div>
           </div>
        </div>
        <div class="space-y-4">
          <div class="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
             <p class="text-[10px] font-bold text-slate-400 uppercase mb-1">Estimasi Sisa Siklus</p>
             <div class="flex items-baseline gap-2">
               <span class="text-4xl font-black text-blue-600">${r.rul}</span>
               <span class="text-sm font-bold text-slate-400">Siklus</span>
             </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
             <div class="p-3 bg-slate-50 rounded-xl">
               <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Hari</p>
               <span class="text-lg font-bold text-slate-700">~${r.rul_days}</span>
             </div>
             <div class="p-3 bg-slate-50 rounded-xl">
               <p class="text-[9px] font-bold text-slate-400 uppercase mb-1">Minggu</p>
               <span class="text-lg font-bold text-slate-700">~${r.rul_weeks}</span>
             </div>
          </div>
        </div>
      </div>
      <div class="p-6 bg-${statusColor}-500/5 rounded-2xl border border-${statusColor}-500/20">
        <h4 class="font-bold text-slate-800 mb-1 flex items-center gap-2">
          <span class="material-symbols-outlined text-sm">info</span>
          Rekomendasi
        </h4>
        <p class="text-sm text-slate-600 leading-relaxed">${recTitle}. ${recDesc}</p>
      </div>
    </div>
  `;
}

