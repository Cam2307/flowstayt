// Licensing: the ONLY place that decides whether Pro features are unlocked.
// TODO(payments): replace the stub with a real check. Options:
//   - ExtensionPay (extensionpay.com): drop-in Stripe payments for extensions; call extpay.getUser() and read user.paid.
//   - Lemon Squeezy: sell a license key, validate it via their License API, cache the result in storage.
// Do not integrate both. Until then, Pro is toggled by a dev flag in storage (options page > Developer).
export async function isPro() {
  const { devPro } = await chrome.storage.local.get('devPro');
  return devPro === true;
}
