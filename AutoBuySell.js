const crypto = require("crypto");
const axios = require("axios");
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
  console.log("para: ", parameters);
  console.log(
    "chữ ký: ",
    crypto
      .createHmac("sha256", secret)
      .update(timestamp + apiKey + recvWindow + parameters)
      .digest("hex")
  );
  return crypto
    .createHmac("sha256", secret)
    .update(timestamp + apiKey + recvWindow + parameters)
    .digest("hex");
}

// tạo resquet
async function http_request(endpoint, method, data, Info) {
  timestamp = Date.now().toString();
  var sign = getSignature(data, secret, timestamp);

  if (method == "POST") {
    var fullendpoint = url + endpoint;
  } else {
    var fullendpoint = `https://api-testnet.bybit.com/v5/position/list?category=linear&symbol=BTCUSDT&settleCoin=BTCUSDT`;
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
      "X-BAPI-RECV-WINDOW": "20000",
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
      // console.log(error);
      console.log("Lỗi");
    });
}

async function Pnl(symbol) {
  var endpoint = "/v5/position/list";

  var orderInfo = {
    category: "linear",
    symbol: symbol,
    settleCoin: "linear"
  };

  var data = JSON.stringify(orderInfo);
  console.log("Open data ", data);
  await http_request(endpoint, "GET", data, "PNL");
  console.log("Thành công");
}

// đặt lệnh market
async function Open(orderLinkId, symbol, side, So_luong) {
  // var data = '{"category":"linear","symbol": "BTCUSDT","side": "Buy", "orderType": "Market","qty": "0.001","orderLinkId": "' + orderLinkId + '"}';

  endpoint = "/v5/order/create";
  var orderInfo = {
    category: "linear",
    symbol: symbol,
    side: side,
    orderType: "Market",
    tpslMode: "Full",
    orderLinkId: orderLinkId,
  };

  var qty = So_luong;
  orderInfo.qty = qty.toString();

  var data = JSON.stringify(orderInfo);

  console.log("Open data ", data);
  await http_request(endpoint, "POST", data, "Create");
  console.log("Mở lệnh thành công");
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
    '{\n  "category": "linear",\n  "symbol": "BTCUSDT",\n  "buyLeverage": "10",\n  "sellLeverage": "10"\n}';
  await http_request(endpoint, "POST", data, "Leverage");
  console.log("Leverage success");
}

// Mở lệnh thị trường
// Open(orderLinkId, symbol, side, So_luong);

// PNL
Pnl(symbol);

// Cài đòn bẩy
// Set_leverage(symbol, Leverage);

//Đóng vị thế đang mở
// ClosePosition(symbol, side, So_luong);
