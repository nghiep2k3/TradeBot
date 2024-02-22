const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

url = "https://api.bybit.com";

var apiKey = process.env.apiKeyMainet;
var secret = process.env.apiSecretMainet;
var recvWindow = 5000;

// Nhập tên đồng tiền, số lượng, mua hay bán
var symbol = "SOLUSDT";
var tien = 11;
var donbay = 10;
var priceMarket = 55;

var So_luong = (parseFloat((tien * donbay / priceMarket).toFixed(2))).toString();
console.log(So_luong);
var side = "Buy";
var price = "55";
var takeProfit = "58";
var stopLoss = "52";

// Đòn bẩy muốn cài
// Cài đặt đòn bẩy cần phải chỉnh tên đồng coin ở dưới dòng 175, vì k nhận chuyển đổi thành json
const Leverage = "20";

//Id lệnh sắp đóng
const Id1 = '86ba1065-32a8-45d0-8cb4-492d9e93fd7f';
const Id2 = 'a65a8f3682519f20e1f9e0c1c5f54f74';


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


async function Open_Limit(orderLinkId, symbol, side, So_luong, price, takeProfit, stopLoss) {
  endpoint = "/v5/order/create";

  var orderInfo = {
    category: "linear",
    symbol: symbol,
    side: side,
    orderType: "Limit",
    price: price,
    takeProfit: takeProfit,
    stopLoss: stopLoss,
    tpslMode: "Full",
    orderLinkId: orderLinkId,
    qty: So_luong,
  };


  var data = JSON.stringify(orderInfo);

  console.log("Open data ", data);
  await http_request(endpoint, "POST", data, "Create Limit");
  console.log("Open Position");
  console.log("Nhớ lưu lại ID để còn hủy lệnh");
  console.log("Nhớ lưu lại ID để còn hủy lệnh");
  console.log("Nhớ lưu lại ID để còn hủy lệnh");
  console.log("Nhớ lưu lại ID để còn hủy lệnh");
  console.log("Nhớ lưu lại ID để còn hủy lệnh");
  console.log("Nhớ lưu lại ID để còn hủy lệnh");
  console.log("Nhớ lưu lại ID để còn hủy lệnh");
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
async function Close_Limit(symbol, Id1, Id2) {
  endpoint = "/v5/order/cancel";

  var orderInfo = {
    category: "linear",
    symbol: symbol,
    orderId: Id1,
    orderLinkId: Id2,
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
    sellLeverage: Leverage
  };

  var data = JSON.stringify(orderInfo);

  // var data =
  //   '{\n  "category": "linear",\n  "symbol": "BTCUSDT",\n  "buyLeverage": "20",\n  "sellLeverage": "20"\n}';
  
    await http_request(endpoint, "POST", data, "Leverage");

  console.log("Leverage success");
}

// Mở lệnh
// Open_Limit(orderLinkId, symbol, side, So_luong, price, takeProfit, stopLoss);

// Cài đòn bẩy
// Set_leverage(symbol, Leverage);

//Đóng vị thế đang mở
// ClosePosition(symbol, side, So_luong);

//Đóng lệnh đang chờ mở
Close_Limit(symbol, Id1, Id2);


