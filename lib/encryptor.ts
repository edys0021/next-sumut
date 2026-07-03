import CryptoJS from "crypto-js";

export default function e(payload: string) {
    const salt = rdsng()
    const hash = CryptoJS.SHA512(salt + process.env.NEXT_PUBLIC_SEC).toString();
    const key = hash.substring(32, 64);
    const encrypted = CryptoJS.AES.encrypt(payload, CryptoJS.enc.Utf8.parse(key), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
    });
    return salt + encrypted.toString();
}

const rdsng = () => {
    const chars =
        "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = 32; i > 0; --i)
        result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}
