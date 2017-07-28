var port = chrome.runtime.connect({
    name: "crypto-bank"
});


port.onMessage.addListener(function(msg) {
    
    if( msg.type == 'currency-init-cb' ){
        portfolio = msg.portfolio;
        investment = msg.investment;
        
        port.postMessage({
            type: 'currency-update'
        });
    }
    else if ( msg.type == 'currency-update-cb' ) {
        coinAPI = msg.coinmarketcap;
        zebpayAPI = msg.zebpay;
        
        startFetchingData();
    }
    
});

var coinAPI = [];
var zebpayAPI = {};
var portfolio = {};
var investment = 0;

$(document).ready(function() {
    port.postMessage({
        type: 'currency-init'
    });
});

function startFetchingData() {
    var walletBalance = 0;
    var coinKey = Object.keys(portfolio);
    coinKey.forEach(function(currency) {
        coinAPI.forEach(function(coin) {
            if (coin.symbol == currency) {
                walletBalance += parseFloat(setTheTuple(coin, portfolio[currency]));
            }
        });

    });
    walletBalance -= 0.05;

    $('#totalpre').html(walletBalance.toFixed(5));
    $('#totalpost').attr('data-balance', walletBalance).addClass('totalpost');

    $('.totalpost').each(function() {
        var balance = parseFloat($(this).attr('data-balance'));
        var inr = balance * parseFloat(zebpayAPI.sell);
        $(this).html('Rs.' + Math.floor(inr));
        var profitLoss = (inr - investment) / investment;

        $('#calculated').html(Math.abs(profitLoss * 100).toFixed(2) + '%');

        if (profitLoss < 0) {
            $('#calculated').addClass("danger").removeClass("success");
        } else {
            $('#calculated').addClass("success").removeClass("danger");
        }

    });
}

function setTheTuple(coin, balance) {
    var walletBalance = (parseFloat(balance) * parseFloat(coin.price_btc)).toFixed(5);
    var elem = $('#list').children('#' + coin.id);
    var html = '<tr id="' + coin.id + '">' +
        '<td class="text-center">' +
        '<p>' + coin.symbol + '</p>' +
        '<p class="small text-' + (coin.percent_change_1h > 0 ? "success" : "danger") + '">' + coin.percent_change_1h + '%</p>' +
        '</td>' +
        '<td>' +
        '<p>' + parseFloat(coin.price_btc).toFixed(4) + '</p>' +
        '<p class="small text-warning">' + parseFloat(coin.price_usd).toFixed(3) + ' USD</p>' +
        '</td>' +
        '<td class="text-center strong">' + parseFloat(balance).toFixed(3) + '</td>' +
        '<td class="text-center">' +
        '<p>' + walletBalance + '</p>' +
        '<p class="small totalpost text-info" data-balance="' + walletBalance + '"></p>' +
        '</td>' +
        '</tr>';
    if (elem.length > 0) {
        $(elem).replaceWith(html);
    } else {
        $('#list').prepend(html);
    }
    return walletBalance;
}
