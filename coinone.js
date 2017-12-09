const axios = require('axios')
const crypto = require('crypto')

function coinoneAPI (_ACCESS_TOKEN, _SECRET_KEY) {
  if (!(this instanceof arguments.callee )) {
    console.error('it is ONLY use with "new" keyword')
    return false
  }

  var ACCESS_TOKEN = _ACCESS_TOKEN
  var SECRET_KEY = _SECRET_KEY

  this.get_access_token = function () {
    return ACCESS_TOKEN
  }
  this.get_secret_key = function () {
    return SECRET_KEY
  }

  // public API
  this.callPublicAPI = function (commend, parameter) {
    return axios.get('https://api.coinone.co.kr/' + commend + '/' + serializeObject(parameter))
    // .then(function (response) {
    //   var data = response.data
    //   console.log('callPublicAPI response: ', data, data.result)
    // })
    .catch(function (error) {
      console.log(error);
    })
  }

  // personal API
  this.callPersonalAPI = function (url, payload) {
    var token = this.get_access_token()
    var key = this.get_secret_key()

    if(token === undefined || typeof token !== 'string') {
      console.error('ACCESS_TOKEN is not correct: ', token)
    }

    if(key === undefined || typeof key !== 'string') {
      console.error('ACCESS_TOKEN is not correct: ', key)
    }

    payload = new Buffer(JSON.stringify(payload)).toString('base64')

    var headers = {
      'content-type':'application/json',
      'X-COINONE-PAYLOAD': payload,
      'X-COINONE-SIGNATURE': crypto
                              .createHmac('sha512', key.toUpperCase())
                              .update(payload)
                              .digest('hex')
    }
    return axios({
      'method': 'post',
      'url': url,
      'headers': headers,
      'data': payload
    })
    // .then(function (response) {
    //   var data = response.data
    //   console.log('callPersonalAPI response: ', data, data.result)
    // })
    .catch(function (error) {
      console.log(error);
    })
  }
}

// utils
const isString = function (value) {
  return typeof value === 'string'
}

const isNumber = function (value) {
  return typeof value === 'number'
}

const isFloat = function (value) {
  return (value === +value) && (value !== (value|0))
}

const isInteger = function (value) {
  return (value === +value) && (value === (value|0))
}

const isCurrencyMarket = function (c) {
  return (c === 'btc' || c === 'eth' || c === 'etc' || c === 'xrp' || c === 'qtum' || c === 'iota' || c === 'ltc')
}

const isCurrency = function (c) {
  return (c === 'btc' || c === 'bch' || c === 'eth' || c === 'etc' ||  c === 'xrp' || c === 'qtum' || c === 'ltc' || c === 'iota')
}

const isOrderType = function (o) {
  return (o === 'buy' || o === 'sell')
}

const isEmpty = function (obj) {
    return Object.keys(obj).length === 0;
}

const serializeObject = function (object) {
  if (isEmpty(object)) {
    return ''
  }

  var data = [];
  for(var p in object) {
    if (object.hasOwnProperty(p)) {
      data.push(encodeURIComponent(p) + "=" + encodeURIComponent(object[p]))
    }
  }
  return '?' + data.join("&");
}

/**
 * public API
 */
// Public - Ticker
coinoneAPI.prototype.ticker = function (currency) {
  if(!isCurrency(currency) && currency !== 'all' ) {
    console.error('ticker: currency type is NOT correct! [ currency: ' + currency + ' ]')
    return false
  }
  var parameter = {
    'currency': currency // Default value: btc, Allowed values: btc, bch, eth, etc, xrp, qtum, iota, ltc, all
  }
  return this.callPublicAPI('ticker', parameter)
}

// Public - Recent Complete Orders
coinoneAPI.prototype.recentCompleteOrders = function (currency) {
  if(!isCurrency(currency)) {
    console.error('recentCompleteOrders: currency type is NOT correct! [ currency: ' + currency + ' ]')
    return false
  }
  var parameter = {
    'currency': currency, // Default value: btc, Allowed values: btc, bch, eth, etc, xrp, qtum, iota, ltc
    'period': 'hour' // Default value: hour, Allowed values: hour, day
  }
  return this.callPublicAPI('trades', parameter)
}

// Public - Orderbook
coinoneAPI.prototype.orderbook = function (currency) {
  if(!isCurrency(currency)) {
    console.error('orderbook: currency type is NOT correct! [ currency: ' + currency + ' ]')
    return false
  }
  var parameter = {
    'currency': currency, // Default value: btc, Allowed values: btc, bch, eth, etc, xrp, qtum, iota, ltc
    'period': 'hour' // Default value: hour, Allowed values: hour, day
  }
  return this.callPublicAPI('orderbook', parameter)
}

/**
 * personal API
 */
