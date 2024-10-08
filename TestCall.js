const ccxt = require("ccxt");
const axios = require("axios");
const crypto = require("crypto");

require("dotenv").config();

url = "https://api-testnet.bybit.com";

var apiKey = process.env.apiKey;
var secret = process.env.apiSecret;

const bybit = new ccxt.bybit({
  apiKey: apiKey,
  secret: secret,
});

bybit.set_sandbox_mode(true);

//Code chay
function getSignature(parameters, secret, timestamp) {
  var recvWindow = 5000;
  return crypto
    .createHmac("sha256", secret)
    .update(timestamp + apiKey + recvWindow + parameters)
    .digest("hex");
}
async function http_request(endpoint, method, data, Info) {
  var timestamp = Date.now().toString();
  var sign = getSignature(data, secret, timestamp);
  var fullendpoint;

  if (method === "POST") {
    fullendpoint = url + endpoint;
  } else {
    fullendpoint = url + endpoint + "?" + data;
    data = "";
  }

  var headers = {
    "X-BAPI-SIGN-TYPE": "2",
    "X-BAPI-SIGN": sign,
    "X-BAPI-API-KEY": apiKey,
    "X-BAPI-TIMESTAMP": timestamp,
    "X-BAPI-RECV-WINDOW": "5000",
  };

  if (method === "POST") {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  var config = {
    method: method,
    url: fullendpoint,
    headers: headers,
    data: data,
  };

  console.log(Info + " Calling....");
  await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error.response.data);
    });
}

async function SetTpSl(symbol, TakeProfit, StopLoss) {
  endpoint = "/v5/position/trading-stop";

  var data1 = {
    category: "linear",
    symbol: symbol,
    takeProfit: TakeProfit.toString(),
    stopLoss: null,
    tpSize: null,
    slSize: null,
    tpTriggerBy: "MarkPrice",
    slTriggerBy: "MarkPrice",
    trailingStop: null,
    activePrice: null,
    positionIdx: 0,
    tpLimitPrice: null,
    slLimitPrice: null,
    tpOrderType: null,
    slOrderType: null,
  };
  var data = JSON.stringify(data1);
  await http_request(endpoint, "POST", data, "Create");
}

async function print() {
  const balance = await bybit.fetchBalance();
  // console.log(balance);
  console.log(balance.info.result);
}

// call future
async function fetchTicker(symbol, params = { category: "linear" }) {
  try {
    const rawTicker = await bybit.fetchTicker(symbol, params);
    var x = bybit.parseTicker(rawTicker, (params = { category: "linear" }));
    // console.log(x);
    var MarketPrice = parseFloat(x.info.info?.markPrice);
    console.log("2222", MarketPrice);
  } catch (error) {
    throw error;
  }

  return MarketPrice;
}

//Lấy thông tin vị thế đang mở rồi mở lệnh
async function fetchPosition(symbol, side, So_luong, TakeProfitPecent) {
  try {
    const positions = await bybit.fetchPosition(
      symbol,
      (params = { settleCoin: "linear" })
    );
    console.log(positions);
    const CallAvgPrice = parseFloat(positions.info.avgPrice);
    const Leverage = parseFloat(positions.info.leverage);

    // tiền thật = EntryPrice / đòn bẩy
    // (EntryPrice + (tiền thật * 2 / 100)).totoFixed(1)

    var MoneyAfterLeverage = parseFloat(CallAvgPrice / Leverage);
    var SetUpTp = parseFloat(
      CallAvgPrice + (MoneyAfterLeverage * TakeProfitPecent) / 100
    );

    var SetUpTpRoundedNumber = Math.round(SetUpTp * 10) / 10;

    console.log(123, CallAvgPrice);
    console.log(124, Leverage);
    console.log(129, MoneyAfterLeverage);
    console.log(130, SetUpTp);
    console.log(134, SetUpTpRoundedNumber);
    // console.log(SetUpTpRoundedNumber);

    SetTpSl(symbol, SetUpTpRoundedNumber);

    // Set up TP = Result
  } catch (error) {
    console.error("Error fetching position:", error);
  }
}

