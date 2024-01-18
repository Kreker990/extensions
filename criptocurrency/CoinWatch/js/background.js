import apiUrl from './api.js';

function fetchData(url)
{ 
  fetch(url)
    .then(response =>
    {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data =>
    {
      console.log('result of request:', data);
      if (data?.active) {
        chrome.storage.sync.set({ 'data': data });
        chrome.notifications.create('notification1', {
          type: 'basic',
          iconUrl: '../images/icon.png',
          title: 'Coin Watch',
          message: data?.text,
          buttons: [
            { title: 'Buy Now' }
          ],
          priority: 0
        });
      }
      else chrome.storage.sync.set({ 'data': [] });
    })
    .catch(error =>
    { 
      chrome.storage.sync.set({ 'data': [] });
      console.log('server error:', error);
    });
}

chrome.alarms.create('notificationAlarm', {
  delayInMinutes: 5,
  periodInMinutes: 5
});

chrome.alarms.onAlarm.addListener((alarm) =>
{
  if (alarm && alarm.name === 'notificationAlarm') {
    fetchData(apiUrl);
  }
});