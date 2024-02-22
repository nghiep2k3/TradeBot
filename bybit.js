const crypto = require("crypto");
const axios = require("axios");
require('dotenv').config();

url = "https://api.bybit.com";

var apiKey = process.env.apiKeyMainet;
var secret = process.env.apiSecretMainet;
var recvWindow = 5000;

var symbol = "LOOMUSDT";
var So_luong = 2700;
var side = "Sell"

const orderLinkId = crypto.randomBytes(16).toString("hex");

//Khởi tạo chữ ký
function getSignature(parameters, secret, timestamp) {
  return crypto
    .createHmac("sha256", secret)
    .update(timestamp + apiKey + recvWindow + parameters)
    .digest("hex");
}

async function http_request(endpoint, method, data, Info) {
  timestamp = Date.now().toString();
  var sign = getSignature(data, secret, timestamp);

  if (method == "POST") {
    var fullendpoint = url + endpoint;
  } else {
    var fullendpoint = `https://api-testnet.bybit.com/v5/execution/list?category=linear&symbol=TRBUSDT`;
  }

  console.log("Data in https: ", data);
  console.log("http_request full: ", fullendpoint);

  //endpoint=url+endpoint

  var config = {
    method: method,
    url: fullendpoint,
    headers: {
      "X-BAPI-SIGN-TYPE": "2",
      "X-BAPI-SIGN": sign,
      "X-BAPI-API-KEY": apiKey,
      "X-BAPI-TIMESTAMP": timestamp,
      "X-BAPI-RECV-WINDOW": "5000",
      "Content-Type": "application/json; charset=utf-8",
    },
    data: data,
  };

  console.log(Info + " Calling....");
  await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });
}

async function Open(orderLinkId, symbol, side, So_luong) {
  // var data = '{"category":"linear","symbol": "BTCUSDT","side": "Buy", "orderType": "Market","qty": "0.001","orderLinkId": "' + orderLinkId + '"}';

  endpoint = "/v5/order/create";
  var orderInfo = {
    category: "linear",
    symbol: symbol,
    side: side,
    orderType: "Market",
    takeProfit: "37500",
    stopLoss: "36000",
    tpslMode: "Full",
    orderLinkId: orderLinkId,
  };

  var qty = So_luong;
  orderInfo.qty = qty.toString();

  var data = JSON.stringify(orderInfo);

  console.log("Open data ", data);
  await http_request(endpoint, "POST", data, "Create");
  console.log("Open Position");
}

async function ClosePosition(symbol, side, So_luong) {
  endpoint = "/v5/order/create";
  if(side == "Buy"){
    var temp = "Sell"
  }else{
    var temp = "Buy"
  }

  var orderInfo = {
    category: "linear",
    symbol: symbol,
    side: temp,
    orderType: "Market",
    reduceOnly: true,
  };

  var qty = So_luong;

  orderInfo.qty = qty.toString();
  var data = JSON.stringify(orderInfo);
  await http_request(endpoint, "POST", data, "Create");
  console.log("Close Position");
}


function closeOrderAfterDelay(symbol, side, So_luong) {
  setTimeout(() => {
    ClosePosition(symbol, side, So_luong);
  }, 200);
}
//Buy -Note
//Sáng mạng tốt cài 58s endtime = 1.6s
//Trưa mạng lag bắn lệnh cài 57s endtime = 2s
//7h tối nhanh cài 58s endtime = 1.6
//Tối mạng lag bắn lệnh cài 57s endtime = 2s
//Sell - Note
//7h tối nhanh cài 59s endtime = 1.2
async function CheckTime(orderLinkId, symbol, side, So_luong) {
  while (true) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    console.log(`Current time: ${hours}:${minutes}:${seconds}`);
    if (hours === 6 && minutes === 59 && seconds === 0) {
      // Open(orderLinkId, symbol, side, So_luong);
      console.log(`Vào lệnh lúc: ${hours}:${minutes}:${seconds}`);
      closeOrderAfterDelay(symbol, side, So_luong);
    }

    // Nếu chưa đến, đợi một giây rồi kiểm tra lại
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

CheckTime(orderLinkId, symbol, side, So_luong);
