import CryptoJS from "crypto-js";

const secretKey = process.env.NEXT_PUBLIC_CRYPTO_JS_SECRET_KEY!;

export function encrypt(plainText: string) {
  const encrypted = CryptoJS.AES.encrypt(plainText, secretKey).toString();

  let base64String = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(encrypted),
  );

  base64String = base64String
    .replace(/\+/g, "_")
    .replace(/\//g, "-")
    .replace(/=/g, "");

  return base64String;
}

export function decryptString(encryptedString: string) {
  let base64String = encryptedString.replace(/_/g, "+").replace(/-/g, "/");

  while (base64String.length % 4 !== 0) {
    base64String += "=";
  }

  const encryptedBytes = CryptoJS.enc.Base64.parse(base64String).toString(
    CryptoJS.enc.Utf8,
  );
  const decrypted = CryptoJS.AES.decrypt(encryptedBytes, secretKey);

  return decrypted.toString(CryptoJS.enc.Utf8);
}
