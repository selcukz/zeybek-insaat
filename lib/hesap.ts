/**
 * Liva Acıbadem A Blok 8 no'lu daire — ödeme takibi.
 *
 * YENİ ÖDEME EKLEMEK: aşağıdaki `odemeler` dizisine bir satır ekleyin.
 * Panodaki bütün sayılar, plan durumları ve grafik buradan hesaplanır.
 *
 * TEK İSTİSNA: ödeme "pesinat" türündeyse `sozlesme.pesinat` da aynı
 * toplama çekilmelidir. Taksit sayısı ve son vade sabit kaldığı için
 * plan bu sayıdan yürür; güncellenmezse kümülatif eğri bedeli aşar.
 *
 * TAKSİT ÖDEMESİ: `taksit` alanına kapattığı taksitin sırası yazılır.
 * O ay için ne ödendiyse taksit o tutarla kapanır (eksik ya da fazla);
 * kalan borç açık taksitlere eşit bölünür.
 */

export const sozlesme = {
  proje: "Liva Acıbadem",
  adaParsel: "13 ada 79 parsel",
  blok: "A Blok",
  daire: "8",
  hakSahibi: "Aslı Ece Zeybek",

  toplamBedel: 14_000_000,
  /** Peşinat olarak ödenen toplam. Yeni peşinat havalesinde güncellenir. */
  pesinat: 3_500_000,
  taksitSayisi: 18,

  /**
   * 18 aylık süre ilk peşinat ödemesiyle başlar. Taksit vadeleri ise
   * ayın SON günüdür (30/31; şubatlarda 28/29).
   */
  baslangic: "2026-08-18",
} as const;

export type OdemeTuru = "pesinat" | "taksit";

type OdemeOrtak = {
  /** ISO tarih — dekonttaki işlem tarihi. */
  tarih: string;
  tutar: number;
  alici: string;
  banka: string;
  /** Dekonttaki mesaj referansının son hanesi. Tam numara paylaşılmaz. */
  referans: string;
  /** EFT masrafı — bedele mahsup edilmez. */
  masraf?: number;
};

