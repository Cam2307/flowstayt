import { getState, inSchedule, todayKey } from './common.js';
import { isPro } from './licensing.js';

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
    s.allowlist.forEach((d, i) => addRules.push({ id: i + 2, priority: 2, action: { type: 'allow' },
      condition: { requestDomains: [d], resourceTypes: ['main_frame'] } }));
  } else if (active) {
    addRules = s.blocklist.map((d, i) => ({
      id: i + 1, priority: 1,
      action: { type: 'redirect', redirect: { extensionPath: '/blocked.html?d=' + encodeURIComponent(d) } },
      condition: { urlFilter: '||' + d, resourceTypes: ['main_frame'] }
    }));
  }
  await chrome.declarativeNetRequest.updateDynamicRules({ removeRuleIds: existing.map(r => r.id), addRules });
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.alarms.create('tick', { periodInMinutes: 1 }); // re-evaluates schedules
  await applyRules();
});
chrome.runtime.onStartup.addListener(applyRules);
chrome.alarms.onAlarm.addListener(async a => {
  if (a.name === 'focusEnd') await chrome.storage.local.set({ focusUntil: 0 });
  await applyRules();
});
chrome.storage.onChanged.addListener((c, area) => {
  if (area === 'local' && (c.blocklist || c.schedule || c.focusUntil || c.devPro || c.allowlistMode || c.allowlist)) applyRules();
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
const SYNC_KEYS = ['blocklist', 'schedule', 'allowlistMode', 'allowlist'];
async function pushSync() {
  if (!(await isPro())) return;
  const local = await chrome.storage.local.get(SYNC_KEYS), remote = await chrome.storage.sync.get(SYNC_KEYS);
  const diff = Object.fromEntries(SYNC_KEYS.filter(k => k in local && JSON.stringify(local[k]) !== JSON.stringify(remote[k])).map(k => [k, local[k]]));
  if (Object.keys(diff).length) await chrome.storage.sync.set(diff);
}
export async function pullSync() {
  if (!(await isPro())) return;
  const local = await chrome.storage.local.get(SYNC_KEYS), remote = await chrome.storage.sync.get(SYNC_KEYS);
  const diff = Object.fromEntries(SYNC_KEYS.filter(k => k in remote && JSON.stringify(local[k]) !== JSON.stringify(remote[k])).map(k => [k, remote[k]]));
  if (Object.keys(diff).length) await chrome.storage.local.set(diff);
}
chrome.runtime.onStartup.addListener(pullSync);
self.applyRules = applyRules; self.pullSync = pullSync; // exposed for tests/e2e.js
