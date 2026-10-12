/**
 * myHealthMate AI — Upgraded AI Assistant Controller
 * Features: Real backend integration, conversation history persistence,
 * multilingual communication (en, te, hi, ta), copy response, retry, and emergency alerts.
 */

import { api } from './api.js';
import { i18n } from './i18n.js';
import { showToast } from './main.js';

let currentConversationId = null;
let lastUserMessage = '';

document.addEventListener('DOMContentLoaded', async () => {
  setupChatHandlers();
  setupSuggestionChips();
  setupMobileDrawer();
  await loadConversations();
});

function setupMobileDrawer() {
  const toggleBtn = document.getElementById('toggle-history-btn');
  const sidebar = document.getElementById('chat-sidebar');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('active-mobile');
    });
  }

  const newConvBtn = document.getElementById('new-conversation-btn');
  if (newConvBtn) {
    newConvBtn.addEventListener('click', () => {
      startNewConversation();
    });
  }
}

async function loadConversations() {
  const listContainer = document.getElementById('conversation-list');
  if (!listContainer) return;

  try {
    const res = await api.getChatConversations();
    const conversations = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);

    listContainer.innerHTML = '';

    if (conversations.length === 0) {
      listContainer.innerHTML = `<li style="padding: 10px; font-size: 0.8rem; color: var(--text-muted);">No saved chats yet. Start a conversation below!</li>`;
      return;
    }

    conversations.forEach(conv => {
      const li = document.createElement('li');
      li.className = 'conv-item-wrapper' + (conv.id === currentConversationId ? ' active' : '');
      li.id = `conv-item-${conv.id}`;

      li.innerHTML = `
        <button class="conv-item-btn" title="${conv.title}">
          ${conv.title || 'Health Consultation'}
        </button>
        <button class="conv-delete-btn" title="Delete Conversation" aria-label="Delete conversation">&times;</button>
      `;

      li.querySelector('.conv-item-btn').addEventListener('click', () => {
        selectConversation(conv.id);
      });

      li.querySelector('.conv-delete-btn').addEventListener('click', async (e) => {
        e.stopPropagation();
        await handleDeleteConversation(conv.id);
      });

      listContainer.appendChild(li);
    });
  } catch (err) {
    console.warn('[assistant] Error loading conversation list:', err);
  }
}

async function selectConversation(convId) {
  currentConversationId = convId;

  // Highlight active item
  document.querySelectorAll('.conv-item-wrapper').forEach(el => el.classList.remove('active'));
  const activeEl = document.getElementById(`conv-item-${convId}`);
  if (activeEl) activeEl.classList.add('active');

  // Close mobile sidebar if open
  const sidebar = document.getElementById('chat-sidebar');
  if (sidebar) sidebar.classList.remove('active-mobile');

  // Load messages
  const msgContainer = document.getElementById('chat-messages');
  if (!msgContainer) return;

  msgContainer.innerHTML = '';

  try {
    const res = await api.getChatMessages(convId);
    const data = (res && res.data) ? res.data : res;
    const messages = data.messages || [];

    if (messages.length === 0) {
      renderWelcomeBubble();
      return;
    }

    messages.forEach(m => {
      const sender = m.sender === 'USER' ? 'user' : 'bot';
      appendMessage(m.content, sender, {
        isEmergencyAlert: m.isEmergencyAlert,
        createdAt: m.createdAt
      });
    });
  } catch (err) {
    console.error('[assistant] Error fetching conversation messages:', err);
    renderWelcomeBubble();
  }
}

function startNewConversation() {
  currentConversationId = null;
  document.querySelectorAll('.conv-item-wrapper').forEach(el => el.classList.remove('active'));

  const msgContainer = document.getElementById('chat-messages');
  if (msgContainer) {
    msgContainer.innerHTML = '';
    renderWelcomeBubble();
  }

  const sidebar = document.getElementById('chat-sidebar');
  if (sidebar) sidebar.classList.remove('active-mobile');

  showToast('New Consultation', 'Started a fresh consultation session.', 'info');
}

async function handleDeleteConversation(convId) {
  if (!confirm('Are you sure you want to delete this conversation?')) return;

  try {
    await api.deleteChatConversation(convId);
    if (currentConversationId === convId) {
      startNewConversation();
    }
    await loadConversations();
    showToast('Deleted', 'Conversation removed successfully.', 'info');
  } catch (err) {
    showToast('Error', 'Failed to delete conversation.', 'error');
  }
}

function setupChatHandlers() {
  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');

  if (!form || !input) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;

    lastUserMessage = text;
    appendMessage(text, 'user');
    input.value = '';

    if (sendBtn) sendBtn.disabled = true;
    input.disabled = true;

    const typingIndicator = appendTypingIndicator();

    try {
      const lang = i18n.currentLang || 'en';
      const response = await api.sendChatMessage(text, currentConversationId, lang);

      typingIndicator.remove();
      if (sendBtn) sendBtn.disabled = false;
      input.disabled = false;
      input.focus();

      if (response && response.conversationId) {
        currentConversationId = response.conversationId;
      }

      const reply = response.reply || (response.data && response.data.reply) || 'Thank you for your question. Always review lab parameters with your clinician.';
      appendMessage(reply, 'bot', {
        isEmergencyAlert: response.isEmergencyAlert,
        mode: response.mode,
        provider: response.provider,
        isError: response.isError
      });

      // Refresh conversations list to update title and message count
      loadConversations();
    } catch (err) {
      typingIndicator.remove();
      if (sendBtn) sendBtn.disabled = false;
      input.disabled = false;

      appendMessage(`⚠️ Connection error: ${err.message || 'Unable to communicate with assistant'}. Please try again.`, 'bot', {
        isError: true
      });
    }
  });

  // Allow Enter key to submit
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      form.dispatchEvent(new Event('submit'));
    }
  });
}

