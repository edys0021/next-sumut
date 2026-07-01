var CryptoJS = require("crypto-js");

export default function d(content: string) {
    if (content) {
        let salt = content.substring(0, 32);
        let key = salt + process.env.NEXT_PUBLIC_SEC;
        key = CryptoJS.SHA512(key);
        key = key.toString();
        key = key.substring(32, 64);
        let data = content.substring(32, content.length)
        let decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8)
    }
}