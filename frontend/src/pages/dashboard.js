import { DATASET, getPredictions, getPredictionCount } from '../store.js';

export function renderDashboard() {
  const predictions = getPredictions();
  const totalPredictions = getPredictionCount();
  const hasData = predictions.length > 0;

  // Build table rows
  let tableRows = '';
  if (predictions.length === 0) {
    tableRows = `<tr><td colspan="4" class="px-md py-lg text-center text-outline">No predictions yet. Go to Inputs to make your first prediction.</td></tr>`;
  } else {
    predictions.slice(0, 5).forEach(p => {
      const statusClass = p.status === 'Normal'
        ? 'bg-primary/10 text-primary'
        : p.status === 'Warning'
          ? 'bg-tertiary-container/10 text-tertiary-container'
          : 'bg-error/10 text-error';
      const statusLabel = p.status === 'Normal' ? 'Optimal' : p.status;
      tableRows += `
        <tr class="prediction-row hover:bg-surface-container-low transition-colors">
          <td class="px-md py-md font-mono-data text-outline">#${String(p.id).padStart(5, '0')}</td>
          <td class="px-md py-md font-semibold">GTZ-5S-${String(p.id).padStart(2,'0')}</td>
          <td class="px-md py-md font-mono-data">${p.rul}</td>
          <td class="px-md py-md">
            <span class="px-sm py-xs rounded-full ${statusClass} text-[11px] font-bold uppercase tracking-wider">${statusLabel}</span>
          </td>
        </tr>`;
    });
  }

  return `
  <div class="space-y-lg page-enter">
    <!-- KPI Cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
      <div class="spectrum-gradient-border p-md bg-white">
        <div class="flex flex-col gap-xs">
          <span class="text-label-caps font-label-caps text-outline uppercase">MAE</span>
          <div class="flex items-baseline gap-xs">
            <span class="text-h2 font-h2 text-on-background">${DATASET.mae}</span>
          </div>
        </div>
      </div>
      <div class="spectrum-gradient-border p-md bg-white">
        <div class="flex flex-col gap-xs">
          <span class="text-label-caps font-label-caps text-outline uppercase">MSE</span>
          <div class="flex items-baseline gap-xs">
            <span class="text-h2 font-h2 text-on-background">${DATASET.mse}</span>
          </div>
        </div>
      </div>
      <div class="spectrum-gradient-border p-md bg-white">
        <div class="flex flex-col gap-xs">
          <span class="text-label-caps font-label-caps text-outline uppercase">RMSE</span>
          <div class="flex items-baseline gap-xs">
            <span class="text-h2 font-h2 text-on-background">${DATASET.rmse}</span>
          </div>
        </div>
      </div>
      <div class="spectrum-gradient-border p-md bg-white">
        <div class="flex flex-col gap-xs">
          <span class="text-label-caps font-label-caps text-outline uppercase">R² Score</span>
          <div class="flex items-baseline gap-xs">
            <span class="text-h2 font-h2 text-on-background">${DATASET.r2}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Dynamic Chart Section -->
    <section class="bg-white rounded-xl border border-outline-variant p-lg shadow-sm">
      <div class="flex justify-between items-center mb-lg">
        <div>
          <h3 class="text-h3 font-h3 text-on-background">Live Prediction Trend</h3>
          <p class="text-body-md text-outline">Real-time visualization of your predicted RUL cycles</p>
        </div>
      </div>
      <div id="dashboard-chart" class="relative w-full h-80 flex items-center justify-center rounded-lg bg-surface-container-low/30 border border-surface-container overflow-hidden">
        ${!hasData ? `
          <div class="text-center space-y-sm">
            <span class="material-symbols-outlined text-[48px] text-outline/30">monitoring</span>
            <p class="text-outline">No prediction data to visualize</p>
          </div>
        ` : ''}
      </div>
    </section>

    <section class="grid grid-cols-1 lg:grid-cols-3 gap-lg">
      <div class="lg:col-span-2 bg-white rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div class="p-md bg-surface-container-low flex justify-between items-center border-b border-outline-variant">
          <h3 class="text-body-lg font-h3 text-on-background">Recent Predictions</h3>
          <button onclick="window.navigateTo('inputs')" class="text-primary font-label-caps flex items-center gap-xs">
            New Prediction <span class="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-surface-bright text-label-caps text-outline uppercase border-b border-outline-variant">
                <th class="px-md py-sm">No.</th>
                <th class="px-md py-sm">Unit ID</th>
                <th class="px-md py-sm">RUL</th>
                <th class="px-md py-sm">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-surface-container">
              ${tableRows}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-primary-container rounded-xl p-lg text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
        <div class="z-10">
          <span class="text-label-caps opacity-90 uppercase block mb-sm">Session Counter</span>
          <span class="text-[48px] font-bold font-mono-data leading-none">${totalPredictions}</span>
          <p class="text-body-md opacity-80 mt-xs">Predictions performed</p>
        </div>
        <button onclick="window.navigateTo('inputs')" class="mt-lg w-full bg-white text-primary font-semibold py-3 rounded-lg z-10 active:scale-95 transition-all">
          Predict Now
        </button>
      </div>
    </section>
  </div>`;
}

export function initDashboardChart() {
  const container = document.getElementById('dashboard-chart');
  const predictions = getPredictions();
  if (!container || predictions.length === 0) return;

  const W = 800, H = 300, PAD = 40;
  const maxRul = Math.max(...predictions.map(p => p.rul), 100);
  const sorted = [...predictions].reverse();

  let pathD = '';
  let dots = '';
  sorted.forEach((p, i) => {
    const x = PAD + (i / Math.max(sorted.length - 1, 1)) * (W - 2 * PAD);
    const y = H - PAD - (p.rul / maxRul) * (H - 2 * PAD);
    if (i === 0) pathD = `M${x},${y}`;
    else pathD += ` L${x},${y}`;
    dots += `<circle cx="${x}" cy="${y}" r="4" fill="#2170e4" stroke="#fff" stroke-width="2"/>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="w-full h-full p-sm">
      <path d="${pathD}" fill="none" stroke="#2170e4" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
}