export type Odeme = OdemeOrtak &
  (
    | { tur: "pesinat" }
    | {
        tur: "taksit";
        /** Kapattığı taksitin sırası (1 = Eylül 2026). */
        taksit: number;
      }
  );

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
  {
    tarih: "2026-09-02",
    tutar: 500_000,
    alici: "Zeybek İnşaat",
    banka: "Vakıfbank",
    referans: "…26011863",
    masraf: 209.39,
    tur: "pesinat",
  },
  {
    // Yapı Kredi bilgi dekontunda komisyon ve vergi "-" görünüyor;
    // masraf kaydedilmedi. Banka ayrıca kestiyse buraya eklenmeli.
    tarih: "2026-09-03",
    tutar: 500_000,
    alici: "Zeybek İnşaat",
    banka: "Vakıfbank",
    referans: "…72397715",
    tur: "pesinat",
  },
  {
    tarih: "2026-10-02",
    tutar: 415_000,
    alici: "Yusuf Zeybek",
    banka: "Akbank",
    referans: "…26012898",
    masraf: 209.38,
    tur: "taksit",
    taksit: 1,
  },
  {
    // FAST; dekontta valör 05.10.2026. Referans FAST sorgu numarasıdır.
    tarih: "2026-10-03",
    tutar: 165_000,
    alici: "Yusuf Zeybek",
    banka: "Akbank",
    referans: "…74333303",
    masraf: 16.75,
    tur: "taksit",
    taksit: 1,
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

const SAYI_ADI = [
  "", "tek", "iki", "üç", "dört", "beş",
  "altı", "yedi", "sekiz", "dokuz", "on",
];

/** Küçük sayıları yazıyla verir; sözlükte yoksa rakama düşer. */
export const sayiAdi = (n: number) => SAYI_ADI[n] ?? String(n);

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

export type TaksitDurumu = "odendi" | "gecikti" | "bekliyor";

export type Taksit = {
  sira: number;
  /** Ayın ilk günü, ISO. */
  ay: string;
  ayKisa: string;
  ayUzun: string;
  /** Vade — ayın son günü. */
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

  const pesinatOdemeleri = odemeler.filter((o) => o.tur === "pesinat");
  const pesinatOdenen = pesinatOdemeleri.reduce((t, o) => t + o.tutar, 0);

  // Peşinatı kapatan son havale — ISO tarihler sözlüksel olarak da sıralanır.
  const pesinatSonOdeme = pesinatOdemeleri.reduce<Odeme | undefined>(
    (son, o) => (!son || o.tarih > son.tarih ? o : son),
    undefined,
  );
  const taksitOdenen = odemeler
    .filter((o) => o.tur === "taksit")
    .reduce((t, o) => t + o.tutar, 0);

  const toplamOdenen = pesinatOdenen + taksitOdenen;
  const kalanBorc = Math.max(0, sozlesme.toplamBedel - toplamOdenen);

  /**
   * Taksit planı. `sozlesme.pesinat` her yeni peşinat havalesiyle
   * güncellenir (bkz. dosya başındaki not); plan toplamı bedelden
   * peşinat düşülerek bulunur.
   */
  const planToplami = sozlesme.toplamBedel - sozlesme.pesinat;
  const yuzde = (toplamOdenen / sozlesme.toplamBedel) * 100;

  const masrafToplami = odemeler.reduce((t, o) => t + (o.masraf ?? 0), 0);

  /**
   * Bir aya ödeme girildiyse o taksit ödenen tutarla kapanır — tutar
   * eşit taksitten az ya da fazla olabilir. Kalan borç açık taksitlere
   * kuruşa yuvarlanarak eşit bölünür; son açık taksit kuruş farkını alır.
   */
  const kapanan = new Map<number, number>();
  for (const o of odemeler) {
    if (o.tur === "taksit") {
      kapanan.set(o.taksit, (kapanan.get(o.taksit) ?? 0) + o.tutar);
    }
  }
  const kapananToplam = [...kapanan.values()].reduce((t, v) => t + v, 0);
  const acikSayisi = sozlesme.taksitSayisi - kapanan.size;
  const kalanPlan = planToplami - kapananToplam;
  const kurus = (n: number) => Math.round(n * 100) / 100;
  const aylikTaksit = acikSayisi > 0 ? kurus(kalanPlan / acikSayisi) : 0;
  const sonAcik = Math.max(
    0,
    ...Array.from({ length: sozlesme.taksitSayisi }, (_, k) => k + 1).filter(
      (i) => !kapanan.has(i),
    ),
  );

  // Taksitler başlangıcı takip eden ay başlar.
  const taksitler: Taksit[] = [];
  for (let i = 1; i <= sozlesme.taksitSayisi; i++) {
    const d = new Date(bas.getFullYear(), bas.getMonth() + i, 1);
    const yil = d.getFullYear();
    const ayIndex = d.getMonth();

    const odenen = kapanan.get(i) ?? 0;
    const beklenen = kapanan.has(i)
      ? odenen
      : i === sonAcik
        ? kurus(kalanPlan - aylikTaksit * (acikSayisi - 1))
        : aylikTaksit;

    // Vade ayın son günü
    const ayinSonu = new Date(yil, ayIndex + 1, 0).getDate();
    const vadeTarihi = new Date(yil, ayIndex, ayinSonu);

    let durum: TaksitDurumu;
    if (kapanan.has(i)) durum = "odendi";
    else if (vadeTarihi < bugun) durum = "gecikti";
    else durum = "bekliyor";

    taksitler.push({
      sira: i,
      ay: `${yil}-${String(ayIndex + 1).padStart(2, "0")}-01`,
      ayKisa: `${AY_KISA[ayIndex]} ${String(yil).slice(2)}`,
      ayUzun: `${AYLAR[ayIndex]} ${yil}`,
      vade: `${String(ayinSonu).padStart(2, "0")}.${String(
        ayIndex + 1,
      ).padStart(2, "0")}.${yil}`,
      beklenen,
      odenen,
      durum,
      yuzde: kapanan.has(i) ? 100 : 0,
    });
  }

  const sonTaksit = taksitler[taksitler.length - 1];
  const bitis = new Date(
    bas.getFullYear(),
    bas.getMonth() + sozlesme.taksitSayisi + 1,
    0,
  );
  const kalanGun = Math.max(
    0,
    Math.ceil((bitis.getTime() - bugun.getTime()) / 86_400_000),
  );

  const odenenTaksitSayisi = taksitler.filter((t) => t.durum === "odendi").length;
  const geciken = taksitler.filter((t) => t.durum === "gecikti");
  const siradaki = taksitler.find((t) => t.durum !== "odendi");

  return {
    /** Hesabın yapıldığı gün, ISO — grafikteki "bugün" işareti için. */
    bugun: `${bugun.getFullYear()}-${String(bugun.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(bugun.getDate()).padStart(2, "0")}`,
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
    /** Peşinatı oluşturan havale adedi. */
    pesinatAdedi: pesinatOdemeleri.length,
    /** Peşinattaki son havalenin tarihi — uzun biçim. */
    pesinatSonTarih: pesinatSonOdeme ? tarihUzun(pesinatSonOdeme.tarih) : "",
  };
}

/* ------------------------------------------------------------------ */
/*  Grafik noktaları                                                   */
/* ------------------------------------------------------------------ */

export type GrafikNoktasi = {
  /** 0 = peşinat ayı, 1…18 = taksitler. */
  i: number;
  kisa: string;
  uzun: string;
  vade: string;
  /** O ayki ödeme tutarı — plandaki değer. */
  tutar: number;
  /** Sözleşmenin o ay için öngördüğü tutar (kümelenmiş kolonun solu). */
  beklenen: number;
  /** O ay fiilen ödenen tutar (kümelenmiş kolonun sağı). */
  odenen: number;
  /** Ay sonundaki kalan bakiye. */
  bakiye: number;
  /** Ay sonuna kadarki kümülatif ödeme. */
  kumulatif: number;
  /** Gerçekleşti mi — plan eğrisi son gerçekleşen noktadan sonra başlar. */
  gecmis: boolean;
  tur: string;
  durum: string;
};

const DURUM_ADI: Record<TaksitDurumu, string> = {
  odendi: "Ödendi",
  gecikti: "Gecikti",
  bekliyor: "Bekliyor",
};

/**
 * Zaman grafiğinin ve taksit tablosunun ortak veri kaynağı.
 *
 * Kümülatif eğri peşinatın üzerine taksitleri sırayla ekler (kapanan
 * taksit ödenen tutarıyla, açık taksit eşit payıyla). Yürüyüş
 * `toplamOdenen`den değil `pesinatOdenen`den başlar: ödenen taksitler
 * `toplamOdenen` içinde zaten sayılıdır, oradan yürünürse iki kez sayılır.
 */
export function grafikNoktalari(
  hesap: Hesap,
  toplamBedel: number,
): GrafikNoktasi[] {
  const bas = new Date(sozlesme.baslangic + "T00:00:00");
  // Peşinat noktasının tarihi peşinattaki son havaledir; taksit
  // havaleleri eklendikçe dizinin sonu artık peşinat değildir.
  const sonPesinat = odemeler
    .filter((o) => o.tur === "pesinat")
    .reduce((son, o) => (o.tarih > son.tarih ? o : son));

  let kum = hesap.pesinatOdenen;

  return [
    {
      i: 0,
      kisa: `${AY_KISA[bas.getMonth()]} ${String(bas.getFullYear()).slice(2)}`,
      uzun: `${AYLAR[bas.getMonth()]} ${bas.getFullYear()}`,
      vade: tarihKisa(sonPesinat.tarih),
      tutar: hesap.pesinatOdenen,
      beklenen: sozlesme.pesinat,
      odenen: hesap.pesinatOdenen,
      bakiye: toplamBedel - hesap.pesinatOdenen,
      kumulatif: hesap.pesinatOdenen,
      gecmis: true,
      tur: "Peşinat",
      durum: hesap.pesinatTamam ? "Ödendi" : "Kısmi",
    },
    ...hesap.taksitler.map((t) => {
      kum += t.beklenen;
      return {
        i: t.sira,
        kisa: t.ayKisa,
        uzun: t.ayUzun,
        vade: t.vade,
        tutar: t.beklenen,
        beklenen: t.beklenen,
        odenen: t.odenen,
        // Kuruşa yuvarlanır; kayan nokta artığı son ayda "−0" yazdırmasın.
        bakiye: Math.round((toplamBedel - kum) * 100) / 100 + 0,
        kumulatif: kum,
        gecmis: t.durum === "odendi",
        tur: `Taksit ${t.sira}`,
        durum: DURUM_ADI[t.durum],
      };
    }),
  ];
}

/** Plan eğrisinin başladığı nokta — son gerçekleşen ödemenin indeksi. */
export function sonGercekIndex(noktalar: GrafikNoktasi[]) {
  let son = 0;
  for (const p of noktalar) if (p.gecmis) son = p.i;
  return son;
}
