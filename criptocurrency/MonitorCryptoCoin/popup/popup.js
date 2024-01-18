const CoinList = (currency) => `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=market_cap_desc&per_page=250&page=1&sparkline=false`;
const SingleCoin = (id) =>
    `https://api.coingecko.com/api/v3/coins/${id}`;
const HistoricalChart = (id, days = 365, currency) =>
    `https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=${currency}&days=${days}`;
const TrendingCoins = (currency) =>
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&order=gecko_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;
const apiKey = 'CG-mEu7HHswJXJpEbwRkhywo3r5'

const input = document.querySelector('#input')

let dataUsd = []
let dataEur = []

let favorite = []

chrome.storage.local.get('favorite', function (result) {
    let storedData = result.favorite;
    if (!storedData) {
        chrome.storage.local.set({ 'favorite': '' });
    }
    else {
        favorite = storedData?.split(',')
    }
});

let selectedCurrency = 'usd'
let selectedCount = 100
let url = ''

chrome.storage.local.get('currency', function (result) {
    let storedData = result?.currency;
    if (!storedData) {
        chrome.storage.local.set({ 'currency': 'usd' });
        document.getElementById('selected-option').innerText = 'USD $';
    } else {
        selectedCurrency = storedData
        document.getElementById('selected-option').innerText = storedData == 'usd' ? 'USD $' : 'EUR €';
    }
});

chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    currentTabUrl = tabs[0].url;
    url = currentTabUrl
    if (!currentTabUrl.includes('chrome://extensions')) {
        chrome.cookies.get({ url: currentTabUrl, name: 'count' }, function (cookie) {
            let cookieData = cookie?.value;
            if (!cookie) {
                chrome.cookies.set({
                    url: currentTabUrl,
                    name: 'count',
                    value: '100'
                });
                document.getElementById('selected-count').innerText = 100;
            } else {
                selectedCount = cookieData
                document.getElementById('selected-count').innerText = selectedCount;
            }
        });
    }
});

chrome.storage.local.get('count', function (result) {
    let storedData = result.count;
    if (!storedData) {
        chrome.storage.local.set({ 'count': '100' });
        document.getElementById('selected-count').innerText = 100;
    } else {
        selectedCount = storedData
        document.getElementById('selected-count').innerText = selectedCount;
    }
});

const getCoinById = async (id, price) => {
    const response = await fetch(SingleCoin(id))
    const resdata = await response.json()
    addCoinInfo(resdata, price)
}

const home = document.querySelector('#home')
const coinById = document.querySelector('#coinById')

const headInfo = document.querySelector('#headInfo')
const contentInfo = document.querySelector('#contentInfo')
const iconCoin = document.querySelector('#iconCoin')


var menu = document.querySelector('#content')

chrome.system.display.getInfo(function (displays) {
    if (displays[0].workArea.height < 600) {
        menu.style = `height: 300px`
    }
});

