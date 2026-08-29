/**
 * Liva Acıbadem A Blok 8 no'lu daire — ödeme takibi.
 *
 * YENİ ÖDEME EKLEMEK: aşağıdaki `odemeler` dizisine bir satır ekleyin.
 * Panodaki bütün sayılar, plan durumları ve grafik buradan hesaplanır;
 * başka hiçbir yeri değiştirmeye gerek yoktur.
 */

export const sozlesme = {
  proje: "Liva Acıbadem",
  adaParsel: "13 ada 79 parsel",
  blok: "A Blok",
  daire: "8",
  hakSahibi: "Aslı Ece Zeybek",

  toplamBedel: 14_000_000,
  pesinat: 2_500_000,
  taksitSayisi: 18,

  /** 18 aylık süre ilk peşinat ödemesiyle başlar. */
  baslangic: "2026-08-18",
} as const;

export type OdemeTuru = "pesinat" | "taksit";

export type Odeme = {
  /** ISO tarih — dekonttaki işlem tarihi. */
  tarih: string;
  tutar: number;
  alici: string;
  banka: string;
  /** Dekonttaki mesaj referansının son hanesi. Tam numara paylaşılmaz. */
  referans: string;
  /** EFT masrafı — bedele mahsup edilmez. */
  masraf?: number;
  tur: OdemeTuru;
};

export const odemeler: Odeme[] = [
  {
    tarih: "2026-08-18",
    tutar: 1_000_000,
    alici: "Zeybek İnşaat",
    banka: "Vakıfbank",
    referans: "…26011146",
    masraf: 209.38,
    tur: "pesinat",
  },
  {
    tarih: "2026-08-19",
    tutar: 1_000_000,
    alici: "Zeybek İnşaat",
    banka: "Vakıfbank",
    referans: "…26011168",
    masraf: 209.38,
    tur: "pesinat",
  },
  {
    tarih: "2026-08-27",
    tutar: 500_000,
    alici: "Yusuf Zeybek",
    banka: "Akbank",
    referans: "…26011627",
    masraf: 209.39,
    tur: "pesinat",
  },
];

/* ------------------------------------------------------------------ */
/*  Biçimlendirme                                                      */
/* ------------------------------------------------------------------ */

