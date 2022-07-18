function modifyUpdateButton(seconds) {
    const button = document.getElementById('update');
    const timeoutSeconds = 180;
    button.disabled = seconds < timeoutSeconds;
    button.innerHTML = button.disabled ?
      "Can update in " + (timeoutSeconds-seconds) + " seconds" :
      'Update';
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

function modifyInput(id_and_store_key) {
    localStorage.setItem(id_and_store_key, document.getElementById(id_and_store_key).value);
    calculateView();
}

function calculateView() {
    const sat_per_btc = 100000000;
    const sat_per_usd = sat_per_btc / usd_per_btc;
    const sat_per_hour = getInput('usd_per_hr') * sat_per_usd;
    document.getElementById('sat-rate').innerHTML = Math.round(sat_per_hour / 60); 
    const boost_sat = getInput('boost_usd') * sat_per_usd;
    document.getElementById('boost-sat').innerHTML = Math.round(boost_sat);
}

function modifyUsdRate() {
    modifyInput('usd_per_hr');
}

function modifyBoostUsd() {
    modifyInput('boost_usd');
}

function main() {
    doFetch();
    document.getElementById('update').addEventListener('click', doFetch);
    document.getElementById('usd_per_hr').addEventListener('change', modifyUsdRate);
    document.getElementById('boost_usd').addEventListener('change', modifyBoostUsd);
}


function getInput(id_and_store_key) {
    let rval = localStorage.getItem(id_and_store_key);
    if (rval == null) {
        localStorage.setItem(id_and_store_key, '1.00');
        rval = localStorage.getItem(id_and_store_key);
    }
    document.getElementById(id_and_store_key).value = rval;
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
        calculateView();
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

main();