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
 * kalan borç açık taksitlere eşit bölünür. Tek havale birden fazla
 * taksit kapatıyorsa `taksit` yerine `taksitler: [{ sira, tutar }]`
 * yazılır; payların toplamı havale tutarına eşit olmalıdır.
 *
 * DEKONT GELMEDİYSE: `dekontBekleniyor: true` konur, alıcı/banka/
 * referans boş bırakılır — uydurulmaz. Tutar ve kur bilindiği için
 * pano doğru hesaplar, tabloda satır "dekont bekleniyor" görünür.
 * Dekont gelince alanlar doldurulur, tarih dekonttakiyle değiştirilir
 * ve bu işaret kaldırılır.
 *
 * DOLAR KARŞILIĞI: her yeni ödemenin günündeki TCMB USD döviz alış
 * kuru `usdKurlari`na eklenir; eksikse dolar grafiği notta uyarır.
 * Ödenmemiş taksitlerin kuru `kurTahmini`nden gelir; TCMB her ay yeni
 * Piyasa Katılımcıları Anketi yayımladığında o da güncellenir.
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
  /** EFT masrafı — bedele mahsup edilmez. */
  masraf?: number;
} & (OdemeBelgeli | OdemeBekleyen);

/** Dekontu elde olan havale — normal hâl. */
type OdemeBelgeli = {
  dekontBekleniyor?: false;
  alici: string;
  banka: string;
  /** Dekonttaki mesaj referansının son hanesi. Tam numara paylaşılmaz. */
  referans: string;
};

/**
 * Para gönderildi ama dekont henüz elde değil.
 *
 * Tutar, tarih ve kur biliniyorsa pano doğru hesaplasın diye kayıt
 * şimdi girilir; alıcı, banka ve referans uydurulmaz, boş bırakılır ve
 * tabloda "dekont bekleniyor" olarak görünür. Dekont gelince alanlar
 * doldurulup bu işaret kaldırılır.
 */
type OdemeBekleyen = {
  dekontBekleniyor: true;
  alici?: string;
  banka?: string;
  referans?: string;
};

export type Odeme = OdemeOrtak &
  (
    | { tur: "pesinat" }
    | {
        tur: "taksit";
        /** Kapattığı taksitin sırası (1 = Eylül 2026). */
        taksit: number;
      }
    | {
        tur: "taksit";
        /**
         * Tek havale birden fazla taksit kapatıyorsa, her taksit ve ona
         * düşen tutar. Payların toplamı `tutar`a eşit olmalıdır.
         *
         * Bir havale iki satıra bölünmez: tablodaki dekont sayısı ve
         * masraf, fiilen yapılan havale sayısını göstermelidir.
         */
        taksitler: { sira: number; tutar: number }[];
      }
  );

/**
 * Bir havalenin kapattığı taksitler, (sıra, tutar) çiftleri olarak.
 * Tek taksitli havale de aynı biçime indirgenir; çağıran taraf iki
 * gösterimi ayırt etmek zorunda kalmaz.
 */
