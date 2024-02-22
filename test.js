// Mảng số nguyên cần tính trung bình
const numbers = [1, 2, 3, 4, 5];
const myArray = [];

// Sử dụng reduce để tính tổng các phần tử trong mảng
const sum = numbers.reduce((accumulator, currentValue) => {
  //   console.log("Total prev: ", accumulator);
  //   console.log("CurrentValue: ", currentValue);
  //   console.log("Total: ", accumulator + currentValue);
  return accumulator + currentValue;
}, 0);

// Tính trung bình bằng cách chia tổng cho số lượng phần tử
const average = sum / numbers.length;

// console.log(average);

function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

// Định nghĩa hàm cần gọi lại sau mỗi phút
function myFunction() {
    const randomNumber = getRandomNumber(1, 100);
    myArray.push(randomNumber);

  // Tính trung bình của mảng rỗng với reduce
  const sum = myArray.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);

  const average = (sum / myArray.length).toFixed(2);

  console.log("Mảng:", myArray);
  console.log("Giá trung bình", average);
}



// Gọi hàm đầu tiên
myFunction();

// Sử dụng setInterval để gọi lại hàm sau mỗi 1 phút (60 giây)
const intervalId = setInterval(myFunction, 10000); // 60000 milliseconds = 1 phút

// Để dừng việc gọi lại sau một thời gian nào đó (ví dụ: sau 5 phút), bạn có thể sử dụng clearTimeout
setTimeout(() => {
  clearInterval(intervalId); // Dừng việc gọi lại
  console.log("Dừng gọi lại sau 5 phút.");
}, 300000); // 300000 milliseconds = 5 phút