function setupSuggestionChips() {
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const input = document.getElementById('chat-input');
      if (input) {
        input.value = chip.textContent.trim();
        document.getElementById('chat-form').dispatchEvent(new Event('submit'));
      }
    });
  });
}

function renderWelcomeBubble() {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot';
  bubble.innerHTML = `
    <div class="chat-avatar bot" title="myHealthMate AI">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    </div>
    <div class="chat-text">
      <div class="mode-indicator-tag">
        <span>✨</span> <span>AI Health Companion</span>
      </div>
      Hello! I am your <strong>myHealthMate AI Health Companion</strong>.<br><br>
      I can help you understand medical laboratory terminology, explore standard biological reference ranges, and formulate helpful questions for your next physician consultation.<br><br>
      <em>How can I assist your health literacy today?</em>
    </div>
  `;
  container.appendChild(bubble);
}

function appendMessage(text, sender, meta = {}) {
  const container = document.getElementById('chat-messages');
  if (!container) return;

  const bubble = document.createElement('div');
  bubble.className = `chat-bubble ${sender} chat-msg-animated`;

  const isBot = sender === 'bot';
  const avatarHtml = isBot
    ? `<div class="chat-avatar bot" title="myHealthMate AI">
         <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
           <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
         </svg>
       </div>`
    : `<div class="chat-avatar user" title="You">AM</div>`;

  // Markdown rendering for headers, bold, bullet points
  let formatted = text
    .replace(/\n\n/g, '<br><br>')
    .replace(/### (.*?)(<br>|$)/g, '<h4 style="color: var(--accent-cyan); margin: 6px 0;">$1</h4>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/• (.*?)(<br>|$)/g, '<div style="margin-left: 12px; margin-bottom: 4px;">• $1</div>');

  // Emergency styling if applicable
  const emergencyStyle = meta.isEmergencyAlert
    ? 'border: 2px solid var(--accent-danger); background: rgba(239, 68, 68, 0.15);'
    : '';

  // Mode badge
  let modeBadgeHtml = '';
  if (isBot) {
    if (meta.mode === 'REAL_AI') {
      modeBadgeHtml = `<div class="mode-indicator-tag" style="color: var(--accent-cyan);"><span>🤖</span> Live AI Model (${meta.provider || 'gpt-4o-mini'})</div>`;
    } else {
      modeBadgeHtml = `<div class="mode-indicator-tag"><span>🧪</span> Educational Demonstration Engine</div>`;
    }
  }

  // Action buttons (Copy and Retry)
  let actionsHtml = '';
  if (isBot) {
    actionsHtml = `
      <div class="chat-bubble-actions">
        <button class="chat-action-btn copy-msg-btn" title="Copy response to clipboard">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          ${i18n.t('assistant.copy', 'Copy')}
        </button>
        ${meta.isError ? `
          <button class="chat-action-btn retry-msg-btn" style="color: var(--accent-amber);">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            ${i18n.t('assistant.retry', 'Retry')}
          </button>
        ` : ''}
      </div>
    `;
  }

  bubble.innerHTML = `
    ${avatarHtml}
    <div class="chat-text" style="${emergencyStyle}">
      ${modeBadgeHtml}
      <div>${formatted}</div>
      ${actionsHtml}
    </div>
  `;

  // Attach copy handler
  const copyBtn = bubble.querySelector('.copy-msg-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      // Strip markdown syntax for clean copying
      const plainText = text.replace(/###/g, '').replace(/\*\*/g, '').replace(/•/g, '-');
      if (navigator.clipboard) {
        navigator.clipboard.writeText(plainText).then(() => {
          showToast('Copied', i18n.t('assistant.copied', 'Response copied to clipboard!'), 'success');
        });
      }
    });
  }

  // Attach retry handler
  const retryBtn = bubble.querySelector('.retry-msg-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      if (lastUserMessage) {
        const input = document.getElementById('chat-input');
        if (input) {
          input.value = lastUserMessage;
          document.getElementById('chat-form').dispatchEvent(new Event('submit'));
        }
      }
    });
  }

  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

function appendTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const bubble = document.createElement('div');
  bubble.className = 'chat-bubble bot typing-bubble chat-msg-animated';
  bubble.innerHTML = `
    <div class="chat-avatar bot avatar-thinking-pulse" title="myHealthMate AI">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    </div>
    <div class="chat-text" style="display: flex; gap: 8px; align-items: center; padding: 12px 18px;">
      <div class="typing-dots">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
      <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 4px;">${i18n.t('assistant.analyzing', 'Analyzing clinical terminology...')}</span>
    </div>
  `;
  container.appendChild(bubble);
  container.scrollTop = container.scrollHeight;
  return bubble;
}

// React to language switch
window.addEventListener('languageChanged', (e) => {
  const lang = e.detail?.lang || 'en';
  // Update suggestions chips
  document.querySelectorAll('.prompt-chip').forEach(chip => {
    const key = chip.getAttribute('data-i18n');
    if (key) chip.textContent = i18n.t(key);
  });
});