export function taksitPaylari(o: Odeme): { sira: number; tutar: number }[] {
  if (o.tur !== "taksit") return [];
  if (!("taksitler" in o)) return [{ sira: o.taksit, tutar: o.tutar }];

  // Paylar havale tutarını tüketmezse pano parayı yanlış gösterir;
  // sessizce yuvarlamak yerine girişin düzeltilmesi gerekir.
  const toplam = o.taksitler.reduce((t, p) => t + p.tutar, 0);
  if (Math.round((toplam - o.tutar) * 100) !== 0) {
    throw new Error(
      `${o.tarih} havalesinde taksit payları ${toplam} ≠ havale tutarı ${o.tutar}`,
    );
  }
  return o.taksitler;
}

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
  {
    // Ziraat'ten gönderildi. Ekim taksitine (vade 31.10) sayılır.
    tarih: "2026-11-06",
    tutar: 586_000,
    alici: "Zeybek İnşaat",
    banka: "Vakıfbank",
    referans: "…26013958",
    masraf: 209.38,
    tur: "taksit",
    taksit: 2,
  },
  {
    // Müteahhidin nakit ihtiyacı üzerine erken ödenen 1.000.000 ₺;
    // 3. (Kasım) ve 4. (Aralık) taksitleri kapatır, sonraki ödeme
    // 31.01.2027 vadeli 5. taksit.
    //
    // DEKONT HENÜZ ELDE DEĞİL. Tarih geçicidir: kaydın girildiği gün
    // alınmıştır, dekonttaki işlem tarihiyle değiştirilecek. Alıcı,
    // banka ve referans dekont gelince doldurulup `dekontBekleniyor`
    // kaldırılacak; masraf varsa o zaman eklenecek.
    tarih: "2026-11-11",
    tutar: 1_000_000,
    dekontBekleniyor: true,
    tur: "taksit",
    taksitler: [
      { sira: 3, tutar: 500_000 },
      { sira: 4, tutar: 500_000 },
    ],
  },
];

/**
 * TCMB gösterge niteliğindeki USD döviz alış kuru (tcmb.gov.tr/kurlar).
 *
 * YENİ ÖDEME EKLENİRKEN o günün kuru da buraya eklenir. TCMB hafta
 * sonu ve tatilde kur yayımlamaz; o günler son iş gününün kurunu alır
 * (03.10.2026 cumartesi → 02.10.2026).
 */
export const usdKurlari: Record<string, number> = {
  "2026-08-18": 47.8293,
  "2026-08-19": 47.8467,
  "2026-08-27": 48.0466,
  "2026-09-02": 48.2075,
  "2026-09-03": 48.2238,
  "2026-10-02": 48.9699,
  // TCMB değil: o gün fiilen dolar bozdurulan kur (bu seferlik).
  "2026-11-06": 50.058,
  // Kullanıcıdan alındı. TCMB alış mı, fiilen bozdurulan kur mu
  // teyit edilmedi; dekont gelince hangisi olduğu netleşecek.
  "2026-11-11": 50.45,
};

/** Dolar grafiğinde planın ve sabit kurlu çizginin kuru — ilk peşinat günü. */
export const sabitKurTarihi = sozlesme.baslangic;

/**
 * Gelecek USD/TRY kuru — TCMB Piyasa Katılımcıları Anketi (Kasım 2026)
 * medyan beklentileri. Ödenmemiş taksitler vade günündeki tahmini kurla
 * dolara çevrilir.
 *
 * Eğri `usdKurlari`ndaki son gerçek kurdan başlar ve noktalar arasında
 * sabit aylık yüzdeyle yürür. Son noktadan sonra (Şubat 2028'e dek) son
 * aralığın hızıyla sürer. Anket ayın ortasında toplandığından "12 ay
 * sonrası" Kasım 2027 ortasına konur.
 *
 * YENİ ANKET YAYIMLANINCA (her ay, tcmb.gov.tr) `kaynak` ve `noktalar`
 * güncellenir: cari yıl sonu ve 12 ay sonrası USD/TRY beklentisi.
 */
export const kurTahmini = {
  kaynak: "TCMB Piyasa Katılımcıları Anketi · Kasım 2026",
  noktalar: [
    { tarih: "2026-12-31", kur: 53.2, ad: "2026 sonu" },
    { tarih: "2027-11-15", kur: 62.8, ad: "Kasım 2027" },
  ],
} as const;

const gunSayisi = (iso: string) =>
  new Date(iso + "T00:00:00Z").getTime() / 86_400_000;

