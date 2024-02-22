const crypto = require("crypto");
const axios = require("axios");
const ccxt  = require("ccxt");
require("dotenv").config();

url = "https://api-testnet.bybit.com";

var apiKey = process.env.apiKey;
var secret = process.env.apiSecret;
var recvWindow = 5000;

// Nhập tên đồng tiền, số lượng, mua hay bán
var symbol = "BTCUSDT";
var So_luong = 5;
var side = "Buy";

// Đòn bẩy muốn cài
const Leverage = 10;

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
    var fullendpoint = `https://api-testnet.bybit.com/v5/execution/list?category=linear&symbol=BTCUSDT`;
  }

  console.log("Data : ", data);
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
      // console.log(JSON.stringify(response.data));
      console.log(response.data);
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
    takeProfit: "60500",
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

async function Open_Limit(orderLinkId, symbol, side, So_luong) {
  // var data = '{"category":"linear","symbol": "BTCUSDT","side": "Buy", "orderType": "Market","qty": "0.001","orderLinkId": "' + orderLinkId + '"}';

  endpoint = "/v5/order/create";
  var orderInfo = {
    category: "linear",
    symbol: symbol,
    side: side,
    orderType: "Limit",
    price: "30000",
    takeProfit: "36500",
    stopLoss: "28000",
    tpslMode: "Full",
    orderLinkId: orderLinkId,
  };

  var qty = So_luong;
  orderInfo.qty = qty.toString();

  var data = JSON.stringify(orderInfo);

  console.log("Open data ", data);
  await http_request(endpoint, "POST", data, "Create Limit");
  console.log("Open Position");
}

async function ClosePosition(symbol, side, So_luong) {
  endpoint = "/v5/order/create";
  if (side == "Buy") {
    var temp = "Sell";
  } else {
    var temp = "Buy";
  }

  var orderInfo = {
    category: "linear",
    symbol: symbol,
    side: temp,
    orderType: "Market",
    reduceOnly: true,
  };

  var qty = So_luong;
  console.log(qty);
  orderInfo.qty = qty.toString();
  var data = JSON.stringify(orderInfo);
  await http_request(endpoint, "POST", data, "Create");
  console.log("Close Position");
}

// Đóng limit order
async function Close_Limit(symbol) {
  endpoint = "/v5/order/cancel";

  var orderInfo = {
    category: "linear",
    symbol: symbol,
    orderId: "083adf5d-5c93-46dd-ac50-bbc078d56d31",
    orderLinkId: "7f3dd24355e6ae9ed35bf101176fba4b",
    orderFilter: "Order",
  };

  var data = JSON.stringify(orderInfo);
  await http_request(endpoint, "POST", data, "Create");
  console.log("Close Position");
}

// đặt vị thế
async function Set_leverage(symbol, Leverage) {
  endpoint = "/v5/position/set-leverage";
  console.log(Leverage);

  var orderInfo = {
    category: "linear",
    symbol: symbol,
    buyLeverage: Leverage,
    sellLeverage: Leverage,
  };

  var data =
    '{\n  "category": "linear",\n  "symbol": "BNBUSDT",\n  "buyLeverage": "10",\n  "sellLeverage": "10"\n}';
  await http_request(endpoint, "POST", data, "Leverage");
  console.log("Leverage success");
}

// Mở lệnh
Open(orderLinkId, symbol, side, So_luong);
// Open_Limit(orderLinkId, symbol, side, So_luong);

// Cài đòn bẩy
// Set_leverage(symbol, Leverage);

//Đóng vị thế đang mở
// ClosePosition(symbol, side, So_luong);

//Đóng lệnh đang chờ mở
// Close_Limit(symbol);

async function CheckTime(orderLinkId, symbol, side, So_luong) {
  while (true) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    console.log(`Current time: ${hours}:${minutes}:${seconds}`);

    if (hours === 1 && minutes === 1 && seconds === 0) {
      Open(orderLinkId, symbol, side, So_luong);
      console.log(`Vào lệnh lúc: ${hours}:${minutes}:${seconds}`);
      // closeOrderAfterDelay(symbol, side, So_luong);
    }

    // Nếu chưa đến, đợi một giây rồi kiểm tra lại
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

// CheckTime(orderLinkId, symbol, side, So_luong);
