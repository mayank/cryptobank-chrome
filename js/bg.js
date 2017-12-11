var zebpayResult = null;
var coinmarketcapResult = null;
var API_TIMEOUT = 90000; // 90 seconds
var investment = 440000; // Rs.3,90,000
var PERCENT_HALT = 1;
var portfolio = {
    "BCH"	  : ["0.83028728"],
    "SNGLS"	: ["959.59571970"],
    "BTC"	  : ["0.0"], //22.75889975"],
    "MIOTA" : ["109.627","207.777833"],
    "NEO"	  : ["74.6353239","58.10448256"],
    "QTUM"	: ["11.67024371"], //11.50890714"],
    "PRG"	  : ["131.471353"]
};
var notify = {};

chrome.runtime.onConnect.addListener(function(port) {
    console.log('Client Connected');
    
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
    if(portfolio[coin.symbol]){
      message += coin.percent_change_1h + "% [" + coin.percent_change_24h + "%] with value " + coin.price_usd + "$\n";
      portfolio[coin.symbol].forEach(function(data){
        message += "Your coin now values ";
        message += "Rs. " + parseInt(data * coin.price_btc * zebpayResult.sell).toLocaleString('en-US');
      });  
    }
    return message;
}

function compareLastResults(oldC, newC) {
    oldC.forEach(function(token, id) {
        if(typeof portfolio[token.symbol] !== 'undefined'){
            if( 
                Math.abs(newC[id].percent_change_1h) > PERCENT_HALT
                && 
                notify[newC[id].symbol] !== newC[id].percent_change_1h
            ){
                chrome.notifications.create(token.symbol,{
                    type: 'basic',
                    iconUrl: '/img/' + token.symbol.toLowerCase() + '.png',
                    title: token.name + ' [' + token.symbol + '] ',
                    message: getChangeMessage(newC[id])
                });
            }
            notify[newC[id].symbol] = newC[id].percent_change_1h;
        }
    });
}


function zebpayAPI(cb) {
    $.get('https://www.zebapi.com/api/v1/market/ticker/btc/inr', function(result) {
        cb(result);
    });
}

function coinmarketcapAPI(cb) {
    $.get('https://api.coinmarketcap.com/v1/ticker/?limit=0', function(result) {
        cb(result);
    });
}
