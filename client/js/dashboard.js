/**
 * myHealthMate AI — Dashboard Analytics & Chart.js Integration
 * Features verified metrics count-up, viewport chart triggers, and smooth hover interactions.
 */

import { api } from './api.js';
import { showToast } from './main.js';

let healthTrendsChart = null;
let biomarkersChart = null;

document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardMetrics();
  initChartsWithViewportObserver();
  setupFilterControls();
  setupStaggeredCardEntrances();
});

/**
 * Animate numbers counting up smoothly using cubic easeOutExpo
 * Only called on real, verified numeric API data.
 */
function animateCountUp(element, targetValue, durationMs = 1200) {
  if (!element) return;
  const num = typeof targetValue === 'number' ? targetValue : parseInt(targetValue, 10);
  if (isNaN(num)) {
    element.textContent = targetValue;
    return;
  }

  // Accessibility: respect user motion preferences
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = num;
    return;
  }

  const startValue = 0;
  const startTime = performance.now();

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / durationMs, 1);
    // Exponential ease out
    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const current = Math.round(startValue + (num - startValue) * ease);

    element.textContent = current;

    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = num;
    }
  }

  requestAnimationFrame(step);
}

async function loadDashboardMetrics() {
  try {
    const res = await api.request('/dashboard/summary');
    if (res && res.data) {
      const d = res.data;
      const elReports = document.getElementById('stat-total-reports');
      const elAbnormal = document.getElementById('stat-abnormal-findings');
      const elRecords = document.getElementById('stat-health-records');
      const elAppointments = document.getElementById('stat-appointments');

      if (elReports) animateCountUp(elReports, d.totalReports, 1100);
      if (elAbnormal) animateCountUp(elAbnormal, d.abnormalFindings, 1200);
      if (elRecords) animateCountUp(elRecords, d.recordsCount, 1300);
      if (elAppointments) animateCountUp(elAppointments, d.upcomingAppointments, 900);
    }
  } catch (e) {
    console.error('Error fetching dashboard metrics:', e);
  }
}

function setupStaggeredCardEntrances() {
  const cards = document.querySelectorAll('.stat-card');
  cards.forEach((card, idx) => {
    card.classList.add('stagger-item');
    card.style.transitionDelay = `${idx * 0.08}s`;
    // Trigger entrance shortly after load
    setTimeout(() => {
      card.classList.add('revealed');
    }, 100);
  });
}

function initChartsWithViewportObserver() {
  const chartContainers = document.querySelectorAll('.chart-wrapper');

  if ('IntersectionObserver' in window) {
    const chartObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const canvas = entry.target.querySelector('canvas');
          if (canvas) {
            if (canvas.id === 'healthTrendsChart' && !healthTrendsChart) {
              initHealthTrendsChart();
            } else if (canvas.id === 'biomarkersChart' && !biomarkersChart) {
              initBiomarkersChart();
            }
          }
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    chartContainers.forEach(el => chartObserver.observe(el));
  } else {
    initHealthTrendsChart();
    initBiomarkersChart();
  }
}

function initHealthTrendsChart() {
  const ctx = document.getElementById('healthTrendsChart');
  if (!ctx || typeof Chart === 'undefined') return;

  const gradientCyan = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradientCyan.addColorStop(0, 'rgba(0, 212, 255, 0.4)');
  gradientCyan.addColorStop(1, 'rgba(0, 212, 255, 0.0)');

  const gradientTeal = ctx.getContext('2d').createLinearGradient(0, 0, 0, 300);
  gradientTeal.addColorStop(0, 'rgba(0, 230, 184, 0.3)');
  gradientTeal.addColorStop(1, 'rgba(0, 230, 184, 0.0)');

  healthTrendsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      datasets: [
        {
          label: 'Systolic BP (mmHg)',
          data: [124, 122, 120, 119, 121, 118],
          borderColor: '#00D4FF',
          backgroundColor: gradientCyan,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#00D4FF',
          pointBorderColor: '#06111F',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Diastolic BP (mmHg)',
          data: [82, 80, 79, 78, 80, 78],
          borderColor: '#00E6B8',
          backgroundColor: gradientTeal,
          borderWidth: 2.5,
          tension: 0.35,
          fill: true,
          pointBackgroundColor: '#00E6B8',
          pointBorderColor: '#06111F',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'Heart Rate (bpm)',
          data: [76, 74, 71, 73, 70, 72],
          borderColor: '#8B5CF6',
          borderDash: [5, 5],
          borderWidth: 2,
          tension: 0.35,
          fill: false,
          pointBackgroundColor: '#8B5CF6',
          pointRadius: 3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1400,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            color: '#A7B8CC',
            font: { family: 'Inter', size: 12 },
            boxWidth: 14,
            usePointStyle: true
          }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 27, 45, 0.95)',
          titleColor: '#F8FAFC',
          bodyColor: '#A7B8CC',
          borderColor: 'rgba(0, 212, 255, 0.3)',
          borderWidth: 1,
          padding: 12,
          displayColors: true
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748B', font: { family: 'Inter' } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748B', font: { family: 'Inter' } },
          min: 60,
          max: 140
        }
      }
    }
  });
}

