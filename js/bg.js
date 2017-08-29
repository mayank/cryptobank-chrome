var zebpayResult = null;
var coinmarketcapResult = null;
var API_TIMEOUT = 30000; // 30 seconds
var investment = 109798; // Rs.1,10,000
var PERCENT_HALT = 3;
var portfolio = {
    "BTC": "0.00000133",
    "BCH": "0.00000040",
    "ETH": "0.0",
    "MIOTA": "109.62669602",
    "NEO": "44.25316673",
    "LTC": "0.0",
    "BCH": "0.0",
    "DASH": "0.0",
    "TKN": "117.99275126"
};
var notify = {};


chrome.runtime.onConnect.addListener(function(port) {
    
     port.onMessage.addListener(function(msg) {
         
         if( msg.type == 'currency-init') {
             port.postMessage({
                 type: 'currency-init-cb',
                 investment: investment,
                 portfolio: portfolio
             });
         }
         else if( msg.type == 'currency-update' ) {
              port.postMessage({
                  type: 'currency-update-cb',
                  coinmarketcap: coinmarketcapResult,
                  zebpay: zebpayResult
              });
         }
         
     });

});


window.onload = function() {
    getAPIData();
};

function getAPIData() {

    zebpayAPI(function(result) {
        zebpayResult = result;
    });

    coinmarketcapAPI(function(result) {
        if (coinmarketcapResult !== null) {
            compareLastResults(coinmarketcapResult, result);
        }
        coinmarketcapResult = result;
    });

    setTimeout(getAPIData, API_TIMEOUT);
};

function getChangeMessage(coin){
    var message = "";
    message += coin.percent_change_1h + "% [" + coin.percent_change_24h + "%] with value " + coin.price_usd + "$\n";
    message += "Your coin now values ";
    message += "Rs. " + parseInt(portfolio[coin.symbol] * coin.price_btc * zebpayResult.sell).toLocaleString('en-US', loc);
    return message;
}

function compareLastResults(oldC, newC) {
    oldC.forEach(function(token, id) {
        if(typeof portfolio[token.symbol] !== 'undefined'){
            if( 
                Math.abs(newC[id].percent_change_1h) > PERCENT_HALT
                && 
                notify[newC[id]] !== newC[id].percent_change_1h
            ){
                chrome.notifications.create(token.symbol,{
                    type: 'basic',
                    iconUrl: 'img/' + token.symbol.toLowerCase() + '.png',
                    title: token.name + ' [' + token.symbol + '] ',
                    message: getChangeMessage(newC[id])
                },function(){
                    
                });
                
                notify[newC[id]] = newC[id].percent_change_1h;
            }
        }
    });
}


function zebpayAPI(cb) {
    $.get('https://api.zebpay.com/api/v1/ticker?currencyCode=INR', function(result) {
        cb(result);
    });
}

function coinmarketcapAPI(cb) {
    $.get('https://api.coinmarketcap.com/v1/ticker/', function(result) {
        cb(result);
    });
}
