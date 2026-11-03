import { getState, inSchedule, todayKey } from './common.js';
import { isPro, revalidate } from './licensing.js';

// Decide whether blocking should be active right now, then rewrite the dynamic rules.
// Calls are queued so two overlapping updates (e.g. a storage change plus an alarm) can't both
// read the old rules and then add duplicate rule IDs ("Rule with id 1 does not have a unique ID").
let queue = Promise.resolve();
export function applyRules() {
  queue = queue.then(applyRulesNow, applyRulesNow);
  return queue;
}
async function applyRulesNow() {
  const s = await getState();
  const pro = await isPro();
  const focusing = s.focusUntil > Date.now();
  let active = true;
  if (pro && s.schedule.enabled && !focusing) active = inSchedule(s.schedule);
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  let addRules = [];
  if (active && pro && s.allowlistMode) {
    // Allowlist-only: redirect every http(s) page, except higher-priority 'allow' rules for allowlisted domains.
    addRules.push({ id: 1, priority: 1,
      action: { type: 'redirect', redirect: { extensionPath: '/blocked.html?d=allowlist' } },
      condition: { regexFilter: '^https?://', resourceTypes: ['main_frame'] } });
    s.allowlist.slice(0, 4000).forEach((d, i) => addRules.push({ id: i + 2, priority: 2, action: { type: 'allow' },
      condition: { requestDomains: [d], resourceTypes: ['main_frame'] } }));
  } else if (active) {
    // Chrome caps redirect ("unsafe") dynamic rules at 5000; extra entries are ignored rather than failing the whole update.
    const cap = chrome.declarativeNetRequest.MAX_NUMBER_OF_UNSAFE_DYNAMIC_RULES || 5000;
    addRules = s.blocklist.slice(0, cap).map((d, i) => ({
      id: i + 1, priority: 1,
      action: { type: 'redirect', redirect: { extensionPath: '/blocked.html?d=' + encodeURIComponent(d) } },
      condition: { urlFilter: '||' + d, resourceTypes: ['main_frame'] }
    }));
  }
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: existing.map(r => r.id), addRules });
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create('tick', { periodInMinutes: 1 }); // re-evaluates schedules
  chrome.alarms.create('license', { periodInMinutes: 1440 }); // daily licence revalidation
  await applyRules();
});
chrome.runtime.onStartup.addListener(applyRules);
chrome.alarms.onAlarm.addListener(async a => {
  if (a.name === 'license') return revalidate();
  if (a.name === 'focusEnd') await chrome.storage.local.set({ focusUntil: 0 });
  await applyRules();
});
chrome.storage.onChanged.addListener((c, area) => {
  if (area === 'local' && (c.blocklist || c.schedule || c.focusUntil || c.license || c.allowlistMode || c.allowlist)) applyRules();
  if (area === 'local' && SYNC_KEYS.some(k => c[k])) pushSync();
  if (area === 'sync') pullSync();
});
chrome.runtime.onMessage.addListener((msg, _s, reply) => {
  if (msg.type === 'blocked') {
    (async () => {
      const { stats = {} } = await chrome.storage.local.get('stats');
      const k = todayKey(); stats[k] = (stats[k] || 0) + 1;
      await chrome.storage.local.set({ stats }); reply({ ok: true });
    })();
    return true;
  }
  if (msg.type === 'startFocus') {
    const until = Date.now() + msg.minutes * 60000;
    chrome.storage.local.set({ focusUntil: until });
    chrome.alarms.create('focusEnd', { when: until });
    reply({ until });
  }
});

// Pro sync: settings are mirrored to chrome.storage.sync (Chrome's own sync, via the user's Google account).
// Stats and the password hash stay local. Last write wins; JSON comparison prevents ping-pong loops.
// Quotas: 8192 bytes per item, 102400 total, 512 items. Large values are split into chunks
// ("blocklist" = {__chunks:n}, "blocklist#0".."blocklist#n-1"). If a write still fails (total quota),
// settings stay on this device and local "syncNotice" explains why (shown in Options).
const SYNC_KEYS = ['blocklist', 'schedule', 'allowlistMode', 'allowlist'];
export const CHUNK = 7000; // chars per chunk; leaves headroom under 8192 bytes for key + JSON quoting
const ckey = (k, i) => k + '#' + i;
export async function syncWrite(key, value) {
  const json = JSON.stringify(value);
  const prev = await chrome.storage.sync.get(key);
  const oldN = prev[key]?.__chunks || 0;
  let items;
  if (json.length <= CHUNK) items = { [key]: value };
  else {
    const n = Math.ceil(json.length / CHUNK); items = {};
    for (let i = 0; i < n; i++) items[ckey(key, i)] = json.slice(i * CHUNK, (i + 1) * CHUNK);
    items[key] = { __chunks: n };
  }
  await chrome.storage.sync.set(items); // throws on quota errors
  const n = items[key]?.__chunks || 0, stale = [];
  for (let i = n; i < oldN; i++) stale.push(ckey(key, i));
  if (stale.length) await chrome.storage.sync.remove(stale);
}
export async function syncRead(keys) {
  const raw = await chrome.storage.sync.get(keys), out = {};
  for (const k of keys) {
    if (!(k in raw)) continue;
    const v = raw[k];
    if (v && typeof v === 'object' && v.__chunks) {
      const parts = await chrome.storage.sync.get([...Array(v.__chunks).keys()].map(i => ckey(k, i)));
      try { out[k] = JSON.parse([...Array(v.__chunks).keys()].map(i => parts[ckey(k, i)] ?? '').join('')); } catch {} // partial sync in flight: skip
    } else out[k] = v;
  }
  return out;
}
async function pushSync() {
  if (!(await isPro())) return;
  const local = await chrome.storage.local.get(SYNC_KEYS), remote = await syncRead(SYNC_KEYS);
  const keys = SYNC_KEYS.filter(k => k in local && JSON.stringify(local[k]) !== JSON.stringify(remote[k]));
  try {
    for (const k of keys) await syncWrite(k, local[k]);
    const { syncNotice } = await chrome.storage.local.get('syncNotice');
    if (syncNotice) await chrome.storage.local.remove('syncNotice');
  } catch (e) {
    await chrome.storage.local.set({ syncNotice: 'Your lists are too large for Chrome sync, so they are saved on this device only. Blocking still works. (' + (e?.message || e) + ')' });
  }
}
export async function pullSync() {
  if (!(await isPro())) return;
  const local = await chrome.storage.local.get(SYNC_KEYS), remote = await syncRead(SYNC_KEYS);
  const diff = Object.fromEntries(SYNC_KEYS.filter(k => k in remote && JSON.stringify(local[k]) !== JSON.stringify(remote[k])).map(k => [k, remote[k]]));
  if (Object.keys(diff).length) await chrome.storage.local.set(diff);
}
chrome.runtime.onStartup.addListener(pullSync);
self.applyRules = applyRules; self.pullSync = pullSync; self.syncRead = syncRead; // exposed for tests/e2e.js