const tamSayi = new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 });
const kurusla = new Intl.NumberFormat("tr-TR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const lira = (n: number) => tamSayi.format(Math.round(n));
export const liraKurus = (n: number) => kurusla.format(n);

const AYLAR = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const AY_KISA = [
  "Oca", "Şub", "Mar", "Nis", "May", "Haz",
  "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara",
];

export function tarihUzun(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return `${d.getDate()} ${AYLAR[d.getMonth()]} ${d.getFullYear()}`;
}

export function tarihKisa(iso: string) {
  const d = new Date(iso + "T00:00:00");
  const gg = String(d.getDate()).padStart(2, "0");
  const aa = String(d.getMonth() + 1).padStart(2, "0");
  return `${gg}.${aa}.${d.getFullYear()}`;
}

/* ------------------------------------------------------------------ */
/*  Hesap                                                              */
/* ------------------------------------------------------------------ */

export type TaksitDurumu = "odendi" | "kismi" | "gecikti" | "bekliyor";

export type Taksit = {
  sira: number;
  /** Ayın ilk günü, ISO. */
  ay: string;
  ayKisa: string;
  ayUzun: string;
  /** Vade — sözleşme başlangıcının gün numarası. */
  vade: string;
  beklenen: number;
  odenen: number;
  durum: TaksitDurumu;
  /** Ödenen kısmın oranı, 0–100. */
  yuzde: number;
};

export type Hesap = ReturnType<typeof hesapla>;

/**
 * Bütün türetilmiş sayılar. `bugun` dışarıdan verilir ki sunucu ve
 * istemci aynı sonucu üretsin.
 */
export function hesapla(bugun: Date) {
  const bas = new Date(sozlesme.baslangic + "T00:00:00");
  const vadeGunu = bas.getDate();

  const pesinatOdenen = odemeler
    .filter((o) => o.tur === "pesinat")
    .reduce((t, o) => t + o.tutar, 0);
  const taksitOdenen = odemeler
    .filter((o) => o.tur === "taksit")
    .reduce((t, o) => t + o.tutar, 0);

  const toplamOdenen = pesinatOdenen + taksitOdenen;
  const kalanBorc = Math.max(0, sozlesme.toplamBedel - toplamOdenen);
  const planToplami = sozlesme.toplamBedel - sozlesme.pesinat;
  const aylikTaksit = planToplami / sozlesme.taksitSayisi;
  const yuzde = (toplamOdenen / sozlesme.toplamBedel) * 100;

  const masrafToplami = odemeler.reduce((t, o) => t + (o.masraf ?? 0), 0);

  // Taksitler başlangıcı takip eden ay başlar.
  const taksitler: Taksit[] = [];
  for (let i = 1; i <= sozlesme.taksitSayisi; i++) {
    const d = new Date(bas.getFullYear(), bas.getMonth() + i, 1);
    const yil = d.getFullYear();
    const ayIndex = d.getMonth();

    // O ay içinde yapılan taksit ödemeleri
    const odenen = odemeler
      .filter((o) => o.tur === "taksit")
      .filter((o) => {
        const od = new Date(o.tarih + "T00:00:00");
        return od.getFullYear() === yil && od.getMonth() === ayIndex;
      })
      .reduce((t, o) => t + o.tutar, 0);

    // Ayın son gününü aşmayan vade
    const ayinSonu = new Date(yil, ayIndex + 1, 0).getDate();
    const vadeTarihi = new Date(yil, ayIndex, Math.min(vadeGunu, ayinSonu));

    let durum: TaksitDurumu;
    if (odenen >= aylikTaksit - 0.5) durum = "odendi";
    else if (vadeTarihi < bugun) durum = odenen > 0 ? "kismi" : "gecikti";
    else durum = odenen > 0 ? "kismi" : "bekliyor";

    taksitler.push({
      sira: i,
      ay: `${yil}-${String(ayIndex + 1).padStart(2, "0")}-01`,
      ayKisa: `${AY_KISA[ayIndex]} ${String(yil).slice(2)}`,
      ayUzun: `${AYLAR[ayIndex]} ${yil}`,
      vade: `${String(Math.min(vadeGunu, ayinSonu)).padStart(2, "0")}.${String(
        ayIndex + 1,
      ).padStart(2, "0")}.${yil}`,
      beklenen: aylikTaksit,
      odenen,
      durum,
      yuzde: Math.min(100, (odenen / aylikTaksit) * 100),
    });
  }

  const sonTaksit = taksitler[taksitler.length - 1];
  const bitis = new Date(bas.getFullYear(), bas.getMonth() + sozlesme.taksitSayisi, vadeGunu);
  const kalanGun = Math.max(
    0,
    Math.ceil((bitis.getTime() - bugun.getTime()) / 86_400_000),
  );

  const odenenTaksitSayisi = taksitler.filter((t) => t.durum === "odendi").length;
  const geciken = taksitler.filter((t) => t.durum === "gecikti" || t.durum === "kismi");
  const siradaki = taksitler.find((t) => t.durum !== "odendi");

  return {
    pesinatOdenen,
    taksitOdenen,
    toplamOdenen,
    kalanBorc,
    planToplami,
    aylikTaksit,
    yuzde,
    masrafToplami,
    taksitler,
    odenenTaksitSayisi,
    kalanTaksitSayisi: sozlesme.taksitSayisi - odenenTaksitSayisi,
    geciken,
    siradaki,
    bitisTarihi: `${String(bitis.getDate()).padStart(2, "0")}.${String(
      bitis.getMonth() + 1,
    ).padStart(2, "0")}.${bitis.getFullYear()}`,
    sonAy: sonTaksit.ayUzun,
    kalanGun,
    /** Peşinat tamamlandı mı? */
    pesinatTamam: pesinatOdenen >= sozlesme.pesinat - 0.5,
  };
}
