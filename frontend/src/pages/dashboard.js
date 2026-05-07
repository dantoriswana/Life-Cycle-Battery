import { DATASET, getPredictions, getPredictionCount } from '../store.js';

export function renderDashboard() {
  const predictions = getPredictions();
  const totalPredictions = getPredictionCount();

  // Calculate distribution
  const normalCount = predictions.filter(p => p.status === 'Normal').length;
  const warningCount = predictions.filter(p => p.status === 'Peringatan').length;
  const criticalCount = predictions.filter(p => p.status === 'Kritis').length;

  // Build table rows
  let tableRows = '';
  if (predictions.length === 0) {
    tableRows = `<tr><td colspan="5" class="px-md py-lg text-center text-outline">Belum ada data prediksi.</td></tr>`;
  } else {
    predictions.slice(0, 5).forEach(p => {
      const statusColor = p.status === 'Normal' ? 'blue' : p.status === 'Peringatan' ? 'orange' : 'red';
      tableRows += `
        <tr class="hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0">
          <td class="px-md py-md font-mono text-[11px] text-slate-400">#${String(p.id).slice(-5)}</td>
          <td class="px-md py-md font-semibold text-slate-700">GTZ-5S</td>
          <td class="px-md py-md font-mono-data text-blue-600 font-bold">${p.soh}%</td>
          <td class="px-md py-md font-mono-data text-slate-600">${p.rul}</td>
          <td class="px-md py-md">
            <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${statusColor}-500/10 text-${statusColor}-600">
              ${p.status}
            </span>
          </td>
        </tr>`;
    });
  }

  return `
  <div class="space-y-lg page-enter print:hidden">
    <!-- Header with Action -->
    <div class="flex justify-between items-center print:hidden">
      <div>
        <h2 class="text-h2 font-h2 text-slate-800">Panel Monitoring</h2>
        <p class="text-body-md text-slate-500">Ringkasan performa dan kesehatan sistem baterai</p>
      </div>
      <button onclick="window.print()" class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-all font-semibold shadow-sm">
        <span class="material-symbols-outlined text-[20px]">print</span>
        Cetak Laporan
      </button>
    </div>

    <!-- KPI Cards -->
    <section class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
      <div class="bg-white p-lg rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <span class="text-label-caps text-slate-400 block mb-2">RMSE ERROR</span>
        <div class="flex items-baseline gap-1">
          <span class="text-h2 font-bold text-slate-800">${DATASET.rmse}</span>
        </div>
      </div>
      <div class="bg-white p-lg rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <span class="text-label-caps text-slate-400 block mb-2">AKURASI R²</span>
        <div class="flex items-baseline gap-1">
          <span class="text-h2 font-bold text-blue-600">${DATASET.r2}</span>
        </div>
      </div>
      <div class="bg-white p-lg rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
        <span class="text-label-caps text-slate-400 block mb-2">TOTAL PREDIKSI</span>
        <div class="flex items-baseline gap-1">
          <span class="text-h2 font-bold text-slate-800">${totalPredictions}</span>
        </div>
      </div>
      <div class="bg-gradient-to-br from-blue-600 to-blue-700 p-lg rounded-2xl shadow-lg text-white">
        <span class="text-label-caps opacity-80 block mb-2 uppercase">Status QC</span>
        <div class="flex items-center gap-2">
          <span class="material-symbols-outlined">verified</span>
          <span class="text-h3 font-bold">Terverifikasi</span>
        </div>
      </div>
    </section>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-lg">
      <section class="lg:col-span-8 bg-white rounded-2xl border border-slate-100 p-lg shadow-sm">
        <div class="flex justify-between items-center mb-lg">
          <h3 class="font-h3 text-slate-800">Tren Sisa Umur (RUL)</h3>
          <span class="text-xs text-slate-400 font-mono italic">*Data siklus degradasi</span>
        </div>
        <div id="dashboard-chart" class="w-full h-64 bg-slate-50/50 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-slate-200">
           ${predictions.length === 0 ? '<p class="text-slate-300">Belum ada data untuk grafik</p>' : ''}
        </div>
      </section>

      <section class="lg:col-span-4 bg-white rounded-2xl border border-slate-100 p-lg shadow-sm">
        <h3 class="font-h3 text-slate-800 mb-lg text-center">Distribusi Kesehatan</h3>
        <div class="space-y-md">
           <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div><span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">Optimal</span></div>
              <div class="text-right"><span class="text-xs font-semibold inline-block text-blue-600">${normalCount}</span></div>
            </div>
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-100"><div style="width:${(normalCount / totalPredictions * 100) || 0}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-1000"></div></div>
          </div>
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div><span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-orange-600 bg-orange-200">Peringatan</span></div>
              <div class="text-right"><span class="text-xs font-semibold inline-block text-orange-600">${warningCount}</span></div>
            </div>
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-orange-100"><div style="width:${(warningCount / totalPredictions * 100) || 0}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-orange-500 transition-all duration-1000"></div></div>
          </div>
          <div class="relative pt-1">
            <div class="flex mb-2 items-center justify-between">
              <div><span class="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-red-600 bg-red-200">Kritis</span></div>
              <div class="text-right"><span class="text-xs font-semibold inline-block text-red-600">${criticalCount}</span></div>
            </div>
            <div class="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-100"><div style="width:${(criticalCount / totalPredictions * 100) || 0}%" class="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500 transition-all duration-1000"></div></div>
          </div>
        </div>
      </section>
    </div>

    <section class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div class="p-md bg-slate-50 flex justify-between items-center border-b border-slate-100">
        <h3 class="font-h3 text-slate-800">5 Riwayat Terakhir</h3>
        <button onclick="window.navigateTo('inputs')" class="text-blue-600 text-xs font-bold uppercase tracking-widest hover:underline">Lihat Semua</button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left">
          <thead class="bg-slate-50/50 text-slate-400 font-label-caps text-[10px] uppercase border-b border-slate-100">
            <tr>
              <th class="px-md py-sm">ID</th>
              <th class="px-md py-sm">Tipe Aki</th>
              <th class="px-md py-sm">SOH (%)</th>
              <th class="px-md py-sm">RUL</th>
              <th class="px-md py-sm">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            ${tableRows}
          </tbody>
        </table>
      </div>
    </section>
  </div>

  <!-- Thermal Receipt (Isolated for Print) -->
  <div id="print-area">
    <div class="receipt-container">
      <div class="receipt-header">
        <div class="receipt-title">HASIL PREDIKSI</div>
        <div class="text-xs">GTZ-5S BATTERY UNIT</div>
      </div>
      
      <div class="receipt-row font-bold">
        <span>HEALTH (SOH)</span>
        <span>: ${predictions.length > 0 ? predictions[0].soh : '-'}%</span>
      </div>
      <div class="receipt-row font-bold">
        <span>SISA UMUR (RUL)</span>
        <span>: ${predictions.length > 0 ? predictions[0].rul : '-'} SIKLUS</span>
      </div>
      <div class="receipt-row">
        <span>ESTIMASI (HARI)</span>
        <span>: ${predictions.length > 0 ? predictions[0].rul_days : '-'} HARI</span>
      </div>
      <div class="receipt-row">
        <span>ESTIMASI (MINGGU)</span>
        <span>: ${predictions.length > 0 ? predictions[0].rul_weeks : '-'} MINGGU</span>
      </div>
      <div class="receipt-row font-bold">
        <span>STATUS</span>
        <span>: ${predictions.length > 0 ? predictions[0].status : '-'}</span>
      </div>
      
      <div class="receipt-divider"></div>
      
      <div class="mt-4 text-center text-[12px] font-bold border-2 border-black p-2 leading-relaxed">
        REKOMENDASI:<br/>
        <span class="text-[14px]">
        ${predictions.length > 0 ? (
      predictions[0].status === 'Normal' ? 'BATERAI DALAM KONDISI BAIK' :
        predictions[0].status === 'Peringatan' ? 'PERSIAPKAN PENGGANTIAN' :
          'GANTI SEGERA / CRITICAL'
    ) : '-'}
        </span>
      </div>

      <div class="receipt-footer">
        <div>QC Terverifikasi</div>
        <div>Standard PT Battery Indonesia</div>
        <div class="mt-2">${new Date().toLocaleDateString('id-ID')} - ${new Date().toLocaleTimeString('id-ID')}</div>
      </div>
    </div>
  </div>`;
}

