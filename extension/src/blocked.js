const QUOTES = ['The work you do now is a gift to your future self.','Small steps every day add up.','You chose to focus. Keep that promise.','Distraction can wait. Your goals cannot.','One more focused minute beats an hour of scrolling.'];
document.getElementById('msg').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
document.getElementById('site').textContent = new URLSearchParams(location.search).get('d') || 'This site';
chrome.runtime.sendMessage({ type: 'blocked' });
