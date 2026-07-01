var CryptoJS = require("crypto-js");

export default function e(payload: string) {
    let salt = rdsng()
    let key = salt + process.env.NEXT_PUBLIC_SEC;
    key = CryptoJS.SHA512(key);
    key = key.toString();
    key = key.substring(32, 64);
    let encrypted = CryptoJS.AES.encrypt(payload, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return salt + encrypted.toString();
}

const rdsng = () => {
    const chars =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    var result = "";
    for (var i = 32; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}