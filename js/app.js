var port = chrome.runtime.connect({
    name: "crypto-bank"
});

var loc = {
  style: 'currency',
  currency: 'INR',
};

var usd = {
  style: 'currency',
  currency: 'USD',
};

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
    
    var chart = new CanvasJS.Chart("chartContainer", {
		theme: "theme1",
		animationEnabled: true,
        axisX: {
            minimum: 0,
            maximum: 23,
            intervalType: "hours"
        },
        axisY:{
            includeZero: false    
        },
		data: [              
		{
			type: "line",
            dataPoints: [
            ]
        }]
	});
	chart.render();
    
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

    $('#totalpre').html(walletBalance.toFixed(5));
    
    var inrCost = walletBalance * zebpayAPI.sell;
    var profitLoss = (inrCost - investment) / investment;
    
    $('#calculated').html((profitLoss * 100).toFixed(2) + '%');
    if (profitLoss < 0) {
        $('#calculated').addClass("text-danger").removeClass("text-success");
    } else {
        $('#calculated').addClass("text-success").removeClass("text-danger");
    }
    
    $('#totalpost').attr('data-balance', walletBalance).addClass('totalpost');

    $('.totalpost').each(function() {
        var balance = parseFloat($(this).attr('data-balance'));
        var inr = balance * parseFloat(zebpayAPI.sell);
        
        $(this).html(Math.floor(inr).toLocaleString('en-US', loc));
        
        /*
        

        

        
        */
    });
    
    
    $('#btc').html(zebpayAPI.sell.toLocaleString('en-US', loc));
}

function setTheTuple(coin, balance) {
    var walletBalance = (parseFloat(balance) * parseFloat(coin.price_btc)).toFixed(5);
    var elem = $('#list').children('#' + coin.id);
    var html = '<tr id="' + coin.id + '">' +
        '<td class="text-center">' +
        '<p>' + coin.symbol + '</p>' +
        '</td>' +
        '<td>' +
        '<p class="text-' + (coin.percent_change_1h > 0 ? "success" : "danger") + '">' + coin.percent_change_1h + '%</p>' +
        '</td>' +
        '<td>' +
        '<p class="text-' + (coin.percent_change_24h > 0 ? "success" : "danger") + '">' + coin.percent_change_24h + '%</p>' +
        '</td>' +
        '<td>' +
        '<p>' + parseFloat(coin.price_btc).toFixed(4) + '</p>' +        
        '</td>' +
        '<td>' +
        '<p class="text-warning">' + parseFloat(coin.price_usd).toLocaleString('en-US', usd) + '</p>' +
        '</td>' +
        '<td class="text-center strong">' + parseFloat(balance).toFixed(2) + '</td>' +
        '<td class="text-center">' +
        '<p>' + walletBalance + '</p>' +
        '</td>' +
        '<td>' +
        '<p class="totalpost text-info" data-balance="' + walletBalance + '"></p>' +
        '</td>' +
        '</tr>';
    if (elem.length > 0) {
        $(elem).replaceWith(html);
    } else {
        $('#list').prepend(html);
    }
    return walletBalance;
}
