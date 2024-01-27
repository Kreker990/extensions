import {
  getRulesEnabledState,
  enableRulesForCurrentPage,
  disableRulesForCurrentPage,
} from '../scripts/background.js';

const button = document.getElementById('checkboxInput');
const text = document.querySelector('.text-content');
const domain = document.querySelector('.domain');
const blockCurrentSite = document.querySelector('#blockCurrentSite');
const badgeValue = document.querySelector('#countAds');

let hostname = ''
let isWhiteSite = false

const autoRefreshButton = document.querySelector('#autoRefresh')

autoRefreshButton.addEventListener('click', () => {
  if (autoRefreshButton.checked) {
    chrome.storage.local.set({ 'autoRefresh': true });
  } else {
    chrome.storage.local.set({ 'autoRefresh': false });
  }
});
chrome.storage.local.get('autoRefresh', function (result) {
  let storedData = result?.autoRefresh;
  if (storedData === undefined) {
    chrome.storage.local.set({ 'autoRefresh': true });
  } else {
    console.log(storedData, '   - store')

    autoRefreshButton.checked = storedData
  }
});

blockCurrentSite.addEventListener('click', () => {
  if (blockCurrentSite.checked) {
    chrome.storage.local.get('whiteSites', function (result) {
      let storedData = result?.whiteSites;
      chrome.storage.local.set({ 'whiteSites': [...storedData, hostname] });
    });
  } else {
    chrome.storage.local.get('whiteSites', function (result) {
      let storedData = result?.whiteSites;
      let wishlist = storedData.filter(item => item != hostname)
      chrome.storage.local.set({ 'whiteSites': wishlist });
    });
  }
  
});

function checkWhiteSites(hostname) {
  console.log(hostname)
  chrome.storage.local.get('whiteSites', function (result) {
    let storedData = result?.whiteSites;
    if (storedData == undefined) {
      chrome.storage.local.set({ 'whiteSites': [] });
    } else {
      if (storedData.find(item => item == hostname)) {
        blockCurrentSite.checked = true
        isWhiteSite = true
      }
    }
    console.log(hostname, result, '-----')
  });
}


function init() {
  fetchDomain()
  button.addEventListener('click', toggleAdBlocking);
  updateButtonState();
  getBadgeCount()
}

let a = 0;
async function toggleAdBlocking() {
  const isEnabled = await getRulesEnabledState();
  if (isEnabled) {
    await disableRulesForCurrentPage(autoRefreshButton.checked);
  } else {
    await enableRulesForCurrentPage(autoRefreshButton.checked);
  }
  chrome.storage.local.get('whiteSites', function (result) {
    console.log(result)
  });
  a = 1;
  updateButtonState();
}

async function updateButtonState() {
  const isEnabled = await getRulesEnabledState();
  fetchDomain();
  if (!isEnabled) {
    text.innerHTML = 'Ad switched off.';
    button.checked = false;
    if (a > 0) showNotification('Ad Blocking Disabled', 'Ad blocking is now disabled for this site.');
  } else {
    text.innerHTML = 'Ad blocker active, and now working';
    button.checked = true;
    if (a > 0) showNotification('Ad Blocking Enabled', 'Ad blocking is enabled on this site.');
    setAlarmForNotification();
  }
}

async function fetchDomain() {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      domain.innerHTML = url.hostname;
      hostname = url.hostname
    } catch { }
  }
  checkWhiteSites(hostname)
}

function showNotification(title, message) {
  chrome.notifications.create('', {
    type: 'basic',
    iconUrl: '../assets/images/logo.png',
    title: title,
    message: message,
    priority: 2,
  });
}

function setAlarmForNotification() {
  chrome.alarms.create('reminder', {
    delayInMinutes: 1,
  });
}

function getBadgeCount() {
  console.log(0)
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    chrome.action.getBadgeText({ tabId: currentTab.id }, function (result) {
      badgeValue.innerHTML = result || '0'
    });
  });
}

init();
