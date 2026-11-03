import { getState, normalizeDomain, todayKey, sha256 } from './common.js';
import { isPro, getLicense, activate, deactivate, LS } from './licensing.js';
const $ = id => document.getElementById(id);
const DAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

async function render() {
  const s = await getState(), pro = await isPro();
  const chip = (ul, d, onRemove) => {
    const li = document.createElement('li'), i = document.createElement('span'), t = document.createElement('span');
    i.className = 'ini'; i.textContent = d[0]; t.textContent = d;
    const b = document.createElement('button'); b.textContent = '×'; b.title = 'Remove ' + d; b.setAttribute('aria-label', 'Remove ' + d);
    b.onclick = onRemove; li.append(i, t, b); ul.append(li);
  };
  $('list').innerHTML = '';
  s.blocklist.forEach(d => chip($('list'), d, async () => { await chrome.storage.local.set({ blocklist: s.blocklist.filter(x => x !== d) }); render(); }));
  if (!s.blocklist.length) $('list').innerHTML = '<li class="empty" style="border:0;background:none">No sites yet. Add one above.</li>';
  $('count').textContent = s.blocklist.length + (s.blocklist.length === 1 ? ' site' : ' sites');
  const days = [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * 864e5); return { d, n: s.stats[todayKey(d)] || 0 }; });
  const max = Math.max(1, ...days.map(x => x.n));
  $('total').textContent = days.reduce((a, x) => a + x.n, 0);
  $('stats').innerHTML = '';
  days.forEach((x, i) => {
    const el = document.createElement('div'); el.className = 'bar' + (i === 6 ? ' today' : '');
    el.title = todayKey(x.d) + ': ' + x.n + ' blocked';
    el.innerHTML = `<b>${x.n}</b><i style="height:${Math.round(x.n / max * 70)}%"></i><span>${i === 6 ? 'Today' : DAY[x.d.getDay()]}</span>`;
    $('stats').append(el);
  });
  $('alOn').checked = s.allowlistMode; $('alList').innerHTML = '';
  s.allowlist.forEach(d => {
    chip($('alList'), d, async () => { await chrome.storage.local.set({ allowlist: s.allowlist.filter(x => x !== d) }); render(); });
  });
  const { syncNotice } = await chrome.storage.local.get('syncNotice');
  $('syncNotice').hidden = !syncNotice; $('syncNotice').textContent = syncNotice || '';
  $('proBox').classList.toggle('locked', !pro); $('upsell').hidden = pro; $('lockbar').hidden = pro; $('buyRow').hidden = pro;
  $('planBadge').textContent = pro ? 'Pro active' : 'Free'; $('planBadge').classList.toggle('on', pro);
  const lic = await getLicense();
  $('licKey').hidden = $('activate').hidden = !!lic; $('deactivate').hidden = !lic;
  if (!$('licStatus').dataset.err) $('licStatus').textContent = !lic ? 'Free version. Have a key? Paste it above.'
    : pro ? 'Pro active (key ending ' + lic.key.slice(-4) + ').' : 'License ' + (lic.status || 'invalid') + '. Pro is locked.';
  $('licStatus').dataset.err = '';
  $('buyYearly').hidden = !LS.checkout.yearly; $('buyMonthly').hidden = false;
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
$('buyMonthly').onclick = () => window.open(LS.checkout.monthly, '_blank');
$('lockUpgrade').onclick = () => $('buyMonthly').scrollIntoView({ behavior: 'smooth', block: 'center' });
$('buyYearly').onclick = () => window.open(LS.checkout.yearly, '_blank');
$('activate').onclick = async () => {
  $('activate').disabled = true; $('licStatus').textContent = 'Checking...';
  const r = await activate($('licKey').value); $('activate').disabled = false;
  if (!r.ok) { $('licStatus').textContent = r.error; $('licStatus').dataset.err = '1'; }
  else $('licKey').value = '';
  render();
};
$('deactivate').onclick = async () => { await deactivate(); render(); };

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
