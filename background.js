let activeTabId = null;
let activeDomain = null;
let lastActiveTime = Date.now();

function getDomain(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function saveTimeSpent(callback) {
  const now = Date.now();
  const secs = Math.floor((now - lastActiveTime) / 1000);
  if (activeDomain && secs > 0) {
    const today = new Date().toISOString().slice(0, 10);
    chrome.storage.sync.get(['analytics'], (result) => {
      const analytics = result.analytics || {};
      analytics[today] = analytics[today] || {};
      analytics[today][activeDomain] = (analytics[today][activeDomain] || 0) + secs;
      chrome.storage.sync.set({ analytics }, callback);
    });
  }
  lastActiveTime = now;
}

// Handle tab switch
chrome.tabs.onActivated.addListener((info) => {
  chrome.tabs.get(info.tabId, (tab) => {
    saveTimeSpent();
    activeTabId = info.tabId;
    activeDomain = getDomain(tab.url);
  });
});

// Handle tab updates (URL changes)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    saveTimeSpent();
    activeDomain = getDomain(changeInfo.url);
  }
});

// Handle window focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    saveTimeSpent();
    activeTabId = null;
    activeDomain = null;
  } else {
    chrome.tabs.query({ active: true, windowId }, (tabs) => {
      if (tabs.length) {
        saveTimeSpent();
        activeTabId = tabs[0].id;
        activeDomain = getDomain(tabs[0].url);
      }
    });
  }
});

// Save time before system suspends
chrome.runtime.onSuspend.addListener(() => {
  saveTimeSpent();
});
