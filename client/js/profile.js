/**
 * myHealthMate AI — Profile, Settings & Privacy Management
 */

import { auth } from './auth.js';
import { showToast, openModal, closeModal } from './main.js';

document.addEventListener('DOMContentLoaded', () => {
  setupProfileForm();
  setupLanguagePreference();
  setupExportData();
  setupDeleteAccount();
});

function setupLanguagePreference() {
  const langSelect = document.getElementById('user-language-pref');
  if (!langSelect) return;

  const current = localStorage.getItem('mhm_lang') || 'en';
  langSelect.value = current;

  langSelect.addEventListener('change', async (e) => {
    const newLang = e.target.value;
    if (window.i18nManager) {
      await window.i18nManager.setLanguage(newLang);
    } else {
      localStorage.setItem('mhm_lang', newLang);
      window.location.reload();
    }
    showToast('Language Updated', `Preferred language set to ${newLang.toUpperCase()}`, 'info');
  });
}

function setupProfileForm() {
  const form = document.getElementById('profile-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('prof-name')?.value;
    const email = document.getElementById('prof-email')?.value;
    const lang = document.getElementById('user-language-pref')?.value;

    if (auth.currentUser) {
      auth.currentUser.name = name || auth.currentUser.name;
      auth.currentUser.email = email || auth.currentUser.email;
      if (lang) auth.currentUser.preferredLanguage = lang;
      sessionStorage.setItem('mhm_session_token', JSON.stringify(auth.currentUser));
      auth.updateUI();
    }

    if (lang && window.i18nManager) {
      await window.i18nManager.setLanguage(lang);
    }

    showToast('Profile Updated', 'Your personal settings have been saved successfully.', 'success');
  });
}

function setupExportData() {
  const btn = document.getElementById('export-data-btn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const exportPayload = {
      exportDate: new Date().toISOString(),
      user: {
        id: auth.currentUser?.id || 'demo_user',
        name: auth.currentUser?.name || 'Alex Morgan',
        email: auth.currentUser?.email || 'alex.morgan@example.com',
        preferredLanguage: localStorage.getItem('mhm_lang') || 'en'
      },
      disclaimer: 'This file contains synthetic demonstration records produced by myHealthMate AI.',
      summary: {
        totalReports: 3,
        vitalTrends: 'Blood pressure in normal range; borderline lipid panel noted.'
      }
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `myHealthMate_Data_Export_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Export Complete', 'Your health data export has been downloaded.', 'success');
  });
}

function setupDeleteAccount() {
  const deleteBtn = document.getElementById('delete-account-btn');
  const confirmBtn = document.getElementById('confirm-delete-btn');

  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      openModal('delete-account-modal');
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      closeModal('delete-account-modal');
      sessionStorage.clear();
      showToast('Account Purged', 'Your session data has been erased.', 'warning');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    });
  }
}
