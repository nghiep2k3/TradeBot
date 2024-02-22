const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

url = "https://api.bybit.com";

var apiKey = process.env.apiThanhTruc;
var secret = process.env.apiSecretThanhTruc;
var recvWindow = 5000;

// Nhập tên đồng tiền, số lượng, mua hay bán
var symbol = "ETHUSDT";
var tien = 11;
var donbay = 10;
var priceMarket = 55;

var So_luong = "0.1";
console.log(So_luong);
var side = "Buy";
var price = "2012.5";
var takeProfit = "2052";
var stopLoss = "1978";

// Đòn bẩy muốn cài
// Cài đặt đòn bẩy cần phải chỉnh tên đồng coin ở dưới dòng 175, vì k nhận chuyển đổi thành json
const Leverage = "10";

//Id lệnh sắp đóng
const Id1 = '17cc6f1e-7e4f-4cf5-83a9-74bc90f18858';
const Id2 = 'd31e6f75d58a542e57a5a5ea3d0196a5';


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
Open_Limit(orderLinkId, symbol, side, So_luong, price, takeProfit, stopLoss);

// Cài đòn bẩy
// Set_leverage(symbol, Leverage);

//Đóng vị thế đang mở
// ClosePosition(symbol, side, So_luong);

//Đóng lệnh đang chờ mở
// Close_Limit(symbol, Id1, Id2);


