const ccxt = require('ccxt');

var apiKey = "eI0cjNpQ3Uv76Vfvz3";
var secret = "Czm11xznxgFTKRACzDAcfEaGEOgyJ9Vh1ZXI";

const openPricesArray = [];

const fetchDataAndPushToArray = async () => {
  try {
    // Khởi tạo một đối tượng sàn Bybit từ thư viện CCXT
    const exchange = new ccxt.bybit({
      apiKey: apiKey,
      secret: secret
    });
    exchange.set_sandbox_mode(true);

    // Lấy thông tin giá của cặp giao dịch BTC/USDT trên thị trường future
    const prices = await exchange.fetchOHLCV("BNBUSDT", "1s", undefined, 1);

    const formatPrices = prices.map((x) => {
      return {
        time: x[0],
        open: x[1],
        high: x[2],
        low: x[3],
        close: x[4]
      };
    });

    const openPrice = formatPrices[0].open;
    
    // Đẩy giá trị openPrice vào mảng openPricesArray
    openPricesArray.push(openPrice);

    console.log(openPricesArray);
  } catch (error) {
    console.error(error);
  }
};

const intervalId = setInterval(fetchDataAndPushToArray, 62000); // Gọi hàm mỗi 1 phút 2 giây


// Để dừng việc gọi hàm sau một khoảng thời gian nào đó (ví dụ: sau 5 phút)
// Comment dòng sau nếu không muốn dừng tự động
setTimeout(() => clearInterval(intervalId), 300000); // 300000 milliseconds = 5 minutes

fetchDataAndPushToArray();