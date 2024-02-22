const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

url = "https://api-testnet.bybit.com";

var apiKey = process.env.apiKey;
var secret = process.env.apiSecret;
var recvWindow = 5000;

// Nhập tên đồng tiền, số lượng, mua hay bán
var symbol = "BNBUSDT";
var So_luong = 5;
var side = "Buy";

const myArray = [];
var flag = 0;

const orderLinkId = crypto.randomBytes(16).toString("hex");

//Khởi tạo chữ ký
function getSignature(parameters, secret, timestamp) {
  return crypto
    .createHmac("sha256", secret)
    .update(timestamp + apiKey + recvWindow + parameters)
    .digest("hex");
}

async function http_request_tick(symbol, orderLinkId, side, So_luong) {
  let config = {
    method: "get",
    url: `https://api-testnet.bybit.com/v5/market/tickers?category=linear&symbol=${symbol}`,
    headers: {},
  };

  axios(config)
    .then((response) => {
      // console.log(JSON.stringify(response.data));
      // console.log(response.data.result);
      let temp = response.data.result.list[0].markPrice;
      console.log(temp);
      myArray.push(parseFloat(temp));
      TrungBinh();
      flag++;
      BuyOrSell(orderLinkId, symbol, side, So_luong)
    })
    .catch((error) => {
      console.log(error);
    });
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

async function priceMarket(symbol, orderLinkId, side, So_luong) {
  await http_request_tick(symbol, orderLinkId, side, So_luong);
}

async function BuyOrSell(orderLinkId, symbol, side, So_luong) {
  if (flag == 1) {
    console.log("Next");
  } else {
    if (myArray[myArray.length - 1] <= myArray[myArray.length - 2]) {
      console.log("Giá trị cuối cùng: ", myArray[myArray.length - 1]);
      console.log("Giá trị trước đó: ", myArray[myArray.length - 2]);
      // Open(orderLinkId, symbol, side, So_luong)
      console.log("Buy");
    } else {
      console.log("Giá trị cuối cùng: ", myArray[myArray.length - 1]);
      console.log("Giá trị trước đó: ", myArray[myArray.length - 2]);
      // Open(orderLinkId, symbol, "Sell", So_luong)
      console.log("Sell");
    }
  }
}

async function TrungBinh() {
  const sum = myArray.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);

  const average = (sum / myArray.length).toFixed(2);

  console.log("Mảng:", myArray);
  console.log("Giá trung bình", average);
}
async function Open(orderLinkId, symbol, side, So_luong) {
  endpoint = "/v5/order/create";
  var orderInfo = {
    category: "linear",
    symbol: symbol,
    side: side,
    orderType: "Market",
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

// Mở lệnh
// Open(orderLinkId, symbol, side, So_luong);

//Đóng vị thế đang mở
// ClosePosition(symbol, side, So_luong);

//Lấy giá trị trường
// priceMarket(symbol);

async function CheckTime(orderLinkId, symbol, side, So_luong) {
  while (true) {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    console.log(`Current time: ${hours}:${minutes}:${seconds}`);
    priceMarket(symbol);

    // Nếu chưa đến, đợi một giây rồi kiểm tra lại
    await new Promise((resolve) => setTimeout(resolve, 60000));
  }
}
// 1s = 1000
CheckTime(orderLinkId, symbol, side, So_luong);
