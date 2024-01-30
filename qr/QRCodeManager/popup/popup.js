// const file = document.querySelector('#file')

function fetchRequest(formData){
    fetch('http://api.qrserver.com/v1/read-qr-code/',{
        method: 'POST', body: formData
    }).then(res => res.json()).then(result =>{
        console.log(result)
    })
} 

// file.addEventListener('change', e=>{
//     let file = e.target.files[0]
//     let formData = new FormData();
//     formData.append('file', file)
//     fetchRequest(formData)
// })
const btn = document.querySelector('#runFunctionButton')
btn.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "reloadFunction"});
    });
});


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.formData) {
        console.log(4)
        const receivedData = message.formData;
        const formData = new FormData();

        for (const key in receivedData) {
            formData.append(key, receivedData[key]);
        }
        fetchRequest(formData)
    }
});
