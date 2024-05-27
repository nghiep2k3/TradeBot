const ccxt = require("ccxt");
const axios = require("axios");
const crypto = require("crypto");

require("dotenv").config();

url = "https://api-testnet.bybit.com";

var apiKey = process.env.apiKey;
var secret = process.env.apiSecret;
var PercentAdd = 0;

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

  // console.log(Info + " Calling....");
  await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
      console.log("Ok");
    })
    .catch(function (error) {
      // console.log(error.response.data);
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

//Lấy thông tin vị thế đang mở rồi mở lệnh
async function fetchPosition(symbol, side, So_luong, TakeProfitPecent) {
  try {
    const positions = await bybit.fetchPosition(
      symbol,
      (params = { settleCoin: "linear" })
    );
    // console.log(positions);
    const CallAvgPrice = parseFloat(positions.info.avgPrice);
    const Leverage = parseFloat(positions.info.leverage);

    var MoneyAfterLeverage = parseFloat(CallAvgPrice / Leverage);
    var SetupTp = 0;
    PercentAdd = PercentAdd + 0.1;
    if (side == "buy") {
      SetupTp = parseFloat(
        CallAvgPrice +
          (MoneyAfterLeverage * (TakeProfitPecent + PercentAdd)) / 100
      );
    } else {
      SetupTp = parseFloat(
        CallAvgPrice -
          (MoneyAfterLeverage * (TakeProfitPecent + PercentAdd)) / 100
      );
    }

    var SetUpTpRoundedNumber = Math.round((SetupTp + PercentAdd) * 10) / 10;

    // console.log(123, CallAvgPrice);
    // console.log(124, Leverage);
    // console.log(129, MoneyAfterLeverage);
    // console.log(110, TakeProfitPecent + PercentAdd);
    // console.log(130, SetupTp);
    // console.log(134, SetUpTpRoundedNumber);

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
    //lấy thông tin vị thế
    const positions = await bybit.fetchPosition(
      symbol,
      (params = { settleCoin: "linear" })
    );
    // console.log(positions);

    const CallAvgPrice = parseFloat(positions.info.avgPrice);
    const Leverage = leverage;

    var MoneyAfterLeverage = parseFloat(CallAvgPrice / Leverage);
    var SetupTp = 0;
    if (side == "buy") {
      SetupTp = parseFloat(
        CallAvgPrice + (MoneyAfterLeverage * TakeProfitPecent) / 100
      );
    } else {
      SetupTp = parseFloat(
        CallAvgPrice - (MoneyAfterLeverage * TakeProfitPecent) / 100
      );
    }
    // var SetUpTpRoundedNumber = Math.round(SetupTp * 10) / 10;

    console.log(MoneyAfterLeverage);
    console.log("MarketPrice: ", CallAvgPrice);
    console.log(SetupTp);
    // console.log("TakeProfit: ", SetUpTpRoundedNumber);

    SetTpSl(symbol, SetupTp);
  } catch (error) {
    console.error("Error fetching position:", error);
  }
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
    // console.log(positions);
    // console.log("Contracts", positions.contracts);
    let Contracts = positions.contractSize;
    let unPnl = positions.unrealizedPnl;

    if (Contracts > 0 && unPnl < 0) {
      await bybit.createOrder(symbol, type, side, So_luong);
      fetchPosition(symbol, side, So_luong, TakeProfitPecent);
    } else if (unPnl > 0 && Contracts > 0) {
      console.log("Bỏ qua vì PNL đang dương.... !");
    } else {
      console.log("Đã mua");
      await bybit.createOrder(symbol, type, side, So_luong);
      openPosition(symbol, type, side, So_luong, Leverage, TakeProfitPecent);
    }
  } catch (error) {
    console.error("Error fetching position:", error);
  }
}

// nguồn chạy chương trình
async function main() {
  // Nhập tên đồng tiền, số lượng, mua hay bán
  const symbol = "BTCUSDT";
  const So_luong = 0.003;
  const Leverage = 20;
  const TakeProfitPecent = 3;
  const Type = "Market";
  var side = "buy";

  // await openPosition(symbol, Type, side, So_luong, Leverage, TakeProfitPecent);
  await CheckPosition(symbol, Type, side, So_luong, Leverage, TakeProfitPecent);
}

// main();

async function runMain() {
  const interval = 300000; // 15 phút = 15 * 60 * 1000 = 900000 milliseconds
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
