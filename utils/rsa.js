// Fungsi untuk Menghitung GCD (Greatest Common Divisor)
function gcd(a, b) {
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b);
}

// Fungsi untuk Menghitung Modulo Invers (Extended Euclidean Algorithm)
function modInverse(e, phi) {
  let m0 = phi,
    t,
    q;
  let x0 = 0,
    x1 = 1;
  if (phi === 1) return 0;
  while (e > 1) {
    q = Math.floor(e / phi);
    t = phi;
    phi = e % phi;
    e = t;
    t = x0;
    x0 = x1 - q * x0;
    x1 = t;
  }
  if (x1 < 0) x1 += m0;
  return x1;
}

// Fungsi untuk Menghasilkan Kunci RSA
export function generateKeys() {
  const p = 61; // Bilangan prima pertama (gunakan bilangan prima yang lebih besar untuk keamanan yang lebih baik)
  const q = 53; // Bilangan prima kedua (gunakan bilangan prima yang lebih besar untuk keamanan yang lebih baik)
  const n = p * q;
  const phi = (p - 1) * (q - 1);
  const e = 65537; // Eksponen umum yang sering digunakan

  // Pastikan e relatif prima dengan phi
  if (gcd(e, phi) !== 1) {
    throw new Error("e and phi are not coprime");
  }

  const d = modInverse(e, phi);

  return {
    publicKey: { e, n },
    privateKey: { d, n },
  };
}

// Fungsi untuk Enkripsi
export function encrypt(message, publicKey) {
  const { e, n } = publicKey;
  return message
    .split("")
    .map((char) => {
      const m = char.charCodeAt(0);
      return BigInt(m) ** BigInt(e) % BigInt(n);
    })
    .join(" ");
}

// Fungsi untuk Dekripsi
export function decrypt(encryptedMessage, privateKey) {
  const { d, n } = privateKey;
  return encryptedMessage
    .split(" ")
    .map((c) => {
      const m = BigInt(c) ** BigInt(d) % BigInt(n);
      return String.fromCharCode(Number(m));
    })
    .join("");
}

// Contoh Penggunaan
// const keys = generateKeys();
// const publicKey = keys.publicKey;
// const privateKey = keys.privateKey;

// const message = "HELLO";
// console.log("Original Message:", message);

// const encryptedMessage = encrypt(message, publicKey);
// console.log("Encrypted Message:", encryptedMessage);

// const decryptedMessage = decrypt(encryptedMessage, privateKey);
// console.log("Decrypted Message:", decryptedMessage);