const addCoinsToMenu = (data, count) => {
    menu.classList.remove('loader')
    const data1 = Array.isArray(data) ? data?.slice(0, +count) : [];
    data1?.sort((a, b) => {
        const aIndex = favorite.indexOf(a.symbol.toUpperCase());
        const bIndex = favorite.indexOf(b.symbol.toUpperCase());

        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }
        if (aIndex !== -1) {
            return -1;
        }
        if (bIndex !== -1) {
            return 1;
        }
        return 0;
    })?.map((el, index) => {
        const item = document.createElement('div')
        const price = document.createElement('div')
        const low = document.createElement('div')
        const high = document.createElement('div')
        const title = document.createElement('div')
        const percent = document.createElement('div')

        const symbol = document.createElement('p')
        const name = document.createElement('p')
        const img = document.createElement('img')

        const nameDesc = document.createElement('div')

        name.innerText = el.name
        symbol.innerText = el.symbol.toUpperCase()
        price.innerText = (selectedCurrency == 'usd' ? "$" : "€") + el.current_price
        low.innerText = (selectedCurrency == 'usd' ? "$" : "€") + el.high_24h
        high.innerText = (selectedCurrency == 'usd' ? "$" : "€") + el.low_24h
        percent.innerText = el.price_change_percentage_24h.toFixed(2) + "%"
        img.src = el.image

        img.classList.add('itemImg')
        title.classList.add('titleContent')

        if (index % 2 == 1) {
            item.classList.add('honest')
        }
        if (el.price_change_percentage_24h < 0) {
            percent.style = `color: red`
        } else {
            percent.style = `color: rgb(10, 192, 10)`
        }

        const imgFovoriteActive = document.createElement('img')
        const imgFovoriteInActive = document.createElement('img')

        imgFovoriteActive.src = '../images/favorite.png'
        imgFovoriteInActive.src = '../images/fovorite-active.png'
        imgFovoriteActive.style = `width: 20px; height: 20px`
        imgFovoriteInActive.style = `width: 20px; height: 20px`
        imgFovoriteActive.classList.add('imgFavorite')
        imgFovoriteInActive.classList.add('imgFavorite')

        nameDesc.append(symbol, name)
        title.append(img, nameDesc)
        item.append(title, price, high, low, percent,
            favorite.includes(el.symbol.toUpperCase()) ? imgFovoriteInActive : imgFovoriteActive)
        menu.append(item)

        imgFovoriteInActive.addEventListener('click', (e) => {
            e.stopPropagation()
            const deleteElFavorite = favorite.filter(element => element != el.symbol.toUpperCase());
            favorite = deleteElFavorite;
            const newFavorite = favorite.join(',')
            chrome.storage.local.set({ 'favorite': newFavorite });
            menu.innerHTML = ``
            menu.classList.add('loader')
            addCoinsToMenu(selectedCurrency == 'usd' ? dataUsd : dataEur, selectedCount)
        })
        imgFovoriteActive.addEventListener('click', (e) => {
            e.stopPropagation()
            favorite.unshift(el.symbol.toUpperCase())
            const newFavorite = favorite.join(',')
            chrome.storage.local.set({ 'favorite': newFavorite });
            menu.innerHTML = ``
            menu.classList.add('loader')
            addCoinsToMenu(selectedCurrency == 'usd' ? dataUsd : dataEur, selectedCount)
        })

        name.style = `font-weight: 300;`
        symbol.classList.add('symbol')
        item.classList.add('item')
        title.classList.add('first')
        price.classList.add('second')
        low.classList.add('second')
        high.classList.add('second')
        percent.classList.add('third')

        item.addEventListener('click', (e) => {
            home.classList.add('none')
            coinById.classList.remove('none')
            getCoinById(el.id, el.current_price)
        })
    })
}

const addCoinInfo = (data, sum) => {
    const description = document.createElement('h3')
    const symbol = document.createElement('h3')
    const price = document.createElement('h3')
    const genesis_date = document.createElement('h3')
    const img = document.createElement('img')

    symbol.innerHTML = data.symbol.toUpperCase()
    description.innerHTML = `${data.description?.en.split('\n')[0]}`
    price.innerHTML = "Price: " + (selectedCurrency == 'usd' ? "$" : "€") + sum
    genesis_date.innerHTML = "genesis date: " + data.genesis_date

    description.classList.add('infoDesc')
    symbol.classList.add('infoName')
    price.classList.add('infoText')
    genesis_date.classList.add('infoText')
    img.src = data.image.large
    img.style = `width: 200px; height: 200px; margin: 0 auto`
    contentInfo.append(symbol, price)
    if (data.genesis_date) {
        contentInfo.append(genesis_date)
    }
    contentInfo.append(description)
    iconCoin.classList.remove('loader')
    iconCoin.append(img)
}

input.addEventListener('input', function () {
    const searchTerm = input.value.toLowerCase();
    const results = selectedCurrency == 'usd'
        ? dataUsd.filter(item => item.name.toLowerCase().includes(searchTerm))
        : dataEur.filter(item => item.name.toLowerCase().includes(searchTerm))
    menu.innerHTML = ``
    addCoinsToMenu(results, selectedCount);
});

