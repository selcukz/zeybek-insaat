/**
 * /hesap rotasının oturum jetonu.
 *
 * Şifre asla çereze yazılmaz. Çerezde şifreyle imzalanmış sabit bir
 * HMAC durur; middleware aynı imzayı yeniden üretip karşılaştırır.
 * Şifre değişince eski çerezler kendiliğinden geçersiz olur.
 *
 * Kenar çalışma zamanında koşar — yalnızca Web Crypto ve btoa kullanır.
 */

export const HESAP_COOKIE = "zi_hesap";
const IMZA_METNI = "zeybek-hesap-v1";

function base64url(buf: ArrayBuffer) {
  const bayt = new Uint8Array(buf);
  let s = "";
  for (const b of bayt) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export async function jetonUret(sifre: string) {
  const anahtar = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(sifre),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const imza = await crypto.subtle.sign(
    "HMAC",
    anahtar,
    new TextEncoder().encode(IMZA_METNI),
  );
  return base64url(imza);
}

/** Uzunluktan sızıntı olmasın diye sabit süreli karşılaştırma. */
export function esitMi(a: string, b: string) {
  if (a.length !== b.length) return false;
  let fark = 0;
  for (let i = 0; i < a.length; i++) fark |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return fark === 0;
}
