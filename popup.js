const resetBtn = document.getElementById('reset-btn');
const analyticsDiv = document.getElementById('analytics');

function renderAnalytics() {
  const today = new Date().toISOString().slice(0, 10);
  chrome.storage.sync.get(['analytics'], (result) => {
    const data = (result.analytics && result.analytics[today]) || {};
    analyticsDiv.innerHTML = '<b>Sites Tracked Today:</b><br>';

    if (Object.keys(data).length === 0) {
      analyticsDiv.innerHTML += '<i>No data yet. Browse around!</i>';
    } else {
      for (const [site, secs] of Object.entries(data)) {
        const mins = (secs / 60).toFixed(1);
        analyticsDiv.innerHTML += `
          <div class="site-row">
            <span class="site-name">🟢 ${site}</span>
            <span class="time-spent">${mins} min</span>
          </div>
        `;
      }
    }
    
    adjustPopupHeight(); // Adjust height after DOM update
  });
}

function adjustPopupHeight() {
  setTimeout(() => {
    const body = document.body;
    const html = document.documentElement;
    const height = Math.max(
      body.scrollHeight, body.offsetHeight,
      html.clientHeight, html.scrollHeight, html.offsetHeight
    );
    const maxHeight = 600;
    const finalHeight = Math.min(height + 20, maxHeight);

    try {
      window.resizeTo(350, finalHeight); // 350px width to match CSS
    } catch (e) {
      console.warn('Resize popup failed:', e);
    }
  }, 100);
}

document.addEventListener('DOMContentLoaded', () => {
  renderAnalytics();
});

resetBtn.onclick = () => {
  const today = new Date().toISOString().slice(0, 10);
  chrome.storage.sync.get(['analytics'], (result) => {
    const analytics = result.analytics || {};
    analytics[today] = {};
    chrome.storage.sync.set({ analytics }, () => {
      renderAnalytics();
    });
  });
};
