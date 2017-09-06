# coinoneAPI

> coinone api Object based Promise (using AXIOS)

## demo (telegram bot)

[@CoinoneHelpBot](https://t.me/coinoneHelpBot)


## install

> npm install --save coinone-api

## example (how to use this)

``` javascript

var CoinoneAPI = require('coinone-api');
// details : http://doc.coinone.co.kr/
// if you use ONLY public API, 'ACCESS_TOKEN' and 'SECRET_KEY' is not necessary 
// but you use personal API, 'ACCESS_TOKEN' and 'SECRET_KEY' is essential! 
var coinoneAPI = new CoinoneAPI('ACCESS_TOKEN','SECRET_KEY');

coinoneAPI.ticker('btc').then(function(response){
  console.log(response.data)
})

```