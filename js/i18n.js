/**
 * myHealthMate AI — Centralized Multilingual Translation Engine (i18n)
 * Supports English (en), Telugu (te), Hindi (hi), and Tamil (ta).
 */

const SUPPORTED_LANGS = ['en', 'te', 'hi', 'ta'];
const DEFAULT_LANG = 'en';

class I18nManager {
  constructor() {
    this.currentLang = localStorage.getItem('mhm_lang') || DEFAULT_LANG;
    if (!SUPPORTED_LANGS.includes(this.currentLang)) {
      this.currentLang = DEFAULT_LANG;
    }
    this.translations = {};
    this.loaded = false;
  }

  async init() {
    await this.loadTranslations(this.currentLang);
    this.applyTranslations();
    this.setupLanguageSelectors();
  }

  async loadTranslations(lang) {
    try {
      // Look in locales/ or client/locales/
      const basePath = window.location.pathname.includes('/client/') ? 'locales/' : 'locales/';
      const res = await fetch(`${basePath}${lang}.json`);
      if (res.ok) {
        this.translations = await res.json();
        this.currentLang = lang;
        this.loaded = true;
      } else {
        // Try fallback path if running under subfolder
        const altRes = await fetch(`/locales/${lang}.json`);
        if (altRes.ok) {
          this.translations = await altRes.json();
          this.currentLang = lang;
          this.loaded = true;
        }
      }
    } catch (err) {
      console.warn(`[i18n] Failed to load locale ${lang}:`, err.message);
    }
  }

  t(key, fallback = '') {
    if (!key) return fallback;
    const parts = key.split('.');
    let cur = this.translations;
    for (const p of parts) {
      if (cur && typeof cur === 'object' && p in cur) {
        cur = cur[p];
      } else {
        return fallback || key;
      }
    }
    return typeof cur === 'string' ? cur : (fallback || key);
  }

  async setLanguage(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    this.currentLang = lang;
    localStorage.setItem('mhm_lang', lang);
    document.documentElement.lang = lang;

    // Apply Indic typography class if needed
    document.body.classList.remove('lang-te', 'lang-hi', 'lang-ta', 'lang-en');
    document.body.classList.add(`lang-${lang}`);

    await this.loadTranslations(lang);
    this.applyTranslations();

    // Sync all language dropdowns on page
    document.querySelectorAll('.lang-selector').forEach(sel => {
      sel.value = lang;
    });

    // Notify listeners
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
  }

  applyTranslations() {
    document.documentElement.lang = this.currentLang;

    // Elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation && translation !== key) {
        el.textContent = translation;
      }
    });

    // Inputs with data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation && translation !== key) {
        el.placeholder = translation;
      }
    });

    // Elements with data-i18n-title
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      const translation = this.t(key);
      if (translation && translation !== key) {
        el.title = translation;
      }
    });
  }

  setupLanguageSelectors() {
    document.querySelectorAll('.lang-selector').forEach(select => {
      select.value = this.currentLang;
      select.addEventListener('change', (e) => {
        this.setLanguage(e.target.value);
      });
    });
  }
}

export const i18n = new I18nManager();
window.i18n = i18n;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => i18n.init());
} else {
  i18n.init();
}
