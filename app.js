const API_BASE = (() => {
  const override = localStorage.getItem('API_BASE');
  if (override && /^https?:\/\//i.test(override)) {
    return override.replace(/\/$/, '');
  }

  // Prefer same-origin API when served by Vite on :3000 (proxy -> backend :5000)
  if (window.location.port === '3000') {
    return '/api';
  }

  return 'http://localhost:5000/api';
})();

const SCREENS = {
  campaign: { title: 'New Campaign', bc: 'Campaign Setup' },
  call: { title: 'Live Call', bc: 'Call Screen' },
  dashboard: { title: 'Dashboard', bc: 'Overview' },
  analytics: { title: 'Call Analytics', bc: 'Analytics' },
  insights: { title: 'Customer Feel', bc: 'Insights' }
};

const state = {
  timerInterval: null,
  activeSessionId: null,
  activeSessionStartedAt: null,
  transcriptPoller: null,
  livePoller: null,
  queuePoller: null,
  uploadedNumbers: [],
  activeCampaignId: null,
  renderedMessageIds: new Set(),
  campaignDisplayName: 'Organization Admin',
};

async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`API ${response.status}: ${text}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return await response.json();
    }

    return await response.text();
  } catch (error) {
    console.error('API Error:', error.message);
    return null;
  }
}

function enterApp(screen) {
  const gate = document.getElementById('landing-gate');
  const app = document.getElementById('app-shell');
  closeModal();
  gate.classList.add('fade-out');
  setTimeout(() => {
    gate.style.display = 'none';
    app.classList.remove('hidden');
    app.classList.add('entering');
    go(screen || 'dashboard');
    setTimeout(() => app.classList.remove('entering'), 400);
  }, 480);
}

function openModal() { document.getElementById('start-modal').classList.add('open'); }
function closeModal() { document.getElementById('start-modal').classList.remove('open'); }
function handleModalClick(e) { if (e.target === document.getElementById('start-modal')) closeModal(); }

function stopLivePolling() {
  if (state.transcriptPoller) clearInterval(state.transcriptPoller);
  if (state.livePoller) clearInterval(state.livePoller);
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.transcriptPoller = null;
  state.livePoller = null;
  state.timerInterval = null;
}

function go(screen) {
  if (!SCREENS[screen]) return;

  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));

  const el = document.getElementById(`screen-${screen}`);
  if (el) el.classList.add('active');

  const nav = document.getElementById(`nav-${screen}`);
  if (nav) nav.classList.add('active');

  document.getElementById('topbar-title').textContent = SCREENS[screen].title;
  document.getElementById('bc-page').textContent = SCREENS[screen].bc;

  if (screen !== 'call') {
    stopLivePolling();
  }

  if (screen === 'dashboard') loadDashboard();
  if (screen === 'analytics') loadAnalytics();
  if (screen === 'campaign') loadCampaigns();
  if (screen === 'call') initCallScreen();
}

function formatDuration(sec) {
  const s = Number(sec || 0);
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const rem = String(s % 60).padStart(2, '0');
  return `${m}:${rem}`;
}

function updateCallTimer() {
  const timerEl = document.getElementById('call-timer');
  if (!timerEl) return;
  if (!state.activeSessionStartedAt) {
    timerEl.textContent = '00:00';
    return;
  }

  const elapsed = Math.max(0, Math.floor((Date.now() - new Date(state.activeSessionStartedAt).getTime()) / 1000));
  timerEl.textContent = formatDuration(elapsed);
}

function setLiveStatusUI(isLive) {
  const badge = document.querySelector('.cbadge.live');
  const sideBadge = document.querySelector('.intel-card .live-badge');

  if (badge) {
    badge.innerHTML = isLive ? '<span class="pdot"></span> Live' : 'No Live Session';
    badge.style.background = isLive ? '' : '#e2e8f0';
    badge.style.color = isLive ? '' : '#334155';
  }

  if (sideBadge) {
    sideBadge.textContent = isLive ? 'Live' : 'No Live Session';
    sideBadge.style.background = isLive ? '' : '#e2e8f0';
    sideBadge.style.color = isLive ? '' : '#334155';
  }
}

function setCallHeader(name) {
  const displayName = name || 'Organization Admin';
  const nameNode = document.querySelector('.caller-name');
  const coNode = document.querySelector('.caller-co');
  const avatarNode = document.querySelector('.caller-av');

  if (nameNode) nameNode.textContent = displayName;
  if (coNode) coNode.textContent = `${displayName} · Verified Outbound Calls`;
  if (avatarNode) {
    const initials = displayName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'AI';
    avatarNode.textContent = initials;
  }
}

function resetTimeline() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;
  timeline.innerHTML = `
    <div class="tl-item pending">
      <div class="tl-dot pending"></div>
      <div class="tl-text"><span>No live session as of now</span><span class="tl-time">—</span></div>
    </div>
  `;
}

function clearChatWindow() {
  const chatWin = document.getElementById('chat-win');
  if (!chatWin) return;
  chatWin.innerHTML = '<div class="msg ai" id="no-live-message"><div class="msg-av">??</div><div class="msg-bubble">No live session as of now.</div><div class="msg-time">--:--</div></div>';
  state.renderedMessageIds.clear();
}

function appendChatMessage(msg) {
  const chatWin = document.getElementById('chat-win');
  if (!chatWin || !msg) return;
  const id = msg.id || `${msg.speaker}-${msg.timestamp}-${msg.text}`;
  if (state.renderedMessageIds.has(id)) return;
  state.renderedMessageIds.add(id);

  const noLive = document.getElementById('no-live-message');
  if (noLive) noLive.remove();

  const item = document.createElement('div');
  const isAI = msg.speaker === 'ai';
  item.className = `msg ${isAI ? 'ai' : 'human'}`;
  item.innerHTML = isAI
    ? `<div class="msg-av">??</div><div class="msg-bubble">${esc(msg.text || '')}</div><div class="msg-time">${timeFromISO(msg.timestamp)}</div>`
    : `<div class="msg-time">${timeFromISO(msg.timestamp)}</div><div class="msg-bubble">${esc(msg.text || '')}</div><div class="msg-av">CU</div>`;

  chatWin.appendChild(item);
  chatWin.scrollTop = chatWin.scrollHeight;
}

function timeFromISO(ts) {
  if (!ts) return '--:--';
  const d = new Date(ts);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

async function refreshTranscript() {
  if (!state.activeSessionId) return;
  const data = await apiCall(`/call/${state.activeSessionId}/transcript`, { method: 'GET' });
  if (!data || !Array.isArray(data.messages)) return;
  data.messages.forEach(appendChatMessage);
}

async function refreshLiveSession() {
  const data = await apiCall('/call/live', { method: 'GET' });
  if (!data) return;

  if (!data.hasLiveSession || !Array.isArray(data.live) || data.live.length === 0) {
    state.activeSessionId = null;
    state.activeSessionStartedAt = null;
    setLiveStatusUI(false);
    clearChatWindow();
    updateCallTimer();
    return;
  }

  const session = data.live[0];
  state.activeSessionId = session.callSid || session.id;
  state.activeSessionStartedAt = session.startedAt || session.updatedAt;
  setLiveStatusUI(true);
  updateCallTimer();
  await refreshTranscript();
}

function initCallScreen() {
  setCallHeader(state.campaignDisplayName);
  resetTimeline();
  clearChatWindow();
  setLiveStatusUI(false);
  updateCallTimer();

  refreshLiveSession();

  if (!state.livePoller) {
    state.livePoller = setInterval(refreshLiveSession, 3000);
  }

  if (!state.transcriptPoller) {
    state.transcriptPoller = setInterval(refreshTranscript, 2000);
  }

  if (!state.timerInterval) {
    state.timerInterval = setInterval(updateCallTimer, 1000);
  }
}

function setMetricCard(index, value, subtitle) {
  const cards = document.querySelectorAll('#screen-dashboard .metric-card');
  const card = cards[index];
  if (!card) return;
  const valueNode = card.querySelector('.mv');
  const subtitleNode = card.querySelector('.mc');
  if (valueNode) valueNode.textContent = value;
  if (subtitleNode) subtitleNode.textContent = subtitle;
}

async function loadDashboard() {
  const analytics = await apiCall('/analytics', { method: 'GET' });
  if (!analytics) return;

  const avgText = formatDuration(analytics.avgDurationSec || 0);
  setMetricCard(0, String(analytics.totalCalls || 0), `${analytics.hasLiveSession ? 'Live session running' : 'No live session as of now'}`);
  setMetricCard(1, `${analytics.conversionRate || 0}%`, `${analytics.conversions || 0} converted calls`);
  setMetricCard(2, avgText, 'Average completed call duration');
  setMetricCard(3, String(analytics.liveCount || 0), 'Live calls right now');

  const feed = document.querySelector('#screen-dashboard .act-feed');
  if (feed) {
    feed.innerHTML = '';
    const items = analytics.recentMessages || [];
    if (items.length === 0) {
      feed.innerHTML = '<div class="ai-item"><div class="ai-txt"><span class="an">No call activity yet</span><div class="at">Start a campaign to see activity.</div></div></div>';
    } else {
      items.slice(0, 8).forEach((item) => {
        const row = document.createElement('div');
        row.className = 'ai-item';
        row.innerHTML = `<div class="ai-av" style="background:#dbeafe;color:#2563eb">${item.speaker === 'ai' ? 'AI' : 'CU'}</div><div class="ai-txt"><span class="an">${item.speaker === 'ai' ? 'AI Agent' : 'Customer'}</span> � ${esc(item.text || '')}<div class="at">${timeFromISO(item.timestamp)}</div></div>`;
        feed.appendChild(row);
      });
    }
  }
}

async function loadAnalytics() {
  const analytics = await apiCall('/analytics', { method: 'GET' });
  if (!analytics) return;

  const cards = document.querySelectorAll('#screen-analytics .an-stat .as-val');
  if (cards[0]) cards[0].textContent = String(analytics.totalCalls || 0);
  if (cards[1]) cards[1].textContent = formatDuration(analytics.avgDurationSec || 0);
  if (cards[2]) cards[2].textContent = String(analytics.conversions || 0);
  if (cards[3]) cards[3].textContent = String(analytics.liveCount || 0);
}

async function loadCampaigns() {
  const campaigns = await apiCall('/campaign', { method: 'GET' });
  if (!Array.isArray(campaigns)) return;
  console.log('Campaigns loaded:', campaigns.length);
}

async function saveCampaign(campaignData) {
  return await apiCall('/campaign', {
    method: 'POST',
    body: JSON.stringify(campaignData),
  });
}

async function startCampaignQueue(campaignId, phoneNumbers) {
  return await apiCall('/campaign/start', {
    method: 'POST',
    body: JSON.stringify({ campaignId, phoneNumbers }),
  });
}

async function pollQueueStatus() {
  if (!state.activeCampaignId) return;
  const queue = await apiCall(`/campaign/${state.activeCampaignId}/queue`, { method: 'GET' });
  if (!queue) return;

  const status = document.getElementById('upload-status');
  if (status) {
    status.textContent = `Queue: ${queue.status} | pending: ${queue.pending.length} | completed: ${queue.completed.length} | failed: ${queue.failed.length}`;
  }

  if (queue.status === 'completed' || queue.status === 'failed') {
    clearInterval(state.queuePoller);
    state.queuePoller = null;
  }
}

function parseCsvContacts(text) {
  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) return [];

  const parsed = [];
  const normalize = (raw) => {
    const digitsOnly = String(raw || '').replace(/\D/g, '');
    if (!digitsOnly) return null;

    if (digitsOnly.length === 10) {
      return `+91${digitsOnly}`;
    }

    if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
      return `+${digitsOnly}`;
    }

    if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
      return `+${digitsOnly}`;
    }

    return null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const cols = lines[i].split(',').map((col) => col.trim());
    const maybe = cols.find((col) => /\d{10,15}/.test(col.replace(/\D/g, '')));
    if (!maybe) continue;
    const normalized = normalize(maybe);
    if (normalized) parsed.push(normalized);
  }

  return Array.from(new Set(parsed));
}

function setupCsvUpload() {
  const zone = document.getElementById('csv-upload-zone');
  const input = document.getElementById('csv-file-input');
  const browse = document.querySelector('#csv-upload-zone .upload-link');
  const status = document.getElementById('upload-status');

  if (!zone || !input || !browse) return;

  const handleFile = async (file) => {
    if (!file) return;
    const text = await file.text();
    const nums = parseCsvContacts(text);
    state.uploadedNumbers = nums;
    if (status) {
      status.textContent = nums.length > 0
        ? `${nums.length} contacts loaded from ${file.name}`
        : 'No valid phone numbers found in CSV';
    }
  };

  browse.addEventListener('click', (e) => {
    e.preventDefault();
    input.click();
  });

  input.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    await handleFile(file);
  });

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('drag-over');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('drag-over');
  });

  zone.addEventListener('drop', async (e) => {
    e.preventDefault();
    zone.classList.remove('drag-over');
    const file = e.dataTransfer?.files?.[0];
    await handleFile(file);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setupCsvUpload();

  const startBtn = document.getElementById('start-campaign-btn');
  if (startBtn) {
    startBtn.addEventListener('click', async (e) => {
      e.preventDefault();

      const businessName = document.querySelector('input[placeholder*="Acme"]')?.value?.trim();
      const productService = document.querySelector('input[placeholder*="Enterprise"]')?.value?.trim();
      const voiceRadio = document.querySelector('input[name="voice"]:checked');

      if (!businessName) {
        alert('Please enter business name.');
        return;
      }

      if (state.uploadedNumbers.length === 0) {
        alert('Upload a CSV with valid phone numbers before starting campaign.');
        return;
      }

      const campaign = await saveCampaign({
        businessName,
        productService,
        voice: voiceRadio?.id || 'v-alex',
        contactsCount: state.uploadedNumbers.length,
      });

      if (!campaign?.id) {
        alert('Campaign save failed.');
        return;
      }

      state.campaignDisplayName = businessName || 'Organization Admin';

      state.activeCampaignId = campaign.id;
      const queue = await startCampaignQueue(campaign.id, state.uploadedNumbers);
      if (!queue) {
        alert('Campaign queue start failed. Check backend logs/Twilio setup.');
        return;
      }

      go('call');
      setCallHeader(state.campaignDisplayName);
      await refreshLiveSession();

      if (!state.queuePoller) {
        state.queuePoller = setInterval(pollQueueStatus, 4000);
      }
    });
  }

  const previewCallBtn = document.getElementById('preview-call-btn');
  if (previewCallBtn) {
    previewCallBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (state.uploadedNumbers.length === 0) {
        alert('Upload CSV first to preview a real call target.');
        return;
      }

      const single = state.uploadedNumbers[0];
      const call = await apiCall('/call', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: single, sessionId: `preview_${Date.now()}` }),
      });

      if (!call) {
        alert('Preview call failed.');
        return;
      }

      go('call');
      setCallHeader(state.campaignDisplayName);
      await refreshLiveSession();
    });
  }

  const endBtn = document.querySelector('.ctrl.end');
  if (endBtn) {
    endBtn.addEventListener('click', async () => {
      stopLivePolling();
      go('analytics');
    });
  }

  window.addEventListener('load', async () => {
    const health = await apiCall('/health', { method: 'GET' });
    console.log(health?.status ? 'Backend connected' : 'Backend not reachable');
    loadDashboard();
  });
});

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
