/**
 * myHealthMate AI — Upgraded Report Analysis & Biomarkers Controller
 * Features: Structured table, readable parameter cards, localized discussion questions,
 * and transparent extraction notices.
 */

import { api } from './api.js';
import { i18n } from './i18n.js';
import { showToast } from './main.js';

let currentReportId = 'rep_7482_cmp';

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentReportId = urlParams.get('id') || 'rep_7482_cmp';

  await loadAnalysisData(currentReportId, i18n.currentLang || 'en');
  setupCopyQuestionsButton();
});

async function loadAnalysisData(reportId, lang = 'en') {
  const container = document.getElementById('parameters-grid');
  if (container) {
    container.innerHTML = `
      <div class="param-card skeleton-box" style="height: 220px; opacity: 0.6;"></div>
      <div class="param-card skeleton-box" style="height: 220px; opacity: 0.6;"></div>
      <div class="param-card skeleton-box" style="height: 220px; opacity: 0.6;"></div>
      <div class="param-card skeleton-box" style="height: 220px; opacity: 0.6;"></div>
    `;
  }

  try {
    const res = await api.request(`/reports/${reportId}/analysis?lang=${lang}`);
    const data = (res && res.data) ? res.data : res;

    if (data) {
      renderReportHeader(data);
      renderParameterCards(data.parameters || []);
      renderStructuredTable(data.structuredTable || data.parameters || []);
      renderClinicianQuestions(data.clinicianQuestions || []);
    }
  } catch (err) {
    console.error('[analysis] Error fetching analysis data:', err);
  }
}

function renderReportHeader(data) {
  const titleEl = document.getElementById('analysis-report-title');
  const facilityEl = document.getElementById('analysis-facility');
  const statusEl = document.getElementById('analysis-status-badge');
  const langEl = document.getElementById('analysis-lang-badge');
  const filenameEl = document.getElementById('analysis-filename');
  const categoryEl = document.getElementById('analysis-category');
  const dateEl = document.getElementById('analysis-collection-date');
  const summaryEl = document.getElementById('analysis-summary-text');
  const noticeEl = document.getElementById('analysis-transparency-text');

  if (titleEl) titleEl.textContent = data.reportTitle || 'Comprehensive Metabolic & Lipid Panel';
  if (facilityEl) facilityEl.textContent = `${data.facility || 'MetroHealth Diagnostic Laboratory'} • Collected: ${data.collectedDate || 'January 14, 2026'}`;
  if (statusEl) {
    const st = (data.processingStatus || 'COMPLETED').toLowerCase();
    statusEl.className = `status-badge ${st}`;
    statusEl.textContent = data.processingStatus || 'COMPLETED';
  }
  if (langEl) langEl.textContent = `Lang: ${data.detectedLanguage || 'en'}`;
  if (filenameEl) filenameEl.textContent = data.originalFilename || 'Medical_Lab_Report.pdf';
  if (categoryEl) categoryEl.textContent = data.category || 'General Laboratory Panel';
  if (dateEl) dateEl.textContent = data.collectedDate || 'January 14, 2026';
  if (summaryEl) summaryEl.textContent = data.summary || 'Summary unavailable.';
  if (noticeEl && data.transparencyNotice) noticeEl.textContent = data.transparencyNotice;
}

