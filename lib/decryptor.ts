import CryptoJS from "crypto-js";

export default function d(content: string) {
    if (content) {
        const salt = content.substring(0, 32);
        const hash = CryptoJS.SHA512(salt + process.env.NEXT_PUBLIC_SEC).toString();
        const key = hash.substring(32, 64);
        const data = content.substring(32, content.length)
        const decrypted = CryptoJS.AES.decrypt(data, CryptoJS.enc.Utf8.parse(key), {
            mode: CryptoJS.mode.ECB,
            padding: CryptoJS.pad.Pkcs7,
        });
        return decrypted.toString(CryptoJS.enc.Utf8)
    }

    return "";
}
