chrome.runtime.onInstalled.addListener(function (details) {
    if (details.reason === 'install') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: './assets/logo.png',
            title: 'QR Result',
            message: 'Enjoy using your extension!',
            priority: 2,
        });
    }
});