/**
 * myHealthMate AI — Health History & Timeline Controller
 */

import { api } from './api.js';
import { openModal } from './main.js';

let allEvents = [];
let currentCategory = 'All';

document.addEventListener('DOMContentLoaded', async () => {
  await loadHistory();
  setupFilters();
  setupSearch();
});

async function loadHistory() {
  try {
    const res = await api.request('/health-history');
    if (res && res.data) {
      allEvents = res.data;
      renderHistoryView();
    }
  } catch (e) {
    console.error('Error fetching history:', e);
  }
}

function setupFilters() {
  const pills = document.querySelectorAll('.category-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', (e) => {
      pills.forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      currentCategory = e.target.getAttribute('data-cat') || 'All';
      renderHistoryView();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('history-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      renderHistoryView();
    });
  }
}

function renderHistoryView() {
  const tbody = document.getElementById('history-table-tbody');
  const searchVal = (document.getElementById('history-search-input')?.value || '').toLowerCase();

  if (!tbody) return;

  const filtered = allEvents.filter(ev => {
    const matchesCat = currentCategory === 'All' || ev.category === currentCategory;
    const matchesSearch = ev.title.toLowerCase().includes(searchVal) ||
                          ev.provider.toLowerCase().includes(searchVal) ||
                          ev.notes.toLowerCase().includes(searchVal);
    return matchesCat && matchesSearch;
  });

  tbody.innerHTML = '';

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 32px; color: var(--text-muted);">No records match your filter criteria.</td></tr>`;
    return;
  }

  filtered.forEach(ev => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <strong style="color: var(--text-primary);">${ev.title}</strong>
        <div style="font-size: 0.775rem; color: var(--text-muted);">${ev.notes.substring(0, 48)}...</div>
      </td>
      <td><span class="status-badge uploaded">${ev.category}</span></td>
      <td>${ev.date}</td>
      <td>${ev.provider}</td>
      <td>
        <button class="btn btn-outline btn-sm view-details-btn" data-id="${ev.id}">View Details</button>
      </td>
    `;

    tr.querySelector('.view-details-btn').addEventListener('click', () => {
      showEventModal(ev);
    });

    tbody.appendChild(tr);
  });
}

function showEventModal(ev) {
  const title = document.getElementById('modal-event-title');
  const cat = document.getElementById('modal-event-cat');
  const date = document.getElementById('modal-event-date');
  const provider = document.getElementById('modal-event-provider');
  const notes = document.getElementById('modal-event-notes');

  if (title) title.textContent = ev.title;
  if (cat) cat.textContent = ev.category;
  if (date) date.textContent = `Date: ${ev.date}`;
  if (provider) provider.textContent = `Provider: ${ev.provider}`;
  if (notes) notes.textContent = ev.notes;

  openModal('history-detail-modal');
}
