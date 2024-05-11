const fs = require('fs');

// Hàm để giải mã dữ liệu theo mã hóa Caesar
function caesarDecrypt(text, shift) {
    return text.replace(/[\x00-\x7F]/g, function(char) {
        let code = char.charCodeAt(0);
        if (code >= 32 && code <= 126) {
            return String.fromCharCode(((code - 32 - shift + 95) % 95) + 32);
        }
    });
}



// Tên file chứa dữ liệu đã mã hóa
const encryptedFile = `D:\\h1a2h3w2out.txt`;

// Tên file chứa dữ liệu giải mã
const decryptedFile = `D:\\h1a2h3w2.txt`;

// Đọc nội dung từ file đã mã hóa
fs.readFile(encryptedFile, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    // Giải mã dữ liệu theo mã hóa Caesar với shift = 3 (cùng shift khi mã hóa)
    const decryptedData = caesarDecrypt(data, 3);

    // Ghi dữ liệu đã giải mã vào file mới
    fs.writeFile(decryptedFile, decryptedData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return;
        }
        console.log('File decrypted and saved as', decryptedFile);
    });
});