/** Tarihteki tahmini kur — `kurTahmini` notuna bakın. */
export function tahminKuru(iso: string) {
  const sonGercek = Object.keys(usdKurlari).sort().pop()!;
  const noktalar = [
    { tarih: sonGercek, kur: usdKurlari[sonGercek] },
    ...kurTahmini.noktalar.filter((n) => n.tarih > sonGercek),
  ];
  if (noktalar.length < 2 || iso <= sonGercek) return noktalar[0].kur;

  // `iso`yu içine alan aralık; son noktayı aşarsa son aralık uzatılır.
  const k = noktalar.findIndex((n) => n.tarih >= iso);
  const b = k === -1 ? noktalar.length - 1 : k;
  const a = noktalar[b - 1];
  const hiz =
    Math.log(noktalar[b].kur / a.kur) /
    (gunSayisi(noktalar[b].tarih) - gunSayisi(a.tarih));
  return a.kur * Math.exp(hiz * (gunSayisi(iso) - gunSayisi(a.tarih)));
}

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
 * Panonun "bugün"ü — takvim günü değil, ödemelerin ulaştığı gün.
 *
 * Taksitler peşin kapatıldığında (örn. tek havale Kasım ve Aralık'ı
 * birden kapatıyor) gerçekleşen eğri takvim gününün ilerisine geçer ve
 * grafik kendi içinde tutarsız görünür: dolu çizgi "bugün" işaretini
 * aşar. Bu yüzden pano, kapanan son taksitin vadesini bugün sayar.
 *
 * Takvim o vadeyi geçtiğinde kendiliğinden gerçek güne döner; sabit
 * bir tarih gömülmediği için geciken taksit tespiti çalışmaya devam
 * eder ve ileride yeni peşin ödeme yapılırsa işaret kendiliğinden
 * yine ileri kayar.
 */