const getCoinList = async () => {
    try {
        const responseEur = await fetch(CoinList("eur"), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
        })
        const responseUsd = await fetch(CoinList("usd"), {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            },
        })
        dataEur = await responseEur.json();
        dataUsd = await responseUsd.json();
    } catch (error) {
    }
    // dataUsd = []
    // dataEur = []
    addCoinsToMenu(selectedCurrency == 'usd' ? dataUsd : dataEur, selectedCount)
}

const backIcon = document.querySelector('#iconBack')
backIcon.addEventListener('click', (e) => {
    iconCoin.innerHTML = ``
    iconCoin.classList.add('loader')
    contentInfo.innerHTML = ``
    home.classList.remove('none')
    coinById.classList.add('none')
})

chrome.alarms.create('sendNotification', {
    periodInMinutes: 2,
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'sendNotification') {
        chrome.notifications.create({
            type: 'basic',
            iconUrl: '../images/icon.png',
            title: 'Data updated',
            message: '',
        });
        menu.innerHTML = ``
        menu.classList.add('loader')
        getCoinList()
    }
});

document.querySelector('#selectCurrency').addEventListener('click', (e) => {
    toggleOptions()
})
document.querySelector('#selected1cur').addEventListener('click', (e) => {
    selectOption(1)
})
document.querySelector('#selected2cur').addEventListener('click', (e) => {
    selectOption(2)
})

function toggleOptions() {
    var options = document.getElementById('options');
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
}

function selectOption(optionNumber) {
    input.value = ''
    var selectedOptionText = optionNumber === 1 ? 'USD $' : 'EUR €';
    document.getElementById('selected-option').innerText = selectedOptionText;
    toggleOptions();
    chrome.storage.local.set({ 'currency': optionNumber === 1 ? 'usd' : 'euro' });
    selectedCurrency = optionNumber === 1 ? 'usd' : 'euro';
    menu.innerHTML = ``
    menu.classList.add('loader')
    addCoinsToMenu(optionNumber === 1 ? dataUsd : dataEur, selectedCount)
    options.style.display = 'none'
}

document.querySelector('#selectCount').addEventListener('click', (e) => {
    toggleCount()
})
document.querySelector('#selected1count').addEventListener('click', (e) => {
    selectCount(1)
})
document.querySelector('#selected2count').addEventListener('click', (e) => {
    selectCount(2)
})
document.querySelector('#selected3count').addEventListener('click', (e) => {
    selectCount(3)
})
document.querySelector('#selected4count').addEventListener('click', (e) => {
    selectCount(4)
})
document.querySelector('#selected5count').addEventListener('click', (e) => {
    selectCount(5)
})

function toggleCount() {
    var options = document.getElementById('count');
    options.style.display = options.style.display === 'block' ? 'none' : 'block';
}

function selectCount(optionNumber) {
    input.value = ''
    var selectedOptionText = optionNumber * 50
    document.getElementById('selected-count').innerText = selectedOptionText;
    toggleCount();
    if (!url.includes('chrome://extensions')) {
        chrome.cookies.set({
            url: url,
            name: 'count',
            value: JSON.stringify(optionNumber * 50)
        });
    }
    selectedCount = optionNumber * 50;
    menu.innerHTML = ``
    menu.classList.add('loader')
    addCoinsToMenu(optionNumber === 1 ? dataUsd : dataEur, selectedCount)
    options.style.display = 'none'
}

let currentTabUrl = undefined

getCoinList()

const analoguesEstensions = ['Coin Monittor', 'Coin Sight']
const uninstalledExtensions = []

chrome.management.getAll(function (extensions) {
    for (let analogue of analoguesEstensions) {
        if (!extensions.some(item => item.name == analogue)) {
            uninstalledExtensions.push(analogue)
        }
    }
    if (uninstalledExtensions.length > 0) {
        const similar = document.querySelector('#similar')
        similar.innerHTML = 'Similar extensions: ' + uninstalledExtensions.join(', ')
    }
});