// mở lệnh trực tiếp
async function openPosition(
  symbol,
  type,
  side,
  So_luong,
  leverage,
  TakeProfitPecent
) {
  // chạy lần đầu tiên
  try {
    // chạy lần đầu tiên vì chưa có lệnh nên chưa thể lấy giá trung bình, phải gọi giá thị trường cài tp tăng 2%
    bybit.createOrder(symbol, type, side, So_luong);
    const positions = await bybit.fetchPosition(
      symbol,
      (params = { settleCoin: "linear" })
    );
    console.log(positions);
    //khi mở lệnh mua thì công thức chốt lời
    const CallAvgPrice = parseFloat(positions.info.avgPrice);
    const Leverage = leverage;
    var MoneyAfterLeverage = parseFloat(CallAvgPrice / Leverage);

    var SetupTp;
    if (side == "buy") {
      SetupTp = parseFloat(CallAvgPrice + (MoneyAfterLeverage * TakeProfitPecent) / 100);
    }
    else{
      SetupTp = parseFloat(CallAvgPrice - (MoneyAfterLeverage * TakeProfitPecent) / 100);
    }

    var SetUpTpRoundedNumber = Math.round(SetupTp * 10) / 10;

    // khi mở lệnh bán thì công thức chốt lời

    console.log("MarketPrice: ", CallAvgPrice);
    console.log("TakeProfit: ", SetUpTpRoundedNumber);

    SetTpSl(symbol, SetUpTpRoundedNumber);
  } catch (error) {
    console.error("Error fetching position:", error);
  }

  // return SetUpTpRoundedNumber;
}

//kiểm tra lên mua tiếp hay tạo mới
async function CheckPosition(
  symbol,
  type,
  side,
  So_luong,
  Leverage,
  TakeProfitPecent
) {
  try {
    const positions = await bybit.fetchPosition(
      symbol,
      (params = { settleCoin: "linear" })
    );
    console.log(positions);
    console.log("Contracts", positions.contracts);
    let Contracts = positions.contracts;
    if (Contracts > 0) {
      await bybit.createOrder(symbol, "market", side, So_luong);
      fetchPosition(symbol, side, So_luong, TakeProfitPecent);
    } else {
      openPosition(symbol, type, side, So_luong, Leverage, TakeProfitPecent);
    }
  } catch (error) {
    console.error("Error fetching position:", error);
  }
}

// đóng lệnh
async function closePosition(symbol, type, side, So_luong) {
  // lấy vị thế trỏ vào số lượng hợp đồng
  var temp;
  if (side == "Buy") {
    temp = "Sell";
  } else {
    temp = "Buy";
  }

  try {
    await bybit.createOrder(
      symbol,
      type,
      temp,
      So_luong,
      (params = { reduceOnly: true })
    );
    // console.log(positions);
  } catch (error) {
    console.error("Error fetching position:", error);
  }
}

// nguồn chạy chương trình
async function main() {
  // Nhập tên đồng tiền, số lượng, mua hay bán
  const symbol = "ETHUSDT";
  const So_luong = 0.1;
  const Leverage = 20;
  const TakeProfitPecent = 20;
  const Type = "Market";
  var side = "buy";

  // await fetchPosition(symbol, side, So_luong, TakeProfitPecent);
  // await fetchTicker(symbol, { category: "linear" });
  // await closePosition(symbol, "Market", side, So_luong);
  await openPosition(symbol, Type, side, So_luong, Leverage, TakeProfitPecent);
  // await print();
  // await CheckPosition(symbol, Type, side, So_luong, Leverage, TakeProfitPecent);

  // console.log("OK");
}

// main();

async function runMain() {
  const interval = 20000; // Định nghĩa khoảng thời gian chờ trong mili giây (ở đây là 5 giây)
  let startTime, endTime, elapsedTime;

  while (true) {
    startTime = new Date(); // Bắt đầu tính thời gian chạy
    await main();
    endTime = new Date(); // Kết thúc thời gian chạy
    elapsedTime = endTime - startTime; // Tính thời gian đã trôi qua

    if (elapsedTime < interval) {
      // Nếu thời gian chạy hàm main() nhỏ hơn khoảng thời gian chờ
      await new Promise((resolve) =>
        setTimeout(resolve, interval - elapsedTime)
      );
    }
  }
}

runMain();

/* note
Đang gặp lỗi lấy giá cũ cộng vào để setTp

task 1: lý thuyết phải mua hoàn chỉnh rồi mới setTp (đã xử lý)

task 2: nếu có lệnh thì chạy fetchPosition, k có thì chạy lệnh open (đã xử lý)



*/
