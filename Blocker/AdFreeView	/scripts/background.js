async function updateStaticRules(enableRulesetIds, disableCandidateIds)
{
  let options = { enableRulesetIds: enableRulesetIds, disableRulesetIds: disableCandidateIds };
  const enabledStaticCount = await chrome.declarativeNetRequest.getEnabledRulesets();
  const proposedCount = enableRulesetIds.length;
  if (
    enabledStaticCount + proposedCount >
    chrome.declarativeNetRequest.MAX_NUMBER_OF_ENABLED_STATIC_RULESETS
  ) {
    options.disableRulesetIds = disableCandidateIds;
  }
  await chrome.declarativeNetRequest.updateEnabledRulesets(options);
}

export async function getRulesEnabledState()
{
  const enabledRuleSets = await chrome.declarativeNetRequest.getEnabledRulesets();
  return enabledRuleSets.length > 0;
}

function browserReload()
{
  return new Promise((resolve) =>
  {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs)
    {
      chrome.tabs.reload(tabs[0].id, () =>
      {
        resolve();
      });
    });
  });
}

export async function enableRulesForCurrentPage(reload)
{
  const enableRuleSetIds = ['default'];
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab) {
    const tabId = activeTab.id;
    await updateStaticRules(enableRuleSetIds, []);
    reload && await browserReload(tabId);
  }
}

export async function disableRulesForCurrentPage(reload)
{
  const disableRuleSetIds = ['default'];
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (activeTab) {
    const tabId = activeTab.id;
    await updateStaticRules([], disableRuleSetIds);
    reload && await browserReload(tabId);
  }
}

chrome.runtime.onInstalled.addListener(() =>
{
  chrome.declarativeNetRequest.setExtensionActionOptions({ displayActionCountAsBadgeText: true });
});


chrome.commands.onCommand.addListener((command) =>
{

  chrome.tabs.update({}, async (tab) =>
  {
    debugger
    if (command == 'pin-current-tab') {
      chrome.tabs.update({ pinned: !tab.pinned });
    } else if (command == 'move-to-first') {
      chrome.tabs.move(tab.id, { index: 0 });
    }
    else if (command == 'move-to-last') {
      const allTabs = await chrome.tabs.query({})
      chrome.tabs.move(tab.id, { index: allTabs.length - 1 });
    }
    else if (command == 'copy-current-tab') {
      chrome.tabs.duplicate(tab.id);
    }
  });
});

chrome.webRequest.onBeforeRequest.addListener(
  function(details) {
      const url = new URL('');
      const isAllowedSite = allowedSites.some(allowedUrl => url.host.includes(allowedUrl));

      if (isAllowedSite) {
          // Если сайт разрешен, не блокировать запрос
          return { cancel: false };
      } else {
          // В противном случае применить логику блокировки
          // Здесь может быть ваш код для блокировки
          return { cancel: true };
      }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);