function modifyUpdateButton(seconds) {
    const button = document.getElementById('update');
    button.disabled = seconds < 120;
    button.innerHTML = button.disabled ? "Can update in " + (120-seconds) + " seconds" : 'Update';
}

function showDuration(last_updated) {
    let duration = luxon.Duration.fromMillis(luxon.DateTime.now() - last_updated);
    let tempObject = duration.shiftTo('seconds').toObject();
    tempObject.seconds = Math.round(tempObject.seconds);
    modifyUpdateButton(tempObject.seconds);
    duration = luxon.Duration.fromObject(tempObject);
    if (duration >= luxon.Duration.fromObject({ minutes: 1 })) {
        duration = duration.shiftTo('minutes', 'seconds');
    }
    return duration.toHuman();
}

let timeoutID = 0;
let usd_per_btc = 40000;

function updateAgo(last_updated) {
    document.getElementById('date').innerHTML = showDuration(last_updated);
    timeoutID = setTimeout(updateAgo, 1000, last_updated);
}

function modifyUsdRate() {
    localStorage.setItem('usd_per_hr', document.getElementById('usd_per_hr').value);
    calculateSatRate();
}

function calculateSatRate() {
    let sat_per_hour = getUsdPerHr() / usd_per_btc * 100000000;
    document.querySelector('#sat-rate').innerHTML = Math.round(sat_per_hour / 60);
}

function main() {
    doFetch();
    document.getElementById('update').addEventListener('click', doFetch);
    document.getElementById('usd_per_hr').addEventListener('change', modifyUsdRate);
}


function getUsdPerHr() {
    let rval = localStorage.getItem('usd_per_hr');
    if (rval == null) {
        localStorage.setItem('usd_per_hr', '1.00');
        rval = localStorage.getItem('usd_per_hr');
    }
    document.getElementById('usd_per_hr').value = rval;
    return parseFloat(rval);
}

async function doFetch() {
    let request = new Request('https://api.coindesk.com/v1/bpi/currentprice/usd.json');
    let response = await fetch(request);
    if (response.ok) {
        let jsonValue = await response.json();
        let last_updated = luxon.DateTime.fromISO(jsonValue.time.updatedISO);
        clearTimeout(timeoutID);
        updateAgo(last_updated);
        document.querySelector('#usd-per-btc').innerHTML = jsonValue.bpi.USD.rate;
        usd_per_btc = jsonValue.bpi.USD.rate_float;
        calculateSatRate();
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

main();