function renderParameterCards(parameters) {
  const container = document.getElementById('parameters-grid');
  if (!container) return;

  container.innerHTML = '';

  parameters.forEach((param, idx) => {
    const card = document.createElement('div');
    card.className = 'param-card stagger-item revealed';
    card.style.transitionDelay = `${idx * 0.07}s`;

    // Calculate position for visual reference range track
    const rangeSpan = (param.maxRange - param.minRange) || 100;
    const valuePos = ((param.value - param.minRange) / rangeSpan) * 100;
    const clampedPos = Math.max(5, Math.min(95, valuePos));

    let badgeClass = 'status-badge optimal';
    let badgeText = param.status || 'OPTIMAL';

    const st = (param.status || '').toUpperCase();
    if (st === 'ELEVATED') {
      badgeClass = 'status-badge elevated';
    } else if (st === 'BORDERLINE') {
      badgeClass = 'status-badge borderline';
    } else if (st === 'LOW') {
      badgeClass = 'status-badge low';
    } else if (st === 'NEEDS_REVIEW') {
      badgeClass = 'status-badge needs_review';
    }

    card.innerHTML = `
      <div class="param-header">
        <div>
          <h4 class="param-name">${param.name}</h4>
          <span class="param-category">${param.category || 'Biochemistry'}</span>
        </div>
        <span class="${badgeClass}">${badgeText}</span>
      </div>

      <div class="param-value-row">
        <span class="param-value">${param.value}</span>
        <span class="param-unit">${param.unit}</span>
      </div>

      <div class="param-range-track" title="Reference Interval: ${param.minRange} - ${param.maxRange} ${param.unit}">
        <div class="param-range-optimal"></div>
        <div class="param-marker" style="left: ${clampedPos}%;"></div>
      </div>

      <div class="param-range-labels">
        <span>Min: ${param.minRange} ${param.unit}</span>
        <span>Standard Ref Interval</span>
        <span>Max: ${param.maxRange} ${param.unit}</span>
      </div>

      <div class="param-explanation">
        <strong>Educational Purpose:</strong> ${param.explanation}
        <div style="margin-top: 6px; color: var(--accent-teal); font-size: 0.775rem;">
          💡 <em>${param.clinicalNote || 'Review trends with your doctor.'}</em>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

function renderStructuredTable(tableData) {
  const tbody = document.getElementById('structured-table-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';

  tableData.forEach(row => {
    const tr = document.createElement('tr');

    const paramName = row.parameter || row.name;
    const resultVal = row.result || `${row.value}`;
    const unitVal = row.unit;
    const rangeVal = row.refRange || `${row.minRange} - ${row.maxRange}`;
    const statusVal = row.status || 'NORMAL';
    const interpretationVal = row.interpretation || row.clinicalNote || 'Normal range';

    const stClass = statusVal.toLowerCase();

    tr.innerHTML = `
      <td><strong style="color: var(--text-primary);">${paramName}</strong></td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-cyan); font-size: 1rem;">${resultVal}</td>
      <td>${unitVal}</td>
      <td style="color: var(--text-muted); font-size: 0.85rem;">${rangeVal}</td>
      <td><span class="status-badge ${stClass}">${statusVal}</span></td>
      <td style="font-size: 0.825rem; color: var(--text-secondary); max-width: 280px;">${interpretationVal}</td>
    `;

    tbody.appendChild(tr);
  });
}

function renderClinicianQuestions(questions) {
  const listEl = document.getElementById('clinician-questions-list');
  if (!listEl) return;

  listEl.innerHTML = '';
  questions.forEach((q, idx) => {
    const li = document.createElement('li');
    li.className = 'question-item';
    li.innerHTML = `
      <span style="color: var(--accent-purple); font-weight: 700; font-size: 1.1rem;">${idx + 1}.</span>
      <span style="color: var(--text-primary); font-size: 0.925rem;">${q}</span>
    `;
    listEl.appendChild(li);
  });
}

function setupCopyQuestionsButton() {
  const btn = document.getElementById('copy-questions-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const questions = Array.from(document.querySelectorAll('.question-item span:last-child'))
      .map((el, i) => `${i + 1}. ${el.textContent}`)
      .join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(questions).then(() => {
        showToast('Questions Copied!', i18n.t('analysis.questionsCopied', 'Doctor discussion questions copied to clipboard!'), 'success');
      });
    } else {
      showToast('Questions Ready', 'Select and copy the doctor discussion questions above.', 'info');
    }
  });
}

// React to language switches dynamically
window.addEventListener('languageChanged', (e) => {
  const lang = e.detail?.lang || 'en';
  loadAnalysisData(currentReportId, lang);
});
