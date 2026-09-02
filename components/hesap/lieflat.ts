/**
 * Lieflat Charts — "porcelain" (青瓷蓝) rol tablosu.
 *
 * Kaynak: github.com/larashero3-dotcom/lieflat-charts
 *   · color-presets.js → PORCELAIN
 *   · mono-tokens.js   → rnd / pol geometri yardımcıları
 *
 * Skill'in seçim kuralı: sıralı veri (ilerleme / zaman serisi / tek
 * gösterge / sıralama) → porcelain veya wire. Ödeme planı sıralı bir
 * zaman serisi olduğu için porcelain alındı; tek renk tonunda açıklık
 * farkıyla kodlanır, yani "açıklık = veri" sözleşmesi korunur.
 *
 * Renkler role göre alınır, hex doğrudan bileşenlere serpilmez —
 * skill'in custom/preset kuralı bunu şart koşuyor.
 *
 * Sapma (bilinçli): skill Inter dayatıyor; bu sayfa baştan sona
 * Consolas rakamlarıyla kurulu ve grafik, üstündeki ölçü şeridiyle
 * altındaki taksit tablosunun arasında duruyor. Yazı tipi sayfadan
 * alındı; renk, biçim, birim ve yerleşim kuralları skill'den.
 */

/** Porcelain rol tablosu — color-presets.js'teki değerlerin birebiri. */
export const P = {
  /** Ana metin, en koyu uç. */
  TXT: "#081F5C",
  /** İkincil metin. */
  MUT: "rgba(8,31,92,.60)",
  /** Küçük etiket — beyaz üstünde 4.5:1'i geçsin diye MUT yerine bu. */
  LAB: "rgba(8,31,92,.72)",
  /** Kaynak satırı, her onuncu işareti. */
  FAINT: "rgba(8,31,92,.32)",
  /** Taban çizgisi. */
  FLOOR: "rgba(8,31,92,.24)",
  /** Takvim tabanı tırnakları. */
  QUIET: "rgba(8,31,92,.15)",
  /** Izgara. */
  GRID: "rgba(8,31,92,.16)",
  /** Gerçekleşen veri. */
  DATA: "#334EAC",
  /** Planlanan veri — aynı renk tonu, daha açık. */
  DATA2: "#7096D1",
  /** Tek başrol: kalan bakiye konturu / peşinat dilimi. */
  HERO: "#081F5C",
  /** En açık veri tonu. */
  FAINTDATA: "#BAD6EB",
  /** Etiket arkası kontur — sayfa zemini beyaz olduğu için beyaz. */
  HALO: "#ffffff",
} as const;

/**
 * Renkli sürümün iki mürekkep kuralı (color-presets.js · INK_BOOST):
 * gri tonda görünen 0,5 px tüy çizgi, açık maviye dönünce kayboluyor.
 */
export const CIZGI_OLCEK = 1.8;
export const OPAKLIK_TABAN = 0.85;

/**
 * Belirlenimci sözde-rastgele (mono-tokens.js · rnd).
 * Math.random() yasak: her render aynı görünmeli, yoksa ekran
 * görüntüsü ve regresyon karşılaştırması anlamını yitirir.
 */
export const rnd = (i: number, k: number) =>
  Math.abs(((i * 73856093) ^ (k * 19349663)) % 1000) / 1000;

const D2R = Math.PI / 180;

/** Kutupsal → kartezyen (mono-tokens.js · pol). */
export const pol = (
  cx: number,
  cy: number,
  r: number,
  deg: number,
): [number, number] => [
  cx + r * Math.cos(deg * D2R),
  cy + r * Math.sin(deg * D2R),
];

export { D2R };

/**
 * Yüzdeleri toplamı tam 100 olacak şekilde tam sayıya indirger
 * (en büyük kalan yöntemi). Tick donut'ta 1 çentik = %1 sözleşmesi
 * ancak çentikler tam 100 tanaysa doğru olur.
 */
export function yuzYuzde(paylar: number[], toplam: number): number[] {
  if (toplam <= 0) return paylar.map(() => 0);
  const ham = paylar.map((p) => (p / toplam) * 100);
  const taban = ham.map(Math.floor);
  let kalan = 100 - taban.reduce((t, v) => t + v, 0);

  // Kalanı, ondalık artığı en büyük olanlardan başlayarak dağıt.
  const sira = ham
    .map((v, i) => ({ i, artik: v - Math.floor(v) }))
    .sort((a, b) => b.artik - a.artik);

  for (const { i } of sira) {
    if (kalan <= 0) break;
    taban[i] += 1;
    kalan -= 1;
  }
  return taban;
}
