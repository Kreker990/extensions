// content.js
console.log(888)

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "reloadFunction") {
    const serializedData = serializeFormData(myFunction());
    chrome.runtime.sendMessage({ formData: serializedData });
  }
});


function myFunction() {

  let formData = new FormData();
  const svgElements = document.querySelectorAll('svg');

  svgElements.forEach((svg, index) => {
    const svgString = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    formData.append('file' + index, blob);
  });
  return formData;
}

function serializeFormData(formData) {
  console.log(3)
  const object = {};
  for (const [key, value] of formData.entries()) {
    object[key] = value;
  }
  return object;
}
