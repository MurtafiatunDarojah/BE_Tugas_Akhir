//  Fungsi untuk Menghitung GCD (Greatest Common Divisor)
function gcd(a, b) { // gcb(61,53)
  if (b === 0) {
    return a;
  }
  return gcd(b, a % b); 
  // gcd(53, 61 % 53) = gdc(53,8)
  // gcd(8, 53 % 8) = gcd(8,5)
  //gcd(5, 8 % 5) = gcd(5,3)
  //hasil gcd (61,53)=5
} 

// Fungsi untuk Menghitung Modulo Invers (Extended Euclidean Algorithm)
function modInverse(e, phi) {
  let m0 = phi, //m0 = 3120
    t,
    q;
  let x0 = 0,
    x1 = 1;
  if (phi === 1) return 0;
  while (e > 1) {
    q = Math.floor(e / phi); // q = floor(65537 / 3120) = 21
    t = phi;
    phi = e % phi; // 65537 mod 3120 = 17
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
  const n = p * q; // 61 * 53 = 3233
  const phi = (p - 1) * (q - 1); // 60 * 52 = 3120
  const e = 65537; // Eksponen umum yang sering digunakan

  // Pastikan e relatif prima dengan phi
  if (gcd(e, phi) !== 1) {
    throw new Error("e and phi are not coprime");
  }

  const d = modInverse(e, phi); 
  // d = mod (65537, 3120)
  // 65537 = 21 x 3120 + 17
  // 3120 = 183 x 17 + 9
  // 17 = 1 x 9 + 8
  // 9 = 1 x 8 + 1
  // 8 = 8 x 1 + 0

  return {
    publicKey: { e, n },// (65537, 3233)
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
      return BigInt(m) ** BigInt(e) % BigInt(n); // m^e % n   => m adalah nilai ASCII 
      // contoh enkripsi 08
      // 0 = 48
      // 8 = 56
      // pada angka 0  => 48^65537 mod 3233 = 624
      // pada angka 8  => 56^65537 mod 3233 = 1794
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

//daftar nilai ascii
//'0' → 48
// '1' → 49
// '2' → 50
// '3' → 51
// '4' → 52
// '5' → 53
// '6' → 54
// '7' → 55
// '8' → 56
// '9' → 57
// huruf kapital
// 'A' → 65
// 'B' → 66
// 'C' → 67
// 'D' → 68
// 'E' → 69
// 'F' → 70
// 'G' → 71
// 'H' → 72
// 'I' → 73
// 'J' → 74
// 'K' → 75
// 'L' → 76
// 'M' → 77
// 'N' → 78
// 'O' → 79
// 'P' → 80
// 'Q' → 81
// 'R' → 82
// 'S' → 83
// 'T' → 84
// 'U' → 85
// 'V' → 86
// 'W' → 87
// 'X' → 88
// 'Y' → 89
// 'Z' → 90
//huruf kecil 
// 'a' → 97
// 'b' → 98
// 'c' → 99
// 'd' → 100
// 'e' → 101
// 'f' → 102
// 'g' → 103
// 'h' → 104
// 'i' → 105
// 'j' → 106
// 'k' → 107
// 'l' → 108
// 'm' → 109
// 'n' → 110
// 'o' → 111
// 'p' → 112
// 'q' → 113
// 'r' → 114
// 's' → 115
// 't' → 116
// 'u' → 117
// 'v' → 118
// 'w' → 119
// 'x' → 120
// 'y' → 121
// 'z' → 122

// cara menghitung manual kalkulator 53^65537 mod 3233= 1802
// 65537 dalam bentuk biner: 65537=10000000000000001
// Base: 53
// Exponent: 65537
// Modulus: 3233

// 53^65537 mod 3233

// Binary Exponent: 10000000000000001

// Step-by-Step Calculation:
// 1. Base = 53, Exponent bit = 1
//    res = (res * base) mod 3233 = (1 * 53) mod 3233 = 53
//    base = (base * base) mod 3233 = (53 * 53) mod 3233 = 2809

// 2. Base = 2809, Exponent bit = 0
//    res remains 53
//    base = (2809 * 2809) mod 3233 = 2934

// 3. Base = 2934, Exponent bit = 0
//    res remains 53
//    base = (2934 * 2934) mod 3233 = 1040

// 4. Base = 1040, Exponent bit = 0
//    res remains 53
//    base = (1040 * 1040) mod 3233 = 1912

// 5. Base = 1912, Exponent bit = 0
//    res remains 53
//    base = (1912 * 1912) mod 3233 = 2026

// 6. Base = 2026, Exponent bit = 0
//    res remains 53
//    base = (2026 * 2026) mod 3233 = 3063

// 7. Base = 3063, Exponent bit = 0
//    res remains 53
//    base = (3063 * 3063) mod 3233 = 3036

// 8. Base = 3036, Exponent bit = 0
//    res remains 53
//    base = (3036 * 3036) mod 3233 = 13

// 9. Base = 13, Exponent bit = 0
//    res remains 53
//    base = (13 * 13) mod 3233 = 169

// 10. Base = 169, Exponent bit = 0
//     res remains 53
//     base = (169 * 169) mod 3233 = 2697

// 11. Base = 2697, Exponent bit = 0
//     res remains 53
//     base = (2697 * 2697) mod 3233 = 2792

// 12. Base = 2792, Exponent bit = 0
//     res remains 53
//     base = (2792 * 2792) mod 3233 = 304

// 13. Base = 304, Exponent bit = 0
//     res remains 53
//     base = (304 * 304) mod 3233 = 2225

// 14. Base = 2225, Exponent bit = 0
//     res remains 53
//     base = (2225 * 2225) mod 3233 = 1425

// 15. Base = 1425, Exponent bit = 0
//     res remains 53
//     base = (1425 * 1425) mod 3233 = 301

// 16. Base = 301, Exponent bit = 0
//     res remains 53
//     base = (301 * 301) mod 3233 = 77

// 17. Base = 77, Exponent bit = 1
//     res = (res * base) mod 3233 = (53 * 77) mod 3233 = 4081 mod 3233 = 1802  

