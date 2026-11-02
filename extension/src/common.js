// Shared helpers used by background, popup, options and blocked page.
export const DEFAULTS = {
  blocklist: [], focusUntil: 0, stats: {},
  schedule: { enabled: false, days: [1,2,3,4,5], start: '09:00', end: '17:00' }, // Pro
  passwordHash: '', // Pro
  allowlistMode: false, allowlist: [] // Pro
};
export async function getState() {
  const s = await chrome.storage.local.get(Object.keys(DEFAULTS));
  return { ...DEFAULTS, ...s };
}
export function normalizeDomain(input) {
  let s = String(input || '').trim().toLowerCase();
  if (!s) return '';
  try { if (!/^https?:\/\//.test(s)) s = 'http://' + s; s = new URL(s).hostname; } catch { return ''; }
  s = s.replace(/^www\./, '');
  return /^[a-z0-9.-]+\.[a-z]{2,}$/.test(s) ? s : '';
}
export function todayKey(d = new Date()) { return d.toISOString().slice(0, 10); }
export function inSchedule(schedule, now = new Date()) {
  if (!schedule.days.includes(now.getDay())) return false;
  const m = now.getHours() * 60 + now.getMinutes();
  const [sh, sm] = schedule.start.split(':').map(Number), [eh, em] = schedule.end.split(':').map(Number);
  const a = sh * 60 + sm, b = eh * 60 + em;
  return a <= b ? m >= a && m < b : m >= a || m < b; // supports overnight ranges
}
export async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
