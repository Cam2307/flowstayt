import { getState, normalizeDomain, todayKey, sha256 } from './common.js';
import { isPro } from './licensing.js';
const $ = id => document.getElementById(id);
const DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

async function render() {
  const s = await getState(), pro = await isPro();
  $('list').innerHTML = '';
  s.blocklist.forEach(d => {
    const li = document.createElement('li'); li.textContent = d;
    const b = document.createElement('button'); b.textContent = 'Remove'; b.className = 'secondary';
    b.onclick = async () => { await chrome.storage.local.set({ blocklist: s.blocklist.filter(x => x !== d) }); render(); };
    li.append(b); $('list').append(li);
  });
  $('stats').innerHTML = '';
  for (let i = 0; i < 7; i++) {
    const k = todayKey(new Date(Date.now() - i * 864e5));
    const li = document.createElement('li'); li.textContent = `${k}: ${s.stats[k] || 0} blocked`; $('stats').append(li);
  }
  $('alOn').checked = s.allowlistMode; $('alList').innerHTML = '';
  s.allowlist.forEach(d => {
    const li = document.createElement('li'); li.textContent = d;
    const b = document.createElement('button'); b.textContent = 'Remove'; b.className = 'secondary';
    b.onclick = async () => { await chrome.storage.local.set({ allowlist: s.allowlist.filter(x => x !== d) }); render(); };
    li.append(b); $('alList').append(li);
  });
  $('proBox').classList.toggle('locked', !pro); $('upsell').hidden = pro;
  $('devPro').checked = pro;
  $('schedOn').checked = s.schedule.enabled; $('start').value = s.schedule.start; $('end').value = s.schedule.end;
  $('days').innerHTML = DAY.map((n, i) => `<label><input type="checkbox" value="${i}" ${s.schedule.days.includes(i) ? 'checked' : ''}> ${n}</label>`).join('');
}
$('add').onclick = async () => {
  const d = normalizeDomain($('site').value); if (!d) return alert('Enter a valid site');
  const { blocklist = [] } = await chrome.storage.local.get('blocklist');
  if (!blocklist.includes(d)) await chrome.storage.local.set({ blocklist: [...blocklist, d] });
  $('site').value = ''; render();
};
$('alOn').onchange = e => chrome.storage.local.set({ allowlistMode: e.target.checked });
$('alAdd').onclick = async () => {
  const d = normalizeDomain($('alSite').value); if (!d) return alert('Enter a valid site');
  const { allowlist = [] } = await chrome.storage.local.get('allowlist');
  if (!allowlist.includes(d)) await chrome.storage.local.set({ allowlist: [...allowlist, d] });
  $('alSite').value = ''; render();
};
$('saveSched').onclick = async () => {
  const days = [...$('days').querySelectorAll('input:checked')].map(i => +i.value);
  await chrome.storage.local.set({ schedule: { enabled: $('schedOn').checked, days, start: $('start').value || '09:00', end: $('end').value || '17:00' } });
  alert('Schedule saved');
};
$('setPw').onclick = async () => {
  const v = $('newPw').value;
  await chrome.storage.local.set({ passwordHash: v ? await sha256(v) : '' });
  $('newPw').value = ''; alert(v ? 'Password set' : 'Password removed');
};
$('devPro').onchange = async e => { await chrome.storage.local.set({ devPro: e.target.checked }); render(); };
// TODO(payments): open the ExtensionPay payment page or Lemon Squeezy checkout here.
$('buy').onclick = () => alert('Payments not wired up yet. See src/licensing.js.');

(async () => {
  const s = await getState();
  if (s.passwordHash && await isPro()) {
    $('main').hidden = true; $('gate').hidden = false;
    $('unlock').onclick = async () => {
      if (await sha256($('pw').value) === s.passwordHash) { $('gate').hidden = true; $('main').hidden = false; render(); }
      else alert('Wrong password');
    };
  } else render();
})();
