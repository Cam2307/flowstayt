import { getState, normalizeDomain, todayKey } from './common.js';
import { isPro } from './licensing.js';
const $ = id => document.getElementById(id);
async function render() {
  const s = await getState();
  $('list').innerHTML = '';
  for (const d of s.blocklist) {
    const li = document.createElement('li'); li.textContent = d;
    // Removing is done from the options page so the Pro password lock can protect it.
    $('list').append(li);
  }
  $('upgrade').hidden = await isPro();
  $('today').textContent = s.stats[todayKey()] || 0;
  $('focus').textContent = s.focusUntil > Date.now() ? 'Focusing until ' + new Date(s.focusUntil).toLocaleTimeString() : '';
}
async function add(raw) {
  const d = normalizeDomain(raw); if (!d) return alert('Enter a valid site, e.g. reddit.com');
  const { blocklist = [] } = await chrome.storage.local.get('blocklist');
  if (!blocklist.includes(d)) await chrome.storage.local.set({ blocklist: [...blocklist, d] });
  render();
}
$('add').onclick = () => { add($('site').value); $('site').value = ''; };
$('site').onkeydown = e => { if (e.key === 'Enter') $('add').click(); };
$('blockCurrent').onclick = async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); // url readable via host permission
  if (tab?.url) add(tab.url);
};
document.querySelectorAll('[data-min]').forEach(b => b.onclick = () =>
  chrome.runtime.sendMessage({ type: 'startFocus', minutes: +b.dataset.min }, render));
render();
