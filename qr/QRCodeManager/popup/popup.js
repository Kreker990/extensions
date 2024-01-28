const file = document.querySelector('#file')

function fetchRequest(formData){
    fetch('http://api.qrserver.com/v1/read-qr-code/',{
        method: 'POST', body: formData
    }).then(res => res.json()).then(result =>{
        console.log(result)
    })
} 

file.addEventListener('change', e=>{
    let file = e.target.files[0]
    let formData = new FormData();
    formData.append('file', file)
    fetchRequest(formData)
})