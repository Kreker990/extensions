import
{
  getRulesEnabledState,
  enableRulesForCurrentPage,
  disableRulesForCurrentPage,
} from '../scripts/background.js';

const button = document.getElementById('checkbox');
const text = document.querySelector('.text-content');
const domain = document.querySelector('.domain');
const badgeValue = document.querySelector('#badgeValue');

function init()
{
  button.addEventListener('click', toggleAdBlocking);
  updateButtonState();
  getBadgeCount();
}

let a = 0;
async function toggleAdBlocking()
{
  const isEnabled = await getRulesEnabledState();
  if (isEnabled) {
    await disableRulesForCurrentPage();
  } else {
    await enableRulesForCurrentPage();
  }
  a = 1;
  updateButtonState();
}

async function updateButtonState()
{
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

async function fetchDomain()
{
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.url) {
    try {
      let url = new URL(tab.url);
      domain.innerHTML = url.hostname;
    } catch { }
  }
}

function showNotification(title, message)
{
  chrome.notifications.create('', {
    type: 'basic',
    iconUrl: '../assets/images/logo.png',
    title: title,
    message: message,
    priority: 2,
  });
}

function setAlarmForNotification()
{
  chrome.alarms.create('reminder', {
    delayInMinutes: 1,
  });
}

function getBadgeCount()
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0]; // тут будет ваша текущая вкладка
    console.log(currentTab); // вывод информации о вкладке
    chrome.action.getBadgeText({tabId: currentTab.id}, function(result) {
      badgeValue.innerHTML = result || '0'
    });
  });
}


init();
