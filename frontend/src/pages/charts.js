import { DATASET, getPredictions } from '../store.js';

export function renderCharts() {
  const predictions = getPredictions();
  const hasPredictions = predictions.length > 0;

  // If no predictions yet, show empty state
  if (!hasPredictions) {
    return `
    <div class="space-y-lg page-enter">
      <div>
        <h2 class="font-h2 text-h2 text-on-surface mb-xs">System Analytics</h2>
        <p class="font-body-md text-on-surface-variant">Visualization of prediction results and battery analysis.</p>
      </div>

      <!-- Empty State -->
      <div class="bg-white rounded-xl border border-outline-variant p-xl shadow-[0_4px_20px_-5px_rgba(15,23,42,0.04)] flex flex-col items-center justify-center min-h-[400px] text-center">
        <span class="material-symbols-outlined text-[80px] text-outline/20 mb-md">insert_chart</span>
        <h3 class="text-h3 font-h3 text-on-surface mb-sm">No Data Available Yet</h3>
        <p class="text-body-md text-outline max-w-md mb-lg">
          Charts and analytics will appear here after you make predictions. Go to the <strong>Inputs</strong> page to start predicting battery RUL.
        </p>
        <button onclick="window.navigateTo('inputs')" class="spectrum-gradient text-white font-semibold px-lg py-sm rounded-xl shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">analytics</span>
          Go to Inputs
        </button>
      </div>

      <!-- Dataset Info (always visible) -->
      <section class="bg-surface-container-low p-lg rounded-xl border border-outline-variant/20">
        <div class="flex items-center gap-sm mb-md">
          <span class="material-symbols-outlined text-outline">database</span>
          <h3 class="text-h3 font-h3 text-on-background">Training Dataset Info</h3>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
          <div class="bg-white p-md rounded-xl text-center shadow-sm">
            <span class="block font-label-caps text-[10px] text-outline mb-xs">TOTAL CYCLES</span>
            <span class="font-mono-data text-h2 text-primary">${DATASET.totalCycles}</span>
          </div>
          <div class="bg-white p-md rounded-xl text-center shadow-sm">
            <span class="block font-label-caps text-[10px] text-outline mb-xs">START CAPACITY</span>
            <span class="font-mono-data text-h2 text-on-background">${DATASET.capacityStart} Ah</span>
          </div>
          <div class="bg-white p-md rounded-xl text-center shadow-sm">
            <span class="block font-label-caps text-[10px] text-outline mb-xs">END CAPACITY</span>
            <span class="font-mono-data text-h2 text-error">${DATASET.capacityEnd} Ah</span>
          </div>
          <div class="bg-white p-md rounded-xl text-center shadow-sm">
            <span class="block font-label-caps text-[10px] text-outline mb-xs">CAPACITY LOSS</span>
            <span class="font-mono-data text-h2 text-tertiary">${((1 - DATASET.capacityEnd / DATASET.capacityStart) * 100).toFixed(1)}%</span>
          </div>
        </div>
      </section>
    </div>`;
  }

  // ===== Has predictions — show full charts =====
  const maxRul = Math.max(...predictions.map(p => p.rul), 10);

  // Build prediction trend chart
  const W = 700, H = 250, PAD = 40;
  let dots = '';
  let pathD = '';
  const sorted = [...predictions].reverse();

  sorted.forEach((p, i) => {
    const x = PAD + (i / Math.max(sorted.length - 1, 1)) * (W - 2 * PAD);
    const y = H - PAD - (p.rul / maxRul) * (H - 2 * PAD);
    const color = p.status === 'Normal' ? '#0058be' : p.status === 'Warning' ? '#b75b00' : '#ba1a1a';
    dots += `<circle cx="${x}" cy="${y}" r="5" fill="${color}" stroke="#fff" stroke-width="2"/>`;
    if (i === 0) pathD = `M${x},${y}`;
    else pathD += ` L${x},${y}`;
  });

  let grid = '';
  for (let i = 0; i <= 4; i++) {
    const v = (maxRul / 4) * i;
    const y = H - PAD - (v / maxRul) * (H - 2 * PAD);
    grid += `<line x1="${PAD}" x2="${W - PAD}" y1="${y}" y2="${y}" class="chart-grid-line" stroke-dasharray="4"/>`;
    grid += `<text x="${PAD - 5}" y="${y + 4}" text-anchor="end" fill="#727785" font-size="10" font-family="Space Grotesk">${v.toFixed(0)}</text>`;
  }

  // Build status distribution
  const normalCount = predictions.filter(p => p.status === 'Normal').length;
  const warningCount = predictions.filter(p => p.status === 'Warning').length;
  const criticalCount = predictions.filter(p => p.status === 'Critical').length;
  const total = predictions.length;
  const normalPct = ((normalCount / total) * 100).toFixed(0);
  const warningPct = ((warningCount / total) * 100).toFixed(0);
  const criticalPct = ((criticalCount / total) * 100).toFixed(0);

  // Build prediction table
  let tableRows = '';
  predictions.forEach((p, i) => {
    const statusClass = p.status === 'Normal'
      ? 'bg-primary/10 text-primary'
      : p.status === 'Warning'
        ? 'bg-tertiary-container/10 text-tertiary-container'
        : 'bg-error/10 text-error';
    tableRows += `
      <tr class="hover:bg-surface-container-low transition-colors">
        <td class="px-md py-sm font-mono-data text-outline">${i + 1}</td>
        <td class="px-md py-sm font-mono-data">${p.rul}</td>
        <td class="px-md py-sm">
          <span class="px-sm py-xs rounded-full ${statusClass} text-[11px] font-bold uppercase tracking-wider">${p.status}</span>
        </td>
      </tr>`;
  });

  // Average & min/max RUL
  const avgRul = (predictions.reduce((sum, p) => sum + p.rul, 0) / total).toFixed(1);
  const minRul = Math.min(...predictions.map(p => p.rul));
  const maxRulVal = Math.max(...predictions.map(p => p.rul));

  return `
  <div class="space-y-lg page-enter">
    <div>
      <h2 class="font-h2 text-h2 text-on-surface mb-xs">System Analytics</h2>
      <p class="font-body-md text-on-surface-variant">Analysis based on <strong>${total}</strong> prediction(s) you've made.</p>
    </div>

    <!-- Summary Cards -->
    <section class="grid grid-cols-2 md:grid-cols-4 gap-md">
      <div class="bg-white p-md rounded-xl border border-outline-variant shadow-sm text-center">
        <span class="block font-label-caps text-[10px] text-outline mb-xs">TOTAL PREDICTIONS</span>
        <span class="font-mono-data text-h2 text-primary">${total}</span>
      </div>
      <div class="bg-white p-md rounded-xl border border-outline-variant shadow-sm text-center">
        <span class="block font-label-caps text-[10px] text-outline mb-xs">AVERAGE RUL</span>
        <span class="font-mono-data text-h2 text-on-background">${avgRul}</span>
      </div>
      <div class="bg-white p-md rounded-xl border border-outline-variant shadow-sm text-center">
        <span class="block font-label-caps text-[10px] text-outline mb-xs">MAX RUL</span>
        <span class="font-mono-data text-h2 text-primary">${maxRulVal}</span>
      </div>
      <div class="bg-white p-md rounded-xl border border-outline-variant shadow-sm text-center">
        <span class="block font-label-caps text-[10px] text-outline mb-xs">MIN RUL</span>
        <span class="font-mono-data text-h2 text-error">${minRul}</span>
      </div>
    </section>

    <!-- Prediction Trend Chart -->
    <section class="bg-white rounded-xl border border-outline-variant p-lg shadow-[0_4px_20px_-5px_rgba(15,23,42,0.04)]">
      <h3 class="text-h3 font-h3 text-on-background mb-sm">Prediction Results Trend</h3>
      <p class="text-body-md text-outline mb-md">RUL values from your ${total} prediction(s)</p>
      <div class="w-full overflow-x-auto">
        <svg viewBox="0 0 ${W} ${H}" class="w-full min-w-[400px] h-64">
          ${grid}
          <path d="${pathD}" fill="none" stroke="#8455ef" stroke-width="2" stroke-dasharray="6"/>
          ${dots}
        </svg>
      </div>
      <div class="flex items-center gap-md mt-sm text-xs">
        <div class="flex items-center gap-xs"><span class="w-2.5 h-2.5 rounded-full bg-primary"></span> Normal</div>
        <div class="flex items-center gap-xs"><span class="w-2.5 h-2.5 rounded-full bg-tertiary-container"></span> Warning</div>
        <div class="flex items-center gap-xs"><span class="w-2.5 h-2.5 rounded-full bg-error"></span> Critical</div>
      </div>
    </section>

    <!-- Status Distribution -->
    <section class="bg-white rounded-xl border border-outline-variant p-lg shadow-[0_4px_20px_-5px_rgba(15,23,42,0.04)]">
      <h3 class="text-h3 font-h3 text-on-background mb-md">Status Distribution</h3>
      <div class="flex items-center gap-md mb-md">
        <div class="flex-1 bg-slate-100 h-6 rounded-full overflow-hidden flex">
          ${normalCount > 0 ? `<div class="bg-primary h-full flex items-center justify-center text-white text-[10px] font-bold" style="width:${normalPct}%">${normalPct}%</div>` : ''}
          ${warningCount > 0 ? `<div class="bg-tertiary-container h-full flex items-center justify-center text-white text-[10px] font-bold" style="width:${warningPct}%">${warningPct}%</div>` : ''}
          ${criticalCount > 0 ? `<div class="bg-error h-full flex items-center justify-center text-white text-[10px] font-bold" style="width:${criticalPct}%">${criticalPct}%</div>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-lg text-sm">
        <div class="flex items-center gap-xs"><span class="w-3 h-3 rounded-full bg-primary"></span> Normal: <strong>${normalCount}</strong></div>
        <div class="flex items-center gap-xs"><span class="w-3 h-3 rounded-full bg-tertiary-container"></span> Warning: <strong>${warningCount}</strong></div>
        <div class="flex items-center gap-xs"><span class="w-3 h-3 rounded-full bg-error"></span> Critical: <strong>${criticalCount}</strong></div>
      </div>
    </section>

    <!-- All Predictions Table -->
    <section class="bg-white rounded-xl border border-outline-variant overflow-hidden shadow-[0_4px_20px_-5px_rgba(15,23,42,0.04)]">
      <div class="p-md bg-surface-container-low border-b border-outline-variant">
        <h3 class="text-body-lg font-h3 text-on-background">All Predictions</h3>
      </div>
      <div class="overflow-x-auto max-h-[300px] overflow-y-auto">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0">
            <tr class="bg-surface-bright text-label-caps text-outline uppercase border-b border-outline-variant">
              <th class="px-md py-sm">#</th>
              <th class="px-md py-sm">Predicted RUL</th>
              <th class="px-md py-sm">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-surface-container">
            ${tableRows}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Model Info -->
    <section class="bg-surface-container-low p-lg rounded-xl border border-outline-variant/20">
      <div class="flex items-center gap-sm mb-md">
        <span class="material-symbols-outlined text-outline">database</span>
        <h3 class="text-h3 font-h3 text-on-background">Model Performance</h3>
      </div>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-md">
        <div class="bg-white p-md rounded-xl text-center shadow-sm">
          <span class="block text-[10px] font-label-caps text-outline mb-xs">MAE</span>
          <span class="font-mono-data text-body-lg text-primary font-bold">${DATASET.mae}</span>
          <div class="mt-sm w-full bg-slate-100 h-1.5 rounded-full"><div class="bg-primary h-full rounded-full" style="width:${(1 - DATASET.mae) * 100}%"></div></div>
        </div>
        <div class="bg-white p-md rounded-xl text-center shadow-sm">
          <span class="block text-[10px] font-label-caps text-outline mb-xs">MSE</span>
          <span class="font-mono-data text-body-lg text-secondary font-bold">${DATASET.mse}</span>
          <div class="mt-sm w-full bg-slate-100 h-1.5 rounded-full"><div class="bg-secondary h-full rounded-full" style="width:${(1 - DATASET.mse) * 100}%"></div></div>
        </div>
        <div class="bg-white p-md rounded-xl text-center shadow-sm">
          <span class="block text-[10px] font-label-caps text-outline mb-xs">RMSE</span>
          <span class="font-mono-data text-body-lg text-tertiary font-bold">${DATASET.rmse}</span>
          <div class="mt-sm w-full bg-slate-100 h-1.5 rounded-full"><div class="bg-tertiary h-full rounded-full" style="width:${(1 - DATASET.rmse) * 100}%"></div></div>
        </div>
        <div class="bg-white p-md rounded-xl text-center shadow-sm">
          <span class="block text-[10px] font-label-caps text-outline mb-xs">R² SCORE</span>
          <span class="font-mono-data text-body-lg text-primary font-bold">${DATASET.r2}</span>
          <div class="mt-sm w-full bg-slate-100 h-1.5 rounded-full"><div class="bg-primary h-full rounded-full" style="width:${DATASET.r2 * 100}%"></div></div>
        </div>
      </div>
    </section>
  </div>`;
}

export function initChartsPage() {
  // No chart init needed - everything is inline SVG rendered from prediction data
}
