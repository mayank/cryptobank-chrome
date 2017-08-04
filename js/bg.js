var zebpayResult = null;
var coinmarketcapResult = null;
var API_TIMEOUT = 600000; // 10 mins
var investment = 110000; // Rs. 1,10,000
var PERCENT_HALT = 3;
var portfolio = {
    "BTC": "0.0",
    "ETC": "14.25714286",
    "ETH": "2.50687989",
    "ANS": "22.06482200",
    "LTC": "9.15596343",
    "MCAP": "49.90000019",
    "MIOTA": "109.62669602"
};


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
    message += coin.percent_change_1h + "% [" + coin.percent_change_24h + "%]\n";
    message += "Your coin now values ";
    message += "Rs. " + parseInt(portfolio[coin.symbol] * coin.price_btc * zebpayResult.sell);
    return message;
}

function compareLastResults(oldC, newC) {
    oldC.forEach(function(token, id) {
        if(typeof portfolio[token.symbol] !== 'undefined'){
            if( 
                Math.abs(newC[id].percent_change_1h) > PERCENT_HALT
            ){
                chrome.notifications.create(token.symbol,{
                    type: 'basic',
                    iconUrl: 'img/' + token.symbol.toLowerCase() + '.png',
                    title: token.name + ' [' + token.symbol + '] ',
                    message: getChangeMessage(newC[id])
                },function(){
                    
                });
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
