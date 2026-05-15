export function renderWelcome() {
  return `
  <div class="fixed inset-0 z-[100] bg-slate-50 flex items-center justify-center overflow-hidden font-['Inter']">
    <!-- Animated background blobs -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] animate-pulse"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" style="animation-delay: 2s"></div>

    <div class="relative z-10 max-w-2xl w-full px-6 text-center space-y-12 page-enter">
      <!-- Logo/Icon Area -->
      <div class="relative inline-block">
        <div class="w-32 h-32 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-[40px] shadow-2xl flex items-center justify-center transform rotate-12 hover:rotate-0 transition-transform duration-500">
           <span class="material-symbols-outlined text-[64px] text-white transform -rotate-12 hover:rotate-0 transition-transform duration-500">battery_charging_full</span>
        </div>
        <!-- Decorative elements -->
        <div class="absolute -top-4 -right-4 w-8 h-8 bg-emerald-400 rounded-full blur-sm opacity-50 animate-bounce"></div>
      </div>

      <!-- Title & Branding -->
      <div class="space-y-4">
        <h1 class="text-[56px] font-black tracking-tighter text-slate-900 leading-tight">
          EcoSync
        </h1>
        <p class="text-slate-500 font-bold tracking-[0.2em] uppercase text-sm">
          Predictive Energy Intelligence
        </p>
      </div>

      <!-- Tagline -->
      <p class="text-slate-600 text-lg max-w-md mx-auto leading-relaxed">
        Sistem cerdas pemantauan kesehatan baterai GTZ 5S berbasis Machine Learning untuk efisiensi energi masa depan.
      </p>

      <!-- Action Button -->
      <div class="pt-8">
        <button onclick="window.navigateTo('dashboard')" class="group relative px-10 py-5 bg-blue-600 text-white rounded-2xl font-bold text-lg shadow-[0_20px_40px_-10px_rgba(37,99,235,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(37,99,235,0.5)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-3 mx-auto">
          Mulai Sekarang
          <span class="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
        </button>
      </div>

      <!-- System Status Footer -->
      <div class="pt-24 grid grid-cols-2 gap-12 text-left opacity-60">
        <div>
          <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">System Status</span>
          <p class="text-xs font-bold text-slate-600 flex items-center gap-2">
            <span class="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
            Predictive Core Active
          </p>
        </div>
        <div class="text-right">
          <span class="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Version</span>
          <p class="text-xs font-bold text-slate-600">GTZ v3.1.0-STABLE</p>
        </div>
      </div>
    </div>
  </div>
  `;
}

export function initWelcome() {
  // Hide main header and nav when on welcome page
  const header = document.getElementById('top-header');
  const mobileNav = document.getElementById('mobile-nav');
  if (header) header.classList.add('hidden');
  if (mobileNav) mobileNav.classList.add('hidden');
}
