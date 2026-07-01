export function getToken() {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)token=([^;]*)/);
  return match ? match[1] : null;
}

export function playMsgSound() {
  if (typeof window === 'undefined') return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 520;
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch {}
}

export function pushNotify(title, body) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.svg' });
  }
}

export function setFaviconBadge(count) {
  const c = document.querySelector('link[rel="icon"]') || document.createElement('link');
  c.rel = 'icon';
  if (count > 0) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" fill="#1e1e2e"/><text x="16" y="22" text-anchor="middle" font-size="14" font-weight="bold" fill="#f38ba8">${count > 9 ? '9+' : count}</text></svg>`;
    c.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
  } else {
    c.href = '/favicon.svg';
  }
  document.head.appendChild(c);
}

export function getTheme() {
  if (typeof localStorage === 'undefined') return 'dark';
  try { return localStorage.getItem('chat-theme') || 'dark'; } catch { return 'dark'; }
}