export function initDashboardChart() {
  const container = document.getElementById('dashboard-chart');
  const printBtn = document.querySelector('[onclick="window.print()"]');
  const predictions = getPredictions();

  if (printBtn) {
    printBtn.innerHTML = `<span class="material-symbols-outlined text-[20px]">receipt_long</span> Cetak Struk Diagnosa`;
  }

  if (!container || predictions.length === 0) return;

  const W = 800, H = 200, PAD = 20;
  const maxRul = Math.max(...predictions.map(p => p.rul), 1);
  const minRul = Math.min(...predictions.map(p => p.rul));
  const sorted = [...predictions].reverse();

  let pathD = '';
  let dots = '';

  const getY = (val) => H - PAD - ((val - minRul) / (maxRul - minRul || 1)) * (H - 2 * PAD);
  const getX = (i) => PAD + (i / Math.max(sorted.length - 1, 1)) * (W - 2 * PAD);

  sorted.forEach((p, i) => {
    const x = getX(i);
    const y = getY(p.rul);
    if (i === 0) pathD = `M${x},${y}`;
    else pathD += ` L${x},${y}`;
    dots += `<circle cx="${x}" cy="${y}" r="4" fill="#2563eb" stroke="#fff" stroke-width="2"/>`;
  });

  container.innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" class="w-full h-full p-2">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#2563eb" stop-opacity="0.2"/>
          <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <path d="${pathD} L${getX(sorted.length - 1)},${H} L${getX(0)},${H} Z" fill="url(#chartGrad)"/>
      <path d="${pathD}" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
    </svg>`;
}
