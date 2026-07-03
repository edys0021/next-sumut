declare module "crypto-js" {
  type CryptoValue = {
    toString(encoder?: unknown): string;
  };

  const CryptoJS: {
    AES: {
      decrypt(data: string, key: unknown, options: unknown): CryptoValue;
      encrypt(data: string, key: unknown, options: unknown): CryptoValue;
    };
    SHA512(data: string): CryptoValue;
    enc: {
      Utf8: {
        parse(data: string): unknown;
      };
    };
    mode: {
      ECB: unknown;
    };
    pad: {
      Pkcs7: unknown;
    };
  };

  export default CryptoJS;
}
