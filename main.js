function showDuration(last_updated) {
    let unit = 'milliseconds';
    let duration = luxon.Duration.fromMillis(luxon.DateTime.now() - last_updated);
    let update = document.getElementById('update');
    if (duration >= luxon.Duration.fromObject({ days: 1 })) {
        unit = 'days';
        update.disabled = false;
    } else if (duration >= luxon.Duration.fromObject({ hours: 1 })) {
        unit = 'hours';
        update.disabled = false;
    } else if (duration >= luxon.Duration.fromObject({ minutes: 1 })) {
        unit = 'minutes';
        if (duration >= luxon.Duration.fromObject({ minutes: 2 })) {
            update.disabled = false;
        } else {
            update.disabled = true;
        }
    } else if (duration >= luxon.Duration.fromObject({ seconds: 1 })) {
        unit = 'seconds';
        update.disabled = true;
    } else {
        update.disabled = true;
    }
    let value = Math.floor(duration.as(unit));
    if (value == 1) {
        unit = unit.slice(0, -1);
    }
    return value + " " + unit;
}

let timeoutID = 0;

function updateAgo(last_updated) {
    document.querySelector('#date').innerHTML = showDuration(last_updated);
    timeoutID = setTimeout(updateAgo, 5000, last_updated);
}

function main() {
    doFetch();
    document.querySelector('#update').addEventListener("click", doFetch);
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
        let usd_per_btc = jsonValue.bpi.USD.rate_float;
        let sat_per_hour = 0.25 / usd_per_btc * 100000000;
        document.querySelector('#sat-rate').innerHTML = Math.round(sat_per_hour / 60);
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

main();