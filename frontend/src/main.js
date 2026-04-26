import './style.css';
import { renderDashboard, initDashboardChart } from './pages/dashboard.js';
import { renderInputs, initInputsPage } from './pages/inputs.js';
import { renderCharts, initChartsPage } from './pages/charts.js';

// ===== SPA Router =====
const pages = {
  dashboard: { render: renderDashboard, init: initDashboardChart },
  inputs:    { render: renderInputs,    init: initInputsPage },
  charts:    { render: renderCharts,    init: initChartsPage }
};

let currentPage = 'dashboard';

function navigate(page) {
  if (!pages[page]) page = 'dashboard';
  currentPage = page;

  const content = document.getElementById('page-content');
  const titleEl = document.getElementById('page-title');
  
  content.innerHTML = pages[page].render();
  pages[page].init();

  // Set Indonesian Page Title
  if (titleEl) {
    const titles = {
      dashboard: 'Beranda',
      inputs: 'Prediksi RUL',
      charts: 'Analisis Data'
    };
    titleEl.textContent = titles[page] || 'Beranda';
  }

  updateNavState(page);
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateNavState(page) {
  // Desktop nav
  document.querySelectorAll('#desktop-nav .nav-link').forEach(link => {
    if (link.dataset.page === page) {
      link.className = 'nav-link text-blue-600 font-body-md font-semibold transition-colors';
    } else {
      link.className = 'nav-link text-slate-500 font-body-md font-semibold hover:bg-slate-50 transition-colors px-2 py-1 rounded';
    }
  });

  // Mobile nav
  document.querySelectorAll('#mobile-nav .mobile-nav-link').forEach(link => {
    if (link.dataset.page === page) {
      link.className = 'mobile-nav-link flex flex-col items-center justify-center text-blue-600 relative after:content-[\'\'] after:absolute after:-bottom-1 after:w-1 after:h-1 after:bg-blue-600 after:rounded-full transition-all duration-300';
    } else {
      link.className = 'mobile-nav-link flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-all duration-300';
    }
  });
}

// Global navigation function
window.navigateTo = navigate;

// Init
document.addEventListener('DOMContentLoaded', () => {
  // Handle hash-based routing
  const hash = window.location.hash.replace('#', '') || 'dashboard';
  navigate(hash);

  // Click handlers for nav links
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      window.location.hash = page;
      navigate(page);
    });
  });

  // Handle back/forward
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    if (hash !== currentPage) navigate(hash);
  });
});