export function panoTarihi(gercekBugun: Date): Date {
  const kapali = odemeler.flatMap(taksitPaylari).map((p) => p.sira);
  if (kapali.length === 0) return gercekBugun;

  const bas = new Date(sozlesme.baslangic + "T00:00:00");
  // i. taksitin vadesi: başlangıç ayı + i, o ayın son günü.
  const vade = new Date(
    bas.getFullYear(),
    bas.getMonth() + Math.max(...kapali) + 1,
    0,
  );
  return vade > gercekBugun ? vade : gercekBugun;
}

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
    for (const { sira, tutar } of taksitPaylari(o)) {
      kapanan.set(sira, (kapanan.get(sira) ?? 0) + tutar);
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

/* ------------------------------------------------------------------ */
/*  Dolar karşılığı                                                    */
/* ------------------------------------------------------------------ */

/**
 * Tarihteki kur: o gün yoksa en yakın önceki yayın günü. Dört günden
 * eski kura düşülürse (uzun tatil dışında) kur girilmemiş demektir;
 * `eksik` işaretlenir ve grafik notunda gösterilir.
 */
export function usdKuru(iso: string) {
  const tarih = Object.keys(usdKurlari)
    .filter((t) => t <= iso)
    .sort()
    .pop();
  if (!tarih) return { kur: usdKurlari[sabitKurTarihi], tarih: sabitKurTarihi, eksik: true };
  const gun =
    (new Date(iso + "T00:00:00").getTime() -
      new Date(tarih + "T00:00:00").getTime()) /
    86_400_000;
  return { kur: usdKurlari[tarih], tarih, eksik: gun > 4 };
}

export type DolarNoktasi = {
  i: number;
  /** 18.08.2026 kuruyla kümülatif — son ödemeye dek gerçekleşen, sonra plan. */
  sabit: number;
  /** Her havale kendi günündeki kurla; ödeme yoksa null. */
  gercek: number | null;
  /**
   * Tahmin: son ödemeye dek gerçekleşen, kalan taksitler vade günündeki
   * tahmini kurla (`tahminKuru`). Son ödemeden önceki aylarda null.
   */
  tahmin: number | null;
  /** O aya sayılan havalelerin ₺ toplamı ve ödeme günü kuruyla $ karşılığı. */
  ayTl: number;
  ayUsd: number;
  /**
   * Ayın kuru: ödenen ayda havalelerin ağırlıklı kuru (₺ / $), ödenmemiş
   * ayda vade günündeki tahmini kur.
   */
  kur: number;
  kurTahmin: boolean;
};

/** "31.10.2026" → "2026-10-31" */
const isoTarih = (gunAyYil: string) => gunAyYil.split(".").reverse().join("-");

/**
 * Dolar grafiğinin noktaları. Havaleler zaman grafiğindeki gibi aylara
 * dağılır: peşinat 0. noktaya, taksit havalesi kapattığı taksite.
 * Sabit kurlu çizgi `grafikNoktalari` kümülatifinin sabit kura bölümüdür;
 * kapanan taksit ödenen tutarla durduğundan son ödemeye dek gerçekleşenle
 * aynıdır, sonrası plandır.
 */
export function dolarNoktalari(noktalar: GrafikNoktasi[]) {
  const sabitKur = usdKurlari[sabitKurTarihi];

  const ayTl = new Map<number, number>();
  const ayUsd = new Map<number, number>();
  const eksikKur: string[] = [];
  for (const o of odemeler) {
    const k = usdKuru(o.tarih);
    if (k.eksik) eksikKur.push(o.tarih);
    // Peşinat 0. noktaya; taksit havalesi kapattığı taksit(ler)e, bir
    // havale birden fazla taksit kapatıyorsa payları ayrı ayrı düşer.
    const paylar =
      o.tur === "pesinat"
        ? [{ sira: 0, tutar: o.tutar }]
        : taksitPaylari(o);
    for (const { sira, tutar } of paylar) {
      ayTl.set(sira, (ayTl.get(sira) ?? 0) + tutar);
      ayUsd.set(sira, (ayUsd.get(sira) ?? 0) + tutar / k.kur);
    }
  }
  const sonOdeme = Math.max(0, ...ayTl.keys());

  let kum = 0;
  let tahmin = 0;
  const dolar: DolarNoktasi[] = noktalar.map((p) => {
    kum += ayUsd.get(p.i) ?? 0;
    const odendi = p.i <= sonOdeme;
    // Ödenen ay ağırlıklı kuruyla; boş kalan ay (olmamalı) sabit kura düşer.
    const kur = odendi
      ? ayUsd.get(p.i)
        ? ayTl.get(p.i)! / ayUsd.get(p.i)!
        : sabitKur
      : tahminKuru(isoTarih(p.vade));
    if (p.i === sonOdeme) tahmin = kum;
    else if (!odendi) tahmin += p.beklenen / kur;
    return {
      i: p.i,
      sabit: p.kumulatif / sabitKur,
      gercek: odendi ? kum : null,
      tahmin: p.i >= sonOdeme ? tahmin : null,
      ayTl: ayTl.get(p.i) ?? 0,
      ayUsd: ayUsd.get(p.i) ?? 0,
      kur,
      kurTahmin: !odendi,
    };
  });

  const odenenUsd = dolar[sonOdeme].gercek ?? 0;
  const odenenSabit = dolar[sonOdeme].sabit;

  return {
    noktalar: dolar,
    sabitKur,
    sonOdeme,
    odenenUsd,
    odenenSabit,
    /** Ödeme günü kuru − sabit kur farkı; eksi = TL değer kaybetti. */
    kurFarki: odenenUsd - odenenSabit,
    planUsd: dolar[dolar.length - 1].sabit,
    tahminUsd: dolar[dolar.length - 1].tahmin!,
    tahminKaynak: kurTahmini.kaynak,
    /** Tahmin eğrisinin dayandığı beklentiler, ör. "2026 sonu 53,20". */
    tahminNoktalari: kurTahmini.noktalar,
    /** Son taksit vadesindeki tahmini kur ve ayı. */
    tahminSonKur: dolar[dolar.length - 1].kur,
    tahminSonAy: noktalar[noktalar.length - 1].uzun,
    eksikKur,
  };
}

/** Plan eğrisinin başladığı nokta — son gerçekleşen ödemenin indeksi. */
export function sonGercekIndex(noktalar: GrafikNoktasi[]) {
  let son = 0;
  for (const p of noktalar) if (p.gecmis) son = p.i;
  return son;
}
