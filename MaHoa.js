const fs = require("fs");

// Hàm để mã hóa dữ liệu theo mã hóa Caesar
function caesarEncrypt(text, shift) {
  return text.replace(/[\x00-\x7F]/g, function (char) {
    let code = char.charCodeAt(0);
    if (code >= 32 && code <= 126) {
      return String.fromCharCode(((code - 32 + shift) % 95) + 32);
    }
  });
}

// Tên file chứa dữ liệu đầu vào
const inputFile = `D:\\h1a2h3w2.txt`;

// Tên file chứa dữ liệu đã mã hóa
const outputFile = `D:\\h1a2h3w2out.txt`;

// Đọc nội dung từ file đầu vào
fs.readFile(inputFile, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }

  // Mã hóa dữ liệu theo mã hóa Caesar với shift = 3
  const encryptedData = caesarEncrypt(data, 3);

  // Ghi dữ liệu đã mã hóa vào file đầu ra
  fs.writeFile(outputFile, encryptedData, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File encrypted and saved as", outputFile);
  });
});
