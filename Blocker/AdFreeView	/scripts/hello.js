const onClick = async (e) => {
    let queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions)
    chrome.tabs.remove(tab.id)
}

chrome.storage.local.get('whiteSites', function (result) {
    let storedData = result?.whiteSites;
    console.log(storedData)
});

const btn = document.querySelector('.ok-button')
if (btn) {
    btn.addEventListener('click', onClick)
}