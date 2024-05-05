const file = document.querySelector('#file')
const result = document.querySelector('#result')

const followBtn = document.querySelector('#follow')
const copyBtn = document.querySelector('#copy')
const loader = document.querySelector('#loader')
const imgBgc = document.querySelector('#imgCard2')

const dropZone = document.getElementById('drop_zone');

dropZone.addEventListener('click', () => file.click());

let loaderActive = false
let url = ''
let currentTabUrl = ''

// проверка результата qr кода(яв-ся ли сайтом)
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// запрос на для получение результата по qr коду
async function fetchRequest(formData) {
    if (!loaderActive) {
        loaderActive = true
        loader.style.display = 'block'
        try {
            const response = await fetch('http://api.qrserver.com/v1/read-qr-code/', {
                method: 'POST', body: formData
            })
            if (response.status == 200) {
                const resData = await response.json()
                const dataQr = resData[0].symbol[0].data
                if (dataQr == '\nQR-Code:') {
                    result.innerHTML = 'QR-Code contains nothing'
                    result.style.color = '#475569'
                } else {
                    if (dataQr?.split('QR-Code')[0]) {
                        result.innerHTML = dataQr?.split('QR-Code')[0]
                        result.style.color = '#475569'
                        url = dataQr?.split('QR-Code')[0]
                        followBtn.style.display = isValidUrl(dataQr) ? 'block' : 'none'
                        copyBtn.style.display = 'block'
                    } else {
                        result.innerHTML = resData[0].symbol[0].error
                    }
                }
            }
            if (response.status == 400) {
                result.innerHTML = 'QR-Code contains nothing'
            }
        } catch (e) {
            result.style.color = 'red'
            result.innerHTML = 'Check your internet connection'
        }
        loaderActive = false
        loader.style.display = 'none'
    }
}

// событие при загрузке файла на расширение
file.addEventListener('change', e => {
    let file = e.target.files[0]
    let formData = new FormData();
    formData.append('file', file)
    fetchRequest(formData)
})

// функция для преобразования ссылки
async function uploadScreenshot(imageUri) {
    try {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        const file = new File([blob], "screenshot.png", { type: 'image/png' });

        const formData = new FormData();
        formData.append('file', file);
        btn.addEventListener('click', () => {
            fetchRequest(formData);
        });
    } catch (error) {
        console.log("Check your Internet connection", error);
    }
}

// событие при клике на кнопку текущего сайта
const btn = document.querySelector('#btn2')

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    currentTabUrl = tabs[0].url;
    if ("chrome://extensions/" !== currentTabUrl) {
        chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (imageUri) => {
            if (chrome.runtime.lastError) {
                return;
            }
            imgBgc.src = imageUri;
            uploadScreenshot(imageUri)
        });
    }
});

// кнопки для копирования и переход по ссылке
followBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: url });
})
copyBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(url);
    } catch (err) {
        console.log('Failed to copy: ', err);
    }
});

// функция для обновления скрина на сайте
const updateResultQrOnThisPage = async (imageUri) => {
    try {
        const res = await fetch(imageUri);
        const blob = await res.blob();
        const file = new File([blob], "screenshot.png", { type: 'image/png' });

        const formData = new FormData();
        formData.append('file', file);
        fetchRequest(formData);
    } catch (error) {
        console.log("Check your Internet connection", error);
    }
}

chrome.alarms.create('updateResultQrOnThisPage', {
    periodInMinutes: 0.5,
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'updateResultQrOnThisPage') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            currentTabUrl = tabs[0].url;
            if ("chrome://extensions/" !== currentTabUrl) {
                chrome.tabs.captureVisibleTab(tabs[0].windowId, { format: 'png' }, (imageUri) => {
                    if (chrome.runtime.lastError) {
                        return;
                    }
                    imgBgc.src = imageUri;
                    updateResultQrOnThisPage(imageUri)
                });
            }
        });
    }
});


