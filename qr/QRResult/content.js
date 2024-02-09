function countWordsAndSave() {
    const bodyText = document.body.innerText;
    const QrCount = (bodyText.match(/QR/gi) || []).length;
    chrome.storage.local.set({ QrCount });
    
}

countWordsAndSave();