// Order_V2 - Cancel Order
coinoneAPI.prototype.cancelOrder = function (currency, price, qty, orderID, orderType) {
  // Allowed values: KRW, long
  if (!isInteger(price) || price < 0) {  
    console.error('cancelOrder: price is NOT integer OR minus value', price)
    return false
  }
  // Allowed values: double
  if (!isNumber(qty) || qty < 0) {  
    console.error('cancelOrder: qty is NOT number OR minus value', qty)
    return false
  }
  // Allowed values: [btc], eth, etc
  if (!isCurrency(currency)) {  
    console.error('cancelOrder: currency is NOT right value: "btc", "eth", "etc", "qtum", "iota", "ltc"', currency)
    return false
  }
  // Allowed values: orderID:String
  if (!isString(orderID)) {
    console.error('cancelOrder: orderID is NOT right value: orderID:string', typeof orderID, orderID)
    return false
  }
  // Allowed values: buy, sell
  if (!isOrderType(orderType)) {
    console.error('cancelOrder: orderType is NOT right value: "buy", "sell"', orderType)
    return false
  }

  var url = 'https://api.coinone.co.kr/v2/order/cancel/';
  var payload = {
    'access_token': this.get_access_token(),
    'order_id': orderID,
    'price': price,
    'qty': parseFloat(qty).toFixed(4),
    'is_ask': orderType === 'sell' ? 1 : 0,
    'currency': currency,
    'nonce': Date.now()
  }
  return this.callPersonalAPI(url, payload)
}

// Order_V2 - Limit Buy
coinoneAPI.prototype.limitBuy = function (currency, price, qty) {
  // Allowed values: KRW, long
  if (!isInteger(price) || price < 0) {  
    console.error('limitBuy: price is NOT integer OR minus value', price)
    return false
  }
  // Allowed values: double
  if (!isNumber(qty) || qty < 0) {  
    console.error('limitBuy: qty is NOT number OR minus value', qty)
    return false
  }
  // Allowed values: btc, bch, eth, etc, xrp, qtum, iota, ltc
  if (!isCurrency(currency)) {  
    console.error('limitBuy: currency is NOT right value: btc, bch, eth, etc, xrp, qtum, iota, ltc', currency)
    return false
  }

  var url = 'https://api.coinone.co.kr/v2/order/limit_buy/';
    var payload = {
    'access_token': this.get_access_token(),
    'price': price,
    'qty': parseFloat(qty).toFixed(4),
    'currency': currency,
    'nonce': Date.now()
  }
  return this.callPersonalAPI(url, payload)
}

// Order_V2 - Limit Sell
coinoneAPI.prototype.limitSell = function (currency, price, qty) {
  // Allowed values: KRW, long
  if (!isInteger(price) || price < 0) {  
    console.error('limitSell: price is NOT integer OR minus value', price)
    return false
  }
  // Allowed values: double
  if (!isNumber(qty) || qty < 0) {  
    console.error('limitSell: qty is NOT number OR minus value', qty)
    return false
  }
  // Allowed values: btc, bch, eth, etc, xrp, qtum
  if (!isCurrency(currency)) {  
    console.error('limitSell: currency is NOT right value: btc, bch, eth, etc, xrp, qtum, iota, ltc', currency)
    return false
  }
 
  var url = 'https://api.coinone.co.kr/v2/order/limit_sell/';
  var payload = {
    'access_token': this.get_access_token(),
    'price': price,
    'qty': parseFloat(qty).toFixed(4),
    'currency': currency,
    'nonce': Date.now()
  }
  return this.callPersonalAPI(url, payload)
}

// Order_V2 - My Complete Orders
coinoneAPI.prototype.myCompleteOrders = function (currency) {
  // Allowed values: btc, bch, eth, etc, xrp, qtum, iota, ltc
  if (!isCurrency(currency)) {  
    console.error('myCompleteOrders: currency is NOT right value: btc, bch, eth, etc, xrp, qtum, iota, ltc', currency)
    return false
  }
 
  var url = 'https://api.coinone.co.kr/v2/order/complete_orders/';
    var payload = {
    'access_token': this.get_access_token(),
    'currency': currency,
    'nonce': Date.now()
  }
  return this.callPersonalAPI(url, payload)
}

// Order_V2 - My Limit Orders
coinoneAPI.prototype.myLimitOrders = function (currency) {
  // Allowed values: btc, bch, eth, etc, xrp, qtum, iota, ltc
  if (!isCurrency(currency)) {  
    console.error('myCompleteOrders: currency is NOT right value: btc, bch, eth, etc, xrp, qtum, iota, ltc', currency)
    return false
  }
 
  var url = 'https://api.coinone.co.kr/v2/order/limit_orders/';
    var payload = {
    'access_token': this.get_access_token(),
    'currency': currency,
    'nonce': Date.now()
  }
  return this.callPersonalAPI(url, payload)
}

// Account V2 - balance
coinoneAPI.prototype.balance = function () { 
  var payload = {
    'access_token': this.get_access_token(),
    'nonce': Date.now()
  }
  return this.callPersonalAPI('https://api.coinone.co.kr/v2/account/balance/', payload)
}

module.exports = coinoneAPI

module.exports.default = coinoneAPI
