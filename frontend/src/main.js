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
});
