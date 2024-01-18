import
{
  getRulesEnabledState,
  enableRulesForCurrentPage,
  disableRulesForCurrentPage,
} from '../scripts/background.js';

const button = document.getElementById('checkbox');
const text = document.querySelector('.text-content');
const domain = document.querySelector('.domain');
const cookies = document.querySelector('#cookies');

function init()
{
  button.addEventListener('click', toggleAdBlocking);
  updateButtonState();
  getCookiesCount();
  checkForAdBlockers();
  listenForDisplayChanges();
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
    // chrome.action.setBadgeText({ text: '' });
    cookies.innerHTML = 0
    if (a > 0) showNotification('Ad Blocking Disabled', 'Ad blocking is now disabled for this site.');
  } else {
    text.innerHTML = 'Ad blocker active, and now working';
    button.checked = true;
    // chrome.action.setBadgeText({ text: 'ON' });
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

function getCookiesCount()
{
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    var currentTab = tabs[0]; // тут будет ваша текущая вкладка
    console.log(currentTab); // вывод информации о вкладке
    chrome.action.getBadgeText({tabId: currentTab.id}, function(result) {
      cookies.innerHTML = result || '0'
    });
  });
}

function checkForAdBlockers()
{
  chrome.management.getAll(function (extensions)
  {
    const adBlockersFound = extensions.filter((extension) =>
    {
      return (
        extension.name.includes('AdBlock') ||
        extension.description.includes('block ads') ||
        extension.name.includes('uBlock')
      );
    });

    if (adBlockersFound.length > 0) {
      const extensionsWrapp = document.createElement('div');
      extensionsWrapp.classList.add('extensions');
      const extensionsTitle = document.createElement('h2');
      extensionsTitle.classList.add('extensions_title');
      extensionsTitle.innerHTML = 'You already have other ad blockers installed:';
      const extensionsList = document.createElement('ul');
      extensionsList.classList.add('extensions_list');
      adBlockersFound.map((ext) =>
      {
        const extension = document.createElement('li');
        extension.classList.add('extension');
        extension.innerHTML = ext.shortName;
        extensionsList.appendChild(extension);
      });
      extensionsWrapp.appendChild(extensionsTitle);
      extensionsWrapp.appendChild(extensionsList);
      document.querySelector('.themes').appendChild(extensionsWrapp);
    }
  });
}

function listenForDisplayChanges()
{
  chrome.system.display.getInfo(function (displays)
  {
    if (displays && displays.length > 0) {
      const primaryDisplay = displays.find((display) => display.isPrimary) || displays[0];
      const width = primaryDisplay.bounds.width;
      const height = primaryDisplay.bounds.height;

      if (width < 800) {
        document.body.style.width = '400px';
        document.body.style.height = '380px';
      } else {
        document.body.style.width = '400px';
        document.body.style.height = '380px';
      }
    }
  });
}

init();