function initBiomarkersChart() {
  const ctx = document.getElementById('biomarkersChart');
  if (!ctx || typeof Chart === 'undefined') return;

  biomarkersChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Chol.', 'LDL Chol.', 'HDL Chol.', 'Fasting Glucose', 'Triglycerides'],
      datasets: [
        {
          label: 'Current Value (mg/dL)',
          data: [218, 128, 58, 92, 140],
          backgroundColor: [
            'rgba(245, 158, 11, 0.75)', // Borderline
            'rgba(245, 158, 11, 0.75)',
            'rgba(0, 230, 184, 0.75)',  // Optimal
            'rgba(0, 230, 184, 0.75)',  // Optimal
            'rgba(0, 212, 255, 0.75)'   // Normal
          ],
          borderColor: [
            '#F59E0B',
            '#F59E0B',
            '#00E6B8',
            '#00E6B8',
            '#00D4FF'
          ],
          borderWidth: 1.5,
          borderRadius: 6
        },
        {
          label: 'Optimal Threshold (Upper)',
          data: [200, 100, 60, 99, 150],
          type: 'line',
          borderColor: '#8B5CF6',
          borderDash: [6, 4],
          pointRadius: 4,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1200,
        easing: 'easeOutQuart'
      },
      plugins: {
        legend: {
          labels: { color: '#A7B8CC', font: { size: 11 } }
        },
        tooltip: {
          backgroundColor: 'rgba(11, 27, 45, 0.95)',
          titleColor: '#F8FAFC',
          bodyColor: '#A7B8CC',
          borderColor: 'rgba(0, 212, 255, 0.3)',
          borderWidth: 1
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#64748B', font: { size: 11 } }
        },
        y: {
          grid: { color: 'rgba(255, 255, 255, 0.04)' },
          ticks: { color: '#64748B' }
        }
      }
    }
  });
}

function setupFilterControls() {
  const buttons = document.querySelectorAll('.time-filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const period = btn.getAttribute('data-period');
      updateChartTimeframe(period);
    });
  });
}

function updateChartTimeframe(period) {
  if (!healthTrendsChart) return;

  const datasetMap = {
    '1M': {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      systolic: [122, 120, 119, 118],
      diastolic: [80, 79, 78, 78],
      hr: [72, 70, 73, 72]
    },
    '3M': {
      labels: ['Nov', 'Dec', 'Jan'],
      systolic: [119, 121, 118],
      diastolic: [78, 80, 78],
      hr: [73, 70, 72]
    },
    '6M': {
      labels: ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan'],
      systolic: [124, 122, 120, 119, 121, 118],
      diastolic: [82, 80, 79, 78, 80, 78],
      hr: [76, 74, 71, 73, 70, 72]
    },
    '1Y': {
      labels: ['Feb', 'Apr', 'Jun', 'Aug', 'Oct', 'Dec', 'Jan'],
      systolic: [128, 126, 125, 124, 120, 121, 118],
      diastolic: [84, 83, 81, 82, 79, 80, 78],
      hr: [78, 75, 74, 76, 71, 70, 72]
    }
  };

  const selected = datasetMap[period] || datasetMap['6M'];
  healthTrendsChart.data.labels = selected.labels;
  healthTrendsChart.data.datasets[0].data = selected.systolic;
  healthTrendsChart.data.datasets[1].data = selected.diastolic;
  healthTrendsChart.data.datasets[2].data = selected.hr;
  healthTrendsChart.update('active');

  showToast('Telemetry Filter Updated', `Viewing ${period} historical trend data.`, 'info', 2500);
}
