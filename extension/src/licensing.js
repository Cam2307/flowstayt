// Licensing: the ONLY place that decides whether Pro features are unlocked.
// Uses Lemon Squeezy's public License API (no secret key; the extension is public).
// Store "Focus Blocker" id 513390. Monthly: product 1497337 / variant 2332239. Yearly: product 1497359 / variant 2332267.
export const LS = {
  api: 'https://api.lemonsqueezy.com/v1/licenses/',
  storeId: 513390,
  productIds: [1497337, 1497359], // monthly product, yearly product
  checkout: {
    monthly: 'https://focus-blocker.lemonsqueezy.com/checkout/buy/88e0d077-9b7a-4962-a080-2c511aefc942',
    yearly: 'https://focus-blocker.lemonsqueezy.com/checkout/buy/235bf292-34a0-496f-ac58-987410512230'
  }
};
const GRACE_MS = 7 * 864e5; // offline grace: keep Pro if the last good check was within 7 days

async function call(action, params) {
  const r = await fetch(LS.api + action, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params)
  });
  let j = {}; try { j = await r.json(); } catch {}
  return { httpOk: r.ok, j };
}
const ours = meta => meta && +meta.store_id === LS.storeId && LS.productIds.includes(+meta.product_id);

export async function getLicense() { return (await chrome.storage.local.get('license')).license || null; }

export async function isPro() {
  const l = await getLicense();
  return !!(l && l.valid && Date.now() - (l.lastOk || 0) < GRACE_MS);
}

export async function activate(key) {
  key = (key || '').trim();
  if (!key) return { ok: false, error: 'Enter your license key.' };
  let res;
  try { res = await call('activate', { license_key: key, instance_name: 'Focus Blocker (Chrome)' }); }
  catch { return { ok: false, error: 'Could not reach Lemon Squeezy. Check your connection and try again.' }; }
  const { j } = res;
  if (!j.activated) return { ok: false, error: j.error || 'That license key is not valid.' };
  if (!ours(j.meta)) {
    // Valid key for some other product: release the slot we just took, then refuse.
    try { await call('deactivate', { license_key: key, instance_id: j.instance?.id }); } catch {}
    return { ok: false, error: 'This key is not for Focus Blocker Pro.' };
  }
  await chrome.storage.local.set({ license: { key, instanceId: j.instance.id, valid: true, status: j.license_key?.status || 'active', lastOk: Date.now() } });
  return { ok: true };
}

export async function deactivate() {
  const l = await getLicense();
  if (l?.instanceId) { try { await call('deactivate', { license_key: l.key, instance_id: l.instanceId }); } catch {} }
  await chrome.storage.local.remove('license');
  return { ok: true };
}

// Called daily from background.js. Network errors keep the cached state (grace period applies);
// a definite answer from Lemon Squeezy (invalid / expired / disabled / wrong product) revokes Pro.
export async function revalidate() {
  const l = await getLicense(); if (!l) return;
  let res;
  try { res = await call('validate', { license_key: l.key, instance_id: l.instanceId }); } catch { return; }
  const { j, httpOk } = res;
  if (!httpOk && !('valid' in j)) return; // server trouble, not a verdict
  const status = j.license_key?.status;
  const good = j.valid === true && ours(j.meta) && !['expired', 'disabled'].includes(status);
  await chrome.storage.local.set({ license: { ...l, valid: good, status: good ? status : (status || 'invalid'), lastOk: good ? Date.now() : l.lastOk } });
}
