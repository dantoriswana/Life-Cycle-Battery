<<<<<<< HEAD
import './style.css'

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('prediction-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const spinner = document.getElementById('loading-spinner');
  const btnText = submitBtn.querySelector('span');
  
  const resultsContainer = document.getElementById('results-container');
  const resultsContent = document.getElementById('results-content');
  const errorContainer = document.getElementById('error-container');
  
  const rulValue = document.getElementById('rul-value');
  const statusContainer = document.getElementById('status-container');
  const statusText = document.getElementById('status-text');
  
  const recommendationTitle = document.getElementById('recommendation-title');
  const recommendationText = document.getElementById('recommendation-text');
  const errorText = document.getElementById('error-text');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // UI Loading State
    submitBtn.disabled = true;
    spinner.classList.remove('hidden');
    btnText.textContent = 'Analyzing...';
    errorContainer.classList.add('hidden');
    
    // Get values
    const capacity = parseFloat(document.getElementById('capacity').value);
    const soh = parseFloat(document.getElementById('soh').value);
    const voltage_drop = parseFloat(document.getElementById('voltage_drop').value);
    const min_voltage = parseFloat(document.getElementById('min_voltage').value);

    const payload = {
      capacity,
      soh,
      voltage_drop,
      min_voltage
    };

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to predict lifecycle');
      }

      displayResults(data);

    } catch (error) {
      console.error('Prediction Error:', error);
      showError(error.message);
    } finally {
      // Restore UI State
      submitBtn.disabled = false;
      spinner.classList.add('hidden');
      btnText.textContent = 'Predict Lifecycle';
    }
  });

  function displayResults(data) {
    const { rul, status } = data;

    // Hide empty state, show results
    resultsContainer.classList.add('hidden');
    resultsContent.classList.remove('hidden');

    // Animate numbers
    animateValue(rulValue, 0, rul, 1000);

    // Update status
    statusContainer.className = 'status-indicator'; // Reset classes
    
    let recTitle = "Recommendation";
    let recDesc = "";

    if (status === "Normal") {
      statusContainer.classList.add('status-normal');
      statusText.textContent = "Excellent Condition";
      recTitle = "Maintain Current Usage";
      recDesc = "The battery is operating optimally. Continue standard operational procedures and regular monitoring.";
      
    } else if (status === "Warning") {
      statusContainer.classList.add('status-warning');
      statusText.textContent = "Degradation Detected";
      recTitle = "Prepare for Replacement";
      recDesc = "Battery is showing signs of wear. Consider budgeting for a replacement soon and avoid deep discharges to extend remaining life.";
      
    } else {
      statusContainer.classList.add('status-critical');
      statusText.textContent = "End of Life";
      recTitle = "Replace Immediately";
      recDesc = "Critical degradation level. The battery is unreliable and should be replaced immediately to prevent system failure.";
    }

    recommendationTitle.textContent = recTitle;
    recommendationText.textContent = recDesc;
  }

  function showError(msg) {
    errorText.textContent = msg;
    errorContainer.classList.remove('hidden');
    resultsContainer.classList.add('hidden');
    resultsContent.classList.add('hidden');
  }

  // Utility to animate number counting up
  function animateValue(obj, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentVal = (progress * (end - start) + start).toFixed(1);
      
      obj.innerHTML = currentVal;
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        obj.innerHTML = end; // Ensure final value is exact
      }
    };
    window.requestAnimationFrame(step);
  }
=======
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
  content.innerHTML = pages[page].render();
  pages[page].init();

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
>>>>>>> c14b82d (Update Ui)
});
