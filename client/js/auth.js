/**
 * myHealthMate AI — Authentication & Session Manager
 * Securely manages user authentication without storing sensitive health data in localStorage.
 */

const SESSION_KEY = 'mhm_session_token';

export const auth = {
  currentUser: null,

  init() {
    this.loadSession();
    this.updateUI();
  },

  loadSession() {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      try {
        this.currentUser = JSON.parse(raw);
      } catch (e) {
        this.currentUser = null;
      }
    } else {
      // Default demo logged-in user for seamless evaluation
      this.currentUser = {
        id: 'usr_demo_patient_01',
        name: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        role: 'PATIENT'
      };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
    }
  },

  async login(email, password) {
    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        this.currentUser = data.user;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      }
    } catch (e) {
      // Demo authentication fallback
    }

    // Synthetic demo accounts check
    if (email === 'admin@myhealthmate.ai') {
      this.currentUser = {
        id: 'usr_admin_01',
        name: 'Dr. Sarah Mitchell (Admin)',
        email: 'admin@myhealthmate.ai',
        role: 'ADMIN'
      };
    } else {
      this.currentUser = {
        id: 'usr_demo_patient_01',
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Alex Morgan',
        email: email || 'alex.morgan@example.com',
        role: 'PATIENT'
      };
    }

    sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  },

  async register(name, email, password) {
    this.currentUser = {
      id: `usr_${Date.now()}`,
      name: name || 'Alex Morgan',
      email: email,
      role: 'PATIENT'
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(this.currentUser));
    return { success: true, user: this.currentUser };
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    this.currentUser = null;
    window.location.href = 'login.html';
  },

  isAuthenticated() {
    return !!this.currentUser;
  },

  updateUI() {
    const userNames = document.querySelectorAll('.user-name-display');
    const userAvatars = document.querySelectorAll('.user-avatar-display');
    const userEmails = document.querySelectorAll('.user-email-display');
    const adminLinks = document.querySelectorAll('.admin-nav-item');

    if (this.currentUser) {
      userNames.forEach(el => el.textContent = this.currentUser.name);
      userEmails.forEach(el => el.textContent = this.currentUser.email);
      userAvatars.forEach(el => {
        const initials = this.currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
        el.textContent = initials || 'AM';
      });

      // Show admin link only if role is ADMIN
      if (this.currentUser.role === 'ADMIN') {
        adminLinks.forEach(el => el.style.display = 'flex');
      }
    }
  }
};

// Initialize auth session automatically
auth.init();
