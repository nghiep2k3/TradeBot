const ccxt = require("ccxt");
require("dotenv").config();

url = "https://api-testnet.bybit.com";

var apiKey = process.env.apiKey;
var secret = process.env.apiSecret;

const bybit = new ccxt.bybit({
  apiKey: apiKey,
  secret: secret,
});

bybit.set_sandbox_mode(true);

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

//Lấy thông tin vị thế đang mở
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

    console.log(45, CallAvgPrice);
    console.log(46, Leverage);
    console.log(51, MoneyAfterLeverage);
    console.log(52, SetUpTp);
    console.log(56, SetUpTpRoundedNumber);
    // console.log(SetUpTpRoundedNumber);

    await SetTp(symbol, side, SetUpTpRoundedNumber, So_luong);

    // Set up TP = Result
  } catch (error) {
    console.error("Error fetching position:", error);
  }
}

// thiết lập tp
async function SetTp(symbol, side, TakeProfit, So_luong) {
  var Tp = TakeProfit;

  const params = {
    takeProfit: {
      triggerPrice: Tp,
    },
  };
  try {
    await bybit.createOrder(symbol, "limit", side, So_luong, Tp, params);
  } catch (error) {
    console.error("Error fetching position:", error);
  }
}

// mở lệnh
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

    let MarketPrice = await fetchTicker(
      symbol,
      (params = { category: "linear" })
    );

    const CallAvgPrice = MarketPrice;
    let Leverage = leverage;

    var MoneyAfterLeverage = parseFloat(CallAvgPrice / Leverage);
    var SetUpTp = parseFloat(
      CallAvgPrice + (MoneyAfterLeverage * TakeProfitPecent) / 100
    );

    var SetUpTpRoundedNumber = Math.round(SetUpTp * 10) / 10;

    console.log("MarketPrice: ", MarketPrice);
    console.log("TakeProfit: ", SetUpTpRoundedNumber);

    SetTp(symbol, side, SetUpTpRoundedNumber);
  } catch (error) {
    console.error("Error fetching position:", error);
  }

  // return SetUpTpRoundedNumber;
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
  const So_luong = 1;
  const Leverage = 20;
  const TakeProfitPecent = 10;
  const Type = "Market";
  var side = "buy";

  await fetchPosition(symbol, side, So_luong, TakeProfitPecent);
  // await fetchTicker(symbol, { category: "linear" });
  // await closePosition(symbol, "Market", side, So_luong);
  // await openPosition(symbol, Type, side, So_luong, Leverage, TakeProfitPecent);
  // await print();

  // console.log("OK");
}

main();

async function runMain() {
  const interval = 10000; // Định nghĩa khoảng thời gian chờ trong mili giây (ở đây là 5 giây)
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

// runMain();


/* note
Đang gặp lỗi lấy giá cũ cộng vào để setTp



*/ 
