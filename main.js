async function main() {
    const request = new Request('https://api.coindesk.com/v1/bpi/currentprice/usd.json');
    const response = await fetch(request);
    console.log(response.body);
    if (response.ok) {
        const jsonValue = await response.json();
        document.querySelector('#date').innerHTML = jsonValue.time.updated
        document.querySelector('#usd-per-btc').innerHTML = jsonValue.bpi.USD.rate;
        const usd_per_btc = jsonValue.bpi.USD.rate_float;
        const sat_per_hour = 0.25 / usd_per_btc * 100000000;
        document.querySelector('#sat-rate').innerHTML = Math.round(sat_per_hour/60);
    } else {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
}

main();