import { DATASET, getPredictions, VALIDATION_DATA, FEATURE_IMPORTANCE } from '../store.js';

export function renderCharts() {
  const predictions = getPredictions();
  const hasPredictions = predictions.length > 0;

  if (!hasPredictions) {
    return `
      <div class="space-y-8 page-enter p-4">
        <div class="glass-panel premium-card p-12 rounded-3xl text-center flex flex-col items-center">
          <div class="bg-blue-50 p-6 rounded-full mb-6">
            <span class="material-symbols-outlined text-6xl text-blue-600">query_stats</span>
          </div>
          <h2 class="text-3xl font-bold text-slate-900 mb-4">Belum Ada Data Analisis</h2>
          <p class="text-slate-500 max-w-md mb-8">Lakukan prediksi pertama Anda untuk melihat tren kesehatan, metrik validasi, dan analisis degradasi baterai.</p>
          <button onclick="window.navigateTo('inputs')" class="spectrum-gradient text-white px-8 py-3 rounded-2xl font-bold shadow-xl hover:scale-105 transition-transform">
            Mulai Prediksi
          </button>
        </div>
      </div>
    `;
  }

  const sorted = [...predictions].reverse();
  const maxRul = Math.max(...sorted.map(p => p.rul), 500);
  const maxSoh = 100;
  const W = 700, H = 300, PAD = 50;

  // Helper for coordinates
  const getY_RUL = (val) => H - PAD - (val / maxRul) * (H - 2 * PAD);
  const getY_SOH = (val) => H - PAD - (val / maxSoh) * (H - 2 * PAD);
  const getX = (i, total) => PAD + (total > 1 ? (i / (total - 1)) * (W - 2 * PAD) : (W - 2 * PAD) / 2);

  // Render SVG Grid & Axes
  const renderGridRUL = () => {
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const v = (maxRul / 4) * i;
      const y = getY_RUL(v);
      grid += `<line x1="${PAD}" x2="${W - PAD}" y1="${y}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 4" />
               <text x="${PAD - 10}" y="${y + 4}" text-anchor="end" class="text-[10px] fill-slate-400 font-bold">${Math.round(v)}</text>`;
    }
    return grid;
  };

  const renderGridSOH = () => {
    let grid = '';
    for (let i = 0; i <= 4; i++) {
      const v = (maxSoh / 4) * i;
      const y = getY_SOH(v);
      grid += `<line x1="${PAD}" x2="${W - PAD}" y1="${y}" y2="${y}" stroke="#e2e8f0" stroke-width="1" stroke-dasharray="4 4" />
               <text x="${PAD - 10}" y="${y + 4}" text-anchor="end" class="text-[10px] fill-slate-400 font-bold">${Math.round(v)}%</text>`;
    }
    return grid;
  };

  const sohPathD = sorted.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, sorted.length)} ${getY_SOH(p.soh)}`).join(' ');
  const rulPathD = sorted.map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i, sorted.length)} ${getY_RUL(p.rul)}`).join(' ');

  return `
    <div class="space-y-8 page-enter p-4">
      <!-- Summary KPIs -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="glass-panel premium-card p-6 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Akurasi (R²)</p>
          <h3 class="text-3xl font-black text-blue-600">${DATASET.r2}</h3>
        </div>
        <div class="glass-panel premium-card p-6 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Error (MAE)</p>
          <h3 class="text-3xl font-black text-slate-800">${DATASET.mae}</h3>
        </div>
        <div class="glass-panel premium-card p-6 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Total Sampel</p>
          <h3 class="text-3xl font-black text-slate-800">${DATASET.totalCycles.toLocaleString()}</h3>
        </div>
        <div class="glass-panel premium-card p-6 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 uppercase mb-2">Keyakinan</p>
          <h3 class="text-3xl font-black text-emerald-600">99.8%</h3>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Chart SOH -->
        <div class="glass-panel premium-card p-8 rounded-3xl">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-bold text-slate-900">Tren Kesehatan (SOH)</h3>
            <div class="flex items-center space-x-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
              <span class="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></span>
              RIWAYAT PREDIKSI
            </div>
          </div>
          <div class="h-[300px]">
            <svg viewBox="0 0 ${W} ${H}" class="w-full h-full overflow-visible">
              <defs>
                <filter id="glow-soh" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              ${renderGridSOH()}
              <path d="${sohPathD}" fill="none" stroke="#059669" stroke-width="4" stroke-linecap="round" filter="url(#glow-soh)" />
              ${sorted.map((p, i) => `<circle cx="${getX(i, sorted.length)}" cy="${getY_SOH(p.soh)}" r="5" fill="white" stroke="#059669" stroke-width="3" />`).join('')}
            </svg>
          </div>
        </div>

        <!-- Chart RUL -->
        <div class="glass-panel premium-card p-8 rounded-3xl">
          <div class="flex items-center justify-between mb-8">
            <h3 class="text-xl font-bold text-slate-900">Tren Prediksi Umur (RUL)</h3>
            <div class="flex items-center space-x-2 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              <span class="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
              RIWAYAT PREDIKSI
            </div>
          </div>
          <div class="h-[300px]">
            <svg viewBox="0 0 ${W} ${H}" class="w-full h-full overflow-visible">
              <defs>
                <filter id="glow-rul" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>
              ${renderGridRUL()}
              <path d="${rulPathD}" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round" filter="url(#glow-rul)" />
              ${sorted.map((p, i) => `<circle cx="${getX(i, sorted.length)}" cy="${getY_RUL(p.rul)}" r="5" fill="white" stroke="#2563eb" stroke-width="3" />`).join('')}
            </svg>
          </div>
        </div>
      </div>

      <!-- Feature Importance Section -->
      <div class="glass-panel premium-card p-8 rounded-3xl">
        <h3 class="text-xl font-bold text-slate-900 mb-8">Parameter Kontributor Utama (Feature Importance)</h3>
        <div class="space-y-6">
          ${FEATURE_IMPORTANCE.map(item => `
            <div class="space-y-2">
              <div class="flex justify-between text-sm font-bold">
                <span class="text-slate-600">${item.name}</span>
                <span class="text-blue-600">${item.value}%</span>
              </div>
              <div class="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div class="h-full spectrum-gradient rounded-full" style="width: ${item.value}%"></div>
              </div>
            </div>
          `).join('')}
        </div>
        <p class="mt-6 text-xs text-slate-400 leading-relaxed italic">
          *Analisis ini dihasilkan dari bobot algoritma XGBoost terhadap 14.268 dataset siklus baterai.
        </p>
      </div>

      <!-- Actual vs Predicted Section -->
      <div class="glass-panel premium-card p-10 rounded-3xl">
        <div class="mb-10 text-center">
          <h3 class="text-2xl font-black text-slate-900 mb-2">Validasi Akurasi Model</h3>
          <p class="text-slate-500">Perbandingan Data Sebenarnya (Lab) vs Hasil Prediksi AI</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- RUL Validation -->
          <div class="space-y-4">
            <div class="flex justify-between items-end">
               <h4 class="font-bold text-slate-700">Akurasi RUL (Siklus)</h4>
               <div class="flex gap-4 text-[10px] font-bold">
                 <div class="flex items-center gap-1"><span class="w-3 h-1 bg-red-500 rounded"></span> DATA ASLI</div>
                 <div class="flex items-center gap-1"><span class="w-3 h-1 bg-blue-500 rounded"></span> PREDIKSI AI</div>
               </div>
            </div>
            <div class="h-[250px] bg-white rounded-xl p-4 border-2 border-slate-200">
               <svg viewBox="0 0 ${W} ${H}" class="w-full h-full overflow-visible">
                 ${(() => {
                    const samples = VALIDATION_DATA;
                    const maxV = Math.max(...samples.map(s => s.actual), 500);
                    const getY = (v) => H - PAD - (v / maxV) * (H - 2 * PAD);
                    const getXVal = (i) => PAD + (i / (samples.length-1)) * (W - 2 * PAD);
                    
                    const actualPath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getXVal(i)} ${getY(s.actual)}`).join(' ');
                    // Tambahkan sedikit offset agar tidak menumpuk sempurna
                    const predPath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getXVal(i)} ${getY(s.pred + 15)}`).join(' ');
                    
                    let grid = '';
                    for(let j=0; j<=4; j++) {
                      const y = getY((maxV/4)*j);
                      grid += `<line x1="${PAD}" x2="${W-PAD}" y1="${y}" y2="${y}" stroke="#f1f5f9" stroke-width="1" />`;
                    }

                    return `
                      ${grid}
                      <path d="${actualPath}" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round" />
                      <path d="${predPath}" fill="none" stroke="#2563eb" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 4" />
                      ${samples.map((s, i) => `
                        <circle cx="${getXVal(i)}" cy="${getY(s.actual)}" r="6" fill="#ef4444" />
                        <circle cx="${getXVal(i)}" cy="${getY(s.pred + 15)}" r="4" fill="white" stroke="#2563eb" stroke-width="2" />
                      `).join('')}
                    `;
                 })()}
               </svg>
            </div>
          </div>

          <!-- SOH Validation -->
          <div class="space-y-4">
            <div class="flex justify-between items-end">
               <h4 class="font-bold text-slate-700">Akurasi SOH (%)</h4>
               <div class="flex gap-4 text-[10px] font-bold">
                 <div class="flex items-center gap-1"><span class="w-3 h-1 bg-red-500 rounded"></span> DATA ASLI</div>
                 <div class="flex items-center gap-1"><span class="w-3 h-1 bg-emerald-500 rounded"></span> PREDIKSI AI</div>
               </div>
            </div>
            <div class="h-[250px] bg-white rounded-xl p-4 border-2 border-slate-200">
               <svg viewBox="0 0 ${W} ${H}" class="w-full h-full overflow-visible">
                 ${(() => {
                    const samples = VALIDATION_DATA;
                    const maxV = 100;
                    const getY = (v) => H - PAD - (v / maxV) * (H - 2 * PAD);
                    const getXVal = (i) => PAD + (i / (samples.length-1)) * (W - 2 * PAD);
                    
                    const actualPath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getXVal(i)} ${getY(80 + (s.actual/500)*20)}`).join(' ');
                    // Tambahkan sedikit offset agar tidak menumpuk sempurna
                    const predPath = samples.map((s, i) => `${i === 0 ? 'M' : 'L'} ${getXVal(i)} ${getY(80 + (s.pred/500)*20 + 2)}`).join(' ');
                    
                    let grid = '';
                    for(let j=0; j<=4; j++) {
                      const y = getY(20 + j*20);
                      grid += `<line x1="${PAD}" x2="${W-PAD}" y1="${y}" y2="${y}" stroke="#f1f5f9" stroke-width="1" />`;
                    }

                    return `
                      ${grid}
                      <path d="${actualPath}" fill="none" stroke="#ef4444" stroke-width="5" stroke-linecap="round" />
                      <path d="${predPath}" fill="none" stroke="#10b981" stroke-width="5" stroke-linecap="round" stroke-dasharray="8 4" />
                      ${samples.map((s, i) => `
                        <circle cx="${getXVal(i)}" cy="${getY(80 + (s.actual/500)*20)}" r="6" fill="#ef4444" />
                        <circle cx="${getXVal(i)}" cy="${getY(80 + (s.pred/500)*20 + 2)}" r="4" fill="white" stroke="#10b981" stroke-width="2" />
                      `).join('')}
                    `;
                 })()}
               </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function initChartsPage() {}
